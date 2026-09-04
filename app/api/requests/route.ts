import { getDatabase } from '@/lib/database';
import { requireApiUser } from '@/lib/current-user';
import { notify } from '@/lib/domain';
import { invalidJsonResponse, readJsonObject } from '@/lib/http';

export async function GET() {
  const db = await getDatabase();
  const user = await requireApiUser();
  if (!user)
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  const result = await db
    .prepare(
      `SELECT r.id, r.topic, r.context, r.status, r.created_at AS createdAt, m.name AS mentorName, m.role AS mentorRole FROM help_requests r JOIN mentors m ON m.id = r.mentor_id WHERE r.mentee_id = ? ORDER BY r.created_at DESC`,
    )
    .bind(user.userId)
    .all();
  return Response.json({ requests: result.results });
}

export async function POST(request: Request) {
  const db = await getDatabase();
  const user = await requireApiUser();
  if (!user)
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  const body = await readJsonObject(request);
  if (!body) return invalidJsonResponse();
  const mentorId = typeof body.mentorId === 'string' ? body.mentorId : '';
  const topic =
    typeof body.topic === 'string' ? body.topic.trim().slice(0, 120) : '';
  const context =
    typeof body.context === 'string' ? body.context.trim().slice(0, 2000) : '';
  if (!mentorId || topic.length < 3 || context.length < 20)
    return Response.json(
      { error: 'A mentor, topic, and specific context are required.' },
      { status: 400 },
    );
  const profile = await db
    .prepare(
      `SELECT onboarding_complete AS onboardingComplete, verification_status AS verificationStatus, active_request_limit AS activeRequestLimit FROM profiles WHERE user_id = ?`,
    )
    .bind(user.userId)
    .first<{
      onboardingComplete: number;
      verificationStatus: string;
      activeRequestLimit: number;
    }>();
  if (!profile?.onboardingComplete)
    return Response.json(
      { error: 'Complete your contribution before requesting direct help.' },
      { status: 403 },
    );
  if (profile.verificationStatus !== 'verified')
    return Response.json(
      {
        error:
          'Identity verification is required before requesting direct help.',
      },
      { status: 403 },
    );
  const mentor = await db
    .prepare(
      `SELECT id, user_id AS userId FROM mentors WHERE id = ? AND user_id IS NOT NULL AND verified = 1 AND accepting_requests = 1`,
    )
    .bind(mentorId)
    .first<{ id: string; userId: string }>();
  if (!mentor)
    return Response.json(
      { error: 'This verified mentor is not currently accepting requests.' },
      { status: 404 },
    );
  if (mentor.userId === user.userId)
    return Response.json(
      { error: 'You cannot send a mentorship request to yourself.' },
      { status: 409 },
    );
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const created = await db
    .prepare(`INSERT INTO help_requests (id, mentee_id, mentor_id, topic, context, created_at, updated_at)
    SELECT ?, ?, ?, ?, ?, ?, ?
    WHERE (SELECT COUNT(*) FROM help_requests WHERE mentee_id = ? AND status IN ('pending', 'accepted', 'active')) < ?`)
    .bind(
      id,
      user.userId,
      mentorId,
      topic,
      context,
      now,
      now,
      user.userId,
      profile.activeRequestLimit,
    )
    .run();
  if (!created.meta.changes)
    return Response.json(
      {
        error: `You can have ${profile.activeRequestLimit} active request at this stage.`,
      },
      { status: 409 },
    );
  await notify(
    mentor.userId,
    'new_request',
    'New mentorship request',
    `${user.displayName} sent a focused request.`,
  );
  return Response.json({ id, ok: true }, { status: 201 });
}
