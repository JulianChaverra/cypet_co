import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.rpc(
      "complete_cypet_onboarding"
    );

    if (error) {
      console.error("Error completando onboarding:", error.message);

      return NextResponse.json(
        { error: "No fue posible completar la introducción." },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error inesperado:", error);

    return NextResponse.json(
      { error: "Ocurrió un error inesperado." },
      { status: 500 }
    );
  }
}