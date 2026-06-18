import { prisma } from '../prisma.js';

export const criticalInjuryService = {
  getAll: async () => {
    return prisma.globalCriticalInjury.findMany({
      orderBy: [
        { type: 'asc' },
        { minRoll: 'asc' }
      ]
    });
  }
};
