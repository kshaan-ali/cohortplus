import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi, batchesApi, liveSessionsApi, materialsApi } from '@/services/api';
import type { Course, Batch, CourseMaterial } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card, CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { ErrorMessage } from '@/components/ui-custom/ErrorMessage';
import { cn } from '@/lib/utils';
import {
  Calendar,
  BookOpen,
  Plus,
  CheckCircle,
  FileText,
  Trash2,
  Upload,
  Video,
  ChevronRight,
  Clock,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Layers,
  Monitor,
  X
} from 'lucide-react';

export function TutorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-dismiss success message
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setTimeout(() => setSuccess(null), 300); // Wait for fade out animation
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Session List State
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Form states
  const [courseForm, setCourseForm] = useState({ title: '', description: '', thumbnail: null as File | null });
  const [batchForm, setBatchForm] = useState({
    courseId: '',
    startDate: '',
    endDate: '',
    price: '',
    billingType: 'monthly'
  });
  const [sessionForm, setSessionForm] = useState({ batchId: '', topic: '', scheduledTime: '' });

  // Materials State
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [selectedCourseForMaterials, setSelectedCourseForMaterials] = useState('');
  const [materialForm, setMaterialForm] = useState({ title: '', file: null as File | null });

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch sessions when batch is selected
  useEffect(() => {
    if (sessionForm.batchId && sessionForm.batchId !== '_none') {
      fetchSessions(sessionForm.batchId);
    } else {
      setSessions([]);
    }
  }, [sessionForm.batchId]);

  const fetchSessions = async (batchId: string) => {
    setLoadingSessions(true);
    try {
      const data = await liveSessionsApi.getByBatch(batchId);
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchMaterials = async (courseId: string) => {
    setLoadingMaterials(true);
    try {
      const data = await materialsApi.getByCourse(courseId);
      setMaterials(data);
    } catch (error) {
      console.error('Failed to load materials', error);
      setError('Failed to load materials');
    } finally {
      setLoadingMaterials(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const coursesData = await coursesApi.getMyCourses();
      setCourses(coursesData);

      // Fetch all batches in parallel
      const batchesResults = await Promise.all(
        coursesData.map(async (course) => {
          const courseBatches = await batchesApi.getByCourse(course.id);
          return courseBatches.map((b) => ({ ...b, course_name: course.title }));
        })
      );

      const batchesForAll: Batch[] = batchesResults.flat();
      setAllBatches(batchesForAll);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchesForCourse = async (courseId: string) => {
    try {
      const batchesData = await batchesApi.getByCourse(courseId);
      setBatches(batchesData);
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await coursesApi.create({
        title: courseForm.title,
        description: courseForm.description,
        thumbnail: courseForm.thumbnail || undefined
      });
      setSuccess('Course created successfully!');
      setCourseForm({ title: '', description: '', thumbnail: null });
      fetchData(); // Refresh courses list
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await batchesApi.create({
        course_id: batchForm.courseId,
        start_date: batchForm.startDate,
        end_date: batchForm.endDate,
        price: Number(batchForm.price),
        billing_type: batchForm.billingType,
      });
      setSuccess('Batch created successfully!');
      setBatchForm({
        courseId: '',
        startDate: '',
        endDate: '',
        price: '',
        billingType: 'monthly'
      });
      fetchData(); // Refresh batches for all tabs
    } catch (err: any) {
      setError(err.message || 'Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await liveSessionsApi.create({
        batch_id: sessionForm.batchId,
        topic: sessionForm.topic,
        scheduled_time: sessionForm.scheduledTime,
      });
      setSuccess('Live session created successfully!');
      setSessionForm(prev => ({ ...prev, topic: '', scheduledTime: '' }));
      if (sessionForm.batchId) fetchSessions(sessionForm.batchId);
    } catch (err: any) {
      setError(err.message || 'Failed to create live session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.file || !selectedCourseForMaterials) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await materialsApi.upload(
        selectedCourseForMaterials,
        materialForm.title,
        materialForm.file
      );
      setSuccess('Material uploaded successfully!');
      setMaterialForm({ title: '', file: null });
      fetchMaterials(selectedCourseForMaterials);
    } catch (err: any) {
      setError(err.message || 'Failed to upload material');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    setSubmitting(true);
    try {
      await materialsApi.delete(id);
      setSuccess('Material deleted successfully!');
      if (selectedCourseForMaterials) fetchMaterials(selectedCourseForMaterials);
    } catch (err: any) {
      setError(err.message || 'Failed to delete material');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020408]">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse rounded-full" />
          <LoadingSpinner size="lg" className="text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-blue-500/30">
      {/* Decorative Background Grid & blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute top-[10%] left-[15%] w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Floating Notifications */}
      <div className="fixed top-24 right-8 z-[110] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
        <div className="pointer-events-auto">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>

        {success && (
          <div className={cn(
            "pointer-events-auto p-5 rounded-2xl bg-[#0a101f]/90 backdrop-blur-xl border border-blue-500/20 shadow-2xl flex items-center transform transition-all duration-500",
            showSuccess ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
          )}>
            <div className="bg-blue-500/20 p-2.5 rounded-xl mr-4 border border-blue-500/30">
              <CheckCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm text-white tracking-tight uppercase">Success</p>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{success}</p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-4 p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        )}
      </div>

      {/* Modern Header Section */}
      <header className="relative z-10 pt-20 pb-32 border-b border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-6 max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-widest">Tutor Intelligence Platform</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]" style={{ fontFamily: 'Syne, sans-serif' }}>
                Tutor <span className="bg-gradient-to-br from-blue-400 to-indigo-600 bg-clip-text text-transparent">Suite</span>
              </h1>
              <p className="text-slate-400 text-xl md:text-2xl font-medium max-w-2xl leading-relaxed">
                Elevate your instruction with our high-performance dashboard. Control courses, live sessions, and assets in one unified interface.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center space-x-3 text-blue-400 mb-2">
                  <Layers className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Active Inventory</span>
                </div>
                <div className="text-4xl font-black font-serif">{courses.length} <span className="text-sm font-medium text-slate-500 ml-1 italic">Courses</span></div>
              </div>
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center space-x-3 text-indigo-400 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Cohorts</span>
                </div>
                <div className="text-4xl font-black font-serif">{allBatches.length} <span className="text-sm font-medium text-slate-500 ml-1 italic">Live</span></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Custom Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-24 relative z-10">
        <Tabs defaultValue="courses" className="space-y-16">
          <div className="flex justify-center">
            <TabsList className="bg-[#0a101f]/80 backdrop-blur-2xl p-2 rounded-3xl border border-white/10 shadow-2xl h-auto flex flex-wrap md:flex-nowrap w-fit">
              {[
                { val: 'courses', lab: 'Courses', ico: BookOpen },
                { val: 'batches', lab: 'Batches', ico: Calendar },
                { val: 'sessions', lab: 'Sessions', ico: Video },
                { val: 'materials', lab: 'Materials', ico: FileText }
              ].map(tab => (
                <TabsTrigger
                  key={tab.val}
                  value={tab.val}
                  className="rounded-2xl px-8 py-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all duration-300 flex items-center space-x-3"
                >
                  <tab.ico className="h-5 w-5" />
                  <span className="font-black text-sm tracking-tight">{tab.lab}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Courses Tab */}
          <TabsContent value="courses" className="animate-in fade-in slide-in-from-bottom-4 duration-500 focus:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 space-y-8">
                <Card className="rounded-[2.5rem] border border-white/10 bg-[#0a101f]/40 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <CardHeader className="p-8">
                    <div className="bg-blue-600/20 w-fit p-3 rounded-2xl mb-4 border border-blue-500/30">
                      <Plus className="h-6 w-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Forge Course</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">Design a new educational masterpiece</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 space-y-8">
                    <form onSubmit={handleCreateCourse} className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Title</Label>
                        <Input
                          placeholder="e.g. System Design Mastery"
                          className="rounded-2xl py-7 bg-white/5 border-white/10 text-lg font-bold placeholder:text-slate-600 focus:bg-white/10 focus:border-blue-500/50 transition-all"
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Curriculum Details</Label>
                        <Textarea
                          placeholder="Explain the roadmap and outcomes..."
                          className="rounded-2xl py-5 bg-white/5 border-white/10 text-lg font-medium placeholder:text-slate-600 focus:bg-white/10 focus:border-blue-500/50 transition-all min-h-[160px] resize-none"
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Visual Branding</Label>
                        <label className="flex flex-col items-center justify-center h-40 w-full rounded-[2rem] border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer group">
                          <Upload className="h-8 w-8 text-slate-500 group-hover:text-blue-400 group-hover:scale-110 transition-all mb-3" />
                          <span className="text-sm font-bold text-slate-400">
                            {courseForm.thumbnail ? courseForm.thumbnail.name : 'Click to drop thumbnail'}
                          </span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.files?.[0] || null })} />
                        </label>
                      </div>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                      >
                        {submitting ? <LoadingSpinner size="md" /> : 'Launch Experience'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-8 flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-4xl font-black tracking-tighter" style={{ fontFamily: 'Syne, sans-serif' }}>Course Gallery</h2>
                  <div className="h-0.5 flex-1 bg-white/5 mx-6" />
                  <Badge className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                    {courses.length} Active
                  </Badge>
                </div>

                {courses.length === 0 ? (
                  <div className="flex-1 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/2 backdrop-blur-sm flex flex-col items-center justify-center py-32 text-center px-10">
                    <BookOpen className="h-16 w-16 text-slate-700 mb-6" />
                    <p className="text-xl font-bold text-slate-500">Your legacy begins here. Launch your first course.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {courses.map((course) => (
                      <Card key={course.id} className="rounded-[2.5rem] border border-white/10 bg-[#0a101f]/30 backdrop-blur-xl group hover:border-blue-500/30 transition-all duration-500 overflow-hidden flex flex-col">
                        <div className="h-56 relative overflow-hidden">
                          {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
                          ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                              <Monitor className="h-12 w-12 text-slate-700" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0a101f] to-transparent opacity-80" />
                          <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-blue-400 transition-colors uppercase">{course.title}</h3>
                          </div>
                        </div>
                        <CardHeader className="flex-1 p-8 pt-4">
                          <CardDescription className="text-slate-400 text-base leading-relaxed line-clamp-3 font-medium">
                            {course.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                          <Button variant="ghost" className="w-full h-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-blue-600 hover:text-white font-bold transition-all group/btn" asChild>
                            <Link to={`/courses/${course.id}`}>
                              Manage Course <ArrowRight className="ml-2 h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Batches Tab */}
          <TabsContent value="batches" className="animate-in fade-in slide-in-from-bottom-4 duration-500 focus:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 space-y-8">
                <Card className="rounded-[2.5rem] border border-white/10 bg-[#0a101f]/40 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <CardHeader className="p-8">
                    <div className="bg-blue-600/20 w-fit p-3 rounded-2xl mb-4 border border-blue-500/30">
                      <Calendar className="h-6 w-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>New Cohort</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">Schedule the next round of instruction</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 space-y-8">
                    <form onSubmit={handleCreateBatch} className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Select Base Course</Label>
                        <Select value={batchForm.courseId} onValueChange={(v) => { setBatchForm({ ...batchForm, courseId: v }); fetchBatchesForCourse(v); }} disabled={submitting}>
                          <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold focus:ring-offset-0 focus:ring-blue-500/50 transition-all">
                            <SelectValue placeholder="Choose course..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a101f] border-white/10 text-white rounded-2xl py-2">
                            {courses.map(c => <SelectItem key={c.id} value={c.id} className="py-3 font-semibold">{c.title}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">From</Label>
                          <Input type="date" className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold" value={batchForm.startDate} onChange={e => setBatchForm({ ...batchForm, startDate: e.target.value })} required disabled={submitting} />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">To</Label>
                          <Input type="date" className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold" value={batchForm.endDate} onChange={e => setBatchForm({ ...batchForm, endDate: e.target.value })} required disabled={submitting} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Investment ($)</Label>
                          <Input type="number" placeholder="499" className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold" value={batchForm.price} onChange={e => setBatchForm({ ...batchForm, price: e.target.value })} required disabled={submitting} />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Cycle</Label>
                          <Select value={batchForm.billingType} onValueChange={v => setBatchForm({ ...batchForm, billingType: v })} disabled={submitting}>
                            <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0a101f] border-white/10 rounded-2xl">
                              <SelectItem value="monthly" className="py-3">Monthly</SelectItem>
                              <SelectItem value="yearly" className="py-3">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button type="submit" disabled={submitting || !batchForm.courseId} className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                        {submitting ? <LoadingSpinner size="md" /> : 'Register Batch'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-8 space-y-10 flex flex-col">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-black tracking-tighter uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>Active Cohorts</h2>
                  <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Time-Gated Access</span>
                  </div>
                </div>

                {!batchForm.courseId ? (
                  <div className="flex-1 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/2 backdrop-blur-sm flex flex-col items-center justify-center py-24 text-center">
                    <Calendar className="h-12 w-12 text-slate-700 mb-4" />
                    <p className="text-slate-500 font-bold">Select a course to analyze its cohorts.</p>
                  </div>
                ) : batches.length === 0 ? (
                  <div className="flex-1 rounded-[3rem] bg-blue-900/10 border border-blue-500/10 flex items-center justify-center py-24">
                    <p className="text-blue-400 font-black tracking-tight">Stage ready. No batches yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {batches.map(batch => (
                      <div key={batch.id} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center space-x-8">
                          <div className="h-20 w-20 flex flex-col items-center justify-center bg-blue-600/10 rounded-3xl border border-blue-500/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Start</p>
                            <p className="text-xl font-black">{new Date(batch.start_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                          </div>
                          <div>
                            <h4 className="text-xl font-black mb-1 flex items-center">
                              {new Date(batch.start_date).getFullYear()} Edition <Badge className="ml-3 bg-blue-500/20 text-blue-400 border-none px-3 py-0.5 rounded-full text-[9px] font-black uppercase">{batch.billing_type}</Badge>
                            </h4>
                            <p className="text-slate-500 font-medium">Ends {new Date(batch.end_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="mt-6 md:mt-0 flex items-center space-x-12">
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cycle Rate</p>
                            <p className="text-3xl font-black">${batch.price}</p>
                          </div>
                          <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center"><ChevronRight className="h-6 w-6 text-blue-400" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="animate-in fade-in slide-in-from-bottom-4 duration-500 focus:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 space-y-8">
                <Card className="rounded-[2.5rem] border border-white/10 bg-[#0a101f]/40 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <CardHeader className="p-8">
                    <div className="bg-blue-600/20 w-fit p-3 rounded-2xl mb-4 border border-blue-500/30">
                      <Video className="h-6 w-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Go Live</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">Coordinate a real-time knowledge session</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 space-y-8">
                    <form onSubmit={handleCreateSession} className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Target Cohort</Label>
                        <Select value={sessionForm.batchId} onValueChange={v => setSessionForm({ ...sessionForm, batchId: v })} disabled={submitting}>
                          <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold">
                            <SelectValue placeholder="Select batch..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a101f] border-white/10 text-white rounded-2xl pb-2">
                            {allBatches.map(b => (
                              <SelectItem key={b.id} value={b.id} className="py-3 font-semibold">
                                <span className="text-blue-400 mr-2">{(b as any).course_name}</span> • {new Date(b.start_date).toLocaleDateString()}
                              </SelectItem>
                            ))}
                            {allBatches.length === 0 && <SelectItem value="_none" disabled>No active batches</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Session Headline</Label>
                        <Input placeholder="e.g. System Architecture Q&A" className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold" value={sessionForm.topic} onChange={e => setSessionForm({ ...sessionForm, topic: e.target.value })} required disabled={submitting} />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Broadcast Schedule</Label>
                        <Input type="datetime-local" className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold" value={sessionForm.scheduledTime} onChange={e => setSessionForm({ ...sessionForm, scheduledTime: e.target.value })} required disabled={submitting} />
                      </div>
                      <Button type="submit" disabled={submitting || !sessionForm.batchId} className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg active:scale-95 transition-all shadow-xl shadow-blue-600/20">
                        {submitting ? <LoadingSpinner size="md" /> : 'Start Broadcasting'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-8 space-y-10 flex flex-col">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-black tracking-tighter uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>Broadcast Timeline</h2>
                  <Badge className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">Upcoming Events</Badge>
                </div>

                {!sessionForm.batchId || sessionForm.batchId === '_none' ? (
                  <div className="flex-1 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/2 flex flex-col items-center justify-center py-24">
                    <Video className="h-12 w-12 text-slate-700 mb-4" />
                    <p className="text-slate-500 font-bold italic">Awaiting cohort selection for live stream sync.</p>
                  </div>
                ) : loadingSessions ? (
                  <div className="flex-1 flex items-center justify-center py-24"><LoadingSpinner size="lg" className="text-blue-500" /></div>
                ) : sessions.length === 0 ? (
                  <div className="flex-1 rounded-[3rem] bg-blue-950/10 border border-blue-500/10 p-24 text-center">
                    <p className="text-blue-400 font-bold text-lg">Timeline is clear. No scheduled broadcasts.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {sessions.map(session => (
                      <div key={session.id} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 group hover:border-blue-500/30 transition-all flex items-center justify-between">
                        <div className="flex items-center space-x-8">
                          <div className="h-20 w-20 flex flex-col items-center justify-center bg-blue-600/10 rounded-3xl border border-blue-500/20">
                            <Video className="h-8 w-8 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-black mb-2 tracking-tight line-clamp-1">{session.topic}</h4>
                            <div className="flex items-center space-x-4 opacity-70">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-blue-400" />
                                <span className="text-xs font-bold uppercase">{new Date(session.scheduled_time).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                              </div>
                              <div className="h-3 w-[1px] bg-white/10" />
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-blue-400" />
                                <span className="text-xs font-bold uppercase">{new Date(session.scheduled_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" className="h-16 px-8 rounded-2xl bg-white/5 hover:bg-blue-600 hover:text-white font-black group transition-all" asChild>
                          <Link to={`/live-class/${session.id}`} target="_blank">
                            Join Now <ExternalLink className="ml-3 h-5 w-5" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="animate-in fade-in slide-in-from-bottom-4 duration-500 focus:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 space-y-8">
                <Card className="rounded-[2.5rem] border border-white/10 bg-[#0a101f]/40 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <CardHeader className="p-8">
                    <div className="bg-blue-600/20 w-fit p-3 rounded-2xl mb-4 border border-blue-500/30">
                      <Upload className="h-6 w-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Asset Drop</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">Distribute course material to students</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 space-y-8">
                    <form onSubmit={handleUploadMaterial} className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Destination Course</Label>
                        <Select value={selectedCourseForMaterials} onValueChange={v => { setSelectedCourseForMaterials(v); fetchMaterials(v); }} disabled={submitting}>
                          <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold">
                            <SelectValue placeholder="Choose target..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a101f] border-white/10 text-white rounded-2xl py-2">
                            {courses.map(c => <SelectItem key={c.id} value={c.id} className="py-3 font-semibold">{c.title}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">Material Label</Label>
                        <Input placeholder="e.g. Lecture Notes on K8s" className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold" value={materialForm.title} onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })} required disabled={submitting} />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 ml-1">File Upload</Label>
                        <label className="flex flex-col items-center justify-center h-36 w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-all p-4">
                          <FileText className="h-7 w-7 text-slate-500 mb-2" />
                          <p className="text-xs font-bold text-slate-400 text-center truncate w-full">
                            {materialForm.file ? materialForm.file.name : 'PDF, PPT, or Images'}
                          </p>
                          <input type="file" className="hidden" onChange={e => setMaterialForm({ ...materialForm, file: e.target.files?.[0] || null })} />
                        </label>
                      </div>
                      <Button type="submit" disabled={submitting || !selectedCourseForMaterials || !materialForm.file} className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg active:scale-95 transition-all shadow-xl shadow-blue-600/20">
                        {submitting ? <LoadingSpinner size="md" /> : 'Deploy Material'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-8 space-y-10 flex flex-col">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-black tracking-tighter uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>Cloud Repository</h2>
                  <Badge className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">Versioned Assets</Badge>
                </div>

                {!selectedCourseForMaterials ? (
                  <div className="flex-1 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/2 flex flex-col items-center justify-center py-24">
                    <FileText className="h-12 w-12 text-slate-700 mb-4" />
                    <p className="text-slate-500 font-bold italic">Select curriculum to unlock resource cloud.</p>
                  </div>
                ) : loadingMaterials ? (
                  <div className="flex-1 flex items-center justify-center py-24"><LoadingSpinner size="lg" className="text-blue-500" /></div>
                ) : materials.length === 0 ? (
                  <div className="flex-1 rounded-[3rem] bg-blue-950/10 border border-blue-500/10 p-24 text-center">
                    <p className="text-blue-400 font-black tracking-tight text-xl uppercase italic">No assets deployed.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {materials.map(material => (
                      <div key={material.id} className="p-6 rounded-3xl bg-white/5 border border-white/10 group hover:border-blue-500/30 transition-all flex flex-col">
                        <div className="flex items-start justify-between mb-6">
                          <div className="h-14 w-14 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                            <FileText className="h-6 w-6 text-blue-400" />
                          </div>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl" onClick={() => handleDeleteMaterial(material.id)}>
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        <h5 className="text-lg font-black tracking-tight mb-2 line-clamp-2 truncate">{material.title}</h5>
                        <div className="flex items-center space-x-3 mb-6">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">{material.file_type}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{(material.file_size! / 1024 / 1024).toFixed(1)} MB</span>
                        </div>
                        <Button className="w-full h-12 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white border border-white/5 flex items-center justify-center font-bold group/btn" asChild>
                          <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                            View Asset <ExternalLink className="ml-2 h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
