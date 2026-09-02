import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { ensureDatabase } from '@/db/bootstrap';

export async function requireApiUser() {
  const identity = await getChatGPTUser();
  if (!identity) return null;
  await ensureDatabase();
  const now = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO users (id, email, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, updated_at = excluded.updated_at`).bind(identity.userId, identity.email, identity.displayName, now, now).run();
  await env.DB.prepare(`INSERT OR IGNORE INTO profiles (user_id, verification_status) VALUES (?, 'verified')`).bind(identity.userId).run();
  return identity;
}
