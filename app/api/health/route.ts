import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const db = await getDatabase();
    const result = await db.prepare('SELECT 1 AS ok').first<{ ok: number }>();
    if (Number(result?.ok) !== 1) throw new Error('Database check failed.');
    return Response.json({ status: 'ok' });
  } catch {
    return Response.json({ status: 'unavailable' }, { status: 503 });
  }
}
