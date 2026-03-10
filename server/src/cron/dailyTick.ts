import { db } from '../db/index';
import { userFlowers, waterings, users, seeds, flowers } from '../db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { fdForDay, seedsForHarvest, todayDate } from '../lib/game';

export async function runDailyTick() {
  console.log(`[cron] daily tick at ${new Date().toISOString()}`);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const allUserFlowers = await db.select().from(userFlowers).where(ne(userFlowers.isDried, true)).all();

  for (const uf of allUserFlowers) {
    // Was it watered yesterday by its owner?
    const ownerWatering = await db.select().from(waterings).where(and(
      eq(waterings.userFlowerId, uf.id),
      eq(waterings.wateredByUserId, uf.userId),
      eq(waterings.wateredDate, yesterdayStr)
    )).get();

    if (!ownerWatering) {
      // Dry the flower
      await db.update(userFlowers).set({ isDried: true }).where(eq(userFlowers.id, uf.id));
      continue;
    }

    const newDay = uf.day + 1;
    const fd = fdForDay(uf.day);

    // Award FD to owner
    const owner = await db.select().from(users).where(eq(users.id, uf.userId)).get();
    if (owner) {
      await db.update(users).set({ fdBalance: owner.fdBalance + fd }).where(eq(users.id, owner.id));
    }

    // On day 7: give seeds
    if (uf.day === 7) {
      const flower = await db.select().from(flowers).where(eq(flowers.id, uf.flowerId)).get();
      if (flower) {
        const harvestCount = 1; // TODO: track per-user harvest count
        const seedQty = seedsForHarvest(harvestCount);
        const existing = await db.select().from(seeds)
          .where(and(eq(seeds.userId, uf.userId), eq(seeds.flowerId, uf.flowerId))).get();
        if (existing) {
          await db.update(seeds).set({ quantity: existing.quantity + seedQty }).where(eq(seeds.id, existing.id));
        } else {
          await db.insert(seeds).values({ userId: uf.userId, flowerId: uf.flowerId, quantity: seedQty });
        }
      }
    }

    await db.update(userFlowers).set({ day: newDay, lastWateredAt: yesterdayStr }).where(eq(userFlowers.id, uf.id));
  }

  console.log(`[cron] done, processed ${allUserFlowers.length} flowers`);
}
