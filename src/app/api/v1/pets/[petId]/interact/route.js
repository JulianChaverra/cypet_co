import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-middleware';
import { refreshPetStatus, buildStandardResponse } from '@/lib/game-state'; // <-- Importamos el constructor

export async function POST(request, { params }) {
  try {
    verifyAuth(request);
    const { petId } = await params;
    const { action } = await request.json();

    // 1. Sincronización de Tiempo Pasivo (Server-Authoritative)
    // Se ejecuta primero para aplicar el desgaste de hambre/suciedad real
    let pet = await refreshPetStatus(petId);

    // 2. Aplicar Acción Principal con el ajuste temporal de -10 (mientras llegan las cartas)
    let updateData = {};

    if (action === 'FEED') {
      // Candado de Seguridad del API
      if (pet.hambre <= 0) {
        return NextResponse.json({ 
          error: 'El CyPet no tiene hambre en este momento.' 
        }, { status: 400 });
      }
      
      updateData = { 
        hambre: Math.max(0, pet.hambre - 10),
        ultima_conexion: new Date() // Reseteamos el reloj del servidor
      };
    } 
    else if (action === 'CLEAN') {
      // Candado de Seguridad del API
      if (pet.suciedad <= 0) {
        return NextResponse.json({ 
          error: 'El CyPet ya está completamente limpio.' 
        }, { status: 400 });
      }
      
      updateData = { 
        suciedad: Math.max(0, pet.suciedad - 10),
        ultima_conexion: new Date() // Reseteamos el reloj del servidor
      };
    } else {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }

    // 3. Si hubo una acción válida, actualizamos la base de datos
    if (Object.keys(updateData).length > 0) {
      pet = await prisma.pet.update({
        where: { id: petId },
        data: updateData,
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
    }

    // 4. Respuesta Estándar (Game State Payload / Piggybacking)
    // <-- Ahora en UNA sola línea devolvemos la misma estructura idéntica
    return buildStandardResponse({
      status: 'ACTION_SUCCESS',
      message: `Acción ${action} completada (-10 puntos). Estado pasivo sincronizado.`,
      pet: pet
    });

  } catch (error) {
    console.error('Error en interacción:', error);
    return NextResponse.json({ error: error.message || 'Error en el Grid' }, { status: 500 });
  }
}