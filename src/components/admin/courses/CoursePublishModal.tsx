import React, { useState, useEffect } from 'react';
import { Course } from '../../../types';
import { api } from '../../../services/api';
import {
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Send,
  Eye,
  Archive,
  RefreshCw,
} from 'lucide-react';

interface CoursePublishModalProps {
  isOpen: boolean;
  course: Course;
  onClose: () => void;
  onStatusChanged: (newStatus: Course['status']) => Promise<void>;
}

export const CoursePublishModal: React.FC<CoursePublishModalProps> = ({
  isOpen,
  course,
  onClose,
  onStatusChanged,
}) => {
  const [checklist, setChecklist] = useState<{
    canPublish: boolean;
    checks: { id: string; label: string; passed: boolean; warning: boolean }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadChecklist();
    }
  }, [isOpen, course.id]);

  const loadChecklist = async () => {
    setLoading(true);
    try {
      const res = await api.courses.getChecklist(course.id);
      setChecklist(res);
    } catch (err) {
      console.error('Failed to load checklist', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSetStatus = async (status: Course['status']) => {
    setUpdatingStatus(status);
    try {
      await api.courses.updateStatus(course.id, status);
      await onStatusChanged(status);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update course status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Course Publishing & Readiness</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{course.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Pill */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Current Course State:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              course.status === 'published'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                : course.status === 'draft'
                ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                : course.status === 'unpublished'
                ? 'bg-slate-800 text-slate-300'
                : 'bg-rose-950 text-rose-400 border border-rose-800/60'
            }`}
          >
            ● {course.status}
          </span>
        </div>

        {/* Automated Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Automated Pre-Flight Checklist
            </span>
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />}
          </div>

          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            {checklist?.checks.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-300 flex items-center gap-2">
                  {item.passed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : item.warning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  {item.label}
                </span>

                <span
                  className={`text-[10px] font-bold uppercase ${
                    item.passed
                      ? 'text-emerald-400'
                      : item.warning
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {item.passed ? 'Ready' : item.warning ? 'Notice' : 'Missing'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Transition Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400 block mb-2">Change Course Status:</span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSetStatus('published')}
              disabled={Boolean(updatingStatus) || !checklist?.canPublish}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Publish Course
            </button>

            <button
              onClick={() => handleSetStatus('draft')}
              disabled={Boolean(updatingStatus)}
              className="px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              Set as Draft
            </button>

            <button
              onClick={() => handleSetStatus('unpublished')}
              disabled={Boolean(updatingStatus)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              Unpublish
            </button>

            <button
              onClick={() => handleSetStatus('archived')}
              disabled={Boolean(updatingStatus)}
              className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              Archive Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
