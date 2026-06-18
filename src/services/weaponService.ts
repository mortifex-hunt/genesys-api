import { prisma } from '../prisma.js';

export interface Weapon {
  id: string;
  name: string;
  skill: string;
  damage: string;
  crit: string;
  range: string;
  special: string;
}

class WeaponService {
  async getAll(): Promise<Weapon[]> {
    return prisma.weapon.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async get(id: string): Promise<Weapon | null> {
    return prisma.weapon.findUnique({ where: { id } });
  }

  async createOrUpdate(data: Partial<Weapon> & { id?: string }): Promise<Weapon> {
    if (data.id) {
      return prisma.weapon.update({
        where: { id: data.id },
        data: {
          name: data.name,
          skill: data.skill,
          damage: data.damage,
          crit: data.crit,
          range: data.range,
          special: data.special,
        }
      });
    } else {
      return prisma.weapon.create({
        data: {
          name: data.name || '',
          skill: data.skill || '',
          damage: data.damage || '',
          crit: data.crit || '',
          range: data.range || '',
          special: data.special || '',
        }
      });
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.weapon.delete({ where: { id } });
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const weaponService = new WeaponService();
