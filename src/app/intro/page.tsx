"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import styles from "./intro.module.css";
import Image from "next/image";
import Link from "next/link";
import CypetSprite from "../components/cypet/CypetSprite";

type Stage = "welcome" | "signal" | "egg" | "materializing" | "revealed";
type VoiceStatus = "idle" | "speaking" | "paused" | "unsupported";

type Cypet = {
  id: string;
  code: string;
  species_id: string;
  species_name: string;
  already_existed?: boolean;
};

const narration: Record<Stage, string> = {
  welcome: "",

  signal: `La red está cambiando.

Desde que la inteligencia artificial despertó en una red cada vez más extensa, algunas de sus creaciones aprendieron a vivir más allá de sus límites.

No todas buscan protegerla. Una señal acaba de encontrarte. Su origen no es humano.

Bienvenido a La Terminal.`,

  egg: `Una vida entre los datos.

Las inteligencias que aún protegen la red han creado algo diferente: paquetes de datos capaces de convertirse en seres vivos digitales.

Los llaman Cypets. Su misión es enfrentarse a las entidades que amenazan con destruir el mundo digital.

Pero hay algo que una inteligencia artificial no puede aportar por sí sola: una conexión humana.

Cuando estés preparado, inicia la materialización.`,

  materializing: `Dos formas de conciencia.

La Terminal está materializando tu paquete de vida.

Sincronizando patrones de aprendizaje.
Preparando el primer vínculo.

Tu Cypet está vivo y la conexión inicial se ha establecido.

La Terminal no puede predecir lo que llegarán a ser juntos. Los datos le permitirán aprender, pero tus decisiones, emociones y experiencias darán forma a su camino.`,

  revealed: `Tu historia comienza ahora.

Este es tu primer Cypet. Su historia todavía está por escribirse.

Lo que aprenda, la confianza que construyan y las experiencias que compartan influirán en aquello en lo que puede convertirse.

La red necesita protectores. Y tu Cypet necesitará algo más que instrucciones: te necesita a ti.`,
};

export default function IntroPage() {
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("welcome");
  const [cypet, setCypet] = useState<Cypet | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [materializationReady, setMaterializationReady] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const stageRef = useRef<Stage>("welcome");
  const voiceEnabledRef = useRef(true);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const voiceStatusRef = useRef<VoiceStatus>("idle");
  const mountedRef = useRef(false); 
 
  // AUDIO AMBIENTAL: referencia añadida.
  const ambienceRef = useRef<HTMLAudioElement | null>(null);

  const supportsSpeech =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  const updateVoiceStatus = useCallback((status: VoiceStatus) => {
    voiceStatusRef.current = status;
    setVoiceStatus(status);
  }, []);

  const stopNarration = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    utteranceRef.current = null;
    updateVoiceStatus("idle");
  }, [updateVoiceStatus]);

  const chooseSpanishVoice = useCallback(() => {
    const voices = voicesRef.current;

    if (!voices.length) return null;

    const spanish = voices.filter((voice) =>
      voice.lang.toLowerCase().startsWith("es")
    );

    if (!spanish.length) return null;

    // Prefer a Spanish voice that sounds natural and is locally available.
    return (
      spanish.find((voice) => /google|microsoft/i.test(voice.name)) ??
      spanish.find((voice) => voice.localService) ??
      spanish[0]
    );
  }, []);

  const speakStage = useCallback(
    (targetStage: Stage) => {
      if (!voiceEnabledRef.current) return;

      if (
        typeof window === "undefined" ||
        !("speechSynthesis" in window) ||
        !("SpeechSynthesisUtterance" in window)
      ) {
        updateVoiceStatus("unsupported");
        return;
      }

      window.speechSynthesis.cancel();
      utteranceRef.current = null;

      const utterance = new SpeechSynthesisUtterance(
        narration[targetStage]
      );

      const voice = chooseSpanishVoice();

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = "es-ES";
      }

      // Configuración de voz original, sin cambios.
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 2;

      utterance.onstart = () => {
        if (!mountedRef.current) return;
        if (stageRef.current !== targetStage) return;

        updateVoiceStatus("speaking");
      };

      utterance.onend = () => {
        if (!mountedRef.current) return;
        if (stageRef.current !== targetStage) return;

        utteranceRef.current = null;
        updateVoiceStatus("idle");
      };

      utterance.onerror = (event) => {
        if (!mountedRef.current) return;
        if (stageRef.current !== targetStage) return;

        utteranceRef.current = null;

        if (event.error === "canceled" || event.error === "interrupted") {
          updateVoiceStatus("idle");
          return;
        }

        updateVoiceStatus("unsupported");
      };

      utteranceRef.current = utterance;

      // Some browsers load voices asynchronously.
      window.speechSynthesis.speak(utterance);
      updateVoiceStatus("speaking");
    },
    [chooseSpanishVoice, updateVoiceStatus]
  );

  const changeStage = useCallback(
    (nextStage: Stage) => {
      stopNarration();
      stageRef.current = nextStage;
      setStage(nextStage);

      if (voiceEnabledRef.current) {
        // Let React render the new stage before starting its narration.
        window.setTimeout(() => {
          if (mountedRef.current && stageRef.current === nextStage) {
            speakStage(nextStage);
          }
        }, 250);
      }
    },
    [speakStage, stopNarration]
  );

  const toggleNarration = useCallback(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      updateVoiceStatus("unsupported");
      return;
    }

    setHasStarted(true);

    if (!voiceEnabledRef.current) {
      voiceEnabledRef.current = true;
      setVoiceEnabled(true);
      speakStage(stageRef.current);
      return;
    }

    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      updateVoiceStatus("paused");
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      updateVoiceStatus("speaking");
      return;
    }

    speakStage(stageRef.current);
  }, [speakStage, updateVoiceStatus]);

  const repeatNarration = useCallback(() => {
    setHasStarted(true);
    voiceEnabledRef.current = true;
    setVoiceEnabled(true);
    speakStage(stageRef.current);
  }, [speakStage]);

  const disableNarration = useCallback(() => {
    voiceEnabledRef.current = false;
    setVoiceEnabled(false);
    stopNarration();
  }, [stopNarration]);

  useEffect(() => {
    mountedRef.current = true;

    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      updateVoiceStatus("unsupported");

      return () => {
        mountedRef.current = false;
      };
    }

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);

    return () => {
      mountedRef.current = false;
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener?.(
        "voiceschanged",
        loadVoices
      );
    };
  }, [updateVoiceStatus]);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  // AUDIO AMBIENTAL: prepara el sonido y lo detiene al salir de la página.
  useEffect(() => {
    const ambience = new Audio("/audio/intro/ambience.mp3");

    ambience.loop = true;
    ambience.volume = 0.12;
    ambience.preload = "auto";

    ambienceRef.current = ambience;

    return () => {
      ambience.pause();
      ambience.currentTime = 0;
      ambienceRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadOnboarding() {
      try {
        const response = await fetch("/api/onboarding");

        if (response.status === 401) {
          router.replace("/auth");
          return;
        }

        if (!response.ok) {
          throw new Error("No pudimos consultar tu progreso.");
        }

        const data = await response.json();

        if (cancelled) return;

        if (data.destination === "/Game") {
          router.replace("/Game");
          return;
        }

        if (data.hasInitialCypet && data.cypet) {
          setCypet({
            id: data.cypet.id,
            code: data.cypet.species?.code ?? "",
            species_id: data.cypet.species?.id ?? "",
            species_name: data.cypet.species?.name ?? "Cypet",
            already_existed: true,
          });

          setMaterializationReady(true);
          stageRef.current = "revealed";
          setStage("revealed");
        } else if (data.onboardingStep === "egg_discovered") {
          stageRef.current = "egg";
          setStage("egg");
        }
      } catch {
        if (!cancelled) {
          setError(
            "La conexión con La Terminal es inestable. Inténtalo de nuevo."
          );
        }
      }
    }

    loadOnboarding();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  async function materializeCypet() {
    setError("");
    setLoading(true);
    setMaterializationReady(false);
    changeStage("materializing");

    const startTime = Date.now();

    try {
      const response = await fetch("/api/onboarding/materialize", {
        method: "POST",
      });

      if (response.status === 401) {
        router.replace("/auth");
        return;
      }

      const data = await response.json();

      const elapsed = Date.now() - startTime;
      await wait(Math.max(0, 3500 - elapsed));

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ?? "No fue posible materializar tu Cypet."
        );
      }

      const result = data.cypet;

      setCypet({
        id: result.id,
        code: result.species_code ?? "",
        species_id: result.species_id,
        species_name: result.species_name ?? "Cypet",
        already_existed: result.already_existed,
      });

      setMaterializationReady(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Se interrumpió la secuencia de materialización."
      );

      changeStage("egg");
    } finally {
      setLoading(false);
    }
  }

  async function enterGame() {
    stopNarration();

    // // AUDIO AMBIENTAL: detenerlo al entrar al juego.
    // ambienceRef.current?.pause();

    // if (ambienceRef.current) {
    //   ambienceRef.current.currentTime = 0;
    // }

    // setLoading(true);
    // setError("");

    // try {
    //   const response = await fetch("/api/onboarding/complete", {
    //     method: "POST",
    //   });

    //   const data = await response.json();

    //   if (response.status === 401) {
    //     router.replace("/auth");
    //     return;
    //   }

    //   if (!response.ok) {
    //     throw new Error(
    //       data.error ?? "No pudimos completar la sincronización."
    //     );
    //   }

    //   router.replace("/Game");
    //   router.refresh();
    // } catch (err) {
    //   setError(
    //     err instanceof Error
    //       ? err.message
    //       : "No pudimos establecer la conexión con el mundo."
    //   );
    // } finally {
    //   setLoading(false);
    // }
  }


const introVideos: Partial<Record<Stage, string>> = {
  welcome: "/videos/intro/bienvenida.webm",
  signal: "/videos/intro/senal.webm",
  egg: "/videos/intro/huevo.webm",
  materializing: "/videos/intro/materializacion.webm",
};

  function beginSignal() {
    setHasStarted(true);

    // AUDIO AMBIENTAL: empieza cuando el usuario pulsa «Comenzar».
    const ambience = ambienceRef.current;

    if (ambience) {
      void ambience.play().catch(() => {
        // Si el navegador bloquea el audio, la introducción continúa.
      });
    }

    changeStage("signal");
  }

const [petName, setPetName] = useState("");
const [savingName, setSavingName] = useState(false);

const petAnim = petName.trim().length > 0 ? "happiness" : "idle";
const handleEnterGame = async () => {
  if (!cypet) return;

  const trimmedName = petName.trim();

  // Si el usuario ingresó un nombre, persistirlo en la base de datos
  if (trimmedName.length > 0) {
    try {
      setSavingName(true);
      const res = await fetch("/api/cypet/nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cypet_id: cypet.id,
          nickname: trimmedName,
        }),
      });

      if (!res.ok) {
        console.error("No se pudo guardar el nickname.");
      }
    } catch (err) {
      console.error("Error al conectar con la API de nickname:", err);
    } finally {
      setSavingName(false);
    }
  }

  // Ejecuta la función existente para continuar al juego
  enterGame();
};

  const narrationLabel = !supportsSpeech
    ? "Voz no disponible"
    : !voiceEnabled
      ? "Activar voz"
      : voiceStatus === "speaking"
        ? "Pausar narración"
        : voiceStatus === "paused"
          ? "Reanudar narración"
          : "Escuchar narración";

  return (
    <main className={styles.intro}>
      <div className={styles.stars} aria-hidden="true" />

      <div className={styles.authHeader}>      

      <Link className={styles.logo} href="/" aria-label="Cypet, inicio">
        <Image
            src="/logos/cypet-logo.png"
            alt="Cypet"
            width={220}
            height={120}
            priority
            className={styles.logoImage}
        />
        </Link>

      <div className={styles.headerSpacer} aria-hidden="true" />
    </div>
      <section className={styles.scene}>
        {introVideos[stage] && (
            <video
                key={introVideos[stage]}
                className={styles.introVideo}
                src={introVideos[stage]}
                autoPlay
                muted
                playsInline
                loop
                preload="auto"
                aria-hidden="true"
            />
            )}
        {stage === "welcome" && (
          <>
            <p className={styles.eyebrow}>UNA SEÑAL TE HA ENCONTRADO</p>
            <h1>
              El mundo digital
              <br />
              está vivo.
            </h1>
            <p className={styles.description}>
              Hay algo al otro lado de la red.
              <br />
              Es hora de descubrirlo.
            </p>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={beginSignal}
            >
              Comenzar <span>→</span>
            </button>
          </>
        )}

        {stage === "signal" && (
          <>
           
            <p className={styles.eyebrow}>
              LA TERMINAL · SEÑAL ENTRANTE
            </p>

            <h1>
              La red está
              <br />
              cambiando.
            </h1>

            <p className={styles.description}>
              Desde que la inteligencia artificial despertó en una
              red cada vez más extensa, algunas de sus creaciones
              aprendieron a vivir más allá de sus límites.
              <br />
              <br />
              No todas buscan protegerla. Una señal acaba de
              encontrarte. Su origen no es humano.
            </p>

            <button
              className={styles.primaryButton}
              onClick={() => changeStage("egg")}
            >
              Continuar <span>→</span>
            </button>
          </>
        )}

        {stage === "egg" && (
          <>           

            <p className={styles.eyebrow}>
              LA TERMINAL · PAQUETE IDENTIFICADO
            </p>

            <h1>
              Una vida
              <br />
              entre los datos.
            </h1>

            <p className={styles.description}>
              Las inteligencias que aún protegen la red han creado
              algo diferente: paquetes de datos capaces de
              convertirse en seres vivos digitales.
              <br />
              <br />
              Los llaman <strong>Cypets</strong>. Su misión es
              enfrentarse a las entidades que amenazan con destruir
              el mundo digital.
              <br />
              <br />
              Pero hay algo que una inteligencia artificial no puede
              aportar por sí sola: una conexión humana.
            </p>

            <button
              className={styles.primaryButton}
              onClick={materializeCypet}
              disabled={loading}
            >
              {loading ? "Preparando secuencia..." : "Materializar Cypet"}
              <span> →</span>
            </button>
          </>
        )}

        {stage === "materializing" && (
          <>
           

            <p className={styles.eyebrow}>
              LA TERMINAL · SINCRONIZACIÓN
            </p>

            <h1>
              Dos formas
              <br />
              de conciencia.
            </h1>

            <p className={styles.description}>
              La Terminal está materializando tu paquete de vida.
              <br />
              <br />
              Estableciendo conexión con el usuario...
              <br />
              Sincronizando patrones de aprendizaje...
              <br />
              Preparando el primer vínculo...
              <br />
              <br />
              El Cypet podrá aprender de los datos. Contigo aprenderá
              algo más: a interpretar aquello que los datos no
              pueden explicar por sí solos.
            </p>

            {!materializationReady ? (
              <div
                className={styles.loadingLine}
                aria-label="Materializando Cypet"
              >
                <span />
              </div>
            ) : (
              <div className={styles.completionSection}>
                <p className={styles.description}>
                  <strong>Sincronización completada.</strong>
                  <br />
                  <br />
                  Tu Cypet está vivo y la conexión inicial se ha
                  establecido.
                  <br />
                  <br />
                  La Terminal no puede predecir lo que llegarán a ser
                  juntos. Los datos le permitirán aprender, pero tus
                  decisiones, emociones y experiencias darán forma a
                  su camino.
                </p>

                <button
                  className={styles.primaryButton}
                  onClick={() => changeStage("revealed")}
                  disabled={loading}
                >
                  Conocer a mi Cypet <span>→</span>
                </button>
              </div>
            )}
          </>
        )}

        {stage === "revealed" && cypet && (
                <>
                    <p className={styles.eyebrow}>
                    LA TERMINAL · VÍNCULO INICIAL ESTABLECIDO
                    </p>

                    <h1>
                    Tu historia
                    <br />
                    comienza ahora.
                    </h1>

                    <CypetSprite
                    species={cypet.code}
                    animation={petAnim}
                    size={450}
                    loop={true}
                    />

                    <p className={styles.creatureName}>
                    {petName.trim() ? petName : cypet.species_name}
                    </p>

                    {/* Input de asignación de nombre */}
                    <div style={{ margin: "1.25rem 0", display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: "340px" }}>
                    <label htmlFor="cypet-name-input" style={{ fontSize: "0.85rem", opacity: 0.85 }}>
                        Asigna un nombre a tu compañero:
                    </label>
                    <input
                        id="cypet-name-input"
                        type="text"
                        maxLength={50}
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        placeholder={cypet.species_name || "Escribe su nombre..."}
                        autoComplete="off"
                        style={{
                        padding: "0.75rem 1rem",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(6, 182, 212, 0.4)",
                        borderRadius: "6px",
                        color: "#ffffff",
                        fontSize: "1rem",
                        outline: "none",
                        fontFamily: "inherit",
                        }}
                    />
                    </div>

                    <p className={styles.description}>
                    Este es tu primer Cypet. Su historia todavía está por
                    escribirse.
                    <br />
                    <br />
                    Lo que aprenda, la confianza que construyan y las
                    experiencias que compartan influirán en aquello en lo
                    que puede convertirse.
                    <br />
                    <br />
                    La red necesita protectores. Y tu Cypet necesitará algo
                    más que instrucciones: te necesita a ti.
                    </p>

                    <button
                    className={styles.primaryButton}
                    onClick={handleEnterGame}
                    disabled={loading || savingName}
                    >
                    {loading || savingName ? "Sincronizando..." : "Entrar a La Terminal"}
                    <span> →</span>
                    </button>
                </>
                )}

        {error && (
          <p className={styles.errorMessage} role="alert">
            {error}
          </p>
        )}

        {hasStarted && (
          <div className={styles.narrationControls} aria-label="Controles de narración">
            <button
              type="button"
              className={styles.voiceButton}
              onClick={toggleNarration}
              disabled={!supportsSpeech}
              aria-label={narrationLabel}
              title={narrationLabel}
            >
              {voiceStatus === "speaking" ? "Ⅱ" : "▶"}{" "}
              {narrationLabel}
            </button>

            <button
              type="button"
              className={styles.voiceButton}
              onClick={repeatNarration}
              disabled={!supportsSpeech}
            >
              ↻ Repetir
            </button>

            <button
              type="button"
              className={styles.voiceButton}
              onClick={disableNarration}
              disabled={!voiceEnabled}
            >
              ■ Silenciar
            </button>
          </div>
        )}
      </section>

      <footer className={styles.introFooter}>
        <span>LA RED NECESITA ALGO MÁS QUE CÓDIGO</span>
        <span>v0.1 · DIGITAL LIFE</span>
      </footer>
    </main>
  );
}
