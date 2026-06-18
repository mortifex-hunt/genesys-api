import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const weapons = [
    { name: 'Blaster Pistol', skill: 'Ranged-Light', damage: '6', crit: '3', range: 'Medium', special: 'Stun setting' },
    { name: 'Vibroknife', skill: 'Melee', damage: '+1', crit: '2', range: 'Engaged', special: 'Pierce 2, Vicious 1' },
    { name: 'Blaster Rifle', skill: 'Ranged-Heavy', damage: '9', crit: '3', range: 'Long', special: 'Stun setting' }
  ];

  for (const w of weapons) {
    await prisma.weapon.upsert({
      where: { name: w.name },
      update: {},
      create: w
    });
  }
  console.log('Weapons seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
