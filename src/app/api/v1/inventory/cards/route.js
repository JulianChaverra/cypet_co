import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-middleware';

export async function GET(request) {
  try {
    // 1. Validar el acceso (JWT)
    verifyAuth(request);

    // Obtener userId de los parámetros de búsqueda (query params)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    // 2. Consultar el inventario del usuario
    // Traemos la relación con CardMaster para tener los detalles (nombre, efecto, etc.)
    const userCards = await prisma.userCard.findMany({
      where: { userId: userId },
      include: {
        cardMaster: true
      }
    });

    // 3. Agrupar por tipo
    // Estructura: { "Ofensiva": [...], "Defensiva": [...], ... }
    const inventoryGrouped = userCards.reduce((acc, item) => {
      const tipo = item.cardMaster.tipo;
      
      if (!acc[tipo]) {
        acc[tipo] = [];
      }

      // Aplanamos el objeto para que Unity lo reciba de forma sencilla
      acc[tipo].push({
        instanceId: item.id,       // ID único en el inventario del usuario
        cardId: item.cardId,       // ID de la librería (STR_001)
        nombre: item.cardMaster.nombre,
        rareza: item.cardMaster.rareza,
        energia: item.cardMaster.energia,
        efecto: item.cardMaster.efecto_principal,
        valor: item.cardMaster.valor,
        isMultiplier: item.cardMaster.is_multiplier,
        cantidad: item.cantidad,
        enMazo: item.en_mazo
      });

      return acc;
    }, {});

    // 4. Retornar la respuesta
    return NextResponse.json({
      status: 'SUCCESS',
      userId: userId,
      total_unique_cards: userCards.length,
      inventory: inventoryGrouped
    });

  } catch (error) {
    console.error('Error al obtener inventario de cartas:', error);
    return NextResponse.json({ 
      error: 'System Failure al acceder al archivo de cartas' 
    }, { status: 500 });
  }
}