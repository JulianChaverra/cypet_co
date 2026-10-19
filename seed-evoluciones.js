// seed-evoluciones.js
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  console.log("🧬 Ajustando el Mapa de Evolución (N = Negligencia, Null = Default)...");

  const evolucionesData = [
    // =========================================================
    // 1. LÍNEA DRAGO (VIRUS)
    // =========================================================
    // Baby -> Junior (Paso obligatorio inicial: NULO)
    { especie_origen_id: 100, especie_destino_id: 101, stat_vinculado: null, es_corrupta: false },
    // Junior -> Ramificaciones (Champion / Corrupt)
    { especie_origen_id: 101, especie_destino_id: 108, stat_vinculado: "N", es_corrupta: true },  // Negligencia
    { especie_origen_id: 101, especie_destino_id: 102, stat_vinculado: "F", es_corrupta: false }, // Fuerza
    { especie_origen_id: 101, especie_destino_id: 103, stat_vinculado: "A", es_corrupta: false }, // Agilidad
    { especie_origen_id: 101, especie_destino_id: 104, stat_vinculado: "D", es_corrupta: false }, // Defensa
    // Champion -> Master
    { especie_origen_id: 102, especie_destino_id: 105, stat_vinculado: "F", es_corrupta: false }, 
    { especie_origen_id: 103, especie_destino_id: 106, stat_vinculado: "A", es_corrupta: false }, 
    { especie_origen_id: 104, especie_destino_id: 107, stat_vinculado: "D", es_corrupta: false }, 
    // Corrupt -> Final Corrupt
    { especie_origen_id: 108, especie_destino_id: 109, stat_vinculado: "N", es_corrupta: true },  // Negligencia

    // =========================================================
    // 2. LÍNEA TARTU (DATOS)
    // =========================================================
    // Baby -> Junior (Paso obligatorio inicial: NULO)
    { especie_origen_id: 200, especie_destino_id: 201, stat_vinculado: null, es_corrupta: false },
    // Junior -> Ramificaciones
    { especie_origen_id: 201, especie_destino_id: 208, stat_vinculado: "N", es_corrupta: true },  // Negligencia
    { especie_origen_id: 201, especie_destino_id: 204, stat_vinculado: "F", es_corrupta: false }, 
    { especie_origen_id: 201, especie_destino_id: 203, stat_vinculado: "A", es_corrupta: false }, 
    { especie_origen_id: 201, especie_destino_id: 202, stat_vinculado: "D", es_corrupta: false }, 
    // Champion -> Master
    { especie_origen_id: 204, especie_destino_id: 207, stat_vinculado: "F", es_corrupta: false }, 
    { especie_origen_id: 203, especie_destino_id: 206, stat_vinculado: "A", es_corrupta: false }, 
    { especie_origen_id: 202, especie_destino_id: 205, stat_vinculado: "D", es_corrupta: false }, 
    // Corrupt -> Final Corrupt
    { especie_origen_id: 208, especie_destino_id: 209, stat_vinculado: "N", es_corrupta: true },  // Negligencia

    // =========================================================
    // 3. LÍNEA LIGART (VACUNA)
    // =========================================================
    // Baby -> Junior (Paso obligatorio inicial: NULO)
    { especie_origen_id: 300, especie_destino_id: 301, stat_vinculado: null, es_corrupta: false },
    // Junior -> Ramificaciones
    { especie_origen_id: 301, especie_destino_id: 308, stat_vinculado: "N", es_corrupta: true },  // Negligencia
    { especie_origen_id: 301, especie_destino_id: 303, stat_vinculado: "F", es_corrupta: false }, 
    { especie_origen_id: 301, especie_destino_id: 302, stat_vinculado: "A", es_corrupta: false }, 
    { especie_origen_id: 301, especie_destino_id: 304, stat_vinculado: "D", es_corrupta: false }, 
    // Champion -> Master
    { especie_origen_id: 303, especie_destino_id: 306, stat_vinculado: "F", es_corrupta: false }, 
    { especie_origen_id: 302, especie_destino_id: 305, stat_vinculado: "A", es_corrupta: false }, 
    { especie_origen_id: 304, especie_destino_id: 307, stat_vinculado: "D", es_corrupta: false }, 
    // Corrupt -> Final Corrupt
    { especie_origen_id: 308, especie_destino_id: 309, stat_vinculado: "N", es_corrupta: true },  // Negligencia
  ];

  try {
    await prisma.mapaEvolucion.deleteMany();
    
    const result = await prisma.mapaEvolucion.createMany({
      data: evolucionesData,
    });

    console.log(`✅ ¡Éxito! Se inyectaron ${result.count} reglas. (Baby->Junior ahora son Nulas).`);
    
  } catch (error) {
    console.error("❌ Error inyectando el mapa de evolución:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();