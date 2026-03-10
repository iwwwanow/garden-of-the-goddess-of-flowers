import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  telegramId: text('telegram_id').notNull().unique(),
  username: text('username'),
  firstName: text('first_name').notNull(),
  fdBalance: real('fd_balance').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const flowers = sqliteTable('flowers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  season: integer('season').notNull().default(1),
  imagePath: text('image_path').notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const userFlowers = sqliteTable('user_flowers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  flowerId: integer('flower_id').notNull().references(() => flowers.id),
  day: integer('day').notNull().default(1),
  lastWateredAt: text('last_watered_at'),
  isDried: integer('is_dried', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const waterings = sqliteTable('waterings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userFlowerId: integer('user_flower_id').notNull().references(() => userFlowers.id),
  wateredByUserId: integer('watered_by_user_id').notNull().references(() => users.id),
  wateredDate: text('watered_date').notNull(), // YYYY-MM-DD
});

export const seeds = sqliteTable('seeds', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  flowerId: integer('flower_id').notNull().references(() => flowers.id),
  quantity: integer('quantity').notNull().default(0),
});
