import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Video, Calendar, Clock, Play, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { recordingsApi } from '@/services/api';

interface Recording {
    id: string;
    batch_id: string;
    live_session_id: string;
    recording_url: string;
    duration: number;
    created_at: string;
    live_sessions: { title: string };
    batches: {
        id: string;
        courses: { title: string };
    };
}
export function MyRecordings() {
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchRecordings();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchRecordings = async () => {
        try {
            const data = await recordingsApi.getMyRecordings();
            setRecordings(data);
        } catch (error) {
            console.error('Fetch recordings error:', error);
            toast.error('Failed to fetch recordings');
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Group recordings by batch
    const groupedRecordings = recordings.reduce((acc, recording) => {
        const batchTitle = recording.batches?.courses?.title || 'Unknown Course';
        if (!acc[batchTitle]) {
            acc[batchTitle] = [];
        }
        acc[batchTitle].push(recording);
        return acc;
    }, {} as Record<string, Recording[]>);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">My Recordings</h1>
                <p className="text-lg text-gray-600">Access all your past live class recordings organized by batch.</p>
            </div>

            {Object.keys(groupedRecordings).length === 0 ? (
                <Card className="bg-white border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="bg-indigo-50 p-4 rounded-full mb-4">
                            <Video className="h-10 w-10 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No recordings found</h3>
                        <p className="text-gray-500 text-center max-w-sm">
                            You haven't attended any recorded classes yet. Come back here after your first live session ends!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-16">
                    {Object.entries(groupedRecordings).map(([batchTitle, records]) => (
                        <section key={batchTitle} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-indigo-600 p-2 rounded-lg">
                                    <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{batchTitle}</h2>
                                <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200">
                                    {records.length} {records.length === 1 ? 'Session' : 'Sessions'}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {records.map((rec) => (
                                    <Card key={rec.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-gray-100 bg-white">
                                        <div className="aspect-video relative overflow-hidden bg-gray-900">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opactiy-60" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                <Button
                                                    onClick={() => window.open(rec.recording_url, '_blank')}
                                                    className="rounded-full h-16 w-16 bg-white/20 backdrop-blur-md hover:bg-white/40 border-2 border-white"
                                                >
                                                    <Play className="h-8 w-8 text-white fill-white" />
                                                </Button>
                                            </div>
                                            {/* Placeholder for thumbnail since we don't have real ones yet */}
                                            <div className="h-full w-full flex items-center justify-center text-indigo-200/20">
                                                <Video className="h-20 w-20" />
                                            </div>
                                            <Badge className="absolute bottom-4 right-4 z-20 bg-black/50 backdrop-blur-md text-white border-0">
                                                {formatDuration(rec.duration)}
                                            </Badge>
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg font-bold group-hover:text-indigo-600 transition-colors">
                                                {rec.live_sessions.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center text-sm text-gray-500 gap-4">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(rec.created_at)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => window.open(rec.recording_url, '_blank')}
                                                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 rounded-xl"
                                            >
                                                Watch Recording
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
