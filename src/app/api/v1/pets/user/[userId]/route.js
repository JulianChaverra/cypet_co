import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-middleware';
import { refreshPetStatus, formatPetStats } from '@/lib/game-state'; // <-- Importamos el formateador individual

export async function GET(request, { params }) {
  try {
    // 1. Validar seguridad (JWT de la App)
    verifyAuth(request);

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'El ID del usuario es requerido' }, { status: 400 });
    }

    // 2. Buscar primero los IDs de las mascotas para poder refrescarlas
    const userPets = await prisma.pet.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'asc' },
      select: { id: true } // Solo necesitamos los IDs para el refresh
    });

    // 3. Si no tiene mascotas, devolvemos 404 (Igual que antes)
    if (userPets.length === 0) {
      return NextResponse.json({ 
        status: 'NO_PETS_FOUND',
        message: 'El usuario no tiene CyPets registrados' 
      }, { status: 404 });
    }

    // 4. Refrescar el estado de CADA mascota antes de mostrar la lista en paralelo
    const refreshedPets = await Promise.all(
      userPets.map(p => refreshPetStatus(p.id))
    );

    // 5. Formatear la lista usando nuestro helper centralizado
    // Así evitamos repetir el mapeo de hp_max, md_max y patrol_status aquí
    const formattedPets = refreshedPets.map(pet => formatPetStats(pet));

    // 6. Consultar la economía real del usuario en la DB
    const user = await prisma.userGamer.findUnique({
      where: { id: userId },
      select: { nanocredits: true, premium_credits: true }
    });

    // 7. Devolver la respuesta con la estructura maestra
    return NextResponse.json({
      status: 'FETCH_SUCCESS',
      pets: formattedPets,
      economy: { 
        monedas_oro: user?.nanocredits || 0, 
        monedas_premium: user?.premium_credits || 0 
      },
      inventory_summary: []
    });

  } catch (error) {
    console.error('Error listando mascotas:', error);
    return NextResponse.json({ error: 'Error en la red del Grid' }, { status: 500 });
  }
}