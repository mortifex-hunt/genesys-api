import { Router } from 'express';
import { userService } from '../services/userService.js';
const router = Router();
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }
    const result = await userService.register(username, password);
    if (result.error) {
        res.status(400).json({ error: result.error });
        return;
    }
    res.status(201).json(result);
});
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }
    const result = await userService.login(username, password);
    if (result.error) {
        res.status(401).json({ error: result.error });
        return;
    }
    res.status(200).json(result);
});
export default router;
