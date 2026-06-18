import { Router, Response } from 'express';
import { weaponService } from '../services/weaponService.js';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

// Get all weapons
router.get('/weapons', async (req, res) => {
  const weapons = await weaponService.getAll();
  res.json(weapons);
});

// Admin only: create/update weapon
router.post('/weapons', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  // Any authenticated user can create weapons
  // No role check needed

  const data = req.body;
  const weapon = await weaponService.createOrUpdate(data);
  res.json(weapon);
});

// Admin only: delete weapon
router.delete('/weapons/:id', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Only admins can delete weapons' });
    return;
  }

  const { id } = req.params;
  const success = await weaponService.delete(id as string);
  if (success) {
    res.json({ message: 'Deleted' });
  } else {
    res.status(400).json({ error: 'Failed to delete weapon' });
  }
});

export default router;
