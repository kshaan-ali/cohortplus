import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { liveSessionsApi } from '@/services/api';
import '@zoomus/websdk/dist/css/bootstrap.css';
import '@zoomus/websdk/dist/css/react-select.css';
import type { LiveSession } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { ErrorMessage } from '@/components/ui-custom/ErrorMessage';
import {
  Video,
  ArrowLeft,
  Clock,
  Users,
  Monitor,
  Mic,
  MicOff,
  Camera,
  CameraOff
} from 'lucide-react';

export function LiveClass() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails(sessionId);
    }
  }, [sessionId]);

  const fetchSessionDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await liveSessionsApi.getById(id);
      if (!data) {
        setError('Live session not found');
        return;
      }
      setSession(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionId) return;

    setJoining(true);
    setError(null);

    try {
      // Fetch Zoom SDK credentials from backend
      const credentials = await liveSessionsApi.getJoinCredentials(sessionId);
      console.log('Got credentials:', credentials);

      // Helper to load scripts
      const loadScript = (src: string) => {
        return new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = src;
          script.onload = () => resolve(true);
          script.onerror = (err) => {
            console.error('Failed to load script:', src);
            reject(new Error(`Failed to load Zoom SDK script: ${src}`));
          };
          document.body.appendChild(script);
        });
      };

      // Load Zoom Component View SDK from CDN (Stable version 3.8.10)
      await loadScript('https://source.zoom.us/3.8.10/lib/vendor/react.min.js');
      await loadScript('https://source.zoom.us/3.8.10/lib/vendor/react-dom.min.js');
      await loadScript('https://source.zoom.us/3.8.10/zoom-meeting-embedded-3.8.10.min.js');

      const { ZoomMtgEmbedded } = window as any;
      const client = ZoomMtgEmbedded.createClient();

      let meetingSDKElement = document.getElementById('meetingSDKElement');
      if (!meetingSDKElement) {
        // Find the container we rendered in JSX
        meetingSDKElement = document.getElementById('meeting-container');
      }

      if (!meetingSDKElement) {
        throw new Error('Meeting container not found');
      }

      client.init({
        zoomAppRoot: meetingSDKElement,
        language: 'en-US',
        customize: {
          video: {
            isResizable: true,
            viewSizes: {
              default: {
                width: 1000,
                height: 600
              },
              ribbon: {
                width: 300,
                height: 700
              }
            }
          }
        }
      });

      console.log('=== ZOOM JOIN ATTEMPT ===');
      console.log('SDK Key:', credentials.apiKey);
      console.log('Meeting Number:', credentials.meetingNumber);
      console.log('Password:', credentials.password ? '***SET***' : 'EMPTY/MISSING');
      console.log('User Name:', credentials.userName);
      console.log('Signature length:', credentials.signature?.length || 0);
      console.log('========================');

      client.join({
        sdkKey: credentials.apiKey,
        signature: credentials.signature,
        meetingNumber: credentials.meetingNumber,
        password: credentials.password,
        userName: credentials.userName,
        userEmail: credentials.userEmail,
        tk: '',
        zak: ''
      }).then(() => {
        console.log('✅ Join meeting success');
        setJoined(true);
      }).catch((error: any) => {
        console.error('❌ Zoom join error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        setError(error.reason || error.message || 'Failed to join Zoom meeting');
        setJoining(false);
      });

    } catch (err: any) {
      console.error('Join session error:', err);
      setError(err.message || 'Failed to join session. Please try again.');
      setJoining(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
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

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <ErrorMessage
            message={error || 'Session not found'}
            onDismiss={() => navigate('/my-enrollments')}
          />
          <Button onClick={() => navigate('/my-enrollments')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Enrollments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Only verify visible if not fully immersive, but component view is usually embedded */}
      <div className="bg-white border-b border-gray-200 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/my-enrollments')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{session.topic}</h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDateTime(session.scheduled_time)}
                </p>
              </div>
            </div>

            {joined && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-green-600">
                  <span className="animate-pulse">●</span>
                  <span className="text-sm font-medium">LIVE</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {!joined && !joining ? (
          <div className="max-w-2xl mx-auto py-8 px-4">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Video className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle>Ready to Join?</CardTitle>
                <CardDescription>
                  Join the live session for "{session.topic}"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview Controls - visual only for now as actual preview happens in SDK */}
                <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center relative">
                  <div className="text-center text-white">
                    <Monitor className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400">Camera preview</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <Video className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Session ID: {session.zoom_meeting_id || 'TBD'}</span>
                  </div>
                </div>

                <Button
                  onClick={handleJoinSession}
                  disabled={joining}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg"
                >
                  {joining ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Joining Session...
                    </>
                  ) : (
                    <>
                      <Video className="h-5 w-5 mr-2" />
                      Join Live Session
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  By joining, you agree to follow the platform's code of conduct
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Meeting Container for Component View */
          <div id="meeting-container" className="w-full h-full min-h-[600px] relative">
            {/* Zoom SDK will render here */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 -z-10">
              <LoadingSpinner size="lg" />
              <span className="ml-2">Loading Meeting...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
