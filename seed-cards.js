const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  console.log("🃏 Iniciando la Gran Inyección del Deck Maestro (200 Cartas)...");

  const cardsRaw = [
    // [ID, Nombre, Rareza, Tipo, Energía, Efecto, Valor, Oro, Bios]
    // FUERZA (STR)
    ["STR_001", "Golpe de Chatarra", "Común", "Ofensiva", 1, "Daño Fuerza", "1.1x", 150, 0],
    ["STR_002", "Impacto de Cobre", "Común", "Ofensiva", 1, "Daño Fuerza", "1.1x", 180, 0],
    ["STR_003", "Puño Hidráulico", "Común", "Ofensiva", 1, "Daño Fuerza", "1.2x", 200, 0],
    ["STR_004", "Presión de Vapor", "Común", "Ofensiva", 1, "Daño Fuerza", "1.2x", 220, 0],
    ["STR_005", "Mazo de Hierro", "Común", "Ofensiva", 1, "Daño Fuerza", "1.3x", 250, 0],
    ["STR_006", "Empuje de Pistón", "Común", "Ofensiva", 1, "Daño Fuerza", "1.3x", 280, 0],
    ["STR_007", "Martillo de Plomo", "Común", "Ofensiva", 2, "Daño Fuerza", "1.5x", 350, 0],
    ["STR_008", "Trituradora Base", "Común", "Ofensiva", 2, "Daño Fuerza", "1.6x", 400, 0],
    ["STR_009", "Golpe Oxidado", "Común", "Ofensiva", 1, "Daño Fuerza", "1.1x", 150, 0],
    ["STR_010", "Impacto Pesado", "Común", "Ofensiva", 2, "Daño Fuerza", "1.7x", 450, 0],
    ["STR_011", "Carga de Acero", "Rara", "Ofensiva", 2, "Daño Fuerza", "2.0x", 1200, 5],
    ["STR_012", "Mazo Cinético", "Rara", "Ofensiva", 2, "Daño Fuerza", "2.1x", 1400, 6],
    ["STR_013", "Rompe-Diques", "Rara", "Ofensiva", 2, "Daño Fuerza", "2.2x", 1600, 7],
    ["STR_014", "Perforadora T1", "Rara", "Ofensiva", 2, "Daño Fuerza", "2.3x", 1800, 8],
    ["STR_015", "Gran Impacto", "Rara", "Ofensiva", 3, "Daño Fuerza", "2.8x", 2000, 10],
    ["STR_016", "Pulso de Poder", "Rara", "Ofensiva", 2, "Daño Fuerza", "2.2x", 1600, 7],
    ["STR_017", "Hacha de Energía", "Rara", "Ofensiva", 2, "Daño Fuerza", "2.4x", 2200, 12],
    ["STR_018", "Golpe Dinámico", "Rara", "Ofensiva", 1, "Daño Fuerza", "1.8x", 1500, 8],
    ["STR_019", "Gancho de Torque", "Rara", "Ofensiva", 2, "Daño Fuerza", "2.5x", 2400, 14],
    ["STR_020", "Quebrantador", "Rara", "Ofensiva", 2, "Daño Fuerza", "2.3x", 1800, 9],
    ["STR_021", "Filo de Titanio", "Épica", "Ofensiva", 2, "Daño Fuerza", "3.2x", 5500, 25],
    ["STR_022", "Martillo Gravitatorio", "Épica", "Ofensiva", 3, "Daño Fuerza", "3.8x", 7000, 35],
    ["STR_023", "Colisión de Iones", "Épica", "Ofensiva", 2, "Daño Fuerza", "3.4x", 6000, 30],
    ["STR_024", "Ruptura Atómica", "Épica", "Ofensiva", 3, "Daño Fuerza", "4.0x", 8500, 45],
    ["STR_025", "Mandoble Cyber", "Épica", "Ofensiva", 2, "Daño Fuerza", "3.5x", 6500, 32],
    ["STR_026", "Explosión de Vapor", "Épica", "Ofensiva", 2, "Daño Fuerza", "3.3x", 5800, 28],
    ["STR_027", "Impacto Sónico", "Épica", "Ofensiva", 1, "Daño Fuerza", "2.8x", 5000, 22],
    ["STR_028", "Tritura-Almas", "Épica", "Ofensiva", 3, "Daño Fuerza", "4.2x", 9000, 50],
    ["STR_029", "Golpe Volcano", "Épica", "Ofensiva", 2, "Daño Fuerza", "3.6x", 7500, 40],
    ["STR_030", "Presión Absoluta", "Épica", "Ofensiva", 3, "Daño Fuerza", "4.5x", 12000, 60],
    ["STR_031", "Ira de Gaia", "Legendaria", "Ofensiva", 3, "Daño Fuerza", "5.5x", 50000, 150],
    ["STR_032", "Impacto Orbital", "Legendaria", "Ofensiva", 4, "Daño Fuerza", "6.5x", 75000, 200],
    ["STR_033", "Juicio Final", "Legendaria", "Ofensiva", 4, "Daño Fuerza", "7.0x", 100000, 250],
    ["STR_034", "Golpe de Asteroide", "Legendaria", "Ofensiva", 3, "Daño Fuerza", "5.8x", 60000, 180],
    ["STR_035", "Fuerza Singular", "Legendaria", "Ofensiva", 3, "Daño Fuerza", "6.0x", 65000, 190],

    // AGILIDAD (AGI)
    ["AGI_036", "Corte Neón", "Común", "Ofensiva", 0, "Daño Agilidad", "0.7x", 150, 0],
    ["AGI_037", "Daga Digital", "Común", "Ofensiva", 0, "Daño Agilidad", "0.8x", 180, 0],
    ["AGI_038", "Filo de Bits", "Común", "Ofensiva", 1, "Daño Agilidad", "1.1x", 250, 0],
    ["AGI_039", "Aguijón Cyber", "Común", "Ofensiva", 1, "Daño Agilidad", "1.2x", 300, 0],
    ["AGI_040", "Tajo Rápido", "Común", "Ofensiva", 1, "Daño Agilidad", "1.3x", 350, 0],
    ["AGI_041", "Impulso de Datos", "Común", "Ofensiva", 1, "Daño Agilidad", "1.4x", 400, 0],
    ["AGI_042", "Micro-Corte", "Común", "Ofensiva", 0, "Daño Agilidad", "0.7x", 150, 0],
    ["AGI_043", "Reflejo Veloz", "Común", "Ofensiva", 1, "Daño Agilidad", "1.5x", 450, 0],
    ["AGI_044", "Sombra de Cromo", "Común", "Ofensiva", 1, "Daño Agilidad", "1.2x", 300, 0],
    ["AGI_045", "Flash Neón", "Común", "Ofensiva", 1, "Daño Agilidad", "1.3x", 350, 0],
    ["AGI_046", "Shuriken Laser", "Rara", "Ofensiva", 1, "Daño Agilidad", "1.8x", 1800, 10],
    ["AGI_047", "Corte de Plasma", "Rara", "Ofensiva", 1, "Daño Agilidad", "2.0x", 2000, 12],
    ["AGI_048", "Relámpago Rojo", "Rara", "Ofensiva", 1, "Daño Agilidad", "2.1x", 2200, 14],
    ["AGI_049", "Velocidad Overclock", "Rara", "Ofensiva", 1, "Daño Agilidad", "2.2x", 2400, 15],
    ["AGI_050", "Estocada Binaria", "Rara", "Ofensiva", 1, "Daño Agilidad", "1.9x", 1900, 11],
    ["AGI_051", "Danza de Sables", "Rara", "Ofensiva", 2, "Daño Agilidad", "2.8x", 3000, 20],
    ["AGI_052", "Viento Digital", "Rara", "Ofensiva", 1, "Daño Agilidad", "2.0x", 2000, 12],
    ["AGI_053", "Teletransporte", "Rara", "Ofensiva", 2, "Daño Agilidad", "2.5x", 2500, 18],
    ["AGI_054", "Golpe Fantasma", "Rara", "Ofensiva", 1, "Daño Agilidad", "2.1x", 2200, 13],
    ["AGI_055", "Tajo de Cuarzo", "Rara", "Ofensiva", 1, "Daño Agilidad", "1.8x", 1800, 10],
    ["AGI_056", "Tormenta Neón", "Épica", "Ofensiva", 1, "Daño Agilidad", "3.0x", 12000, 50],
    ["AGI_057", "Ejecución Sombra", "Épica", "Ofensiva", 2, "Daño Agilidad", "3.5x", 15000, 65],
    ["AGI_058", "Rayo Infinito", "Épica", "Ofensiva", 1, "Daño Agilidad", "3.2x", 13000, 55],
    ["AGI_059", "Cuchilla Omega", "Épica", "Ofensiva", 2, "Daño Agilidad", "3.8x", 18000, 75],
    ["AGI_060", "Vórtice de Datos", "Épica", "Ofensiva", 1, "Daño Agilidad", "3.3x", 14000, 60],
    ["AGI_061", "Agilidad Zero", "Épica", "Ofensiva", 2, "Daño Agilidad", "3.6x", 16000, 70],
    ["AGI_062", "Paso Dimensional", "Épica", "Ofensiva", 1, "Daño Agilidad", "2.9x", 11000, 45],
    ["AGI_063", "Asesino de Red", "Épica", "Ofensiva", 2, "Daño Agilidad", "3.7x", 17000, 72],
    ["AGI_064", "Cometa de Iones", "Épica", "Ofensiva", 1, "Daño Agilidad", "3.1x", 12500, 52],
    ["AGI_065", "Reflejo Divino", "Épica", "Ofensiva", 2, "Daño Agilidad", "4.0x", 22000, 85],
    ["AGI_066", "Velocidad Luz", "Legendaria", "Ofensiva", 1, "Daño Agilidad", "5.0x", 80000, 250],
    ["AGI_067", "Corte Temporal", "Legendaria", "Ofensiva", 2, "Daño Agilidad", "5.5x", 90000, 280],
    ["AGI_068", "Cero Absoluto", "Legendaria", "Ofensiva", 2, "Daño Agilidad", "6.0x", 110000, 320],
    ["AGI_069", "Parpadeo Estelar", "Legendaria", "Ofensiva", 1, "Daño Agilidad", "4.8x", 70000, 220],
    ["AGI_070", "Asalto Final", "Legendaria", "Ofensiva", 3, "Daño Agilidad", "7.0x", 150000, 450],

    // DEFENSA (DEF)
    ["DEF_071", "Placa de Zinc", "Común", "Defensiva", 1, "Escudo Defensa", "1.1x", 200, 0],
    ["DEF_072", "Muro de Chatarra", "Común", "Defensiva", 1, "Escudo Defensa", "1.1x", 220, 0],
    ["DEF_073", "Capa Base", "Común", "Defensiva", 1, "Escudo Defensa", "1.2x", 250, 0],
    ["DEF_074", "Revestimiento", "Común", "Defensiva", 1, "Escudo Defensa", "1.2x", 280, 0],
    ["DEF_075", "Escudo de Cobre", "Común", "Defensiva", 1, "Escudo Defensa", "1.3x", 300, 0],
    ["DEF_076", "Pantalla de Bits", "Común", "Defensiva", 1, "Escudo Defensa", "1.3x", 330, 0],
    ["DEF_077", "Refuerzo de Acero", "Común", "Defensiva", 2, "Escudo Defensa", "1.6x", 450, 0],
    ["DEF_078", "Valla Electrizada", "Común", "Defensiva", 1, "Escudo Defensa", "1.4x", 400, 0],
    ["DEF_079", "Caparazón", "Común", "Defensiva", 1, "Escudo Defensa", "1.2x", 250, 0],
    ["DEF_080", "Guardia Simple", "Común", "Defensiva", 1, "Escudo Defensa", "1.1x", 200, 0],
    ["DEF_081", "Armadura de Iones", "Rara", "Defensiva", 1, "Escudo Defensa", "2.0x", 2000, 12],
    ["DEF_082", "Espejo de Energía", "Rara", "Defensiva", 1, "Escudo Defensa", "2.1x", 2200, 13],
    ["DEF_083", "Campo de Fuerza", "Rara", "Defensiva", 2, "Escudo Defensa", "2.5x", 2800, 18],
    ["DEF_084", "Blindaje T1", "Rara", "Defensiva", 1, "Escudo Defensa", "2.2x", 2400, 14],
    ["DEF_085", "Muro de Plasma", "Rara", "Defensiva", 1, "Escudo Defensa", "2.3x", 2600, 16],
    ["DEF_086", "Cúpula Delta", "Rara", "Defensiva", 2, "Escudo Defensa", "2.7x", 3500, 22],
    ["DEF_087", "Aura de Zinc", "Rara", "Defensiva", 1, "Escudo Defensa", "2.1x", 2200, 13],
    ["DEF_088", "Escudo de Carbón", "Rara", "Defensiva", 1, "Escudo Defensa", "2.2x", 2400, 14],
    ["DEF_089", "Capa Reflectante", "Rara", "Defensiva", 2, "Escudo Defensa", "2.6x", 3200, 20],
    ["DEF_090", "Bloqueo Cyber", "Rara", "Defensiva", 1, "Escudo Defensa", "1.9x", 1900, 11],
    ["DEF_091", "Fortaleza Digital", "Épica", "Defensiva", 2, "Escudo Defensa", "3.5x", 10000, 45],
    ["DEF_092", "Blindaje Mecha", "Épica", "Defensiva", 2, "Escudo Defensa", "3.8x", 12000, 50],
    ["DEF_093", "Bastión de Iones", "Épica", "Defensiva", 2, "Escudo Defensa", "3.6x", 11000, 48],
    ["DEF_094", "Escudo Titán", "Épica", "Defensiva", 3, "Escudo Defensa", "4.5x", 18000, 75],
    ["DEF_095", "Capa de Fotones", "Épica", "Defensiva", 2, "Escudo Defensa", "3.7x", 11500, 49],
    ["DEF_096", "Matriz de Defensa", "Épica", "Defensiva", 2, "Escudo Defensa", "3.4x", 9500, 42],
    ["DEF_097", "Refugio de Bits", "Épica", "Defensiva", 1, "Escudo Defensa", "2.8x", 8000, 35],
    ["DEF_098", "Guardián de Red", "Épica", "Defensiva", 2, "Escudo Defensa", "3.9x", 13000, 55],
    ["DEF_099", "Escudo Gravitatorio", "Épica", "Defensiva", 2, "Escudo Defensa", "4.0x", 14000, 60],
    ["DEF_100", "Protección Alpha", "Épica", "Defensiva", 3, "Escudo Defensa", "4.8x", 20000, 85],
    ["DEF_101", "Búnker de Iones", "Legendaria", "Defensiva", 2, "Escudo Defensa", "5.5x", 70000, 220],
    ["DEF_102", "Inmunidad Total", "Legendaria", "Defensiva", 3, "Escudo Defensa", "6.5x", 90000, 280],
    ["DEF_103", "Escudo Ancestral", "Legendaria", "Defensiva", 3, "Escudo Defensa", "6.0x", 85000, 260],
    ["DEF_104", "Fortaleza Divina", "Legendaria", "Defensiva", 4, "Escudo Defensa", "8.0x", 150000, 450],
    ["DEF_105", "Capa de Eternidad", "Legendaria", "Defensiva", 2, "Escudo Defensa", "5.0x", 65000, 200],

    // TÁCTICAS Y MEJORAS (TAC)
    ["TAC_106", "Reinicio Rápido", "Común", "Táctica", 0, "+1 Energía", "1", 300, 0],
    ["TAC_107", "Scan de Datos", "Común", "Táctica", 0, "Roba 1 carta", "1", 300, 0],
    ["TAC_108", "Pulso Binario", "Común", "Táctica", 1, "+1 Energía", "1", 400, 0],
    ["TAC_109", "Enlace de Red", "Común", "Táctica", 1, "Roba 1 carta", "1", 400, 0],
    ["TAC_110", "Carga de Batería", "Común", "Táctica", 1, "+2 Energía", "2", 600, 0],
    ["TAC_111", "Optimización", "Común", "Táctica", 0, "Filtra mano", "1", 300, 0],
    ["TAC_112", "Buffer de Datos", "Común", "Táctica", 1, "+1 Energía", "1", 400, 0],
    ["TAC_113", "Cache Limpia", "Común", "Táctica", 0, "Roba 1 carta", "1", 300, 0],
    ["TAC_114", "Señal Estable", "Común", "Táctica", 1, "+1 Energía", "1", 400, 0],
    ["TAC_115", "Ping de Enlace", "Común", "Táctica", 0, "Roba 1 carta", "1", 300, 0],
    ["TAC_116", "Lámpara de Luz", "Rara", "Mejora", 1, "+20 Agilidad", "20", 2500, 15],
    ["TAC_117", "Aceite Turbo", "Rara", "Mejora", 1, "+15 Agilidad", "15", 2000, 12],
    ["TAC_118", "Núcleo de Poder", "Rara", "Mejora", 1, "+15 Fuerza", "15", 2000, 12],
    ["TAC_119", "Supercarga", "Rara", "Mejora", 2, "+25 Fuerza", "25", 3000, 18],
    ["TAC_120", "Placas de Cromo", "Rara", "Mejora", 1, "+15 Defensa", "15", 2000, 12],
    ["TAC_121", "Refuerzo Mecha", "Rara", "Mejora", 2, "+25 Defensa", "25", 3000, 18],
    ["TAC_122", "Visión Térmica", "Rara", "Mejora", 1, "+10% Crítico", "10", 2500, 15],
    ["TAC_123", "Sensor Proximidad", "Rara", "Mejora", 1, "+15% Evasión", "15", 2800, 18],
    ["TAC_124", "Batería Solar", "Rara", "Táctica", 0, "+2 Energía", "2", 2200, 14],
    ["TAC_125", "Disco Externo", "Rara", "Táctica", 1, "Roba 2 cartas", "2", 1800, 10],
    ["TAC_126", "Sobrecarga Núcleo", "Épica", "Mejora", 2, "+40% Fuerza", "0.4x", 14000, 55],
    ["TAC_127", "Modo Overclock", "Épica", "Mejora", 2, "+40% Agilidad", "0.4x", 14000, 55],
    ["TAC_128", "Protocolo Muro", "Épica", "Mejora", 2, "+40% Defensa", "0.4x", 14000, 55],
    ["TAC_129", "Hacker de Almas", "Épica", "Táctica", 2, "Roba Legendaria", "1", 25000, 100],
    ["TAC_130", "Virus de Energía", "Épica", "Táctica", 1, "-2 Energía Riva", "2", 12000, 45],
    ["TAC_131", "Robar Paquete", "Épica", "Táctica", 1, "Roba 3 cartas", "3", 10000, 40],
    ["TAC_132", "Sinergia Total", "Épica", "Mejora", 3, "+20% Todo", "0.2x", 20000, 80],
    ["TAC_133", "Desfragmentar", "Épica", "Táctica", 0, "+2 Energía", "2", 12000, 45],
    ["TAC_134", "Firewall Humano", "Épica", "Mejora", 2, "Inmune Debuffs", "1", 15000, 60],
    ["TAC_135", "Código Limpio", "Épica", "Táctica", 1, "+3 Energía", "3", 18000, 75],
    ["TAC_136", "Protocolo Dios", "Legendaria", "Táctica", 0, "Mano Llena", "5", 150000, 500],
    ["TAC_137", "Energía Infinita", "Legendaria", "Táctica", 0, "Energía Inf. 1T", "99", 200000, 650],
    ["TAC_138", "Omnisciencia", "Legendaria", "Táctica", 1, "Mira mano rival", "1", 100000, 350],
    ["TAC_139", "Reescritura", "Legendaria", "Táctica", 2, "Cambia cartas", "1", 120000, 400],
    ["TAC_140", "Singularidad", "Legendaria", "Táctica", 3, "Anula turno riv", "1", 180000, 600],

    // ESPECIALES Y DEBUFFS (SPC)
    ["SPC_141", "Pulso Débil", "Común", "Debuff", 1, "-10% Fuerza", "0.1x", 250, 0],
    ["SPC_142", "Micro-Virus", "Común", "Debuff", 1, "-10% Agilidad", "0.1x", 250, 0],
    ["SPC_143", "Humo", "Común", "Debuff", 1, "-10% Puntería", "0.1x", 250, 0],
    ["SPC_144", "Ruido de Fondo", "Común", "Debuff", 1, "-5% Todo", "0.05x", 300, 0],
    ["SPC_145", "Ralentizar", "Común", "Debuff", 1, "-15% Agilidad", "0.15x", 350, 0],
    ["SPC_146", "Drenaje Simple", "Común", "Debuff", 2, "-5 HP", "5", 400, 0],
    ["SPC_147", "Interferencia", "Común", "Debuff", 1, "-10% Defensa", "0.1x", 300, 0],
    ["SPC_148", "Grasa de Motor", "Común", "Debuff", 1, "-20% Agilidad", "0.2x", 450, 0],
    ["SPC_149", "Cortocircuito", "Común", "Debuff", 1, "-15% Fuerza", "0.15x", 400, 0],
    ["SPC_150", "Fallo de Sistema", "Común", "Debuff", 1, "-10% Todo", "0.1x", 500, 0],
    ["SPC_151", "Grilletes Poder", "Rara", "Debuff", 2, "-30% FRZ/AGI", "0.3x", 3000, 20],
    ["SPC_152", "Óxido Corrosivo", "Rara", "Debuff", 2, "-30% Defensa", "0.3x", 2500, 15],
    ["SPC_153", "Espina Digital", "Rara", "Debuff", 1, "-20 HP", "20", 2800, 18],
    ["SPC_154", "Virus Troyano", "Rara", "Debuff", 2, "-2 Energía Riva", "2", 3500, 22],
    ["SPC_155", "Mal funcionamiento", "Rara", "Debuff", 2, "-40% Fuerza", "0.4x", 3200, 20],
    ["SPC_156", "Lluvia Ácida", "Rara", "Debuff", 2, "-40% Defensa", "0.4x", 3200, 20],
    ["SPC_157", "Parálisis Neón", "Rara", "Debuff", 2, "Aturdir 1 turno", "1", 5000, 35],
    ["SPC_158", "Drenaje de Vida", "Rara", "Debuff", 2, "Roba 15 HP", "15", 4000, 28],
    ["SPC_159", "Cadenas de Datos", "Rara", "Debuff", 1, "-50% Agilidad", "0.5x", 3800, 25],
    ["SPC_160", "Debilidad Mental", "Rara", "Debuff", 2, "-50% Fuerza", "0.5x", 3800, 25],
    ["SPC_161", "Inyección Nano", "Épica", "Médica", 1, "Cura 40% HP", "0.4x", 18000, 70],
    ["SPC_162", "Kit de Reparación", "Épica", "Médica", 2, "Cura 60% HP", "0.6x", 25000, 95],
    ["SPC_163", "Purga de Virus", "Épica", "Médica", 1, "Limpia Debuffs", "1", 15000, 60],
    ["SPC_164", "Restaurar Núcleo", "Épica", "Médica", 3, "Cura 100% HP", "1.0x", 45000, 150],
    ["SPC_165", "Prisión de Datos", "Épica", "Debuff", 2, "-50% Daño rival", "0.5x", 22000, 85],
    ["SPC_166", "Plaga Cyber", "Épica", "Debuff", 2, "Daño progresivo", "10", 20000, 80],
    ["SPC_167", "Agujero Negro", "Épica", "Debuff", 3, "Elimina mano riv", "5", 30000, 120],
    ["SPC_168", "Cortafuegos Riva", "Épica", "Debuff", 2, "Rival no Escudo", "1", 18000, 75],
    ["SPC_169", "Sobrecarga Riva", "Épica", "Debuff", 2, "Rival + Daño rec", "0.2x", 19000, 78],
    ["SPC_170", "Sed de Sangre", "Épica", "Debuff", 2, "Roba 40 HP", "40", 28000, 110],
    ["SPC_171", "Espejo Pasado", "Legendaria", "Especial", 2, "Copia última", "1", 100000, 400],
    ["SPC_172", "Virus Oblivion", "Legendaria", "Debuff", 3, "Salta 2 turnos", "2", 140000, 480],
    ["SPC_173", "Cero Absoluto", "Legendaria", "Debuff", 3, "Congela rival", "1", 130000, 450],
    ["SPC_174", "Reset de Fábrica", "Legendaria", "Especial", 3, "Stats a base", "1", 150000, 550],
    ["SPC_175", "Agonía Eterna", "Legendaria", "Debuff", 2, "Rival HP a 1", "1", 250000, 900],

    // EVOLUCIÓN (EVO)
    ["EVO_176", "Chip Evolutivo v1", "Rara", "Evolutiva", 0, "Evolución E2", "1", 5000, 25],
    ["EVO_177", "Chip Evolutivo v2", "Épica", "Evolutiva", 0, "Evolución E3", "1", 25000, 100],
    ["EVO_178", "Núcleo Mutante", "Legendaria", "Evolutiva", 0, "Evolución E4", "1", 100000, 500],
    ["EVO_179", "Catalizador Neón", "Rara", "Evolutiva", 0, "Acelera Evo", "0.2x", 4000, 20],
    ["EVO_180", "Inyección Alpha", "Épica", "Evolutiva", 0, "Acelera Evo", "0.5x", 15000, 60],

    // UTILIDADES (UTL)
    ["UTL_181", "Batería Extra", "Común", "Especial", 1, "+1 Energía", "1", 500, 0],
    ["UTL_182", "Capacitor", "Común", "Especial", 1, "+1 Energía", "1", 550, 0],
    ["UTL_183", "Lector CD", "Común", "Especial", 1, "Roba 1 carta", "1", 600, 0],
    ["UTL_184", "Antena WiFi", "Común", "Especial", 1, "Roba 1 carta", "1", 650, 0],
    ["UTL_185", "Cable USB", "Común", "Especial", 1, "+1 Energía", "1", 700, 0],
    ["UTL_186", "Router", "Rara", "Especial", 2, "Roba 2 cartas", "2", 2500, 15],
    ["UTL_187", "Repetidor", "Rara", "Especial", 2, "+2 Energía", "2", 3000, 18],
    ["UTL_188", "Disco Duro", "Rara", "Especial", 2, "+2 cartas", "2", 2800, 16],
    ["UTL_189", "RAM 8GB", "Rara", "Especial", 1, "Filtra 3 cartas", "3", 2200, 14],
    ["UTL_190", "Procesador i3", "Rara", "Especial", 2, "+2 Energía", "2", 3500, 20],
    ["UTL_191", "GPU GTX", "Épica", "Especial", 2, "Daño x2 1T", "1", 20000, 90],
    ["UTL_192", "RAM 32GB", "Épica", "Especial", 1, "Roba 4 cartas", "4", 18000, 80],
    ["UTL_193", "Procesador i9", "Épica", "Especial", 2, "+3 Energía", "3", 25000, 110],
    ["UTL_194", "SSD 2TB", "Épica", "Especial", 0, "Guarda carta", "1", 15000, 70],
    ["UTL_195", "Placa Base X", "Épica", "Especial", 3, "Revive carta", "1", 30000, 130],
    ["UTL_196", "Super Computador", "Legendaria", "Especial", 0, "Energía Máxima", "5", 180000, 700],
    ["UTL_197", "Satélite Privado", "Legendaria", "Especial", 1, "Daño Global", "100", 200000, 800],
    ["UTL_198", "Coche Cyber", "Legendaria", "Especial", 2, "Escape Batalla", "1", 150000, 600],
    ["UTL_199", "IA Autoconsciente", "Legendaria", "Especial", 0, "Gana partida", "1", 999999, 9999],
    ["UTL_200", "El Origen", "Legendaria", "Especial", 0, "Reinicia Todo", "1", 500000, 2000]
  ];

  const formattedCards = cardsRaw.map(c => {
    const valorStr = c[6].toString();
    const isMult = valorStr.includes('x');
    const valorNum = parseFloat(valorStr.replace('x', ''));

    return {
      id: c[0],
      nombre: c[1],
      rareza: c[2],
      tipo: c[3],
      energia: c[4],
      efecto_principal: c[5],
      valor: valorNum,
      is_multiplier: isMult,
      precio_oro: c[7],
      precio_bios: c[8]
    };
  });

  try {
    // Usamos deleteMany antes para limpiar si es necesario, o solo createMany
    const result = await prisma.cardMaster.createMany({
      data: formattedCards,
      skipDuplicates: true
    });
    console.log(`✅ ¡Misión cumplida! Se han inyectado ${result.count} cartas en el sistema.`);
  } catch (error) {
    console.error("❌ Error inyectando cartas:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();