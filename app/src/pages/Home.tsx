import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  GraduationCap,
  BookOpen,
  Users,
  Video,
  ArrowRight,
  CheckCircle,
  Calendar,
  LayoutDashboard,
  Zap,
  Globe,
  Star,
  TrendingUp,
  Layers,
  MessageSquare,
  Smartphone,
  Download,
  Bell,
  Wifi,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  :root {
    --blue: #2563EB; --blue-bright: #3B82F6; --blue-glow: #60A5FA; --blue-dim: #1D4ED8;
    --black: #020408; --surface: #060C14; --surface2: #0A1220; --surface3: #0F1A2E;
    --border: rgba(37,99,235,0.18); --border-hover: rgba(59,130,246,0.45);
    --text: #E8F0FF; --muted: #6B86A8; --grid-color: rgba(37,99,235,0.06);
  }
  .cohort-root * { box-sizing: border-box; }
  .cohort-root { font-family: 'DM Sans', sans-serif; background: var(--black); color: var(--text); overflow-x: hidden; }
  .grid-bg { background-image: linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px); background-size: 60px 60px; }
  .grid-bg-sm { background-image: linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px); background-size: 30px 30px; }
  @keyframes fadeUp { from { opacity:0; transform: translateY(30px); } to { opacity:1; transform: translateY(0); } }
  @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes borderPulse { 0%,100% { border-color: rgba(37,99,235,0.3); } 50% { border-color: rgba(96,165,250,0.7); } }
  .fade-up-1 { animation: fadeUp .7s ease both; }
  .fade-up-2 { animation: fadeUp .7s .15s ease both; }
  .fade-up-3 { animation: fadeUp .7s .3s ease both; }
  .fade-up-4 { animation: fadeUp .7s .45s ease both; }
  .float-anim { animation: float 4s ease-in-out infinite; }
  .feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; transition: all .35s; position: relative; overflow: hidden; }
  .feature-card:hover { border-color: var(--border-hover); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(37,99,235,0.2); }
  .bento-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 32px; overflow: hidden; position: relative; transition: all .35s ease; }
  .bento-card:hover { border-color: var(--border-hover); box-shadow: 0 0 40px rgba(37,99,235,0.15); }
  .btn-primary { background: var(--blue); color: white; border: none; padding: 14px 32px; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all .25s; font-size: 15px; }
  .btn-primary:hover { background: var(--blue-bright); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(37,99,235,0.5); }
  .btn-outline { background: transparent; color: var(--blue-glow); border: 1px solid rgba(96,165,250,0.4); padding: 14px 32px; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all .25s; font-size: 15px; }
  .btn-outline:hover { border-color: var(--blue-glow); background: rgba(96,165,250,0.08); transform: translateY(-2px); }
  .tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(37,99,235,0.12); border: 1px solid rgba(37,99,235,0.35); color: var(--blue-glow); padding: 6px 14px; border-radius: 100px; font-size: 13px; }
  .section-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 52px); line-height: 1.1; }
  .line-h { height: 1px; background: linear-gradient(90deg, transparent, var(--border-hover), transparent); }
  .noise::after { content: ''; position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E"); pointer-events: none; z-index: 0; }
  @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .ticker-track { animation: ticker 24s linear infinite; display: flex; white-space: nowrap; }
  .check-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(37,99,235,0.08); }
  .check-item:last-child { border-bottom: none; }
  .step-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 48px; line-height: 1; background: linear-gradient(135deg, rgba(37,99,235,0.4) 0%, rgba(96,165,250,0.2) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  @keyframes phoneFloat { 0%,100% { transform: translateY(0px) rotate(-4deg); } 50% { transform: translateY(-18px) rotate(-4deg); } }
  .phone-float { animation: phoneFloat 5s ease-in-out infinite; }
  @keyframes scanline { 0% { top: 0%; } 100% { top: 100%; } }
  .btn-download { background: white; color: #020408; border: none; padding: 14px 28px; border-radius: 14px; font-family: 'Syne', sans-serif; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; transition: all .25s; font-size: 15px; }
  .btn-download:hover { background: #e8f0ff; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,255,255,0.2); }
  .btn-download-outline { background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.25); padding: 14px 28px; border-radius: 14px; font-family: 'Syne', sans-serif; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; transition: all .25s; font-size: 15px; }
  .btn-download-outline:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.5); transform: translateY(-2px); }
  .app-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); padding: 6px 14px; border-radius: 100px; font-size: 13px; font-weight: 500; }
  .app-feature-chip { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 16px; }
`;

// ── Types ──────────────────────────────────────────────────

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  index: number;
}

interface HowItWorksStep {
  num: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

interface PlatformCapability {
  icon: LucideIcon;
  label: string;
  desc: string;
}

// ── Sub-components ─────────────────────────────────────────

function FeatureCard({ icon: Icon, title, desc, index }: FeatureCardProps) {
  return (
    <div className="feature-card grid-bg-sm" style={{ animationDelay: `${index * 0.1}s` }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon size={22} color="var(--blue-glow)" />
      </div>
      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{title}</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────

export function Home() {
  const { isAuthenticated, isStudent, isTutor } = useAuth?.() ?? {};
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const features: FeatureCardProps[] = [
    { icon: BookOpen, title: 'Expert-Led Courses', desc: 'Tutors create structured courses with clear outcomes and scheduled sessions.', index: 0 },
    { icon: Users, title: 'Cohort-Based Learning', desc: 'Students move through material together — building accountability and community.', index: 1 },
    { icon: Video, title: 'Live Interactive Sessions', desc: 'Real-time classes with Q&A, not pre-recorded videos you never finish.', index: 2 },
    { icon: Calendar, title: 'Flexible Batch Scheduling', desc: 'Tutors can run multiple batches so students find a time that actually works.', index: 3 },
    { icon: MessageSquare, title: 'Direct Communication', desc: 'Students and tutors stay connected throughout the course — no third-party tools needed.', index: 4 },
    { icon: TrendingUp, title: 'Progress Tracking', desc: 'Tutors monitor enrollment and session attendance. Students see where they stand.', index: 5 },
  ];

  const howItWorks: HowItWorksStep[] = [
    { num: '01', icon: BookOpen, title: 'Tutor creates a course', desc: 'Set a topic, describe what students will learn, and define the session schedule.' },
    { num: '02', icon: Layers, title: 'Open a batch', desc: 'Create one or more batches with specific start dates and enrollment limits.' },
    { num: '03', icon: Users, title: 'Students enroll', desc: 'Learners browse available courses, pick a batch that fits, and enroll.' },
    { num: '04', icon: Video, title: 'Run live sessions', desc: 'Host sessions via Zoom. Students attend, interact, and learn in real time.' },
  ];

  const studentChecklist: string[] = [
    'Browse courses and read what you\'ll actually learn',
    'Pick a batch with a schedule that suits you',
    'Enroll and join your cohort',
    'Attend live sessions and ask questions directly',
    'Track your enrolled courses in one place',
  ];

  const tutorChecklist: string[] = [
    'Create a course with your own curriculum',
    'Set up batches — dates, seats, and pricing',
    'Host live sessions with Zoom integration built in',
    'See who\'s enrolled and manage your students',
    'Build a teaching profile on the platform',
  ];

  const capabilities: PlatformCapability[] = [
    { icon: Layers, label: 'Batch Management', desc: 'Run multiple cohorts of the same course simultaneously' },
    { icon: Video, label: 'Zoom Integration', desc: 'Live sessions launch directly — no copy-pasting links' },
    { icon: Calendar, label: 'Session Scheduling', desc: 'Structured timelines keep students and tutors aligned' },
    { icon: Users, label: 'Enrollment Control', desc: 'Tutors control seat limits and enrollment windows' },
  ];

  const tickerItems: string[] = [
    'Live Sessions', 'Cohort Learning', 'Zoom Integration', 'Batch Scheduling',
    'Student Enrollment', 'Tutor Dashboards', 'Progress Tracking', 'Course Management',
  ];

  return (
    <div className="cohort-root">
      <style>{STYLES}</style>

      {/* Cursor spotlight */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999,
        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(37,99,235,0.04) 0%, transparent 60%)`
      }} />

      {/* ── HERO ── */}
      <section
        style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}
        className="grid-bg noise"
      >
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)', top: '-20%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '120px 24px 80px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div className="fade-up-1" style={{ marginBottom: 24 }}>
            <span className="tag"><Zap size={12} /> Cohort-Based Learning Platform</span>
          </div>

          <div className="fade-up-2 float-anim" style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, var(--blue) 0%, #1E3A8A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 0 60px rgba(37,99,235,0.5)' }}>
            <GraduationCap size={40} color="white" />
          </div>

          <h1 className="fade-up-2 section-title" style={{ fontSize: 'clamp(48px, 8vw, 96px)', marginBottom: 24 }}>
            Learn together with{' '}
            <span style={{ background: 'linear-gradient(90deg, var(--blue-bright), var(--blue-glow))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite' }}>
              CohortPlus
            </span>
          </h1>

          <p className="fade-up-3" style={{ color: 'var(--muted)', fontSize: 'clamp(16px, 2vw, 20px)', maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.7 }}>
            A platform where tutors run structured, cohort-based courses with live sessions — and students learn alongside peers, not alone.
          </p>

          <div className="fade-up-4" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!isAuthenticated ? (
              <>
                <Link to="/register"><button className="btn-primary">Get Started <ArrowRight size={18} /></button></Link>
                <Link to="/courses"><button className="btn-outline">Browse Courses</button></Link>
              </>
            ) : (
              <>
                <Link to="/courses"><button className="btn-primary">Browse Courses <ArrowRight size={16} /></button></Link>
                {isStudent && <Link to="/my-enrollments"><button className="btn-outline">My Enrollments</button></Link>}
                {isTutor && <Link to="/tutor-dashboard"><button className="btn-outline"><LayoutDashboard size={16} /> Dashboard</button></Link>}
              </>
            )}
          </div>

          {/* Platform pillars — no fake numbers, just what it does */}
          <div className="fade-up-4" style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, maxWidth: 800, margin: '72px auto 0', overflow: 'hidden', flexWrap: 'wrap' }}>
            {([
              { icon: BookOpen, label: 'Structured Courses' },
              { icon: Users, label: 'Cohort Batches' },
              { icon: Video, label: 'Live Sessions' },
              { icon: Calendar, label: 'Scheduled Learning' },
            ] as { icon: LucideIcon; label: string }[]).map(({ icon: Icon, label }: { icon: LucideIcon; label: string }, i: number) => (
              <div key={label} style={{ flex: '1 1 160px', padding: '28px 20px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color="var(--blue-glow)" />
                </div>
                <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600, fontFamily: 'Syne, sans-serif' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '16px 0', overflow: 'hidden' }}>
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item: string, i: number) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '0 28px', color: 'var(--muted)', fontSize: 14, fontWeight: 500 }}>
              <Star size={12} color="var(--blue)" fill="var(--blue)" /> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="tag">What's Included</span>
          <h2 className="section-title" style={{ marginTop: 16 }}>
            Built for how <span style={{ color: 'var(--blue-glow)' }}>real learning</span> works
          </h2>
          <p style={{ color: 'var(--muted)', maxWidth: 500, margin: '16px auto 0', lineHeight: 1.7 }}>
            Every feature exists to support the cohort model — tutors teaching live, students learning together.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {features.map((f: FeatureCardProps) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      <div className="line-h" style={{ maxWidth: 1280, margin: '0 auto' }} />

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '100px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="tag">How It Works</span>
          <h2 className="section-title" style={{ marginTop: 16 }}>
            From course to <span style={{ color: 'var(--blue-glow)' }}>cohort</span> in four steps
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {howItWorks.map(({ num, icon: Icon, title, desc }: HowItWorksStep) => (
            <div key={num} className="bento-card" style={{ background: 'var(--surface2)' }}>
              <div className="step-num">{num}</div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px 0 14px' }}>
                <Icon size={20} color="var(--blue-glow)" />
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="line-h" style={{ maxWidth: 1280, margin: '0 auto' }} />

      {/* ── FOR STUDENTS BENTO ── */}
      <section style={{ padding: '100px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20 }}>

          <div className="bento-card" style={{ gridColumn: 'span 5', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface3) 100%)' }}>
            <span className="tag">For Students</span>
            <h2 className="section-title" style={{ margin: '16px 0 24px' }}>
              Your journey starts<br /><span style={{ color: 'var(--blue-glow)' }}>here.</span>
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {studentChecklist.map((item: string) => (
                <li key={item} className="check-item">
                  <CheckCircle size={16} color="var(--blue-glow)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: 'var(--muted)', fontSize: 14 }}>{item}</span>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 32 }}>
              <Link to="/courses"><button className="btn-primary">Explore Courses <ArrowRight size={16} /></button></Link>
            </div>
          </div>

          <div style={{ gridColumn: 'span 7', display: 'grid', gridTemplateRows: '1fr 1fr', gap: 20 }}>

            {/* What a student sees on enrollment */}
            <div className="bento-card grid-bg" style={{ background: 'var(--surface2)' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>When you enroll in a batch</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                You'll see the full session schedule, your cohort peers, and direct access to every live class — all from your enrollments dashboard.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {(['Session schedule', 'Live class access', 'Cohort members', 'Course materials'] as string[]).map((tag: string) => (
                  <span key={tag} style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', color: 'var(--blue-glow)', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Why cohort learning */}
            <div className="bento-card" style={{ background: 'var(--surface2)' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Why cohort learning?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {([
                  { icon: Users, point: 'Accountability from peers' },
                  { icon: Calendar, point: 'Defined start & end dates' },
                  { icon: Video, point: 'Ask questions live, get answers' },
                  { icon: TrendingUp, point: 'Structured pace keeps you moving' },
                ] as { icon: LucideIcon; point: string }[]).map(({ icon: Icon, point }: { icon: LucideIcon; point: string }) => (
                  <div key={point} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <Icon size={14} color="var(--blue-glow)" style={{ flexShrink: 0, marginTop: 3 }} />
                    <span style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="line-h" style={{ maxWidth: 1280, margin: '0 auto' }} />

      {/* ── FOR TUTORS BENTO ── */}
      <section style={{ padding: '100px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20 }}>

          <div style={{ gridColumn: 'span 7', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Platform capabilities */}
            <div className="bento-card grid-bg-sm" style={{ gridColumn: 'span 2' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Platform capabilities</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {capabilities.map(({ icon: Icon, label, desc }: PlatformCapability) => (
                  <div key={label} style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color="var(--blue-glow)" />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{label}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Who this is for */}
            <div className="bento-card" style={{ background: 'var(--surface2)' }}>
              <Globe size={22} color="var(--blue-glow)" style={{ marginBottom: 12 }} />
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Who tutors on CohortPlus?</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
                Anyone with expertise and a structured way to share it — developers, designers, educators, and industry professionals who want to teach in a live, cohort format rather than selling video libraries.
              </p>
            </div>

            {/* Free to get started */}
            <div className="bento-card" style={{ background: 'var(--surface2)' }}>
              <Zap size={22} color="var(--blue-glow)" style={{ marginBottom: 12 }} />
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Get started today</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
                Create your tutor account, set up your first course, and open a batch. No approval process — you're in control from day one.
              </p>
            </div>
          </div>

          <div className="bento-card" style={{ gridColumn: 'span 5', background: 'linear-gradient(135deg, var(--surface3) 0%, var(--surface) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="tag">For Tutors</span>
              <h2 className="section-title" style={{ margin: '16px 0 24px' }}>
                Teach on your<br /><span style={{ color: 'var(--blue-glow)' }}>own terms.</span>
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {tutorChecklist.map((item: string) => (
                  <li key={item} className="check-item">
                    <CheckCircle size={16} color="var(--blue-glow)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: 'var(--muted)', fontSize: 14 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ marginTop: 32 }}>
              <Link to="/register"><button className="btn-primary">Start Teaching <ArrowRight size={16} /></button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── MOBILE APP SECTION ── */}
      <section style={{ padding: '100px 24px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(99,102,241,0.08) 50%, transparent 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 65%)', top: '50%', left: '-10%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

          {/* Left: Content */}
          <div>
            <span className="app-pill"><Smartphone size={13} /> Available on Android & iOS</span>
            <h2 className="section-title" style={{ margin: '20px 0 20px' }}>
              Take <span style={{ background: 'linear-gradient(90deg, var(--blue-bright), var(--blue-glow))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CohortPlus</span><br />everywhere you go
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 17, lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
              Access your courses, join live sessions, stay connected with your cohort peers, and never miss a class — all from your pocket.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 40 }}>
              {([
                { icon: Bell, label: 'Session Alerts', desc: 'Never miss a live class' },
                { icon: Wifi, label: 'Offline Access', desc: 'Read materials anytime' },
                { icon: MessageSquare, label: 'Batch Chat', desc: 'Stay connected to cohort' },
                { icon: Video, label: 'Join Sessions', desc: 'One-tap to live class' },
              ] as { icon: LucideIcon; label: string; desc: string }[]).map(({ icon: Icon, label, desc }) => (
                <div key={label} className="app-feature-chip">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color="var(--blue-glow)" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button className="btn-download" onClick={() => window.open('https://play.google.com/store', '_blank')}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M3.18 23.5c.32.18.7.2 1.05.04L16.5 12 13.04 8.54 3.18 23.5z" fill="#EA4335" />
                  <path d="M20.82 10.13l-3.2-1.83L13.04 12l4.58 4.58 3.2-1.83A1.92 1.92 0 0 0 22 12c0-.77-.43-1.48-1.18-1.87z" fill="#FBBC04" />
                  <path d="M4.23.46A1.9 1.9 0 0 0 3.18.5L13.04 12l3.58-3.58L4.23.46z" fill="#4285F4" />
                  <path d="M3.18.5c-.44.2-.75.64-.75 1.2v20.6c0 .56.31 1 .75 1.2l.07.04 11.54-11.54v-.28L3.25.46l-.07.04z" fill="#34A853" />
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.7 }}>Get it on</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginTop: 1 }}>Google Play</div>
                </div>
              </button>

              <button className="btn-download" onClick={() => window.open('https://apps.apple.com', '_blank')}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.7 }}>Download on the</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginTop: 1 }}>App Store</div>
                </div>
              </button>

              <button className="btn-download-outline" onClick={() => {
                const a = document.createElement('a');
                a.href = '#';
                a.download = 'CohortPlus.apk';
                a.click();
              }}>
                <Download size={18} />
                Direct APK
              </button>
            </div>

            <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={12} color="#FBBF24" fill="#FBBF24" />
              <Star size={12} color="#FBBF24" fill="#FBBF24" />
              <Star size={12} color="#FBBF24" fill="#FBBF24" />
              <Star size={12} color="#FBBF24" fill="#FBBF24" />
              <Star size={12} color="#FBBF24" fill="#FBBF24" />
              &nbsp;Built with Expo — works on Android & iOS
            </p>
          </div>

          {/* Right: Phone mockup */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div className="phone-float" style={{ position: 'relative', zIndex: 1 }}>
              {/* Phone frame */}
              <div style={{
                width: 260, height: 530, borderRadius: 40, background: 'linear-gradient(145deg, #1a1f2e 0%, #0d1117 100%)',
                border: '2px solid rgba(255,255,255,0.12)', boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(37,99,235,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
                position: 'relative', overflow: 'hidden', padding: '16px 14px 14px',
              }}>
                {/* Notch */}
                <div style={{ width: 90, height: 26, background: '#0d1117', borderRadius: '0 0 18px 18px', margin: '0 auto 8px', border: '1px solid rgba(255,255,255,0.06)' }} />
                {/* Screen content */}
                <div style={{ background: '#09090b', borderRadius: 28, height: '100%', overflow: 'hidden', position: 'relative', padding: 16 }}>
                  {/* Fake header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'Syne, sans-serif' }}>Welcome back,</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'Syne, sans-serif' }}>CohortPlus</div>
                    </div>
                    <div style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 20, padding: '3px 8px', fontSize: 8, color: '#60A5FA', fontWeight: 700 }}>STUDENT</div>
                  </div>
                  {/* Fake courses */}
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'white', marginBottom: 10, fontFamily: 'Syne, sans-serif' }}>My Enrolled Courses</div>
                  {[{ color: '#3b82f6', title: 'Web Development' }, { color: '#8b5cf6', title: 'UI/UX Design' }, { color: '#10b981', title: 'Data Science' }].map((c) => (
                    <div key={c.title} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '8px 10px', marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: c.color + '30', border: `1px solid ${c.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BookOpen size={14} color={c.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'white', fontFamily: 'Syne, sans-serif' }}>{c.title}</div>
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                          Active Cohort
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Fake nav bar */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#0d1117', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '8px 0', display: 'flex', justifyContent: 'space-around' }}>
                    {['Home', 'Explore', 'Chat', 'Profile'].map((t) => (
                      <div key={t} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, background: t === 'Home' ? 'rgba(37,99,235,0.3)' : 'transparent' }} />
                        <span style={{ fontSize: 7, color: t === 'Home' ? '#60A5FA' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Side buttons */}
                <div style={{ position: 'absolute', right: -3, top: 100, width: 3, height: 40, background: 'rgba(255,255,255,0.08)', borderRadius: '0 3px 3px 0' }} />
                <div style={{ position: 'absolute', left: -3, top: 80, width: 3, height: 30, background: 'rgba(255,255,255,0.08)', borderRadius: '3px 0 0 3px' }} />
                <div style={{ position: 'absolute', left: -3, top: 120, width: 3, height: 30, background: 'rgba(255,255,255,0.08)', borderRadius: '3px 0 0 3px' }} />
              </div>
            </div>
            {/* Glow orbs behind phone */}
            <div style={{ position: 'absolute', bottom: -40, right: '15%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(99,102,241,0.3)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 20, left: '15%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(37,99,235,0.4)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          </div>
        </div>
      </section>

      <div className="line-h" style={{ maxWidth: 1280, margin: '0 auto' }} />

      {/* ── CTA ── */}
      <section style={{ padding: '100px 24px 120px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 28, padding: 'clamp(48px, 8vw, 80px)', textAlign: 'center', animation: 'borderPulse 4s ease infinite' }} className="grid-bg">
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="tag"><Globe size={12} /> Open to tutors & students</span>
            <h2 className="section-title" style={{ marginTop: 16, marginBottom: 16 }}>
              Ready to get started?
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 18, maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Whether you're here to teach or to learn — create your account and see how cohort-based learning works.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {!isAuthenticated ? (
                <>
                  <Link to="/register"><button className="btn-primary">Create Free Account</button></Link>
                  <Link to="/courses"><button className="btn-outline">Browse Courses</button></Link>
                </>
              ) : (
                <Link to="/courses"><button className="btn-primary">Browse Courses <ArrowRight size={16} /></button></Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18 }}>CohortPlus</span>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>© 2026 CohortPlus. Built for cohort-based learning.</p>
      </footer>
    </div>
  );
}