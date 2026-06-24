import { PrismaClient } from '@prisma/client';

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const neonUrl = 'postgresql://neondb_owner:npg_AQJ2WTonML7c@ep-flat-poetry-afv2md0m.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';
const localUrl = process.env.DATABASE_URL;

const neonPool = new pg.Pool({ connectionString: neonUrl });
const neonAdapter = new PrismaPg(neonPool);
const neonPrisma = new PrismaClient({ adapter: neonAdapter });

const localPool = new pg.Pool({ connectionString: localUrl });
const localAdapter = new PrismaPg(localPool);
const localPrisma = new PrismaClient({ adapter: localAdapter });

async function main() {
  console.log('Clearing local tables...');
  await localPrisma.customTalent.deleteMany();
  await localPrisma.character.deleteMany();
  await localPrisma.user.deleteMany();

  console.log('Fetching users from Neon...');
  const users = await neonPrisma.user.findMany();
  console.log(`Found ${users.length} users. Migrating to local...`);
  
  for (const user of users) {
    await localPrisma.user.upsert({
      where: { id: user.id },
      update: user as any,
      create: user as any
    });
  }

  console.log('Fetching characters from Neon...');
  const characters = await neonPrisma.character.findMany();
  console.log(`Found ${characters.length} characters. Migrating to local...`);
  
  for (const char of characters) {
    await localPrisma.character.upsert({
      where: { id: char.id },
      update: char as any,
      create: char as any
    });
  }

  console.log('Fetching custom talents from Neon...');
  const customTalents = await neonPrisma.customTalent.findMany();
  console.log(`Found ${customTalents.length} custom talents. Migrating to local...`);
  
  for (const talent of customTalents) {
    await localPrisma.customTalent.upsert({
      where: { id: talent.id },
      update: talent as any,
      create: talent as any
    });
  }

  console.log('Migration successfully completed! Your local database now has all your original characters, users, and custom talents.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await neonPrisma.$disconnect();
    await localPrisma.$disconnect();
  });
