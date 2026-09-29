import React, { useState, useEffect } from 'react';
import { Course, User } from '../../../types';
import { api } from '../../../services/api';
import {
  X,
  Users,
  Search,
  UserPlus,
  Trash2,
  CheckCircle,
  Download,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface EnrolledStudentItem {
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
}

interface CourseStudentsModalProps {
  isOpen: boolean;
  course: Course;
  allStudents: User[];
  onClose: () => void;
  onRefreshData: () => void | Promise<void>;
}

export const CourseStudentsModal: React.FC<CourseStudentsModalProps> = ({
  isOpen,
  course,
  allStudents,
  onClose,
  onRefreshData,
}) => {
  const [students, setStudents] = useState<EnrolledStudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [grantStudentId, setGrantStudentId] = useState('');
  const [granting, setGranting] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStudents();
    }
  }, [isOpen, course.id]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.courses.getStudents(course.id);
      setStudents(res.students || []);
    } catch (err) {
      console.error('Failed to load students for course', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleGrantAccess = async () => {
    if (!grantStudentId) return;
    setGranting(true);
    setActionMsg(null);
    try {
      await api.enrollments.grantManual(grantStudentId, course.id);
      setActionMsg('Student granted immediate access.');
      setGrantStudentId('');
      await loadStudents();
      await onRefreshData();
    } catch (err: any) {
      setActionMsg(err.message || 'Failed to grant access');
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (enrollmentId: string, studentName: string) => {
    if (!window.confirm(`Revoke course access for ${studentName}?`)) return;
    try {
      await api.enrollments.revoke(enrollmentId);
      setActionMsg(`Access revoked for ${studentName}.`);
      await loadStudents();
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke access');
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search)
  );

  // Available students not yet actively enrolled
  const enrolledStudentIds = new Set(students.filter((s) => s.status === 'active').map((s) => s.studentId));
  const candidateStudents = allStudents.filter((s) => !enrolledStudentIds.has(s.id));

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Student ID', 'Name', 'Email', 'Phone', 'City', 'Progress %', 'Enrolled Date', 'Status'];
    const rows = students.map((s) => [
      s.studentId,
      s.name,
      s.email,
      s.phone,
      s.city,
      `${s.progressPercentage}%`,
      new Date(s.enrolledAt).toLocaleDateString(),
      s.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${course.courseCode || 'course'}-students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Enrolled Students Roster</h3>
              <p className="text-xs text-slate-400 truncate max-w-md">{course.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action feedback */}
        {actionMsg && (
          <div className="px-6 py-2.5 bg-emerald-950/80 text-emerald-300 text-xs border-b border-emerald-800/40 flex items-center justify-between">
            <span>{actionMsg}</span>
            <button onClick={() => setActionMsg(null)} className="text-[11px] text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Manual Enrollment Strip */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1 w-full">
            <UserPlus className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={grantStudentId}
              onChange={(e) => setGrantStudentId(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select registered student to grant access...</option>
              {candidateStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email}) - {s.phone}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGrantAccess}
            disabled={!grantStudentId || granting}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl disabled:opacity-40 shrink-0 flex items-center justify-center gap-1.5"
          >
            {granting ? 'Granting...' : 'Grant Access'}
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by student name, email, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <span className="text-xs text-slate-400 font-bold shrink-0">
            Total: {students.length} Enrolled
          </span>
        </div>

        {/* Student Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              Loading student roster...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No students found for this course.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((s) => (
                <div
                  key={s.enrollmentId}
                  className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{s.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          s.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-rose-950 text-rose-400'
                        }`}
                      >
                        {s.status}
                      </span>
                      <span className="text-[10px] text-slate-500">via {s.grantedBy}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      {s.email} • {s.phone} {s.city && `• ${s.city}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Progress Bar */}
                    <div className="w-32 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-emerald-400">{s.progressPercentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${s.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 text-right shrink-0">
                      Enrolled: {new Date(s.enrolledAt).toLocaleDateString()}
                    </div>

                    {s.status === 'active' && (
                      <button
                        onClick={() => handleRevoke(s.enrollmentId, s.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                        title="Revoke Student Access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
