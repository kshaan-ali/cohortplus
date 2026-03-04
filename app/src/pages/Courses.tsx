import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi } from '@/services/api';
import type { Course } from '@/types';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { ErrorMessage } from '@/components/ui-custom/ErrorMessage';
import { BookOpen, ArrowRight, Search, Users, Zap, Star } from 'lucide-react';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  :root {
    --blue: #2563EB; --blue-bright: #3B82F6; --blue-glow: #60A5FA; --blue-dim: #1D4ED8;
    --black: #020408; --surface: #060C14; --surface2: #0A1220; --surface3: #0F1A2E;
    --border: rgba(37,99,235,0.18); --border-hover: rgba(59,130,246,0.45);
    --text: #E8F0FF; --muted: #6B86A8; --grid-color: rgba(37,99,235,0.06);
  }
  .courses-root * { box-sizing: border-box; }
  .courses-root { font-family: 'DM Sans', sans-serif; background: var(--black); color: var(--text); min-height: 100vh; overflow-x: hidden; }
  .grid-bg { background-image: linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px); background-size: 60px 60px; }
  .grid-bg-sm { background-image: linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px); background-size: 30px 30px; }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes fadeUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
  @keyframes borderGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); } 50% { box-shadow: 0 0 30px 4px rgba(37,99,235,0.15); } }
  .fade-up { animation: fadeUp .6s ease both; }
  .course-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all .4s cubic-bezier(.4,0,.2,1);
  }
  .course-card:hover {
    border-color: var(--border-hover);
    transform: translateY(-6px);
    box-shadow: 0 24px 80px rgba(37,99,235,0.18), 0 0 0 1px rgba(59,130,246,0.12);
  }
  .course-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(96,165,250,0.5), transparent);
    opacity: 0;
    transition: opacity .4s;
  }
  .course-card:hover::before { opacity: 1; }
  .tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(37,99,235,0.12); border: 1px solid rgba(37,99,235,0.35); color: var(--blue-glow); padding: 6px 14px; border-radius: 100px; font-size: 13px; }
  .search-bar { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; display: flex; align-items: center; padding: 0 20px; transition: border-color .25s, box-shadow .25s; }
  .search-bar:focus-within { border-color: rgba(59,130,246,0.5); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .search-input { background: transparent; border: none; outline: none; color: var(--text); font-size: 16px; padding: 16px 12px; flex: 1; font-family: 'DM Sans', sans-serif; }
  .search-input::placeholder { color: var(--muted); }
  .btn-view { width: 100%; background: rgba(37,99,235,0.12); border: 1px solid rgba(37,99,235,0.3); color: var(--blue-glow); border-radius: 12px; padding: 13px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all .25s; }
  .btn-view:hover { background: var(--blue); color: white; border-color: transparent; box-shadow: 0 8px 24px rgba(37,99,235,0.4); }
  .section-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(36px, 5vw, 56px); line-height: 1.1; }
  .shimmer-text { background: linear-gradient(90deg, var(--blue-bright) 0%, var(--blue-glow) 50%, var(--blue-bright) 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 3s linear infinite; }
  .tutor-chip { display: inline-flex; align-items: center; gap: 6px; background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.2); color: var(--blue-glow); border-radius: 100px; padding: 4px 12px; font-size: 12px; font-weight: 600; }
  .card-thumbnail { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; transition: transform .6s cubic-bezier(.4,0,.2,1); }
  .course-card:hover .card-thumbnail { transform: scale(1.06); }
  .thumb-placeholder { aspect-ratio: 16/9; width: 100%; background: var(--surface3); display: flex; align-items: center; justify-content: center; }
  .thumb-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(6,12,20,0.9) 100%); }
  .premium-badge { position: absolute; top: 14px; right: 14px; background: rgba(6,12,20,0.75); backdrop-filter: blur(8px); border: 1px solid rgba(96,165,250,0.35); color: var(--blue-glow); font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: 5px 12px; border-radius: 100px; }
  .stats-row { display: flex; gap: 16px; align-items: center; margin-top: 8px; }
  .stat { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--muted); }
  .empty-box { background: var(--surface); border: 1px dashed rgba(37,99,235,0.2); border-radius: 24px; padding: 80px 40px; text-align: center; }
  .line-h { height: 1px; background: linear-gradient(90deg, transparent, var(--border-hover), transparent); }
  @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .ticker-track { animation: ticker 20s linear infinite; display: flex; white-space: nowrap; }
`;

export function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coursesApi.getAll();
      setCourses(data);
      setFilteredCourses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  if (loading) {
    return (
      <div className="courses-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <style>{STYLES}</style>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tickerItems = ['Expert Tutors', 'Live Sessions', 'Cohort Learning', 'Zoom Integration', 'Batch Scheduling', 'Course Materials'];

  return (
    <div className="courses-root">
      <style>{STYLES}</style>

      {/* ── HERO ── */}
      <section className="grid-bg" style={{ position: 'relative', overflow: 'hidden', paddingTop: 120, paddingBottom: 80 }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)', top: '-30%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div className="fade-up" style={{ marginBottom: 20 }}>
            <span className="tag"><Zap size={12} /> Premium Learning Experience</span>
          </div>
          <h1 className="fade-up section-title" style={{ marginBottom: 20 }}>
            Empower Your{' '}
            <span className="shimmer-text">Future</span>
          </h1>
          <p className="fade-up" style={{ color: 'var(--muted)', fontSize: 'clamp(16px,2vw,20px)', maxWidth: 580, margin: '0 auto 48px', lineHeight: 1.75 }}>
            Master new skills with expert-led, cohort-based courses. Learn live, grow together.
          </p>

          {/* Search */}
          <div className="fade-up" style={{ maxWidth: 640, margin: '0 auto' }}>
            <div className="search-bar">
              <Search size={20} color="var(--muted)" />
              <input
                className="search-input"
                type="text"
                placeholder="Search courses, skills, or tutors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}
                >✕</button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '14px 0', overflow: 'hidden' }}>
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 28px', color: 'var(--muted)', fontSize: 13, fontWeight: 500 }}>
              <Star size={11} color="var(--blue)" fill="var(--blue)" /> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── COURSE GRID ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 120px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={22} color="var(--blue-glow)" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, margin: 0 }}>
                {searchQuery ? `Results for "${searchQuery}"` : 'All Courses'}
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: 14, margin: '4px 0 0' }}>
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} available
              </p>
            </div>
          </div>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {filteredCourses.length === 0 ? (
          <div className="empty-box">
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Search size={30} color="var(--muted)" />
            </div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
              {searchQuery ? `No results for "${searchQuery}"` : 'No courses yet'}
            </h3>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Try a different search term or check back soon.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', color: 'var(--blue-glow)', borderRadius: 10, padding: '10px 24px', fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: 'pointer' }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filteredCourses.map((course, idx) => (
              <div key={course.id} className="course-card" style={{ animationDelay: `${idx * 0.07}s` }}>
                {/* Thumbnail */}
                <div style={{ position: 'relative', overflow: 'hidden', height: 200, background: 'var(--surface3)' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="grid-bg-sm">
                    <BookOpen size={40} color="rgba(96,165,250,0.15)" />
                  </div>
                  {course.thumbnail_url && (
                    <img
                      src={`${course.thumbnail_url.trim()}?t=${Date.now()}`}
                      alt={course.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .6s cubic-bezier(.4,0,.2,1), opacity .3s', position: 'relative', zIndex: 1 }}
                      className="card-thumbnail"
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                    />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(6,12,20,0.85) 100%)', zIndex: 2 }} />
                  <div className="premium-badge" style={{ zIndex: 3 }}>
                    <Star size={9} fill="currentColor" style={{ display: 'inline', marginRight: 4 }} />
                    Premium
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '24px 24px 20px', flex: 1, display: 'flex', flexDirection: 'column' }} className="grid-bg-sm">
                  <div className="tutor-chip" style={{ alignSelf: 'flex-start', marginBottom: 14 }}>
                    <Users size={11} />
                    {course.tutor_name || 'Expert Tutor'}
                  </div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, lineHeight: 1.3, marginBottom: 10, transition: 'color .25s' }}>
                    {course.title}
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description || 'No description available for this course.'}
                  </p>

                  {/* Stats */}
                  <div style={{ height: 1, background: 'var(--border)', margin: '18px 0' }} />

                  <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
                    <button className="btn-view">
                      View Course
                      <ArrowRight size={15} />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
