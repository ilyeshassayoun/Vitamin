'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarClock,
  Check,
  CircleUserRound,
  HeartHandshake,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  UserRoundPlus,
  Users,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';

type Profile = {
  displayName: string;
  language: string;
  situation: string | null;
  verificationStatus: string;
  role: string;
  activeRequestLimit: number;
  onboardingComplete: number;
};
type Mentor = {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  languages: string;
  helpsWith: string;
  verified: number;
  acceptingRequests?: number;
};
type Interaction = {
  id: string;
  topic: string;
  context: string;
  status: string;
  mentorName?: string;
  mentorRole?: string;
  menteeName?: string;
  scheduled_for?: string | null;
  scheduling_url?: string | null;
  mentee_completed: number;
  mentor_completed: number;
  reviewed: number;
  decision_note?: string | null;
};
type Review = {
  id: string;
  requestId: string;
  effortRating: number;
  outcome: string;
  potentialDirection: string | null;
  reviewerName: string;
};
type Notice = {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};
type SafetyFlag = {
  id: string;
  requestId: string;
  kind: string;
  details: string;
  response: string | null;
  status: string;
  createdAt: string;
  reporterName: string;
};
type Workspace = {
  profile: Profile;
  mentor: Mentor | null;
  outgoing: Interaction[];
  incoming: Interaction[];
  reviews: Review[];
  notifications: Notice[];
  reputation: { positiveSignals: number };
  flags: SafetyFlag[];
};
type Modal =
  | { kind: 'request'; mentor: Mentor }
  | {
      kind: 'schedule' | 'note' | 'review' | 'safety';
      item: Interaction;
      perspective: 'mentee' | 'mentor';
    }
  | null;

const tabs = [
  ['overview', 'Overview', LayoutDashboard],
  ['discover', 'Discover', Users],
  ['requests', 'Requests', Inbox],
  ['mentor', 'Mentor', HeartHandshake],
  ['reputation', 'Track record', Star],
  ['safety', 'Safety', ShieldAlert],
] as const;

export function Dashboard({ displayName }: { displayName: string }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [tab, setTab] = useState('overview');
  const [modal, setModal] = useState<Modal>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function getJson<T>(
    url: string,
    init?: RequestInit,
  ): Promise<{ ok: boolean; data: T & { error?: string } }> {
    const response = await fetch(url, init);
    return {
      ok: response.ok,
      data: (await response.json()) as T & { error?: string },
    };
  }
  async function refresh() {
    const [w, m] = await Promise.all([
      getJson<Workspace>('/api/workspace'),
      getJson<{ mentors: Mentor[] }>('/api/mentors'),
    ]);
    if (w.ok) setWorkspace(w.data);
    if (m.ok) setMentors(m.data.mentors);
  }
  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    const task = setTimeout(() => {
      if (requestedTab && tabs.some(([key]) => key === requestedTab)) {
        setTab(requestedTab);
      }
      void refresh();
    }, 0);
    return () => clearTimeout(task);
  }, []);
  async function submit(
    url: string,
    method: string,
    body: Record<string, unknown>,
    success: string,
  ) {
    setBusy(true);
    setMessage('');
    const result = await getJson<Record<string, unknown>>(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    setMessage(
      result.ok ? success : (result.data.error ?? 'Something went wrong.'),
    );
    if (result.ok) setModal(null);
    await refresh();
    setBusy(false);
    return result.ok;
  }
  async function formSubmit(
    url: string,
    method: string,
    formData: FormData,
    success: string,
    extra: Record<string, unknown> = {},
  ) {
    return submit(
      url,
      method,
      { ...Object.fromEntries(formData), ...extra },
      success,
    );
  }
  if (!workspace)
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <LoaderCircle className="animate-spin text-primary" />
      </div>
    );
  const {
    profile,
    mentor,
    outgoing,
    incoming,
    reviews,
    notifications,
    reputation,
    flags,
  } = workspace;
  const active = outgoing.filter((r) =>
    ['pending', 'accepted', 'active'].includes(r.status),
  ).length;
  const unread = notifications.filter((n) => !n.readAt).length;
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur-xl lg:hidden">
        <div className="flex h-17 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-[13px] bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <strong className="font-heading text-xl">vitamin</strong>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={`${unread} unread notifications`}
              onClick={() => setTab('overview')}
            >
              <Bell />
              {unread > 0 && (
                <span className="absolute right-1 top-1 size-2 rounded-full bg-[#e87943]" />
              )}
            </Button>
            <form action="/signout-with-chatgpt" method="get">
              <input type="hidden" name="return_to" value="/" />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label="Sign out"
              >
                <LogOut />
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1600px] gap-5 px-3 py-3 sm:px-5 sm:py-5 lg:min-h-screen lg:grid-cols-[260px_minmax(0,1fr)_320px] lg:gap-6 lg:p-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] overflow-hidden rounded-[12px] bg-[#1d2226] p-5 text-white shadow-[0_28px_70px_rgba(29,34,38,.18)] lg:flex lg:flex-col">
          <Link href="/" className="flex items-center gap-3 px-2">
            <span className="grid size-10 place-items-center rounded-[6px] bg-[#2e4fff] text-white">
              <Sparkles className="size-4" />
            </span>
            <strong className="font-heading text-xl tracking-[-.06em]">
              vitamin
            </strong>
          </Link>
          <p className="mt-8 px-3 text-[11px] font-bold uppercase tracking-[.18em] text-white/40">
            Workspace
          </p>
          <nav className="mt-3 space-y-1.5" aria-label="Application">
            {tabs.map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex w-full items-center gap-3 rounded-md px-3.5 py-3 text-left text-sm font-semibold transition-all ${tab === key ? 'bg-white text-[#1d2226] shadow-sm' : 'text-white/65 hover:bg-white/8 hover:text-white'}`}
              >
                <Icon className="size-4" />
                {label}
                {key === 'requests' && incoming.length + outgoing.length > 0 ? (
                  <span
                    className={`ml-auto grid size-6 place-items-center rounded-full text-xs ${tab === key ? 'bg-[#f3b36c]' : 'bg-white/10'}`}
                  >
                    {incoming.length + outgoing.length}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-[22px] border border-white/10 bg-white/7 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#f3b36c]">
              Pilot principle
            </p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              One focused request at a time. Trust grows through reliable
              follow-through.
            </p>
          </div>
          <Link
            href="/"
            className="mt-4 flex items-center gap-2 px-3 text-sm text-white/50 transition hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Public site
          </Link>
        </aside>
        <section className="min-w-0 rounded-[12px] border border-white/70 bg-[#f9f9f8]/94 p-5 shadow-[0_24px_70px_rgba(29,34,38,.07)] backdrop-blur-sm sm:p-7 lg:p-9">
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {tabs.map(([key, label, Icon]) => (
              <Button
                key={key}
                size="sm"
                variant={tab === key ? 'default' : 'outline'}
                className="rounded-full"
                onClick={() => setTab(key)}
              >
                <Icon />
                {label}
              </Button>
            ))}
          </div>
          {message && (
            <div className="mb-5 rounded-md border border-primary/20 bg-[#eef5ff] p-4 text-sm text-primary">
              {message}
            </div>
          )}
          {tab === 'overview' && (
            <Overview
              name={displayName}
              profile={profile}
              active={active}
              incoming={incoming.length}
              reputation={Number(reputation?.positiveSignals ?? 0)}
              notices={notifications}
              onRead={async () => {
                await fetch('/api/notifications', { method: 'PATCH' });
                await refresh();
              }}
              onNavigate={setTab}
            />
          )}
          {tab === 'discover' && (
            <Discover
              profile={profile}
              mentors={mentors.filter((m) => m.id !== mentor?.id)}
              onSelect={(m) => setModal({ kind: 'request', mentor: m })}
            />
          )}
          {tab === 'requests' && (
            <Requests
              outgoing={outgoing}
              incoming={incoming}
              onAction={async (item, action, perspective) => {
                if (
                  action === 'schedule' ||
                  action === 'note' ||
                  action === 'review' ||
                  action === 'safety'
                ) {
                  setModal({ kind: action, item, perspective });
                  return;
                }
                await submit(
                  `/api/requests/${item.id}`,
                  'PATCH',
                  { action },
                  `Request updated: ${action}.`,
                );
              }}
            />
          )}
          {tab === 'mentor' && (
            <MentorSpace
              mentor={mentor}
              incoming={incoming}
              onEnroll={(data) =>
                formSubmit(
                  '/api/mentor',
                  'POST',
                  data,
                  'Your mentor profile was submitted for pilot verification.',
                )
              }
              onAction={async (item, action) => {
                if (
                  action === 'schedule' ||
                  action === 'note' ||
                  action === 'review' ||
                  action === 'safety'
                ) {
                  setModal({ kind: action, item, perspective: 'mentor' });
                  return;
                }
                await submit(
                  `/api/requests/${item.id}`,
                  'PATCH',
                  { action },
                  `Request updated: ${action}.`,
                );
              }}
              busy={busy}
            />
          )}
          {tab === 'reputation' && (
            <Reputation
              reviews={reviews}
              signals={Number(reputation?.positiveSignals ?? 0)}
            />
          )}
          {tab === 'safety' && (
            <SafetyCenter
              flags={flags}
              respond={(data, id) =>
                formSubmit(
                  '/api/safety',
                  'PATCH',
                  data,
                  'Your response is recorded for review.',
                  { flagId: id },
                )
              }
              dispute={(data, flag) =>
                formSubmit(
                  '/api/safety',
                  'POST',
                  data,
                  'Your dispute is queued for blind assignment.',
                  {
                    requestId: flag.requestId,
                    flagId: flag.id,
                    action: 'dispute',
                  },
                )
              }
            />
          )}
        </section>
        <aside className="space-y-5 lg:pt-1">
          <div className="hidden items-center justify-end gap-2 lg:flex">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full bg-card"
              aria-label={`${unread} unread notifications`}
              onClick={() => setTab('overview')}
            >
              <Bell />
              {unread > 0 && (
                <span className="absolute right-1 top-1 size-2 rounded-full bg-[#e87943]" />
              )}
            </Button>
            <form action="/signout-with-chatgpt" method="get">
              <input type="hidden" name="return_to" value="/" />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="rounded-full bg-card"
                aria-label="Sign out"
              >
                <LogOut />
              </Button>
            </form>
          </div>
          <ProfileCard profile={profile} mentor={mentor} active={active} />
          <div className="rounded-[12px] border bg-card/90 p-5 shadow-[0_14px_40px_rgba(29,34,38,.05)]">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-semibold">Notifications</h2>
              {unread > 0 && (
                <Badge className="rounded-full">{unread} new</Badge>
              )}
            </div>
            {notifications.length ? (
              <ul className="mt-4 space-y-4">
                {notifications.slice(0, 5).map((n) => (
                  <li
                    key={n.id}
                    className={`border-t pt-4 first:border-0 first:pt-0 ${n.readAt ? 'opacity-55' : ''}`}
                  >
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {n.body}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Updates about requests, schedules, reviews, and safety actions
                appear here.
              </p>
            )}
          </div>
        </aside>
      </div>
      {modal && (
        <WorkflowModal
          modal={modal}
          busy={busy}
          close={() => setModal(null)}
          submit={formSubmit}
        />
      )}
    </main>
  );
}

function Overview({
  name,
  profile,
  active,
  incoming,
  reputation,
  notices,
  onRead,
  onNavigate,
}: {
  name: string;
  profile: Profile;
  active: number;
  incoming: number;
  reputation: number;
  notices: Notice[];
  onRead: () => void;
  onNavigate: (tab: string) => void;
}) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="section-kicker">Your Vitamin</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-.06em] sm:text-5xl">
            Good to see you,
            <br />
            {name.split(' ')[0]}.
          </h1>
          <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
            Your next useful action, the people who can help, and the trust you
            are building—all in one place.
          </p>
        </div>
        <Badge
          variant="outline"
          className="rounded-full bg-white px-3 py-2 text-primary"
        >
          <ShieldCheck />{' '}
          {profile.verificationStatus === 'verified'
            ? 'Verified member'
            : 'Verification pending'}
        </Badge>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric
          label="Active requests"
          value={`${active}/${profile.activeRequestLimit}`}
          icon={<Send />}
        />
        <Metric
          label="Mentor inbox"
          value={String(incoming)}
          icon={<Inbox />}
        />
        <Metric
          label="Positive signals"
          value={String(reputation)}
          icon={<Star />}
        />
      </div>
      {!profile.onboardingComplete ? (
        <Contribution onSubmit={(data) => fetchForm(data)} />
      ) : (
        <div className="relative mt-7 overflow-hidden rounded-[12px] bg-[#1d2226] p-7 text-white shadow-[0_24px_60px_rgba(29,34,38,.2)] sm:p-9">
          <div className="absolute -right-16 -top-20 size-64 rounded-full border-[44px] border-[#f3b36c]/12" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[.17em] text-[#f3b36c]">
              Ready for your next step
            </p>
            <h2 className="mt-3 max-w-xl font-heading text-3xl font-semibold tracking-[-.05em]">
              One useful conversation can change your direction.
            </h2>
            <p className="mt-3 max-w-lg leading-7 text-white/65">
              Choose someone whose recent experience matches the decision in
              front of you.
            </p>
            <Button
              className="mt-7 rounded-full bg-[#f3b36c] px-5 text-[#2a1b0c] hover:bg-[#ffc47f]"
              onClick={() => onNavigate('discover')}
            >
              Explore mentors <ArrowRight />
            </Button>
          </div>
        </div>
      )}
      {notices.some((n) => !n.readAt) && (
        <Button variant="ghost" className="mt-4 rounded-full" onClick={onRead}>
          <Check />
          Mark notifications read
        </Button>
      )}
    </>
  );
  async function fetchForm(data: FormData) {
    await fetch('/api/contributions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(data)),
    });
    location.reload();
  }
}
function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[10px] border bg-white/85 p-5 shadow-[0_10px_30px_rgba(29,34,38,.045)]">
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-md bg-[#eef3fb] text-primary">
          {icon}
        </span>
        <strong className="font-heading text-3xl tracking-[-.05em] text-primary">
          {value}
        </strong>
      </div>
      <p className="mt-5 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
function Contribution({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  return (
    <section className="mt-7 rounded-[28px] border bg-card p-6 sm:p-8">
      <div className="flex gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f3b36c]/25 text-[#a55325]">
          <HeartHandshake />
        </span>
        <div>
          <h2 className="font-heading text-2xl font-semibold">
            Share one thing that helped you
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your contribution unlocks direct requests.
          </p>
        </div>
      </div>
      <form action={onSubmit} className="mt-6 grid gap-4">
        <Input
          name="title"
          required
          minLength={5}
          placeholder="A clear, useful title"
        />
        <NativeSelect name="category" className="w-full">
          <NativeSelectOption value="interview">Interview</NativeSelectOption>
          <NativeSelectOption value="cv">CV</NativeSelectOption>
          <NativeSelectOption value="orientation">
            Career orientation
          </NativeSelectOption>
        </NativeSelect>
        <Textarea
          name="body"
          required
          minLength={20}
          placeholder="Be specific enough that someone can use it."
        />
        <Button className="rounded-full">Publish contribution</Button>
      </form>
    </section>
  );
}
function Discover({
  profile,
  mentors,
  onSelect,
}: {
  profile: Profile;
  mentors: Mentor[];
  onSelect: (m: Mentor) => void;
}) {
  const canRequest =
    Boolean(profile.onboardingComplete) &&
    profile.verificationStatus === 'verified';
  return (
    <>
      <p className="section-kicker">Verified mentors</p>
      <h1 className="section-title">Choose one focused conversation.</h1>
      <p className="mt-3 text-muted-foreground">
        Direct requests require verification and a first contribution.
      </p>
      {mentors.length ? (
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {mentors.map((m) => (
            <article className="mentor-card" key={m.id}>
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-md bg-[#eef3fb] font-bold text-primary">
                  {m.initials}
                </span>
                <Badge variant="outline">
                  <ShieldCheck />
                  Verified
                </Badge>
              </div>
              <h2 className="mt-5 text-lg font-semibold">{m.name}</h2>
              <p className="text-sm text-muted-foreground">
                {m.role} · {m.company}
              </p>
              <p className="mt-5 text-sm">
                <strong>Helps with:</strong> {m.helpsWith}
              </p>
              <div className="mt-5 flex items-center justify-between border-t pt-4">
                <span className="text-xs text-muted-foreground">
                  {m.languages}
                </span>
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={!canRequest}
                  onClick={() => onSelect(m)}
                >
                  Request help <ArrowRight />
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty text="No verified mentors are accepting requests right now." />
      )}
    </>
  );
}
function Requests({
  outgoing,
  incoming,
  onAction,
}: {
  outgoing: Interaction[];
  incoming: Interaction[];
  onAction: (
    item: Interaction,
    action: string,
    perspective: 'mentee' | 'mentor',
  ) => void;
}) {
  return (
    <>
      <p className="section-kicker">Interaction workspace</p>
      <h1 className="section-title">Requests and conversations</h1>
      <RequestList
        title="Requests you sent"
        items={outgoing}
        perspective="mentee"
        onAction={onAction}
      />
      {incoming.length > 0 && (
        <RequestList
          title="Requests you received"
          items={incoming}
          perspective="mentor"
          onAction={onAction}
        />
      )}
    </>
  );
}
function RequestList({
  title,
  items,
  perspective,
  onAction,
}: {
  title: string;
  items: Interaction[];
  perspective: 'mentee' | 'mentor';
  onAction: (
    item: Interaction,
    action: string,
    perspective: 'mentee' | 'mentor',
  ) => void;
}) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      {items.length ? (
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <article
              className="rounded-[24px] border bg-card p-5 sm:p-6"
              key={item.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {perspective === 'mentor'
                        ? item.menteeName
                        : item.mentorName}
                    </h3>
                    <Status status={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.topic}
                  </p>
                </div>
                {item.scheduled_for && (
                  <Badge variant="outline">
                    <CalendarClock />
                    {new Date(item.scheduled_for).toLocaleString()}
                  </Badge>
                )}
              </div>
              <p className="mt-4 text-sm leading-6">{item.context}</p>
              {item.decision_note && (
                <p className="mt-3 rounded-xl bg-muted p-3 text-sm">
                  {item.decision_note}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                <RequestActions
                  item={item}
                  perspective={perspective}
                  onAction={onAction}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty text="Nothing here yet." />
      )}
    </section>
  );
}
function RequestActions({
  item,
  perspective,
  onAction,
}: {
  item: Interaction;
  perspective: 'mentee' | 'mentor';
  onAction: (
    item: Interaction,
    action: string,
    perspective: 'mentee' | 'mentor',
  ) => void;
}) {
  const btn = (
    action: string,
    label: string,
    variant: 'default' | 'outline' | 'destructive' = 'outline',
  ) => (
    <Button
      key={action}
      size="sm"
      variant={variant}
      className="rounded-full"
      onClick={() => onAction(item, action, perspective)}
    >
      {label}
    </Button>
  );
  return (
    <>
      {perspective === 'mentor' && item.status === 'pending' && (
        <>
          {btn('accept', 'Accept', 'default')}
          {btn('decline', 'Decline')}
        </>
      )}
      {perspective === 'mentor' &&
        item.status === 'accepted' &&
        btn('schedule', 'Schedule', 'default')}
      {['accepted', 'active'].includes(item.status) && (
        <>
          {btn('note', 'Add note')}
          {btn(
            'complete',
            perspective === 'mentor' && item.mentor_completed
              ? 'Completed'
              : perspective === 'mentee' && item.mentee_completed
                ? 'Completed'
                : 'Mark complete',
            'default',
          )}
          {btn('safety', 'Report privately', 'destructive')}
        </>
      )}
      {item.status === 'completed' &&
        !item.reviewed &&
        btn('review', 'Leave double-blind review', 'default')}
      {perspective === 'mentee' &&
        ['pending', 'accepted'].includes(item.status) &&
        btn('cancel', 'Cancel')}
    </>
  );
}
function MentorSpace({
  mentor,
  incoming,
  onEnroll,
  onAction,
  busy,
}: {
  mentor: Mentor | null;
  incoming: Interaction[];
  onEnroll: (d: FormData) => void;
  onAction: (i: Interaction, a: string) => void;
  busy: boolean;
}) {
  if (!mentor)
    return (
      <>
        <p className="section-kicker">Pay it forward</p>
        <h1 className="section-title">Offer what you know.</h1>
        <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
          Mentoring begins with recent, useful experience—not seniority. Submit
          your profile for founder verification before it can receive requests.
        </p>
        <form
          action={onEnroll}
          className="mt-7 grid gap-5 rounded-[28px] border bg-card p-6 sm:p-8"
        >
          <Input
            name="role"
            required
            placeholder="Your role or current stage"
          />
          <Input
            name="company"
            required
            placeholder="Organization or university"
          />
          <Input
            name="helpsWith"
            required
            placeholder="What can you help with?"
          />
          <Button disabled={busy} className="h-11 rounded-full">
            <UserRoundPlus />
            Submit mentor profile
          </Button>
        </form>
      </>
    );
  const isLive = Boolean(mentor.verified && mentor.acceptingRequests);
  return (
    <>
      <p className="section-kicker">Mentor workspace</p>
      <h1 className="section-title">Your contribution has a home.</h1>
      <div className="mt-7 rounded-[10px] bg-[#1d2226] p-7 text-white">
        <Badge className="bg-white/10 text-white">
          {isLive ? 'Accepting requests' : 'Verification pending'}
        </Badge>
        <h2 className="mt-5 text-2xl font-semibold">{mentor.role}</h2>
        <p className="mt-2 text-white/65">
          {mentor.company} · Helping with {mentor.helpsWith}
        </p>
        {!isLive && (
          <p className="mt-4 rounded-xl bg-white/8 p-3 text-sm text-white/70">
            Your profile is saved but remains hidden from discovery until the
            pilot team verifies it.
          </p>
        )}
      </div>
      {isLive && (
        <RequestList
          title="Incoming requests"
          items={incoming}
          perspective="mentor"
          onAction={(item, action) => onAction(item, action)}
        />
      )}
    </>
  );
}
function Reputation({
  reviews,
  signals,
}: {
  reviews: Review[];
  signals: number;
}) {
  return (
    <>
      <p className="section-kicker">Positive track record only</p>
      <h1 className="section-title">Reliability you demonstrated.</h1>
      <div className="mt-7 rounded-[28px] bg-[#f0eee6] p-7">
        <Star className="text-[#e87943]" />
        <strong className="mt-5 block font-heading text-5xl">{signals}</strong>
        <p className="mt-2 text-sm text-muted-foreground">
          verified positive effort signals
        </p>
      </div>
      <section className="mt-8">
        <h2 className="font-heading text-xl font-semibold">
          Released feedback
        </h2>
        {reviews.length ? (
          <div className="mt-4 grid gap-4">
            {reviews.map((r) => (
              <article key={r.id} className="rounded-[22px] border bg-card p-5">
                <div className="flex justify-between">
                  <strong>{r.reviewerName}</strong>
                  <Badge>{r.effortRating}/5 effort</Badge>
                </div>
                {r.potentialDirection && (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {r.potentialDirection}
                  </p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Outcome is informational and never reduces reputation.
                </p>
              </article>
            ))}
          </div>
        ) : (
          <Empty text="Feedback appears only after both sides submit their private reviews." />
        )}
      </section>
    </>
  );
}
function SafetyCenter({
  flags,
  respond,
  dispute,
}: {
  flags: SafetyFlag[];
  respond: (data: FormData, id: string) => void;
  dispute: (data: FormData, flag: SafetyFlag) => void;
}) {
  return (
    <>
      <p className="section-kicker">Private and reversible</p>
      <h1 className="section-title">Safety center</h1>
      <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
        Concerns never become public labels. You can respond before any
        consequence and request a blind review.
      </p>
      {flags.length ? (
        <div className="mt-7 space-y-4">
          {flags.map((flag) => (
            <article
              key={flag.id}
              className="rounded-[24px] border bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <Badge variant="destructive">
                  {flag.kind.replace('_', ' ')}
                </Badge>
                <Status status={flag.status} />
              </div>
              <p className="mt-4 text-sm leading-6">{flag.details}</p>
              {flag.response ? (
                <div className="mt-4 rounded-xl bg-muted p-4 text-sm">
                  <strong>Your response</strong>
                  <p className="mt-2 text-muted-foreground">{flag.response}</p>
                </div>
              ) : (
                <form
                  action={(data) => respond(data, flag.id)}
                  className="mt-5 space-y-3"
                >
                  <Textarea
                    name="response"
                    required
                    minLength={20}
                    placeholder="Respond with context and observable facts."
                  />
                  <Button size="sm" className="rounded-full">
                    Submit response
                  </Button>
                </form>
              )}
              <form
                action={(data) => dispute(data, flag)}
                className="mt-4 flex gap-2"
              >
                <Input
                  name="details"
                  required
                  minLength={20}
                  placeholder="Why should an arbiter review this?"
                />
                <Button size="sm" variant="outline">
                  Dispute
                </Button>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <Empty text="No private concerns require your response." />
      )}
    </>
  );
}
function ProfileCard({
  profile,
  mentor,
  active,
}: {
  profile: Profile;
  mentor: Mentor | null;
  active: number;
}) {
  return (
    <div className="overflow-hidden rounded-[12px] bg-[#1d2226] text-white shadow-[0_20px_55px_rgba(29,34,38,.18)]">
      <div className="relative h-24 bg-[radial-gradient(circle_at_20%_20%,rgba(46,79,255,.65),transparent_45%),linear-gradient(125deg,#0a66c2,#1d2226)]">
        <span className="absolute -bottom-7 left-5 grid size-14 place-items-center rounded-md border-4 border-[#1d2226] bg-[#2e4fff] text-white">
          <CircleUserRound className="size-7" />
        </span>
      </div>
      <div className="px-5 pb-5 pt-11">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-semibold tracking-[-.04em]">
              {profile.displayName}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              {mentor
                ? mentor.verified
                  ? 'Mentee · Mentor'
                  : 'Mentee · Mentor applicant'
                : 'Mentee'}{' '}
              · Munich AFT
            </p>
          </div>
          <ShieldCheck className="size-5 text-[#f3b36c]" />
        </div>
        <div className="mt-5 rounded-2xl bg-white/8 p-3.5">
          <div className="flex justify-between text-sm">
            <span className="text-white/55">Active capacity</span>
            <strong>
              {active}/{profile.activeRequestLimit}
            </strong>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#f3b36c]"
              style={{
                width: `${Math.min(100, (active / profile.activeRequestLimit) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
function WorkflowModal({
  modal,
  busy,
  close,
  submit,
}: {
  modal: Exclude<Modal, null>;
  busy: boolean;
  close: () => void;
  submit: (
    url: string,
    method: string,
    data: FormData,
    success: string,
    extra?: Record<string, unknown>,
  ) => Promise<boolean>;
}) {
  const title =
    modal.kind === 'request'
      ? `Ask ${modal.mentor.name}`
      : modal.kind === 'schedule'
        ? 'Schedule the conversation'
        : modal.kind === 'note'
          ? 'Add a shared note'
          : modal.kind === 'review'
            ? 'Private double-blind review'
            : 'Report a concern privately';
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#10291f]/65 p-4 backdrop-blur-sm">
      <dialog
        open
        aria-modal="true"
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-card p-6 text-foreground shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="section-kicker">{modal.kind}</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold">
              {title}
            </h2>
          </div>
          <button
            className="grid size-9 place-items-center rounded-full bg-muted"
            onClick={close}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <form
          className="mt-6 grid gap-5"
          action={async (data) => {
            if (modal.kind === 'request')
              await submit(
                '/api/requests',
                'POST',
                data,
                'Your focused request is pending.',
                { mentorId: modal.mentor.id },
              );
            else if (modal.kind === 'schedule') {
              const localDateTime = data.get('scheduledFor');
              if (typeof localDateTime === 'string') {
                const parsed = new Date(localDateTime);
                if (Number.isFinite(parsed.getTime()))
                  data.set('scheduledFor', parsed.toISOString());
              }
              await submit(
                `/api/requests/${modal.item.id}`,
                'PATCH',
                data,
                'Conversation scheduled.',
                { action: 'schedule' },
              );
            } else if (modal.kind === 'note')
              await submit(
                `/api/requests/${modal.item.id}/notes`,
                'POST',
                data,
                'Note added.',
              );
            else if (modal.kind === 'review')
              await submit(
                '/api/reviews',
                'POST',
                data,
                'Your review is sealed until both sides submit.',
                { requestId: modal.item.id },
              );
            else
              await submit(
                '/api/safety',
                'POST',
                data,
                'Your concern is private and queued for review.',
                { requestId: modal.item.id, action: 'flag' },
              );
          }}
        >
          {modal.kind === 'request' && (
            <>
              <Input
                name="topic"
                required
                defaultValue={modal.mentor.helpsWith}
              />
              <Textarea
                name="context"
                required
                minLength={20}
                placeholder="What have you tried, and what would a useful conversation help you decide?"
              />
            </>
          )}
          {modal.kind === 'schedule' && (
            <>
              <Input name="scheduledFor" type="datetime-local" required />
              <Input
                name="schedulingUrl"
                type="url"
                placeholder="Optional meeting or scheduling URL"
              />
            </>
          )}
          {modal.kind === 'note' && (
            <Textarea
              name="body"
              required
              minLength={2}
              placeholder="Add preparation, next steps, or a useful resource."
            />
          )}
          {modal.kind === 'review' && (
            <>
              <label htmlFor="effort-rating" className="text-sm font-semibold">
                Preparation and effort
              </label>
              <NativeSelect
                id="effort-rating"
                name="effortRating"
                className="w-full"
                required
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <NativeSelectOption key={n} value={String(n)}>
                    {n} —{' '}
                    {n >= 4
                      ? 'Strong'
                      : n === 3
                        ? 'Adequate'
                        : 'Needs attention'}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <label htmlFor="outcome" className="text-sm font-semibold">
                Outcome or fit (informational only)
              </label>
              <NativeSelect id="outcome" name="outcome" className="w-full">
                <NativeSelectOption value="ongoing">
                  Still in progress
                </NativeSelectOption>
                <NativeSelectOption value="yes">
                  Opportunity progressed
                </NativeSelectOption>
                <NativeSelectOption value="no">
                  Not a fit this time
                </NativeSelectOption>
                <NativeSelectOption value="not_applicable">
                  Not applicable
                </NativeSelectOption>
              </NativeSelect>
              <Textarea
                name="potentialDirection"
                placeholder="Optional: potential you saw and a useful next direction."
              />
              <p className="rounded-xl bg-muted p-3 text-xs leading-5 text-muted-foreground">
                A “no” outcome never lowers reputation. Only preparation and
                effort can add a positive signal.
              </p>
            </>
          )}
          {modal.kind === 'safety' && (
            <>
              <NativeSelect name="kind" className="w-full">
                <NativeSelectOption value="no_show">
                  No-show without notice
                </NativeSelectOption>
                <NativeSelectOption value="non_engagement">
                  Non-engagement
                </NativeSelectOption>
                <NativeSelectOption value="conduct">
                  Conduct concern
                </NativeSelectOption>
              </NativeSelect>
              <Textarea
                name="details"
                required
                minLength={20}
                placeholder="Describe observable facts. This stays private and the other person has a right to respond."
              />
              <p className="rounded-xl bg-[#fff2ec] p-3 text-xs leading-5 text-[#8b4025]">
                <ShieldAlert className="mb-2 size-4" />
                Nothing is shown publicly and no restriction is automatic.
              </p>
            </>
          )}
          <Button disabled={busy} className="h-11 rounded-full">
            {busy ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <>
                {modal.kind === 'review' ? 'Seal review' : 'Submit'}{' '}
                <ArrowRight />
              </>
            )}
          </Button>
        </form>
      </dialog>
    </div>
  );
}
function Status({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-[#fff1db] text-[#8b541d]',
    accepted: 'bg-[#e7efff] text-[#355895]',
    active: 'bg-[#e6f4eb] text-[#27613d]',
    completed: 'bg-[#e9e7f8] text-[#51488b]',
    declined: 'bg-muted text-muted-foreground',
    cancelled: 'bg-muted text-muted-foreground',
  };
  return <Badge className={colors[status] ?? ''}>{status}</Badge>;
}
function Empty({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-[22px] border border-dashed p-8 text-center text-sm text-muted-foreground">
      <BookOpen className="mx-auto mb-3 size-5" />
      {text}
    </div>
  );
}
