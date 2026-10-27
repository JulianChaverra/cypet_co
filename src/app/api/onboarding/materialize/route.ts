
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.rpc(
      "materialize_initial_cypet"
    );

    if (error) {
      console.error("Error materializando Cypet:", error.message);

      return NextResponse.json(
        { error: "No fue posible materializar tu Cypet." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, cypet: data });
  } catch (error) {
    console.error("Error inesperado en materialización:", error);

    return NextResponse.json(
      { error: "Ocurrió un error inesperado." },
      { status: 500 }
    );
  }
}
