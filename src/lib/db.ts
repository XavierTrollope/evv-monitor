import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function ensureDbConnection(): Promise<void> {
  await prisma.$connect();
}
