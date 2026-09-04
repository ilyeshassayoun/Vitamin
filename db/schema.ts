import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    displayName: text('display_name').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [uniqueIndex('idx_users_email').on(table.email)],
);

export const profiles = sqliteTable('profiles', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  language: text('language').notNull().default('es'),
  situation: text('situation'),
  field: text('field').notNull().default('AFT'),
  location: text('location').notNull().default('Munich'),
  verificationStatus: text('verification_status').notNull().default('pending'),
  role: text('role').notNull().default('mentee'),
  activeRequestLimit: integer('active_request_limit').notNull().default(1),
  onboardingComplete: integer('onboarding_complete', { mode: 'boolean' })
    .notNull()
    .default(false),
});

export const contributions = sqliteTable(
  'contributions',
  {
    id: text('id').primaryKey(),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    body: text('body').notNull(),
    category: text('category').notNull(),
    status: text('status').notNull().default('published'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_contributions_author').on(table.authorId, table.createdAt),
  ],
);

export const mentors = sqliteTable(
  'mentors',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    initials: text('initials').notNull(),
    role: text('role').notNull(),
    company: text('company').notNull(),
    languages: text('languages').notNull(),
    helpsWith: text('helps_with').notNull(),
    bio: text('bio'),
    city: text('city').notNull().default('Munich'),
    specialty: text('specialty').notNull().default('AFT'),
    imageUrl: text('image_url'),
    responseMinutes: integer('response_minutes').notNull().default(15),
    featuredRank: integer('featured_rank').notNull().default(1000),
    verified: integer('verified', { mode: 'boolean' }).notNull().default(true),
    accessTier: integer('access_tier').notNull().default(1),
    acceptingRequests: integer('accepting_requests', { mode: 'boolean' })
      .notNull()
      .default(true),
  },
  (table) => [
    uniqueIndex('idx_mentors_user_id').on(table.userId),
    index('idx_mentors_discovery').on(
      table.acceptingRequests,
      table.verified,
      table.featuredRank,
      table.name,
    ),
  ],
);

export const helpRequests = sqliteTable(
  'help_requests',
  {
    id: text('id').primaryKey(),
    menteeId: text('mentee_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mentorId: text('mentor_id')
      .notNull()
      .references(() => mentors.id),
    topic: text('topic').notNull(),
    context: text('context').notNull(),
    status: text('status').notNull().default('pending'),
    decisionNote: text('decision_note'),
    scheduledFor: text('scheduled_for'),
    schedulingUrl: text('scheduling_url'),
    menteeCompleted: integer('mentee_completed', { mode: 'boolean' })
      .notNull()
      .default(false),
    mentorCompleted: integer('mentor_completed', { mode: 'boolean' })
      .notNull()
      .default(false),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_help_requests_mentee_status').on(table.menteeId, table.status),
    index('idx_help_requests_mentor_status').on(table.mentorId, table.status),
  ],
);

export const interactionNotes = sqliteTable(
  'interaction_notes',
  {
    id: text('id').primaryKey(),
    requestId: text('request_id')
      .notNull()
      .references(() => helpRequests.id, { onDelete: 'cascade' }),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id),
    body: text('body').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_interaction_notes_request').on(table.requestId, table.createdAt),
  ],
);
export const reviews = sqliteTable(
  'reviews',
  {
    id: text('id').primaryKey(),
    requestId: text('request_id')
      .notNull()
      .references(() => helpRequests.id, { onDelete: 'cascade' }),
    reviewerId: text('reviewer_id')
      .notNull()
      .references(() => users.id),
    revieweeId: text('reviewee_id')
      .notNull()
      .references(() => users.id),
    effortRating: integer('effort_rating').notNull(),
    outcome: text('outcome').notNull(),
    potentialDirection: text('potential_direction'),
    released: integer('released', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('idx_reviews_request_reviewer').on(
      table.requestId,
      table.reviewerId,
    ),
    index('idx_reviews_reviewee_released').on(table.revieweeId, table.released),
  ],
);
export const reputationEvents = sqliteTable(
  'reputation_events',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    requestId: text('request_id')
      .notNull()
      .references(() => helpRequests.id),
    kind: text('kind').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('idx_reputation_user_request_kind').on(
      table.userId,
      table.requestId,
      table.kind,
    ),
    index('idx_reputation_user').on(table.userId, table.createdAt),
  ],
);
export const internalFlags = sqliteTable(
  'internal_flags',
  {
    id: text('id').primaryKey(),
    requestId: text('request_id')
      .notNull()
      .references(() => helpRequests.id),
    reporterId: text('reporter_id')
      .notNull()
      .references(() => users.id),
    reportedUserId: text('reported_user_id')
      .notNull()
      .references(() => users.id),
    kind: text('kind').notNull(),
    details: text('details').notNull(),
    response: text('response'),
    status: text('status').notNull().default('open'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_flags_reported_status').on(table.reportedUserId, table.status),
  ],
);
export const disputes = sqliteTable('disputes', {
  id: text('id').primaryKey(),
  reviewId: text('review_id').references(() => reviews.id),
  flagId: text('flag_id').references(() => internalFlags.id),
  openedBy: text('opened_by')
    .notNull()
    .references(() => users.id),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('open'),
  createdAt: text('created_at').notNull(),
});
export const notifications = sqliteTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    readAt: text('read_at'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_notifications_user_unread').on(
      table.userId,
      table.readAt,
      table.createdAt,
    ),
  ],
);
