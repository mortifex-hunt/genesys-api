import { prisma } from '../prisma.js';

export const armorService = {
  getAll: async () => {
    return await prisma.armor.findMany({
      orderBy: { name: 'asc' },
    });
  },

  create: async (data: {
    name: string;
    defense: string;
    soak: string;
    encumbrance: string;
    hardPoints: string;
    special: string;
  }) => {
    return await prisma.armor.create({
      data,
    });
  },

  getById: async (id: string) => {
    return await prisma.armor.findUnique({
      where: { id },
    });
  },
};
