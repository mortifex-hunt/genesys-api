import { Router } from 'express';
import { criticalInjuryService } from '../services/criticalInjuryService.js';
const router = Router();
router.get('/critical-injuries', async (req, res) => {
    try {
        const injuries = await criticalInjuryService.getAll();
        res.json(injuries);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch critical injuries' });
    }
});
export default router;
