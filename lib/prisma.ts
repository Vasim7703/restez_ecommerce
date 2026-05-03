import { PrismaClient } from '@prisma/client'

/**
 * Safe Prisma singleton.
 *
 * - In development, reuses the same instance across hot reloads.
 * - If DATABASE_URL is missing or invalid, instantiation is deferred:
 *   the app starts without crashing and only throws when a DB query
 *   is actually executed (mock-data fallbacks in API routes catch this).
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
