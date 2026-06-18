import { Router, Response } from 'express';
import { characterService } from '../services/characterService.js';
import { userService } from '../services/userService.js';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

// Protect admin routes
router.use('/admin', authenticateToken as any);

router.get('/admin/database', async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  const characters = await characterService.getAll();
  const users = await userService.getAllUsers();

  res.json({
    users,
    characters
  });
});

export default router;
