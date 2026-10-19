import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Se mantiene por si se requiere en futuras lógicas
import { verifyAuth } from '@/lib/auth-middleware';
import { refreshPetStatus, buildStandardResponse } from '@/lib/game-state'; // Importamos el constructor universal

export async function GET(request, { params }) {
  try {
    // 1. Validar seguridad (JWT)
    verifyAuth(request);

    // 2. Extraer el ID de la URL (Next.js 15)
    const { petId } = await params;

    if (!petId) {
      return NextResponse.json({ error: 'El ID del CyPet es requerido' }, { status: 400 });
    }

    // 3. Buscar el Pet y Actualizar Stats Pasivos (Tiempo, Hambre, Suciedad, HP)
    const pet = await refreshPetStatus(petId);

    // 4. Validación por si el ID no existe
    if (!pet) {
      return NextResponse.json({ error: 'CyPet no encontrado en el Grid' }, { status: 404 });
    }

    // 5. Devolver la data con la estructura estandarizada
    // buildStandardResponse ya se encarga de mapear hp_max, md_max, prefab_model, attribute,
    // así como de incluir los bloques de economy e inventory_summary.
    return buildStandardResponse({
      status: 'SYNC_SUCCESS',
      pet: pet
    });

  } catch (error) {
    console.error('Error sincronizando Pet:', error);
    return NextResponse.json({ 
      error: error.message || 'Fallo de conexión al sincronizar con el Grid' 
    }, { status: 500 });
  }
}