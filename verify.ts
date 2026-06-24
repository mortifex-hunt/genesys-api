import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Skills:', await prisma.skill.count());
  console.log('Weapons:', await prisma.weapon.count());
  console.log('Armors:', await prisma.armor.count());
  console.log('Adversaries:', await prisma.adversary.count());
}

main().finally(async () => {
  await prisma.$disconnect();
});
