import { env } from 'cloudflare:workers';
import { requireApiUser } from '@/lib/current-user';
import { invalidJsonResponse, readJsonObject } from '@/lib/http';

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (!user)
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  const body = await readJsonObject(request);
  if (!body) return invalidJsonResponse();
  const role =
    typeof body.role === 'string' ? body.role.trim().slice(0, 100) : '';
  const company =
    typeof body.company === 'string' ? body.company.trim().slice(0, 100) : '';
  const helpsWith =
    typeof body.helpsWith === 'string'
      ? body.helpsWith.trim().slice(0, 120)
      : '';
  if (!role || !company || !helpsWith)
    return Response.json(
      { error: 'Role, organization, and help topic are required.' },
      { status: 400 },
    );
  const initials = user.displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const existing = await env.DB.prepare(
    `SELECT id, verified FROM mentors WHERE user_id=?`,
  )
    .bind(user.userId)
    .first<{ id: string; verified: number }>();
  if (existing) {
    await env.DB.prepare(
      `UPDATE mentors SET role=?, company=?, helps_with=?, bio=?, accepting_requests=? WHERE id=?`,
    )
      .bind(
        role,
        company,
        helpsWith,
        helpsWith,
        existing.verified ? 1 : 0,
        existing.id,
      )
      .run();
  } else {
    await env.DB.prepare(`INSERT INTO mentors
      (id, user_id, name, initials, role, company, languages, helps_with, bio, city, specialty, verified, accepting_requests)
      VALUES (?, ?, ?, ?, ?, ?, 'ES · DE · EN', ?, ?, 'Munich', 'AFT', 0, 0)`)
      .bind(
        crypto.randomUUID(),
        user.userId,
        user.displayName,
        initials,
        role,
        company,
        helpsWith,
        helpsWith,
      )
      .run();
  }
  await env.DB.prepare(`UPDATE profiles SET role='mentor' WHERE user_id=?`)
    .bind(user.userId)
    .run();
  return Response.json(
    {
      ok: true,
      verificationStatus: existing?.verified ? 'verified' : 'pending',
    },
    { status: existing ? 200 : 202 },
  );
}
