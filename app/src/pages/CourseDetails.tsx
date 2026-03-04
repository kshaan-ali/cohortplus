import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { coursesApi, batchesApi, enrollmentsApi, materialsApi, liveSessionsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Course, Batch, CourseMaterial } from '@/types';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { ErrorMessage } from '@/components/ui-custom/ErrorMessage';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookOpen, User, Calendar, ArrowLeft, GraduationCap, CheckCircle, AlertCircle,
  Video, FileText, Download, Lock, DollarSign,
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
  .cd-root { font-family:'DM Sans',sans-serif; background:var(--black); color:var(--text); min-height:100vh; }
  .grid-bg { background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px); background-size:60px 60px; }
  .grid-bg-sm { background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px); background-size:30px 30px; }
  @keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
  .shimmer-text { background:linear-gradient(90deg,var(--blue-bright) 0%,var(--blue-glow) 50%,var(--blue-bright) 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 3s linear infinite; }
  .cd-panel { background:var(--surface); border:1px solid var(--border); border-radius:20px; overflow:hidden; }
  .cd-panel:hover { border-color:var(--border-h); }
  .cd-panel-header { padding:22px 24px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:12px; }
  .cd-panel-body { padding:24px; }
  .back-btn { display:inline-flex; align-items:center; gap:8px; color:var(--muted); font-size:14px; font-weight:600; text-decoration:none; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:10px; padding:8px 14px; transition:all .2s; }
  .back-btn:hover { color:var(--text); border-color:var(--border-h); background:rgba(37,99,235,0.08); }
  .tutor-chip { display:inline-flex; align-items:center; gap:7px; background:rgba(37,99,235,0.1); border:1px solid rgba(37,99,235,0.25); color:var(--blue-glow); border-radius:100px; padding:6px 16px; font-size:13px; font-weight:600; }
  .batch-card { background:var(--surface2); border:1px solid var(--border); border-radius:14px; padding:18px; transition:all .25s; }
  .batch-card:hover { border-color:var(--border-h); }
  .batch-card.enrolled { border-color:rgba(52,211,153,0.3); background:rgba(52,211,153,0.04); }
  .btn-enroll { width:100%; background:var(--blue); color:white; border:none; border-radius:10px; padding:13px; font-family:'Syne',sans-serif; font-weight:700; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .25s; }
  .btn-enroll:hover:not(:disabled) { background:var(--blue-bright); box-shadow:0 8px 24px rgba(37,99,235,0.4); transform:translateY(-1px); }
  .btn-enroll:disabled { opacity:.5; cursor:not-allowed; }
  .btn-outline-sm { background:rgba(37,99,235,0.08); color:var(--blue-glow); border:1px solid rgba(37,99,235,0.25); border-radius:10px; padding:13px; font-family:'Syne',sans-serif; font-weight:600; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; width:100%; transition:all .25s; }
  .btn-outline-sm:hover { background:rgba(37,99,235,0.18); }
  .material-row { display:flex; align-items:center; gap:12px; padding:12px 14px; background:var(--surface3); border:1px solid var(--border); border-radius:12px; transition:all .2s; }
  .material-row:hover { border-color:var(--border-h); }
  .price-badge { display:flex; align-items:center; justify-content:space-between; background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.2); border-radius:10px; padding:10px 14px; margin:12px 0; }
  .enrolled-badge { display:inline-flex; align-items:center; gap:5px; background:rgba(52,211,153,0.1); border:1px solid rgba(52,211,153,0.25); color:#34d399; border-radius:100px; padding:4px 12px; font-size:11px; font-weight:700; }
  .success-bar { display:flex; align-items:center; gap:10px; background:rgba(52,211,153,0.08); border:1px solid rgba(52,211,153,0.2); color:#34d399; border-radius:12px; padding:14px 18px; margin-bottom:24px; font-weight:600; font-size:14px; }
  .line-h { height:1px; background:linear-gradient(90deg,transparent,var(--border-h),transparent); margin:28px 0; }
  .dialog-dark { background:var(--surface) !important; border:1px solid var(--border) !important; color:var(--text) !important; }
`;

export function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent, user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);
  const [enrolledBatchIds, setEnrolledBatchIds] = useState<Set<string>>(new Set());
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [enrollDialogBatch, setEnrollDialogBatch] = useState<Batch | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (id) fetchCourseDetails(id);
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && isStudent) {
      enrollmentsApi.getMyEnrollments().then((e) => {
        setEnrolledBatchIds(new Set(e.map((e) => e.batch_id)));
      }).catch(() => { });
    }
  }, [isAuthenticated, isStudent]);

  const fetchCourseDetails = async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [courseData, batchesData] = await Promise.all([
        coursesApi.getById(courseId),
        batchesApi.getByCourse(courseId),
      ]);
      if (!courseData) { setError('Course not found'); return; }
      setCourse(courseData);
      setBatches(batchesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load course details.');
    } finally {
      setLoading(false);
    }
    fetchMaterials(courseId);
  };

  const fetchMaterials = async (courseId: string) => {
    setLoadingMaterials(true);
    try { setMaterials(await materialsApi.getByCourse(courseId)); }
    catch { /* silent */ }
    finally { setLoadingMaterials(false); }
  };

  const handleStartInstantSession = async () => {
    if (!selectedBatchId) return;
    setIsStartingSession(true);
    try {
      const newSession = await liveSessionsApi.create({
        batch_id: selectedBatchId,
        topic: `Instant Session - ${course?.title}`,
        scheduled_time: new Date().toISOString(),
        description: `Instant live session started for ${selectedBatchId}`,
      });
      navigate(`/live-class/${newSession.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start instant session');
      setIsStartingSession(false);
    }
  };

  const openEnrollDialog = (batch: Batch) => {
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: `/courses/${id}` } } }); return; }
    setEnrollDialogBatch(batch);
    setEnrollDialogOpen(true);
  };

  const handleConfirmEnroll = async () => {
    if (!enrollDialogBatch) return;
    const batchId = enrollDialogBatch.id;
    setEnrolling(batchId); setEnrollSuccess(null); setError(null);
    try {
      await enrollmentsApi.enroll(batchId);
      setEnrollSuccess(batchId);
      setEnrolledBatchIds((prev) => new Set(prev).add(batchId));
      setEnrollDialogOpen(false); setEnrollDialogBatch(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to enroll.');
      setEnrollDialogOpen(false); setEnrollDialogBatch(null);
    } finally { setEnrolling(null); }
  };

  const formatDate = (d: string) => { try { return format(new Date(d), 'MMM dd, yyyy'); } catch { return d; } };

  if (loading) return (
    <div className="cd-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <style>{STYLES}</style><LoadingSpinner size="lg" />
    </div>
  );

  if (!course) return (
    <div className="cd-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 20 }}>
      <style>{STYLES}</style>
      <p style={{ color: 'var(--muted)' }}>Course not found.</p>
      <button className="btn-enroll" style={{ width: 'auto', padding: '12px 24px' }} onClick={() => navigate('/courses')}>Back to Courses</button>
    </div>
  );

  return (
    <div className="cd-root">
      <style>{STYLES}</style>

      {/* ── HERO ── */}
      <section className="grid-bg" style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', top: '-20%', right: '-10%', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 52px', position: 'relative', zIndex: 1 }}>
          <Link to="/courses" className="back-btn" style={{ display: 'inline-flex', marginBottom: 32 }}>
            <ArrowLeft size={15} /> Back to Courses
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 36, alignItems: 'flex-start' }}>
            {/* Thumbnail */}
            <div style={{ width: 260, height: 146, borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', flexShrink: 0, position: 'relative', background: 'var(--surface3)' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="grid-bg-sm">
                <BookOpen size={48} color="rgba(96,165,250,0.15)" />
              </div>
              {course.thumbnail_url && (
                <img
                  src={`${course.thumbnail_url.trim()}?t=${Date.now()}`}
                  alt={course.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'relative', zIndex: 1 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                />
              )}
            </div>

            {/* Meta */}
            <div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,52px)', lineHeight: 1.15, marginBottom: 16 }}>
                {course.title}
              </h1>
              <div className="tutor-chip" style={{ marginBottom: 20 }}>
                <User size={13} />
                {course.tutor_name || 'Expert Tutor'}
              </div>

              {/* Tutor actions */}
              {user?.id === course.tutor_id && (
                <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="btn-enroll" style={{ width: 'auto', padding: '12px 22px' }}>
                        <Video size={16} /> Start Instant Session
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Start Instant Live Session</DialogTitle>
                        <DialogDescription>Select the batch you want to start a live session for.</DialogDescription>
                      </DialogHeader>
                      <div style={{ padding: '12px 0' }}>
                        {batches.length === 0 ? (
                          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No batches available.</p>
                        ) : batches.map((batch) => (
                          <div
                            key={batch.id}
                            onClick={() => setSelectedBatchId(batch.id)}
                            style={{ padding: 12, borderRadius: 10, border: `1px solid ${selectedBatchId === batch.id ? 'var(--blue)' : 'var(--border)'}`, background: selectedBatchId === batch.id ? 'rgba(37,99,235,0.1)' : 'transparent', cursor: 'pointer', marginBottom: 8, transition: 'all .2s' }}
                          >
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Batch ({formatDate(batch.start_date)} – {formatDate(batch.end_date)})</div>
                          </div>
                        ))}
                      </div>
                      <DialogFooter>
                        <button className="btn-outline-sm" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => setIsDialogOpen(false)}>Cancel</button>
                        <button className="btn-enroll" style={{ width: 'auto', padding: '10px 20px' }} onClick={handleStartInstantSession} disabled={!selectedBatchId || isStartingSession || batches.length === 0}>
                          {isStartingSession ? <LoadingSpinner size="sm" /> : 'Start Session Now'}
                        </button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Link to="/tutor-dashboard">
                    <button className="btn-outline-sm" style={{ width: 'auto', padding: '12px 22px' }}>Manage Sessions</button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 100px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'flex-start' }}>

        {/* Left column */}
        <div>
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
          {enrollSuccess && (
            <div className="success-bar"><CheckCircle size={18} /> Successfully enrolled! You can view it in My Enrollments.</div>
          )}

          {/* About */}
          <div className="cd-panel" style={{ marginBottom: 24 }}>
            <div className="cd-panel-header">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={17} color="var(--blue-glow)" />
              </div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, margin: 0 }}>About this Course</h2>
            </div>
            <div className="cd-panel-body grid-bg-sm">
              <p style={{ color: 'var(--muted)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: 15 }}>{course.description}</p>
            </div>
          </div>

          {/* Materials */}
          <div className="cd-panel">
            <div className="cd-panel-header">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={17} color="var(--blue-glow)" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, margin: 0 }}>Course Materials</h2>
                <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>Downloadable resources for this course</p>
              </div>
            </div>
            <div className="cd-panel-body">
              {loadingMaterials ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><LoadingSpinner size="md" /></div>
              ) : materials.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', border: '1px dashed rgba(37,99,235,0.2)', borderRadius: 14 }}>
                  <FileText size={32} color="rgba(107,134,168,0.25)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>No materials available yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {materials.map((m) => (
                    <div key={m.id} className="material-row">
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={16} color="var(--blue-glow)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
                        <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>
                          {m.file_type?.toUpperCase()} {m.file_size ? `· ${(m.file_size / 1024 / 1024).toFixed(1)} MB` : ''}
                        </div>
                      </div>
                      <a href={m.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue-glow)', display: 'flex', alignItems: 'center', padding: 6, borderRadius: 8, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', transition: 'all .2s', flexShrink: 0, textDecoration: 'none' }}>
                        <Download size={15} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Batches sidebar */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div className="cd-panel">
            <div className="cd-panel-header">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={17} color="var(--blue-glow)" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, margin: 0 }}>Available Batches</h2>
                <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>Select a batch to enroll</p>
              </div>
            </div>
            <div className="cd-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {batches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                  <AlertCircle size={28} color="var(--muted)" style={{ margin: '0 auto 10px' }} />
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>No batches available</p>
                </div>
              ) : batches.map((batch) => {
                const alreadyEnrolled = enrolledBatchIds.has(batch.id) || enrollSuccess === batch.id;
                return (
                  <div key={batch.id} className={`batch-card${alreadyEnrolled ? ' enrolled' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Batch</span>
                      {alreadyEnrolled && <span className="enrolled-badge"><CheckCircle size={10} /> Enrolled</span>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
                        <Calendar size={13} color="var(--blue-glow)" />
                        Start: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{formatDate(batch.start_date)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
                        <Calendar size={13} color="var(--blue-glow)" />
                        End: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{formatDate(batch.end_date)}</span>
                      </div>
                    </div>

                    <div className="price-badge">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <DollarSign size={15} color="var(--blue-glow)" />
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--blue-glow)' }}>{batch.price ?? 0}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>{batch.billing_type || 'one-time'}</span>
                    </div>

                    {isStudent && alreadyEnrolled && (
                      <button className="btn-enroll" disabled>
                        <Lock size={14} /> Already Enrolled
                      </button>
                    )}
                    {isStudent && !alreadyEnrolled && (
                      <button className="btn-enroll" onClick={() => openEnrollDialog(batch)} disabled={enrolling === batch.id}>
                        {enrolling === batch.id ? <LoadingSpinner size="sm" /> : 'Enroll Now'}
                      </button>
                    )}
                    {!isAuthenticated && (
                      <button className="btn-enroll" onClick={() => navigate('/login', { state: { from: { pathname: `/courses/${id}` } } })}>
                        Login to Enroll
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Enroll Confirm Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Enrollment</DialogTitle>
            <DialogDescription>Review the batch details and price before enrolling.</DialogDescription>
          </DialogHeader>
          {enrollDialogBatch && (
            <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--muted)' }}>
                  <Calendar size={14} color="var(--blue-glow)" /> Start: {formatDate(enrollDialogBatch.start_date)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--muted)' }}>
                  <Calendar size={14} color="var(--blue-glow)" /> End: {formatDate(enrollDialogBatch.end_date)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 12, padding: 16 }}>
                <span style={{ color: 'var(--muted)', fontSize: 14 }}>Total Price</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <DollarSign size={16} color="var(--blue-glow)" />
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--blue-glow)' }}>{enrollDialogBatch.price ?? 0}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 4 }}>/ {enrollDialogBatch.billing_type || 'one-time'}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter style={{ gap: 10 }}>
            <button className="btn-outline-sm" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => setEnrollDialogOpen(false)}>Cancel</button>
            <button className="btn-enroll" style={{ width: 'auto', padding: '10px 28px' }} onClick={handleConfirmEnroll} disabled={enrolling !== null}>
              {enrolling ? <LoadingSpinner size="sm" /> : 'Confirm Enrollment'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
