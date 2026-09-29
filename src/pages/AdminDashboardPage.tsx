import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Course,
  Payment,
  Enrollment,
  Instructor,
  SiteSettings,
  AuditLog,
  ContactMessage,
  AnalyticsSummary,
  User,
  Module,
  Lesson,
} from '../types';
import { api } from '../services/api';
import { ReceiptModal } from '../components/ReceiptModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { CourseManagementView } from '../components/admin/courses/CourseManagementView';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  UserCheck,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
  LogOut,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Trash2,
  Edit,
  Eye,
  FileText,
  Key,
  MessageSquare,
  AlertTriangle,
  Layers,
  Video,
  HelpCircle,
  RefreshCw,
  Menu,
  X,
  PanelLeft,
  ArrowRight,
  Sparkles,
  Cloud,
  Globe,
  Copy,
  ExternalLink,
  Terminal,
  GitBranch,
  GitPullRequest,
  Code2,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigateHome: () => void;
  onDataChanged?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateHome, onDataChanged }) => {
  const { user, logout } = useAuth();

  const triggerSync = () => {
    onDataChanged?.();
    window.dispatchEvent(new CustomEvent('techsetu:data-updated'));
    try {
      localStorage.setItem('techsetu_sync_ts', Date.now().toString());
    } catch (e) {}
  };
  const [activeMenu, setActiveMenu] = useState<
    | 'overview'
    | 'courses'
    | 'course-builder'
    | 'payments'
    | 'students'
    | 'enrollments'
    | 'instructors'
    | 'reports'
    | 'announcements'
    | 'messages'
    | 'audit-logs'
    | 'settings'
    | 'profile'
    | 'deployment'
  >('overview');

  // GitHub & Vercel Deployment Hub States
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null);
  const [testingDeployment, setTestingDeployment] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [githubUsername, setGithubUsername] = useState('triveniprasadjsr');
  const [githubRepo, setGithubRepo] = useState('techsetu-lms');
  const [githubBranch, setGithubBranch] = useState('main');
  const [copiedGitCmds, setCopiedGitCmds] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [deployHubTab, setDeployHubTab] = useState<'github-app' | 'github-actions' | 'cli' | 'architecture'>('cli');
  const [gitRepoStatus, setGitRepoStatus] = useState<'existing' | 'fresh'>('existing');

  // Core Data States
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<(User & { activeCoursesCount: number; paymentsCount: number })[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarPopOpen, setSidebarPopOpen] = useState(false);

  // Modals & Action States
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);
  const [rejectModalPayment, setRejectModalPayment] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search & Filters
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<string>('all');
  const [paymentSearch, setPaymentSearch] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Course Builder / Edit State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseFormData, setCourseFormData] = useState<{
    title: string;
    subtitle: string;
    description: string;
    category: string;
    exam: string;
    subject: string;
    instructorId: string;
    price: number;
    discountPrice: number;
    thumbnail: string;
    duration: string;
    language: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
    status: 'draft' | 'published' | 'unpublished' | 'archived';
    isFeatured: boolean;
  }>({
    title: '',
    subtitle: '',
    description: '',
    category: 'Electrical Engineering',
    exam: 'SSC JE',
    subject: 'Complete Technical Core',
    instructorId: 'inst-1',
    price: 1999,
    discountPrice: 1299,
    thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    duration: '120+ Hours',
    language: 'Hinglish',
    difficulty: 'All Levels',
    status: 'published',
    isFeatured: true,
  });

  // Curriculum Builder inside Course
  const [curriculumCourse, setCurriculumCourse] = useState<Course | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessonData, setNewLessonData] = useState({
    moduleId: '',
    title: '',
    type: 'video' as 'video' | 'pdf' | 'document' | 'quiz' | 'assignment',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    videoDuration: '30:00',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    contentText: '',
    isFreePreview: false,
  });

  // New Instructor Form
  const [newInst, setNewInst] = useState({
    name: '',
    qualification: '',
    experience: '',
    subjects: '',
    examExpertise: '',
    bio: '',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  });

  // New Announcement
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    courseId: 'all',
  });

  // Admin Password Change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [adminPwMsg, setAdminPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manual Grant Enrollment Form
  const [grantStudentId, setGrantStudentId] = useState('');
  const [grantCourseId, setGrantCourseId] = useState('');
  const [grantValidityDays, setGrantValidityDays] = useState<number>(30);
  const [grantEnrollmentDate, setGrantEnrollmentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Payment Delete Modal State
  const [deletePaymentModal, setDeletePaymentModal] = useState<Payment | null>(null);
  const [deletePaymentLoading, setDeletePaymentLoading] = useState(false);

  // Enrollment Delete Modal State
  const [deleteEnrollmentModal, setDeleteEnrollmentModal] = useState<Enrollment | null>(null);
  const [deleteEnrollmentLoading, setDeleteEnrollmentLoading] = useState(false);

  // Faculty Delete Modal State
  const [deleteFacultyModal, setDeleteFacultyModal] = useState<Instructor | null>(null);
  const [deleteFacultyLoading, setDeleteFacultyLoading] = useState(false);

  // Student Inquiry Reply State
  const [replyingMessage, setReplyingMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // Instructor Dynamic Edit State
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [editInstForm, setEditInstForm] = useState({
    name: '',
    qualification: '',
    experience: '',
    subjects: '',
    examExpertise: '',
    bio: '',
    photo: '',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        analyticsRes,
        coursesRes,
        paymentsRes,
        studentsRes,
        enrollmentsRes,
        instructorsRes,
        auditLogsRes,
        messagesRes,
        settingsRes,
      ] = await Promise.all([
        api.analytics.get(),
        api.courses.list({ status: '' }), // load all including drafts
        api.payments.getAdminPayments(),
        api.students.list(),
        api.enrollments.list(),
        api.instructors.list(),
        api.auditLogs.list(),
        api.contact.list(),
        api.settings.get(),
      ]);

      setAnalytics(analyticsRes.analytics);
      setCourses(coursesRes.courses);
      setPayments(paymentsRes.payments);
      setStudents(studentsRes.students);
      setEnrollments(enrollmentsRes.enrollments);
      setInstructors(instructorsRes.instructors);
      setAuditLogs(auditLogsRes.auditLogs);
      setMessages(messagesRes.contactMessages);
      setSiteSettings(settingsRes.settings);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    triggerSync();
  };

  // --- Payment Approval / Rejection ---
  const handleApprovePayment = async (paymentId: string) => {
    try {
      await api.payments.approve(paymentId, 'Approved by Administrator');
      setSelectedReceiptPayment(null);
      await loadAllData();
      triggerSync();
      alert('Payment approved and student enrollment granted successfully!');
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleRejectPayment = async () => {
    if (!rejectModalPayment) return;
    try {
      await api.payments.reject(rejectModalPayment.id, rejectReason || 'Payment details could not be matched with bank record.');
      setRejectModalPayment(null);
      setSelectedReceiptPayment(null);
      setRejectReason('');
      await loadAllData();
      triggerSync();
      alert('Payment marked as rejected. Student notified.');
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    }
  };

  // --- Course Creation / Editing ---
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.courses.update(editingCourse.id, courseFormData);
        alert('Course updated successfully!');
      } else {
        await api.courses.create(courseFormData);
        alert('Course created successfully!');
      }
      setEditingCourse(null);
      setActiveMenu('courses');
      await loadAllData();
      triggerSync();
    } catch (err: any) {
      alert(err.message || 'Failed to save course');
    }
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseFormData({
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      category: course.category,
      exam: course.exam,
      subject: course.subject,
      instructorId: course.instructorId,
      price: course.price,
      discountPrice: course.discountPrice,
      thumbnail: course.thumbnail,
      duration: course.duration,
      language: course.language,
      difficulty: course.difficulty,
      status: course.status,
      isFeatured: course.isFeatured,
    });
    setActiveMenu('course-builder');
  };

  const handleDeleteCourse = async () => {
    if (!confirmDeleteCourse) return;
    try {
      setDeleteLoading(true);
      const res = await api.courses.delete(confirmDeleteCourse.id);
      alert(res.message);
      setConfirmDeleteCourse(null);
      await loadAllData();
      triggerSync();
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Curriculum Building ---
  const handleOpenCurriculum = async (c: Course) => {
    try {
      // Reload full course with modules
      const res = await api.courses.getBySlug(c.slug);
      setCurriculumCourse(res.course);
    } catch (err) {
      setCurriculumCourse(c);
    }
  };

  const handleAddModule = async () => {
    if (!curriculumCourse || !newModuleTitle.trim()) return;
    try {
      await api.modules.create(curriculumCourse.id, { title: newModuleTitle.trim() });
      setNewModuleTitle('');
      await handleOpenCurriculum(curriculumCourse);
    } catch (err: any) {
      alert(err.message || 'Failed to add module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) return;
    try {
      await api.modules.delete(moduleId);
      if (curriculumCourse) await handleOpenCurriculum(curriculumCourse);
    } catch (err: any) {
      alert(err.message || 'Failed to delete module');
    }
  };

  const handleAddLesson = async () => {
    if (!curriculumCourse || !newLessonData.moduleId || !newLessonData.title.trim()) {
      alert('Please choose module and provide lecture title');
      return;
    }
    try {
      await api.lessons.create(newLessonData.moduleId, {
        ...newLessonData,
        courseId: curriculumCourse.id,
      });
      setNewLessonData({
        ...newLessonData,
        title: '',
        contentText: '',
      });
      await handleOpenCurriculum(curriculumCourse);
      alert('Lesson added successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to add lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await api.lessons.delete(lessonId);
      if (curriculumCourse) await handleOpenCurriculum(curriculumCourse);
    } catch (err: any) {
      alert(err.message || 'Failed to delete lesson');
    }
  };

  // --- Manual Enrollment Grant ---
  const handleGrantManualEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantStudentId || !grantCourseId) return;
    try {
      await api.enrollments.grantManual(grantStudentId, grantCourseId, grantValidityDays, grantEnrollmentDate);
      alert('Enrollment successfully granted to student with specified duration and start date!');
      setGrantStudentId('');
      setGrantCourseId('');
      setGrantValidityDays(30);
      await loadAllData();
      triggerSync();
    } catch (err: any) {
      alert(err.message || 'Failed to grant enrollment');
    }
  };

  // --- Delete Payment Handler ---
  const handleDeletePayment = async () => {
    if (!deletePaymentModal) return;
    setDeletePaymentLoading(true);
    try {
      await api.payments.delete(deletePaymentModal.id);
      setDeletePaymentModal(null);
      await loadAllData();
      triggerSync();
    } catch (err: any) {
      alert(err.message || 'Failed to delete payment record');
    } finally {
      setDeletePaymentLoading(false);
    }
  };

  // --- Delete Enrollment Handler ---
  const handleDeleteEnrollment = async () => {
    if (!deleteEnrollmentModal) return;
    setDeleteEnrollmentLoading(true);
    try {
      await api.enrollments.delete(deleteEnrollmentModal.id);
      setDeleteEnrollmentModal(null);
      await loadAllData();
      triggerSync();
    } catch (err: any) {
      alert(err.message || 'Failed to delete enrollment record');
    } finally {
      setDeleteEnrollmentLoading(false);
    }
  };

  // --- Delete Faculty Handler ---
  const handleDeleteFaculty = async () => {
    if (!deleteFacultyModal) return;
    setDeleteFacultyLoading(true);
    try {
      await api.instructors.delete(deleteFacultyModal.id);
      setDeleteFacultyModal(null);
      await loadAllData();
      triggerSync();
    } catch (err: any) {
      alert(err.message || 'Failed to delete faculty member');
    } finally {
      setDeleteFacultyLoading(false);
    }
  };

  // --- Send Student Inquiry Reply Handler ---
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingMessage || !replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await api.contact.reply(replyingMessage.id, replyText.trim());
      setMessages((prev) => prev.map((m) => (m.id === replyingMessage.id ? res.message : m)));
      setReplyingMessage(null);
      setReplyText('');
      await loadAllData();
      triggerSync();
    } catch (err: any) {
      alert(err.message || 'Failed to send reply to inquiry');
    } finally {
      setReplyLoading(false);
    }
  };

  // --- Enrollment Validity Override & Extension ---
  const handleToggleEnrollmentOverride = async (enrollmentId: string, currentOverride: boolean) => {
    try {
      await api.enrollments.override(enrollmentId, {
        override: !currentOverride,
        reason: !currentOverride ? 'Granted access override by Administrator' : 'Override removed by Administrator',
      });
      await loadAllData();
      triggerSync();
      alert(!currentOverride ? 'Admin override applied! Student now has active access.' : 'Admin override removed.');
    } catch (err: any) {
      alert(err.message || 'Failed to update enrollment override');
    }
  };

  const handleExtendEnrollment = async (enrollmentId: string, extendDays: number) => {
    try {
      await api.enrollments.override(enrollmentId, {
        extendDays,
        reason: `Extended validity by ${extendDays} days by Administrator`,
      });
      await loadAllData();
      triggerSync();
      alert(`Course validity successfully extended by ${extendDays} days!`);
    } catch (err: any) {
      alert(err.message || 'Failed to extend validity');
    }
  };

  const handleRevokeEnrollment = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to revoke this student enrollment? Access to video lectures, test simulators, and PDFs will be immediately revoked.')) {
      return;
    }
    try {
      await api.enrollments.revoke(enrollmentId);
      await loadAllData();
      triggerSync();
      alert('Enrollment revoked successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to revoke enrollment');
    }
  };

  // --- Student Account Status Toggle ---
  const handleToggleStudentStatus = async (studentId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.students.updateStatus(studentId, nextStatus);
      await loadAllData();
      triggerSync();
    } catch (err: any) {
      alert(err.message || 'Failed to update student status');
    }
  };

  // --- Add Instructor ---
  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.instructors.create({
        name: newInst.name,
        qualification: newInst.qualification,
        experience: newInst.experience,
        subjects: newInst.subjects.split(',').map((s) => s.trim()).filter(Boolean),
        examExpertise: newInst.examExpertise.split(',').map((s) => s.trim()).filter(Boolean),
        bio: newInst.bio,
        photo: newInst.photo,
      });
      alert('Instructor added successfully! Instantly visible on homepage.');
      setNewInst({
        name: '',
        qualification: '',
        experience: '',
        subjects: '',
        examExpertise: '',
        bio: '',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      });
      await loadAllData();
      triggerSync();
    } catch (err: any) {
      alert(err.message || 'Failed to add instructor');
    }
  };

  // --- Edit & Delete Instructor ---
  const handleOpenEditInstructor = (inst: Instructor) => {
    setEditingInstructor(inst);
    setEditInstForm({
      name: inst.name,
      qualification: inst.qualification,
      experience: inst.experience,
      subjects: Array.isArray(inst.subjects) ? inst.subjects.join(', ') : '',
      examExpertise: Array.isArray(inst.examExpertise) ? inst.examExpertise.join(', ') : '',
      bio: inst.bio || '',
      photo: inst.photo || '',
    });
  };

  const handleSaveEditInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstructor) return;
    try {
      await api.instructors.update(editingInstructor.id, {
        name: editInstForm.name,
        qualification: editInstForm.qualification,
        experience: editInstForm.experience,
        subjects: editInstForm.subjects.split(',').map((s) => s.trim()).filter(Boolean),
        examExpertise: editInstForm.examExpertise.split(',').map((s) => s.trim()).filter(Boolean),
        bio: editInstForm.bio,
        photo: editInstForm.photo,
      });
      setEditingInstructor(null);
      await loadAllData();
      triggerSync();
      alert('Instructor profile updated successfully! Changes are instantly live across the platform.');
    } catch (err: any) {
      alert(err.message || 'Failed to update instructor');
    }
  };

  const handleDeleteInstructor = (inst: Instructor) => {
    setDeleteFacultyModal(inst);
  };

  // --- Add Announcement ---
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.announcements.create(newAnnouncement);
      alert('Announcement published successfully! Instantly visible.');
      setNewAnnouncement({ title: '', content: '', courseId: 'all' });
      await loadAllData();
      triggerSync();
    } catch (err: any) {
      alert(err.message || 'Failed to create announcement');
    }
  };

  // --- Update Settings ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings) return;
    try {
      await api.settings.update(siteSettings);
      alert('Platform & CMS settings saved successfully! Instantly live across public homepage and portal.');
      await loadAllData();
      triggerSync();
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    }
  };

  // --- Admin Password Change ---
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setAdminPwMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    try {
      await api.auth.changePassword({ currentPassword: currentPw, newPassword: newPw });
      setAdminPwMsg({ type: 'success', text: 'Admin password changed successfully!' });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err: any) {
      setAdminPwMsg({ type: 'error', text: err.message || 'Failed to change admin password' });
    }
  };

  // --- Vercel Deployment Handlers ---
  const handleTestDeployment = async () => {
    setTestingDeployment(true);
    try {
      const res = await fetch('/api/system/deployment');
      const data = await res.json();
      setDeploymentStatus(data);
    } catch (err: any) {
      setDeploymentStatus({ error: err.message || 'Failed to connect to API endpoint' });
    } finally {
      setTestingDeployment(false);
    }
  };

  const handleCopyEnv = () => {
    const envVars = `NODE_ENV=production
JWT_SECRET=techsetu_super_secret_jwt_2026
ADMIN_EMAIL=${siteSettings?.contactEmail || 'admin@techsetu.com'}
ADMIN_PASSWORD=3234541`;
    navigator.clipboard.writeText(envVars);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const gitTerminalScript =
    gitRepoStatus === 'existing'
      ? `# Step 1: Initialize local Git repository (if not already done)
git init

# Step 2: Stage all project files
git add .

# Step 3: Commit project snapshot
git commit -m "feat: complete TechSetu exam preparation platform"

# Step 4: Ensure default branch is ${githubBranch || 'main'}
git branch -M ${githubBranch || 'main'}

# Step 5: Safely set or update remote origin (prevents 'remote origin already exists' error)
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/${githubUsername || 'your-username'}/${githubRepo || 'techsetu-lms'}.git

# Step 6: Publish and overwrite existing repository contents
# (Solves 'refusing to merge unrelated histories' or existing README)
git push -u origin ${githubBranch || 'main'} --force`
      : `# Step 1: Initialize local Git repository
git init

# Step 2: Stage all project files
git add .

# Step 3: Commit snapshot
git commit -m "feat: complete TechSetu online exam preparation platform"

# Step 4: Rename default branch to ${githubBranch || 'main'}
git branch -M ${githubBranch || 'main'}

# Step 5: Link remote GitHub repository
git remote add origin https://github.com/${githubUsername || 'your-username'}/${githubRepo || 'techsetu-lms'}.git

# Step 6: Push codebase to GitHub
git push -u origin ${githubBranch || 'main'}`;

  const handleCopyGitCmds = () => {
    navigator.clipboard.writeText(gitTerminalScript);
    setCopiedGitCmds(true);
    setTimeout(() => setCopiedGitCmds(false), 2500);
  };

  const githubWorkflowYml = `name: Deploy to Vercel

on:
  push:
    branches:
      - ${githubBranch || 'main'}
  pull_request:
    branches:
      - ${githubBranch || 'main'}

env:
  VERCEL_ORG_ID: \${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: \${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  Deploy-Production:
    if: github.event_name == 'push' && github.ref == 'refs/heads/${githubBranch || 'main'}'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=\${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --prod --token=\${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Production Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=\${{ secrets.VERCEL_TOKEN }}`;

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(githubWorkflowYml);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2500);
  };

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const matchStatus = paymentFilterStatus === 'all' || p.status === paymentFilterStatus;
    const matchSearch =
      !paymentSearch ||
      p.studentName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.studentEmail.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.transactionId.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.orderId.toLowerCase().includes(paymentSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingPayments = payments.filter((p) => p.status === 'pending');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wide">Loading TechSetu Administration Console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-150">
      {/* Mobile Top Navigation Bar with Sidebar Pop Trigger */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarPopOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold transition-all shadow-xs"
            title="Open Admin Sidebar Tabs"
          >
            <PanelLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Admin Tabs</span>
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveMenu('overview')}>
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" />
          <button
            onClick={handleRefresh}
            className={`p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 ${
              refreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SIDEBAR NAVIGATION (DESKTOP) */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 flex-col justify-between transition-colors">
        <div>
          {/* Logo & Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveMenu('overview')}>
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-200 dark:shadow-none">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">Admin</span>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">TechSetu JE/AE</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSidebarPopOpen(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Pop out navigation drawer"
              >
                <PanelLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>
              <ThemeToggle className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" />
              <button
                onClick={handleRefresh}
                className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  refreshing ? 'animate-spin' : ''
                }`}
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveMenu('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === 'overview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & Analytics</span>
            </button>

            <button
              onClick={() => setActiveMenu('payments')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === 'payments'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4" />
                <span>Payment Verification</span>
              </div>
              {pendingPayments.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  {pendingPayments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu('courses')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === 'courses' || activeMenu === 'course-builder'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Course Management</span>
            </button>

            <button
              onClick={() => setActiveMenu('students')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === 'students'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Student Directory</span>
            </button>

            <button
              onClick={() => setActiveMenu('enrollments')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === 'enrollments'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Enrollments</span>
            </button>

            <button
              onClick={() => setActiveMenu('instructors')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === 'instructors'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Instructors / Faculty</span>
            </button>

            <button
              onClick={() => setActiveMenu('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === 'reports'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Sales & Reports</span>
            </button>

            <button
              onClick={() => setActiveMenu('announcements')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === 'announcements'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Announcements</span>
            </button>

            <button
              onClick={() => setActiveMenu('messages')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === 'messages'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Student Inquiries ({messages.filter((m) => m.status === 'new').length})</span>
            </button>

            <button
              onClick={() => setActiveMenu('audit-logs')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === 'audit-logs'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Security Audit Logs</span>
            </button>

            <button
              onClick={() => setActiveMenu('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === 'settings'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Platform Settings</span>
            </button>

            <button
              onClick={() => setActiveMenu('deployment')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeMenu === 'deployment'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Cloud className="w-4 h-4 text-indigo-400" />
              <span className="flex items-center gap-1.5 font-bold">
                GitHub & Vercel
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                  CI/CD
                </span>
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 truncate max-w-[140px]">{user?.email}</span>
            <button
              onClick={() => setActiveMenu('profile')}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
            >
              Profile
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onNavigateHome}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg text-center transition-colors"
            >
              Public Site
            </button>
            <button
              onClick={() => {
                logout();
                onNavigateHome();
              }}
              className="w-full py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================
          SIDEBAR POP TYPE NAVIGATION (ADMIN PANEL DRAWER)
      ============================================================ */}
      {sidebarPopOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop blur */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSidebarPopOpen(false)}
          />

          {/* Slide-out Sidebar Pop Drawer */}
          <aside className="relative w-80 max-w-[85vw] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200 overflow-y-auto">
            <div>
              {/* Header with Logo and Close */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    setActiveMenu('overview');
                    setSidebarPopOpen(false);
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-200 dark:shadow-none">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                      Admin
                    </span>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                      TechSetu JE/AE
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSidebarPopOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs in Sidebar Pop Type */}
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1">
                    Admin Workspaces
                  </span>

                  {[
                    { id: 'overview', label: 'Overview & Analytics', icon: LayoutDashboard },
                    { id: 'payments', label: 'Payment Verification', icon: CreditCard, badge: pendingPayments.length },
                    { id: 'courses', label: 'Course Management', icon: BookOpen },
                    { id: 'students', label: 'Student Directory', icon: Users },
                    { id: 'enrollments', label: 'Enrollments', icon: UserCheck },
                    { id: 'instructors', label: 'Instructors / Faculty', icon: Users },
                    { id: 'reports', label: 'Sales & Reports', icon: BarChart3 },
                    { id: 'announcements', label: 'Announcements', icon: Bell },
                    { id: 'messages', label: 'Student Inquiries', icon: MessageSquare, badge: messages.filter((m) => m.status === 'new').length },
                    { id: 'audit-logs', label: 'Security Audit Logs', icon: FileText },
                    { id: 'settings', label: 'Platform Settings', icon: Settings },
                    { id: 'deployment', label: 'GitHub & Vercel CI/CD', icon: Cloud },
                  ].map((tab) => {
                    const active = activeMenu === tab.id || (tab.id === 'courses' && activeMenu === 'course-builder');
                    const IconComp = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveMenu(tab.id as any);
                          setSidebarPopOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                          active
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComp className="w-4 h-4 shrink-0" />
                          <span>{tab.label}</span>
                        </div>
                        {tab.badge && tab.badge > 0 ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              active ? 'bg-white text-emerald-700' : 'bg-amber-500 text-slate-950'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Link to Public Tabs in Pop Drawer */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1">
                    Public Portal Tabs
                  </span>
                  {[
                    { label: 'Home', path: '/' },
                    { label: 'Courses', path: '/courses' },
                    { label: 'Instructors', path: '/instructors' },
                    { label: 'About', path: '/about' },
                    { label: 'Contact', path: '/contact' },
                  ].map((pTab) => (
                    <button
                      key={pTab.path}
                      onClick={() => {
                        setSidebarPopOpen(false);
                        onNavigateHome();
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span>{pTab.label}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pop Drawer Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                  {user?.email}
                </span>
                <ThemeToggle />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSidebarPopOpen(false);
                    onNavigateHome();
                  }}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl text-center"
                >
                  Public Site
                </button>
                <button
                  onClick={() => {
                    logout();
                    onNavigateHome();
                  }}
                  className="w-full py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN ADMIN WORKSPACE */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-h-screen space-y-8">
        {/* ============================================================
            SECTION 1: OVERVIEW & ANALYTICS
        ============================================================ */}
        {activeMenu === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Platform Overview</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Real-time statistics across enrollments, revenue, and pending verification queues.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveMenu('payments')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  Review {pendingPayments.length} Pending Payments
                </button>
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setActiveMenu('course-builder');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Course
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Revenue Collected</span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹{analytics?.totalRevenue?.toLocaleString('en-IN') || 0}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">From verified enrollments</span>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending Approvals</span>
                <p className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400 mt-1">
                  {analytics?.pendingPaymentsCount || 0}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Awaiting UTR match (₹{analytics?.pendingRevenue?.toLocaleString('en-IN') || 0})
                </span>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Students</span>
                <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {analytics?.totalStudents || 0}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Registered aspirant accounts</span>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Batches</span>
                <p className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 mt-1">
                  {analytics?.totalCourses || 0}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  {analytics?.totalEnrollments || 0} Total enrollments
                </span>
              </div>
            </div>

            {/* Course Revenue Breakdown & Recent Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Course Sales */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue by Engineering Course</h3>
                {analytics?.courseSales && analytics.courseSales.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.courseSales.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{item.courseTitle}</p>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                            {item.enrollmentsCount} Enrolled Students
                          </span>
                        </div>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹{item.revenue.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">No course sales recorded yet.</p>
                )}
              </div>

              {/* Right Recent Verification Queue */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Payment Submissions</h3>
                  <button
                    onClick={() => setActiveMenu('payments')}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {payments.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedReceiptPayment(p)}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{p.studentName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            p.status === 'approved'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : p.status === 'pending'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 truncate">{p.courseTitle}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <span>UTR: {p.transactionId}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">₹{p.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            SECTION 2: PAYMENTS MANAGEMENT
        ============================================================ */}
        {activeMenu === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Manual Payment Verification</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Verify UTR numbers and receipt screenshots against bank statements to activate student course access.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/api/admin/export/payments"
                  download
                  className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </a>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setPaymentFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                      paymentFilterStatus === status
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {status} ({status === 'all' ? payments.length : payments.filter((p) => p.status === status).length})
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student, email, UTR..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Order & Date</th>
                      <th className="px-6 py-3.5">Student</th>
                      <th className="px-6 py-3.5">Course</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Transaction ID / UTR</th>
                      <th className="px-6 py-3.5">Receipt</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono font-bold text-slate-900 dark:text-slate-200">{p.orderId}</p>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {new Date(p.submittedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">{p.studentName}</p>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{p.studentEmail}</span>
                          <span className="block text-[10px] text-slate-400">{p.studentPhone}</span>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                          {p.courseTitle}
                        </td>
                        <td className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400">₹{p.amount}</td>
                        <td className="px-6 py-4">
                          <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-950 text-indigo-700 dark:text-indigo-300 font-mono text-xs select-all border border-slate-200 dark:border-slate-800">
                            {p.transactionId}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          {p.receiptUrl ? (
                            <button
                              onClick={() => setSelectedReceiptPayment(p)}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">UTR only</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              p.status === 'approved'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60'
                                : p.status === 'pending'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {p.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleApprovePayment(p.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setRejectModalPayment(p)}
                                  className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400 capitalize mr-1">{p.status}</span>
                            )}
                            <button
                              onClick={() => setDeletePaymentModal(p)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                              title="Delete Payment Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            SECTION 3: COURSE MANAGEMENT & BUILDER
        ============================================================ */}
        {(activeMenu === 'courses' || activeMenu === 'course-builder') && (
          <CourseManagementView
            courses={courses}
            instructors={instructors}
            allStudents={students}
            onRefreshCourses={handleRefresh}
          />
        )}

        {/* ============================================================
            SECTION 3B: LEGACY COURSE BUILDER (Replaced by CourseManagementView)
        ============================================================ */}
        {false && activeMenu === 'course-builder' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white">
                  {editingCourse ? 'Edit Course' : 'Create New Engineering Course'}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure batch pricing, instructors, examination syllabus and thumbnails.
                </p>
              </div>
              <button
                onClick={() => setActiveMenu('courses')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl"
              >
                Back to Courses
              </button>
            </div>

            <form
              onSubmit={handleSaveCourse}
              className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6"
            >
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Course Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RRB JE 2026: CBT-1 + CBT-2 Technical Master Batch"
                    value={courseFormData.title}
                    onChange={(e) =>
                      setCourseFormData({ ...courseFormData, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Short Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="Complete syllabus coverage with PYQs, formula books and mock test series"
                    value={courseFormData.subtitle}
                    onChange={(e) =>
                      setCourseFormData({ ...courseFormData, subtitle: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    rows={4}
                    value={courseFormData.description}
                    onChange={(e) =>
                      setCourseFormData({ ...courseFormData, description: e.target.value })
                    }
                    className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Category, Exam, Instructor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Discipline / Category
                  </label>
                  <select
                    value={courseFormData.category}
                    onChange={(e) =>
                      setCourseFormData({ ...courseFormData, category: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electrical & Electronics">Electrical & Electronics</option>
                    <option value="General Science & Non-Tech">General Science & Non-Tech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Examination Target
                  </label>
                  <select
                    value={courseFormData.exam}
                    onChange={(e) =>
                      setCourseFormData({ ...courseFormData, exam: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="SSC JE">SSC JE</option>
                    <option value="RRB JE">RRB JE</option>
                    <option value="State AE/JE">State AE/JE</option>
                    <option value="Junior Engineer">Junior Engineer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Assigned Instructor
                  </label>
                  <select
                    value={courseFormData.instructorId}
                    onChange={(e) =>
                      setCourseFormData({ ...courseFormData, instructorId: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.qualification})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={courseFormData.price}
                    onChange={(e) =>
                      setCourseFormData({ ...courseFormData, price: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={courseFormData.discountPrice}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        discountPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-emerald-400 font-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={courseFormData.duration}
                    onChange={(e) =>
                      setCourseFormData({ ...courseFormData, duration: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Status</label>
                  <select
                    value={courseFormData.status}
                    onChange={(e) =>
                      setCourseFormData({ ...courseFormData, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="unpublished">Unpublished</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Thumbnail Image URL
                </label>
                <input
                  type="text"
                  value={courseFormData.thumbnail}
                  onChange={(e) =>
                    setCourseFormData({ ...courseFormData, thumbnail: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveMenu('courses')}
                  className="px-4 py-2.5 bg-slate-800 text-xs font-bold text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-colors"
                >
                  {editingCourse ? 'Save Changes' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================
            SECTION 4: STUDENTS DIRECTORY
        ============================================================ */}
        {activeMenu === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Student Directory</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage registered aspirants, inspect account status, and view active enrollments.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/api/admin/export/students"
                  download
                  className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Students CSV
                </a>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Student</th>
                      <th className="px-6 py-3.5">Contact Details</th>
                      <th className="px-6 py-3.5">Location</th>
                      <th className="px-6 py-3.5">Active Courses</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Account Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{s.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-800 dark:text-slate-200">{s.email}</p>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{s.phone}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {s.city || s.state ? `${s.city || ''}, ${s.state || ''}` : 'Not provided'}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {s.activeCoursesCount} courses
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              s.status === 'active'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleStudentStatus(s.id, s.status)}
                            className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                              s.status === 'active'
                                ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800'
                                : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {s.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            SECTION 5: ENROLLMENTS MANAGEMENT
        ============================================================ */}
        {activeMenu === 'enrollments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Enrollment Access Control</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Inspect student course permissions, grant manual access, or revoke permissions.
                </p>
              </div>

              <a
                href="/api/admin/export/enrollments"
                download
                className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Enrollments CSV
              </a>
            </div>

            {/* Manual Grant Box */}
            <form
              onSubmit={handleGrantManualEnrollment}
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Grant Direct Course Access & Duration:
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Custom validity days & enrollment start date
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Student <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={grantStudentId}
                    onChange={(e) => setGrantStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">Select Student...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Course <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={grantCourseId}
                    onChange={(e) => setGrantCourseId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">Select Course...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Enrollment Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={grantEnrollmentDate}
                    onChange={(e) => setGrantEnrollmentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Course Access Duration (Days)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={-1}
                      required
                      value={grantValidityDays}
                      onChange={(e) => setGrantValidityDays(Number(e.target.value))}
                      placeholder="Days (e.g. 5, 10, 30, 365)"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shrink-0 cursor-pointer transition-colors"
                    >
                      Grant
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Preset Badges */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Presets:</span>
                {[5, 6, 10, 30, 90, 180, 365].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setGrantValidityDays(d)}
                    className={`px-2 py-0.5 rounded-lg font-bold text-[10px] cursor-pointer transition-all ${
                      grantValidityDays === d
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setGrantValidityDays(-1)}
                  className={`px-2 py-0.5 rounded-lg font-bold text-[10px] cursor-pointer transition-all ${
                    grantValidityDays === -1
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Lifetime
                </button>
              </div>
            </form>

            {/* Enrollments Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">Student</th>
                      <th className="px-5 py-3.5">Course</th>
                      <th className="px-4 py-3.5">Validity Duration</th>
                      <th className="px-4 py-3.5">Expiration & Timeline</th>
                      <th className="px-4 py-3.5">Progress</th>
                      <th className="px-4 py-3.5">Access Status</th>
                      <th className="px-5 py-3.5 text-right">Admin Override & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {enrollments.map((e) => {
                      const isExpiredNow = e.isExpired || e.status === 'expired';
                      return (
                        <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-900 dark:text-white">{e.student?.name || e.studentId}</p>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">{e.student?.email}</span>
                          </td>
                          <td className="px-5 py-4 max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                            {e.course?.title || e.courseId}
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {e.validityDuration || (e.expiresAt ? 'Limited' : 'Lifetime')}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {e.expiresAt ? new Date(e.expiresAt).toLocaleDateString() : 'No Expiry (Lifetime)'}
                            </p>
                            {e.daysRemaining !== undefined && (
                              <span
                                className={`text-[10px] font-bold ${
                                  e.daysRemaining <= 0
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : e.daysRemaining <= 15
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {e.daysRemaining > 0 ? `${e.daysRemaining} days left` : 'Validity Expired'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                            {e.progressPercentage || 0}%
                          </td>
                          <td className="px-4 py-4">
                            {e.adminOverride ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800/80">
                                OVERRIDE ACTIVE
                              </span>
                            ) : isExpiredNow ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/80 animate-pulse">
                                EXPIRED
                              </span>
                            ) : e.status === 'active' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60">
                                ACTIVE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                                {e.status}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Override Button */}
                              <button
                                onClick={() => handleToggleEnrollmentOverride(e.id, Boolean(e.adminOverride))}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                                  e.adminOverride
                                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                                }`}
                                title={e.adminOverride ? 'Click to revoke override' : 'Grant permanent access override'}
                              >
                                {e.adminOverride ? 'Disable Override' : 'Override Expiry'}
                              </button>

                              {/* Quick Extensions */}
                              <button
                                onClick={() => handleExtendEnrollment(e.id, 30)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                title="Extend validity by 30 days"
                              >
                                +30d
                              </button>

                              <button
                                onClick={() => handleExtendEnrollment(e.id, 365)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                title="Extend validity by 1 Year (365 days)"
                              >
                                +1y
                              </button>

                              {/* Revoke Button */}
                              <button
                                onClick={() => handleRevokeEnrollment(e.id)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                title="Revoke access"
                              >
                                Revoke
                              </button>

                              {/* Delete Enrollment Button */}
                              <button
                                onClick={() => setDeleteEnrollmentModal(e)}
                                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                                title={isExpiredNow ? "Delete Expired Enrollment Record" : "Delete Enrollment Record"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            SECTION 6: INSTRUCTORS MANAGEMENT
        ============================================================ */}
        {activeMenu === 'instructors' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Faculty & Instructors</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* List */}
              <div className="lg:col-span-7 space-y-4">
                {instructors.map((inst) => (
                  <div
                    key={inst.id}
                    className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start gap-4 justify-between"
                  >
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <img
                        src={inst.photo}
                        alt={inst.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30 dark:ring-emerald-500/40 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">{inst.name}</h3>
                          <span className="text-xs font-bold text-amber-500 dark:text-amber-400">★ {inst.rating}</span>
                        </div>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{inst.qualification}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{inst.experience}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {inst.subjects.map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Action Buttons: Edit and Delete */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditInstructor(inst)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Edit instructor details, experience, subjects, photo and bio"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteInstructor(inst)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800/80 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Delete educator and remove from admin table and public homepage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add form */}
              <form
                onSubmit={handleAddInstructor}
                className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
              >
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Add New Educator</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Er. Rajiv Sharma"
                    value={newInst.name}
                    onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="M.Tech IIT Delhi, Ex-IES"
                    value={newInst.qualification}
                    onChange={(e) => setNewInst({ ...newInst, qualification: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Experience</label>
                  <input
                    type="text"
                    placeholder="12+ Years Teaching Experience"
                    value={newInst.experience}
                    onChange={(e) => setNewInst({ ...newInst, experience: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subjects (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Circuit Theory, Machines, SOM"
                    value={newInst.subjects}
                    onChange={(e) => setNewInst({ ...newInst, subjects: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Photo URL</label>
                  <input
                    type="text"
                    value={newInst.photo}
                    onChange={(e) => setNewInst({ ...newInst, photo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Biography</label>
                  <textarea
                    rows={3}
                    value={newInst.bio}
                    onChange={(e) => setNewInst({ ...newInst, bio: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Create Instructor Profile
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================
            SECTION 7: ANNOUNCEMENTS
        ============================================================ */}
        {activeMenu === 'announcements' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Broadcast Announcements</h1>
            <form
              onSubmit={handleCreateAnnouncement}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 max-w-2xl"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Course
                </label>
                <select
                  value={newAnnouncement.courseId}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, courseId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="all">All Enrolled Students (Global)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Live Doubt Session Rescheduled to Sunday 7 PM"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed announcement content..."
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                Publish Announcement
              </button>
            </form>
          </div>
        )}

        {/* ============================================================
            SECTION 8: CONTACT INQUIRIES & REPLIES
        ============================================================ */}
        {activeMenu === 'messages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Student Inquiries & Messages</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  View admission questions and send direct replies to students.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                  No student inquiries recorded yet.
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {m.name}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                          ({m.email} {m.phone ? `• ${m.phone}` : ''})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {m.status === 'replied' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Replied
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            {m.status || 'New'}
                          </span>
                        )}
                        <span className="text-slate-400 text-[11px]">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {m.subject && (
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        Subject: {m.subject}
                      </p>
                    )}

                    {/* Original Student Inquiry */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Original Inquiry:
                      </span>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {m.message}
                      </p>
                    </div>

                    {/* Admin Reply (if already sent) */}
                    {m.adminReply && (
                      <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Admin Response {m.repliedBy ? `(${m.repliedBy})` : ''}:
                          </span>
                          {m.repliedAt && (
                            <span className="text-emerald-600/80 dark:text-emerald-400/80 font-normal">
                              {new Date(m.repliedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                          {m.adminReply}
                        </p>
                      </div>
                    )}

                    {/* Action: Open Reply Modal */}
                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => {
                          setReplyingMessage(m);
                          setReplyText(m.adminReply || '');
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{m.adminReply ? 'Edit / Send Follow-up' : 'Reply to Inquiry'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================
            SECTION 9: AUDIT LOGS
        ============================================================ */}
        {activeMenu === 'audit-logs' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Administrative Security Audit Logs</h1>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Timestamp</th>
                      <th className="px-6 py-3.5">Admin</th>
                      <th className="px-6 py-3.5">Action</th>
                      <th className="px-6 py-3.5">Target Entity</th>
                      <th className="px-6 py-3.5">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-6 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-3 font-semibold text-slate-900 dark:text-white">{log.adminEmail}</td>
                        <td className="px-6 py-3">
                          <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 rounded text-[11px] font-mono">
                            {log.action}
                          </code>
                        </td>
                        <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                          {log.entityType} ({log.entityId})
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-300 max-w-sm truncate">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            SECTION 10: SETTINGS & COMPREHENSIVE SITE CMS
        ============================================================ */}
        {activeMenu === 'settings' && siteSettings && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Comprehensive Site CMS & Settings</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update public homepage hero headlines, announcement banners, payment UPI details, contact info, and legal policies. Changes sync instantly across the entire platform.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSaveSettings}
              className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 text-xs shadow-sm"
            >
              {/* 1. BRANDING & IDENTITY */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Platform Branding & Identity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Platform Name</label>
                    <input
                      type="text"
                      value={siteSettings.siteName}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, siteName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={siteSettings.tagline}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, tagline: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 2. PUBLIC ANNOUNCEMENT BANNER */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Top Announcement Banner (Public Homepage)
                  </h3>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.announcementBannerActive !== false}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          announcementBannerActive: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                      Banner Active
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Banner Text
                  </label>
                  <input
                    type="text"
                    value={siteSettings.announcementBanner || ''}
                    placeholder="e.g. SSC JE & RRB JE 2026 Comprehensive Master Batches Admissions Open"
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, announcementBanner: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Banner Click Target URL / Path (optional)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.announcementBannerUrl || ''}
                    placeholder="e.g. /courses or /courses/ssc-je-electrical-master-batch-2026"
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, announcementBannerUrl: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* 3. HERO COPY & HEADLINES */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Public Homepage Hero Section
                </h3>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hero Main Headline</label>
                  <input
                    type="text"
                    value={siteSettings.heroTitle || ''}
                    placeholder="e.g. Crack SSC JE & RRB JE on First Attempt."
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, heroTitle: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hero Subtitle & Value Proposition</label>
                  <textarea
                    rows={3}
                    value={siteSettings.heroSubtitle || ''}
                    placeholder="Detailed explanation of features and pedagogy shown right under the headline..."
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* 4. PUBLIC CONTACT INFORMATION */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-extrabold text-sm text-sky-600 dark:text-sky-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Official Student Counseling & Contact Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Counseling Support Email</label>
                    <input
                      type="email"
                      value={siteSettings.contactEmail || ''}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, contactEmail: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Helpline Phone Number</label>
                    <input
                      type="text"
                      value={siteSettings.contactPhone || ''}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, contactPhone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Physical Center / Campus Address</label>
                  <input
                    type="text"
                    value={siteSettings.address || ''}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, address: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* 5. UPI PAYMENT CONFIGURATION */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Manual UPI & QR Code Configuration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">UPI ID for Payments</label>
                    <input
                      type="text"
                      value={siteSettings.upiId}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, upiId: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-emerald-600 dark:text-emerald-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">UPI Account Holder Name</label>
                    <input
                      type="text"
                      value={siteSettings.upiAccountHolder}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, upiAccountHolder: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Instructions to Students</label>
                  <textarea
                    rows={3}
                    value={siteSettings.paymentInstructions}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, paymentInstructions: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* 6. PUBLIC ABOUT & POLICIES */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-extrabold text-sm text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Public About Mission & Institutional Policies
                </h3>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">About Us Mission & Pedagogy</label>
                  <textarea
                    rows={4}
                    value={siteSettings.aboutContent || ''}
                    placeholder="Institutional history, mission, laboratory infrastructure..."
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, aboutContent: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Privacy Policy Summary</label>
                    <textarea
                      rows={3}
                      value={siteSettings.privacyPolicy || ''}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, privacyPolicy: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Terms of Service</label>
                    <textarea
                      rows={3}
                      value={siteSettings.termsPolicy || ''}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, termsPolicy: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Refund & Cancellation Policy</label>
                    <textarea
                      rows={3}
                      value={siteSettings.refundPolicy || ''}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, refundPolicy: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-xs">
                  All updates are broadcast instantly via live event bus to all connected devices.
                </span>
                <button
                  type="submit"
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  Save Settings & Sync Publicly
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================
            SECTION: GITHUB & VERCEL CI/CD DEPLOYMENT HUB
        ============================================================ */}
        {activeMenu === 'deployment' && (
          <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-900 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                    <GitBranch className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                        GitHub & Vercel Continuous Deployment
                      </h1>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Git Ready
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                        Vercel Ready
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Connect your GitHub repository to Vercel for automatic branch previews, pull request testing, and continuous production releases.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://github.com/new?name=${encodeURIComponent(githubRepo)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Create GitHub Repo
                </a>
                <a
                  href={`https://vercel.com/new/import?s=https://github.com/${encodeURIComponent(githubUsername)}/${encodeURIComponent(githubRepo)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Import to Vercel
                </a>
              </div>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">GitHub Integration</span>
                  <GitBranch className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">Push Ready</p>
                <p className="text-[11px] text-slate-500">.github/workflows/ configured</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vercel Preset</span>
                  <Globe className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">Vite + Edge SPA</p>
                <p className="text-[11px] text-slate-500">Static CDN edge distribution</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Serverless Backend</span>
                  <Terminal className="w-4 h-4 text-sky-500" />
                </div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">api/index.ts</p>
                <p className="text-[11px] text-slate-500">Express serverless function</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CI / CD Pipeline</span>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">Auto Deploy</p>
                <p className="text-[11px] text-slate-500">On every git commit & PR</p>
              </div>
            </div>

            {/* Navigation Tabs for Deployment Hub */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              {[
                { id: 'github-app', label: '1. Vercel GitHub App (Zero Config ⭐)', icon: Globe },
                { id: 'cli', label: '2. Git Terminal Pusher', icon: Terminal },
                { id: 'github-actions', label: '3. GitHub Actions CI/CD', icon: GitPullRequest },
                { id: 'architecture', label: '4. Environment & Health Check', icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = deployHubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDeployHubTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      active
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: NATIVE VERCEL GITHUB APP (RECOMMENDED) */}
            {deployHubTab === 'github-app' && (
              <div className="space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        Native GitHub to Vercel Integration (Recommended)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        The easiest, zero-maintenance way to continuously ship TechSetu on every git push.
                      </p>
                    </div>

                    <a
                      href="https://github.com/apps/vercel"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Install Vercel GitHub App
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Push Code to GitHub</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Create an empty repo on GitHub (e.g. <code>techsetu-lms</code>) and push this codebase using our terminal command helper.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Import into Vercel</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Visit <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">vercel.com/new</a>, select your GitHub repository, and click <strong>Import</strong>.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Zero-Config Auto Detection</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Vercel instantly detects <code>vercel.json</code>, configures Vite, maps <code>/api</code> to serverless runtime, and routes SPA URLs to <code>index.html</code>.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        4
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Continuous Deployment</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Every <code>git push origin main</code> deploys immediately to production. Pull requests receive live preview URLs automatically!
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href="https://vercel.com/new"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Vercel New Project Dashboard
                    </a>
                    <button
                      type="button"
                      onClick={() => setDeployHubTab('cli')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Terminal className="w-4 h-4" />
                      View Git Terminal Commands
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE GIT TERMINAL PUSHER */}
            {deployHubTab === 'cli' && (
              <div className="space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-500" />
                        Interactive Git Terminal Pusher
                      </h3>
                      <p className="text-xs text-slate-500">
                        Customize your GitHub repository details below to generate copyable Git commands tailored to your account.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyGitCmds}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedGitCmds ? 'Copied All Commands! 🚀' : 'Copy All Commands'}
                    </button>
                  </div>

                  {/* Repo Type Selector */}
                  <div className="flex flex-wrap items-center gap-3 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setGitRepoStatus('existing')}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center ${
                        gitRepoStatus === 'existing'
                          ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      📁 Repository Already Exists on GitHub
                    </button>
                    <button
                      type="button"
                      onClick={() => setGitRepoStatus('fresh')}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center ${
                        gitRepoStatus === 'fresh'
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      ✨ Brand New Empty Repository
                    </button>
                  </div>

                  {gitRepoStatus === 'existing' && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        Publishing to an Already Existing GitHub Repository
                      </p>
                      <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-400">
                        If your GitHub repository was created with a default <code>README.md</code>, license, or previous files, running <code>git remote remove origin</code> avoids the <em>&quot;remote origin already exists&quot;</em> error, and <code>--force</code> cleanly publishes this application as the authoritative master code.
                      </p>
                    </div>
                  )}

                  {/* Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        GitHub Username / Organization
                      </label>
                      <input
                        type="text"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        placeholder="e.g. triveniprasadjsr"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Repository Name
                      </label>
                      <input
                        type="text"
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        placeholder="e.g. techsetu-lms"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Primary Branch
                      </label>
                      <input
                        type="text"
                        value={githubBranch}
                        onChange={(e) => setGithubBranch(e.target.value)}
                        placeholder="main"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Terminal Block */}
                  <div className="p-4 sm:p-5 bg-slate-950 text-emerald-400 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto space-y-2 select-all leading-relaxed">
                    <p className="text-slate-500"># 1. Initialize local Git repository</p>
                    <p className="text-white font-semibold">git init</p>
                    <p className="text-slate-500 pt-1"># 2. Stage all files (respects .gitignore & .vercelignore)</p>
                    <p className="text-white font-semibold">git add .</p>
                    <p className="text-slate-500 pt-1"># 3. Create commit snapshot</p>
                    <p className="text-white font-semibold">git commit -m &quot;feat: complete TechSetu exam preparation platform&quot;</p>
                    <p className="text-slate-500 pt-1"># 4. Set branch name</p>
                    <p className="text-white font-semibold">git branch -M {githubBranch || 'main'}</p>
                    {gitRepoStatus === 'existing' && (
                      <>
                        <p className="text-slate-500 pt-1"># 5. Clear old origin if set</p>
                        <p className="text-amber-400 font-semibold">git remote remove origin 2&gt;/dev/null || true</p>
                      </>
                    )}
                    <p className="text-slate-500 pt-1"># {gitRepoStatus === 'existing' ? '6' : '5'}. Link GitHub remote repository</p>
                    <p className="text-sky-300 font-semibold">
                      git remote add origin https://github.com/{githubUsername || 'your-username'}/{githubRepo || 'techsetu-lms'}.git
                    </p>
                    <p className="text-slate-500 pt-1"># {gitRepoStatus === 'existing' ? '7' : '6'}. Publish to existing GitHub repo</p>
                    <p className="text-emerald-300 font-bold">
                      git push -u origin {githubBranch || 'main'} {gitRepoStatus === 'existing' ? '--force' : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={`https://github.com/new?name=${encodeURIComponent(githubRepo)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Create Repo on GitHub First
                    </a>
                    <a
                      href={`https://vercel.com/new/import?s=https://github.com/${encodeURIComponent(githubUsername)}/${encodeURIComponent(githubRepo)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Import this Repo on Vercel
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GITHUB ACTIONS CI/CD */}
            {deployHubTab === 'github-actions' && (
              <div className="space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <GitPullRequest className="w-4 h-4 text-indigo-500" />
                        Automated GitHub Actions CI/CD Pipeline
                      </h3>
                      <p className="text-xs text-slate-500">
                        This repository includes <code>.github/workflows/deploy-vercel.yml</code> ready to deploy to Vercel via GitHub Actions.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyWorkflow}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedWorkflow ? 'Copied Workflow YML! 📋' : 'Copy Workflow YML'}
                    </button>
                  </div>

                  {/* Required Secrets Notice */}
                  <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3 text-xs">
                    <h4 className="font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                      <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Required GitHub Actions Repository Secrets
                    </h4>
                    <p className="text-indigo-900 dark:text-indigo-300">
                      If you use GitHub Actions instead of the native Vercel App, add these 3 secrets to your GitHub repo under <strong>Settings &gt; Secrets and variables &gt; Actions</strong>:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/60 space-y-1">
                        <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">VERCEL_TOKEN</p>
                        <p className="text-[11px] text-slate-500">From vercel.com/account/tokens</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/60 space-y-1">
                        <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">VERCEL_ORG_ID</p>
                        <p className="text-[11px] text-slate-500">From .vercel/project.json or Team</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/60 space-y-1">
                        <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">VERCEL_PROJECT_ID</p>
                        <p className="text-[11px] text-slate-500">From .vercel/project.json</p>
                      </div>
                    </div>
                  </div>

                  {/* Workflow File Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono font-semibold">.github/workflows/deploy-vercel.yml</span>
                      <span>Configured for branch: {githubBranch || 'main'}</span>
                    </div>
                    <pre className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-80 overflow-y-auto">
                      {githubWorkflowYml}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ENVIRONMENT VARIABLES & LIVE DIAGNOSTICS */}
            {deployHubTab === 'architecture' && (
              <div className="space-y-6">
                {/* Environment Variables Box */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-500" />
                        Vercel Project Environment Variables
                      </h3>
                      <p className="text-xs text-slate-500">
                        Add these in your Vercel Project Dashboard under <strong>Settings &gt; Environment Variables</strong>.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyEnv}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedEnv ? 'Copied to Clipboard! 🎉' : 'Copy All Env Vars'}
                    </button>
                  </div>

                  <div className="p-4 bg-slate-950 text-slate-300 rounded-2xl font-mono text-xs overflow-x-auto space-y-1 border border-slate-800">
                    <p><span className="text-emerald-400">NODE_ENV</span>=production</p>
                    <p><span className="text-emerald-400">JWT_SECRET</span>=techsetu_super_secret_jwt_2026</p>
                    <p><span className="text-emerald-400">ADMIN_EMAIL</span>={siteSettings?.contactEmail || 'admin@techsetu.com'}</p>
                    <p><span className="text-emerald-400">ADMIN_PASSWORD</span>=3234541</p>
                  </div>
                </div>

                {/* Live Diagnostics & Health Check */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        Live System & Vercel API Diagnostics
                      </h3>
                      <p className="text-xs text-slate-500">
                        Test the serverless API endpoint (/api/system/deployment) and verify real-time responsiveness.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleTestDeployment}
                      disabled={testingDeployment}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingDeployment ? 'animate-spin' : ''}`} />
                      {testingDeployment ? 'Pinging Endpoint...' : 'Run Diagnostics'}
                    </button>
                  </div>

                  {deploymentStatus && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle className="w-4 h-4" />
                        API Endpoint Responded Successfully (Status: 200 OK)
                      </div>
                      <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto">
                        {JSON.stringify(deploymentStatus, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Documentation Reference Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      GITHUB_TO_VERCEL.md
                    </h4>
                    <p className="text-xs text-slate-500">
                      Step-by-step instructions for continuous deployment, PR previews, and setting up repository secrets.
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      DEPLOY_VERCEL.md
                    </h4>
                    <p className="text-xs text-slate-500">
                      Quick manual for Vercel CLI deployments (<code>vercel --prod</code>), environment variables, and architecture.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            SECTION 11: PROFILE & ADMIN PASSWORD CHANGE
        ============================================================ */}
        {activeMenu === 'profile' && (
          <div className="max-w-md mx-auto space-y-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Administrator Security Profile</h1>
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Change Master Admin Password
              </h3>

              {adminPwMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    adminPwMsg.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                  }`}
                >
                  {adminPwMsg.text}
                </div>
              )}

              <form onSubmit={handleChangeAdminPassword} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-400 mb-1">Current Admin Password</label>
                  <input
                    type="password"
                    required
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-400 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  Update Admin Password
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* RECEIPT INSPECTION MODAL */}
      <ReceiptModal
        payment={selectedReceiptPayment}
        onClose={() => setSelectedReceiptPayment(null)}
        onApprove={handleApprovePayment}
        onReject={(paymentId) => {
          const p = payments.find((x) => x.id === paymentId);
          if (p) setRejectModalPayment(p);
        }}
      />

      {/* REJECT PAYMENT REASON MODAL */}
      {rejectModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-rose-600 dark:text-rose-400">Reject Payment Verification</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Provide a note explaining why this payment for "{rejectModalPayment.courseTitle}" was rejected.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. UTR number not found in bank statement, or amount mismatch..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModalPayment(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectPayment}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE COURSE MODAL */}
      <ConfirmationModal
        isOpen={Boolean(confirmDeleteCourse)}
        title="Delete or Archive Course"
        message={
          confirmDeleteCourse
            ? `Are you sure you want to delete "${confirmDeleteCourse.title}"? Note: If students are actively enrolled, the system will safely archive it instead of destroying student access records.`
            : ''
        }
        confirmLabel="Proceed"
        isDestructive={true}
        loading={deleteLoading}
        onConfirm={handleDeleteCourse}
        onCancel={() => setConfirmDeleteCourse(null)}
      />

      {/* CONFIRM DELETE PAYMENT RECORD MODAL */}
      <ConfirmationModal
        isOpen={Boolean(deletePaymentModal)}
        title="Delete Payment Record"
        message={
          deletePaymentModal
            ? `Are you sure you want to delete payment record #${deletePaymentModal.id} (${deletePaymentModal.studentName || 'Student'} • ₹${deletePaymentModal.amount})?\n\nThis will only delete this payment record and will NOT delete any student account, course, or unrelated data.`
            : ''
        }
        confirmLabel="Delete Record"
        isDestructive={true}
        loading={deletePaymentLoading}
        onConfirm={handleDeletePayment}
        onCancel={() => setDeletePaymentModal(null)}
      />

      {/* CONFIRM DELETE ENROLLMENT RECORD MODAL */}
      <ConfirmationModal
        isOpen={Boolean(deleteEnrollmentModal)}
        title="Delete Course Enrollment Record"
        message={
          deleteEnrollmentModal
            ? `Are you sure you want to delete this course enrollment record for "${deleteEnrollmentModal.student?.name || deleteEnrollmentModal.studentId}" in "${deleteEnrollmentModal.course?.title || deleteEnrollmentModal.courseId}"?\n\nThis will remove the course enrollment access only. The student's main account, other courses, and payment records will NOT be deleted.`
            : ''
        }
        confirmLabel="Delete Enrollment"
        isDestructive={true}
        loading={deleteEnrollmentLoading}
        onConfirm={handleDeleteEnrollment}
        onCancel={() => setDeleteEnrollmentModal(null)}
      />

      {/* CONFIRM DELETE FACULTY MODAL */}
      <ConfirmationModal
        isOpen={Boolean(deleteFacultyModal)}
        title="Delete Faculty Member"
        message={
          deleteFacultyModal
            ? `Are you sure you want to delete faculty member "${deleteFacultyModal.name}"?\n\nThis will remove this faculty record from the administration panel and public homepage without affecting any courses, students, or other faculty members.`
            : ''
        }
        confirmLabel="Delete Faculty"
        isDestructive={true}
        loading={deleteFacultyLoading}
        onConfirm={handleDeleteFaculty}
        onCancel={() => setDeleteFacultyModal(null)}
      />

      {/* REPLY TO STUDENT INQUIRY MODAL */}
      {replyingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Reply to Student Inquiry
              </h3>
              <button
                type="button"
                onClick={() => setReplyingMessage(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>{replyingMessage.name}</span>
                <span className="text-slate-400 font-normal">{replyingMessage.email}</span>
              </div>
              {replyingMessage.subject && (
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">{replyingMessage.subject}</p>
              )}
              <p className="text-slate-600 dark:text-slate-300 italic pt-1">{replyingMessage.message}</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Type Your Response <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Dear student, thank you for reaching out..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReplyingMessage(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replyLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {replyLoading ? 'Sending...' : 'Send & Save Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT INSTRUCTOR MODAL */}
      {editingInstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Edit Instructor Profile: {editingInstructor.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingInstructor(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditInstructor} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name & Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editInstForm.name}
                  onChange={(e) => setEditInstForm({ ...editInstForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Qualification / Designation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editInstForm.qualification}
                  onChange={(e) => setEditInstForm({ ...editInstForm, qualification: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teaching Experience
                </label>
                <input
                  type="text"
                  value={editInstForm.experience}
                  onChange={(e) => setEditInstForm({ ...editInstForm, experience: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subjects / Specialties (comma-separated)
                </label>
                <input
                  type="text"
                  value={editInstForm.subjects}
                  onChange={(e) => setEditInstForm({ ...editInstForm, subjects: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Exam Expertise (comma-separated)
                </label>
                <input
                  type="text"
                  value={editInstForm.examExpertise}
                  onChange={(e) => setEditInstForm({ ...editInstForm, examExpertise: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Photo URL
                </label>
                <input
                  type="text"
                  value={editInstForm.photo}
                  onChange={(e) => setEditInstForm({ ...editInstForm, photo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Biography & Background
                </label>
                <textarea
                  rows={4}
                  value={editInstForm.bio}
                  onChange={(e) => setEditInstForm({ ...editInstForm, bio: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingInstructor(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Save Changes & Sync Publicly
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
