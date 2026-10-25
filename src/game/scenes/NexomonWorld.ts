
import { Scene, GameObjects, Input, Math as PhaserMath } from "phaser";

type Monster = {
    id: string;
    name: string;
    species: string;
    role: string;
    ownerId: string | null;
    position: { x: number; y: number };
    stats: {
        health: number;
        hunger: number;
        energy: number;
        experience: number;
        level: number;
    };
    personality: {
        curiosity: number;
        sociability: number;
        courage: number;
    };
    currentAction: string;
};

type PlayerData = {
    id: string;
    name: string;
    position: { x: number; y: number };
};

type WorldData = {
    id: string;
    name: string;
    monsters: Monster[];
    player: PlayerData;
};

type AgentAction =
    | "exploring"
    | "resting"
    | "socializing"
    | "wandering"
    | "idle";

type AgentDecision = {
    action: "idle" | "explore" | "seek_food" | "rest" | "socialize";
    reasoning: string;
    source?: "game_rules" | "ollama";
};

type Agent = {
    monster: Monster;
    view: GameObjects.Container;
    actionText: GameObjects.Text;
    target: { x: number; y: number };
    action: AgentAction;
    decisionIn: number;
    restFor: number;
    pauseFor: number;
    speed: number;
    decisionPending: boolean;
};

export class NexomonWorld extends Scene {
    private statusText?: GameObjects.Text;
    private statsText?: GameObjects.Text;
    private player?: GameObjects.Container;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys?: Record<string, Input.Keyboard.Key>;

    private obstacles: { x: number; y: number; radius: number }[] = [];

    private playerData?: PlayerData;
    private playerMonster?: Monster;
    private agents: Agent[] = [];
    private lastStatsUpdate = 0;

    private readonly worldWidth = 1024;
    private readonly worldHeight = 768;
    private readonly playerSpeed = 180;

    constructor() {
        super("NexomonWorld");
    }

    create() {
        this.obstacles = [];
        this.agents = [];
        this.player = undefined;
        this.playerData = undefined;
        this.playerMonster = undefined;
        this.lastStatsUpdate = 0;

        this.cameras.main.setBackgroundColor("#b7d7a8");
        this.drawEnvironment();

        this.add.text(24, 18, "NEXOMON", {
            fontSize: "27px",
            color: "#203b2a",
            fontStyle: "bold",
        }).setScrollFactor(0).setDepth(200);

        this.statusText = this.add.text(
            26,
            54,
            "Conectando con el mundo...",
            {
                fontSize: "14px",
                color: "#203b2a",
            }
        ).setScrollFactor(0).setDepth(200);

        this.statsText = this.add.text(
            24,
            650,
            "Cargando estadísticas...",
            {
                fontSize: "15px",
                color: "#203b2a",
                backgroundColor: "#ffffffcc",
                padding: { x: 12, y: 10 },
                lineSpacing: 5,
            }
        ).setScrollFactor(0).setDepth(200);

        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();

            this.keys = this.input.keyboard.addKeys(
                "W,A,S,D"
            ) as Record<string, Input.Keyboard.Key>;
        }

        void this.loadWorld();
    }

    update(time: number, delta: number) {
        this.updatePlayer(time, delta);
        this.updateAgents(delta);
    }

    private drawEnvironment() {
        this.add.rectangle(
            this.worldWidth / 2,
            this.worldHeight / 2,
            this.worldWidth,
            this.worldHeight,
            0xb7d7a8
        );

        this.add.ellipse(
            700,
            400,
            260,
            160,
            0x72b7d8
        );

        const trees = [
            { x: 100, y: 160 },
            { x: 600, y: 140 },
            { x: 850, y: 180 },
            { x: 140, y: 500 },
            { x: 520, y: 560 },
            { x: 920, y: 530 },
        ];

        for (const tree of trees) {
            this.add.rectangle(
                tree.x,
                tree.y + 24,
                10,
                24,
                0x795548
            ).setDepth(tree.y);

            this.add.circle(
                tree.x,
                tree.y,
                28,
                0x39734a
            ).setDepth(tree.y + 1);

            this.obstacles.push({
                x: tree.x,
                y: tree.y + 12,
                radius: 42,
            });
        }
    }

    private async loadWorld() {
        try {
            const response = await fetch("/api/world");

            if (!response.ok) {
                throw new Error(
                    `La API respondió ${response.status}`
                );
            }

            const world = (await response.json()) as WorldData;

            this.playerData = world.player;

            this.playerMonster = world.monsters.find(
                (monster) =>
                    monster.role === "companion" &&
                    monster.ownerId === world.player.id
            );

            if (!this.playerMonster) {
                throw new Error(
                    "No se encontró el Nexomon vinculado al jugador."
                );
            }

            this.createPlayerAvatar(world.player);
            this.drawMonsters(world);

            this.statusText?.setText(
                `${world.name} · ${world.monsters.length} Nexomon`
            );

            this.updateStats();
        } catch (error) {
            console.error("No se pudo cargar el mundo:", error);

            this.statusText?.setText(
                "Error cargando el mundo. Revisa la consola."
            );
        }
    }

    private createPlayerAvatar(playerData: PlayerData) {
        const body = this.add.circle(
            0,
            0,
            15,
            0x3978c5
        ).setStrokeStyle(3, 0xffffff);

        const head = this.add.circle(
            0,
            -20,
            9,
            0xf2c9a5
        ).setStrokeStyle(2, 0xffffff);

        const name = this.add.text(
            0,
            -40,
            playerData.name,
            {
                fontSize: "13px",
                color: "#203b2a",
                fontStyle: "bold",
                backgroundColor: "#ffffff",
                padding: { x: 5, y: 3 },
            }
        ).setOrigin(0.5);

        this.player = this.add.container(
            playerData.position.x,
            playerData.position.y,
            [body, head, name]
        );

        this.player.setDepth(playerData.position.y + 10);
    }

    private drawMonsters(world: WorldData) {
        for (const monster of world.monsters) {
            const { x, y } = monster.position;
            const isCompanion =
                monster.ownerId === world.player.id &&
                monster.role === "companion";

            const body = this.add.circle(
                0,
                0,
                isCompanion ? 20 : 18,
                isCompanion ? 0xffd166 : 0x7768ae
            ).setStrokeStyle(
                isCompanion ? 4 : 3,
                0xffffff
            );

            const name = this.add.text(
                0,
                -42,
                monster.name,
                {
                    fontSize: "15px",
                    color: "#203b2a",
                    fontStyle: "bold",
                    backgroundColor: "#ffffff",
                    padding: { x: 5, y: 3 },
                }
            ).setOrigin(0.5);

            const level = this.add.text(
                0,
                27,
                `Nv. ${monster.stats.level}`,
                {
                    fontSize: "12px",
                    color: "#203b2a",
                }
            ).setOrigin(0.5);

            const actionText = this.add.text(
                0,
                43,
                "Preparándose...",
                {
                    fontSize: "11px",
                    color: "#203b2a",
                    backgroundColor: "#ffffffaa",
                    padding: { x: 3, y: 2 },
                }
            ).setOrigin(0.5);

            const view = this.add.container(
                x,
                y,
                [body, name, level, actionText]
            );

            view.setDepth(y + 10);

            const agent: Agent = {
                monster,
                view,
                actionText,
                target: { x, y },
                action: "wandering",
                decisionIn: 0,
                restFor: 0,
                pauseFor: 0,
                speed: 22 + monster.personality.curiosity * 0.12,
                decisionPending: false,
            };

            this.agents.push(agent);
            this.chooseAgentAction(agent);
        }
    }

    private updatePlayer(time: number, delta: number) {
        if (!this.player || !this.cursors || !this.keys) {
            return;
        }

        let dx = 0;
        let dy = 0;

        if (this.cursors.left.isDown || this.keys.A.isDown) {
            dx -= 1;
        }

        if (this.cursors.right.isDown || this.keys.D.isDown) {
            dx += 1;
        }

        if (this.cursors.up.isDown || this.keys.W.isDown) {
            dy -= 1;
        }

        if (this.cursors.down.isDown || this.keys.S.isDown) {
            dy += 1;
        }

        if (dx !== 0 || dy !== 0) {
            const length = Math.hypot(dx, dy);
            dx /= length;
            dy /= length;

            const distance = this.playerSpeed * delta / 1000;

            const nextX = PhaserMath.Clamp(
                this.player.x + dx * distance,
                24,
                this.worldWidth - 24
            );

            const nextY = PhaserMath.Clamp(
                this.player.y + dy * distance,
                90,
                this.worldHeight - 24
            );

            if (!this.overlapsObstacle(nextX, nextY)) {
                this.player.setPosition(nextX, nextY);
                this.player.setDepth(nextY + 10);

                if (this.playerData) {
                    this.playerData.position.x = nextX;
                    this.playerData.position.y = nextY;
                }
            }
        }

        if (time - this.lastStatsUpdate >= 1000) {
            this.lastStatsUpdate = time;

            if (this.playerMonster) {
                this.playerMonster.stats.energy = Math.max(
                    0,
                    this.playerMonster.stats.energy - 1
                );

                this.playerMonster.stats.hunger = Math.min(
                    100,
                    this.playerMonster.stats.hunger + 1
                );

                this.updateStats();
            }
        }
    }

    private updateAgents(delta: number) {
        const seconds = delta / 1000;

        for (const agent of this.agents) {
            const stats = agent.monster.stats;

            if (agent.pauseFor > 0) {
                agent.pauseFor -= seconds;
                continue;
            }

            if (agent.action === "idle") {
                this.chooseAgentAction(agent);
                continue;
            }

            stats.hunger = Math.min(
                100,
                stats.hunger + seconds * 0.35
            );

            if (agent.action === "resting") {
                stats.energy = Math.min(
                    100,
                    stats.energy + seconds * 8
                );

                agent.restFor -= seconds;

                if (agent.restFor <= 0 || stats.energy >= 90) {
                    this.chooseAgentAction(agent);
                }

                continue;
            }

            if (agent.action === "socializing") {
                const friend = this.findNearestMonster(agent);

                if (friend) {
                    const distance = PhaserMath.Distance.Between(
                        agent.view.x,
                        agent.view.y,
                        friend.x,
                        friend.y
                    );

                    if (distance > 65) {
                        this.moveAgentToward(
                            agent,
                            friend.x,
                            friend.y,
                            delta
                        );
                    } else {
                        stats.energy = Math.max(
                            0,
                            stats.energy - seconds * 0.5
                        );

                        agent.monster.currentAction = "socializing";
                        agent.actionText.setText("Socializando");
                    }
                } else {
                    this.chooseAgentAction(agent);
                }

                agent.decisionIn -= seconds;

                if (agent.decisionIn <= 0) {
                    this.chooseAgentAction(agent);
                }

                continue;
            }

            this.moveAgentToward(
                agent,
                agent.target.x,
                agent.target.y,
                delta
            );

            stats.energy = Math.max(
                0,
                stats.energy - seconds * 1.2
            );

            agent.decisionIn -= seconds;

            const distanceToTarget = PhaserMath.Distance.Between(
                agent.view.x,
                agent.view.y,
                agent.target.x,
                agent.target.y
            );

            if (
                distanceToTarget < 8 ||
                agent.decisionIn <= 0 ||
                stats.energy < 20
            ) {
                if (distanceToTarget < 8) {
                    agent.pauseFor = 2 + Math.random() * 3;
                }

                this.chooseAgentAction(agent);
            }
        }
    }

    private chooseAgentAction(agent: Agent) {
        // En esta primera integración, solo Nex consulta a Qwen3.
        // Los demás Nexomon conservan su comportamiento local actual.
        if (agent.monster.id === this.playerMonster?.id) {
            void this.requestAgentDecision(agent);
            return;
        }

        this.chooseLocalAgentAction(agent);
    }

    private async requestAgentDecision(agent: Agent) {
        if (agent.decisionPending) {
            return;
        }

        agent.decisionPending = true;
        agent.actionText.setText("Pensando...");

        const monster = agent.monster;
        const nearbyEntities = this.agents
            .filter((other) => other !== agent)
            .map((other) => ({
                id: other.monster.id,
                name: other.monster.name,
                type: "nexomon",
                position: {
                    x: other.view.x,
                    y: other.view.y,
                },
                distance: PhaserMath.Distance.Between(
                    agent.view.x,
                    agent.view.y,
                    other.view.x,
                    other.view.y
                ),
            }));

        if (this.player && this.playerData) {
            nearbyEntities.push({
                id: this.playerData.id,
                name: this.playerData.name,
                type: "player",
                position: {
                    x: this.player.x,
                    y: this.player.y,
                },
                distance: PhaserMath.Distance.Between(
                    agent.view.x,
                    agent.view.y,
                    this.player.x,
                    this.player.y
                ),
            } as (typeof nearbyEntities)[number]);
        }

        try {
            const response = await fetch("/api/agents/decide", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    creature: {
                        id: monster.id,
                        name: monster.name,
                        needs: {
                            hunger: monster.stats.hunger,
                            energy: monster.stats.energy,
                        },
                        personality: monster.personality,
                        position: {
                            x: agent.view.x,
                            y: agent.view.y,
                        },
                    },
                    nearbyEntities,
                    availableResources: [],
                    currentAction: monster.currentAction,
                }),
                signal: AbortSignal.timeout(22_000),
            });

            if (!response.ok) {
                throw new Error(`La API respondió ${response.status}`);
            }

            const decision = (await response.json()) as AgentDecision;
            const allowedActions = [
                "idle",
                "explore",
                "seek_food",
                "rest",
                "socialize",
            ];

            if (!allowedActions.includes(decision.action)) {
                throw new Error("La IA devolvió una acción desconocida.");
            }

            this.applyAgentDecision(agent, decision);
        } catch (error) {
            console.error("No se pudo obtener la decisión de Nex:", error);
            agent.actionText.setText("IA no disponible · modo local");
            this.chooseLocalAgentAction(agent);
        } finally {
            agent.decisionPending = false;
        }
    }

    private applyAgentDecision(agent: Agent, decision: AgentDecision) {
        const { monster } = agent;
        const label = decision.source === "game_rules" ? "Reglas" : "Qwen3";

        switch (decision.action) {
            case "rest":
                agent.action = "resting";
                agent.restFor = 3 + Math.random() * 3;
                agent.decisionIn = agent.restFor;
                monster.currentAction = "resting";
                agent.actionText.setText(`Descansando · ${label}`);
                break;

            case "socialize":
                if (this.findNearestMonster(agent)) {
                    agent.action = "socializing";
                    agent.decisionIn = 6 + Math.random() * 3;
                    monster.currentAction = "socializing";
                    agent.actionText.setText(`Socializando · ${label}`);
                } else {
                    this.setExplorationTarget(agent, "Sin compañía · explorando");
                    monster.currentAction = "exploring";
                }
                break;

            case "seek_food":
                // Aún no existen recursos de comida en el mapa: se desplaza
                // buscando alimento, pero no consume ni inventa recursos.
                this.setExplorationTarget(agent, `Buscando alimento · ${label}`);
                monster.currentAction = "seeking_food";
                break;

            case "explore":
                this.setExplorationTarget(agent, `Explorando · ${label}`);
                monster.currentAction = "exploring";
                break;

            case "idle":
                agent.action = "idle";
                agent.pauseFor = 2 + Math.random() * 2;
                agent.decisionIn = agent.pauseFor;
                monster.currentAction = "idle";
                agent.actionText.setText(`En reposo · ${label}`);
                break;
        }
    }

    private setExplorationTarget(agent: Agent, label: string) {
        agent.action = "exploring";

        const margin = 70;
        let target = {
            x: margin + Math.random() * (this.worldWidth - margin * 2),
            y: 100 + Math.random() * (this.worldHeight - 170),
        };

        if (this.overlapsObstacle(target.x, target.y)) {
            target = {
                x: 300 + Math.random() * 350,
                y: 250 + Math.random() * 200,
            };
        }

        agent.target = target;
        agent.decisionIn = 6 + Math.random() * 4;
        agent.actionText.setText(label);
    }

    private chooseLocalAgentAction(agent: Agent) {
        const { monster } = agent;
        const stats = monster.stats;

        const isPrudent = monster.personality.courage < 40;

        if (stats.energy < (isPrudent ? 65 : 25)) {
            agent.action = "resting";
            agent.restFor = 2 + Math.random() * 3;
            agent.actionText.setText("Descansando");
            monster.currentAction = "resting";
            return;
        }

        if (stats.hunger > 75) {
            agent.action = "exploring";
            agent.target = {
                x: 180 + Math.random() * 350,
                y: 200 + Math.random() * 220,
            };
            agent.decisionIn = 5 + Math.random() * 4;
            agent.actionText.setText("Buscando alimento");
            monster.currentAction = "seeking_food";
            return;
        }

        if (
            monster.personality.sociability > 65 &&
            Math.random() < 0.2
        ) {
            agent.action = "socializing";
            agent.decisionIn = 6 + Math.random() * 4;
            agent.actionText.setText("Buscando compañía");
            monster.currentAction = "socializing";
            return;
        }

        agent.action =
            monster.personality.curiosity > 65
                ? "exploring"
                : "wandering";

        const margin = 70;

        agent.target = {
            x: margin + Math.random() * (this.worldWidth - margin * 2),
            y: 100 + Math.random() * (this.worldHeight - 170),
        };

        if (this.overlapsObstacle(agent.target.x, agent.target.y)) {
            agent.target.x = 300 + Math.random() * 350;
            agent.target.y = 250 + Math.random() * 200;
        }

        agent.decisionIn = 6 + Math.random() * 5;

        agent.actionText.setText(
            agent.action === "exploring"
                ? "Explorando"
                : "Paseando"
        );

        monster.currentAction = agent.action;
    }

    private moveAgentToward(
        agent: Agent,
        targetX: number,
        targetY: number,
        delta: number
    ) {
        const dx = targetX - agent.view.x;
        const dy = targetY - agent.view.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 1) {
            return;
        }

        const step = Math.min(
            agent.speed * delta / 1000,
            distance
        );

        const nextX = agent.view.x + (dx / distance) * step;
        const nextY = agent.view.y + (dy / distance) * step;

        const boundedX = PhaserMath.Clamp(
            nextX,
            24,
            this.worldWidth - 24
        );

        const boundedY = PhaserMath.Clamp(
            nextY,
            90,
            this.worldHeight - 24
        );

        if (!this.overlapsObstacle(boundedX, boundedY)) {
            agent.view.setPosition(boundedX, boundedY);
            agent.view.setDepth(boundedY + 10);

            agent.monster.position.x = boundedX;
            agent.monster.position.y = boundedY;
        } else {
            agent.decisionIn = 0;
        }
    }

    private findNearestMonster(agent: Agent) {
        let nearest: GameObjects.Container | undefined;
        let shortestDistance = Infinity;

        const candidates = [
            ...(this.player ? [this.player] : []),
            ...this.agents
                .filter((other) => other !== agent)
                .map((other) => other.view),
        ];

        for (const candidate of candidates) {
            const distance = PhaserMath.Distance.Between(
                agent.view.x,
                agent.view.y,
                candidate.x,
                candidate.y
            );

            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearest = candidate;
            }
        }

        return nearest;
    }

    private overlapsObstacle(x: number, y: number) {
        return this.obstacles.some((tree) =>
            PhaserMath.Distance.Between(
                x,
                y,
                tree.x,
                tree.y
            ) < tree.radius
        );
    }

    private updateStats() {
        const stats = this.playerMonster?.stats;

        if (!stats) {
            return;
        }

        this.statsText?.setText(
            `NEX · Nivel ${stats.level}\n` +
            `Salud: ${stats.health}/100\n` +
            `Hambre: ${Math.round(stats.hunger)}/100\n` +
            `Energía: ${Math.round(stats.energy)}/100\n` +
            `Vínculo: Nex es tu compañero\n` +
            `Controles: WASD o flechas`
        );
    }
}
