import { env } from 'cloudflare:workers';
import { ensureDatabase } from '@/db/bootstrap';

export async function GET(request: Request) {
  await ensureDatabase();
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') ?? '').trim().slice(0, 80);
  const specialty = (url.searchParams.get('specialty') ?? '').trim().slice(0, 80);
  const featured = url.searchParams.get('featured') === '1';
  const conditions = ['accepting_requests = 1', 'verified = 1'];
  const bindings: string[] = [];
  if (query) {
    conditions.push(`(name LIKE ? OR role LIKE ? OR company LIKE ? OR helps_with LIKE ? OR specialty LIKE ?)`);
    const pattern = `%${query}%`;
    bindings.push(pattern, pattern, pattern, pattern, pattern);
  }
  if (specialty) {
    conditions.push('specialty = ?');
    bindings.push(specialty);
  }
  const statement = env.DB.prepare(`SELECT id, name, initials, role, company, languages, helps_with AS helpsWith,
    COALESCE(bio, helps_with) AS bio, COALESCE(city, 'Munich') AS city, COALESCE(specialty, 'AFT') AS specialty,
    image_url AS imageUrl, COALESCE(response_minutes, 15) AS responseMinutes, verified,
    access_tier AS accessTier FROM mentors WHERE ${conditions.join(' AND ')}
    ORDER BY CASE WHEN featured_rank IS NULL THEN 1 ELSE 0 END, featured_rank, name ${featured ? 'LIMIT 3' : ''}`);
  const [result, completed, activeMentors, effort] = await Promise.all([
    statement.bind(...bindings).all(),
    env.DB.prepare(`SELECT COUNT(*) AS count FROM help_requests WHERE status = 'completed'`).first<{ count: number }>(),
    env.DB.prepare(`SELECT COUNT(*) AS count FROM mentors WHERE accepting_requests = 1 AND verified = 1`).first<{ count: number }>(),
    env.DB.prepare(`SELECT COUNT(*) AS total, SUM(CASE WHEN effort_rating >= 4 THEN 1 ELSE 0 END) AS positive FROM reviews WHERE released = 1`).first<{ total: number; positive: number | null }>(),
  ]);
  const positiveEffortRate = effort?.total ? Math.round(((effort.positive ?? 0) / effort.total) * 100) : null;
  return Response.json({
    mentors: result.results,
    meta: {
      activeMentors: activeMentors?.count ?? 0,
      completedConversations: completed?.count ?? 0,
      positiveEffortRate,
      averageSessionMinutes: 15,
      pilotLocation: 'Munich',
      pilotVertical: 'AFT',
    },
  });
}
