import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-middleware';
import { buildStandardResponse } from '@/lib/game-state';
import { grantStarterDeck } from '@/lib/card-service'; // <--- Importamos el servicio

export async function POST(request) {
  try {
    // 1. Validar el acceso (JWT de la App)
    verifyAuth(request);

    const { userId, tipo } = await request.json();

    if (!userId || !tipo) {
      return NextResponse.json({ error: 'userId y tipo son requeridos' }, { status: 400 });
    }

    // 2. Buscar candidatos (Especies Baby del tipo elegido)
    const posiblesBabys = await prisma.especie.findMany({
      where: {
        tipo: tipo,
        rango: 'Baby',
      },
    });

    if (posiblesBabys.length === 0) {
      return NextResponse.json({ error: 'No hay especies Baby de ese tipo' }, { status: 404 });
    }

    // 3. Selección Aleatoria (Gacha)
    const randomBaby = posiblesBabys[Math.floor(Math.random() * posiblesBabys.length)];

    // Buscar el Junior en el Mapa de Evolución
    const evolucionAJunior = await prisma.mapaEvolucion.findFirst({
      where: {
        especie_origen_id: randomBaby.id
      }
    });

    if (!evolucionAJunior) {
      return NextResponse.json({ 
        error: `Error de Grid: El Baby ${randomBaby.nombre} no tiene una evolución a Junior configurada.` 
      }, { status: 500 });
    }

    const juniorId = evolucionAJunior.especie_destino_id;

    // 4. Inserción en la tabla Pet con stats de la Especie
    const nuevoPet = await prisma.pet.create({
      data: {
        nickname: randomBaby.nombre, 
        userId: userId,
        especie_id: randomBaby.id,
        junior_original_id: juniorId, 
        ancestro_id: randomBaby.id, 
        etapa_evolutiva: 0, // 0 = Baby
        
        // --- STATS AL NACER ---
        hp: randomBaby.hp_base,
        hp_entrenado: 0, 
        f_entrenada: randomBaby.f_base,
        a_entrenada: randomBaby.a_base,
        d_entrenada: randomBaby.d_base,
      },
      include: {
        especieActual: {
          select: {
            prefab_model: true,
            tipo: true,
            hp_base: true,
            md_para_siguiente: true
          }
        }
      }
    });

    // --- NUEVO: LLAMADO A LA CREACIÓN DEL DECK INICIAL ---
    try {
      await grantStarterDeck(userId);
    } catch (cardError) {
      console.error('⚠️ Pet creado pero falló el Starter Deck:', cardError);
    }

    // 5. Formatear la respuesta usando el Constructor Universal
    return buildStandardResponse({
      status: 'INCUBATION_SUCCESS',
      pet: nuevoPet
    });

  } catch (error) {
    console.error('Error en incubación:', error);
    return NextResponse.json({ error: 'System Failure en Incubadora' }, { status: 500 });
  }
}