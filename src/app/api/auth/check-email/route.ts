
import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Ingresa un correo válido." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Falta la configuración administrativa de Supabase.", {
        urlConfigurada: Boolean(supabaseUrl),
        claveAdminConfigurada: Boolean(serviceRoleKey),
      });

      return NextResponse.json(
        { error: "Error de configuración del servidor." },
        { status: 500 }
      );
    }

    const admin = createSupabaseAdmin(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const normalizedEmail = email.trim().toLowerCase();
    let page = 1;
    const perPage = 1000;

    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        console.error(
          "Error consultando usuarios de Auth:",
          error.message
        );

        return NextResponse.json(
          { error: "No fue posible validar el correo." },
          { status: 500 }
        );
      }

      const exists = data.users.some(
        (user) => user.email?.toLowerCase() === normalizedEmail
      );

      if (exists) {
        return NextResponse.json({ available: false });
      }

      if (data.users.length < perPage) {
        break;
      }

      page++;
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error("Error en check-email:", error);

    return NextResponse.json(
      { error: "No fue posible validar el correo." },
      { status: 500 }
    );
  }
}
