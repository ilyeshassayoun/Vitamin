# Vitamin

Vitamin is a mentorship pilot application built with Vinext. Railway runs the Node application, while Supabase provides passwordless authentication and PostgreSQL.

## Railway deployment

1. Create a Supabase project and copy its session-pooler connection string.
2. In Supabase Auth URL Configuration, set the Railway public domain as the Site URL and add `https://<your-domain>/auth/callback` as a redirect URL.
3. Create a Railway service from this repository and set:

   - `DATABASE_URL` — the Supabase session-pooler connection string.
   - `DATABASE_SSL=require`
   - `DATABASE_POOL_SIZE=10`
   - `SUPABASE_URL` — the project URL.
   - `SUPABASE_PUBLISHABLE_KEY` — the project publishable key, never a service-role key.
   - `NEXT_PUBLIC_SITE_URL` — the exact Railway HTTPS origin, without a trailing slash.

4. Generate a Railway domain and deploy. `railway.toml` builds the application, applies pending PostgreSQL migrations under an advisory lock, starts the production server on Railway's `PORT`, and checks `/api/health` before marking the deployment healthy.

The application connects to PostgreSQL only from server routes. Public and authenticated Data API roles are denied direct table access; authorization remains in the server API.

## Local development

Copy `.env.example` to `.env.local`, supply a Supabase development project, and run `npm run dev`. Without `DATABASE_URL`, local development continues to use the existing Cloudflare D1 binding.

Before a production release, review the pilot privacy and terms text with qualified counsel.
