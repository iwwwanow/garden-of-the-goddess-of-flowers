import { Router } from 'express';
import { db } from '../db/index';
import { users, userFlowers, flowers, waterings, seeds } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { todayDate } from '../lib/game';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const user = await db.select().from(users).where(eq(users.id, req.userId!)).get();
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const userFlower = await db.select().from(userFlowers).where(eq(userFlowers.userId, user.id)).get();
  let flowerData = null;
  if (userFlower) {
    const flower = await db.select().from(flowers).where(eq(flowers.id, userFlower.flowerId)).get();
    const todayWatering = await db.select().from(waterings)
      .where(and(
        eq(waterings.userFlowerId, userFlower.id),
        eq(waterings.wateredByUserId, user.id),
        eq(waterings.wateredDate, todayDate())
      )).get();

    flowerData = {
      ...userFlower,
      flower,
      wateredToday: !!todayWatering,
    };
  }

  const userSeeds = await db.select().from(seeds).where(eq(seeds.userId, user.id)).all();

  res.json({ user, flower: flowerData, seeds: userSeeds });
});

export default router;
