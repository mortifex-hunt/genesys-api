import { Router } from 'express';
import { characterService } from '../services/characterService.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = Router();
// Health Check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Protect all character routes
router.use('/characters', authenticateToken);
// Get all characters (filtered by user if not admin)
router.get('/characters', async (req, res) => {
    const allCharacters = await characterService.getAll();
    const user = req.user;
    if (user.role === 'admin') {
        res.json(allCharacters);
    }
    else {
        res.json(allCharacters.filter(c => c.userId === user.id));
    }
});
// Get character by ID
router.get('/characters/:id', async (req, res) => {
    const { id } = req.params;
    const character = await characterService.get(id);
    const user = req.user;
    if (!character) {
        res.status(404).json({ error: 'Character not found' });
        return;
    }
    if (user.role !== 'admin' && character.userId !== user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }
    res.json(character);
});
// Create/Update character
router.post('/characters', async (req, res) => {
    const { id, characterName, speciesArchetype, career, player, soakValue, woundsThreshold, woundsCurrent, strainThreshold, strainCurrent, defenseRanged, defenseMelee, brawn, agility, intellect, cunning, willpower, presence, skills, weapons, motivations, description, equipment, notes, criticalInjuries, talents } = req.body;
    const user = req.user;
    if (!id) {
        res.status(400).json({ error: 'Character ID is required' });
        return;
    }
    const existing = await characterService.get(id);
    if (existing && user.role !== 'admin' && existing.userId !== user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }
    const character = await characterService.createOrUpdate({
        id,
        characterName,
        speciesArchetype,
        career,
        player,
        soakValue,
        woundsThreshold,
        woundsCurrent,
        strainThreshold,
        strainCurrent,
        defenseRanged,
        defenseMelee,
        brawn,
        agility,
        intellect,
        cunning,
        willpower,
        presence,
        skills,
        weapons,
        motivations,
        description,
        equipment,
        notes,
        criticalInjuries,
        talents,
        userId: existing?.userId || user.id
    });
    res.status(200).json(character);
});
// Delete character
router.delete('/characters/:id', async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const existing = await characterService.get(id);
    if (!existing) {
        res.status(404).json({ error: 'Character not found' });
        return;
    }
    if (user.role !== 'admin' && existing.userId !== user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }
    await characterService.delete(id);
    res.json({ message: 'Character deleted successfully', id });
});
export default router;
