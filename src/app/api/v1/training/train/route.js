import { prisma } from '@/lib/prisma';
import { buildStandardResponse, refreshPetStatus } from '@/lib/game-state';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { petId, statTipo } = await request.json();
    
    // 1. Sincronizar estado (EP, Hambre, etc.)
    const pet = await refreshPetStatus(petId);
    
    // 2. Determinar nivel actual del gimnasio para este stat
    const gymLevel = statTipo === 'Fuerza' ? pet.gym_fuerza_lv : 
                     statTipo === 'Agilidad' ? pet.gym_agilidad_lv : pet.gym_defensa_lv;

    // 3. Buscar configuración en la tabla (Aquí sacamos el costo_upgrade_oro)
    const config = await prisma.trainingConfig.findUnique({
      where: { stat_tipo_nivel_maquina: { stat_tipo: statTipo, nivel_maquina: gymLevel } }
    });

    if (!config) {
      return NextResponse.json({ status: "ERROR", message: "Configuración no encontrada." }, { status: 404 });
    }

    // --- EL CAMBIO CLAVE ---
    // Usamos la columna costo_upgrade_oro como el precio de CADA entrenamiento
    const costoSesionOro = config.costo_upgrade_oro; 

    // 4. Obtener el Usuario y validar cartera
    const usuario = await prisma.userGamer.findUnique({
      where: { id: pet.userId }
    });

    if (usuario.nanocredits < costoSesionOro) {
      return NextResponse.json({ 
        status: "ERROR", 
        message: `No tienes suficientes Nanocredits. Esta sesión cuesta ${costoSesionOro}.` 
      }, { status: 400 });
    }

    // 5. Validaciones de EP y Recursos Físicos
    if (pet.training_ep <= 0) {
      return NextResponse.json({ status: "ERROR", message: "Sin Puntos de Esfuerzo (EP)." }, { status: 400 });
    }

    if (pet.hambre + config.costo_hambre > 100 || pet.hp - config.costo_hp <= 0) {
      return NextResponse.json({ status: "ERROR", message: "Pet demasiado débil o hambriento." }, { status: 400 });
    }

    // 6. CÁLCULO DE RECOMPENSA (Basado en el rango de la tabla)
    const gananciaBase = Math.random() * (config.max_gain - config.min_gain) + config.min_gain;
    
    let multRendimiento = 1.0;
    if (pet.training_sessions_today >= 3 && pet.training_sessions_today < 5) multRendimiento = 0.6;
    if (pet.training_sessions_today >= 5) multRendimiento = 0.2;

    const gananciaFinal = parseFloat((gananciaBase * multRendimiento).toFixed(2));

    // 7. TRANSACCIÓN ATÓMICA
    const updatePetData = {
      training_ep: { decrement: 1 },
      training_sessions_today: { increment: 1 },
      hambre: { increment: config.costo_hambre },
      suciedad: { increment: config.costo_suciedad },
      hp: { decrement: config.costo_hp },
      last_ep_recovery: new Date()
    };

    if (statTipo === 'Fuerza') updatePetData.f_entrenada = { increment: gananciaFinal };
    if (statTipo === 'Agilidad') updatePetData.a_entrenada = { increment: gananciaFinal };
    if (statTipo === 'Defensa') updatePetData.d_entrenada = { increment: gananciaFinal };

    const [petActualizado, userActualizado] = await prisma.$transaction([
      prisma.pet.update({
        where: { id: petId },
        data: updatePetData,
        include: { especieActual: true }
      }),
      prisma.userGamer.update({
        where: { id: pet.userId },
        data: { nanocredits: { decrement: costoSesionOro } }
      })
    ]);

    return await buildStandardResponse({
      status: "TRAINING_SUCCESS",
      pet: petActualizado,
      extraData: {
        ganancia: gananciaFinal,
        oro_pagado: costoSesionOro,
        fatiga: multRendimiento < 1.0
      },
      message: `Entrenamiento exitoso. Costo: ${costoSesionOro} Nanocredits.`
    });

  } catch (error) {
    console.error("❌ Error en Train:", error);
    return NextResponse.json({ status: "ERROR", message: error.message }, { status: 500 });
  }
}