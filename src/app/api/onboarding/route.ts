
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("onboarding_step")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error consultando perfil:", profileError.message);
      return NextResponse.json(
        { error: "No se pudo consultar tu perfil." },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "No se encontró el perfil del jugador." },
        { status: 404 }
      );
    }

    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select(
        "id, nickname, level, species:cypet_species(id, code, name, sprite_path)"
      )
      .eq("owner_id", user.id)
      .eq("is_initial", true)
      .maybeSingle();

    if (petError) {
      console.error("Error consultando Cypet:", petError.message);
      return NextResponse.json(
        { error: "No se pudo consultar tu Cypet." },
        { status: 500 }
      );
    }

    const completed =
      profile.onboarding_step === "completed" && pet !== null;

    return NextResponse.json({
      onboardingStep: profile.onboarding_step,
      hasInitialCypet: pet !== null,
      cypet: pet,
      destination: completed ? "/Game" : "/intro",
    });
  } catch (error) {
    console.error("Error consultando onboarding:", error);
    return NextResponse.json(
      { error: "Error inesperado consultando el progreso." },
      { status: 500 }
    );
  }
}
