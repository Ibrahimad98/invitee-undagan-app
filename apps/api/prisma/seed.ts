/**
 * 🌱 Seed Router — Detects NODE_ENV and runs the appropriate seed
 *
 * - NODE_ENV=development (or unset) → runs DEV seed (comprehensive dummy data)
 * - NODE_ENV=production             → runs PROD seed (minimal essential data)
 *
 * You can also force a specific seed via SEED_ENV:
 *   SEED_ENV=dev  npx prisma db seed
 *   SEED_ENV=prod npx prisma db seed
 *
 * Or use the npm scripts:
 *   pnpm run db:seed:dev
 *   pnpm run db:seed:prod
 */

import { PrismaClient } from '@prisma/client';
import { seedDev } from './seed-dev';
import { seedProd } from './seed-prod';

const prisma = new PrismaClient();

async function main() {
  const seedEnv = process.env.SEED_ENV || process.env.NODE_ENV || 'development';
  const isProd = seedEnv === 'production' || seedEnv === 'prod';

  console.log(`\n🌱 Seed environment: ${seedEnv} → running ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'} seed\n`);

  if (isProd) {
    await seedProd();
  } else {
    await seedDev();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
