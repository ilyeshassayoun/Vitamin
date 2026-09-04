import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy and Terms · Vitamin',
  description:
    'Pilot privacy, terms, data-rights, and cookie information for Vitamin.',
};

const sections = [
  {
    id: 'privacy',
    title: 'Privacy',
    body: [
      'Vitamin stores the profile information you submit, contributions, mentorship requests, scheduling details, interaction notes, reviews, safety reports, and notifications needed to operate the pilot.',
      'This information is used to provide the mentorship workflow, enforce access limits, release double-blind feedback, maintain safety, and improve the pilot. Private workspace information is not displayed on the public mentor directory unless it is part of an approved mentor profile.',
    ],
  },
  {
    id: 'terms',
    title: 'Terms of participation',
    body: [
      'Vitamin facilitates voluntary peer conversations. Mentors may decline requests, and conversations are not legal, financial, tax, medical, employment, or other professional advice.',
      'Participants must provide accurate information, respect confidentiality, avoid harassment and solicitation, and use safety reporting responsibly. Access may be limited while reports or disputes are reviewed.',
    ],
  },
  {
    id: 'gdpr',
    title: 'Data rights',
    body: [
      'People in the pilot may request access to, correction of, or deletion of their personal information, subject to records that must be retained for security, disputes, or legal obligations.',
      'Until a dedicated privacy contact is published, raise a data concern through the Safety area in your Vitamin workspace. The pilot team will verify the request before acting on account data.',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies and local storage',
    body: [
      'Vitamin uses essential session and security storage to keep you signed in and protect authenticated actions. The pilot does not intentionally use advertising cookies.',
      'Blocking essential storage may prevent sign-in and workspace features from functioning.',
    ],
  },
];

export default function LegalPage() {
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

      <div className="mx-auto grid max-w-[1120px] gap-12 px-6 py-16 lg:grid-cols-[240px_1fr] lg:py-24">
        <aside>
          <p className="font-mono text-xs tracking-[.18em] text-[#0a66c2]">
            PILOT INFORMATION
          </p>
          <nav className="mt-6 flex flex-col gap-3 text-sm font-semibold">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-[#66707a] hover:text-[#0a66c2]"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <div>
          <h1 className="text-5xl font-black tracking-[-.055em] sm:text-6xl">
            Privacy and terms
          </h1>
          <div className="mt-8 rounded-md border border-[#c77a1f]/30 bg-[#fff2df] p-4 text-sm leading-6 text-[#70420e]">
            These are operational notices for the Munich pilot, not final legal
            documents. They should be reviewed by qualified counsel before a
            broader launch.
          </div>
          <div className="mt-12 space-y-16">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-8 border-t border-black/10 pt-8"
              >
                <h2 className="text-3xl font-black tracking-[-.04em]">
                  {section.title}
                </h2>
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-5 max-w-3xl text-base leading-8 text-[#5d6670]"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
