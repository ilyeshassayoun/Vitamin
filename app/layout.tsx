import type { Metadata } from 'next';
import { DM_Sans, Manrope } from 'next/font/google';
import './globals.css';

const body = DM_Sans({ variable: '--font-body', subsets: ['latin'] });
const heading = Manrope({ variable: '--font-display', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vitamin · Access built on effort',
  description: 'A Munich mentorship community where effort and reliability open doors—not inherited connections.',
  manifest: '/site.webmanifest',
  themeColor: '#173f30',
  openGraph: { title: 'Vitamin', description: 'Access built on effort.', images: ['/og.png'] },
  twitter: { card: 'summary_large_image', title: 'Vitamin', description: 'Access built on effort.', images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${body.variable} ${heading.variable} antialiased`}>{children}</body></html>;
}
