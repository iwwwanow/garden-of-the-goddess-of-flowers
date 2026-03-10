import { db } from '../src/db/index';
import { users, flowers, userFlowers, waterings, seeds } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Seeding dev data...');

  // Ensure season-1 flower exists
  let flower = await db.select().from(flowers).get();
  if (!flower) {
    flower = await db.insert(flowers).values({ season: 1, imagePath: 'season-1.png' }).returning().get();
  }

  // Dev user
  let devUser = await db.select().from(users).where(eq(users.telegramId, 'dev_user_1')).get();
  if (!devUser) {
    devUser = await db.insert(users).values({
      telegramId: 'dev_user_1',
      firstName: 'Dev',
      username: 'devuser',
      fdBalance: 0,
    }).returning().get();
  }
  await db.update(users).set({ fdBalance: 7 }).where(eq(users.id, devUser.id));

  // Dev user flower at day 3
  let uf = await db.select().from(userFlowers).where(eq(userFlowers.userId, devUser.id)).get();
  if (!uf) {
    uf = await db.insert(userFlowers).values({
      userId: devUser.id,
      flowerId: flower.id,
      day: 3,
      lastWateredAt: '2026-03-09',
    }).returning().get();
  } else {
    await db.update(userFlowers).set({ day: 3, lastWateredAt: '2026-03-09' }).where(eq(userFlowers.id, uf.id));
    uf = await db.select().from(userFlowers).where(eq(userFlowers.userId, devUser.id)).get() as typeof uf;
  }

  // 3 past waterings by dev user (days 1-3)
  const pastDates = ['2026-03-07', '2026-03-08', '2026-03-09'];
  for (const date of pastDates) {
    const exists = await db.select().from(waterings)
      .where(eq(waterings.wateredDate, date)).get();
    if (!exists) {
      await db.insert(waterings).values({
        userFlowerId: uf!.id,
        wateredByUserId: devUser.id,
        wateredDate: date,
      });
    }
  }

  // Dev user seeds
  const existingSeeds = await db.select().from(seeds)
    .where(eq(seeds.userId, devUser.id)).get();
  if (!existingSeeds) {
    await db.insert(seeds).values({ userId: devUser.id, flowerId: flower.id, quantity: 3 });
  } else {
    await db.update(seeds).set({ quantity: 3 }).where(eq(seeds.id, existingSeeds.id));
  }

  // Other users for leaderboard
  const others = [
    { telegramId: 'user_2', firstName: 'Alice', username: 'alice', fdBalance: 42 },
    { telegramId: 'user_3', firstName: 'Bob',   username: 'bob',   fdBalance: 31 },
    { telegramId: 'user_4', firstName: 'Mia',   username: null,    fdBalance: 28 },
    { telegramId: 'user_5', firstName: 'Dima',  username: 'dima',  fdBalance: 15 },
    { telegramId: 'user_6', firstName: 'Sara',  username: 'sara',  fdBalance: 9  },
  ];

  for (const u of others) {
    const exists = await db.select().from(users).where(eq(users.telegramId, u.telegramId)).get();
    if (!exists) {
      const inserted = await db.insert(users).values(u).returning().get();
      await db.insert(userFlowers).values({ userId: inserted.id, flowerId: flower.id, day: Math.ceil(Math.random() * 7) });
    } else {
      await db.update(users).set({ fdBalance: u.fdBalance }).where(eq(users.id, exists.id));
    }
  }

  console.log('Done.');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
