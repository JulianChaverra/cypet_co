
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_CYPET_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.error("Configuración pública de Supabase incompleta:", {
      urlConfigured: Boolean(url),
      keyConfigured: Boolean(key),
    });

    throw new Error("Faltan las variables de entorno de Supabase.");
  }

  return createBrowserClient(url, key);
}
