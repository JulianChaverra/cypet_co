import { prisma } from '@/lib/prisma';
import { buildStandardResponse } from '@/lib/game-state';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { petId } = await request.json();
    const ahora = new Date();

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: { 
        misionActual: true,
        especieActual: true // Necesitamos saber el md_para_siguiente
      }
    });

    if (!pet) {
      return NextResponse.json({ status: "ERROR", message: "CyPet no encontrado." }, { status: 404 });
    }

    if (!pet.is_patrolling || !pet.misionActual) {
      return NextResponse.json({ status: "ERROR", message: "No hay una misión activa." }, { status: 400 });
    }

    const tiempoFin = new Date(pet.patrol_end_time);
    if (ahora < tiempoFin) {
      const faltan = Math.ceil((tiempoFin - ahora) / 1000);
      return NextResponse.json({ status: "TOO_EARLY", remaining_seconds: faltan }, { status: 400 });
    }

    const mision = pet.misionActual;

    // 1. CALCULAR RECOMPENSAS BASE
    const rewardOro = Math.floor(Math.random() * (mision.max_nanocredits - mision.min_nanocredits + 1)) + mision.min_nanocredits;
    const gananciaMDRaw = parseFloat((Math.random() * (mision.max_md - mision.min_md) + mision.min_md).toFixed(2));

    // 2. LÓGICA DE CAP (TECHO 100%)
    const mdActual = pet.md_acumulado;
    const mdMaximo = pet.especieActual.md_para_siguiente;
    
    // Calculamos cuánto espacio queda para llegar al 100%
    const espacioDisponible = Math.max(0, mdMaximo - mdActual);
    
    // El MD real que se sumará es el mínimo entre lo ganado y el espacio que queda
    const rewardMDFinal = parseFloat(Math.min(gananciaMDRaw, espacioDisponible).toFixed(2));

    // 3. TRANSACCIÓN ATÓMICA
    const [petActualizado] = await prisma.$transaction([
      prisma.pet.update({
        where: { id: petId },
        data: {
          is_patrolling: false,
          patrol_type: null,
          patrol_end_time: null,
          md_acumulado: { increment: rewardMDFinal } // Solo suma hasta el tope
        },
        include: { 
          especieActual: { 
            select: { prefab_model: true, tipo: true, hp_base: true, md_para_siguiente: true } 
          } 
        }
      }),
      prisma.userGamer.update({
        where: { id: pet.userId },
        data: { nanocredits: { increment: rewardOro } }
      })
    ]);

    // 4. RESPUESTA PERSONALIZADA
    let mensaje = `¡Misión completada! Ganaste ${rewardOro} Nanocredits y ${rewardMDFinal} MD.`;
    if (rewardMDFinal === 0 && mdActual >= mdMaximo) {
      mensaje = `¡Misión completada! Ganaste ${rewardOro} Nanocredits. Tu MD ya está al 100%, ¡evoluciona para seguir ganando MD!`;
    }

    return await buildStandardResponse({
      status: "CLAIM_SUCCESS",
      pet: petActualizado,
      extraData: {
        rewards: {
          oro: rewardOro,
          md: rewardMDFinal,
          md_descartado: parseFloat((gananciaMDRaw - rewardMDFinal).toFixed(2)) // Info útil para debug
        }
      },
      message: mensaje
    });

  } catch (error) {
    console.error("❌ Error en Patrol Claim:", error);
    return NextResponse.json({ status: "ERROR", message: error.message }, { status: 500 });
  }
}