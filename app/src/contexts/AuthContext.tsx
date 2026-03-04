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
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Safety timeout: never stay in initializing state longer than 6 seconds
    const safetyTimer = setTimeout(() => {
      if (mounted) setInitializing(false);
    }, 6000);

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (mounted) {
          if (session?.user) {
            // Optimistic set from session metadata
            const metadataRole = (session.user.user_metadata?.role as UserRole) || 'student';
            const initialUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              role: metadataRole,
            };
            setUser(initialUser);

            // Fetch backend profile in background
            fetchUserProfile(session.user.id).then((augmentedUser) => {
              if (mounted && augmentedUser) setUser(augmentedUser);
            });
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('AuthContext: Initial auth check failed', err);
      } finally {
        if (mounted) {
          setInitializing(false);
          clearTimeout(safetyTimer);
        }
      }
    };

    initAuth();

    // Listen for subsequent auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          setUser(null);
          return;
        }

        if (session?.user) {
          try {
            const metadataRole = (session.user.user_metadata?.role as UserRole) || 'student';
            const initialUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              role: metadataRole,
            };
            setUser(initialUser);

            // Fetch backend profile in background
            fetchUserProfile(session.user.id).then((augmentedUser) => {
              if (mounted && augmentedUser) setUser(augmentedUser);
            });
          } catch (err) {
            console.warn('AuthContext: onAuthStateChange processing failed', err);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  // Fetch user profile - prefer backend (profiles table), fallback to Supabase metadata
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      // 1. Get auth user from Supabase (should be cached/fast)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser || authUser.id !== userId) return null;

      // 2. Try backend profile with a strict 4s timeout
      try {
        // We wrap the profile call in a timeout race to avoid hanging the app
        const profilePromise = profileApi.getMe();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 4000)
        );

        const profile = await Promise.race([profilePromise, timeoutPromise]) as any;

        if (profile) {
          return {
            id: authUser.id,
            email: authUser.email || profile.email || profile.name || '',
            role: (profile.role as UserRole) || 'student',
          };
        }
      } catch (err) {
        console.warn('Backend profile fetch failed or timed out, using metadata fallback', err);
      }

      // 3. Fallback to Supabase metadata
      const role = (authUser.user_metadata?.role as UserRole) || 'student';
      return {
        id: authUser.id,
        email: authUser.email || '',
        role,
      };
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
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
        // Optimistic update
        const role = (data.user.user_metadata?.role as UserRole) || 'student';
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          role,
        });

        // Full profile fetch in background
        const userData = await fetchUserProfile(data.user.id);
        if (userData) setUser(userData);
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
    loading: loading || initializing,
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
