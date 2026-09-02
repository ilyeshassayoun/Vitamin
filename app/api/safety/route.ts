import { env } from 'cloudflare:workers';
import { requireApiUser } from '@/lib/current-user';
import { getRequestForParticipant, notify } from '@/lib/domain';

export async function POST(request: Request) {
  const user = await requireApiUser(); if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 }); const body = await request.json() as Record<string,unknown>; const requestId = typeof body.requestId === 'string' ? body.requestId : ''; const item = await getRequestForParticipant(requestId, user.userId); if (!item) return Response.json({ error: 'Interaction not found' }, { status: 404 });
  const action = typeof body.action === 'string' ? body.action : ''; const details = typeof body.details === 'string' ? body.details.trim().slice(0, 2000) : ''; if (details.length < 20) return Response.json({ error: 'Please provide enough detail for a fair review.' }, { status: 400 });
  if (action === 'flag') {
    const reportedUserId = item.mentorUserId === user.userId ? String(item.mentee_id) : item.mentorUserId ? String(item.mentorUserId) : null; if (!reportedUserId) return Response.json({ error: 'This mentor is not linked to a user account.' }, { status: 409 });
    const kind = ['no_show','non_engagement','conduct'].includes(String(body.kind)) ? String(body.kind) : 'conduct'; const id = crypto.randomUUID(); await env.DB.prepare(`INSERT INTO internal_flags (id, request_id, reporter_id, reported_user_id, kind, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(id, requestId, user.userId, reportedUserId, kind, details, new Date().toISOString()).run(); await notify(reportedUserId, 'right_to_respond', 'A private concern needs your response', 'A concern was submitted. It is not public and no consequence is applied before review.'); return Response.json({ ok:true, id }, { status:201 });
  }
  if (action === 'dispute') {
    const reviewId = typeof body.reviewId === 'string' ? body.reviewId : null; const flagId = typeof body.flagId === 'string' ? body.flagId : null; if (!reviewId && !flagId) return Response.json({ error: 'Choose the decision you want reviewed.' }, { status:400 }); const id=crypto.randomUUID(); await env.DB.prepare(`INSERT INTO disputes (id, review_id, flag_id, opened_by, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(id, reviewId, flagId, user.userId, details, new Date().toISOString()).run(); return Response.json({ok:true,id},{status:201});
  }
  return Response.json({ error: 'Unsupported safety action' }, { status: 400 });
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(); if (!user) return Response.json({ error:'Authentication required' }, { status:401 });
  const body = await request.json() as Record<string,unknown>; const flagId = typeof body.flagId === 'string' ? body.flagId : ''; const response = typeof body.response === 'string' ? body.response.trim().slice(0,2000) : '';
  if (response.length < 20) return Response.json({ error:'Please provide a complete response.' }, { status:400 });
  const flag = await env.DB.prepare(`SELECT id FROM internal_flags WHERE id=? AND reported_user_id=?`).bind(flagId,user.userId).first(); if(!flag) return Response.json({error:'Concern not found'},{status:404});
  await env.DB.prepare(`UPDATE internal_flags SET response=?, status='responded' WHERE id=?`).bind(response,flagId).run(); return Response.json({ok:true});
}
