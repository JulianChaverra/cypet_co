const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

// Cargamos el .env para asegurar la conexión
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' }); 

const prisma = new PrismaClient();

async function main() {
  console.log("🏋️‍♂️ Calibrando máquinas del Centro de Entrenamiento...");

  const trainingData = [
    // --- FUERZA ---
    { stat_tipo: 'Fuerza', nivel_maquina: 1, costo_hambre: 35.0, costo_suciedad: 15.0, costo_hp: 10.0, min_gain: 0.3, max_gain: 0.8, costo_upgrade_oro: 500 },
    { stat_tipo: 'Fuerza', nivel_maquina: 2, costo_hambre: 40.0, costo_suciedad: 18.0, costo_hp: 12.0, min_gain: 0.9, max_gain: 1.5, costo_upgrade_oro: 1500 },
    
    // --- AGILIDAD ---
    { stat_tipo: 'Agilidad', nivel_maquina: 1, costo_hambre: 25.0, costo_suciedad: 30.0, costo_hp: 8.0, min_gain: 0.3, max_gain: 0.8, costo_upgrade_oro: 500 },
    { stat_tipo: 'Agilidad', nivel_maquina: 2, costo_hambre: 30.0, costo_suciedad: 35.0, costo_hp: 10.0, min_gain: 0.9, max_gain: 1.5, costo_upgrade_oro: 1500 },
    
    // --- DEFENSA ---
    { stat_tipo: 'Defensa', nivel_maquina: 1, costo_hambre: 30.0, costo_suciedad: 10.0, costo_hp: 20.0, min_gain: 0.3, max_gain: 0.8, costo_upgrade_oro: 500 },
    { stat_tipo: 'Defensa', nivel_maquina: 2, costo_hambre: 35.0, costo_suciedad: 12.0, costo_hp: 25.0, min_gain: 0.9, max_gain: 1.5, costo_upgrade_oro: 1500 }
  ];

  try {
    // Usamos upsert para evitar errores si ya existen y poder actualizar valores de balanceo fácilmente
    for (const item of trainingData) {
      await prisma.trainingConfig.upsert({
        where: {
          stat_tipo_nivel_maquina: {
            stat_tipo: item.stat_tipo,
            nivel_maquina: item.nivel_maquina,
          },
        },
        update: item,
        create: item,
      });
    }

    console.log(`✅ ¡Éxito! Configuración de Gimnasio (6 niveles) inyectada correctamente.`);
    
  } catch (error) {
    console.error("❌ Error inyectando configuración de gimnasio:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();