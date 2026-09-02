import { env } from 'cloudflare:workers';
import { requireApiUser } from '@/lib/current-user';
import { getRequestForParticipant, notify } from '@/lib/domain';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser(); if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 }); const { id } = await context.params;
  if (!await getRequestForParticipant(id, user.userId)) return Response.json({ error: 'Not found' }, { status: 404 });
  const rows = await env.DB.prepare(`SELECT n.id, n.body, n.created_at AS createdAt, u.display_name AS authorName FROM interaction_notes n JOIN users u ON u.id=n.author_id WHERE n.request_id=? ORDER BY n.created_at`).bind(id).all();
  return Response.json({ notes: rows.results });
}
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser(); if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 }); const { id } = await context.params; const item = await getRequestForParticipant(id, user.userId);
  if (!item || !['accepted','active'].includes(String(item.status))) return Response.json({ error: 'Notes are available during an accepted engagement.' }, { status: 403 });
  const data = await request.json() as Record<string,unknown>; const body = typeof data.body === 'string' ? data.body.trim().slice(0, 1500) : ''; if (!body) return Response.json({ error: 'Write a note first.' }, { status: 400 });
  await env.DB.prepare(`INSERT INTO interaction_notes (id, request_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?)`).bind(crypto.randomUUID(), id, user.userId, body, new Date().toISOString()).run();
  const recipient = item.mentorUserId === user.userId ? String(item.mentee_id) : item.mentorUserId ? String(item.mentorUserId) : null; await notify(recipient, 'new_note', 'New interaction note', `${user.displayName} added a note to your conversation.`);
  return Response.json({ ok: true }, { status: 201 });
}
