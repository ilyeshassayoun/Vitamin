import { getDatabase } from '@/lib/database';
import { requireApiUser } from '@/lib/current-user';
import { invalidJsonResponse, readJsonObject } from '@/lib/http';

export async function GET() {
  const db = await getDatabase();
  const user = await requireApiUser();
  if (!user)
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  const profile = await db
    .prepare(
      `SELECT u.id, u.email, u.display_name AS displayName, p.language, p.situation, p.field, p.location, p.verification_status AS verificationStatus, p.role, p.active_request_limit AS activeRequestLimit, p.onboarding_complete AS onboardingComplete FROM users u JOIN profiles p ON p.user_id = u.id WHERE u.id = ?`,
    )
    .bind(user.userId)
    .first();
  return Response.json({ profile });
}

export async function PUT(request: Request) {
  const db = await getDatabase();
  const user = await requireApiUser();
  if (!user)
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  const body = await readJsonObject(request);
  if (!body) return invalidJsonResponse();
  const language = body.language === 'de' ? 'de' : 'es';
  const situation =
    typeof body.situation === 'string' ? body.situation.slice(0, 80) : null;
  await db
    .prepare(
      `UPDATE profiles SET language = ?, situation = ?, field = 'AFT', location = 'Munich' WHERE user_id = ?`,
    )
    .bind(language, situation, user.userId)
    .run();
  return Response.json({ ok: true });
}
