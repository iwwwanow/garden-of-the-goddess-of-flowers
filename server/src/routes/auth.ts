import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/index';
import { users, userFlowers, flowers } from '../db/schema';
import { eq } from 'drizzle-orm';
import { verifyTelegramInitData } from '../lib/telegram';

const router = Router();

router.post('/', async (req, res) => {
  const { initData } = req.body;
  if (!initData) {
    res.status(400).json({ error: 'initData required' });
    return;
  }

  let telegramId: string;
  let firstName: string;
  let username: string | null;

  if (initData === 'dev' && process.env.NODE_ENV !== 'production') {
    telegramId = 'dev_user_1';
    firstName = 'Dev';
    username = 'devuser';
  } else {
    const botToken = process.env.TELEGRAM_BOT_TOKEN!;
    const data = verifyTelegramInitData(initData, botToken);
    if (!data) {
      res.status(401).json({ error: 'Invalid initData' });
      return;
    }
    const tgUser = JSON.parse(data['user'] ?? '{}');
    telegramId = String(tgUser.id);
    firstName = tgUser.first_name ?? 'User';
    username = tgUser.username ?? null;
  }

  // Upsert user
  let user = await db.select().from(users).where(eq(users.telegramId, telegramId)).get();
  if (!user) {
    const inserted = await db.insert(users).values({ telegramId, firstName, username }).returning().get();
    user = inserted;

    // Assign current season flower
    const flower = await db.select().from(flowers).orderBy(flowers.season).get();
    if (flower) {
      await db.insert(userFlowers).values({ userId: user.id, flowerId: flower.id });
    }
  }

  const token = jwt.sign(
    { userId: user.id, telegramId: user.telegramId },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  );

  res.json({ token, user });
});

export default router;
