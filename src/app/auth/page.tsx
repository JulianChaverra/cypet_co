
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./auth.module.css";
import Image from "next/image";
import Link from "next/link";

type AuthMode = "register" | "login";
type AuthStep = "details" | "otp";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("register");
  const [step, setStep] = useState<AuthStep>("details");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        throw new Error("Ingresa tu correo electrónico.");
      }

      if (mode === "register") {
        const normalizedUsername = username.trim();

        if (!/^[a-zA-Z0-9_]{3,20}$/.test(normalizedUsername)) {
          throw new Error(
            "El username debe tener entre 3 y 20 caracteres: letras, números o guion bajo."
          );
        }

        const normalizedDisplayName = displayName.trim();

        if (
          normalizedDisplayName.length < 1 ||
          normalizedDisplayName.length > 40
        ) {
          throw new Error(
            "El nombre visible debe tener entre 1 y 40 caracteres."
          );
        }

        // Comprobar si el correo ya está registrado.
        const emailCheckResponse = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        });

        const emailCheck = await emailCheckResponse.json();

        if (!emailCheckResponse.ok) {
          throw new Error(
            emailCheck.error || "No fue posible validar el correo."
          );
        }

        if (emailCheck.available !== true) {
          throw new Error(
            "Este correo ya tiene una cuenta en Cypet. Selecciona «Ya tengo una cuenta» para iniciar sesión."
          );
        }

        // Comprobar disponibilidad del username.
        const { data: available, error: checkError } =
          await supabase.rpc("is_username_available", {
            requested_username: normalizedUsername,
          });

        if (checkError) {
          throw checkError;
        }

        if (!available) {
          throw new Error(
            "Ese nombre de usuario no está disponible. Prueba con otro."
          );
        }

        // Solicitar OTP para el registro.
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            shouldCreateUser: true,
            data: {
              display_name: normalizedDisplayName,
              username: normalizedUsername,
            },
          },
        });

        if (otpError) {
          throw otpError;
        }
      } else {
        // Login: no crear una cuenta nueva.
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            shouldCreateUser: false,
          },
        });

        if (otpError) {
          throw otpError;
        }
      }

      setEmail(normalizedEmail);
      setToken("");
      setStep("otp");
      setMessage(
        `Si la solicitud es válida, recibirás un código en ${normalizedEmail}. Revisa también la carpeta de spam.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible solicitar el código. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const normalizedToken = token.replace(/\s/g, "");

    if (!/^\d{8}$/.test(normalizedToken)) {
      setError("Ingresa el código de ocho dígitos.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: normalizedToken,
        type: "email",
      });

      if (verifyError) {
        throw verifyError;
      }

      router.replace("/intro");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "El código no es válido o ha expirado."
      );
    } finally {
      setLoading(false);
    }
  }

  async function signOutForTesting() {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      window.location.href = "/auth";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cerrar la sesión."
      );
      setLoading(false);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setStep("details");
    setToken("");
    setError("");
    setMessage("");
  }

  function goBack() {
  if (step === "otp") {
    setStep("details");
    setToken("");
    setError("");
    setMessage("");
    return;
  }

  router.push("/");
}

  return (
  <main className={styles.page}>
    <div className={styles.authHeader}>
      <button
        type="button"
        className={styles.backButton}
        onClick={goBack}
        aria-label="Volver atrás"
      >
        <span aria-hidden="true">←</span>
        <span>VOLVER</span>
      </button>

      <Link  className={styles.logo} href="/" aria-label="Cypet, inicio">
        <Image
            src="/logos/cypet-logo.png"
            alt="Cypet"
            width={250}
            height={150}
            priority
            className={styles.logoImage}
        />
        </Link>

      <div className={styles.headerSpacer} aria-hidden="true" />
    </div>

    <section className={styles.panel}>

        <p className={styles.eyebrow}>IDENTIFICACIÓN DE JUGADOR</p>

        <h1>
          {step === "otp"
            ? "REVISA TU CORREO."
            : mode === "register"
              ? "DESPIERTA EN LA RED."
              : "BIENVENIDO DE NUEVO."}
        </h1>

        <p className={styles.description}>
          {step === "otp"
            ? "Introduce el código de acceso de ocho dígitos que enviamos a tu correo."
            : mode === "register"
              ? "Crea tu identidad para comenzar tu historia en el universo Cypet."
              : "Ingresa con tu correo electrónico. No necesitas contraseña."}
        </p>

        {step === "details" ? (
          <form onSubmit={requestOtp} className={styles.form}>
            {mode === "register" && (
              <>
                <label htmlFor="displayName">Nombre visible</label>
                <input
                  id="displayName"
                  autoComplete="name"
                  maxLength={40}
                  required
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="¿Cómo te llamaremos?"
                />

                <label htmlFor="username">Nombre de usuario</label>
                <input
                  id="username"
                  autoComplete="username"
                  minLength={3}
                  maxLength={20}
                  pattern="[A-Za-z0-9_]{3,20}"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Tu identificador único"
                />

                <p className={styles.hint}>
                  De 3 a 20 caracteres: letras, números y guion bajo.
                </p>
              </>
            )}

            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@correo.com"
            />

            <button type="submit" disabled={loading}>
              {loading
                ? "PROCESANDO..."
                : mode === "register"
                  ? "CREAR CUENTA Y ENVIAR OTP"
                  : "ENVIAR CÓDIGO OTP"}
            </button>

            <button
              type="button"
              className={styles.secondary}
              disabled={loading}
              onClick={() =>
                changeMode(mode === "register" ? "login" : "register")
              }
            >
              {mode === "register"
                ? "Ya tengo una cuenta"
                : "Quiero crear una cuenta"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className={styles.form}>
            <label htmlFor="token">Código de ocho dígitos</label>

            <input
              id="token"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{8}"
              maxLength={8}
              required
              value={token}
              onChange={(event) =>
                setToken(event.target.value.replace(/\D/g, "").slice(0, 8))
              }
              placeholder="00000000"
              className={styles.otpInput}
            />

            <button type="submit" disabled={loading}>
              {loading ? "VERIFICANDO..." : "VERIFICAR Y ENTRAR"}
            </button>

            <button
              type="button"
              className={styles.secondary}
              disabled={loading}
              onClick={() => {
                setStep("details");
                setToken("");
                setError("");
                setMessage("");
              }}
            >
              Volver
            </button>
          </form>
        )}

        {message && <p className={styles.message}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}

        <p className={styles.footer}>
          SIN CONTRASEÑAS · UNA IDENTIDAD · TU HISTORIA
        </p>

        {/* <button
          type="button"
          className={styles.secondary}
          disabled={loading}
          onClick={signOutForTesting}
        >
          Cerrar sesión de prueba
        </button> */}
      </section>
    </main>
  );
}
