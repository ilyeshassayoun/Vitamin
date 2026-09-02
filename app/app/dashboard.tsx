'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CircleUserRound, HeartHandshake, LoaderCircle, LogOut, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';

type Profile = { displayName: string; language: string; situation: string | null; verificationStatus: string; onboardingComplete: number; activeRequestLimit: number };
type Mentor = { id: string; name: string; initials: string; role: string; company: string; languages: string; helpsWith: string; verified: number };
type HelpRequest = { id: string; topic: string; status: string; mentorName: string; mentorRole: string; createdAt: string };

export function Dashboard({ displayName }: { displayName: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [selected, setSelected] = useState<Mentor | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function refresh() {
    const [me, mentorData, requestData] = await Promise.all([fetch('/api/me').then((r) => r.json()), fetch('/api/mentors').then((r) => r.json()), fetch('/api/requests').then((r) => r.json())]);
    setProfile(me.profile ?? null); setMentors(mentorData.mentors ?? []); setRequests(requestData.requests ?? []);
  }

  useEffect(() => { void refresh(); }, []);

  async function saveContribution(formData: FormData) {
    setBusy(true); setNotice('');
    const response = await fetch('/api/contributions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData)) });
    const data = await response.json();
    setNotice(response.ok ? 'Contribution published. Direct requests are now unlocked.' : data.error);
    await refresh(); setBusy(false);
  }

  async function createRequest(formData: FormData) {
    if (!selected) return;
    setBusy(true); setNotice('');
    const response = await fetch('/api/requests', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...Object.fromEntries(formData), mentorId: selected.id }) });
    const data = await response.json();
    setNotice(response.ok ? `Your focused request to ${selected.name} is now pending.` : data.error);
    if (response.ok) setSelected(null);
    await refresh(); setBusy(false);
  }

  if (!profile) return <div className="grid min-h-screen place-items-center bg-background"><LoaderCircle className="animate-spin text-primary" /></div>;
  const onboarded = Boolean(profile.onboardingComplete);

  return <main className="min-h-screen bg-background">
    <header className="border-b bg-background/90 backdrop-blur-xl"><div className="mx-auto flex h-17 max-w-[1300px] items-center justify-between px-5 lg:px-8"><a href="/" className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-[13px] bg-primary text-primary-foreground"><Sparkles className="size-4" /></span><strong className="font-heading text-xl">vitamin</strong></a><div className="flex items-center gap-3"><Badge variant="outline" className="hidden sm:flex"><ShieldCheck /> Identity verified</Badge><a href="/signout-with-chatgpt?return_to=%2F" aria-label="Sign out"><Button variant="ghost" size="icon"><LogOut /></Button></a></div></div></header>
    <div className="mx-auto max-w-[1300px] px-5 py-9 lg:px-8">
      <a href="/" className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" /> Public site</a>
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(290px,.55fr)]">
        <section>
          <p className="section-kicker">Your Vitamin</p><h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-.05em]">Welcome, {displayName.split(' ')[0]}.</h1><p className="mt-3 text-muted-foreground">One useful action at a time. No points, no popularity contest.</p>
          {notice && <div className="mt-6 rounded-2xl border border-primary/20 bg-[#edf7f0] p-4 text-sm text-primary">{notice}</div>}
          {!onboarded ? <section className="mt-8 rounded-[28px] border bg-card p-6 sm:p-8"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f3b36c]/25 text-[#a55325]"><HeartHandshake /></span><div><h2 className="font-heading text-2xl font-semibold tracking-[-.04em]">Share one thing that helped you</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Your first contribution unlocks direct requests and makes the community useful from day one.</p></div></div><form action={saveContribution} className="mt-7 grid gap-5"><label className="text-sm font-semibold">Short title<Input name="title" required minLength={5} className="mt-2 h-11" placeholder="How I prepared for my first case interview" /></label><label className="text-sm font-semibold">Category<NativeSelect name="category" className="mt-2 w-full" required><NativeSelectOption value="interview">Interview</NativeSelectOption><NativeSelectOption value="cv">CV</NativeSelectOption><NativeSelectOption value="orientation">Career orientation</NativeSelectOption></NativeSelect></label><label className="text-sm font-semibold">What did you learn?<Textarea name="body" required minLength={20} className="mt-2 min-h-36" placeholder="Be specific enough that another person can use it." /></label><Button disabled={busy} className="h-11 rounded-full">{busy ? <LoaderCircle className="animate-spin" /> : <>Publish contribution <ArrowRight /></>}</Button></form></section> : <MentorGrid mentors={mentors} onSelect={setSelected} />}
        </section>
        <aside className="space-y-5"><div className="rounded-[24px] bg-[#173f30] p-6 text-white"><CircleUserRound className="size-7 text-[#f3b36c]" /><h2 className="mt-8 font-heading text-xl font-semibold">{profile.displayName}</h2><p className="mt-1 text-sm text-white/65">Mentee · Munich AFT</p><div className="mt-6 flex items-center gap-2 text-sm"><MapPin className="size-4" /> Munich</div><div className="mt-5 border-t border-white/15 pt-5 text-sm"><div className="flex justify-between"><span className="text-white/60">Active capacity</span><strong>{requests.filter((r) => ['pending','accepted','active'].includes(r.status)).length} / {profile.activeRequestLimit}</strong></div></div></div><div className="rounded-[24px] border bg-card p-6"><h2 className="font-heading text-lg font-semibold">Your requests</h2>{requests.length ? <ul className="mt-5 space-y-4">{requests.map((request) => <li key={request.id} className="border-t pt-4 first:border-0 first:pt-0"><div className="flex items-center justify-between"><strong className="text-sm">{request.mentorName}</strong><Badge variant="secondary">{request.status}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{request.topic}</p></li>)}</ul> : <p className="mt-3 text-sm leading-6 text-muted-foreground">No active requests yet. Complete your contribution, then choose one focused conversation.</p>}</div></aside>
      </div>
    </div>
    {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-[#10291f]/65 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-[28px] bg-card p-7"><div className="flex justify-between"><div><p className="section-kicker">Focused request</p><h2 className="mt-2 font-heading text-2xl font-semibold">Ask {selected.name}</h2></div><button onClick={() => setSelected(null)} className="grid size-9 place-items-center rounded-full bg-muted" aria-label="Close">×</button></div><form action={createRequest} className="mt-6 space-y-5"><label className="block text-sm font-semibold">Topic<Input name="topic" required className="mt-2 h-11" defaultValue={selected.helpsWith} /></label><label className="block text-sm font-semibold">What have you tried?<Textarea name="context" required minLength={20} className="mt-2 min-h-32" placeholder="Explain where you are stuck and what a useful conversation would help you decide." /></label><Button disabled={busy} className="h-11 w-full rounded-full">{busy ? <LoaderCircle className="animate-spin" /> : <>Send request <ArrowRight /></>}</Button></form></div></div>}
  </main>;
}

function MentorGrid({ mentors, onSelect }: { mentors: Mentor[]; onSelect: (mentor: Mentor) => void }) { return <section className="mt-9"><div className="flex items-end justify-between"><div><p className="section-kicker">Verified mentors</p><h2 className="section-title">Choose one focused conversation.</h2></div><Badge variant="outline" className="hidden sm:flex">{mentors.length} available</Badge></div><div className="mt-6 grid gap-4 md:grid-cols-2">{mentors.map((mentor) => <article className="mentor-card" key={mentor.id}><div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-[#e8eee8] font-bold text-primary">{mentor.initials}</span><div><h3 className="font-semibold">{mentor.name}</h3><p className="text-sm text-muted-foreground">{mentor.role}</p></div></div><p className="mt-5 text-sm"><strong>Helps with:</strong> {mentor.helpsWith}</p><div className="mt-5 flex items-center justify-between border-t pt-4"><span className="text-xs text-muted-foreground">{mentor.languages}</span><Button size="sm" className="rounded-full" onClick={() => onSelect(mentor)}>Request help <ArrowRight /></Button></div></article>)}</div></section> }
