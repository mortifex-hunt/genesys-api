import express from 'express';
import { prisma } from '../prisma.js';

const router = express.Router();

router.get('/content/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let data;

    switch (type.toLowerCase()) {
      case 'skills':
      case 'skill':
        data = await prisma.skill.findMany({ orderBy: { name: 'asc' } });
        break;
      case 'characteristics':
      case 'characteristic':
        data = await prisma.characteristic.findMany({ orderBy: { name: 'asc' } });
        break;
      case 'qualities':
      case 'quality':
        data = await prisma.quality.findMany({ orderBy: { name: 'asc' } });
        break;
      case 'talents':
      case 'talent':
        const talents = await prisma.talent.findMany();
        const customTalents = await prisma.customTalent.findMany();
        data = [...talents, ...customTalents].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'abilities':
      case 'ability':
        data = await prisma.archetypeAbility.findMany({ orderBy: { name: 'asc' } });
        break;
      default:
        return res.status(400).json({ error: `Unsupported content type: ${type}` });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

router.post('/content/custom-talents', async (req, res) => {
  try {
    const { name, data } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const customTalent = await prisma.customTalent.create({
      data: {
        name,
        data: data || {},
      },
    });

    res.json(customTalent);
  } catch (error) {
    console.error('Error creating custom talent:', error);
    res.status(500).json({ error: 'Failed to create custom talent' });
  }
});

export default router;
