CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`difficulty` text NOT NULL,
	`puzzle` text NOT NULL,
	`solution` text NOT NULL,
	`board` text NOT NULL,
	`timer` integer NOT NULL,
	`hints_used` integer NOT NULL,
	`mistakes` integer NOT NULL,
	`points_lost` integer NOT NULL,
	`history` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`visitor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `games_visitor_id_unique` ON `games` (`visitor_id`);--> statement-breakpoint
CREATE TABLE `scores` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`username` text NOT NULL,
	`difficulty` text NOT NULL,
	`score` integer NOT NULL,
	`time_seconds` integer NOT NULL,
	`hints_used` integer NOT NULL,
	`mistakes` integer NOT NULL,
	`completed_at` text NOT NULL,
	FOREIGN KEY (`visitor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_scores_difficulty` ON `scores` (`difficulty`,`score`);--> statement-breakpoint
CREATE INDEX `idx_scores_global` ON `scores` (`score`);--> statement-breakpoint
CREATE INDEX `idx_scores_user` ON `scores` (`visitor_id`);
