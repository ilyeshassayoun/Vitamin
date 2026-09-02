import { env } from 'cloudflare:workers';
import { ensureDatabase } from '@/db/bootstrap';

export async function GET() {
  await ensureDatabase();
  const result = await env.DB.prepare(`SELECT id, name, initials, role, company, languages, helps_with AS helpsWith, verified, access_tier AS accessTier FROM mentors WHERE accepting_requests = 1 ORDER BY name`).all();
  return Response.json({ mentors: result.results });
}
