import { prisma } from '@/lib/prisma';
import { buildStandardResponse, refreshPetStatus } from '@/lib/game-state';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { petId, misionCodigo } = await request.json();

    if (!petId || !misionCodigo) {
      return NextResponse.json({ status: "ERROR", message: "Faltan datos (petId o misionCodigo)" }, { status: 400 });
    }

    // 1. Sincronizar estado actual del pet
    let pet = await refreshPetStatus(petId);

    // 2. Validaciones de Negocio
    if (pet.is_patrolling) {
      return NextResponse.json({ status: "ERROR", message: "El CyPet ya se encuentra en una misión." }, { status: 400 });
    }

    // 3. Obtener configuración de la misión
    const mision = await prisma.misionConfig.findUnique({
      where: { codigo: misionCodigo }
    });

    if (!mision) {
      return NextResponse.json({ status: "ERROR", message: "Misión no encontrada." }, { status: 404 });
    }

    // 4. Verificar si tiene energía (Hambre/Suciedad no al max)
    const nuevaHambre = pet.hambre + mision.costo_hambre;
    const nuevaSuciedad = pet.suciedad + mision.costo_suciedad;

    if (nuevaHambre > 100 || nuevaSuciedad > 100) {
      return NextResponse.json({ 
        status: "ERROR", 
        message: "El CyPet está demasiado agotado o sucio para esta misión. ¡Atiéndelo primero!" 
      }, { status: 400 });
    }

    // 5. CALCULAR TIEMPO DE FINALIZACIÓN
    const ahora = new Date();
    const tiempoFin = new Date(ahora.getTime() + (mision.duracion_seg * 1000));

    // 6. ACTUALIZAR PET (Inicia patrullaje y cobra costos)
    const petActualizado = await prisma.pet.update({
      where: { id: petId },
      data: {
        is_patrolling: true,
        patrol_type: misionCodigo,
        patrol_end_time: tiempoFin,
        hambre: nuevaHambre,
        suciedad: nuevaSuciedad,
        ultima_conexion: ahora // Reset para que el desgaste pasivo no cuente mientras patrulla
      },
      include: {
        especieActual: {
          select: { prefab_model: true, tipo: true, hp_base: true, md_para_siguiente: true }
        }
      }
    });

    // 7. RESPUESTA ESTÁNDAR
    return await buildStandardResponse({
      status: "PATROL_STARTED",
      pet: petActualizado,
      message: `Misión ${mision.nombre} iniciada. Regresa en ${mision.duracion_seg} segundos.`
    });

  } catch (error) {
    console.error("❌ Error en Patrol Start:", error);
    return NextResponse.json({ status: "ERROR", message: error.message }, { status: 500 });
  }
}