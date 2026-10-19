// seed-patrol.js
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  console.log("📡 Configurando misiones RÁPIDAS para testeo...");

  const misionesData = [
    {
      codigo: 'PING',
      nombre: 'Ping de Red Rápido',
      duracion_seg: 15, // Test rápido
      costo_hambre: 5.0,
      costo_suciedad: 2.0,
      costo_hp: 0.0,
      min_nanocredits: 10,
      max_nanocredits: 25,
      min_md: 1.0,
      max_md: 3.0,
      probabilidad_drop_item: 0.0,
    },
    {
      codigo: 'SCAN',
      nombre: 'Escaneo de Puertos',
      duracion_seg: 60, // 1 minuto
      costo_hambre: 10.0,
      costo_suciedad: 8.0,
      costo_hp: 0.0,
      min_nanocredits: 40,
      max_nanocredits: 80,
      min_md: 4.0,
      max_md: 10.0,
      probabilidad_drop_item: 10.0,
    },
    {
      codigo: 'INCURSION',
      nombre: 'Incursión en el Grid',
      duracion_seg: 120, // 2 minutos
      costo_hambre: 20.0,
      costo_suciedad: 15.0,
      costo_hp: 5.0,
      min_nanocredits: 100,
      max_nanocredits: 250,
      min_md: 15.0,
      max_md: 30.0,
      probabilidad_drop_item: 25.0,
    }
  ];

  try {
    for (const mision of misionesData) {
      await prisma.misionConfig.upsert({
        where: { codigo: mision.codigo },
        update: mision,
        create: mision,
      });
    }
    console.log(`✅ Seed corregido: ${misionesData.length} misiones rápidas listas.`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();