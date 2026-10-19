import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  // SEGURIDAD BÁSICA PARA DEV: Solo permite peticiones desde localhost
  // (O puedes comentarlo si necesitas hacerlo desde Vercel una vez)
  /*
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Operación no permitida en producción' }, { status: 403 });
  }
  */

  try {
    const { username, password, secretKey } = await request.json();

    // Una capa extra de seguridad para que nadie use el endpoint por error
    if (secretKey !== "CYPET_MASTER_2026") {
      return NextResponse.json({ error: 'Llave maestra incorrecta' }, { status: 403 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.techUser.upsert({
      where: { username: username },
      update: { passwordHash: hashedPassword },
      create: {
        username: username,
        passwordHash: hashedPassword,
        role: "game_client",
      },
    });

    return NextResponse.json({ 
      status: 'SUCCESS', 
      message: `Usuario ${user.username} registrado en el Grid.` 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Error: ' + error.message }, { status: 500 });
  }
}