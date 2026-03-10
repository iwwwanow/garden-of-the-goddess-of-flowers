import { Router } from 'express';
import { db } from '../db/index';
import { userFlowers, waterings, users, flowers } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { todayDate } from '../lib/game';

const router = Router();

// Water a flower
router.post('/:userFlowerId/water', requireAuth, async (req: AuthRequest, res) => {
  const userFlowerId = Number(req.params.userFlowerId);

  const userFlower = await db.select().from(userFlowers).where(eq(userFlowers.id, userFlowerId)).get();
  if (!userFlower) { res.status(404).json({ error: 'Flower not found' }); return; }
  if (userFlower.isDried) { res.status(400).json({ error: 'Flower is dried' }); return; }

  // Check: this user already watered this flower today
  const existing = await db.select().from(waterings).where(and(
    eq(waterings.userFlowerId, userFlowerId),
    eq(waterings.wateredByUserId, req.userId!),
    eq(waterings.wateredDate, todayDate())
  )).get();
  if (existing) { res.status(400).json({ error: 'Already watered today' }); return; }

  await db.insert(waterings).values({
    userFlowerId,
    wateredByUserId: req.userId!,
    wateredDate: todayDate(),
  });

  res.json({ success: true });
});

// Get a user's flower
router.get('/user/:userId', requireAuth, async (req: AuthRequest, res) => {
  const userId = Number(req.params.userId);
  const userFlower = await db.select().from(userFlowers).where(eq(userFlowers.userId, userId)).get();
  if (!userFlower) { res.status(404).json({ error: 'No flower' }); return; }
  const flower = await db.select().from(flowers).where(eq(flowers.id, userFlower.flowerId)).get();
  res.json({ ...userFlower, flower });
});

export default router;
