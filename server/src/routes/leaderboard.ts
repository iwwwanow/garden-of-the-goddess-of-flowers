import { Router } from 'express';
import { db } from '../db/index';
import { users } from '../db/schema';
import { desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  const top = await db.select().from(users).orderBy(desc(users.fdBalance)).limit(50).all();
  res.json(top);
});

export default router;
