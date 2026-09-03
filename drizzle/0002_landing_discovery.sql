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
ALTER TABLE `mentors` ADD COLUMN `featured_rank` integer;
--> statement-breakpoint
CREATE INDEX `idx_mentors_discovery` ON `mentors` (`accepting_requests`, `verified`, `featured_rank`);
--> statement-breakpoint
UPDATE `mentors` SET
  `bio` = 'Makes Big 4 recruiting concrete: preparation, positioning, and what interviewers actually listen for.',
  `specialty` = 'Audit & Interviews',
  `image_url` = '/figma/11a355349a11fa6bc6642f5c92ef7aee487c924a.png',
  `response_minutes` = 12,
  `featured_rank` = 1
WHERE `id` = 'lucia-ramos';
--> statement-breakpoint
UPDATE `mentors` SET
  `bio` = 'Helps candidates turn varied experience into a focused story for consulting and transaction roles.',
  `specialty` = 'CV & Positioning',
  `image_url` = '/figma/fd8fb548c928adfe9f5f84eb3c36f4563a6acd8a.png',
  `response_minutes` = 18,
  `featured_rank` = 2
WHERE `id` = 'daniel-weber';
--> statement-breakpoint
UPDATE `mentors` SET
  `bio` = 'Offers a candid view of AFT career paths and the decisions that matter early in the journey.',
  `specialty` = 'Career Direction',
  `image_url` = '/figma/55f3ace3474ff0dce2d64b755c276e71d703ea44.png',
  `response_minutes` = 15,
  `featured_rank` = 3
WHERE `id` = 'maria-santos';
