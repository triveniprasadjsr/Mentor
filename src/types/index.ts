export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profilePhoto?: string;
  dob?: string;
  city?: string;
  state?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Instructor {
  id: string;
  name: string;
  photo: string;
  qualification: string;
  experience: string;
  subjects: string[];
  examExpertise: string[];
  bio: string;
  rating: number;
  totalStudents?: number;
  coursesCount?: number;
  createdAt: string;
}

export type LessonType = 'video' | 'pdf' | 'document' | 'quiz' | 'assignment' | 'link' | 'resource';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number; // 0-indexed
  explanation?: string;
  marks: number;
}

export interface Quiz {
  id: string;
  lessonId: string;
  courseId: string;
  title: string;
  timeLimitMinutes: number;
  totalMarks: number;
  passPercentage: number;
  questions: QuizQuestion[];
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  courseId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  selectedAnswers: Record<string, number>;
  submittedAt: string;
}

export interface Assignment {
  id: string;
  lessonId: string;
  courseId: string;
  title: string;
  instructions: string;
  attachmentUrl?: string;
  totalMarks: number;
  deadline?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  fileUrl: string;
  comments?: string;
  marksAwarded?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
  submittedAt: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  order: number;
  type: LessonType;
  videoUrl?: string;
  videoDuration?: string;
  pdfUrl?: string;
  pagesCount?: number;
  contentText?: string;
  linkUrl?: string;
  downloadable?: boolean;
  isFreePreview: boolean;
  status?: 'active' | 'hidden';
  dripDays?: number;
  releaseDate?: string;
  quizId?: string;
  quizQuestions?: { question: string; options: string[]; correctOption: number; explanation?: string }[];
  quizPassPercent?: number;
  quizTimeLimit?: number;
  assignmentId?: string;
  assignmentInstructions?: string;
  assignmentTotalMarks?: number;
  assignmentDeadline?: string;
  createdAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  parentId?: string; // For nested folders/subsections!
  title: string;
  order: number;
  description?: string;
  thumbnail?: string;
  status?: 'active' | 'hidden' | 'archived';
  visibility?: 'public' | 'enrolled_only';
  availabilityDate?: string;
  lessons: Lesson[];
  subModules?: Module[];
  createdAt: string;
}

export type CourseStatus = 'draft' | 'published' | 'unpublished' | 'archived';
export type CourseVisibility = 'public' | 'private' | 'enrolled_only';
export type CourseType = 'paid' | 'free' | 'subscription';

export interface Course {
  id: string;
  title: string;
  shortName?: string;
  courseCode?: string;
  slug: string;
  subtitle: string;
  description: string;
  shortDescription?: string;
  discipline?: string; // e.g. 'Electrical Engineering'
  category: string; // e.g. 'Electrical', 'Civil', 'Mechanical', 'Non-Technical'
  subcategory?: string;
  exam: string; // e.g. 'SSC JE', 'RRB JE', 'State AE/JE', 'GATE'
  subject: string;
  courseType?: CourseType;
  instructorId: string;
  instructor?: Instructor;
  price: number;
  originalPrice?: number;
  discountPrice: number;
  currency?: string;
  validityType?: 'lifetime' | 'limited';
  validityDays?: number;
  thumbnail: string;
  banner?: string;
  trailerVideoUrl?: string;
  duration: string;
  language: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  visibility?: CourseVisibility;
  requirements: string[];
  learningOutcomes: string[];
  status: CourseStatus;
  isFeatured: boolean;
  // Automatically computed statistics
  modulesCount?: number;
  totalSections?: number;
  lecturesCount?: number;
  totalLectures?: number;
  totalVideos?: number;
  totalPdfs?: number;
  totalNotes?: number;
  totalQuizzes?: number;
  totalAssignments?: number;
  totalDuration?: string;
  materialsCount?: number;
  enrolledStudentsCount?: number;
  completedStudentsCount?: number;
  completionRate?: number;
  rating?: number;
  modules?: Module[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected';
export type PaymentMethod = 'manual_upi' | 'razorpay' | 'stripe';

export interface Payment {
  id: string;
  orderId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  receiptUrl?: string;
  status: PaymentStatus;
  adminNote?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  student?: User;
  courseId: string;
  course?: Course;
  paymentId?: string;
  status: 'active' | 'revoked' | 'expired';
  enrolledAt: string;
  grantedBy: 'payment_approval' | 'manual_admin';
  validityDuration?: string; // e.g. '30 Days', '90 Days', '180 Days', '365 Days', 'Lifetime'
  accessDurationDays?: number; // e.g. 5, 6, 10, 30, 365
  expiresAt?: string; // ISO Date String
  isExpired?: boolean;
  daysRemaining?: number;
  adminOverride?: boolean;
  overrideExpiryDate?: string;
  overrideReason?: string;
  progressPercentage?: number;
}

export interface CourseProgress {
  id: string;
  studentId: string;
  courseId: string;
  completedLessonIds: string[];
  lastAccessedLessonId?: string;
  progressPercentage: number;
  lastAccessedAt: string;
}

export interface Notification {
  id: string;
  userId: string; // user id or 'all' or 'admin'
  title: string;
  message: string;
  link?: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  courseId: string; // course id or 'all'
  courseTitle?: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currencySymbol: string;
  upiId: string;
  upiAccountHolder: string;
  upiQrUrl: string;
  paymentInstructions: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutContent: string;
  privacyPolicy: string;
  termsPolicy: string;
  refundPolicy: string;
  enableManualPayment: boolean;
  enableOnlinePayment: boolean;
  announcementBanner?: string;
  announcementBannerActive?: boolean;
  announcementBannerUrl?: string;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  adminReply?: string;
  repliedAt?: string;
  repliedBy?: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalStudents: number;
  totalCourses: number;
  totalInstructors: number;
  totalEnrollments: number;
  pendingPaymentsCount: number;
  approvedPaymentsCount: number;
  rejectedPaymentsCount: number;
  totalRevenue: number;
  pendingRevenue: number;
  courseSales: { courseTitle: string; enrollmentsCount: number; revenue: number }[];
  recentPayments: Payment[];
  monthlyRevenue: { month: string; revenue: number }[];
}
