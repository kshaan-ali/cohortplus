import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { enrollmentsApi, liveSessionsApi } from '@/services/api';
import type { Enrollment, LiveSession } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { ErrorMessage } from '@/components/ui-custom/ErrorMessage';
import { EmptyState } from '@/components/ui-custom/EmptyState';
import {
  GraduationCap,
  Calendar,
  Video,
  BookOpen,
  Clock
} from 'lucide-react';

interface EnrollmentWithSessions extends Enrollment {
  sessions?: LiveSession[];
}

export function MyEnrollments() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrollmentWithSessions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningSession, setJoiningSession] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await enrollmentsApi.getMyEnrollments();

      // Fetch live sessions for each enrollment
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

  const handleJoinLive = async (sessionId: string) => {
    setJoiningSession(sessionId);
    try {
      await liveSessionsApi.join(sessionId);
      navigate(`/live-class/${sessionId}`);
    } catch (err) {
      console.error('Join failed:', err);
      navigate(`/live-class/${sessionId}`);
    } finally {
      setJoiningSession(null);
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

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const isSessionLive = (scheduledTime: string) => {
    const now = new Date();
    const sessionTime = new Date(scheduledTime);
    const diffMinutes = (now.getTime() - sessionTime.getTime()) / (1000 * 60);
    // Session is considered "live" if it's within 15 minutes of start time or ongoing
    return diffMinutes >= -15 && diffMinutes <= 120;
  };

  const isUpcoming = (scheduledTime: string) => {
    const now = new Date();
    const sessionTime = new Date(scheduledTime);
    return sessionTime > now;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">My Enrollments</h1>
                <p className="text-indigo-100 mt-2 text-lg">
                  View your enrolled courses and upcoming live sessions
                </p>
              </div>
            </div>
            <Link to="/courses">
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse More Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {enrollments.length === 0 ? (
          <EmptyState
            title="No enrollments yet"
            description="You haven't enrolled in any courses yet. Browse our courses and start learning!"
            icon="enrollments"
            actionLabel="Browse Courses"
            onAction={() => navigate('/courses')}
          />
        ) : (
          <div className="space-y-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border-0">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{enrollment.course_name}</CardTitle>
                      <CardDescription className="flex items-center mt-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(enrollment.batch_start_date || '')} - {formatDate(enrollment.batch_end_date || '')}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Enrolled</Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {enrollment.sessions && enrollment.sessions.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <Video className="h-4 w-4 mr-2" />
                        Live Sessions
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {enrollment.sessions
                          .filter((session) => {
                            // Only show upcoming sessions or sessions within 2 hours of start time
                            const sessionTime = new Date(session.scheduled_time);
                            const now = new Date();
                            const diffMinutes = (now.getTime() - sessionTime.getTime()) / (1000 * 60);
                            // Show if future or within 2 hours past start time
                            return diffMinutes < 120;
                          })
                          .map((session) => {
                            const live = isSessionLive(session.scheduled_time);
                            const upcoming = isUpcoming(session.scheduled_time);

                            return (
                              <div
                                key={session.id}
                                className={`border rounded-lg p-4 ${live ? 'border-green-300 bg-green-50' : 'border-gray-200'
                                  }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-medium text-gray-900">{session.topic}</h5>
                                  {live && (
                                    <Badge className="bg-green-600">
                                      <span className="animate-pulse mr-1">●</span>
                                      LIVE
                                    </Badge>
                                  )}
                                  {upcoming && !live && (
                                    <Badge variant="outline">Upcoming</Badge>
                                  )}
                                </div>

                                <div className="flex items-center text-sm text-gray-600 mb-4">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatDateTime(session.scheduled_time)}
                                </div>

                                <Button
                                  onClick={() => handleJoinLive(session.id)}
                                  disabled={joiningSession === session.id || (!live && !upcoming)}
                                  className="w-full"
                                  variant={live ? 'default' : 'outline'}
                                >
                                  {joiningSession === session.id ? (
                                    <>
                                      <LoadingSpinner size="sm" className="mr-2" />
                                      Joining...
                                    </>
                                  ) : live ? (
                                    <>
                                      <Video className="h-4 w-4 mr-2" />
                                      Join Live Class
                                    </>
                                  ) : upcoming ? (
                                    <>
                                      <Clock className="h-4 w-4 mr-2" />
                                      Starting Soon
                                    </>
                                  ) : (
                                    'Session Ended'
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No live sessions scheduled yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
