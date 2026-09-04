import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getRuntimeEnv } from '@/lib/runtime-env';

export async function POST(request: Request) {
  const form = await request.formData();
  const emailValue = form.get('email');
  const nextValue = form.get('next');
  const email =
    typeof emailValue === 'string' ? emailValue.trim().toLowerCase() : '';
  const requestedNext = typeof nextValue === 'string' ? nextValue : '/app';
  const next =
    requestedNext.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : '/app';
  const signIn = new URL('/signin', request.url);
  signIn.searchParams.set('next', next);
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    signIn.searchParams.set('error', 'Enter a valid email address.');
    return Response.redirect(signIn, 303);
  }

  const railwayDomain = getRuntimeEnv('RAILWAY_PUBLIC_DOMAIN');
  const railwayOrigin = railwayDomain
    ? `https://${railwayDomain}`
    : undefined;
  const configuredOrigin =
    getRuntimeEnv('SITE_URL') ??
    getRuntimeEnv('NEXT_PUBLIC_SITE_URL') ??
    railwayOrigin;
  const origin = configuredOrigin
    ? configuredOrigin.replace(/\/$/, '')
    : new URL(request.url).origin;
  const callback = new URL('/auth/callback', origin);
  callback.searchParams.set('next', next);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callback.toString() },
  });
  if (error) {
    signIn.searchParams.set('error', 'The sign-in email could not be sent.');
    return Response.redirect(signIn, 303);
  }
  signIn.searchParams.set('sent', '1');
  return Response.redirect(signIn, 303);
}
