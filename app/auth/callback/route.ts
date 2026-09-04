import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const requestedNext = url.searchParams.get('next') ?? '/app';
  const next =
    requestedNext.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : '/app';
  const supabase = await createSupabaseServerClient();
  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error('Missing authentication code.') };
  if (result.error) {
    const signIn = new URL('/signin', url.origin);
    signIn.searchParams.set(
      'error',
      'That sign-in link is invalid or expired.',
    );
    return Response.redirect(signIn, 303);
  }
  return Response.redirect(new URL(next, url.origin), 303);
}
