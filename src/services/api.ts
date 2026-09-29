import {
  User,
  Course,
  Module,
  Lesson,
  Payment,
  Enrollment,
  CourseProgress,
  Instructor,
  Quiz,
  QuizSubmission,
  Assignment,
  AssignmentSubmission,
  Notification,
  Announcement,
  SiteSettings,
  AuditLog,
  ContactMessage,
  AnalyticsSummary,
} from '../types';

const TOKEN_KEY = 'techsetu_auth_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
};

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorData.message || `Request failed (${res.status})`;
    } catch {
      errorMsg = `Server error (${res.status})`;
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  auth: {
    register: (data: any) => fetchJson<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    login: (data: { identifier: string; password: string }) =>
      fetchJson<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    adminLogin: (data: { email: string; password: string }) =>
      fetchJson<{ user: User; token: string }>('/api/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => fetchJson<{ user: User; unreadNotifs: number }>('/api/auth/me'),
    updateProfile: (data: Partial<User>) =>
      fetchJson<{ user: User }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      fetchJson<{ success: boolean; message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Courses
  courses: {
    list: (params?: { search?: string; category?: string; exam?: string; instructorId?: string; sort?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v) q.set(k, v);
        });
      }
      return fetchJson<{ courses: Course[] }>(`/api/courses?${q.toString()}`);
    },
    getBySlug: (slug: string) =>
      fetchJson<{ course: Course; isEnrolled: boolean; isAdmin: boolean }>(`/api/courses/${slug}`),
    getLearn: (id: string) =>
      fetchJson<{ course: Course; modules: Module[]; progress: CourseProgress; announcements: Announcement[] }>(
        `/api/courses/${id}/learn`
      ),
    create: (data: Partial<Course>) =>
      fetchJson<{ course: Course }>('/api/admin/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Course>) =>
      fetchJson<{ course: Course }>(`/api/admin/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean; softDeleted: boolean; message: string }>(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      }),
    duplicate: (id: string) =>
      fetchJson<{ course: Course; message: string }>(`/api/admin/courses/${id}/duplicate`, {
        method: 'POST',
      }),
    updateStatus: (id: string, status: string) =>
      fetchJson<{ course: Course; message: string }>(`/api/admin/courses/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      }),
    getChecklist: (id: string) =>
      fetchJson<{
        courseId: string;
        courseTitle: string;
        currentStatus: string;
        canPublish: boolean;
        checks: { id: string; label: string; passed: boolean; warning: boolean }[];
      }>(`/api/admin/courses/${id}/publish-checklist`),
    getStudents: (id: string) =>
      fetchJson<{
        courseTitle: string;
        courseId: string;
        totalEnrolled: number;
        students: {
          enrollmentId: string;
          studentId: string;
          name: string;
          email: string;
          phone: string;
          city: string;
          state: string;
          enrolledAt: string;
          grantedBy: string;
          status: string;
          progressPercentage: number;
          completedLessonsCount: number;
          lastAccessedAt: string;
        }[];
      }>(`/api/admin/courses/${id}/students`),
  },

  // Curriculum Builder
  modules: {
    create: (
      courseId: string,
      data: {
        title: string;
        description?: string;
        parentId?: string;
        thumbnail?: string;
        status?: string;
        visibility?: string;
        availabilityDate?: string;
      }
    ) =>
      fetchJson<{ module: Module }>(`/api/admin/courses/${courseId}/modules`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Module>) =>
      fetchJson<{ module: Module }>(`/api/admin/modules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`/api/admin/modules/${id}`, {
        method: 'DELETE',
      }),
    duplicate: (id: string) =>
      fetchJson<{ module: Module; message: string }>(`/api/admin/modules/${id}/duplicate`, {
        method: 'POST',
      }),
    reorder: (courseId: string, moduleIds: string[]) =>
      fetchJson<{ success: boolean }>('/api/admin/modules/reorder', {
        method: 'POST',
        body: JSON.stringify({ courseId, moduleIds }),
      }),
  },

  lessons: {
    create: (moduleId: string, data: Partial<Lesson>) =>
      fetchJson<{ lesson: Lesson }>(`/api/admin/modules/${moduleId}/lessons`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Lesson>) =>
      fetchJson<{ lesson: Lesson }>(`/api/admin/lessons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`/api/admin/lessons/${id}`, {
        method: 'DELETE',
      }),
    reorder: (moduleId: string, lessonIds: string[]) =>
      fetchJson<{ success: boolean }>('/api/admin/lessons/reorder', {
        method: 'POST',
        body: JSON.stringify({ moduleId, lessonIds }),
      }),
  },

  // Progress
  progress: {
    get: (courseId: string) => fetchJson<{ progress: CourseProgress }>(`/api/progress/${courseId}`),
    markLesson: (courseId: string, lessonId: string, completed: boolean) =>
      fetchJson<{ progress: CourseProgress }>('/api/progress/mark-lesson', {
        method: 'POST',
        body: JSON.stringify({ courseId, lessonId, completed }),
      }),
  },

  // Payments & Enrollment
  payments: {
    submitManual: (data: {
      courseId: string;
      amount: number;
      transactionId: string;
      receiptUrl?: string;
      paymentDate?: string;
      studentName?: string;
      studentPhone?: string;
    }) =>
      fetchJson<{ success: boolean; message: string; payment: Payment }>('/api/payments/submit-manual', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getStudentPayments: () => fetchJson<{ payments: Payment[] }>('/api/student/payments'),
    getMyCourses: () =>
      fetchJson<{ myCourses: { enrollment: Enrollment; course: Course; progress: CourseProgress }[] }>(
        '/api/student/my-courses'
      ),
    getAdminPayments: (params?: { status?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.search) q.set('search', params.search);
      return fetchJson<{ payments: Payment[] }>(`/api/admin/payments?${q.toString()}`);
    },
    approve: (id: string, adminNote?: string) =>
      fetchJson<{ success: boolean; payment: Payment; enrollment: Enrollment }>(
        `/api/admin/payments/${id}/approve`,
        {
          method: 'POST',
          body: JSON.stringify({ adminNote }),
        }
      ),
    reject: (id: string, adminNote?: string) =>
      fetchJson<{ success: boolean; payment: Payment }>(`/api/admin/payments/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ adminNote }),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`/api/admin/payments/${id}`, {
        method: 'DELETE',
      }),
  },

  // Enrollments
  enrollments: {
    list: () => fetchJson<{ enrollments: Enrollment[] }>('/api/admin/enrollments'),
    grantManual: (studentId: string, courseId: string, validityDays?: number, enrollmentDate?: string) =>
      fetchJson<{ success: boolean; enrollment: Enrollment }>('/api/admin/enrollments/manual-grant', {
        method: 'POST',
        body: JSON.stringify({ studentId, courseId, validityDays, enrollmentDate }),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`/api/admin/enrollments/${id}`, {
        method: 'DELETE',
      }),
    revoke: (id: string) =>
      fetchJson<{ success: boolean }>(`/api/admin/enrollments/${id}/revoke`, {
        method: 'POST',
      }),
    override: (
      id: string,
      options: { override?: boolean; extendDays?: number; newExpiryDate?: string; reason?: string }
    ) =>
      fetchJson<{ success: boolean; enrollment: Enrollment; message: string }>(
        `/api/admin/enrollments/${id}/override`,
        {
          method: 'POST',
          body: JSON.stringify(options),
        }
      ),
  },

  // Students Directory
  students: {
    list: (search?: string) => {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      return fetchJson<{ students: (User & { activeCoursesCount: number; paymentsCount: number })[] }>(
        `/api/admin/students${q}`
      );
    },
    updateStatus: (id: string, status: 'active' | 'suspended') =>
      fetchJson<{ student: User }>(`/api/admin/students/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  },

  // Instructors
  instructors: {
    list: () => fetchJson<{ instructors: Instructor[] }>('/api/instructors'),
    create: (data: Partial<Instructor>) =>
      fetchJson<{ instructor: Instructor }>('/api/admin/instructors', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Instructor>) =>
      fetchJson<{ instructor: Instructor }>(`/api/admin/instructors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`/api/admin/instructors/${id}`, {
        method: 'DELETE',
      }),
  },

  // Quizzes & Assignments
  quizzes: {
    get: (id: string) => fetchJson<{ quiz: Quiz }>(`/api/quizzes/${id}`),
    submit: (id: string, answers: Record<string, number>) =>
      fetchJson<{ result: QuizSubmission; quiz: Quiz }>(`/api/quizzes/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      }),
  },
  assignments: {
    get: (id: string) => fetchJson<{ assignment: Assignment }>(`/api/assignments/${id}`),
    submit: (id: string, data: { fileUrl: string; comments?: string }) =>
      fetchJson<{ submission: AssignmentSubmission }>(`/api/assignments/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Notifications & Announcements
  notifications: {
    list: () => fetchJson<{ notifications: Notification[] }>('/api/notifications'),
    markRead: (id: string) =>
      fetchJson<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'POST' }),
  },
  announcements: {
    list: (courseId?: string) => {
      const q = courseId ? `?courseId=${courseId}` : '';
      return fetchJson<{ announcements: Announcement[] }>(`/api/announcements${q}`);
    },
    create: (data: { title: string; content: string; courseId?: string }) =>
      fetchJson<{ announcement: Announcement }>('/api/admin/announcements', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Analytics & Reports
  analytics: {
    get: () => fetchJson<{ analytics: AnalyticsSummary }>('/api/admin/analytics'),
  },

  // Settings & Audit
  settings: {
    get: () => fetchJson<{ settings: SiteSettings }>('/api/settings'),
    update: (data: Partial<SiteSettings>) =>
      fetchJson<{ settings: SiteSettings }>('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
  auditLogs: {
    list: () => fetchJson<{ auditLogs: AuditLog[] }>('/api/admin/audit-logs'),
  },
  contact: {
    submit: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
      fetchJson<{ success: boolean; message: string }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: () => fetchJson<{ contactMessages: ContactMessage[] }>('/api/admin/contact-messages'),
    updateStatus: (id: string, status: 'new' | 'read' | 'replied') =>
      fetchJson<{ success: boolean }>(`/api/admin/contact-messages/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    reply: (id: string, reply: string) =>
      fetchJson<{ success: boolean; message: ContactMessage }>(`/api/admin/contact-messages/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply }),
      }),
  },

  // File Upload
  upload: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchJson<{ url: string; filename: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    });
  },
};
