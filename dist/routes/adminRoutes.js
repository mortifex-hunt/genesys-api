import { Router } from 'express';
import { characterService } from '../services/characterService.js';
import { userService } from '../services/userService.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = Router();
// Protect admin routes
router.use('/admin', authenticateToken);
router.get('/admin/database', async (req, res) => {
    const user = req.user;
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
