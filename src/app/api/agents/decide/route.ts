
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = [
  "idle",
  "explore",
  "seek_food",
  "rest",
  "socialize",
] as const;

type NexomonAction = (typeof ACTIONS)[number];

interface NexomonNeeds {
  hunger: number;
  energy: number;
}

interface NexomonObservation {
  creature: {
    id: string;
    name: string;
    needs: NexomonNeeds;
    personality?: {
      curiosity?: number;
      courage?: number;
      sociability?: number;
    };
    position?: {
      x: number;
      y: number;
    };
  };
  nearbyEntities?: unknown[];
  availableResources?: unknown[];
  currentAction?: string;
  [key: string]: unknown;
}

interface NexomonDecision {
  action: NexomonAction;
  reasoning: string;
  source?: "game_rules" | "ollama";
}

const responseSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: [...ACTIONS],
    },
    reasoning: {
      type: "string",
    },
  },
  required: ["action", "reasoning"],
  additionalProperties: false,
};

function isValidNeeds(needs: unknown): needs is NexomonNeeds {
  if (!needs || typeof needs !== "object") return false;

  const values = needs as Record<string, unknown>;

  return (
    typeof values.hunger === "number" &&
    Number.isFinite(values.hunger) &&
    values.hunger >= 0 &&
    values.hunger <= 100 &&
    typeof values.energy === "number" &&
    Number.isFinite(values.energy) &&
    values.energy >= 0 &&
    values.energy <= 100
  );
}

function getPriorityAction(
  hunger: number,
  energy: number
): NexomonAction | null {
  if (hunger >= 90) return "seek_food";
  if (energy < 20) return "rest";
  if (hunger >= 75) return "seek_food";
  return null;
}

function isValidDecision(
  value: unknown
): value is { action: NexomonAction; reasoning: string } {
  if (!value || typeof value !== "object") return false;

  const decision = value as Record<string, unknown>;

  return (
    typeof decision.action === "string" &&
    ACTIONS.includes(decision.action as NexomonAction) &&
    typeof decision.reasoning === "string"
  );
}

function parseDecision(content: string): unknown {
  // Primero intentamos analizar la respuesta completa.
  try {
    return JSON.parse(content);
  } catch {
    // Si el modelo añadió texto o Markdown, intentamos extraer el JSON.
  }

  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Último intento: extraer el objeto JSON de la respuesta.
  }

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      // La respuesta no contiene un objeto JSON válido.
    }
  }

  throw new Error(
    `JSON inválido de Ollama. Respuesta recibida: ${content.slice(0, 1000)}`
  );
}

export async function POST(request: Request) {
  try {
    let observation: NexomonObservation;

    try {
      observation = await request.json();
    } catch {
      return NextResponse.json(
        { error: "El cuerpo de la petición no contiene JSON válido." },
        { status: 400 }
      );
    }

    if (
      !observation ||
      typeof observation !== "object" ||
      !observation.creature ||
      typeof observation.creature !== "object"
    ) {
      return NextResponse.json(
        { error: "La observación del Nexomon no es válida." },
        { status: 400 }
      );
    }

    const creature = observation.creature;

    if (!isValidNeeds(creature.needs)) {
      return NextResponse.json(
        {
          error:
            "Las necesidades deben incluir hambre y energía entre 0 y 100.",
        },
        { status: 400 }
      );
    }

    const { hunger, energy } = creature.needs;
    const priorityAction = getPriorityAction(hunger, energy);

    if (priorityAction) {
      const decision: NexomonDecision = {
        action: priorityAction,
        reasoning:
          "Acción prioritaria determinada por las reglas de supervivencia.",
        source: "game_rules",
      };

      return NextResponse.json(decision);
    }

    const ollamaResponse = await fetch(
      "http://127.0.0.1:11434/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen3:4b",
          think: false,
          messages: [
            {
              role: "system",
              content: [
                "Eres el agente autónomo de un Nexomon en un videojuego.",
                "Decide su siguiente acción según sus necesidades, personalidad y observación del mundo.",
                "Acciones permitidas: idle, explore, seek_food, rest, socialize.",
                "No inventes entidades ni recursos que no aparezcan en la observación.",
                "Devuelve únicamente un objeto JSON con las propiedades action y reasoning.",
              ].join(" "),
            },
            {
              role: "user",
              content: JSON.stringify(observation),
            },
          ],
          format: responseSchema,
          stream: false,
          options: {
            temperature: 0,
            num_predict: 250,
          },
          keep_alive: "5m",
        }),
        signal: AbortSignal.timeout(25_000),
      }
    );

    if (!ollamaResponse.ok) {
      const details = await ollamaResponse.text();

      console.error(
        "[Nexomon] Ollama respondió con error:",
        ollamaResponse.status,
        details.slice(0, 1000)
      );

      return NextResponse.json(
        { error: "Ollama no pudo generar una decisión." },
        { status: 502 }
      );
    }

    const result = await ollamaResponse.json();
    const content = result?.message?.content;

    if (typeof content !== "string" || content.trim() === "") {
      console.error(
        "[Nexomon] Respuesta vacía o inesperada de Ollama:",
        JSON.stringify(result).slice(0, 1500)
      );

      return NextResponse.json(
        { error: "Ollama devolvió una respuesta vacía." },
        { status: 502 }
      );
    }

    let parsedDecision: unknown;

    try {
      parsedDecision = parseDecision(content);
    } catch (error) {
      console.error(
        "[Nexomon] No se pudo analizar la decisión:",
        error instanceof Error ? error.message : error
      );

      return NextResponse.json(
        { error: "Ollama no devolvió una decisión JSON válida." },
        { status: 502 }
      );
    }

    if (!isValidDecision(parsedDecision)) {
      console.error(
        "[Nexomon] Decisión con estructura o acción inválida:",
        JSON.stringify(parsedDecision).slice(0, 1000)
      );

      return NextResponse.json(
        { error: "Ollama devolvió una acción no permitida." },
        { status: 502 }
      );
    }

    const decision: NexomonDecision = {
      action: parsedDecision.action,
      reasoning: parsedDecision.reasoning,
      source: "ollama",
    };

    return NextResponse.json(decision);
  } catch (error) {
    console.error("[Nexomon] Error al decidir la acción:", error);

    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    return NextResponse.json(
      {
        error: isTimeout
          ? "Ollama tardó demasiado en responder."
          : "No fue posible obtener una decisión del agente.",
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
