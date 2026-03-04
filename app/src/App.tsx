import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Courses } from '@/pages/Courses';
import { CourseDetails } from '@/pages/CourseDetails';
import { MyEnrollments } from '@/pages/MyEnrollments';
import { EnrollmentDetails } from '@/pages/EnrollmentDetails';
import { MyRecordings } from '@/pages/MyRecordings';
import { TutorDashboard } from '@/pages/TutorDashboard';
import { LiveClass } from '@/pages/LiveClass';
import { BatchChat } from '@/pages/BatchChat';
import { CommunityList } from '@/pages/CommunityList';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Auth Routes - No Navbar */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Routes with Navbar */}
              <Route
                path="/*"
                element={
                  <>
                    <Navbar />
                    <main>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/courses/:id" element={<CourseDetails />} />

                        {/* Protected Student Routes */}
                        <Route
                          path="/my-enrollments"
                          element={
                            <ProtectedRoute>
                              <MyEnrollments />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/enrollment/:id"
                          element={
                            <ProtectedRoute>
                              <EnrollmentDetails />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/my-recordings"
                          element={
                            <ProtectedRoute>
                              <MyRecordings />
                            </ProtectedRoute>
                          }
                        />

                        {/* Protected Tutor Routes */}
                        <Route
                          path="/tutor-dashboard"
                          element={
                            <ProtectedRoute requiredRole="tutor">
                              <TutorDashboard />
                            </ProtectedRoute>
                          }
                        />

                        {/* Protected Live Class Route */}
                        <Route
                          path="/live-class/:sessionId"
                          element={
                            <ProtectedRoute>
                              <LiveClass />
                            </ProtectedRoute>
                          }
                        />

                        {/* Protected Community Chat Routes */}
                        <Route
                          path="/community"
                          element={
                            <ProtectedRoute>
                              <CommunityList />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/community/:batchId"
                          element={
                            <ProtectedRoute>
                              <BatchChat />
                            </ProtectedRoute>
                          }
                        />

                        {/* 404 - Redirect to Home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                  </>
                }
              />
            </Routes>
            <Toaster position="top-right" theme="dark" />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
