import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function checkDatabase(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}

export default prisma;
