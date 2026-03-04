import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { enrollmentsApi, liveSessionsApi } from '@/services/api';
import type { Enrollment, LiveSession } from '@/types';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { ErrorMessage } from '@/components/ui-custom/ErrorMessage';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  MessageCircle,
  ArrowRight,
  Video,
} from 'lucide-react';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  :root {
    --blue: #2563EB; --blue-bright: #3B82F6; --blue-glow: #60A5FA; --blue-dim: #1D4ED8;
    --black: #020408; --surface: #060C14; --surface2: #0A1220; --surface3: #0F1A2E;
    --border: rgba(37,99,235,0.18); --border-hover: rgba(59,130,246,0.45);
    --text: #E8F0FF; --muted: #6B86A8; --grid-color: rgba(37,99,235,0.06);
  }
  .enroll-root * { box-sizing: border-box; }
  .enroll-root { font-family: 'DM Sans', sans-serif; background: var(--black); color: var(--text); min-height: 100vh; overflow-x: hidden; }
  .grid-bg { background-image: linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px); background-size: 60px 60px; }
  .grid-bg-sm { background-image: linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px); background-size: 30px 30px; }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes fadeUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
  @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .fade-up { animation: fadeUp .6s ease both; }
  .ticker-track { animation: ticker 20s linear infinite; display: flex; white-space: nowrap; }
  .shimmer-text { background: linear-gradient(90deg, var(--blue-bright) 0%, var(--blue-glow) 50%, var(--blue-bright) 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 3s linear infinite; }
  .section-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(36px, 5vw, 56px); line-height: 1.1; }
  .tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(37,99,235,0.12); border: 1px solid rgba(37,99,235,0.35); color: var(--blue-glow); padding: 6px 14px; border-radius: 100px; font-size: 13px; }
  .enroll-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all .4s cubic-bezier(.4,0,.2,1);
  }
  .enroll-card:hover {
    border-color: var(--border-hover);
    transform: translateY(-6px);
    box-shadow: 0 24px 80px rgba(37,99,235,0.18), 0 0 0 1px rgba(59,130,246,0.12);
  }
  .enroll-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(96,165,250,0.5), transparent);
    opacity: 0;
    transition: opacity .4s;
  }
  .enroll-card:hover::before { opacity: 1; }
  .enroll-card:hover .thumb-img { transform: scale(1.06); }
  .thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .6s cubic-bezier(.4,0,.2,1); }
  .btn-primary-dark { width: 100%; background: var(--blue); color: white; border: none; border-radius: 12px; padding: 13px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all .25s; }
  .btn-primary-dark:hover { background: var(--blue-bright); box-shadow: 0 8px 24px rgba(37,99,235,0.5); transform: translateY(-1px); }
  .btn-outline-dark { width: 100%; background: rgba(37,99,235,0.08); color: var(--blue-glow); border: 1px solid rgba(37,99,235,0.25); border-radius: 12px; padding: 12px; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all .25s; }
  .btn-outline-dark:hover { background: rgba(37,99,235,0.18); border-color: rgba(59,130,246,0.5); }
  .btn-browse { background: var(--blue); color: white; border: none; padding: 14px 28px; border-radius: 12px; font-family: 'Syne', sans-serif; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all .25s; font-size: 15px; }
  .btn-browse:hover { background: var(--blue-bright); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(37,99,235,0.5); }
  .active-badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); color: #34d399; border-radius: 100px; padding: 4px 12px; font-size: 11px; font-weight: 700; }
  .date-chip { display: inline-flex; align-items: center; gap: 5px; color: var(--muted); font-size: 12px; }
  .empty-box { background: var(--surface); border: 1px dashed rgba(37,99,235,0.2); border-radius: 24px; padding: 80px 40px; text-align: center; }
  .line-h { height: 1px; background: linear-gradient(90deg, transparent, var(--border-hover), transparent); }
`;

interface EnrollmentWithSessions extends Enrollment {
  sessions?: LiveSession[];
}

export function MyEnrollments() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrollmentWithSessions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await enrollmentsApi.getMyEnrollments();
      const enrollmentsWithSessions = await Promise.all(
        data.map(async (enrollment) => {
          try {
            const sessions = await liveSessionsApi.getByBatch(enrollment.batch_id);
            return { ...enrollment, sessions };
          } catch {
            return { ...enrollment, sessions: [] };
          }
        })
      );
      setEnrollments(enrollmentsWithSessions);
    } catch (err: any) {
      setError(err.message || 'Failed to load enrollments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };



  if (loading) {
    return (
      <div className="enroll-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <style>{STYLES}</style>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="enroll-root">
      <style>{STYLES}</style>



      {/* ── GRID ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 120px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={22} color="var(--blue-glow)" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, margin: 0 }}>
              Active Cohorts
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: '4px 0 0' }}>
              {enrollments.length} {enrollments.length === 1 ? 'enrollment' : 'enrollments'} found
            </p>
          </div>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {enrollments.length === 0 ? (
          <div className="empty-box">
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <GraduationCap size={32} color="var(--muted)" />
            </div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
              Start your learning journey
            </h3>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
              You haven't enrolled in any cohorts yet. Explore our top courses and join your first batch today!
            </p>
            <button className="btn-browse" onClick={() => navigate('/courses')}>
              <BookOpen size={16} />
              Discover Courses
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {enrollments.map((enrollment, idx) => {
              const course = (enrollment as any).course;
              const thumbnailUrl = course?.thumbnail_url;
              return (
                <div key={enrollment.id} className="enroll-card" style={{ animationDelay: `${idx * 0.07}s` }}>
                  {/* Thumbnail */}
                  <div style={{ position: 'relative', overflow: 'hidden', height: 200, background: 'var(--surface3)' }}>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="grid-bg-sm">
                      <BookOpen size={40} color="rgba(96,165,250,0.15)" />
                    </div>
                    {thumbnailUrl && (
                      <img
                        src={`${thumbnailUrl.trim()}?t=${Date.now()}`}
                        alt={enrollment.course_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .6s cubic-bezier(.4,0,.2,1), opacity .3s', position: 'relative', zIndex: 1 }}
                        className="thumb-img"
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                      />
                    )}
                    {/* Overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(6,12,20,0.85) 100%)' }} />
                    {/* Active badge */}
                    <div style={{ position: 'absolute', top: 14, left: 14 }}>
                      <span className="active-badge">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'none' }} />
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '22px 22px 20px', flex: 1, display: 'flex', flexDirection: 'column' }} className="grid-bg-sm">
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 19, lineHeight: 1.3, marginBottom: 10 }}>
                      {enrollment.course_name}
                    </h3>

                    <div className="date-chip" style={{ marginBottom: 20 }}>
                      <Calendar size={13} color="var(--blue-glow)" />
                      Started {formatDate(enrollment.batch_start_date || '')}
                    </div>

                    <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
                      <Link to={`/enrollment/${enrollment.batch_id}`} style={{ textDecoration: 'none' }}>
                        <button className="btn-primary-dark">
                          View Details
                          <ArrowRight size={15} />
                        </button>
                      </Link>
                      <Link to={`/community/${enrollment.batch_id}`} style={{ textDecoration: 'none' }}>
                        <button className="btn-outline-dark">
                          <MessageCircle size={15} />
                          Community Chat
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
