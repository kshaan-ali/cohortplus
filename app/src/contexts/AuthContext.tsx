import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { profileApi } from '@/services/api';
import type { User, UserRole, LoginCredentials, RegisterCredentials } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  isTutor: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes - handles initial session too
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only set loading true if we are in a transition state
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setLoading(true);
        }

        try {
          if (session?.user) {
            // Add a strict timeout to avoid locking the UI if backend is slow
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            try {
              const userData = await fetchUserProfile(session.user.id);
              setUser(userData);
            } finally {
              clearTimeout(timeoutId);
            }
          } else {
            setUser(null);
          }
        } catch (err) {
          console.warn('AuthContext: Auth state change handling failed', err);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile - prefer backend (profiles table), fallback to Supabase metadata
  const fetchUserProfile = async (_userId: string): Promise<User | null> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      try {
        const profile = await profileApi.getMe();
        if (profile) {
          return {
            id: authUser.id,
            email: authUser.email || profile.name || '',
            role: (profile.role as UserRole) || 'student',
          };
        }
      } catch {
        // Backend profile not found, use metadata
      }

      const role = (authUser.user_metadata?.role as UserRole) || 'student';
      return {
        id: authUser.id,
        email: authUser.email || '',
        role,
      };
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (data.user) {
        const userData = await fetchUserProfile(data.user.id);
        setUser(userData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            role: credentials.role,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (data.user) {
        try {
          await profileApi.sync({
            id: data.user.id,
            email: data.user.email || credentials.email,
            role: credentials.role,
          });
        } catch (syncErr) {
          console.warn('Profile sync failed (may need Supabase trigger):', syncErr);
        }
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          role: credentials.role,
        };
        setUser(userData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signOut();
      if (authError) {
        throw new Error(authError.message);
      }
    } catch (err: any) {
      console.warn('Supabase logout error (ignoring to force local clear):', err);
    } finally {
      // Always clear local state even if Supabase call fails
      setUser(null);
      // Clean up any potential leftover manual items (if any were used)
      localStorage.removeItem('cohortplus_token');
      localStorage.removeItem('token');
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
    isTutor: user?.role === 'tutor',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
