import { getDatabase } from '@/lib/database';
import { requireApiUser } from '@/lib/current-user';

export async function GET() {
  const db = await getDatabase();
  const user = await requireApiUser();
  if (!user)
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  const [
    profile,
    mentor,
    outgoing,
    incoming,
    reviews,
    notifications,
    reputation,
    flags,
  ] = await Promise.all([
    db
      .prepare(
        `SELECT u.display_name AS displayName, p.language, p.situation, p.verification_status AS verificationStatus, p.role, p.active_request_limit AS activeRequestLimit, p.onboarding_complete AS onboardingComplete FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.id=?`,
      )
      .bind(user.userId)
      .first(),
    db
      .prepare(
        `SELECT id, name, role, company, languages, helps_with AS helpsWith, verified, accepting_requests AS acceptingRequests FROM mentors WHERE user_id=?`,
      )
      .bind(user.userId)
      .first(),
    db
      .prepare(
        `SELECT r.*, m.name AS mentorName, m.role AS mentorRole, (SELECT COUNT(*) FROM reviews rv WHERE rv.request_id=r.id AND rv.reviewer_id=?) AS reviewed FROM help_requests r JOIN mentors m ON m.id=r.mentor_id WHERE r.mentee_id=? ORDER BY r.updated_at DESC`,
      )
      .bind(user.userId, user.userId)
      .all(),
    db
      .prepare(
        `SELECT r.*, u.display_name AS menteeName, (SELECT COUNT(*) FROM reviews rv WHERE rv.request_id=r.id AND rv.reviewer_id=?) AS reviewed FROM help_requests r JOIN mentors m ON m.id=r.mentor_id JOIN users u ON u.id=r.mentee_id WHERE m.user_id=? ORDER BY r.updated_at DESC`,
      )
      .bind(user.userId, user.userId)
      .all(),
    db
      .prepare(
        `SELECT rv.id, rv.request_id AS requestId, rv.effort_rating AS effortRating, rv.outcome, rv.potential_direction AS potentialDirection, rv.released, u.display_name AS reviewerName FROM reviews rv JOIN users u ON u.id=rv.reviewer_id WHERE rv.reviewee_id=? AND rv.released=1 ORDER BY rv.created_at DESC`,
      )
      .bind(user.userId)
      .all(),
    db
      .prepare(
        `SELECT id, type, title, body, read_at AS readAt, created_at AS createdAt FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 20`,
      )
      .bind(user.userId)
      .all(),
    db
      .prepare(
        `SELECT COUNT(*) AS positiveSignals FROM reputation_events WHERE user_id=?`,
      )
      .bind(user.userId)
      .first(),
    db
      .prepare(
        `SELECT f.id, f.request_id AS requestId, f.kind, f.details, f.response, f.status, f.created_at AS createdAt, u.display_name AS reporterName FROM internal_flags f JOIN users u ON u.id=f.reporter_id WHERE f.reported_user_id=? ORDER BY f.created_at DESC`,
      )
      .bind(user.userId)
      .all(),
  ]);
  return Response.json({
    profile,
    mentor,
    outgoing: outgoing.results,
    incoming: incoming.results,
    reviews: reviews.results,
    notifications: notifications.results,
    reputation,
    flags: flags.results,
  });
}
