import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Vitamin',
  description: 'How the Vitamin mentorship pilot works and who it serves.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f5f4f0] text-[#1d2226]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-6">
          <Link href="/" className="font-black tracking-[-.04em]">
            VITAMIN
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#0a66c2]"
          >
            <ArrowLeft className="size-4" /> Back to the site
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1120px] px-6 py-16 sm:py-24">
        <p className="font-mono text-xs tracking-[.18em] text-[#0a66c2]">
          ABOUT / VITAMIN
        </p>
        <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[.96] tracking-[-.06em] sm:text-7xl">
          Useful experience should circulate.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-[#5d6670]">
          Vitamin connects people facing a specific professional decision with
          someone who has already crossed similar terrain. Access grows through
          contribution and reliable follow-through—not inherited networks or
          payment.
        </p>

        <section
          id="pilot"
          className="mt-20 grid gap-px overflow-hidden rounded-xl border border-black/10 bg-black/10 md:grid-cols-3"
        >
          {[
            [
              '01',
              'Focused pilot',
              'The first version serves Munich’s audit, finance, and tax community.',
            ],
            [
              '02',
              'Human choice',
              'Mentors decide whether to accept each request. Matching never guarantees a response.',
            ],
            [
              '03',
              'Earned access',
              'Members contribute first, then build trust through respectful, completed interactions.',
            ],
          ].map(([number, title, body]) => (
            <article key={number} className="bg-white p-7">
              <p className="font-mono text-xs text-[#0a66c2]">{number}</p>
              <h2 className="mt-8 text-xl font-extrabold">{title}</h2>
              <p className="mt-3 leading-7 text-[#66707a]">{body}</p>
            </article>
          ))}
        </section>

        <section className="mt-20 border-t border-black/10 pt-10">
          <h2 className="text-3xl font-black tracking-[-.04em]">
            Ready to participate?
          </h2>
          <p className="mt-3 max-w-xl leading-7 text-[#66707a]">
            Create your profile, make a useful contribution, and discover
            verified mentors who are currently accepting requests.
          </p>
          <Link
            href="/app"
            className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#1d2226] px-5 py-3 text-sm font-bold text-white hover:bg-[#0a66c2]"
          >
            Open Vitamin <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </main>
  );
}
