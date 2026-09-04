import { getDatabase } from '@/lib/database';

export async function notify(
  userId: string | null,
  type: string,
  title: string,
  body: string,
) {
  const db = await getDatabase();
  if (!userId) return;
  await db
    .prepare(
      `INSERT INTO notifications (id, user_id, type, title, body, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      userId,
      type,
      title,
      body,
      new Date().toISOString(),
    )
    .run();
}

export async function getRequestForParticipant(
  requestId: string,
  userId: string,
) {
  const db = await getDatabase();
  return db
    .prepare(
      `SELECT r.*, m.user_id AS mentorUserId, m.name AS mentorName, u.display_name AS menteeName FROM help_requests r JOIN mentors m ON m.id = r.mentor_id JOIN users u ON u.id = r.mentee_id WHERE r.id = ? AND (r.mentee_id = ? OR m.user_id = ?)`,
    )
    .bind(requestId, userId, userId)
    .first<{
      id: string;
      mentee_id: string;
      mentor_id: string;
      mentorUserId: string | null;
      mentorName: string;
      menteeName: string;
      status: string;
      mentee_completed: number;
      mentor_completed: number;
    }>();
}
