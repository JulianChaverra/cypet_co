// src/app/api/cypet/nickname/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
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

    const body = await request.json();
    const { cypet_id, nickname } = body;

    if (!cypet_id || typeof cypet_id !== "string") {
      return NextResponse.json(
        { error: "El identificador cypet_id es requerido." },
        { status: 400 }
      );
    }

    const cleanNickname = typeof nickname === "string" ? nickname.trim() : "";

    if (cleanNickname.length === 0 || cleanNickname.length > 50) {
      return NextResponse.json(
        { error: "El nombre debe tener entre 1 y 50 caracteres." },
        { status: 400 }
      );
    }

    // Actualizamos filtrando por id y owner_id
    const { data, error } = await supabase
      .from("pets")
      .update({ nickname: cleanNickname })
      .eq("id", cypet_id)
      .eq("owner_id", user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error al actualizar nickname:", error.message);
      return NextResponse.json(
        { error: "No fue posible actualizar el nombre del Cypet." },
        { status: 500 }
      );
    }

    // Si data es null, la fila no coincidió con los filtros
    if (!data) {
      console.error(
        `No se encontró mascota en 'pets' con id='${cypet_id}' y owner_id='${user.id}'`
      );
      return NextResponse.json(
        { error: "No se encontró la mascota asociada al usuario." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, pet: data });
  } catch (error) {
    console.error("Error inesperado en actualización de nickname:", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado." },
      { status: 500 }
    );
  }
}