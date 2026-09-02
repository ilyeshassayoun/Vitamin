import { env } from 'cloudflare:workers';
import { requireApiUser } from '@/lib/current-user';
import { getRequestForParticipant, notify } from '@/lib/domain';

export async function POST(request: Request) {
  const user = await requireApiUser(); if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });
  const body = await request.json() as Record<string, unknown>; const requestId = typeof body.requestId === 'string' ? body.requestId : ''; const item = await getRequestForParticipant(requestId, user.userId);
  if (!item || item.status !== 'completed') return Response.json({ error: 'Reviews open only after both sides complete the interaction.' }, { status: 403 });
  const effortRating = Number(body.effortRating); const outcome = ['yes','no','ongoing','not_applicable'].includes(String(body.outcome)) ? String(body.outcome) : 'not_applicable'; const direction = typeof body.potentialDirection === 'string' ? body.potentialDirection.trim().slice(0, 1500) : null;
  if (!Number.isInteger(effortRating) || effortRating < 1 || effortRating > 5) return Response.json({ error: 'Choose an effort rating from 1 to 5.' }, { status: 400 });
  const revieweeId = item.mentorUserId === user.userId ? String(item.mentee_id) : item.mentorUserId ? String(item.mentorUserId) : null;
  if (!revieweeId) return Response.json({ error: 'This demo mentor is not linked to an account yet.' }, { status: 409 });
  try { await env.DB.prepare(`INSERT INTO reviews (id, request_id, reviewer_id, reviewee_id, effort_rating, outcome, potential_direction, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(crypto.randomUUID(), requestId, user.userId, revieweeId, effortRating, outcome, direction, new Date().toISOString()).run(); }
  catch { return Response.json({ error: 'You already submitted this review.' }, { status: 409 }); }
  const count = await env.DB.prepare(`SELECT COUNT(*) AS count FROM reviews WHERE request_id=?`).bind(requestId).first<{count:number}>();
  if ((count?.count ?? 0) >= 2) {
    await env.DB.prepare(`UPDATE reviews SET released=1 WHERE request_id=?`).bind(requestId).run();
    const positive = await env.DB.prepare(`SELECT reviewee_id AS revieweeId FROM reviews WHERE request_id=? AND effort_rating>=4`).bind(requestId).all<{revieweeId:string}>();
    await env.DB.batch(positive.results.map((row) => env.DB.prepare(`INSERT OR IGNORE INTO reputation_events (id, user_id, request_id, kind, created_at) VALUES (?, ?, ?, 'positive_effort', ?)`).bind(crypto.randomUUID(), row.revieweeId, requestId, new Date().toISOString())));
    await Promise.all([notify(String(item.mentee_id), 'reviews_released', 'Feedback is ready', 'Both private reviews are now available.'), notify(item.mentorUserId ? String(item.mentorUserId) : null, 'reviews_released', 'Feedback is ready', 'Both private reviews are now available.')]);
  }
  return Response.json({ ok: true, released: (count?.count ?? 0) >= 2 }, { status: 201 });
}
