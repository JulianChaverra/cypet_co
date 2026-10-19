import { prisma } from '@/lib/prisma';

export async function grantStarterDeck(userId) {
  try {
    console.log(`🎴 Generando mazo inicial para el usuario: ${userId}`);

    // 1. Obtener todas las cartas que son de rareza "Común"
    const commonCards = await prisma.cardMaster.findMany({
      where: { rareza: "Común" }
    });

    if (commonCards.length === 0) {
      throw new Error("No se encontraron cartas Comunes en la base de datos. ¿Corriste el seed?");
    }

    // 2. Barajar (Shuffle) y seleccionar las primeras 20
    const shuffled = commonCards.sort(() => 0.5 - Math.random());
    const selectedCards = shuffled.slice(0, 20);

    // 3. Crear los registros en el inventario del usuario (UserCard)
    // Usamos un loop o un createMany. createMany es más eficiente.
    const deckData = selectedCards.map(card => ({
      userId: userId,
      cardId: card.id,
      cantidad: 1,
      en_mazo: true // Las marcamos en el mazo por defecto para que pueda jugar ya
    }));

    const result = await prisma.userCard.createMany({
      data: deckData,
      skipDuplicates: true // Por si acaso ya tenía alguna
    });

    console.log(`✅ Mazo inicial entregado: ${result.count} cartas añadidas.`);
    return result;

  } catch (error) {
    console.error("❌ Error al entregar mazo inicial:", error);
    throw error;
  }
}