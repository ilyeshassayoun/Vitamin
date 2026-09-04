# Vitamin

Vitamin is a mentorship pilot application built with Vinext. Railway runs the Node application, while Supabase provides passwordless authentication and PostgreSQL.

## Railway deployment

1. Create a Supabase project and copy its session-pooler connection string.
2. In Supabase Auth URL Configuration, set the Railway public domain as the Site URL and add `https://<your-domain>/auth/callback` as a redirect URL.
3. Create a Railway service from this repository. Keep the repository root as the Railway root directory; Railway will detect the root `Dockerfile`. Set these variables before deploying:

   - `DATABASE_URL` — the Supabase session-pooler connection string.
   - `DATABASE_SSL=require`
   - `DATABASE_POOL_SIZE=10`
   - `SUPABASE_URL` — the project URL.
   - `SUPABASE_PUBLISHABLE_KEY` — the project publishable key, never a service-role key.
   - `SITE_URL` — optional on Railway because `RAILWAY_PUBLIC_DOMAIN` is detected automatically; otherwise use the exact HTTPS origin without a trailing slash.

4. Generate a Railway domain and deploy. `railway.toml` uses the pinned Node Docker image and sets `DEPLOY_TARGET=railway` while building so the server uses Node networking rather than Cloudflare bindings. It then applies pending PostgreSQL migrations under an advisory lock, starts on Railway's `PORT`, and checks `/api/health` before marking the deployment healthy.

If Railway reports a deploy failure after a successful image build, first check the five database and Supabase variables above. The process prints the exact missing variable names and stops before booting, and the health check intentionally returns `503` when PostgreSQL cannot be reached.

The application connects to PostgreSQL only from server routes. Public and authenticated Data API roles are denied direct table access; authorization remains in the server API.

## Local development

Copy `.env.example` to `.env.local`, supply a Supabase development project, and run `npm run dev`. Without `DATABASE_URL`, local development continues to use the existing Cloudflare D1 binding.

Before a production release, review the pilot privacy and terms text with qualified counsel.
