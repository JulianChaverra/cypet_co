import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyAuth } from '@/lib/auth-middleware'; // <--- Importamos tu validador

export async function POST(request) {
  try {
    // REGLA DE ORO: Validar que sea la App de Unity quien llama
    // Si no hay JWT válido, esto lanzará un error y caerá al catch
    verifyAuth(request);

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y password requeridos' }, { status: 400 });
    }

    const emailClean = email.toLowerCase();

    // 1. Buscar si el usuario ya existe
    const existingUser = await prisma.userGamer.findUnique({
      where: { email: emailClean },
    });

    // --- CASO: LOGIN ---
    if (existingUser) {
      const isPasswordValid = await bcrypt.compare(password, existingUser.password);
      
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Credenciales erróneas' }, { status: 401 });
      }

      return NextResponse.json({
        status: 'LOGIN_SUCCESS',
        userId: existingUser.id,
        message: 'Acceso concedido al Grid'
      });
    }

    // --- CASO: REGISTRO ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.userGamer.create({
      data: {
        email: emailClean,
        password: hashedPassword
      },
    });

    return NextResponse.json({
      status: 'REGISTER_SUCCESS',
      userId: newUser.id,
      message: 'Nuevo piloto registrado en el Grid'
    });

  } catch (error) {
    // Si verifyAuth falla, enviamos 401
    return NextResponse.json({ 
      error: 'Unauthorized: Se requiere un token de aplicación válido.' 
    }, { status: 401 });
  }
}