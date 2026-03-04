import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { supabase } from '@/lib/supabase';
import { API_BASE_URL } from '@/lib/constants';
import type {
  Course,
  Batch,
  Enrollment,
  LiveSession,
  CourseMaterial,
  ChatMessage,
} from '@/types';

// Create Axios instance - baseURL is /api, so /courses = /api/courses
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add JWT token from Supabase
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Use getSession but don't let it hang the request
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session timeout')), 2000)
      );

      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;

      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.warn('API Interceptor: Failed to get session', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request. Please login again.');
    }
    return Promise.reject(error);
  }
);

// Profile API - sync/create profile after register
export const profileApi = {
  getMe: async () => {
    const response = await apiClient.get('/profile/me');
    return response.data.profile;
  },
  sync: async (userData: { id: string; email: string; role: string }) => {
    const response = await apiClient.post('/profile/sync', userData);
    return response.data.profile;
  },
};

// Courses API
export const coursesApi = {
  getAll: async (): Promise<Course[]> => {
    const response = await apiClient.get('/courses');
    return response.data.courses || [];
  },

  getById: async (id: string): Promise<Course | null> => {
    try {
      const response = await apiClient.get(`/courses/${id}`);
      return response.data.course || null;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  getMyCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get('/courses/my');
    return response.data.courses || [];
  },

  create: async (course: { title: string; description: string; thumbnail?: File }): Promise<Course> => {
    const formData = new FormData();
    formData.append('title', course.title);
    formData.append('description', course.description);
    if (course.thumbnail) {
      formData.append('thumbnail', course.thumbnail);
    }

    const response = await apiClient.post('/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const data = response.data.course;
    return Array.isArray(data) ? data[0] : data;
  },

  update: async (id: string, course: Partial<Course>): Promise<Course> => {
    const response = await apiClient.put(`/courses/${id}`, course);
    return response.data.course;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  },
};

// Batches API
export const batchesApi = {
  getByCourse: async (courseId: string): Promise<Batch[]> => {
    const response = await apiClient.get(`/courses/${courseId}/batches`);
    return Array.isArray(response.data) ? response.data : response.data.batches || [];
  },

  getById: async (id: string): Promise<Batch | null> => {
    try {
      const response = await apiClient.get(`/batches/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  create: async (batch: { course_id: string; start_date: string; end_date: string; price?: number; billing_type?: string }): Promise<Batch> => {
    const response = await apiClient.post('/batches', batch);
    const data = response.data;
    return Array.isArray(data) ? data[0] : data;
  },

  update: async (id: string, batch: Partial<Batch>): Promise<Batch> => {
    const response = await apiClient.put(`/batches/${id}`, batch);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/batches/${id}`);
  },
};

// Enrollments API
export const enrollmentsApi = {
  getMyEnrollments: async (): Promise<Enrollment[]> => {
    const response = await apiClient.get('/enrollments/my');
    return response.data.enrollments || [];
  },

  enroll: async (batchId: string): Promise<Enrollment> => {
    const response = await apiClient.post('/enrollments', { batch_id: batchId });
    return response.data.enrollment;
  },

  unenroll: async (enrollmentId: string): Promise<void> => {
    await apiClient.delete(`/enrollments/${enrollmentId}`);
  },
};

// Live Sessions API
export const liveSessionsApi = {
  getByBatch: async (batchId: string): Promise<LiveSession[]> => {
    const response = await apiClient.get(`/live/batch/${batchId}`);
    const sessions = response.data.liveSessions || [];
    // Map backend format (title, scheduled_at) to frontend (topic, scheduled_time)
    return sessions.map((s: any) => ({
      id: s.id,
      batch_id: s.batch_id,
      topic: s.title || s.topic,
      scheduled_time: s.scheduled_at || s.scheduled_time,
      zoom_meeting_id: s.zoom_meeting_id,
      zoom_join_url: s.zoom_join_url,
      created_at: s.created_at,
    }));
  },

  create: async (session: { batch_id: string; topic: string; scheduled_time: string; description?: string }): Promise<LiveSession> => {
    const response = await apiClient.post('/live', {
      batch_id: session.batch_id,
      title: session.topic,
      description: session.description || session.topic,
      scheduledAt: session.scheduled_time,
    });
    const data = response.data.liveSession;
    return {
      id: data.id,
      batch_id: data.batch_id,
      topic: data.title || data.topic,
      scheduled_time: data.scheduled_at || data.scheduled_time,
      created_at: data.created_at,
    };
  },

  getById: async (sessionId: string): Promise<LiveSession | null> => {
    try {
      const response = await apiClient.get(`/live/${sessionId}`);
      const data = response.data.liveSession;
      if (!data) return null;
      return {
        id: data.id,
        batch_id: data.batch_id,
        topic: data.title || data.topic,
        scheduled_time: data.scheduled_at || data.scheduled_time,
        zoom_meeting_id: data.zoom_meeting_id,
        zoom_join_url: data.zoom_join_url,
        created_at: data.created_at,
      };
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  join: async (sessionId: string): Promise<void> => {
    await apiClient.post(`/live/join/${sessionId}`);
  },

  getJoinCredentials: async (sessionId: string): Promise<{ signature: string; meetingNumber: string; password: string; apiKey: string; userName: string; userEmail?: string }> => {
    const response = await apiClient.post(`/live/join/${sessionId}`);
    return response.data;
  },
};

// Recordings API
export const recordingsApi = {
  getByBatch: async (batchId: string) => {
    const response = await apiClient.get(`/recordings/batch/${batchId}`);
    return response.data.recordings || [];
  },
  getMyRecordings: async () => {
    const response = await apiClient.get('/recordings/me');
    return response.data.recordings || [];
  },
};

// Materials API
export const materialsApi = {
  getByCourse: async (courseId: string): Promise<CourseMaterial[]> => {
    const response = await apiClient.get(`/materials/course/${courseId}`);
    return response.data.materials || [];
  },

  upload: async (courseId: string, title: string, file: File): Promise<CourseMaterial> => {
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('title', title);
    formData.append('file', file);

    const response = await apiClient.post('/materials/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.material;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/materials/${id}`);
  },
};

// Chat API
export const chatApi = {
  getMessages: async (batchId: string, before?: string): Promise<ChatMessage[]> => {
    const params = before ? `?before=${before}&limit=50` : '?limit=50';
    const response = await apiClient.get(`/chat/${batchId}/messages${params}`);
    return response.data || [];
  },

  sendMessage: async (batchId: string, message: string): Promise<ChatMessage> => {
    const response = await apiClient.post(`/chat/${batchId}/messages`, { message });
    return response.data;
  },

  checkAccess: async (batchId: string): Promise<{ hasAccess: boolean; batchInfo: any }> => {
    const response = await apiClient.get(`/chat/${batchId}/access`);
    return response.data;
  },

  getUserChats: async (): Promise<any[]> => {
    const response = await apiClient.get('/chat/my-chats');
    return response.data || [];
  },

  getParticipants: async (batchId: string): Promise<{ batch_id: string; course_name: string; total: number; participants: Array<{ id: string; name: string; role: string; joined_at: string | null }> }> => {
    const response = await apiClient.get(`/batches/${batchId}/participants`);
    return response.data;
  },
};

export default apiClient;
