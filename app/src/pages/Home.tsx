import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GraduationCap,
  BookOpen,
  Users,
  Video,
  ArrowRight,
  CheckCircle,
  Calendar,
  LayoutDashboard
} from 'lucide-react';

export function Home() {
  const { isAuthenticated, isStudent, isTutor } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Expert-Led Courses',
      description: 'Learn from industry professionals with years of real-world experience.',
    },
    {
      icon: Users,
      title: 'Cohort-Based Learning',
      description: 'Join a community of learners and progress together through structured batches.',
    },
    {
      icon: Video,
      title: 'Live Interactive Sessions',
      description: 'Participate in real-time live classes with interactive Q&A sessions.',
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Choose from multiple batches that fit your schedule and learning pace.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-30">
          <div className="w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 blur-3xl opacity-30">
          <div className="w-96 h-96 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl shadow-xl shadow-indigo-200">
                <GraduationCap className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Welcome to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">CohortPlus</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              A modern cohort-based learning platform connecting students with expert tutors
              through interactive live sessions and structured courses.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-7 text-xl font-bold rounded-2xl shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95">
                      Get Started
                      <ArrowRight className="h-6 w-6 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/courses">
                    <Button size="lg" variant="outline" className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-10 py-7 text-xl font-bold rounded-2xl transition-all hover:scale-105 active:scale-95">
                      Browse Courses
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/courses">
                    <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-6 text-lg shadow-lg shadow-indigo-200">
                      Browse Courses
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  {isStudent && (
                    <Link to="/my-enrollments">
                      <Button size="lg" variant="outline" className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-6 text-lg">
                        My Enrollments
                      </Button>
                    </Link>
                  )}
                  {isTutor && (
                    <Link to="/tutor-dashboard">
                      <Button size="lg" variant="outline" className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-6 text-lg">
                        <LayoutDashboard className="h-5 w-5 mr-2" />
                        Tutor Dashboard
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why Choose CohortPlus?</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform is designed to provide the best learning experience
            with features that support both students and tutors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-xl transition-shadow duration-300 h-full">
                <CardHeader className="pb-4">
                  <div className="mx-auto bg-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* For Students Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">For Students</h2>
              <ul className="space-y-4">
                {[
                  'Browse and enroll in courses that interest you',
                  'Join structured batches with scheduled learning',
                  'Attend live interactive sessions with expert tutors',
                  'Track your progress and manage your enrollments',
                  'Connect with fellow learners in your cohort',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/courses">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Explore Courses
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Introduction to React</h3>
                    <p className="text-sm text-gray-500">Batch starting March 1st</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Video className="h-4 w-4 mr-2" />
                    <span>12 Live Sessions</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>25 Students Enrolled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* For Tutors Section */}
      <div className="bg-indigo-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-indigo-800 rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="bg-indigo-700 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-white font-medium">Create Course</span>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="bg-indigo-700 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-white font-medium">Schedule Batches</span>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="bg-indigo-700 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-white font-medium">Host Live Sessions</span>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">For Tutors</h2>
              <ul className="space-y-4">
                {[
                  'Create and manage your own courses',
                  'Organize students into structured batches',
                  'Host live interactive sessions with Zoom integration',
                  'Track student engagement and progress',
                  'Build your teaching portfolio and reach more students',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-indigo-100">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register">
                  <Button className="bg-white text-indigo-900 hover:bg-gray-100">
                    Start Teaching
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-3xl p-12 md:p-16 text-center shadow-2xl shadow-indigo-200">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-10 leading-relaxed">
            Join CohortPlus today and become part of a community dedicated to
            interactive, cohort-based learning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-indigo-700">
                    Browse Courses
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/courses">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                  Continue Learning
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
