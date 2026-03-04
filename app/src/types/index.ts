// User Types
export type UserRole = 'student' | 'tutor';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  tutor_id: string;
  tutor_name?: string;
  created_at?: string;
  updated_at?: string;
}

// Batch Types
export interface Batch {
  id: string;
  course_id: string;
  course_name?: string;
  start_date: string;
  end_date: string;
  price: number;
  billing_type: 'monthly' | 'yearly';
  created_at?: string;
}

// Enrollment Types
export interface Enrollment {
  id: string;
  student_id: string;
  batch_id: string;
  course_name?: string;
  batch_start_date?: string;
  batch_end_date?: string;
  enrolled_at?: string;
}

// Live Session Types
export interface LiveSession {
  id: string;
  batch_id: string;
  topic: string;
  scheduled_time: string;
  zoom_meeting_id?: string;
  zoom_join_url?: string;
  created_at?: string;
}

// Course Material Types
export interface CourseMaterial {
  id: string;
  course_id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  created_at?: string;
}

// Chat Message Types
export interface ChatMessage {
  id: string;
  batch_id: string;
  sender_id: string;
  sender_email: string;
  sender_role: string;
  message: string;
  created_at: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User | null;
  session: any | null;
  error?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}
