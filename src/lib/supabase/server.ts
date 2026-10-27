
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

 const url =
  process.env.NEXT_PUBLIC_CYPET_SUPABASE_URL;

const key =
  process.env.NEXT_PUBLIC_CYPET_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error(
      "Faltan las variables de entorno de Supabase."
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // En componentes de servidor que no pueden escribir
          // cookies, la actualización se gestiona mediante middleware.
        }
      },
    },
  });
}
