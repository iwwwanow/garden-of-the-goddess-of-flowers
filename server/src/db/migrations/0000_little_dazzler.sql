CREATE TABLE `flowers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`season` integer DEFAULT 1 NOT NULL,
	`image_path` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `seeds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`flower_id` integer NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`flower_id`) REFERENCES `flowers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_flowers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`flower_id` integer NOT NULL,
	`day` integer DEFAULT 1 NOT NULL,
	`last_watered_at` text,
	`is_dried` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`flower_id`) REFERENCES `flowers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`telegram_id` text NOT NULL,
	`username` text,
	`first_name` text NOT NULL,
	`fd_balance` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `waterings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_flower_id` integer NOT NULL,
	`watered_by_user_id` integer NOT NULL,
	`watered_date` text NOT NULL,
	FOREIGN KEY (`user_flower_id`) REFERENCES `user_flowers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`watered_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegram_id_unique` ON `users` (`telegram_id`);