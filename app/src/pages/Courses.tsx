import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi } from '@/services/api';
import type { Course } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { ErrorMessage } from '@/components/ui-custom/ErrorMessage';
import { BookOpen, ArrowRight, Search, Filter, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-100 rounded-full blur-[120px] -ml-64 -mb-64" />
      </div>

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 mr-2 text-yellow-300" />
              <span className="text-sm font-bold tracking-wider uppercase">Premium Learning Experience</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6">
              Empower Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-indigo-200">Future</span>
            </h1>
            <p className="text-indigo-100 text-xl md:text-2xl font-medium max-w-3xl opacity-90 leading-relaxed mb-12">
              Master new skills with our world-class courses designed and taught by industry experts.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-2xl relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
              <div className="relative flex items-center bg-white/10 backdrop-blur-2xl border border-white/30 rounded-[2rem] overflow-hidden focus-within:bg-white/20 transition-all">
                <Search className="h-6 w-6 ml-6 text-white/60" />
                <Input
                  type="text"
                  placeholder="Search for courses, skills, or tutors..."
                  className="w-full h-16 bg-transparent border-0 text-white placeholder:text-white/40 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 px-6"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center">
            <div className="bg-indigo-600 p-4 rounded-2xl mr-4 shadow-lg shadow-indigo-200">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800">Featured Courses</h2>
              <p className="text-slate-500 font-medium">Showing {filteredCourses.length} handcrafted learning paths</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200 shadow-sm">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-600">No courses matching "{searchQuery}"</h3>
            <p className="text-slate-400 mt-2">Try adjusting your search terms or filters</p>
            <Button
              variant="outline"
              className="mt-8 rounded-2xl"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="rounded-[2.5rem] border-0 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] hover:-translate-y-3 transition-all duration-500 overflow-hidden flex flex-col group"
              >
                {/* Thumbnail / Image Area */}
                <div className="relative h-64 overflow-hidden">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-indigo-200" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-6 right-6">
                    <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-indigo-600 text-xs font-black uppercase tracking-widest shadow-xl">
                      Premium
                    </div>
                  </div>
                </div>

                <CardHeader className="pt-8 px-8 flex-grow">
                  <div className="flex items-center text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">
                    <span className="bg-indigo-50 px-3 py-1 rounded-full">{course.tutor_name || 'Expert Led'}</span>
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-800 leading-tight group-hover:text-indigo-700 transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-lg mt-4 text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="p-8 pt-0 mt-auto">
                  <div className="w-full pt-6 border-t border-slate-50">
                    <Link to={`/courses/${course.id}`} className="block">
                      <Button className="w-full h-16 rounded-[1.5rem] bg-slate-900 hover:bg-indigo-600 shadow-xl hover:shadow-indigo-200 transition-all duration-300 text-lg font-black group/btn">
                        View Course
                        <ArrowRight className="h-5 w-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
