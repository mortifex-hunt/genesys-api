const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Skills:', await prisma.skill.count());
  console.log('Weapons:', await prisma.weapon.count());
  console.log('Armors:', await prisma.armor.count());
  console.log('Adversaries:', await prisma.adversary.count());
}

main().finally(() => prisma.$disconnect());
