
import type {
  NexomonAgent,
  NexomonDecision,
  NexomonObservation,
} from "./contracts";

export class MockNexomonAgent implements NexomonAgent {
  async decide(
    observation: NexomonObservation
  ): Promise<NexomonDecision> {
    const { creature } = observation;

    if (creature.needs.energy < 20) {
      return {
        action: "rest",
        reasoning: "Necesito recuperar energía.",
      };
    }

    if (creature.needs.hunger > 75) {
      return {
        action: "seek_food",
        reasoning: "Tengo hambre y necesito encontrar alimento.",
      };
    }

    const nearbyNexomon = observation.nearbyEntities.find(
      (entity) =>
        entity.type === "nexomon" &&
        entity.distance !== undefined &&
        entity.distance < 100
    );

    if (
      creature.personality.sociability > 65 &&
      nearbyNexomon
    ) {
      return {
        action: "socialize",
        targetId: nearbyNexomon.id,
        reasoning: "Quiero interactuar con otra criatura.",
      };
    }

    return {
      action: "explore",
      reasoning: "Quiero explorar mi entorno.",
    };
  }
}
