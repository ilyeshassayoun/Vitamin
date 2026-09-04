CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'es',
  situation text,
  field text NOT NULL DEFAULT 'AFT',
  location text NOT NULL DEFAULT 'Munich',
  verification_status text NOT NULL DEFAULT 'pending',
  role text NOT NULL DEFAULT 'mentee',
  active_request_limit integer NOT NULL DEFAULT 1,
  onboarding_complete integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contributions (
  id text PRIMARY KEY,
  author_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'published',
  created_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contributions_author ON contributions (author_id, created_at);

CREATE TABLE IF NOT EXISTS mentors (
  id text PRIMARY KEY,
  user_id text UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL,
  initials text NOT NULL,
  role text NOT NULL,
  company text NOT NULL,
  languages text NOT NULL,
  helps_with text NOT NULL,
  bio text,
  city text NOT NULL DEFAULT 'Munich',
  specialty text NOT NULL DEFAULT 'AFT',
  image_url text,
  response_minutes integer NOT NULL DEFAULT 15,
  featured_rank integer NOT NULL DEFAULT 1000,
  verified integer NOT NULL DEFAULT 0,
  access_tier integer NOT NULL DEFAULT 1,
  accepting_requests integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_mentors_discovery ON mentors (accepting_requests, verified, featured_rank, name);

CREATE TABLE IF NOT EXISTS help_requests (
  id text PRIMARY KEY,
  mentee_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id text NOT NULL REFERENCES mentors(id),
  topic text NOT NULL,
  context text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  decision_note text,
  scheduled_for text,
  scheduling_url text,
  mentee_completed integer NOT NULL DEFAULT 0,
  mentor_completed integer NOT NULL DEFAULT 0,
  created_at text NOT NULL,
  updated_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_help_requests_mentee_status ON help_requests (mentee_id, status);
CREATE INDEX IF NOT EXISTS idx_help_requests_mentor_status ON help_requests (mentor_id, status);

CREATE TABLE IF NOT EXISTS interaction_notes (
  id text PRIMARY KEY,
  request_id text NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  author_id text NOT NULL REFERENCES users(id),
  body text NOT NULL,
  created_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_interaction_notes_request ON interaction_notes (request_id, created_at);
CREATE INDEX IF NOT EXISTS idx_interaction_notes_author ON interaction_notes (author_id);

CREATE TABLE IF NOT EXISTS reviews (
  id text PRIMARY KEY,
  request_id text NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  reviewer_id text NOT NULL REFERENCES users(id),
  reviewee_id text NOT NULL REFERENCES users(id),
  effort_rating integer NOT NULL CHECK (effort_rating BETWEEN 1 AND 5),
  outcome text NOT NULL,
  potential_direction text,
  released integer NOT NULL DEFAULT 0,
  created_at text NOT NULL,
  UNIQUE (request_id, reviewer_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_released ON reviews (reviewee_id, released);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews (reviewer_id);

CREATE TABLE IF NOT EXISTS reputation_events (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id),
  request_id text NOT NULL REFERENCES help_requests(id),
  kind text NOT NULL,
  created_at text NOT NULL,
  UNIQUE (user_id, request_id, kind)
);
CREATE INDEX IF NOT EXISTS idx_reputation_user ON reputation_events (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reputation_request ON reputation_events (request_id);

CREATE TABLE IF NOT EXISTS internal_flags (
  id text PRIMARY KEY,
  request_id text NOT NULL REFERENCES help_requests(id),
  reporter_id text NOT NULL REFERENCES users(id),
  reported_user_id text NOT NULL REFERENCES users(id),
  kind text NOT NULL,
  details text NOT NULL,
  response text,
  status text NOT NULL DEFAULT 'open',
  created_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_flags_reported_status ON internal_flags (reported_user_id, status);
CREATE INDEX IF NOT EXISTS idx_flags_reporter ON internal_flags (reporter_id);
CREATE INDEX IF NOT EXISTS idx_flags_request ON internal_flags (request_id);

CREATE TABLE IF NOT EXISTS disputes (
  id text PRIMARY KEY,
  review_id text REFERENCES reviews(id),
  flag_id text REFERENCES internal_flags(id),
  opened_by text NOT NULL REFERENCES users(id),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at text NOT NULL,
  CHECK ((review_id IS NOT NULL)::integer + (flag_id IS NOT NULL)::integer = 1)
);
CREATE INDEX IF NOT EXISTS idx_disputes_review ON disputes (review_id);
CREATE INDEX IF NOT EXISTS idx_disputes_flag ON disputes (flag_id);
CREATE INDEX IF NOT EXISTS idx_disputes_opened_by ON disputes (opened_by);

CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  read_at text,
  created_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, read_at, created_at);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

DO $$
DECLARE
  protected_table text;
BEGIN
  FOREACH protected_table IN ARRAY ARRAY[
    'users', 'profiles', 'contributions', 'mentors', 'help_requests',
    'interaction_notes', 'reviews', 'reputation_events', 'internal_flags',
    'disputes', 'notifications'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = protected_table
        AND policyname = 'server_only'
    ) THEN
      EXECUTE format(
        'CREATE POLICY server_only ON public.%I FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
        protected_table
      );
    END IF;
  END LOOP;
END
$$;
