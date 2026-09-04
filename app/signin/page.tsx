import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign in · Vitamin',
  description: 'Sign in to the Vitamin mentorship pilot.',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next =
    params.next?.startsWith('/') && !params.next.startsWith('//')
      ? params.next
      : '/app';
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f4f0] px-6 text-[#1d2226]">
      <div className="w-full max-w-md rounded-xl border border-black/10 bg-white p-7 shadow-[0_24px_80px_rgba(29,34,38,.1)] sm:p-9">
        <Link href="/" className="text-sm font-black tracking-[-.04em]">
          VITAMIN
        </Link>
        <p className="mt-10 font-mono text-xs tracking-[.16em] text-[#0a66c2]">
          PASSWORDLESS ACCESS
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.055em]">
          Sign in by email.
        </h1>
        <p className="mt-4 leading-7 text-[#66707a]">
          We’ll send a secure one-time link to your inbox. No password is stored
          by Vitamin.
        </p>
        {params.sent === '1' && (
          <p className="mt-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Check your inbox and open the sign-in link on this device.
          </p>
        )}
        {params.error && (
          <p className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {params.error}
          </p>
        )}
        <form action="/api/auth/sign-in" method="post" className="mt-7">
          <input type="hidden" name="next" value={next} />
          <label htmlFor="email" className="text-sm font-bold">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-2 h-12 w-full rounded-md border border-black/15 px-4 outline-none transition focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/15"
          />
          <button
            type="submit"
            className="mt-4 h-12 w-full rounded-md bg-[#1d2226] text-sm font-bold text-white transition hover:bg-[#0a66c2]"
          >
            Email me a sign-in link
          </button>
        </form>
        <p className="mt-5 text-xs leading-5 text-[#7a838c]">
          By continuing, you agree to the{' '}
          <Link href="/legal#terms" className="underline">
            pilot terms
          </Link>{' '}
          and acknowledge the{' '}
          <Link href="/legal#privacy" className="underline">
            privacy notice
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
