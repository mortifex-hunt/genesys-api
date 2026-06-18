import { prisma } from '../prisma.js';
export const STANDARD_SKILLS = [
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
export function getDefaultSkills() {
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
    async getAll() {
        const chars = await prisma.character.findMany({ include: { weapons: true } });
        return chars.map(this.mapPrismaToCharacter);
    }
    async get(id) {
        const char = await prisma.character.findUnique({ where: { id }, include: { weapons: true } });
        if (!char)
            return undefined;
        return this.mapPrismaToCharacter(char);
    }
    async createOrUpdate(data) {
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
            skills: data.skills ? data.skills : existing?.skills ? existing.skills : getDefaultSkills(),
            motivations: data.motivations ? data.motivations : existing?.motivations ? existing.motivations : { strength: '', flaw: '', desire: '', fear: '' },
            description: data.description ? data.description : existing?.description ? existing.description : { gender: '', age: '', height: '', build: '', hair: '', eyes: '', notableFeatures: '' },
            equipment: data.equipment ? data.equipment : existing?.equipment ? existing.equipment : { money: '', weaponsAndArmor: '', personalGear: '' },
            notes: data.notes !== undefined ? data.notes : existing?.notes ? existing.notes : '',
            criticalInjuries: data.criticalInjuries ? data.criticalInjuries : existing?.criticalInjuries ? existing.criticalInjuries : [],
            talents: data.talents ? data.talents : existing?.talents ? existing.talents : [],
            lastUpdatedBy: data.lastUpdatedBy || existing?.lastUpdatedBy,
            userId: data.userId || existing?.userId,
        };
        const weaponConnections = data.weapons && Array.isArray(data.weapons)
            ? data.weapons.filter(w => w.id).map(w => ({ id: w.id }))
            : [];
        const char = await prisma.character.upsert({
            where: { id: data.id },
            create: {
                ...safeData,
                weapons: {
                    connect: weaponConnections
                }
            },
            update: {
                ...safeData,
                weapons: {
                    set: weaponConnections
                }
            },
            include: { weapons: true }
        });
        return this.mapPrismaToCharacter(char);
    }
    async delete(id) {
        try {
            await prisma.character.delete({ where: { id } });
            return true;
        }
        catch (e) {
            return false;
        }
    }
    mapPrismaToCharacter(char) {
        return {
            ...char,
            updatedAt: char.updatedAt.getTime(),
            skills: char.skills,
            weapons: char.weapons,
            motivations: char.motivations,
            description: char.description,
            equipment: char.equipment,
            notes: char.notes || '',
            criticalInjuries: char.criticalInjuries,
            talents: char.talents,
        };
    }
}
export const characterService = new CharacterService();
