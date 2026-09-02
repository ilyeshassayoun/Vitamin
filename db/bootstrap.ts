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
  await db.batch(statements.map((statement) => db.prepare(statement)));
  await db.batch(seedMentors.map((mentor) => db.prepare(`INSERT OR IGNORE INTO mentors (id, name, initials, role, company, languages, helps_with) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(...mentor)));
  initialized = true;
}
