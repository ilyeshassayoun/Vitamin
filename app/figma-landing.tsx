'use client';

/* oxlint-disable next/no-html-link-for-pages -- ChatGPT sign-in requires top-level anchor navigation. */

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import svgPaths from './figma-svg-paths';

const imgAvatar = '/figma/f578f9c2a181ef669150341163e63e6e9da01878.png';

const MONO = 'var(--font-figma-mono), monospace';
const SANS = 'var(--font-figma-sans), sans-serif';

type LandingMentor = {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  languages: string;
  helpsWith: string;
  bio: string;
  city: string;
  specialty: string;
  imageUrl: string | null;
  responseMinutes: number;
  color: string;
};

type LandingMetrics = {
  activeMentors: number;
  completedConversations: number;
  positiveEffortRate: number | null;
  averageSessionMinutes: number;
  pilotLocation: string;
  pilotVertical: string;
};

const DEFAULT_METRICS: LandingMetrics = {
  activeMentors: 0,
  completedConversations: 0,
  positiveEffortRate: null,
  averageSessionMinutes: 15,
  pilotLocation: 'Munich',
  pilotVertical: 'AFT',
};

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const delay = Number(el.dataset.delay ?? 0);
          setTimeout(() => el.classList.add('in'), delay);
          io.unobserve(el);
        });
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll('[data-v]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ─── Cursor ───────────────────────────────────────────────────────────────────
function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const cur = useRef({ x: -200, y: -200 });
  const lag = useRef({ x: -200, y: -200 });
  const raf = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cur.current = { x: e.clientX, y: e.clientY };
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      const link = t.closest('a,button,[data-hover]');
      const dark = t.closest('[data-dark]');
      dot.current?.classList.toggle('expand', !!link);
      ring.current?.classList.toggle('expand', !!link);
      dot.current?.classList.toggle('light', !!dark);
      ring.current?.classList.toggle('light', !!dark);
    };
    const tick = () => {
      lag.current.x += (cur.current.x - lag.current.x) * 0.11;
      lag.current.y += (cur.current.y - lag.current.y) * 0.11;
      if (dot.current) {
        dot.current.style.left = cur.current.x + 'px';
        dot.current.style.top = cur.current.y + 'px';
      }
      if (ring.current) {
        ring.current.style.left = lag.current.x + 'px';
        ring.current.style.top = lag.current.y + 'px';
      }
      raf.current = requestAnimationFrame(tick);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    raf.current = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div ref={dot} className="v-cursor" />
      <div ref={ring} className="v-cursor-ring" />
    </>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <g clipPath="url(#lc)">
        <path
          d={svgPaths.p1e593fc0}
          fill="#2E4FFF"
          stroke="#0E0E0F"
          strokeWidth="2.16667"
        />
      </g>
      <defs>
        <clipPath id="lc">
          <rect width="26" height="26" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({
  openSidebar,
  scrolled,
  signedInName,
}: {
  openSidebar: () => void;
  scrolled: boolean;
  signedInName: string | null;
}) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
      style={{
        borderBottom: scrolled
          ? '1px solid rgba(29,34,38,0.09)'
          : '1px solid transparent',
        background: scrolled ? 'rgba(245,244,240,0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
      }}
    >
      <div className="max-w-[1320px] mx-auto px-6 lg:px-14 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 900,
              letterSpacing: '-0.4px',
              fontSize: '18px',
              color: '#1d2226',
            }}
          >
            VITAMIN
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {['Mentors', 'How It Works', 'Stories'].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
              style={{
                fontFamily: MONO,
                fontSize: '11px',
                color: '#6b7280',
                letterSpacing: '0.5px',
              }}
              className="hover:text-[#1d2226] transition-colors"
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {signedInName ? (
            <Link
              href="/app"
              style={{
                fontFamily: SANS,
                fontSize: '12px',
                fontWeight: 600,
                color: '#1d2226',
                border: '1px solid rgba(29,34,38,0.18)',
                borderRadius: '4px',
                padding: '8px 16px',
              }}
              className="hover:border-[rgba(29,34,38,0.45)] transition-colors"
            >
              Open my Vitamin
            </Link>
          ) : (
            <a
              href="/signin-with-chatgpt?return_to=%2Fapp"
              target="_top"
              style={{
                fontFamily: SANS,
                fontSize: '12px',
                fontWeight: 600,
                color: '#1d2226',
                border: '1px solid rgba(29,34,38,0.18)',
                borderRadius: '4px',
                padding: '8px 16px',
              }}
              className="hover:border-[rgba(29,34,38,0.45)] transition-colors"
            >
              Sign In
            </a>
          )}
          {signedInName ? (
            <Link
              href="/app"
              style={{
                fontFamily: SANS,
                fontSize: '12px',
                fontWeight: 700,
                color: '#fff',
                background: '#1d2226',
                borderRadius: '4px',
                padding: '8px 18px',
              }}
              className="hover:bg-[#0a66c2] transition-colors"
            >
              Start a Conversation
            </Link>
          ) : (
            <a
              href="#mentors"
              style={{
                fontFamily: SANS,
                fontSize: '12px',
                fontWeight: 700,
                color: '#fff',
                background: '#1d2226',
                borderRadius: '4px',
                padding: '8px 18px',
              }}
              className="hover:bg-[#0a66c2] transition-colors"
            >
              Start a Conversation
            </a>
          )}
        </div>
        <button
          onClick={openSidebar}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="menu"
        >
          <span className="w-5 h-px bg-[#1d2226] block" />
          <span className="w-5 h-px bg-[#1d2226] block" />
          <span className="w-3 h-px bg-[#1d2226] block" />
        </button>
      </div>
    </header>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  open,
  close,
  signedInName,
}: {
  open: boolean;
  close: () => void;
  signedInName: string | null;
}) {
  return (
    <>
      <button
        type="button"
        onClick={close}
        aria-label="Close navigation"
        className="fixed inset-0 z-50 transition-all duration-400"
        style={{
          background: 'rgba(29,34,38,0.5)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          backdropFilter: 'blur(6px)',
        }}
      />
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#f5f4f0] flex flex-col"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          borderLeft: '1px solid rgba(29,34,38,0.09)',
        }}
      >
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{ borderBottom: '1px solid rgba(29,34,38,0.07)' }}
        >
          <div className="flex items-center gap-2.5">
            <Logo />
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: '17px',
                color: '#1d2226',
              }}
            >
              VITAMIN
            </span>
          </div>
          <button
            onClick={close}
            style={{ fontFamily: MONO, fontSize: '18px', color: '#9ca3af' }}
            className="hover:text-[#1d2226] transition-colors"
          >
            ×
          </button>
        </div>
        <nav className="flex-1 px-5 py-7 flex flex-col gap-0.5">
          {[
            'Mentors',
            'How It Works',
            'Stories',
            'Become a Mentor',
            'Community',
          ].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={close}
              style={{
                fontFamily: SANS,
                fontSize: '14px',
                fontWeight: 600,
                color: '#1d2226',
                padding: '10px 12px',
                borderRadius: '6px',
              }}
              className="hover:bg-[rgba(29,34,38,0.05)] transition-colors"
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="px-5 pb-8 flex flex-col gap-2.5">
          {signedInName ? (
            <Link
              href="/app"
              style={{
                fontFamily: SANS,
                fontSize: '13px',
                fontWeight: 700,
                color: '#1d2226',
                textAlign: 'center',
                border: '1px solid rgba(29,34,38,0.18)',
                borderRadius: '4px',
                padding: '12px',
              }}
              className="block hover:border-[#1d2226] transition-colors"
            >
              Open my Vitamin
            </Link>
          ) : (
            <a
              href="/signin-with-chatgpt?return_to=%2Fapp"
              target="_top"
              style={{
                fontFamily: SANS,
                fontSize: '13px',
                fontWeight: 700,
                color: '#1d2226',
                textAlign: 'center',
                border: '1px solid rgba(29,34,38,0.18)',
                borderRadius: '4px',
                padding: '12px',
              }}
              className="block hover:border-[#1d2226] transition-colors"
            >
              Sign In
            </a>
          )}
          {signedInName ? (
            <Link
              href="/app"
              onClick={close}
              style={{
                fontFamily: SANS,
                fontSize: '13px',
                fontWeight: 700,
                color: '#fff',
                background: '#1d2226',
                borderRadius: '4px',
                padding: '12px',
                textAlign: 'center',
              }}
              className="block hover:bg-[#0a66c2] transition-colors"
            >
              Start a Conversation
            </Link>
          ) : (
            <a
              href="#mentors"
              onClick={close}
              style={{
                fontFamily: SANS,
                fontSize: '13px',
                fontWeight: 700,
                color: '#fff',
                background: '#1d2226',
                borderRadius: '4px',
                padding: '12px',
                textAlign: 'center',
              }}
              className="block hover:bg-[#0a66c2] transition-colors"
            >
              Start a Conversation
            </a>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({
  m,
  close,
  signedInName,
}: {
  m: LandingMentor;
  close: () => void;
  signedInName: string | null;
}) {
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('keydown', k);
      document.body.style.overflow = '';
    };
  }, [close]);

  async function sendRequest() {
    if (msg.trim().length < 20 || busy) return;
    if (!signedInName) {
      window.location.assign('/signin-with-chatgpt?return_to=%2Fapp');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mentorId: m.id,
          topic: m.helpsWith,
          context: msg,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? 'Your request could not be sent.');
        return;
      }
      setSent(true);
      setTimeout(close, 1800);
    } catch {
      setError('The service is temporarily unavailable. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      style={{
        background: 'rgba(29,34,38,0.72)',
        backdropFilter: 'blur(10px)',
        animation: 'mFade .2s ease both',
      }}
    >
      <style>{`@keyframes mFade{from{opacity:0}to{opacity:1}} @keyframes mSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}`}</style>
      <div
        ref={ref}
        className="bg-[#f5f4f0] w-full max-w-[420px] overflow-hidden"
        style={{
          border: '1px solid rgba(29,34,38,0.12)',
          borderRadius: '12px',
          animation: 'mSlide .3s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        <div
          className="px-8 py-7"
          style={{ borderBottom: '1px solid rgba(29,34,38,0.08)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: '9px',
                  letterSpacing: '1.6px',
                  color: m.color,
                  textTransform: 'uppercase',
                }}
                className="mb-1.5"
              >
                Request a conversation
              </p>
              <h3
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: '20px',
                  color: '#1d2226',
                  letterSpacing: '-0.5px',
                }}
              >
                Message {m.name}
              </h3>
            </div>
            <button
              onClick={close}
              style={{
                fontFamily: MONO,
                fontSize: '18px',
                color: '#9ca3af',
                width: '32px',
                height: '32px',
                border: '1px solid rgba(29,34,38,0.1)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="hover:text-[#1d2226] hover:border-[rgba(29,34,38,0.3)] transition-all"
            >
              ×
            </button>
          </div>
        </div>
        <div className="px-8 py-7">
          {sent ? (
            <div className="text-center py-6">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: `${m.color}18` }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13L9 17L19 7"
                    stroke={m.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  color: '#1d2226',
                  fontSize: '16px',
                }}
              >
                Request sent.
              </p>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: '11px',
                  color: '#9ca3af',
                  marginTop: '6px',
                }}
              >
                Track the response in your Vitamin workspace.
              </p>
            </div>
          ) : (
            <>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: '9px',
                  letterSpacing: '1.2px',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                What do you need help with?
              </p>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Tell us the decision, transition, or problem you cannot Google."
                style={{
                  fontFamily: SANS,
                  fontSize: '13px',
                  color: '#1d2226',
                  background: 'white',
                  border: '1px solid rgba(29,34,38,0.1)',
                  borderRadius: '6px',
                  padding: '12px',
                  width: '100%',
                  height: '108px',
                  resize: 'none',
                  outline: 'none',
                }}
                className="focus:border-[rgba(29,34,38,0.35)] transition-colors"
              />
              <div
                className="flex items-center justify-between"
                style={{
                  marginTop: '8px',
                  marginBottom: error ? '10px' : '20px',
                }}
              >
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: '10px',
                    color: '#9ca3af',
                  }}
                >
                  {m.responseMinutes} min · human-to-human · no pitch
                </p>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: '9px',
                    color: msg.trim().length >= 20 ? '#5b8a4a' : '#9ca3af',
                  }}
                >
                  {msg.trim().length}/20 MIN
                </span>
              </div>
              {error && (
                <div
                  role="alert"
                  style={{
                    fontFamily: SANS,
                    fontSize: '12px',
                    color: '#8b4025',
                    background: '#fff2ec',
                    borderRadius: '5px',
                    padding: '10px 12px',
                    marginBottom: '14px',
                    lineHeight: 1.5,
                  }}
                >
                  {error}{' '}
                  <Link
                    href="/app"
                    style={{ fontWeight: 700, textDecoration: 'underline' }}
                  >
                    Open your workspace
                  </Link>
                </div>
              )}
              <button
                onClick={sendRequest}
                disabled={busy || msg.trim().length < 20}
                style={{
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#fff',
                  width: '100%',
                  padding: '14px',
                  background: msg.trim().length >= 20 ? m.color : '#d1d5db',
                  borderRadius: '6px',
                  transition: 'all .2s',
                }}
              >
                {busy
                  ? 'Sending…'
                  : signedInName
                    ? 'Send Request'
                    : 'Sign in to continue'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({
  mentors,
  loading,
}: {
  mentors: LandingMentor[];
  loading: boolean;
}) {
  return (
    <section className="relative bg-[#f5f4f0] pt-16 min-h-screen flex flex-col justify-between overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-14 w-full flex-1 flex flex-col justify-center py-16 lg:py-24">
        {/* Chapter index */}
        <div className="flex items-center gap-4 mb-12">
          <span
            style={{
              fontFamily: MONO,
              fontSize: '10px',
              color: 'rgba(29,34,38,0.3)',
              letterSpacing: '2px',
            }}
          >
            001
          </span>
          <div className="h-px w-12 bg-[rgba(29,34,38,0.12)]" />
          <span
            style={{
              fontFamily: MONO,
              fontSize: '10px',
              color: 'rgba(29,34,38,0.3)',
              letterSpacing: '2px',
            }}
          >
            LANDING
          </span>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-14 lg:gap-16 items-start">
          {/* Left: headline */}
          <div>
            <div className="clip-line mb-1">
              <span
                className="rise"
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 'clamp(58px,7.5vw,108px)',
                  color: '#1d2226',
                  letterSpacing: '-3px',
                  lineHeight: '0.93',
                  animationDelay: '0.05s',
                  display: 'block',
                }}
              >
                ACCESS
              </span>
            </div>
            <div className="clip-line mb-1">
              <span
                className="rise"
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 'clamp(58px,7.5vw,108px)',
                  color: '#1d2226',
                  letterSpacing: '-3px',
                  lineHeight: '0.93',
                  animationDelay: '0.14s',
                  display: 'block',
                }}
              >
                SHOULD FEEL
              </span>
            </div>
            <div className="clip-line mb-1">
              <span
                className="rise"
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 'clamp(58px,7.5vw,108px)',
                  color: '#0a66c2',
                  letterSpacing: '-3px',
                  lineHeight: '0.93',
                  animationDelay: '0.23s',
                  display: 'block',
                }}
              >
                EARNED.
              </span>
            </div>
            <div className="clip-line">
              <span
                className="rise"
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 'clamp(58px,7.5vw,108px)',
                  color: 'rgba(29,34,38,0.15)',
                  letterSpacing: '-3px',
                  lineHeight: '0.93',
                  animationDelay: '0.32s',
                  display: 'block',
                }}
              >
                NEVER INHERITED.
              </span>
            </div>

            {/* Subline */}
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-5 mt-12"
              style={{
                borderTop: '1px solid rgba(29,34,38,0.1)',
                paddingTop: '24px',
              }}
            >
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#4b5563',
                  lineHeight: '1.65',
                  maxWidth: '360px',
                }}
              >
                Talk to people who have already crossed the terrain you are
                entering. Real experience — 15 minutes at a time.
              </p>
              <div className="shrink-0">
                <a
                  href="#mentors"
                  data-hover
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#fff',
                    background: '#1d2226',
                    borderRadius: '4px',
                    padding: '14px 22px',
                    transition: 'background .2s',
                  }}
                  className="hover:bg-[#0a66c2]"
                >
                  Find Your Person
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 12.25 14"
                    fill="none"
                  >
                    <path d={svgPaths.pde8daf0} fill="white" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right: match desk — clean, no shadow, just border */}
          <div
            className="bg-white"
            style={{
              border: '1px solid rgba(29,34,38,0.1)',
              borderRadius: '8px',
            }}
          >
            {/* header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(29,34,38,0.07)' }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: '10px',
                  color: '#1d2226',
                  letterSpacing: '1px',
                }}
              >
                MATCH DESK / LIVE
              </span>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-[5px] h-[5px] rounded-full bg-[#5b8a4a]"
                  style={{ boxShadow: '0 0 0 3px rgba(91,138,74,0.18)' }}
                />
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: '10px',
                    color: '#5b8a4a',
                  }}
                >
                  {loading
                    ? 'CHECKING'
                    : `${String(mentors.length).padStart(2, '0')} AVAILABLE`}
                </span>
              </div>
            </div>
            {/* search */}
            <div className="px-4 pt-4 pb-3">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-text"
                style={{ background: '#f5f4f0', borderRadius: '4px' }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <g clipPath="url(#s1)">
                    <path d={svgPaths.p1fbd3800} fill="#9CA3AF" />
                  </g>
                  <defs>
                    <clipPath id="s1">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: '13px',
                    color: '#9ca3af',
                  }}
                >
                  I need help with...
                </span>
              </div>
            </div>
            {/* queue */}
            <div className="px-4 pb-4 flex flex-col">
              {mentors.slice(0, 3).map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f4f0] transition-colors"
                  style={{
                    borderTop: i > 0 ? '1px solid rgba(29,34,38,0.05)' : 'none',
                    borderRadius: '4px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: '16px',
                      fontWeight: 500,
                      color: item.color,
                      width: '28px',
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontFamily: SANS,
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#1d2226',
                      }}
                    >
                      {item.name}
                    </p>
                    <p
                      style={{
                        fontFamily: SANS,
                        fontSize: '11px',
                        color: '#6b7280',
                      }}
                    >
                      {item.helpsWith}
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: '9px',
                      color: '#9ca3af',
                      letterSpacing: '0.5px',
                      flexShrink: 0,
                    }}
                  >
                    {item.city.toUpperCase()} · {item.responseMinutes} MIN
                  </span>
                </div>
              ))}
              {!loading && mentors.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p
                    style={{
                      fontFamily: SANS,
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#1d2226',
                    }}
                  >
                    The next mentor intake is being prepared.
                  </p>
                  <p
                    style={{
                      fontFamily: SANS,
                      fontSize: '12px',
                      color: '#6b7280',
                      marginTop: '5px',
                    }}
                  >
                    Sign in to join the Munich AFT pilot.
                  </p>
                </div>
              )}
            </div>
            <div
              className="px-5 py-3"
              style={{
                borderTop: '1px solid rgba(29,34,38,0.06)',
                background: '#f9f9f8',
                borderRadius: '0 0 8px 8px',
              }}
            >
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: '9px',
                  color: 'rgba(29,34,38,0.25)',
                  letterSpacing: '0.5px',
                }}
              >
                VERIFIED MUNICH MENTORS · NO ALGORITHMIC PAYWALL
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom rule + scroll hint */}
      <div
        className="max-w-[1320px] mx-auto px-6 lg:px-14 w-full pb-6 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(29,34,38,0.08)' }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: '9px',
            color: 'rgba(29,34,38,0.3)',
            letterSpacing: '2px',
          }}
        >
          VITAMIN © 2026
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: '9px',
            color: 'rgba(29,34,38,0.3)',
            letterSpacing: '2px',
          }}
        >
          ↓ SCROLL
        </span>
      </div>
    </section>
  );
}

// ─── Stats — editorial alternating layout ─────────────────────────────────────
function Stats({ metrics }: { metrics: LandingMetrics }) {
  const items = [
    {
      val: String(metrics.completedConversations),
      label: 'Completed conversations',
      sub: 'verified pilot interactions',
    },
    {
      val:
        metrics.positiveEffortRate === null
          ? 'NEW'
          : `${metrics.positiveEffortRate}%`,
      label: 'Strong effort signals',
      sub: 'double-blind released reviews',
    },
    {
      val: String(metrics.activeMentors),
      label: 'Mentors accepting requests',
      sub: `${metrics.pilotLocation} pilot`,
    },
    {
      val: `${metrics.averageSessionMinutes} MIN`,
      label: 'Typical session length',
      sub: `${metrics.pilotVertical} focused`,
    },
  ];
  return (
    <section className="bg-[#1d2226] py-0" data-dark>
      {items.map((s, i) => (
        <div
          key={i}
          data-v
          data-delay={i * 80}
          className="stat-row flex items-center justify-between px-6 lg:px-14 py-7"
          style={{ flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}
        >
          <div
            className="flex items-baseline gap-6"
            style={{ flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}
          >
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 'clamp(40px,5vw,68px)',
                color: 'white',
                letterSpacing: '-2px',
                lineHeight: 1,
              }}
            >
              {s.val}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: '10px',
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                maxWidth: '180px',
                lineHeight: 1.4,
              }}
            >
              {s.label}
            </span>
          </div>
          <span
            style={{
              fontFamily: MONO,
              fontSize: '10px',
              color: 'rgba(255,255,255,0.18)',
              letterSpacing: '1px',
            }}
          >
            {s.sub}
          </span>
        </div>
      ))}
    </section>
  );
}

// ─── Mentor row — hover reveals floating photo ────────────────────────────────
function MentorList({
  mentors,
  loading,
  error,
  onMsg,
}: {
  mentors: LandingMentor[];
  loading: boolean;
  error: string;
  onMsg: (m: LandingMentor) => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [photoPos, setPhotoPos] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState('All');
  const filters = [
    'All',
    ...Array.from(new Set(mentors.map((mentor) => mentor.specialty))),
  ];

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setPhotoPos({ x: e.clientX + 28, y: e.clientY - 110 });
  }, []);

  const activeImg = mentors.find((m) => m.id === active)?.imageUrl;
  const activeColor = mentors.find((m) => m.id === active)?.color ?? '#0a66c2';
  const visibleMentors =
    filter === 'All'
      ? mentors
      : mentors.filter((mentor) => mentor.specialty === filter);

  return (
    <section id="mentors" className="py-24 lg:py-32">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-14">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div data-v>
            <div className="flex items-center gap-3 mb-5">
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: '10px',
                  color: 'rgba(29,34,38,0.3)',
                  letterSpacing: '2px',
                }}
              >
                001
              </span>
              <div className="h-px w-8 bg-[rgba(29,34,38,0.12)]" />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: '10px',
                  color: '#0a66c2',
                  letterSpacing: '1.5px',
                }}
              >
                WHO DO YOU NEED?
              </span>
            </div>
            <h2
              style={{
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 'clamp(36px,4.5vw,58px)',
                color: '#1d2226',
                letterSpacing: '-1.5px',
                lineHeight: '1.05',
              }}
            >
              Pick a conversation,
              <br />
              <span style={{ color: 'rgba(29,34,38,0.22)' }}>
                not a category.
              </span>
            </h2>
          </div>
          <div data-v data-delay="80" className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                data-hover
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: MONO,
                  fontSize: '10px',
                  letterSpacing: '0.8px',
                  padding: '8px 16px',
                  borderRadius: '3px',
                  transition: 'all .2s',
                  background: filter === f ? '#1d2226' : 'white',
                  color: filter === f ? '#fff' : '#4b5563',
                  border:
                    filter === f
                      ? '1px solid #1d2226'
                      : '1px solid rgba(29,34,38,0.12)',
                }}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div onMouseMove={handleMouseMove} className="select-none">
          {visibleMentors.map((m, i) => (
            <button
              type="button"
              key={m.id}
              data-v
              data-delay={i * 60}
              className="mentor-row flex w-full items-center gap-6 px-0 py-7 text-left lg:gap-12 lg:py-9"
              onMouseEnter={() => setActive(m.id)}
              onMouseLeave={() => setActive(null)}
              onClick={() => onMsg(m)}
            >
              <span
                className="row-num shrink-0 w-12"
                style={{
                  fontFamily: MONO,
                  fontSize: '13px',
                  letterSpacing: '1px',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-5">
                  <span
                    style={{
                      fontFamily: SANS,
                      fontWeight: 900,
                      fontSize: 'clamp(22px,3vw,36px)',
                      color: '#1d2226',
                      letterSpacing: '-0.8px',
                      lineHeight: 1.1,
                      transition: 'color .2s',
                    }}
                    className={active === m.id ? '!text-[#1d2226]' : ''}
                  >
                    {m.name}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: '10px',
                      color: 'rgba(29,34,38,0.35)',
                      letterSpacing: '1px',
                    }}
                  >
                    {m.role.toUpperCase()}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: '13px',
                    color: '#6b7280',
                    marginTop: '4px',
                    fontWeight: 500,
                  }}
                  className="hidden sm:block"
                >
                  {m.bio}
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <p
                    style={{
                      fontFamily: MONO,
                      fontSize: '9px',
                      color: 'rgba(29,34,38,0.3)',
                      letterSpacing: '1px',
                    }}
                  >
                    {m.city.toUpperCase()}
                  </p>
                  <p
                    style={{
                      fontFamily: MONO,
                      fontSize: '10px',
                      color: m.color,
                      letterSpacing: '0.5px',
                      marginTop: '2px',
                    }}
                  >
                    {m.specialty.toUpperCase()}
                  </p>
                </div>
                <span
                  className="row-arrow"
                  style={{ fontFamily: MONO, fontSize: '18px', color: m.color }}
                >
                  →
                </span>
              </div>
            </button>
          ))}
          {!loading && visibleMentors.length === 0 && (
            <div className="border-y border-[rgba(29,34,38,0.08)] py-12 text-center">
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#1d2226',
                }}
              >
                {error ||
                  'No verified mentors are accepting requests right now.'}
              </p>
              <a
                href="/signin-with-chatgpt?return_to=%2Fapp"
                target="_top"
                style={{
                  fontFamily: MONO,
                  fontSize: '11px',
                  color: '#0a66c2',
                  display: 'inline-block',
                  marginTop: '12px',
                  textDecoration: 'underline',
                }}
              >
                JOIN THE PILOT WORKSPACE
              </a>
            </div>
          )}
        </div>

        {/* Floating photo — follows cursor */}
        <div
          className={`floating-photo ${active ? 'visible' : ''}`}
          style={{
            left: photoPos.x,
            top: photoPos.y,
            borderTop: `3px solid ${activeColor}`,
          }}
        >
          {activeImg && (
            <Image
              src={activeImg}
              alt=""
              fill
              sizes="220px"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* CTA */}
        <div data-v className="mt-14 flex items-center gap-5">
          <div className="h-px flex-1 bg-[rgba(29,34,38,0.08)]" />
          <Link
            href="/app"
            data-hover
            style={{
              fontFamily: MONO,
              fontSize: '10px',
              color: '#1d2226',
              letterSpacing: '1.2px',
              borderBottom: '1px solid rgba(29,34,38,0.25)',
              paddingBottom: '2px',
            }}
            className="hover:text-[#0a66c2] hover:border-[#0a66c2] transition-colors whitespace-nowrap"
          >
            DISCOVER MORE MENTORS →
          </Link>
          <div className="h-px flex-1 bg-[rgba(29,34,38,0.08)]" />
        </div>
      </div>
    </section>
  );
}

// ─── How It Works — three column, ruled ──────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: '01',
      badge: 'NAME THE EDGE',
      color: '#60a5fa',
      title: "Tell us what you can't Google.",
      body: 'Name the decision, transition, or problem. Not a topic — the specific edge you are on right now.',
    },
    {
      num: '02',
      badge: 'MEET THE HUMAN',
      color: 'rgba(255,255,255,0.5)',
      title: 'We match context, not credentials.',
      body: 'Someone who has navigated exactly this terrain. Not a title match — an experience match. No algorithm.',
    },
    {
      num: '03',
      badge: 'LEAVE WITH MOTION',
      color: '#c77a1f',
      title: 'One clear next move.',
      body: 'One conversation, a clearer step. No recurring subscription to your own clarity required.',
    },
  ];
  return (
    <section
      id="how-it-works"
      className="bg-[#1d2226] py-24 lg:py-32"
      data-dark
    >
      <div className="max-w-[1320px] mx-auto px-6 lg:px-14">
        {/* Header */}
        <div data-v className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span
              style={{
                fontFamily: MONO,
                fontSize: '10px',
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '2px',
              }}
            >
              002
            </span>
            <div className="h-px w-8 bg-[rgba(255,255,255,0.1)]" />
            <span
              style={{
                fontFamily: MONO,
                fontSize: '10px',
                color: '#60a5fa',
                letterSpacing: '1.5px',
              }}
            >
              THE HANDOFF
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between">
            <h2
              style={{
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 'clamp(36px,4.5vw,58px)',
                color: 'white',
                letterSpacing: '-1.5px',
                lineHeight: '1.05',
              }}
            >
              From stuck to moving
              <br />
              <span style={{ color: 'rgba(255,255,255,0.18)' }}>
                in 15 minutes.
              </span>
            </h2>
            <p
              style={{
                fontFamily: SANS,
                fontSize: '14px',
                color: 'rgba(255,255,255,0.45)',
                lineHeight: '1.7',
                maxWidth: '260px',
                fontWeight: 500,
              }}
            >
              No courses. No cold outreach. One useful human, precisely when you
              need them.
            </p>
          </div>
        </div>

        {/* Steps — columnar with ruled borders */}
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          {steps.map((s, i) => (
            <div
              key={i}
              data-v
              data-delay={i * 80}
              className="py-10 pr-8"
              style={{
                borderRight:
                  i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                paddingLeft: i > 0 ? '32px' : '0',
                borderLeft: i === 0 ? 'none' : 'none',
              }}
            >
              <div className="flex items-start justify-between mb-8">
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.15)',
                    letterSpacing: '1px',
                  }}
                >
                  {s.num}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: '9px',
                    color: s.color,
                    letterSpacing: '1.2px',
                  }}
                >
                  {s.badge}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: '20px',
                  color: 'white',
                  letterSpacing: '-0.4px',
                  lineHeight: '1.25',
                  marginBottom: '12px',
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: '1.7',
                  fontWeight: 500,
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials — horizontal scroll ────────────────────────────────────────
function Testimonials() {
  const cards = [
    {
      tag: 'CAREER / 08',
      tagColor: '#0a66c2',
      author: 'PRIYA · FIRST-TIME FOUNDER · DELHI',
      img: imgAvatar,
      quote:
        'I came for advice about fundraising. I left realizing the real decision was what kind of founder I wanted to become.',
    },
    {
      tag: 'CAREER / 14',
      tagColor: '#c77a1f',
      author: 'MARCUS · NEW YORK',
      quote:
        'The first person who understood why the obvious next step felt wrong.',
    },
    {
      tag: 'LIFE / 22',
      tagColor: '#5b8a4a',
      author: 'ELENA · LISBON',
      quote:
        'Twenty minutes gave me permission to stop optimizing and start choosing.',
    },
    {
      tag: 'BUILDING / 07',
      tagColor: '#0a66c2',
      author: 'JAMES · SINGAPORE',
      quote:
        "I've paid consultants thousands for less clarity than I got in one conversation on Vitamin.",
    },
  ];

  return (
    <section id="stories" className="py-24 lg:py-32">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-14 mb-10">
        <div
          data-v
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: '10px',
                  color: 'rgba(29,34,38,0.3)',
                  letterSpacing: '2px',
                }}
              >
                003
              </span>
              <div className="h-px w-8 bg-[rgba(29,34,38,0.12)]" />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: '10px',
                  color: '#0a66c2',
                  letterSpacing: '1.5px',
                }}
              >
                FIELD NOTES
              </span>
            </div>
            <h2
              style={{
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 'clamp(36px,4.5vw,58px)',
                color: '#1d2226',
                letterSpacing: '-1.5px',
                lineHeight: '1.05',
              }}
            >
              Proof, in people’s
              <br />
              <span style={{ color: 'rgba(29,34,38,0.2)' }}>own words.</span>
            </h2>
          </div>
          <a
            href="#stories"
            data-hover
            style={{
              fontFamily: MONO,
              fontSize: '10px',
              color: 'rgba(29,34,38,0.45)',
              letterSpacing: '1px',
              borderBottom: '1px solid rgba(29,34,38,0.2)',
              paddingBottom: '2px',
              alignSelf: 'flex-end',
              whiteSpace: 'nowrap',
            }}
            className="hover:text-[#1d2226] hover:border-[#1d2226] transition-colors"
          >
            ALL FIELD NOTES →
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="max-w-[1320px] mx-auto px-6 lg:px-14 mb-4">
        <p
          style={{
            fontFamily: MONO,
            fontSize: '9px',
            color: 'rgba(29,34,38,0.3)',
            letterSpacing: '1px',
          }}
        >
          ← DRAG TO EXPLORE
        </p>
      </div>

      {/* Cards — horizontal snap scroll */}
      <div
        className="testimonials-track pl-6 lg:pl-14 pr-6"
        style={{ borderTop: '1px solid rgba(29,34,38,0.08)' }}
      >
        {cards.map((c, i) => (
          <div
            key={i}
            className="t-card bg-white flex flex-col justify-between p-8 lg:p-10"
            style={{
              borderRight: '1px solid rgba(29,34,38,0.07)',
              minHeight: '340px',
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: '10px',
                  color: c.tagColor,
                  letterSpacing: '1px',
                }}
              >
                {c.tag}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: '10px',
                  color: 'rgba(29,34,38,0.2)',
                  letterSpacing: '1px',
                }}
              >
                {String(i + 1).padStart(2, '0')}/{cards.length}
              </span>
            </div>
            <div>
              <span
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 'clamp(18px,2.5vw,28px)',
                  color: '#1d2226',
                  lineHeight: '1.4',
                  letterSpacing: '-0.5px',
                  display: 'block',
                }}
              >
                &ldquo;{c.quote}&rdquo;
              </span>
            </div>
            <div
              className="flex items-center gap-3 mt-8 pt-6"
              style={{ borderTop: '1px solid rgba(29,34,38,0.07)' }}
            >
              {c.img && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#f5f4f0]">
                  <Image
                    src={c.img}
                    alt=""
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: '9px',
                  color: 'rgba(29,34,38,0.4)',
                  letterSpacing: '1px',
                }}
              >
                {c.author}
              </span>
            </div>
          </div>
        ))}
        <div
          className="t-card flex items-center justify-center bg-[#0a66c2]"
          style={{ minHeight: '340px' }}
          data-dark
        >
          <a
            href="#mentors"
            data-hover
            style={{
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 'clamp(22px,3vw,36px)',
              color: 'white',
              letterSpacing: '-0.8px',
              textAlign: 'center',
              padding: '24px',
            }}
          >
            Your story
            <br />
            starts here →
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Pull-quote interlude ─────────────────────────────────────────────────────
function Interlude() {
  return (
    <section
      className="py-20 lg:py-28"
      style={{
        borderTop: '1px solid rgba(29,34,38,0.07)',
        borderBottom: '1px solid rgba(29,34,38,0.07)',
      }}
    >
      <div className="max-w-[1000px] mx-auto px-6 lg:px-14 text-center">
        <p
          data-v
          style={{
            fontFamily: MONO,
            fontSize: '10px',
            color: 'rgba(29,34,38,0.3)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}
        >
          The Core Idea
        </p>
        <p
          data-v
          data-delay="80"
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 'clamp(26px,3.8vw,52px)',
            color: '#1d2226',
            letterSpacing: '-1.2px',
            lineHeight: '1.12',
          }}
        >
          You don’t repay the person who helped you.{' '}
          <span style={{ color: 'rgba(29,34,38,0.2)' }}>
            You help someone else.
          </span>
        </p>
        <div
          data-v
          data-delay="160"
          className="flex items-center justify-center gap-4 mt-10"
        >
          <div className="h-px w-14 bg-[rgba(29,34,38,0.1)]" />
          <span
            style={{
              fontFamily: MONO,
              fontSize: '9px',
              color: 'rgba(29,34,38,0.3)',
              letterSpacing: '2px',
            }}
          >
            PAY IT FORWARD
          </span>
          <div className="h-px w-14 bg-[rgba(29,34,38,0.1)]" />
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section
      className="bg-[#0a66c2] py-24 lg:py-36 relative overflow-hidden"
      data-dark
    >
      {/* Diagonal rule decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 80px)',
          }}
        />
      </div>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-14 relative text-center">
        <p
          data-v
          style={{
            fontFamily: MONO,
            fontSize: '10px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '2px',
            marginBottom: '28px',
          }}
        >
          YOUR NEXT MOVE HAS A NAME.
        </p>
        <h2
          data-v
          data-delay="60"
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 'clamp(40px,6vw,90px)',
            color: 'white',
            letterSpacing: '-2.5px',
            lineHeight: '0.97',
          }}
        >
          WHO SHOULD
          <br />
          YOU TALK TO NEXT?
        </h2>
        <div
          data-v
          data-delay="140"
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
        >
          <a
            href="#mentors"
            data-hover
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: '13px',
              color: '#0a66c2',
              background: 'white',
              borderRadius: '4px',
              padding: '16px 28px',
              transition: 'all .2s',
            }}
            className="hover:bg-[#f0f6ff]"
          >
            Make the Match
            <svg width="11" height="11" viewBox="0 0 12.25 14" fill="none">
              <path d={svgPaths.pde8daf0} fill="#0a66c2" />
            </svg>
          </a>
          <span
            style={{
              fontFamily: MONO,
              fontSize: '10px',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '1px',
            }}
          >
            FREE · NO CREDENTIALS REQUIRED
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── Footer — wordmark + grid ─────────────────────────────────────────────────
function Footer() {
  const cols = [
    {
      h: 'Platform',
      links: ['Find a Mentor', 'Become a Mentor', 'How It Works', 'Match Desk'],
    },
    { h: 'Community', links: ['Field Notes', 'Stories', 'Events', 'Forum'] },
    { h: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
    { h: 'Legal', links: ['Privacy', 'Terms', 'GDPR', 'Cookies'] },
  ];
  return (
    <footer className="bg-[#1d2226]" data-dark>
      {/* Big wordmark */}
      <div
        className="max-w-[1320px] mx-auto px-6 lg:px-14 pt-16 pb-10"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Logo size={20} />
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '-0.3px',
            }}
          >
            Vitamin
          </span>
        </div>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 'clamp(40px,5.5vw,80px)',
            fontWeight: 900,
            color: 'rgba(255,255,255,0.08)',
            letterSpacing: '-2px',
            lineHeight: 1.0,
            marginTop: '8px',
          }}
        >
          HUMAN KNOWLEDGE,
          <br />
          CIRCULATING.
        </p>
      </div>

      {/* Links grid */}
      <div
        className="max-w-[1320px] mx-auto px-6 lg:px-14 py-12"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
          {cols.map((c) => (
            <div key={c.h}>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: '9px',
                  color: 'rgba(255,255,255,0.2)',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                {c.h}
              </p>
              {c.links.map((l) => (
                <a
                  key={l}
                  href={
                    l === 'Find a Mentor'
                      ? '#mentors'
                      : l === 'How It Works'
                        ? '#how-it-works'
                        : l === 'Field Notes' || l === 'Stories'
                          ? '#stories'
                          : '/'
                  }
                  style={{
                    display: 'block',
                    fontFamily: SANS,
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: '10px',
                  }}
                  className="hover:text-white transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1320px] mx-auto px-6 lg:px-14 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span
          style={{
            fontFamily: MONO,
            fontSize: '9px',
            color: 'rgba(255,255,255,0.18)',
            letterSpacing: '1px',
          }}
        >
          © 2026 VITAMIN · MUNICH, GERMANY
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: '9px',
            color: 'rgba(255,255,255,0.18)',
            letterSpacing: '1px',
          }}
        >
          EFFORT-GATED. NEVER MONEY-GATED.
        </span>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export function FigmaLanding({
  signedInName,
}: {
  signedInName: string | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [modal, setModal] = useState<LandingMentor | null>(null);
  const [mentors, setMentors] = useState<LandingMentor[]>([]);
  const [metrics, setMetrics] = useState<LandingMetrics>(DEFAULT_METRICS);
  const [discoveryLoading, setDiscoveryLoading] = useState(true);
  const [discoveryError, setDiscoveryError] = useState('');

  useReveal();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    fetch('/api/mentors?featured=1&includeMeta=1', {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Discovery unavailable');
        return response.json() as Promise<{
          mentors: Omit<LandingMentor, 'color'>[];
          meta: LandingMetrics;
        }>;
      })
      .then((data) => {
        if (!active) return;
        const colors = ['#0a66c2', '#c77a1f', '#5b8a4a'];
        setMentors(
          data.mentors.map((mentor, index) => ({
            ...mentor,
            color: colors[index % colors.length],
          })),
        );
        setMetrics(data.meta);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        if (!active) return;
        setDiscoveryError('Mentor availability could not be loaded.');
      })
      .finally(() => {
        if (active) setDiscoveryLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="figma-landing bg-[#f5f4f0] overflow-x-hidden min-h-screen">
      <Cursor />
      <Nav
        openSidebar={() => setSidebarOpen(true)}
        scrolled={scrolled}
        signedInName={signedInName}
      />
      <Sidebar
        open={sidebarOpen}
        close={() => setSidebarOpen(false)}
        signedInName={signedInName}
      />
      {modal && (
        <Modal
          m={modal}
          close={() => setModal(null)}
          signedInName={signedInName}
        />
      )}

      <Hero mentors={mentors} loading={discoveryLoading} />
      <Stats metrics={metrics} />
      <MentorList
        mentors={mentors}
        loading={discoveryLoading}
        error={discoveryError}
        onMsg={setModal}
      />
      <HowItWorks />
      <Testimonials />
      <Interlude />
      <CTA />
      <Footer />
    </div>
  );
}
