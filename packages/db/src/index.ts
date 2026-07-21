import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgrespassword@localhost:5432/boardgametime_dev?schema=public';
}

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

export const prisma = getPrismaClient();
