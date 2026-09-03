import type { Metadata, Viewport } from 'next';
import { DM_Mono, DM_Sans, Inter, Manrope } from 'next/font/google';
import './globals.css';

const body = DM_Sans({ variable: '--font-body', subsets: ['latin'] });
const heading = Manrope({ variable: '--font-display', subsets: ['latin'] });
const figmaSans = Inter({ variable: '--font-figma-sans', subsets: ['latin'] });
const figmaMono = DM_Mono({ variable: '--font-figma-mono', subsets: ['latin'], weight: ['400', '500'] });

export const metadata: Metadata = {
  title: 'Vitamin · Access built on effort',
  description: 'A Munich mentorship community where effort and reliability open doors—not inherited connections.',
  manifest: '/site.webmanifest',
  openGraph: { title: 'Vitamin', description: 'Access built on effort.', images: ['/og.png'] },
  twitter: { card: 'summary_large_image', title: 'Vitamin', description: 'Access built on effort.', images: ['/og.png'] },
};

export const viewport: Viewport = { themeColor: '#173f30' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${body.variable} ${heading.variable} ${figmaSans.variable} ${figmaMono.variable} antialiased`}>{children}</body></html>;
}
