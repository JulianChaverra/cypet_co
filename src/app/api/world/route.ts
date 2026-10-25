
import { NextResponse } from "next/server";

export async function GET() {
    const world = {
        id: "nexomon-world-001",
        name: "Bosque del Despertar",
        version: 1,
        time: {
            day: 1,
            hour: 8,
        },
        environment: {
            weather: "sunny",
            biome: "forest",
        },
        player: {
            id: "player-001",
            name: "Entrenador",
            position: { x: 320, y: 300 },
        },
        resources: [
            { id: "berry-001", type: "berry", x: 180, y: 220 },
            { id: "berry-002", type: "berry", x: 420, y: 350 },
            { id: "stone-001", type: "stone", x: 550, y: 180 },
        ],
        monsters: [
            {
                id: "player-monster",
                name: "Nex",
                species: "sprout",
                role: "companion",
                ownerId: "player-001",
                position: { x: 320, y: 240 },
                stats: {
                    health: 100,
                    hunger: 20,
                    energy: 100,
                    experience: 0,
                    level: 1,
                },
                personality: {
                    curiosity: 80,
                    sociability: 60,
                    courage: 50,
                },
                currentAction: "exploring",
            },
            {
                id: "npc-explorer",
                name: "Kiro",
                species: "foxling",
                role: "npc",
                ownerId: null,
                position: { x: 180, y: 160 },
                stats: {
                    health: 100,
                    hunger: 30,
                    energy: 85,
                    experience: 0,
                    level: 1,
                },
                personality: {
                    curiosity: 90,
                    sociability: 40,
                    courage: 80,
                },
                currentAction: "exploring",
            },
            {
                id: "npc-cautious",
                name: "Muna",
                species: "mosskin",
                role: "npc",
                ownerId: null,
                position: { x: 460, y: 280 },
                stats: {
                    health: 100,
                    hunger: 15,
                    energy: 70,
                    experience: 0,
                    level: 1,
                },
                personality: {
                    curiosity: 35,
                    sociability: 50,
                    courage: 25,
                },
                currentAction: "resting",
            },
            {
                id: "npc-social",
                name: "Tiko",
                species: "bunbit",
                role: "npc",
                ownerId: null,
                position: { x: 350, y: 420 },
                stats: {
                    health: 100,
                    hunger: 25,
                    energy: 90,
                    experience: 0,
                    level: 1,
                },
                personality: {
                    curiosity: 60,
                    sociability: 95,
                    courage: 55,
                },
                currentAction: "socializing",
            },
        ],
    };

    return NextResponse.json(world);
}
