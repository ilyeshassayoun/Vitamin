import { env } from 'cloudflare:workers';

const statements = [
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL, display_name TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE TABLE IF NOT EXISTS profiles (user_id TEXT PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE, language TEXT NOT NULL DEFAULT 'es', situation TEXT, field TEXT NOT NULL DEFAULT 'AFT', location TEXT NOT NULL DEFAULT 'Munich', verification_status TEXT NOT NULL DEFAULT 'pending', role TEXT NOT NULL DEFAULT 'mentee', active_request_limit INTEGER NOT NULL DEFAULT 1, onboarding_complete INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS contributions (id TEXT PRIMARY KEY NOT NULL, author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, body TEXT NOT NULL, category TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'published', created_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_contributions_author ON contributions(author_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS mentors (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, initials TEXT NOT NULL, role TEXT NOT NULL, company TEXT NOT NULL, languages TEXT NOT NULL, helps_with TEXT NOT NULL, verified INTEGER NOT NULL DEFAULT 1, access_tier INTEGER NOT NULL DEFAULT 1, accepting_requests INTEGER NOT NULL DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS help_requests (id TEXT PRIMARY KEY NOT NULL, mentee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, mentor_id TEXT NOT NULL REFERENCES mentors(id), topic TEXT NOT NULL, context TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_help_requests_mentee_status ON help_requests(mentee_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_help_requests_mentor_status ON help_requests(mentor_id, status)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_mentors_user_id ON mentors(user_id) WHERE user_id IS NOT NULL`,
  `CREATE TABLE IF NOT EXISTS interaction_notes (id TEXT PRIMARY KEY NOT NULL, request_id TEXT NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE, author_id TEXT NOT NULL REFERENCES users(id), body TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_interaction_notes_request ON interaction_notes(request_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY NOT NULL, request_id TEXT NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE, reviewer_id TEXT NOT NULL REFERENCES users(id), reviewee_id TEXT NOT NULL REFERENCES users(id), effort_rating INTEGER NOT NULL CHECK(effort_rating BETWEEN 1 AND 5), outcome TEXT NOT NULL, potential_direction TEXT, released INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, UNIQUE(request_id, reviewer_id))`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_released ON reviews(reviewee_id, released)`,
  `CREATE TABLE IF NOT EXISTS reputation_events (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES users(id), request_id TEXT NOT NULL REFERENCES help_requests(id), kind TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(user_id, request_id, kind))`,
  `CREATE INDEX IF NOT EXISTS idx_reputation_user ON reputation_events(user_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS internal_flags (id TEXT PRIMARY KEY NOT NULL, request_id TEXT NOT NULL REFERENCES help_requests(id), reporter_id TEXT NOT NULL REFERENCES users(id), reported_user_id TEXT NOT NULL REFERENCES users(id), kind TEXT NOT NULL, details TEXT NOT NULL, response TEXT, status TEXT NOT NULL DEFAULT 'open', created_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_flags_reported_status ON internal_flags(reported_user_id, status)`,
  `CREATE TABLE IF NOT EXISTS disputes (id TEXT PRIMARY KEY NOT NULL, review_id TEXT REFERENCES reviews(id), flag_id TEXT REFERENCES internal_flags(id), opened_by TEXT NOT NULL REFERENCES users(id), reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, type TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, read_at TEXT, created_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at, created_at)`,
];

const requestColumns = [
  ['decision_note', 'TEXT'], ['scheduled_for', 'TEXT'], ['scheduling_url', 'TEXT'],
  ['mentee_completed', 'INTEGER NOT NULL DEFAULT 0'], ['mentor_completed', 'INTEGER NOT NULL DEFAULT 0'],
];

const seedMentors = [
  ['lucia-ramos', 'Lucía Ramos', 'LR', 'Senior Associate · Audit', 'Big 4 · München', 'ES · DE · EN', 'Interview preparation'],
  ['daniel-weber', 'Daniel Weber', 'DW', 'Consultant · Deals', 'Advisory · München', 'DE · EN', 'CV feedback'],
  ['maria-santos', 'María Santos', 'MS', 'Manager · Tax', 'Big 4 · München', 'ES · DE', 'Career orientation'],
];

let initialized = false;

export async function ensureDatabase() {
  if (initialized) return;
  const db = env.DB;
  await db.batch(statements.slice(0, 9).map((statement) => db.prepare(statement)));
  const mentorInfo = await db.prepare(`PRAGMA table_info(mentors)`).all<{ name: string }>();
  if (!mentorInfo.results.some((column) => column.name === 'user_id')) await db.prepare(`ALTER TABLE mentors ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE SET NULL`).run();
  const requestInfo = await db.prepare(`PRAGMA table_info(help_requests)`).all<{ name: string }>();
  for (const [name, definition] of requestColumns) {
    if (!requestInfo.results.some((column) => column.name === name)) await db.prepare(`ALTER TABLE help_requests ADD COLUMN ${name} ${definition}`).run();
  }
  await db.batch(statements.slice(9).map((statement) => db.prepare(statement)));
  await db.batch(seedMentors.map((mentor) => db.prepare(`INSERT OR IGNORE INTO mentors (id, name, initials, role, company, languages, helps_with) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(...mentor)));
  initialized = true;
}
