import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const user = await prisma.techUser.findUnique({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Acceso denegado al Grid' }, { status: 401 });
    }

    // Generamos el JWT (Válido por 1 hora)
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret_key_dev_2026',
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      access_token: token,
      token_type: 'Bearer',
      status: 'AUTHENTICATED'
    });
  } catch (error) {
    return NextResponse.json({ error: 'System Failure' }, { status: 500 });
  }
}