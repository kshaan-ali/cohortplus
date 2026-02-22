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
  LayoutDashboard,
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
  DollarSign
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
      const batchesForAll: Batch[] = [];
      for (const course of coursesData) {
        const courseBatches = await batchesApi.getByCourse(course.id);
        batchesForAll.push(...courseBatches.map((b) => ({ ...b, course_name: course.title })));
      }
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Floating Notifications */}
      <div className="fixed top-8 right-8 z-[100] flex flex-col gap-4 max-w-md w-full pointer-events-none">
        <div className="pointer-events-auto">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>

        {success && (
          <div className={cn(
            "pointer-events-auto p-6 rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-green-100 flex items-center transform transition-all duration-500",
            showSuccess ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
          )}>
            <div className="bg-green-100 p-3 rounded-2xl mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Action Successful</p>
              <p className="text-slate-500">{success}</p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-auto p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Plus className="h-5 w-5 text-slate-400 rotate-45" />
            </button>
          </div>
        )}
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-200/50 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-violet-200/50 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[5%] left-[20%] w-[25%] h-[25%] bg-blue-200/50 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 shadow-2xl">
                <LayoutDashboard className="h-16 w-16 text-white" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
                Tutor <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-indigo-200">Suite</span>
              </h1>
              <p className="text-indigo-100 mt-6 text-xl md:text-2xl font-medium max-w-2xl opacity-90 leading-relaxed">
                Empowering your educational excellence. Manage courses, batches, and live sessions with precision.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <Tabs defaultValue="courses" className="space-y-12">
          <div className="flex justify-center -mt-20 relative z-20">
            <TabsList className="bg-white/80 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/50 shadow-2xl h-auto grid grid-cols-2 md:grid-cols-4 w-full max-w-3xl">
              <TabsTrigger
                value="courses"
                className="rounded-[1.50rem] py-4 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300"
              >
                <BookOpen className="h-5 w-5 mr-3" />
                <span className="font-bold">Courses</span>
              </TabsTrigger>
              <TabsTrigger
                value="batches"
                className="rounded-[1.50rem] py-4 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300"
              >
                <Calendar className="h-5 w-5 mr-3" />
                <span className="font-bold">Batches</span>
              </TabsTrigger>
              <TabsTrigger
                value="sessions"
                className="rounded-[1.50rem] py-4 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300"
              >
                <Video className="h-5 w-5 mr-3" />
                <span className="font-bold">Sessions</span>
              </TabsTrigger>
              <TabsTrigger
                value="materials"
                className="rounded-[1.50rem] py-4 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300"
              >
                <FileText className="h-5 w-5 mr-3" />
                <span className="font-bold">Materials</span>
              </TabsTrigger>
            </TabsList>
          </div>


          <TabsContent value="courses">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Create Course Card */}
              <div className="lg:col-span-4 space-y-8">
                <Card className="rounded-[2.5rem] border-0 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 w-full" />
                  <CardHeader className="pb-4">
                    <CardTitle className="text-3xl font-extrabold flex items-center">
                      <Plus className="h-8 w-8 mr-3 text-indigo-600" />
                      Add New
                    </CardTitle>
                    <CardDescription className="text-lg">Design your next blockbuster course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateCourse} className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="courseTitle" className="text-lg font-bold">Course Title</Label>
                        <Input
                          id="courseTitle"
                          placeholder="e.g., Ultimate React Masterclass"
                          className="rounded-2xl py-6 text-lg border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 ring-indigo-100"
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="courseDescription" className="text-lg font-bold">Concept Description</Label>
                        <Textarea
                          id="courseDescription"
                          placeholder="What makes this course legendary?"
                          className="rounded-2xl py-4 text-lg border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 ring-indigo-100 resizable-none"
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                          required
                          disabled={submitting}
                          rows={6}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="courseThumbnail" className="text-lg font-bold">Course Thumbnail</Label>
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-200 rounded-[2rem] cursor-pointer bg-indigo-50/30 hover:bg-indigo-50/80 transition-all">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-3 text-indigo-500" />
                              <p className="mb-2 text-sm text-indigo-600 font-bold px-4 text-center">
                                {courseForm.thumbnail ? courseForm.thumbnail.name : 'Click to select thumbnail'}
                              </p>
                            </div>
                            <input
                              id="courseThumbnail"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.files?.[0] || null })}
                            />
                          </label>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-8 text-xl font-black rounded-3xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                      >
                        {submitting ? (
                          <LoadingSpinner size="md" />
                        ) : (
                          <>
                            <Plus className="h-6 w-6 mr-2" />
                            Launch Course
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Course Grid */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center">
                    <BookOpen className="h-10 w-10 mr-4 text-indigo-600" />
                    Course Gallery
                  </h2>
                  <div className="px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <span className="text-indigo-700 font-bold">{courses.length} Active Courses</span>
                  </div>
                </div>

                {courses.length === 0 ? (
                  <Card className="rounded-[3rem] border-dashed border-2 border-slate-200 bg-slate-50/50 py-32 flex flex-col items-center justify-center">
                    <BookOpen className="h-24 w-24 text-slate-300 mb-6" />
                    <h3 className="text-3xl font-bold text-slate-600 mb-2">Build Your Knowledge Base</h3>
                    <p className="text-slate-500 text-lg">Your courses will appear here in high definition.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {courses.map((course) => (
                      <Card
                        key={course.id}
                        className="rounded-[2.5rem] border-0 bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 overflow-hidden group"
                      >
                        <div className="h-48 bg-gradient-to-br from-slate-100 to-indigo-50 relative overflow-hidden">
                          {course.thumbnail_url ? (
                            <img
                              src={`${course.thumbnail_url.trim()}?t=${Date.now()}`}
                              alt={course.title}
                              crossOrigin="anonymous"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <>
                              <div className="absolute top-6 left-6 p-4 bg-white rounded-2xl shadow-lg border border-indigo-50 z-20 group-hover:scale-110 transition-transform duration-500">
                                <BookOpen className="h-8 w-8 text-indigo-600" />
                              </div>
                              <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-500 z-10" />
                            </>
                          )}
                        </div>
                        <CardHeader className="pt-8">
                          <CardTitle className="text-2xl font-black text-slate-800 leading-tight group-hover:text-indigo-700 transition-colors">
                            {course.title}
                          </CardTitle>
                          <CardDescription className="text-lg mt-3 line-clamp-3 leading-relaxed">
                            {course.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 pb-8 px-8 mt-auto">
                          <Button
                            variant="secondary"
                            className="w-full py-7 text-lg font-bold rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all duration-300 flex items-center justify-center group/btn"
                            asChild
                          >
                            <Link to={`/courses/${course.id}`}>
                              View Full Details
                              <Plus className="ml-2 h-5 w-5 transform group-hover/btn:rotate-90 transition-transform" />
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

          <TabsContent value="batches">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Create Batch Form */}
              <div className="lg:col-span-4 space-y-8">
                <Card className="rounded-[2.5rem] border-0 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 w-full" />
                  <CardHeader>
                    <CardTitle className="text-3xl font-extrabold flex items-center text-slate-800">
                      <Calendar className="h-8 w-8 mr-3 text-cyan-600" />
                      New Batch
                    </CardTitle>
                    <CardDescription className="text-lg">Open the doors for a new cohort</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateBatch} className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="courseSelect" className="text-lg font-bold text-slate-700">Select Parent Course</Label>
                        <Select
                          value={batchForm.courseId}
                          onValueChange={(value) => {
                            setBatchForm({ ...batchForm, courseId: value });
                            fetchBatchesForCourse(value);
                          }}
                          disabled={submitting}
                        >
                          <SelectTrigger className="rounded-2xl py-6 text-lg border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 ring-cyan-100 transition-all">
                            <SelectValue placeholder="Choose a course" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl border-indigo-50">
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id} className="text-lg py-3">
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="startDate" className="text-lg font-bold text-slate-700">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            className="rounded-2xl py-6 text-lg border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 ring-cyan-100"
                            value={batchForm.startDate}
                            onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                            required
                            disabled={submitting}
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="endDate" className="text-lg font-bold text-slate-700">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            className="rounded-2xl py-6 text-lg border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 ring-cyan-100"
                            value={batchForm.endDate}
                            onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                            required
                            disabled={submitting}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="price" className="text-lg font-bold text-slate-700 text-slate-700">Pricing ($)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                            <Input
                              id="price"
                              type="number"
                              min="0"
                              placeholder="0.00"
                              className="rounded-2xl py-6 pl-12 text-lg border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 ring-cyan-100"
                              value={batchForm.price}
                              onChange={(e) => setBatchForm({ ...batchForm, price: e.target.value })}
                              required
                              disabled={submitting}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="billingType" className="text-lg font-bold text-slate-700">Cycle</Label>
                          <Select
                            value={batchForm.billingType}
                            onValueChange={(value) => setBatchForm({ ...batchForm, billingType: value })}
                            disabled={submitting}
                          >
                            <SelectTrigger className="rounded-2xl py-6 text-lg border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 ring-cyan-100 transition-all">
                              <SelectValue placeholder="Cycle" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-indigo-50">
                              <SelectItem value="monthly" className="text-lg py-3">Monthly</SelectItem>
                              <SelectItem value="yearly" className="text-lg py-3">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting || !batchForm.courseId}
                        className="w-full py-8 text-xl font-black rounded-3xl bg-cyan-600 hover:bg-cyan-700 shadow-xl shadow-cyan-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                      >
                        {submitting ? (
                          <LoadingSpinner size="md" />
                        ) : (
                          <>
                            <Calendar className="h-6 w-6 mr-2" />
                            Register Batch
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Batches List */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center">
                    <Calendar className="h-10 w-10 mr-4 text-cyan-600" />
                    Cohort Overview
                  </h2>
                  <div className="px-4 py-2 bg-cyan-50 rounded-2xl border border-cyan-100">
                    <span className="text-cyan-700 font-bold">Active Cohorts</span>
                  </div>
                </div>

                {!batchForm.courseId ? (
                  <Card className="rounded-[3rem] border-dashed border-2 border-slate-200 bg-slate-50/50 py-32 flex flex-col items-center justify-center">
                    <Calendar className="h-24 w-24 text-slate-300 mb-6" />
                    <h3 className="text-3xl font-bold text-slate-600 mb-2">Select a Course</h3>
                    <p className="text-slate-500 text-lg">Pick a course from the left to view its dynamic cohorts.</p>
                  </Card>
                ) : batches.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-slate-100">
                    <Calendar className="h-20 w-20 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 text-xl font-medium">No batches found for this course yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {batches.map((batch) => (
                      <Card
                        key={batch.id}
                        className="rounded-[2rem] border-0 bg-white shadow-[0_12px_24px_-8px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all p-8 flex flex-col md:flex-row items-center justify-between group"
                      >
                        <div className="flex items-center space-x-6 w-full md:w-auto">
                          <div className="bg-cyan-50 p-6 rounded-3xl group-hover:bg-cyan-100 transition-colors">
                            <Clock className="h-8 w-8 text-cyan-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-2xl font-black text-slate-800">
                                {new Date(batch.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                              </span>
                              <ChevronRight className="h-6 w-6 text-slate-300" />
                              <span className="text-2xl font-black text-slate-800">
                                {new Date(batch.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Badge className="bg-slate-100 text-slate-600 rounded-lg px-4 py-1 text-sm font-bold border-0">
                                {batch.billing_type.toUpperCase()}
                              </Badge>
                              <span className="text-xl font-bold text-indigo-600">${batch.price}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" className="rounded-2xl p-6 hover:bg-slate-50 group-hover:translate-x-2 transition-transform hidden md:flex">
                          <ChevronRight className="h-8 w-8 text-slate-300" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Create Session Card */}
              <div className="lg:col-span-4 space-y-8">
                <Card className="rounded-[2.5rem] border-0 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 w-full" />
                  <CardHeader>
                    <CardTitle className="text-3xl font-extrabold flex items-center text-slate-800">
                      <Video className="h-8 w-8 mr-3 text-violet-600" />
                      Live Set
                    </CardTitle>
                    <CardDescription className="text-lg">Go live with your students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateSession} className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="batchSelect" className="text-lg font-bold text-slate-700">Select Cohort</Label>
                        <Select
                          value={sessionForm.batchId}
                          onValueChange={(value) => setSessionForm({ ...sessionForm, batchId: value })}
                          disabled={submitting}
                        >
                          <SelectTrigger className="rounded-2xl py-6 text-lg border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 ring-violet-100 transition-all">
                            <SelectValue placeholder="Choose a batch" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl border-violet-50">
                            {allBatches.map((batch) => (
                              <SelectItem key={batch.id} value={batch.id} className="text-lg py-3">
                                {(batch as Batch & { course_name?: string }).course_name || 'Course'} - {new Date(batch.start_date).toLocaleDateString()}
                              </SelectItem>
                            ))}
                            {allBatches.length === 0 && (
                              <SelectItem value="_none" disabled>
                                No batches yet
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="sessionTopic" className="text-lg font-bold text-slate-700">Session Spotlight</Label>
                        <Input
                          id="sessionTopic"
                          placeholder="e.g., Mastering the Virtual DOM"
                          className="rounded-2xl py-6 text-lg border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 ring-violet-100"
                          value={sessionForm.topic}
                          onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                          required
                          disabled={submitting}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="scheduledTime" className="text-lg font-bold text-slate-700">Broadcast Time</Label>
                        <Input
                          id="scheduledTime"
                          type="datetime-local"
                          className="rounded-2xl py-6 text-lg border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 ring-violet-100"
                          value={sessionForm.scheduledTime}
                          onChange={(e) => setSessionForm({ ...sessionForm, scheduledTime: e.target.value })}
                          required
                          disabled={submitting}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting || !sessionForm.batchId}
                        className="w-full py-8 text-xl font-black rounded-3xl bg-violet-600 hover:bg-violet-700 shadow-xl shadow-violet-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                      >
                        {submitting ? (
                          <LoadingSpinner size="md" />
                        ) : (
                          <>
                            <Video className="h-6 w-6 mr-2" />
                            Broadcasting Now
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Sessions List */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center">
                    <Video className="h-10 w-10 mr-4 text-violet-600" />
                    Session Timeline
                  </h2>
                  <div className="px-4 py-2 bg-violet-50 rounded-2xl border border-violet-100">
                    <span className="text-violet-700 font-bold">Upcoming Broadcasts</span>
                  </div>
                </div>

                {!sessionForm.batchId || sessionForm.batchId === '_none' ? (
                  <Card className="rounded-[3rem] border-dashed border-2 border-slate-200 bg-slate-50/50 py-32 flex flex-col items-center justify-center">
                    <Video className="h-24 w-24 text-slate-300 mb-6" />
                    <h3 className="text-3xl font-bold text-slate-600 mb-2">Select a Cohort</h3>
                    <p className="text-slate-500 text-lg">Your broadcasting schedule will animate here.</p>
                  </Card>
                ) : loadingSessions ? (
                  <div className="flex justify-center py-20">
                    <LoadingSpinner size="lg" className="text-violet-600" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-slate-100">
                    <Video className="h-20 w-20 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 text-xl font-medium">No sessions scheduled for this cohort.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {sessions.map((session) => (
                      <Card
                        key={session.id}
                        className="rounded-[2.5rem] border-0 bg-white shadow-[0_12px_24px_-8px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all overflow-hidden group p-2"
                      >
                        <div className="p-8 flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className="bg-violet-50 p-6 rounded-[2rem] group-hover:bg-violet-100 transition-colors">
                              <Video className="h-8 w-8 text-violet-600" />
                            </div>
                            <div>
                              <h4 className="text-2xl font-black text-slate-800 mb-2">{session.topic}</h4>
                              <div className="flex items-center space-x-3 text-slate-500">
                                <Clock className="h-5 w-5 text-violet-400" />
                                <span className="font-bold">
                                  {new Date(session.scheduled_time).toLocaleString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="secondary"
                            className="rounded-2xl py-8 px-8 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-black text-lg transition-all shadow-sm"
                            asChild
                          >
                            <Link to={`/live-class/${session.id}`} target="_blank">
                              <ExternalLink className="h-6 w-6 mr-3" />
                              Join Set
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="materials">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Upload Material Form */}
              <div className="lg:col-span-4 space-y-8">
                <Card className="rounded-[2.5rem] border-0 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 w-full" />
                  <CardHeader>
                    <CardTitle className="text-3xl font-extrabold flex items-center text-slate-800">
                      <Upload className="h-8 w-8 mr-3 text-emerald-600" />
                      Asset Drop
                    </CardTitle>
                    <CardDescription className="text-lg">Distribute knowledge instantly</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUploadMaterial} className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="materialCourseSelect" className="text-lg font-bold text-slate-700">Target Course</Label>
                        <Select
                          value={selectedCourseForMaterials}
                          onValueChange={(value) => {
                            setSelectedCourseForMaterials(value);
                            fetchMaterials(value);
                          }}
                          disabled={submitting}
                        >
                          <SelectTrigger className="rounded-2xl py-6 text-lg border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 ring-emerald-100 transition-all">
                            <SelectValue placeholder="Choose course" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl border-emerald-50">
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id} className="text-lg py-3">
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="materialTitle" className="text-lg font-bold text-slate-700">Display Label</Label>
                        <Input
                          id="materialTitle"
                          placeholder="e.g., Master Thesis 2026"
                          className="rounded-2xl py-6 text-lg border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 ring-emerald-100"
                          value={materialForm.title}
                          onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                          required
                          disabled={submitting}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="materialFile" className="text-lg font-bold text-slate-700">Knowledge File (PDF/PPT)</Label>
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-emerald-200 rounded-[2rem] cursor-pointer bg-emerald-50/30 hover:bg-emerald-50/80 transition-all">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-3 text-emerald-500" />
                              <p className="mb-2 text-sm text-emerald-600 font-bold">
                                {materialForm.file ? materialForm.file.name : 'Click to select asset'}
                              </p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.ppt,.pptx"
                              onChange={(e) => setMaterialForm({ ...materialForm, file: e.target.files?.[0] || null })}
                            />
                          </label>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting || !selectedCourseForMaterials || !materialForm.file}
                        className="w-full py-8 text-xl font-black rounded-3xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                      >
                        {submitting ? (
                          <LoadingSpinner size="md" />
                        ) : (
                          <>
                            <Upload className="h-6 w-6 mr-2" />
                            Seal & Ship
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Materials List */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center">
                    <FileText className="h-10 w-10 mr-4 text-emerald-600" />
                    Resource Repository
                  </h2>
                  <div className="px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-emerald-700 font-bold">Cloud Assets</span>
                  </div>
                </div>

                {!selectedCourseForMaterials ? (
                  <Card className="rounded-[3rem] border-dashed border-2 border-slate-200 bg-slate-50/50 py-32 flex flex-col items-center justify-center">
                    <FileText className="h-24 w-24 text-slate-300 mb-6" />
                    <h3 className="text-3xl font-bold text-slate-600 mb-2">Unlock Resources</h3>
                    <p className="text-slate-500 text-lg">Select a course to view your distributed assets.</p>
                  </Card>
                ) : loadingMaterials ? (
                  <div className="flex justify-center py-20">
                    <LoadingSpinner size="lg" className="text-emerald-600" />
                  </div>
                ) : materials.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-slate-100">
                    <FileText className="h-20 w-20 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 text-xl font-medium">No assets deployed for this course yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {materials.map((material) => (
                      <Card
                        key={material.id}
                        className="rounded-[2rem] border-0 bg-white shadow-[0_12px_24px_-8px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all overflow-hidden group"
                      >
                        <div className="p-6 flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-emerald-50 p-4 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                              <FileText className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                              <h5 className="font-black text-slate-800 text-lg leading-tight line-clamp-1">{material.title}</h5>
                              <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">
                                {material.file_type} • {(material.file_size! / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                            onClick={() => handleDeleteMaterial(material.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="px-6 pb-6">
                          <Button variant="secondary" className="w-full rounded-2xl bg-slate-50 hover:bg-emerald-600 hover:text-white font-bold transition-all border border-slate-100" asChild>
                            <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open Asset
                            </a>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
