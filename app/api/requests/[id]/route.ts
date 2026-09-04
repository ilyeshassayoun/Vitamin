import { env } from 'cloudflare:workers';
import { requireApiUser } from '@/lib/current-user';
import { getRequestForParticipant, notify } from '@/lib/domain';
import { invalidJsonResponse, readJsonObject } from '@/lib/http';

const transitions: Record<string, string[]> = {
  pending: ['accepted', 'declined', 'cancelled'],
  accepted: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireApiUser();
  if (!user)
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  const { id } = await context.params;
  const item = await getRequestForParticipant(id, user.userId);
  if (!item)
    return Response.json({ error: 'Request not found' }, { status: 404 });
  const body = await readJsonObject(request);
  if (!body) return invalidJsonResponse();
  const action = typeof body.action === 'string' ? body.action : '';
  const now = new Date().toISOString();
  const isMentor = item.mentorUserId === user.userId;
  const isMentee = item.mentee_id === user.userId;
  if (action === 'schedule') {
    if (!isMentor || !['accepted', 'active'].includes(String(item.status)))
      return Response.json(
        { error: 'Only the mentor can schedule an accepted request.' },
        { status: 403 },
      );
    const scheduledFor =
      typeof body.scheduledFor === 'string' ? body.scheduledFor : '';
    const url =
      typeof body.schedulingUrl === 'string'
        ? body.schedulingUrl.trim().slice(0, 500)
        : '';
    const scheduledAt = Date.parse(scheduledFor);
    if (!Number.isFinite(scheduledAt) || scheduledAt <= Date.now())
      return Response.json(
        { error: 'Choose a valid future date and time.' },
        { status: 400 },
      );
    if (url) {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'https:')
          return Response.json(
            { error: 'Use a secure HTTPS meeting link.' },
            { status: 400 },
          );
      } catch {
        return Response.json(
          { error: 'Enter a valid meeting link.' },
          { status: 400 },
        );
      }
    }
    await env.DB.prepare(
      `UPDATE help_requests SET scheduled_for=?, scheduling_url=?, status='active', updated_at=? WHERE id=?`,
    )
      .bind(scheduledFor, url, now, id)
      .run();
    await notify(
      String(item.mentee_id),
      'scheduled',
      'Conversation scheduled',
      `${String(item.mentorName)} scheduled your conversation.`,
    );
    return Response.json({ ok: true });
  }
  if (action === 'complete') {
    if (!['accepted', 'active'].includes(String(item.status)))
      return Response.json(
        { error: 'Only an accepted conversation can be completed.' },
        { status: 409 },
      );
    const column = isMentor
      ? 'mentor_completed'
      : isMentee
        ? 'mentee_completed'
        : null;
    if (!column)
      return Response.json({ error: 'Not allowed' }, { status: 403 });
    await env.DB.prepare(
      `UPDATE help_requests SET ${column}=1, updated_at=? WHERE id=?`,
    )
      .bind(now, id)
      .run();
    const updated = await env.DB.prepare(
      `SELECT mentee_completed, mentor_completed FROM help_requests WHERE id=?`,
    )
      .bind(id)
      .first<{ mentee_completed: number; mentor_completed: number }>();
    if (updated?.mentee_completed && updated.mentor_completed) {
      await env.DB.prepare(
        `UPDATE help_requests SET status='completed', updated_at=? WHERE id=?`,
      )
        .bind(now, id)
        .run();
      await Promise.all([
        notify(
          String(item.mentee_id),
          'review_due',
          'Share private feedback',
          'Both sides completed the conversation. Your double-blind review is ready.',
        ),
        notify(
          item.mentorUserId ? String(item.mentorUserId) : null,
          'review_due',
          'Share private feedback',
          'Both sides completed the conversation. Your double-blind review is ready.',
        ),
      ]);
    }
    return Response.json({ ok: true });
  }
  const target =
    action === 'accept'
      ? 'accepted'
      : action === 'decline'
        ? 'declined'
        : action === 'cancel'
          ? 'cancelled'
          : action === 'start'
            ? 'active'
            : '';
  if (!target || !transitions[String(item.status)]?.includes(target))
    return Response.json(
      { error: 'That state change is not allowed.' },
      { status: 409 },
    );
  if (['accepted', 'declined', 'active'].includes(target) && !isMentor)
    return Response.json(
      { error: 'Only the mentor can take this action.' },
      { status: 403 },
    );
  const note =
    typeof body.note === 'string' ? body.note.trim().slice(0, 500) : null;
  await env.DB.prepare(
    `UPDATE help_requests SET status=?, decision_note=?, updated_at=? WHERE id=?`,
  )
    .bind(target, note, now, id)
    .run();
  const recipient = isMentor
    ? String(item.mentee_id)
    : item.mentorUserId
      ? String(item.mentorUserId)
      : null;
  await notify(
    recipient,
    `request_${target}`,
    `Request ${target}`,
    `${user.displayName} marked the request as ${target}.`,
  );
  return Response.json({ ok: true });
}
