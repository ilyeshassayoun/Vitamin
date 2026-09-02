'use client';

import { useState } from 'react';
import { ArrowRight, BookOpen, Check, ChevronRight, Compass, HeartHandshake, MapPin, Menu, MessageCircle, Search, ShieldCheck, Sparkles, Users, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

type Mentor = { name: string; initials: string; role: string; company: string; languages: string; helps: string; accent: string };

const mentors: Mentor[] = [
  { name: 'Lucía Ramos', initials: 'LR', role: 'Senior Associate · Audit', company: 'Big 4 · München', languages: 'ES · DE · EN', helps: 'Interview preparation', accent: 'bg-[#ffd7b5] text-[#713716]' },
  { name: 'Daniel Weber', initials: 'DW', role: 'Consultant · Deals', company: 'Advisory · München', languages: 'DE · EN', helps: 'CV feedback', accent: 'bg-[#cfe8d7] text-[#1f5635]' },
  { name: 'María Santos', initials: 'MS', role: 'Manager · Tax', company: 'Big 4 · München', languages: 'ES · DE', helps: 'Career orientation', accent: 'bg-[#d7dcff] text-[#344184]' },
];

export function VitaminPreview({ signedInName }: { signedInName: string | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [sent, setSent] = useState(false);
  const [search, setSearch] = useState('');
  const visibleMentors = mentors.filter((mentor) => `${mentor.name} ${mentor.role} ${mentor.helps}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-17 max-w-[1440px] items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5" aria-label="Vitamin home">
            <span className="grid size-9 place-items-center rounded-[13px] bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(30,98,66,.2)]"><Sparkles className="size-4" /></span>
            <span className="font-heading text-xl font-semibold tracking-[-.03em]">vitamin</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label="Primary navigation">
            <a href="#discover" className="font-medium text-foreground">Discover</a><a href="#community" className="transition-colors hover:text-foreground">Community</a><a href="#how" className="transition-colors hover:text-foreground">How it works</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <button className="rounded-full px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted">ES <span className="text-border">/</span> DE</button>
            {signedInName ? <Button nativeButton={false} className="h-10 rounded-full px-5" render={<a href="/app" />}>Open my Vitamin</Button> : <Button nativeButton={false} className="h-10 rounded-full px-5" render={<a href="/signin-with-chatgpt?return_to=%2Fapp" target="_top" />}>Join the pilot</Button>}
          </div>
          <button className="grid size-10 place-items-center rounded-full border md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <nav className="border-t bg-background px-5 py-4 md:hidden"><a className="block py-3 font-semibold" href="#discover">Discover</a><a className="block py-3" href="#community">Community</a><a className="block py-3" href="#how">How it works</a></nav>}
      </header>

      <section id="top" className="mx-auto grid max-w-[1440px] gap-7 px-5 pb-8 pt-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,.72fr)] lg:px-8 lg:pt-12">
        <div className="relative overflow-hidden rounded-[32px] bg-[#173f30] px-6 py-9 text-white sm:px-10 sm:py-12 lg:min-h-[390px] lg:px-14 lg:py-14">
          <div className="absolute -right-20 -top-24 size-80 rounded-full border-[54px] border-[#2e624d] opacity-80" /><div className="absolute -bottom-24 right-32 size-56 rounded-full bg-[#f3b36c] opacity-90 blur-[1px]" />
          <div className="relative max-w-2xl">
            <Badge className="mb-7 border-white/15 bg-white/10 text-white">Munich · AFT pilot</Badge>
            <h1 className="font-heading text-[clamp(2.65rem,6vw,5.25rem)] font-semibold leading-[.93] tracking-[-.065em]">Your next door should not depend on who you know.</h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/72 sm:text-lg">A community where effort opens access. Meet people who can guide you—and pass it forward when you can.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="h-11 rounded-full bg-[#f3b36c] px-5 text-[#2a1b0c] hover:bg-[#ffc47f]" onClick={() => document.querySelector('#discover')?.scrollIntoView({ behavior: 'smooth' })}>Find a mentor <ArrowRight /></Button>
              <Button variant="outline" className="h-11 rounded-full border-white/20 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white">Become a mentor</Button>
            </div>
          </div>
        </div>
        <Card className="rounded-[32px] border-0 bg-[#f0eee6] py-0 ring-0"><CardContent className="flex h-full flex-col p-7 sm:p-9">
          <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">Your journey</p><h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-.04em]">One contribution away</h2></div><span className="grid size-11 place-items-center rounded-full bg-white"><HeartHandshake className="text-primary" /></span></div>
          <div className="mt-8"><div className="mb-3 flex justify-between text-sm"><span>Profile progress</span><strong>75%</strong></div><Progress value={75} className="[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-white [&_[data-slot=progress-indicator]]:bg-[#e87943]" /></div>
          <ol className="mt-8 space-y-5"><JourneyStep done label="Create your profile" /><JourneyStep done label="Verify your identity" /><JourneyStep label="Share something useful" active /><JourneyStep label="Request your first conversation" /></ol>
          <Button variant="outline" className="mt-auto h-11 w-full rounded-full border-transparent bg-white" onClick={() => document.querySelector('#community')?.scrollIntoView({ behavior: 'smooth' })}>Complete contribution <ChevronRight /></Button>
        </CardContent></Card>
      </section>

      <section id="discover" className="mx-auto max-w-[1440px] px-5 py-14 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="section-kicker">People one step ahead</p><h2 className="section-title">Start with a useful conversation.</h2></div><label className="relative block w-full sm:w-72"><span className="sr-only">Search mentors</span><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search skill or name" className="h-11 rounded-full bg-card pl-10" /></label></div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">{visibleMentors.map((mentor) => <article key={mentor.name} className="mentor-card">
          <div className="flex items-start justify-between"><span className={`grid size-14 place-items-center rounded-2xl text-sm font-bold ${mentor.accent}`}>{mentor.initials}</span><Badge variant="outline" className="border-[#b8d1c1] bg-[#edf8f0] text-[#27613d]"><ShieldCheck /> Verified</Badge></div>
          <h3 className="mt-6 font-heading text-xl font-semibold tracking-[-.03em]">{mentor.name}</h3><p className="mt-1 text-sm text-muted-foreground">{mentor.role}</p>
          <div className="mt-5 space-y-2 text-sm"><p className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" />{mentor.company}</p><p className="flex items-center gap-2"><MessageCircle className="size-4 text-muted-foreground" />{mentor.languages}</p></div>
          <div className="mt-6 flex items-center justify-between border-t pt-5"><span className="text-xs font-semibold text-muted-foreground">Helps with<br/><strong className="text-sm text-foreground">{mentor.helps}</strong></span><Button size="icon-lg" className="rounded-full" aria-label={`Request help from ${mentor.name}`} onClick={() => { setSelectedMentor(mentor); setSent(false); }}><ArrowRight /></Button></div>
        </article>)}</div>
      </section>

      <section id="how" className="border-y bg-[#f5f2e9]"><div className="mx-auto max-w-[1440px] px-5 py-16 lg:px-8"><p className="section-kicker">Not points. Not prestige.</p><h2 className="section-title max-w-2xl">Your track record grows from showing up.</h2><div className="mt-10 grid gap-px overflow-hidden rounded-[28px] border bg-border md:grid-cols-3"><Principle icon={<Compass />} number="01" title="Contribute" text="Share something useful before asking for direct help." /><Principle icon={<Users />} number="02" title="Connect" text="Request one focused conversation with a verified mentor." /><Principle icon={<HeartHandshake />} number="03" title="Pass it on" text="Help someone one step behind when your moment comes." /></div></div></section>

      <section id="community" className="mx-auto grid max-w-[1440px] gap-8 px-5 py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-8"><div><p className="section-kicker">Community knowledge</p><h2 className="section-title">One thing that helped me.</h2><p className="mt-4 max-w-md leading-7 text-muted-foreground">Every member begins by leaving one useful idea behind. No gate on learning, no debt to repay.</p><Button variant="outline" className="mt-7 h-11 rounded-full px-5"><BookOpen /> Browse all guides</Button></div><div className="grid gap-4 sm:grid-cols-2"><CommunityCard tag="Interview" title="Three questions I wish I had prepared before my first audit interview" author="Ana · Rising Mentor" /><CommunityCard tag="CV" title="The one-page CV structure that finally got me responses in Germany" author="Mateo · Student" /></div></section>
      <footer className="border-t px-5 py-8 text-sm text-muted-foreground lg:px-8"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-4 sm:flex-row"><span>© 2026 Vitamin · Built for fairer access.</span><span>Munich pilot · Español / Deutsch</span></div></footer>

      {selectedMentor && <div className="fixed inset-0 z-50 grid place-items-center bg-[#10291f]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="request-title"><div className="w-full max-w-lg rounded-[28px] bg-card p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="section-kicker">Focused request</p><h2 id="request-title" className="mt-1 font-heading text-2xl font-semibold">Ask {selectedMentor.name}</h2></div><button className="grid size-9 place-items-center rounded-full bg-muted" onClick={() => setSelectedMentor(null)} aria-label="Close request"><X className="size-4" /></button></div>{sent ? <div className="py-10 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-[#e4f3e8] text-primary"><Check /></span><h3 className="mt-5 text-xl font-semibold">Request ready</h3><p className="mx-auto mt-2 max-w-xs text-muted-foreground">This preview shows the complete request state. Persistent submission is connected in the next build slice.</p><Button className="mt-6 rounded-full px-6" onClick={() => setSelectedMentor(null)}>Done</Button></div> : <form className="mt-7 space-y-5" onSubmit={(event) => { event.preventDefault(); setSent(true); }}><label className="block text-sm font-semibold">What would you like help with?<Input required className="mt-2 h-11" defaultValue={selectedMentor.helps} /></label><label className="block text-sm font-semibold">Make your request specific<Textarea required className="mt-2 min-h-28" placeholder="Share what you have tried, where you are stuck, and what a useful conversation would help you decide." /></label><div className="rounded-xl bg-muted p-4 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">One active request at a time.</strong> Vitamin protects focused, serious conversations for both sides.</div><Button type="submit" className="h-11 w-full rounded-full">Review request <ArrowRight /></Button></form>}</div></div>}
    </main>
  );
}

function JourneyStep({ label, done = false, active = false }: { label: string; done?: boolean; active?: boolean }) { return <li className={`flex items-center gap-3 text-sm ${active ? 'font-semibold' : 'text-muted-foreground'}`}><span className={`grid size-6 place-items-center rounded-full text-xs ${done ? 'bg-primary text-white' : active ? 'border-2 border-[#e87943] bg-white' : 'border bg-white'}`}>{done ? <Check className="size-3.5" /> : ''}</span>{label}</li> }
function Principle({ icon, number, title, text }: { icon: React.ReactNode; number: string; title: string; text: string }) { return <article className="bg-background p-7 sm:p-9"><div className="flex items-center justify-between text-primary">{icon}<span className="font-mono text-xs text-muted-foreground">{number}</span></div><h3 className="mt-10 font-heading text-xl font-semibold">{title}</h3><p className="mt-2 leading-6 text-muted-foreground">{text}</p></article> }
function CommunityCard({ tag, title, author }: { tag: string; title: string; author: string }) { return <article className="group rounded-[24px] border bg-card p-6 transition-transform hover:-translate-y-1"><Badge variant="secondary">{tag}</Badge><h3 className="mt-8 text-lg font-semibold leading-6 tracking-[-.02em]">{title}</h3><div className="mt-8 flex items-center justify-between text-xs text-muted-foreground"><span>{author}</span><ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></div></article> }
