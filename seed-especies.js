// seed-especies.js
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

// Cargamos el .env para asegurar la conexión
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' }); 

const prisma = new PrismaClient();

async function main() {
  console.log("🧬 Iniciando inyección de ADN Base en el Grid...");

  // CUIDADO CON LAS MAYÚSCULAS: 
  // Prisma Enums distinguen mayúsculas/minúsculas. 
  // Deben ser exactos al schema: "Virus", "Baby", etc.
  const especiesData = [
    // --- RAMA DRAGO (VIRUS - DPS) ---
    { id: 100, nombre: "Dra-Bit",       tipo: "Virus", rango: "Baby",     hp_base: 50,  f_base: 15,  a_base: 10,  d_base: 5,  md_para_siguiente: 100,  tasa_descarga: null, prefab_model: "pb_drabit" },
    { id: 101, nombre: "Drago",         tipo: "Virus", rango: "Junior",   hp_base: 120, f_base: 35,  a_base: 20,  d_base: 15, md_para_siguiente: 1000, tasa_descarga: null, prefab_model: "pb_drago" },
    { id: 102, nombre: "Drago-Ignis",   tipo: "Virus", rango: "Champion", hp_base: 250, f_base: 90,  a_base: 40,  d_base: 30, md_para_siguiente: 2000, tasa_descarga: null, prefab_model: "pb_dignis" },
    { id: 103, nombre: "Drago-Burst",   tipo: "Virus", rango: "Champion", hp_base: 200, f_base: 60,  a_base: 85,  d_base: 25, md_para_siguiente: 2000, tasa_descarga: null, prefab_model: "pb_dburst" },
    { id: 104, nombre: "Drago-Plate",   tipo: "Virus", rango: "Champion", hp_base: 320, f_base: 70,  a_base: 30,  d_base: 70, md_para_siguiente: 2000, tasa_descarga: null, prefab_model: "pb_dplate" },
    { id: 105, nombre: "Kaiser-Drago",  tipo: "Virus", rango: "Master",   hp_base: 500, f_base: 200, a_base: 100, d_base: 80, md_para_siguiente: 0,    tasa_descarga: null, prefab_model: "pb_kdrago" },
    { id: 106, nombre: "Sonic-Drago",   tipo: "Virus", rango: "Master",   hp_base: 400, f_base: 130, a_base: 220, d_base: 60, md_para_siguiente: 0,    tasa_descarga: null, prefab_model: "pb_sdrago" },
    { id: 107, nombre: "Warlord-Drago", tipo: "Virus", rango: "Master",   hp_base: 650, f_base: 160, a_base: 60,  d_base: 160,md_para_siguiente: 0,    tasa_descarga: null, prefab_model: "pb_wdrago" },
    { id: 108, nombre: "Glitch-Drago",  tipo: "Virus", rango: "Corrupt",  hp_base: 150, f_base: 180, a_base: 80,  d_base: 10, md_para_siguiente: 1000, tasa_descarga: 20.0, prefab_model: "pb_gdrago" },
    { id: 109, nombre: "Null-Drago",    tipo: "Virus", rango: "Corrupt",  hp_base: 250, f_base: 350, a_base: 120, d_base: 5,  md_para_siguiente: 0,    tasa_descarga: 35.0, prefab_model: "pb_ndrago" },

    // --- RAMA TARTU (DATOS - TANQUE) ---
    { id: 200, nombre: "Tar-Bit",         tipo: "Datos", rango: "Baby",     hp_base: 80,   f_base: 8,   a_base: 5,   d_base: 18, md_para_siguiente: 100,  tasa_descarga: null, prefab_model: "pb_tarbit" },
    { id: 201, nombre: "Tartu",           tipo: "Datos", rango: "Junior",   hp_base: 200,  f_base: 15,  a_base: 10,  d_base: 45, md_para_siguiente: 1000, tasa_descarga: null, prefab_model: "pb_tartu" },
    { id: 202, nombre: "Tartu-Fortress",  tipo: "Datos", rango: "Champion", hp_base: 500,  f_base: 30,  a_base: 15,  d_base: 130,md_para_siguiente: 2000, tasa_descarga: null, prefab_model: "pb_tfort" },
    { id: 203, nombre: "Tartu-Slider",    tipo: "Datos", rango: "Champion", hp_base: 350,  f_base: 25,  a_base: 75,  d_base: 60, md_para_siguiente: 2000, tasa_descarga: null, prefab_model: "pb_tslid" },
    { id: 204, nombre: "Tartu-Impact",    tipo: "Datos", rango: "Champion", hp_base: 450,  f_base: 80,  a_base: 20,  d_base: 80, md_para_siguiente: 2000, tasa_descarga: null, prefab_model: "pb_timp" },
    { id: 205, nombre: "Citadel-Tartu",   tipo: "Datos", rango: "Master",   hp_base: 1000, f_base: 70,  a_base: 40,  d_base: 280,md_para_siguiente: 0,    tasa_descarga: null, prefab_model: "pb_ctartu" },
    { id: 206, nombre: "Neo-Slider",      tipo: "Datos", rango: "Master",   hp_base: 750,  f_base: 60,  a_base: 180, d_base: 120,md_para_siguiente: 0,    tasa_descarga: null, prefab_model: "pb_nslid" },
    { id: 207, nombre: "Goliath-Tartu",   tipo: "Datos", rango: "Master",   hp_base: 900,  f_base: 180, a_base: 40,  d_base: 180,md_para_siguiente: 0,    tasa_descarga: null, prefab_model: "pb_gtartu" },
    { id: 208, nombre: "Rust-Tartu",      tipo: "Datos", rango: "Corrupt",  hp_base: 600,  f_base: 90,  a_base: 5,   d_base: 250,md_para_siguiente: 1000, tasa_descarga: 15.0, prefab_model: "pb_rtartu" },
    { id: 209, nombre: "Decay-Tartu",     tipo: "Datos", rango: "Corrupt",  hp_base: 1200, f_base: 150, a_base: 5,   d_base: 450,md_para_siguiente: 0,    tasa_descarga: 25.0, prefab_model: "pb_dtartu" },

    // --- RAMA LIGART (VACUNA - ÁGIL/CRÍTICOS) ---
    { id: 300, nombre: "Li-Bit",         tipo: "Vacuna", rango: "Baby",     hp_base: 40,  f_base: 10,  a_base: 15,  d_base: 5,  md_para_siguiente: 100,  tasa_descarga: null, prefab_model: "pb_libit" },
    { id: 301, nombre: "Ligart",         tipo: "Vacuna", rango: "Junior",   hp_base: 100, f_base: 20,  a_base: 45,  d_base: 15, md_para_siguiente: 1000, tasa_descarga: null, prefab_model: "pb_ligart" },
    { id: 302, nombre: "Ligart-Swift",   tipo: "Vacuna", rango: "Champion", hp_base: 180, f_base: 40,  a_base: 110, d_base: 30, md_para_siguiente: 2000, tasa_descarga: null, prefab_model: "pb_lswift" },
    { id: 303, nombre: "Ligart-Blaze",   tipo: "Vacuna", rango: "Champion", hp_base: 220, f_base: 85,  a_base: 75,  d_base: 35, md_para_siguiente: 2000, tasa_descarga: null, prefab_model: "pb_lblaze" },
    { id: 304, nombre: "Ligart-Mirror",  tipo: "Vacuna", rango: "Champion", hp_base: 200, f_base: 45,  a_base: 80,  d_base: 75, md_para_siguiente: 2000, tasa_descarga: null, prefab_model: "pb_lmirr" },
    { id: 305, nombre: "Aura-Ligart",    tipo: "Vacuna", rango: "Master",   hp_base: 350, f_base: 100, a_base: 250, d_base: 80, md_para_siguiente: 0,    tasa_descarga: null, prefab_model: "pb_aligart" },
    { id: 306, nombre: "Nova-Ligart",    tipo: "Vacuna", rango: "Master",   hp_base: 450, f_base: 200, a_base: 150, d_base: 90, md_para_siguiente: 0,    tasa_descarga: null, prefab_model: "pb_nligart" },
    { id: 307, nombre: "Prisma-Ligart",  tipo: "Vacuna", rango: "Master",   hp_base: 400, f_base: 90,  a_base: 170, d_base: 180,md_para_siguiente: 0,    tasa_descarga: null, prefab_model: "pb_pligart" },
    { id: 308, nombre: "Void-Ligart",    tipo: "Vacuna", rango: "Corrupt",  hp_base: 120, f_base: 110, a_base: 220, d_base: 5,  md_para_siguiente: 1000, tasa_descarga: 25.0, prefab_model: "pb_vligart" },
    // AJUSTADO: El Chaos-Ligart estaba incompleto, aquí tienes una propuesta extrema:
    { id: 309, nombre: "Chaos-Ligart",   tipo: "Vacuna", rango: "Corrupt",  hp_base: 200, f_base: 180, a_base: 400, d_base: 5,  md_para_siguiente: 0,    tasa_descarga: 40.0, prefab_model: "pb_cligart" },
  ];

  try {
    // Usamos createMany y le decimos que salte duplicados si lo corres dos veces
    const result = await prisma.especie.createMany({
      data: especiesData,
      skipDuplicates: true, 
    });

    console.log(`✅ ¡Éxito! Se han inyectado ${result.count} especies en la base de datos.`);
    
  } catch (error) {
    console.error("❌ Error inyectando especies:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();