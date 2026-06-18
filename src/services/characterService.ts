import { prisma } from '../prisma.js';

export interface Skill {
  name: string;
  characteristic: string;
  category: 'General' | 'Combat' | 'Social' | 'Magic' | 'Knowledge' | 'Custom';
  isSetting: boolean;
  isCareer: boolean;
  rank: number;
}

export interface WeaponItem {
  weapon: string;
  skill: string;
  damage: string;
  crit: string;
  range: string;
  special: string;
}

export interface Motivations {
  strength: string;
  flaw: string;
  desire: string;
  fear: string;
}

export interface Description {
  gender: string;
  age: string;
  height: string;
  build: string;
  hair: string;
  eyes: string;
  notableFeatures: string;
}

export interface Equipment {
  money: string;
  weaponsAndArmor: string;
  personalGear: string;
}

export interface CriticalInjury {
  severity: number;
  result: string;
}

export interface Talent {
  name: string;
  page: string;
  summary: string;
}

export interface Character {
  id: string;
  characterName: string;
  speciesArchetype: string;
  career: string;
  player: string;
  soakValue: number;
  woundsThreshold: number;
  woundsCurrent: number;
  strainThreshold: number;
  strainCurrent: number;
  defenseRanged: number;
  defenseMelee: number;
  brawn: number;
  agility: number;
  intellect: number;
  cunning: number;
  willpower: number;
  presence: number;
  skills?: Skill[];
  weapons?: WeaponItem[];
  motivations?: Motivations;
  description?: Description;
  equipment?: Equipment;
  notes?: string;
  criticalInjuries?: CriticalInjury[];
  talents?: Talent[];
  updatedAt: number;
  lastUpdatedBy?: string;
  userId?: string;
}

export const STANDARD_SKILLS: Omit<Skill, 'rank' | 'isCareer' | 'isSetting'>[] = [
  { name: 'Alchemy', characteristic: 'INT', category: 'General' },
  { name: 'Astrocartography', characteristic: 'INT', category: 'General' },
  { name: 'Athletics', characteristic: 'BR', category: 'General' },
  { name: 'Computers', characteristic: 'INT', category: 'General' },
  { name: 'Cool', characteristic: 'PR', category: 'General' },
  { name: 'Coordination', characteristic: 'AG', category: 'General' },
  { name: 'Discipline', characteristic: 'WILL', category: 'General' },
  { name: 'Driving', characteristic: 'AG', category: 'General' },
  { name: 'Mechanics', characteristic: 'INT', category: 'General' },
  { name: 'Medicine', characteristic: 'INT', category: 'General' },
  { name: 'Operating', characteristic: 'INT', category: 'General' },
  { name: 'Perception', characteristic: 'CUN', category: 'General' },
  { name: 'Piloting', characteristic: 'AG', category: 'General' },
  { name: 'Resilience', characteristic: 'BR', category: 'General' },
  { name: 'Riding', characteristic: 'AG', category: 'General' },
  { name: 'Skulduggery', characteristic: 'CUN', category: 'General' },
  { name: 'Stealth', characteristic: 'AG', category: 'General' },
  { name: 'Streetwise', characteristic: 'CUN', category: 'General' },
  { name: 'Survival', characteristic: 'CUN', category: 'General' },
  { name: 'Vigilance', characteristic: 'WILL', category: 'General' },

  { name: 'Brawl', characteristic: 'BR', category: 'Combat' },
  { name: 'Gunnery', characteristic: 'AG', category: 'Combat' },
  { name: 'Melee', characteristic: 'BR', category: 'Combat' },
  { name: 'Melee-Heavy', characteristic: 'BR', category: 'Combat' },
  { name: 'Melee-Light', characteristic: 'BR', category: 'Combat' },
  { name: 'Ranged', characteristic: 'AG', category: 'Combat' },
  { name: 'Ranged-Heavy', characteristic: 'AG', category: 'Combat' },
  { name: 'Ranged-Light', characteristic: 'AG', category: 'Combat' },

  { name: 'Charm', characteristic: 'PR', category: 'Social' },
  { name: 'Coercion', characteristic: 'WILL', category: 'Social' },
  { name: 'Deception', characteristic: 'CUN', category: 'Social' },
  { name: 'Leadership', characteristic: 'PR', category: 'Social' },
  { name: 'Negotiation', characteristic: 'PR', category: 'Social' },

  { name: 'Knowledge', characteristic: 'INT', category: 'Knowledge' },

  { name: 'Arcana', characteristic: 'INT', category: 'Magic' },
  { name: 'Divine', characteristic: 'WILL', category: 'Magic' },
  { name: 'Primal', characteristic: 'CUN', category: 'Magic' },
];

export function getDefaultSkills(): Skill[] {
  return STANDARD_SKILLS.map(s => ({
    name: s.name,
    characteristic: s.characteristic,
    category: s.category,
    isSetting: true,
    isCareer: false,
    rank: 0
  }));
}

class CharacterService {
  async getAll(): Promise<Character[]> {
    const chars = await prisma.character.findMany({ include: { weapons: true } });
    return chars.map(this.mapPrismaToCharacter);
  }

  async get(id: string): Promise<Character | undefined> {
    const char = await prisma.character.findUnique({ where: { id }, include: { weapons: true } });
    if (!char) return undefined;
    return this.mapPrismaToCharacter(char);
  }

  async createOrUpdate(data: Partial<Character> & { id: string }): Promise<Character> {
    const existing = await prisma.character.findUnique({ where: { id: data.id } });

    const safeData = {
      id: data.id,
      characterName: data.characterName || existing?.characterName || '',
      speciesArchetype: data.speciesArchetype || existing?.speciesArchetype || '',
      career: data.career || existing?.career || '',
      player: data.player || existing?.player || '',
      soakValue: data.soakValue ?? existing?.soakValue ?? 0,
      woundsThreshold: data.woundsThreshold ?? existing?.woundsThreshold ?? 0,
      woundsCurrent: data.woundsCurrent ?? existing?.woundsCurrent ?? 0,
      strainThreshold: data.strainThreshold ?? existing?.strainThreshold ?? 0,
      strainCurrent: data.strainCurrent ?? existing?.strainCurrent ?? 0,
      defenseRanged: data.defenseRanged ?? existing?.defenseRanged ?? 0,
      defenseMelee: data.defenseMelee ?? existing?.defenseMelee ?? 0,
      brawn: data.brawn ?? existing?.brawn ?? 2,
      agility: data.agility ?? existing?.agility ?? 2,
      intellect: data.intellect ?? existing?.intellect ?? 2,
      cunning: data.cunning ?? existing?.cunning ?? 2,
      willpower: data.willpower ?? existing?.willpower ?? 2,
      presence: data.presence ?? existing?.presence ?? 2,
      skills: data.skills ? data.skills : existing?.skills ? (existing.skills as any) : getDefaultSkills(),
      motivations: data.motivations ? data.motivations : existing?.motivations ? (existing.motivations as any) : { strength: '', flaw: '', desire: '', fear: '' },
      description: data.description ? data.description : existing?.description ? (existing.description as any) : { gender: '', age: '', height: '', build: '', hair: '', eyes: '', notableFeatures: '' },
      equipment: data.equipment ? data.equipment : existing?.equipment ? (existing.equipment as any) : { money: '', weaponsAndArmor: '', personalGear: '' },
      notes: data.notes !== undefined ? data.notes : existing?.notes ? existing.notes : '',
      criticalInjuries: data.criticalInjuries ? data.criticalInjuries : existing?.criticalInjuries ? (existing.criticalInjuries as any) : [],
      talents: data.talents ? data.talents : existing?.talents ? (existing.talents as any) : [],
      lastUpdatedBy: data.lastUpdatedBy || existing?.lastUpdatedBy,
      userId: data.userId || existing?.userId,
    };

    const weaponConnections = data.weapons && Array.isArray(data.weapons) 
      ? data.weapons.filter(w => (w as any).id).map(w => ({ id: (w as any).id }))
      : [];

    const char = await prisma.character.upsert({
      where: { id: data.id },
      create: {
        ...(safeData as any),
        weapons: {
          connect: weaponConnections
        }
      },
      update: {
        ...(safeData as any),
        weapons: {
          set: weaponConnections
        }
      },
      include: { weapons: true }
    });

    return this.mapPrismaToCharacter(char);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.character.delete({ where: { id } });
      return true;
    } catch (e) {
      return false;
    }
  }

  private mapPrismaToCharacter(char: any): Character {
    return {
      ...char,
      updatedAt: char.updatedAt.getTime(),
      skills: char.skills as Skill[] | undefined,
      weapons: char.weapons as WeaponItem[] | undefined,
      motivations: char.motivations as Motivations | undefined,
      description: char.description as Description | undefined,
      equipment: char.equipment as Equipment | undefined,
      notes: char.notes || '',
      criticalInjuries: char.criticalInjuries as CriticalInjury[] | undefined,
      talents: char.talents as Talent[] | undefined,
    };
  }
}

export const characterService = new CharacterService();
export type { CharacterService };
