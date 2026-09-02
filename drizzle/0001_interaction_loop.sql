ALTER TABLE `mentors` ADD COLUMN `user_id` text REFERENCES users(id) ON DELETE SET NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_mentors_user_id` ON `mentors` (`user_id`) WHERE `user_id` IS NOT NULL;
--> statement-breakpoint
ALTER TABLE `help_requests` ADD COLUMN `decision_note` text;
--> statement-breakpoint
ALTER TABLE `help_requests` ADD COLUMN `scheduled_for` text;
--> statement-breakpoint
ALTER TABLE `help_requests` ADD COLUMN `scheduling_url` text;
--> statement-breakpoint
ALTER TABLE `help_requests` ADD COLUMN `mentee_completed` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `help_requests` ADD COLUMN `mentor_completed` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE TABLE `interaction_notes` (`id` text PRIMARY KEY NOT NULL, `request_id` text NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE, `author_id` text NOT NULL REFERENCES users(id), `body` text NOT NULL, `created_at` text NOT NULL);
--> statement-breakpoint
CREATE INDEX `idx_interaction_notes_request` ON `interaction_notes` (`request_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `reviews` (`id` text PRIMARY KEY NOT NULL, `request_id` text NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE, `reviewer_id` text NOT NULL REFERENCES users(id), `reviewee_id` text NOT NULL REFERENCES users(id), `effort_rating` integer NOT NULL CHECK (`effort_rating` BETWEEN 1 AND 5), `outcome` text NOT NULL, `potential_direction` text, `released` integer DEFAULT 0 NOT NULL, `created_at` text NOT NULL, UNIQUE(`request_id`,`reviewer_id`));
--> statement-breakpoint
CREATE INDEX `idx_reviews_reviewee_released` ON `reviews` (`reviewee_id`,`released`);
--> statement-breakpoint
CREATE TABLE `reputation_events` (`id` text PRIMARY KEY NOT NULL, `user_id` text NOT NULL REFERENCES users(id), `request_id` text NOT NULL REFERENCES help_requests(id), `kind` text NOT NULL, `created_at` text NOT NULL, UNIQUE(`user_id`,`request_id`,`kind`));
--> statement-breakpoint
CREATE INDEX `idx_reputation_user` ON `reputation_events` (`user_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `internal_flags` (`id` text PRIMARY KEY NOT NULL, `request_id` text NOT NULL REFERENCES help_requests(id), `reporter_id` text NOT NULL REFERENCES users(id), `reported_user_id` text NOT NULL REFERENCES users(id), `kind` text NOT NULL, `details` text NOT NULL, `response` text, `status` text DEFAULT 'open' NOT NULL, `created_at` text NOT NULL);
--> statement-breakpoint
CREATE INDEX `idx_flags_reported_status` ON `internal_flags` (`reported_user_id`,`status`);
--> statement-breakpoint
CREATE TABLE `disputes` (`id` text PRIMARY KEY NOT NULL, `review_id` text REFERENCES reviews(id), `flag_id` text REFERENCES internal_flags(id), `opened_by` text NOT NULL REFERENCES users(id), `reason` text NOT NULL, `status` text DEFAULT 'open' NOT NULL, `created_at` text NOT NULL);
--> statement-breakpoint
CREATE TABLE `notifications` (`id` text PRIMARY KEY NOT NULL, `user_id` text NOT NULL REFERENCES users(id) ON DELETE CASCADE, `type` text NOT NULL, `title` text NOT NULL, `body` text NOT NULL, `read_at` text, `created_at` text NOT NULL);
--> statement-breakpoint
CREATE INDEX `idx_notifications_user_unread` ON `notifications` (`user_id`,`read_at`,`created_at`);
