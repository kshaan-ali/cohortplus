import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { enrollmentsApi, liveSessionsApi, materialsApi, recordingsApi } from '@/services/api';
import type { Enrollment, LiveSession, CourseMaterial } from '@/types';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { ErrorMessage } from '@/components/ui-custom/ErrorMessage';
import {
    Video, FileText, Play, ArrowLeft, Calendar, Clock,
    Download, BookOpen, MessageCircle, CheckCircle,
} from 'lucide-react';
import { format } from '@/lib/utils';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  :root {
    --blue:#2563EB; --blue-bright:#3B82F6; --blue-glow:#60A5FA;
    --black:#020408; --surface:#060C14; --surface2:#0A1220; --surface3:#0F1A2E;
    --border:rgba(37,99,235,0.18); --border-h:rgba(59,130,246,0.45);
    --text:#E8F0FF; --muted:#6B86A8; --grid:rgba(37,99,235,0.06);
  }
  .ed-root { font-family:'DM Sans',sans-serif; background:var(--black); color:var(--text); min-height:100vh; }
  .grid-bg { background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px); background-size:60px 60px; }
  .grid-bg-sm { background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px); background-size:30px 30px; }
  .back-btn { display:inline-flex; align-items:center; gap:8px; color:var(--muted); font-size:14px; font-weight:600; text-decoration:none; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:10px; padding:8px 14px; transition:all .2s; }
  .back-btn:hover { color:var(--text); border-color:var(--border-h); background:rgba(37,99,235,0.08); }
  .ed-panel { background:var(--surface); border:1px solid var(--border); border-radius:20px; overflow:hidden; margin-bottom:20px; }
  .ed-panel-header { padding:18px 22px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:12px; }
  .ed-panel-body { padding:20px 22px; }
  .active-badge { display:inline-flex; align-items:center; gap:5px; background:rgba(52,211,153,0.1); border:1px solid rgba(52,211,153,0.25); color:#34d399; border-radius:100px; padding:5px 13px; font-size:12px; font-weight:700; }
  .date-chip { display:inline-flex; align-items:center; gap:6px; background:rgba(37,99,235,0.1); border:1px solid rgba(37,99,235,0.2); color:var(--blue-glow); border-radius:100px; padding:5px 13px; font-size:12px; font-weight:600; }
  /* Sessions */
  .session-card { background:var(--surface2); border:1px solid var(--border); border-radius:14px; padding:18px 20px; transition:all .25s; }
  .session-card:hover { border-color:var(--border-h); }
  .session-card.live { border-color:rgba(52,211,153,0.35); background:rgba(52,211,153,0.04); }
  .live-badge { display:inline-flex; align-items:center; gap:5px; background:rgba(52,211,153,0.12); border:1px solid rgba(52,211,153,0.3); color:#34d399; border-radius:100px; padding:4px 12px; font-size:11px; font-weight:700; }
  .live-dot { width:7px; height:7px; border-radius:50%; background:#34d399; animation:livePulse 2s infinite; }
  @keyframes livePulse { 0%,100%{opacity:1;} 50%{opacity:.4;} }
  .btn-join-live { width:100%; background:rgba(52,211,153,0.15); color:#34d399; border:1px solid rgba(52,211,153,0.3); border-radius:10px; padding:12px; font-family:'Syne',sans-serif; font-weight:700; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .25s; margin-top:14px; }
  .btn-join-live:hover:not(:disabled) { background:rgba(52,211,153,0.25); box-shadow:0 8px 20px rgba(52,211,153,0.2); }
  .btn-join-waiting { width:100%; background:rgba(37,99,235,0.1); color:var(--blue-glow); border:1px solid rgba(37,99,235,0.25); border-radius:10px; padding:12px; font-family:'Syne',sans-serif; font-weight:600; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .25s; margin-top:14px; }
  .btn-join-waiting:hover { background:rgba(37,99,235,0.18); }
  /* Recordings */
  .recording-card { background:var(--surface2); border:1px solid var(--border); border-radius:14px; overflow:hidden; transition:all .25s; }
  .recording-card:hover { border-color:var(--border-h); transform:translateY(-3px); box-shadow:0 16px 40px rgba(37,99,235,0.12); }
  .recording-thumb { aspect-ratio:16/9; background:var(--surface3); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .2s; }
  .recording-card:hover .recording-thumb { background:rgba(37,99,235,0.08); }
  .btn-watch { width:100%; background:rgba(37,99,235,0.1); color:var(--blue-glow); border:1px solid rgba(37,99,235,0.2); border-radius:10px; padding:11px; font-family:'Syne',sans-serif; font-weight:600; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; transition:all .2s; }
  .btn-watch:hover { background:rgba(37,99,235,0.2); }
  /* Sidebar */
  .sidebar-panel { background:var(--surface); border:1px solid var(--border); border-radius:20px; overflow:hidden; margin-bottom:16px; }
  .btn-chat { width:100%; background:var(--blue); color:white; border:none; border-radius:12px; padding:14px; font-family:'Syne',sans-serif; font-weight:700; font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition:all .25s; }
  .btn-chat:hover { background:var(--blue-bright); box-shadow:0 8px 24px rgba(37,99,235,0.45); transform:translateY(-1px); }
  .material-row { display:flex; align-items:center; gap:10px; padding:11px 14px; background:var(--surface3); border:1px solid var(--border); border-radius:10px; transition:all .2s; text-decoration:none; }
  .material-row:hover { border-color:var(--border-h); }
  .empty-dashed { border:1px dashed rgba(37,99,235,0.2); border-radius:12px; padding:32px 20px; text-align:center; }
`;

interface EnrollmentWithSessions extends Enrollment {
    sessions?: LiveSession[];
    materials?: CourseMaterial[];
    recordings?: any[];
}

export function EnrollmentDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [enrollment, setEnrollment] = useState<EnrollmentWithSessions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [joiningSession, setJoiningSession] = useState<string | null>(null);

    useEffect(() => { if (id) fetchDetails(id); }, [id]);

    const fetchDetails = async (batchId: string) => {
        setLoading(true); setError(null);
        try {
            const enrollments = await enrollmentsApi.getMyEnrollments();
            const current = enrollments.find(e => e.batch_id === batchId);
            if (!current) { setError('Enrollment not found or unauthorized'); return; }
            const [sessions, materials, recordings] = await Promise.all([
                liveSessionsApi.getByBatch(batchId),
                materialsApi.getByCourse((current as any).course?.id || ''),
                recordingsApi.getByBatch(batchId),
            ]);
            setEnrollment({ ...current, sessions, materials, recordings });
        } catch (err: any) {
            setError(err.message || 'Failed to load details');
        } finally { setLoading(false); }
    };

    const handleJoinLive = async (sessionId: string) => {
        setJoiningSession(sessionId);
        try { await liveSessionsApi.join(sessionId); navigate(`/live-class/${sessionId}`); }
        catch { navigate(`/live-class/${sessionId}`); }
        finally { setJoiningSession(null); }
    };

    const formatDate = (d: string) => { try { return format(new Date(d), 'MMM dd, yyyy'); } catch { return d; } };
    const formatDateTime = (d: string) => {
        try { return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
        catch { return d; }
    };
    const isSessionLive = (t: string) => {
        const diff = (Date.now() - new Date(t).getTime()) / 60000;
        return diff >= -15 && diff <= 120;
    };

    if (loading) return (
        <div className="ed-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <style>{STYLES}</style><LoadingSpinner size="lg" />
        </div>
    );

    if (!enrollment) return (
        <div className="ed-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16, padding: 24 }}>
            <style>{STYLES}</style>
            <ErrorMessage message={error || 'No details found'} />
            <button onClick={() => navigate('/my-enrollments')} className="btn-chat" style={{ width: 'auto', padding: '12px 24px' }}>
                <ArrowLeft size={16} /> Back to Enrollments
            </button>
        </div>
    );

    const course = (enrollment as any).course;
    const upcomingSessions = (enrollment.sessions || []).filter(s => new Date(s.scheduled_time).getTime() > Date.now() - 1000 * 60 * 120);

    return (
        <div className="ed-root">
            <style>{STYLES}</style>

            {/* ── HERO ── */}
            <section className="grid-bg" style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
                <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', top: '-20%', right: '-10%', pointerEvents: 'none' }} />
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 52px', position: 'relative', zIndex: 1 }}>
                    <Link to="/my-enrollments" className="back-btn" style={{ marginBottom: 28, display: 'inline-flex' }}>
                        <ArrowLeft size={15} /> Back to My Enrollments
                    </Link>

                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'flex-start' }}>
                        {/* Thumbnail */}
                        <div style={{ width: 240, height: 135, borderRadius: 18, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', flexShrink: 0, position: 'relative', background: 'var(--surface3)' }}>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="grid-bg-sm">
                                <BookOpen size={40} color="rgba(96,165,250,0.15)" />
                            </div>
                            {course?.thumbnail_url && (
                                <img
                                    src={`${course.thumbnail_url.trim()}?t=${Date.now()}`}
                                    alt={enrollment.course_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'relative', zIndex: 1 }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                                />
                            )}
                        </div>

                        {/* Meta */}
                        <div>
                            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px,4vw,48px)', lineHeight: 1.2, marginBottom: 16 }}>
                                {enrollment.course_name}
                            </h1>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                <span className="active-badge"><CheckCircle size={11} /> Active Enrollment</span>
                                <span className="date-chip"><Calendar size={12} /> {formatDate(enrollment.batch_start_date || '')} – {formatDate(enrollment.batch_end_date || '')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── BODY ── */}
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 100px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'flex-start' }}>

                {/* Left column */}
                <div>
                    <ErrorMessage message={error} onDismiss={() => setError(null)} />

                    {/* Sessions */}
                    <div className="ed-panel">
                        <div className="ed-panel-header">
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Video size={17} color="var(--blue-glow)" />
                            </div>
                            <div>
                                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17, margin: 0 }}>Upcoming Sessions</h2>
                                <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{upcomingSessions.length} session{upcomingSessions.length !== 1 ? 's' : ''} scheduled</p>
                            </div>
                        </div>
                        <div className="ed-panel-body">
                            {upcomingSessions.length === 0 ? (
                                <div className="empty-dashed">
                                    <Video size={28} color="rgba(107,134,168,0.25)" style={{ margin: '0 auto 10px' }} />
                                    <p style={{ color: 'var(--muted)', fontSize: 14 }}>No sessions scheduled yet. Check back soon!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {upcomingSessions.map(session => {
                                        const live = isSessionLive(session.scheduled_time);
                                        return (
                                            <div key={session.id} className={`session-card${live ? ' live' : ''}`}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                                                    <div>
                                                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{session.topic}</h3>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
                                                            <Clock size={13} color="var(--blue-glow)" />
                                                            {formatDateTime(session.scheduled_time)}
                                                        </div>
                                                    </div>
                                                    {live && (
                                                        <span className="live-badge">
                                                            <span className="live-dot" /> LIVE NOW
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    className={live ? 'btn-join-live' : 'btn-join-waiting'}
                                                    onClick={() => handleJoinLive(session.id)}
                                                    disabled={joiningSession === session.id}
                                                >
                                                    {joiningSession === session.id ? <LoadingSpinner size="sm" /> : live ? <><Video size={15} /> Join Class Now</> : 'Join Waiting Room'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recordings */}
                    <div className="ed-panel">
                        <div className="ed-panel-header">
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Play size={17} color="var(--blue-glow)" />
                            </div>
                            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17, margin: 0 }}>Class Recordings</h2>
                        </div>
                        <div className="ed-panel-body">
                            {!enrollment.recordings?.length ? (
                                <div className="empty-dashed">
                                    <Play size={28} color="rgba(107,134,168,0.25)" style={{ margin: '0 auto 10px' }} />
                                    <p style={{ color: 'var(--muted)', fontSize: 14 }}>No recordings available yet.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                                    {enrollment.recordings.map(rec => (
                                        <div key={rec.id} className="recording-card">
                                            <div className="recording-thumb grid-bg-sm" onClick={() => window.open(rec.recording_url, '_blank')}>
                                                <Play size={36} color="rgba(96,165,250,0.3)" />
                                            </div>
                                            <div style={{ padding: '14px 16px' }}>
                                                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {rec.live_sessions?.title || 'Class Recording'}
                                                </div>
                                                <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 12 }}>{formatDate(rec.created_at)}</div>
                                                <button className="btn-watch" onClick={() => window.open(rec.recording_url, '_blank')}>
                                                    <Play size={13} /> Watch Recording
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ position: 'sticky', top: 24 }}>
                    {/* Quick Actions */}
                    <div className="sidebar-panel">
                        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
                            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, margin: 0 }}>Quick Actions</h3>
                        </div>
                        <div style={{ padding: '16px 18px' }}>
                            <Link to={`/community/${enrollment.batch_id}`} style={{ textDecoration: 'none' }}>
                                <button className="btn-chat">
                                    <MessageCircle size={18} /> Open Group Chat
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Materials */}
                    <div className="sidebar-panel">
                        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={15} color="var(--blue-glow)" />
                            </div>
                            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, margin: 0 }}>Materials</h3>
                        </div>
                        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {!enrollment.materials?.length ? (
                                <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No materials uploaded yet.</p>
                            ) : enrollment.materials.map(m => (
                                <a key={m.id} href={m.file_url} target="_blank" rel="noopener noreferrer" className="material-row">
                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FileText size={14} color="var(--blue-glow)" />
                                    </div>
                                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)', textDecoration: 'none' }}>{m.title}</span>
                                    <Download size={14} color="var(--muted)" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
