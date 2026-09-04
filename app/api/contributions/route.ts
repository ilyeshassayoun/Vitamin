import { getDatabase } from '@/lib/database';
import { requireApiUser } from '@/lib/current-user';
import { invalidJsonResponse, readJsonObject } from '@/lib/http';

export async function POST(request: Request) {
  const db = await getDatabase();
  const user = await requireApiUser();
  if (!user)
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  const body = await readJsonObject(request);
  if (!body) return invalidJsonResponse();
  const title =
    typeof body.title === 'string' ? body.title.trim().slice(0, 120) : '';
  const text =
    typeof body.body === 'string' ? body.body.trim().slice(0, 2000) : '';
  const category =
    typeof body.category === 'string'
      ? body.category.trim().slice(0, 40)
      : 'general';
  if (title.length < 5 || text.length < 20)
    return Response.json(
      { error: 'Please share a clear title and at least 20 characters.' },
      { status: 400 },
    );
  const id = crypto.randomUUID();
  await db.batch([
    db
      .prepare(
        `INSERT INTO contributions (id, author_id, title, body, category, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, user.userId, title, text, category, new Date().toISOString()),
    db
      .prepare(`UPDATE profiles SET onboarding_complete = 1 WHERE user_id = ?`)
      .bind(user.userId),
  ]);
  return Response.json({ id, ok: true }, { status: 201 });
}
