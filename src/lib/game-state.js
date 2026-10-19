import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function refreshPetStatus(petId) {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: {
      especieActual: {
        select: { hp_base: true, md_para_siguiente: true, prefab_model: true, tipo: true }
      }
    }
  });

  if (!pet) throw new Error('Pet no encontrado');

  const ahora = new Date();
  const ultimaConexion = new Date(pet.ultima_conexion);
  const diffMs = ahora - ultimaConexion;
  
  const diffMinutos = Math.floor(diffMs / (1000 * 60));
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));

  // --- LÓGICA DE ENTRENAMIENTO (EP y Resets) ---
  let nuevoEP = pet.training_ep;
  let nuevaFechaRecuperacion = new Date(pet.last_ep_recovery);
  let nuevasSesionesHoy = pet.training_sessions_today;
  let nuevaFechaReset = new Date(pet.last_training_reset);

  // 1. Recuperación de EP (1 cada 2 horas)
  if (nuevoEP < pet.training_ep_max) {
    const msDesdeRecuperacion = ahora - nuevaFechaRecuperacion;
    const puntosARecuperar = Math.floor(msDesdeRecuperacion / (1000 * 60 * 60 * 2));

    if (puntosARecuperar > 0) {
      nuevoEP = Math.min(pet.training_ep_max, nuevoEP + puntosARecuperar);
      // Actualizamos la fecha de recuperación sumando las horas consumidas
      nuevaFechaRecuperacion = new Date(nuevaFechaRecuperacion.getTime() + (puntosARecuperar * 1000 * 60 * 60 * 2));
    }
  } else {
    // Si ya está al máximo, mantenemos la fecha de recuperación al "ahora"
    nuevaFechaRecuperacion = ahora;
  }

  // 2. Reset Diario de Sesiones (Rendimiento Decreciente)
  // Comparamos si el día/mes/año es distinto al del último reset
  const esNuevoDia = ahora.toDateString() !== nuevaFechaReset.toDateString();
  if (esNuevoDia) {
    nuevasSesionesHoy = 0;
    nuevaFechaReset = ahora;
  }

  // --- LÓGICA DE DESGASTE NATURAL (Hambre, Suciedad, HP) ---
  if (diffMinutos <= 0 && !esNuevoDia && nuevoEP === pet.training_ep) return pet;

  const puntosHambre = Math.floor(diffMinutos / 5);
  const puntosSuciedad = Math.floor(diffMinutos / 10);
  
  const nuevaHambre = Math.min(100, pet.hambre + puntosHambre);
  const nuevaSuciedad = Math.min(100, pet.suciedad + puntosSuciedad);

  let nuevoHP = pet.hp;
  if (nuevaHambre >= 80 || nuevaSuciedad >= 80) {
    if (diffHoras >= 1) {
      const hpMax = pet.especieActual.hp_base + pet.hp_entrenado;
      const penalizacion = hpMax * 0.01 * diffHoras;
      nuevoHP = Math.max(0, pet.hp - penalizacion);
    }
  }

  return await prisma.pet.update({
    where: { id: petId },
    data: {
      hambre: nuevaHambre,
      suciedad: nuevaSuciedad,
      hp: nuevoHP,
      training_ep: nuevoEP,
      last_ep_recovery: nuevaFechaRecuperacion,
      training_sessions_today: nuevasSesionesHoy,
      last_training_reset: nuevaFechaReset,
      ultima_conexion: ahora 
    },
    include: {
      especieActual: {
        select: { prefab_model: true, tipo: true, hp_base: true, md_para_siguiente: true }
      }
    }
  });
}

export function formatPetStats(pet) {
  const ahora = new Date();
  let segundosRestantesPatrulla = 0;

  if (pet.is_patrolling && pet.patrol_end_time) {
    const fin = new Date(pet.patrol_end_time);
    segundosRestantesPatrulla = Math.max(0, Math.floor((fin.getTime() - ahora.getTime()) / 1000));
  }

  return {
    ...pet,
    prefab_model: pet.especieActual.prefab_model,
    attribute: pet.especieActual.tipo,
    hp_max: pet.especieActual.hp_base + pet.hp_entrenado,
    md_max: pet.especieActual.md_para_siguiente,
    hambre_max: 100.0,
    suciedad_max: 100.0,
    // Agrupamos info de entrenamiento para Unity
    training_status: {
      ep: pet.training_ep,
      ep_max: pet.training_ep_max,
      sessions_today: pet.training_sessions_today,
      gym_levels: {
        fuerza: pet.gym_fuerza_lv,
        agilidad: pet.gym_agilidad_lv,
        defensa: pet.gym_defensa_lv
      }
    },
    patrol_status: {
      is_patrolling: pet.is_patrolling || false,
      patrol_type: pet.patrol_type || null,
      end_time: pet.patrol_end_time ? pet.patrol_end_time.toISOString() : null,
      remaining_seconds: segundosRestantesPatrulla 
    }
  };
}

export async function getFormattedGameState(pet) {
  const user = await prisma.userGamer.findUnique({
    where: { id: pet.userId },
    select: { nanocredits: true, premium_credits: true }
  });

  return {
    pet: formatPetStats(pet),
    economy: { 
      monedas_oro: user?.nanocredits || 0, 
      monedas_premium: user?.premium_credits || 0 
    },
    inventory_summary: []
  };
}

export async function buildStandardResponse({ status, pet, extraData = {}, message = null }) {
  const gameState = await getFormattedGameState(pet);

  const payload = {
    status: status,
    ...extraData,
    ...gameState 
  };

  if (message) {
    payload.message = message;
  }

  return NextResponse.json(payload);
}