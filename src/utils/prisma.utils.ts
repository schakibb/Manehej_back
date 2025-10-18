import { PrismaClient, Prisma } from '@prisma/client';
import { isDevelopment } from '../constants/config.constants';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: isDevelopment
    ? [
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ]
    : ['error'],
  omit: {
    admin: {
      password_hash: true,
    },
  },
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

if (isDevelopment) {
  globalForPrisma.prisma = prisma;
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
