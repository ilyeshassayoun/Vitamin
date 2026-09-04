ALTER TABLE `mentors` ADD COLUMN `bio` text;
--> statement-breakpoint
ALTER TABLE `mentors` ADD COLUMN `city` text DEFAULT 'Munich' NOT NULL;
--> statement-breakpoint
ALTER TABLE `mentors` ADD COLUMN `specialty` text DEFAULT 'AFT' NOT NULL;
--> statement-breakpoint
ALTER TABLE `mentors` ADD COLUMN `image_url` text;
--> statement-breakpoint
ALTER TABLE `mentors` ADD COLUMN `response_minutes` integer DEFAULT 15 NOT NULL;
--> statement-breakpoint
ALTER TABLE `mentors` ADD COLUMN `featured_rank` integer DEFAULT 1000 NOT NULL;
--> statement-breakpoint
CREATE INDEX `idx_mentors_discovery` ON `mentors` (`accepting_requests`, `verified`, `featured_rank`, `name`);
