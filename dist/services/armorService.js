import { prisma } from '../prisma.js';
export const armorService = {
    getAll: async () => {
        return await prisma.armor.findMany({
            orderBy: { name: 'asc' },
        });
    },
    create: async (data) => {
        return await prisma.armor.create({
            data,
        });
    },
    getById: async (id) => {
        return await prisma.armor.findUnique({
            where: { id },
        });
    },
};
