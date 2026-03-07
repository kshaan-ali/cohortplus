import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ErrorMessage } from '@/components/ui-custom/ErrorMessage';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import { GraduationCap, Eye, EyeOff, Check, X } from 'lucide-react';
import type { UserRole } from '@/types';
import {
  validateEmail,
  validateSignupPassword,
  validateConfirmPassword,
  validateRole,
  getPasswordStrength,
  PASSWORD_RULES,
} from '@/lib/validation';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Live password strength
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const showStrength = password.length > 0;

  // Count how many rules pass for the strength bar
  const passedCount = PASSWORD_RULES.filter((r) => strength[r.key]).length;
  const strengthPercent = (passedCount / PASSWORD_RULES.length) * 100;
  const strengthColor =
    strengthPercent <= 20
      ? 'bg-red-500'
      : strengthPercent <= 60
        ? 'bg-yellow-500'
        : strengthPercent < 100
          ? 'bg-blue-500'
          : 'bg-green-500';

  const handleEmailBlur = () => {
    if (email) {
      const result = validateEmail(email);
      setEmailError(result.error || null);
    }
  };

  const handlePasswordBlur = () => {
    if (password) {
      const result = validateSignupPassword(password);
      setPasswordErrors(result.errors);
    }
    // Re-validate confirm if it has a value
    if (confirmPassword) {
      const cpResult = validateConfirmPassword(password, confirmPassword);
      setConfirmPasswordError(cpResult.error || null);
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword) {
      const result = validateConfirmPassword(password, confirmPassword);
      setConfirmPasswordError(result.error || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validate all fields
    const emailResult = validateEmail(email);
    const passwordResult = validateSignupPassword(password);
    const confirmResult = validateConfirmPassword(password, confirmPassword);
    const roleResult = validateRole(role);

    setEmailError(emailResult.error || null);
    setPasswordErrors(passwordResult.errors);
    setConfirmPasswordError(confirmResult.error || null);

    if (
      !emailResult.valid ||
      !passwordResult.valid ||
      !confirmResult.valid ||
      !roleResult.valid
    ) {
      return;
    }

    try {
      await register({ email: email.trim().toLowerCase(), password, role });
      navigate('/');
    } catch (err) {
      // Error is handled by auth context
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)] opacity-[0.03] -z-10" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20">
        <div className="w-96 h-96 bg-primary rounded-full" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 blur-3xl opacity-20">
        <div className="w-96 h-96 bg-blue-600 rounded-full" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo */}
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
              <GraduationCap className="h-10 w-10 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-foreground">CohortPlus</span>
          </Link>
        </div>

        <Card className="shadow-2xl border-border bg-card">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold text-center text-foreground">Create an account</CardTitle>
            <CardDescription className="text-center text-base text-muted-foreground">
              Join CohortPlus to start learning or teaching
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ErrorMessage message={error} onDismiss={clearError} />

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  onBlur={handleEmailBlur}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className={emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {emailError && (
                  <p className="text-sm text-red-500 mt-1">{emailError}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordErrors.length) setPasswordErrors([]);
                    }}
                    onBlur={handlePasswordBlur}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className={`pr-10 ${passwordErrors.length > 0 ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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

                {/* Password strength indicator */}
                {showStrength && (
                  <div className="space-y-2 mt-2">
                    {/* Strength bar */}
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                        style={{ width: `${strengthPercent}%` }}
                      />
                    </div>
                    {/* Rules checklist */}
                    <ul className="space-y-1">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = strength[rule.key];
                        return (
                          <li key={rule.key} className="flex items-center gap-1.5 text-xs">
                            {passed ? (
                              <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-red-400 shrink-0" />
                            )}
                            <span className={passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {rule.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError(null);
                    }}
                    onBlur={handleConfirmPasswordBlur}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className={`pr-10 ${confirmPasswordError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-sm text-red-500 mt-1">{confirmPasswordError}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label>I want to</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as UserRole)}
                  className="flex flex-col space-y-2"
                  disabled={loading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="font-normal cursor-pointer">
                      Learn as a Student
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tutor" id="tutor" />
                    <Label htmlFor="tutor" className="font-normal cursor-pointer">
                      Teach as a Tutor
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg shadow-lg shadow-primary/20"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
