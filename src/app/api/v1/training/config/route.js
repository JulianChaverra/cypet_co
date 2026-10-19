import { prisma } from '@/lib/prisma';
import { buildStandardResponse, refreshPetStatus } from '@/lib/game-state';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');

    if (!petId) {
      return NextResponse.json({ status: "ERROR", message: "petId es requerido" }, { status: 400 });
    }

    // 1. Sincronizamos el estado (EP, Hambre, etc.)
    const pet = await refreshPetStatus(petId);

    // 2. Consultamos la configuración de las máquinas según los niveles del Pet
    // Buscamos la config para Fuerza, Agilidad y Defensa en sus niveles actuales
    const configs = await prisma.trainingConfig.findMany({
      where: {
        OR: [
          { stat_tipo: 'Fuerza', nivel_maquina: pet.gym_fuerza_lv },
          { stat_tipo: 'Agilidad', nivel_maquina: pet.gym_agilidad_lv },
          { stat_tipo: 'Defensa', nivel_maquina: pet.gym_defensa_lv }
        ]
      }
    });

    // 3. Formateamos la respuesta para que Unity la lea fácil
    const trainingMenu = {
      fuerza: configs.find(c => c.stat_tipo === 'Fuerza'),
      agilidad: configs.find(c => c.stat_tipo === 'Agilidad'),
      defensa: configs.find(c => c.stat_tipo === 'Defensa')
    };

    return await buildStandardResponse({
      status: "SUCCESS",
      pet: pet,
      extraData: { training_menu: trainingMenu }
    });

  } catch (error) {
    console.error("❌ Error en GET Training Config:", error);
    return NextResponse.json({ status: "ERROR", message: error.message }, { status: 500 });
  }
}