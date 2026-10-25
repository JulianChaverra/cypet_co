
export type NexomonActionType =
  | "idle"
  | "move_to"
  | "seek_food"
  | "eat"
  | "rest"
  | "socialize"
  | "explore";

export interface Position {
  x: number;
  y: number;
}

export interface NexomonNeeds {
  hunger: number;
  energy: number;
}

export interface NexomonPersonality {
  curiosity: number;
  courage: number;
  sociability: number;
}

export interface WorldEntity {
  id: string;
  name: string;
  position: Position;
  distance?: number;
  type: "player" | "nexomon" | "resource";
}

export interface NexomonObservation {
  creature: {
    id: string;
    name: string;
    position: Position;
    needs: NexomonNeeds;
    personality: NexomonPersonality;
  };
  nearbyEntities: WorldEntity[];
  currentAction: NexomonActionType;
}

export interface NexomonDecision {
  action: NexomonActionType;
  targetPosition?: Position;
  targetId?: string;
  reasoning: string;
}

export interface NexomonAgent {
  decide(
    observation: NexomonObservation
  ): Promise<NexomonDecision>;
}
