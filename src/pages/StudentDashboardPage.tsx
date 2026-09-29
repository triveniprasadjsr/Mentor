import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Course, Enrollment, CourseProgress, Payment, Notification } from '../types';
import { api } from '../services/api';
import { EmptyState } from '../components/EmptyState';
import { Skeleton } from '../components/SkeletonLoader';
import {
  BookOpen,
  Award,
  Clock,
  PlayCircle,
  CreditCard,
  Bell,
  User,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Key,
} from 'lucide-react';

interface StudentDashboardPageProps {
  onLearnCourse: (courseId: string) => void;
  onExploreCourses: () => void;
  initialTab?: string;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({
  onLearnCourse,
  onExploreCourses,
  initialTab = 'my-courses',
}) => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  const [myCourses, setMyCourses] = useState<
    { enrollment: Enrollment; course: Course; progress: CourseProgress }[]
  >([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit States
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editCity, setEditCity] = useState(user?.city || '');
  const [editState, setEditState] = useState(user?.state || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesRes, paymentsRes, notifsRes] = await Promise.all([
        api.payments.getMyCourses(),
        api.payments.getStudentPayments(),
        api.notifications.list(),
      ]);
      setMyCourses(coursesRes.myCourses || []);
      setPayments(paymentsRes.payments || []);
      setNotifications(notifsRes.notifications || []);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileMsg(null);
      await updateProfile({
        name: editName,
        phone: editPhone,
        city: editCity,
        state: editState,
      });
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    try {
      setPwSaving(true);
      setPwMsg(null);
      await api.auth.changePassword({ currentPassword, newPassword });
      setPwMsg({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwMsg(null), 3000);
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setPwSaving(false);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Stats
  const totalEnrolled = myCourses.length;
  const completedCourses = myCourses.filter((c) => (c.progress?.progressPercentage || 0) >= 100).length;
  const activeCourses = totalEnrolled - completedCourses;
  const avgProgress =
    totalEnrolled > 0
      ? Math.round(
          myCourses.reduce((sum, c) => sum + (c.progress?.progressPercentage || 0), 0) / totalEnrolled
        )
      : 0;

  // Recently accessed course
  const recentCourse = myCourses.length > 0 ? myCourses[0] : null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-72"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-400"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 font-black text-2xl flex items-center justify-center ring-2 ring-indigo-400">
              {user?.name?.charAt(0) || 'S'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{user?.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-amber-400 text-slate-900">
                Aspirant
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-1">{user?.email} • {user?.phone}</p>
          </div>
        </div>

        {recentCourse && (
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 max-w-sm w-full">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
              Resume Learning
            </span>
            <p className="text-xs font-bold truncate mt-0.5">{recentCourse.course.title}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-indigo-200">
                {recentCourse.progress?.progressPercentage || 0}% Complete
              </span>
              <button
                onClick={() => onLearnCourse(recentCourse.course.id)}
                className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-lg transition-colors"
              >
                Resume
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Enrolled Courses</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalEnrolled}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">In Progress</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{activeCourses}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completed</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{completedCourses}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Progress</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{avgProgress}%</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 text-sm font-bold text-slate-600 dark:text-slate-400 overflow-x-auto">
        <button
          onClick={() => setActiveTab('my-courses')}
          className={`pb-3 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'my-courses'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-extrabold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          My Courses ({myCourses.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-extrabold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Payment History ({payments.length})
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-extrabold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications ({notifications.filter((n) => !n.read).length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-extrabold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          Profile & Security
        </button>
      </div>

      {/* Tab 1: My Courses */}
      {activeTab === 'my-courses' && (
        <div className="space-y-6">
          {myCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map(({ course, progress, enrollment }) => {
                const percent = progress?.progressPercentage || 0;
                const isExpired = Boolean(enrollment?.isExpired || enrollment?.status === 'expired');
                const hasOverride = Boolean(enrollment?.adminOverride);
                const isAccessRevoked = isExpired && !hasOverride;

                return (
                  <div
                    key={course.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between ${
                      isAccessRevoked
                        ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="aspect-[16/9] w-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            isAccessRevoked ? 'grayscale-[50%] brightness-90' : ''
                          }`}
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold uppercase">
                            {course.exam}
                          </span>
                          {enrollment?.validityDuration && (
                            <span className="px-2 py-0.5 rounded bg-indigo-950/80 backdrop-blur-xs text-indigo-300 text-[10px] font-bold border border-indigo-700/50">
                              {enrollment.validityDuration}
                            </span>
                          )}
                        </div>

                        {/* Top Right Expiry / Override Status Pill */}
                        <div className="absolute top-2 right-2">
                          {hasOverride ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 shadow-xs">
                              OVERRIDE ACTIVE
                            </span>
                          ) : isAccessRevoked ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-xs animate-pulse">
                              EXPIRED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 shadow-xs">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                          {course.title}
                        </h3>

                        {course.instructor && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">Mentor: {course.instructor.name}</p>
                        )}

                        {/* Validity & Expiry Timeline Strip */}
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-[11px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Access Period:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {enrollment?.expiresAt
                                ? `Until ${new Date(enrollment.expiresAt).toLocaleDateString()}`
                                : 'Lifetime Access'}
                            </span>
                          </div>
                          {enrollment?.daysRemaining !== undefined && !hasOverride && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                              <span
                                className={`font-bold ${
                                  isAccessRevoked
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : enrollment.daysRemaining <= 15
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                                }`}
                              >
                                {isAccessRevoked
                                  ? 'Validity Expired'
                                  : `${enrollment.daysRemaining} days remaining`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Expired warning note */}
                        {isAccessRevoked && (
                          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-700 dark:text-rose-300 space-y-0.5">
                            <p className="font-bold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                              Access Revoked Due to Expiry
                            </p>
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 leading-tight">
                              Video lectures, practice tests, and downloadable PDFs are locked. Contact administration or purchase a renewal.
                            </p>
                          </div>
                        )}

                        {/* Progress Bar */}
                        {!isAccessRevoked && (
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-600 dark:text-slate-300">Course Progress</span>
                              <span className="text-indigo-600 dark:text-indigo-400">{percent}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      {isAccessRevoked ? (
                        <button
                          onClick={onExploreCourses}
                          className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Renew / Repurchase Access
                        </button>
                      ) : (
                        <button
                          onClick={() => onLearnCourse(course.id)}
                          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 dark:shadow-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <PlayCircle className="w-4 h-4" />
                          {percent > 0 ? 'Continue Learning' : 'Start Course'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="You haven't enrolled in any courses yet"
              description="Explore our engineering batches for RRB JE, SSC JE, and State AE/JE to begin your preparation."
              actionLabel="Browse Available Courses"
              onAction={onExploreCourses}
            />
          )}
        </div>
      )}

      {/* Tab 2: Payment History */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Submitted Course Orders</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Live payment verification logs</span>
          </div>

          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Course</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Transaction UTR</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">{p.orderId}</td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                        {p.courseTitle}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">₹{p.amount}</td>
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{p.transactionId}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {new Date(p.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            p.status === 'approved'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : p.status === 'pending'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {p.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                          {p.status === 'pending' && <Clock className="w-3 h-3" />}
                          {p.status === 'rejected' && <AlertCircle className="w-3 h-3" />}
                          {p.status.toUpperCase()}
                        </span>
                        {p.adminNote && (
                          <span className="block text-[10px] text-slate-400 mt-1 max-w-xs truncate">
                            Note: {p.adminNote}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No payments submitted yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">System & Course Notifications</h3>
          </div>

          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkNotifRead(n.id)}
                className={`p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                  n.read ? 'bg-white dark:bg-slate-900 opacity-70' : 'bg-indigo-50/30 dark:bg-indigo-950/30'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    n.type === 'success'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                      : n.type === 'alert'
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                      : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">No notifications.</div>
          )}
        </div>
      )}

      {/* Tab 4: Profile & Password */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Profile Details Form */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Personal Information
            </h3>

            {profileMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-400 dark:text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                {profileSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Change Password
            </h3>

            {pwMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  pwMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}
              >
                {pwMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={pwSaving}
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                {pwSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
