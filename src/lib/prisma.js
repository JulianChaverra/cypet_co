// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Simple, limpio y funcional en Prisma 5
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;