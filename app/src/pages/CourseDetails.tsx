import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { coursesApi, batchesApi, enrollmentsApi, materialsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Course, Batch, CourseMaterial } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { ErrorMessage } from '@/components/ui-custom/ErrorMessage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EmptyState } from '@/components/ui-custom/EmptyState';
import { liveSessionsApi } from '@/services/api';
import {
  BookOpen,
  User,
  Calendar,
  ArrowLeft,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Video,
  FileText,
  Download
} from 'lucide-react';
import { format } from '@/lib/utils';

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

  // Materials state
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetails(id);
    }
  }, [id]);

  const fetchCourseDetails = async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [courseData, batchesData] = await Promise.all([
        coursesApi.getById(courseId),
        batchesApi.getByCourse(courseId),
      ]);

      if (!courseData) {
        setError('Course not found');
        return;
      }

      setCourse(courseData);
      setBatches(batchesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load course details. Please try again.');
    } finally {
      setLoading(false);
    }

    // Fetch materials separately (don't block the whole page)
    fetchMaterials(courseId);
  };

  const fetchMaterials = async (courseId: string) => {
    setLoadingMaterials(true);
    try {
      const data = await materialsApi.getByCourse(courseId);
      setMaterials(data);
    } catch (error) {
      console.error('Failed to load materials', error);
    } finally {
      setLoadingMaterials(false);
    }
  };

  // Instant Session State
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStartInstantSession = async () => {
    if (!selectedBatchId) return;

    setIsStartingSession(true);
    setError(null);

    try {
      const batch = batches.find(b => b.id === selectedBatchId);
      const topic = `Instant Session - ${course?.title}`;

      const newSession = await liveSessionsApi.create({
        batch_id: selectedBatchId,
        topic: topic,
        scheduled_time: new Date().toISOString(), // Now
        description: `Instant live session started for ${batch?.id}`
      });

      // Redirect immediately to the live class
      navigate(`/live-class/${newSession.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start instant session');
      setIsStartingSession(false);
    }
  };

  const handleEnroll = async (batchId: string) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    setEnrolling(batchId);
    setEnrollSuccess(null);
    setError(null);

    try {
      await enrollmentsApi.enroll(batchId);
      setEnrollSuccess(batchId);
      // Optionally redirect to enrollments page
      // navigate('/my-enrollments');
    } catch (err: any) {
      setError(err.message || 'Failed to enroll. Please try again.');
    } finally {
      setEnrolling(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState
            title="Course not found"
            description="The course you're looking for doesn't exist or has been removed."
            icon="courses"
            actionLabel="Browse Courses"
            onAction={() => navigate('/courses')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/courses"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="shrink-0">
              {course.thumbnail_url ? (
                <div className="w-full md:w-64 aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                  <img
                    src={`${course.thumbnail_url.trim()}?t=${Date.now()}`}
                    alt={course.title}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-3xl shadow-xl">
                  <BookOpen className="h-16 w-16 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight">{course.title}</h1>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <User className="h-5 w-5 mr-2 text-indigo-100" />
                  <span className="text-indigo-50 font-bold">
                    {course.tutor_name || 'Unknown Tutor'}
                  </span>
                </div>
              </div>

              {/* Tutor Actions */}
              {user?.id === course.tutor_id && (
                <div className="mt-6 flex gap-2">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                        <Video className="h-4 w-4 mr-2" />
                        Start Instant Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Start Instant Live Session</DialogTitle>
                        <DialogDescription>
                          Select the batch you want to start a live session for.
                          Only students enrolled in this batch will be able to join.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <label className="text-sm font-medium mb-2 block">Select Batch</label>
                        {batches.length === 0 ? (
                          <p className="text-sm text-gray-500">No batches available for this course.</p>
                        ) : (
                          <div className="space-y-2">
                            {batches.map((batch) => (
                              <div
                                key={batch.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedBatchId === batch.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                                onClick={() => setSelectedBatchId(batch.id)}
                              >
                                <div className="font-medium">Batch ({formatDate(batch.start_date)} - {formatDate(batch.end_date)})</div>
                                <div className="text-xs text-gray-500">ID: {batch.id.slice(0, 8)}...</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button
                          onClick={handleStartInstantSession}
                          disabled={!selectedBatchId || isStartingSession || batches.length === 0}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {isStartingSession ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Starting...
                            </>
                          ) : (
                            'Start Session Now'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Link to="/tutor-dashboard">
                    <Button variant="outline">
                      Manage Sessions
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {enrollSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">
              Successfully enrolled! You can view your enrollment in "My Enrollments"
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Description */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>About this Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {course.description}
                </p>
              </CardContent>
            </Card>

            {/* Course Materials */}
            <Card className="shadow-lg border-0 mt-8">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                  Course Materials
                </CardTitle>
                <CardDescription>
                  Downloadable resources for this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMaterials ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" />
                  </div>
                ) : materials.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No materials available for this course yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group"
                      >
                        <div className="flex items-center min-w-0">
                          <div className="p-2.5 bg-indigo-50 rounded-lg mr-3 group-hover:bg-indigo-100 transition-colors">
                            <FileText className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="truncate">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">{material.title}</h4>
                            <p className="text-xs text-gray-500 uppercase font-medium">
                              {material.file_type} • {material.file_size ? `${(material.file_size / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 ml-2"
                          asChild
                        >
                          <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Available Batches */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Available Batches
                </CardTitle>
                <CardDescription>
                  Select a batch to enroll
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {batches.length === 0 ? (
                  <div className="text-center py-4">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No batches available</p>
                  </div>
                ) : (
                  batches.map((batch) => (
                    <div
                      key={batch.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">Batch</Badge>
                        {enrollSuccess === batch.id && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Start: {formatDate(batch.start_date)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>End: {formatDate(batch.end_date)}</span>
                        </div>
                      </div>

                      {isStudent && (
                        <Button
                          onClick={() => handleEnroll(batch.id)}
                          disabled={enrolling === batch.id || enrollSuccess === batch.id}
                          className={enrollSuccess === batch.id ? "w-full" : "w-full bg-indigo-600 hover:bg-indigo-700"}
                          variant={enrollSuccess === batch.id ? 'outline' : 'default'}
                        >
                          {enrolling === batch.id ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Enrolling...
                            </>
                          ) : enrollSuccess === batch.id ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Enrolled
                            </>
                          ) : (
                            'Enroll Now'
                          )}
                        </Button>
                      )}

                      {!isAuthenticated && (
                        <Button
                          onClick={() => handleEnroll(batch.id)}
                          className="w-full"
                        >
                          Login to Enroll
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
