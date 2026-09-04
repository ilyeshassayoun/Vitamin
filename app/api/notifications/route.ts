import { getDatabase } from '@/lib/database';
import { requireApiUser } from '@/lib/current-user';

export async function PATCH() {
  const db = await getDatabase();
  const user = await requireApiUser();
  if (!user)
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  await db
    .prepare(
      `UPDATE notifications SET read_at=? WHERE user_id=? AND read_at IS NULL`,
    )
    .bind(new Date().toISOString(), user.userId)
    .run();
  return Response.json({ ok: true });
}
