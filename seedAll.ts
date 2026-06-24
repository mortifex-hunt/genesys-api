import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const API_DIR = 'c:/repos/silentarctic.github.io/api';

async function main() {
  const files = fs.readdirSync(API_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  
  for (const file of files) {
    console.log(`Processing ${file}...`);
    const filePath = path.join(API_DIR, file);
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);

    // Mappings from JSON top-level keys to Prisma models
    const typeMapping: any = {
      adversary: prisma.adversary,
      adversaryAbility: prisma.adversaryAbility,
      archetype: prisma.archetype,
      archetypeAbility: prisma.archetypeAbility,
      book: prisma.book,
      career: prisma.career,
      characteristic: prisma.characteristic,
      optionFeature: prisma.optionFeature,
      quality: prisma.quality,
      rule: prisma.rule,
      setting: prisma.setting,
      sidebar: prisma.sidebar,
      skill: prisma.skill,
      spell: prisma.spell,
      table: prisma.table,
      talent: prisma.talent,
      vehicle: prisma.vehicle,
    };

    for (const key of Object.keys(typeMapping)) {
      if (data[key] && Array.isArray(data[key])) {
        const items = data[key];
        for (const item of items) {
          try {
            await typeMapping[key].upsert({
              where: { name: item.name },
              update: { data: item },
              create: {
                id: item.id || undefined,
                name: item.name,
                data: item
              }
            });
          } catch (err) {
            console.log(`Error upserting ${key} ${item.name}:`, err);
          }
        }
      }
    }

    // Process gear separately to split into Weapon, Armor, and Gear
    if (data.gear && Array.isArray(data.gear)) {
      for (const item of data.gear) {
        try {
          if (item.type === 'weapon') {
            await prisma.weapon.upsert({
              where: { name: item.name },
              update: {
                skill: item.skill?.name || '',
                damage: String(item.damage || '+0'),
                crit: String(item.critical || '0'),
                range: item.range || 'Engaged',
                special: Array.isArray(item.special) ? item.special.map((s:any) => s.name).join(', ') : '',
                data: item
              },
              create: {
                name: item.name,
                skill: item.skill?.name || '',
                damage: String(item.damage || '+0'),
                crit: String(item.critical || '0'),
                range: item.range || 'Engaged',
                special: Array.isArray(item.special) ? item.special.map((s:any) => s.name).join(', ') : '',
                data: item
              }
            });
          } else if (item.type === 'armor') {
            await prisma.armor.upsert({
              where: { name: item.name },
              update: {
                defense: String(item.defense || '0'),
                soak: String(item.soak || '0'),
                encumbrance: String(item.encumbrance || '0'),
                hardPoints: String(item.hardPoints || '0'),
                special: '',
                data: item
              },
              create: {
                name: item.name,
                defense: String(item.defense || '0'),
                soak: String(item.soak || '0'),
                encumbrance: String(item.encumbrance || '0'),
                hardPoints: String(item.hardPoints || '0'),
                special: '',
                data: item
              }
            });
          } else {
            await prisma.gear.upsert({
              where: { name: item.name },
              update: { data: item },
              create: {
                id: item.id || undefined,
                name: item.name,
                data: item
              }
            });
          }
        } catch (err) {
          console.log(`Error upserting gear ${item.name}:`, err);
        }
      }
    }
  }
  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
