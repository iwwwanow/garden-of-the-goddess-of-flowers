import { Router } from 'express';
import { db } from '../db/index';
import { seeds } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const userSeeds = await db.select().from(seeds).where(eq(seeds.userId, req.userId!)).all();
  res.json(userSeeds);
});

router.post('/share', requireAuth, async (req: AuthRequest, res) => {
  const { toUserId, flowerId, quantity } = req.body;
  if (!toUserId || !flowerId || !quantity || quantity <= 0) {
    res.status(400).json({ error: 'Invalid params' }); return;
  }

  const fromSeed = await db.select().from(seeds)
    .where(and(eq(seeds.userId, req.userId!), eq(seeds.flowerId, flowerId))).get();
  if (!fromSeed || fromSeed.quantity < quantity) {
    res.status(400).json({ error: 'Not enough seeds' }); return;
  }

  await db.update(seeds)
    .set({ quantity: fromSeed.quantity - quantity })
    .where(eq(seeds.id, fromSeed.id));

  const toSeed = await db.select().from(seeds)
    .where(and(eq(seeds.userId, toUserId), eq(seeds.flowerId, flowerId))).get();
  if (toSeed) {
    await db.update(seeds).set({ quantity: toSeed.quantity + quantity }).where(eq(seeds.id, toSeed.id));
  } else {
    await db.insert(seeds).values({ userId: toUserId, flowerId, quantity });
  }

  res.json({ success: true });
});

export default router;
