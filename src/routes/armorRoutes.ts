import { Router, Request, Response } from 'express';
import { armorService } from '../services/armorService.js';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/armor', async (req: Request, res: Response) => {
  try {
    const armors = await armorService.getAll();
    res.json(armors);
  } catch (error) {
    console.error('Error fetching armors:', error);
    res.status(500).json({ error: 'Failed to fetch armors' });
  }
});

router.post('/armor', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  try {
    const { name, defense, soak, encumbrance, hardPoints, special } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newArmor = await armorService.create({
      name,
      defense: defense || '0',
      soak: soak || '0',
      encumbrance: encumbrance || '0',
      hardPoints: hardPoints || '0',
      special: special || 'None',
    });
    res.status(201).json(newArmor);
  } catch (error: any) {
    console.error('Error creating armor:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'An armor with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create armor' });
  }
});

export default router;
