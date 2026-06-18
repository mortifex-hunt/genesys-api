import { prisma } from '../prisma.js';
class WeaponService {
    async getAll() {
        return prisma.weapon.findMany({
            orderBy: { name: 'asc' }
        });
    }
    async get(id) {
        return prisma.weapon.findUnique({ where: { id } });
    }
    async createOrUpdate(data) {
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
        }
        else {
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
    async delete(id) {
        try {
            await prisma.weapon.delete({ where: { id } });
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
export const weaponService = new WeaponService();
