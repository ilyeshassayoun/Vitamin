import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getRuntimeEnv } from '@/lib/runtime-env';

export function isSupabaseConfigured() {
  return Boolean(
    getRuntimeEnv('SUPABASE_URL') && getRuntimeEnv('SUPABASE_PUBLISHABLE_KEY'),
  );
}

export async function createSupabaseServerClient() {
  const url = getRuntimeEnv('SUPABASE_URL');
  const key = getRuntimeEnv('SUPABASE_PUBLISHABLE_KEY');
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required.');
  }
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write cookies. Route handlers refresh them.
        }
      },
    },
  });
}
