import { prisma } from '@/lib/prisma';
import { buildStandardResponse, refreshPetStatus } from '@/lib/game-state';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // 1. Extraer el petId de los parámetros de la URL
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');

    if (!petId) {
      return NextResponse.json(
        { status: "ERROR", message: "Se requiere petId para sincronizar el estado" },
        { status: 400 }
      );
    }

    // 2. Sincronizar el estado actual de la mascota (por si ha pasado tiempo)
    const pet = await refreshPetStatus(petId);

    // 3. Obtener el catálogo de misiones
    const misiones = await prisma.misionConfig.findMany({
      orderBy: { duracion_seg: 'asc' }
    });

    // 4. USAR NUESTRO CONSTRUCTOR UNIVERSAL
    // Metemos las misiones dentro de extraData
    return await buildStandardResponse({
      status: "SUCCESS",
      pet: pet,
      extraData: { misiones: misiones }
    });

  } catch (error) {
    console.error("❌ Error en GET /patrol:", error);
    return NextResponse.json(
      { status: "ERROR", message: error.message || "Error al cargar patrullaje" },
      { status: 500 }
    );
  }
}