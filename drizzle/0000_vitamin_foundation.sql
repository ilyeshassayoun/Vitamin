CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_email` ON `users` (`email`);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`language` text DEFAULT 'es' NOT NULL,
	`situation` text,
	`field` text DEFAULT 'AFT' NOT NULL,
	`location` text DEFAULT 'Munich' NOT NULL,
	`verification_status` text DEFAULT 'pending' NOT NULL,
	`role` text DEFAULT 'mentee' NOT NULL,
	`active_request_limit` integer DEFAULT 1 NOT NULL,
	`onboarding_complete` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`category` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_contributions_author` ON `contributions` (`author_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `mentors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`initials` text NOT NULL,
	`role` text NOT NULL,
	`company` text NOT NULL,
	`languages` text NOT NULL,
	`helps_with` text NOT NULL,
	`verified` integer DEFAULT true NOT NULL,
	`access_tier` integer DEFAULT 1 NOT NULL,
	`accepting_requests` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `help_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`mentee_id` text NOT NULL,
	`mentor_id` text NOT NULL,
	`topic` text NOT NULL,
	`context` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`mentee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mentor_id`) REFERENCES `mentors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_help_requests_mentee_status` ON `help_requests` (`mentee_id`,`status`);
--> statement-breakpoint
CREATE INDEX `idx_help_requests_mentor_status` ON `help_requests` (`mentor_id`,`status`);
