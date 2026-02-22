import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorMessage } from '@/components/ui-custom/ErrorMessage';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, or default to home
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      return;
    }

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by auth context
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20">
        <div className="w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 blur-3xl opacity-20">
        <div className="w-96 h-96 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo */}
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">CohortPlus</span>
          </Link>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ErrorMessage message={error} onDismiss={clearError} />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Create an account
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
