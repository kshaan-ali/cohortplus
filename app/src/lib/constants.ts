// API Endpoints
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// App Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  COURSES: '/courses',
  COURSE_DETAILS: '/courses/:id',
  MY_ENROLLMENTS: '/my-enrollments',
  TUTOR_DASHBOARD: '/tutor-dashboard',
  LIVE_CLASS: '/live-class/:sessionId',
} as const;

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  TUTOR: 'tutor',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'cohortplus_user',
  TOKEN: 'cohortplus_token',
} as const;
