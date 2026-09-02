import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), email: text('email').notNull(), displayName: text('display_name').notNull(), createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(),
}, (table) => [uniqueIndex('idx_users_email').on(table.email)]);

export const profiles = sqliteTable('profiles', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }), language: text('language').notNull().default('es'), situation: text('situation'), field: text('field').notNull().default('AFT'), location: text('location').notNull().default('Munich'), verificationStatus: text('verification_status').notNull().default('pending'), role: text('role').notNull().default('mentee'), activeRequestLimit: integer('active_request_limit').notNull().default(1), onboardingComplete: integer('onboarding_complete', { mode: 'boolean' }).notNull().default(false),
});

export const contributions = sqliteTable('contributions', {
  id: text('id').primaryKey(), authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }), title: text('title').notNull(), body: text('body').notNull(), category: text('category').notNull(), status: text('status').notNull().default('published'), createdAt: text('created_at').notNull(),
});

export const mentors = sqliteTable('mentors', {
  id: text('id').primaryKey(), name: text('name').notNull(), initials: text('initials').notNull(), role: text('role').notNull(), company: text('company').notNull(), languages: text('languages').notNull(), helpsWith: text('helps_with').notNull(), verified: integer('verified', { mode: 'boolean' }).notNull().default(true), accessTier: integer('access_tier').notNull().default(1), acceptingRequests: integer('accepting_requests', { mode: 'boolean' }).notNull().default(true),
});

export const helpRequests = sqliteTable('help_requests', {
  id: text('id').primaryKey(), menteeId: text('mentee_id').notNull().references(() => users.id, { onDelete: 'cascade' }), mentorId: text('mentor_id').notNull().references(() => mentors.id), topic: text('topic').notNull(), context: text('context').notNull(), status: text('status').notNull().default('pending'), createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(),
});
