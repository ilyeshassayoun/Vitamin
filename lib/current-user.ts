import { getDatabase } from '@/lib/database';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export async function requireApiUser() {
  const identity = await getChatGPTUser();
  if (!identity) return null;
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO users (id, email, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, updated_at = excluded.updated_at`,
    )
    .bind(identity.userId, identity.email, identity.displayName, now, now)
    .run();
  await db
    .prepare(
      `INSERT OR IGNORE INTO profiles (user_id, verification_status) VALUES (?, 'verified')`,
    )
    .bind(identity.userId)
    .run();
  return identity;
}
