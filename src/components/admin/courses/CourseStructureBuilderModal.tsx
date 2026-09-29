import React, { useState } from 'react';
import { Course, Module, Lesson, LessonType } from '../../../types';
import { api } from '../../../services/api';
import {
  X,
  Layers,
  FolderPlus,
  FilePlus,
  Folder,
  FolderOpen,
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
  Link as LinkIcon,
  Archive,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Download,
  Clock,
  Sparkles,
  ExternalLink,
  Upload,
  Play,
  Film,
} from 'lucide-react';

interface CourseStructureBuilderModalProps {
  isOpen: boolean;
  course: Course;
  onClose: () => void;
  onRefreshCourse: () => void | Promise<void>;
  onPreviewLesson?: (lesson: Lesson) => void;
}

export const CourseStructureBuilderModal: React.FC<CourseStructureBuilderModalProps> = ({
  isOpen,
  course,
  onClose,
  onRefreshCourse,
  onPreviewLesson,
}) => {
  // Expanded sections state
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    course.modules?.forEach((m) => {
      map[m.id] = true;
      m.subModules?.forEach((sub) => {
        map[sub.id] = true;
      });
    });
    return map;
  });

  // Selected Section & Lecture for Two-Panel Layout
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(() => {
    return course.modules?.[0]?.id || null;
  });
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(() => {
    return course.modules?.[0]?.lessons?.[0]?.id || null;
  });

  React.useEffect(() => {
    if (!selectedModuleId && course.modules && course.modules.length > 0) {
      setSelectedModuleId(course.modules[0].id);
      if (!selectedLessonId && course.modules[0].lessons && course.modules[0].lessons.length > 0) {
        setSelectedLessonId(course.modules[0].lessons[0].id);
      }
    }
  }, [course.modules]);

  // Modal / Sub-drawer States
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [parentModuleIdForNew, setParentModuleIdForNew] = useState<string | undefined>(undefined);
  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: '',
    status: 'active' as 'active' | 'hidden' | 'archived',
    visibility: 'public' as 'public' | 'enrolled_only',
    availabilityDate: '',
  });

  // Lesson Creation / Edit Modal
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string>('');
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState<{
    title: string;
    type: LessonType;
    videoUrl: string;
    videoDuration: string;
    pdfUrl: string;
    pagesCount: number;
    contentText: string;
    linkUrl: string;
    downloadable: boolean;
    isFreePreview: boolean;
    status: 'active' | 'hidden';
    dripDays: number;
    quizQuestions: {
      question: string;
      options: string[];
      correctOption: number;
      explanation: string;
      marks: number;
    }[];
    quizTimeLimit: number;
    quizPassPercent: number;
    assignmentInstructions: string;
    assignmentTotalMarks: number;
    assignmentDeadline: string;
  }>({
    title: '',
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    videoDuration: '45:00',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pagesCount: 12,
    contentText: '',
    linkUrl: '',
    downloadable: true,
    isFreePreview: false,
    status: 'active',
    dripDays: 0,
    quizQuestions: [
      {
        question: 'What is the standard unit of magnetic flux in SI system?',
        options: ['Weber', 'Tesla', 'Henry', 'Ampere-turn'],
        correctOption: 0,
        explanation: 'Weber (Wb) is the SI unit of magnetic flux.',
        marks: 1,
      },
    ],
    quizTimeLimit: 15,
    quizPassPercent: 50,
    assignmentInstructions: 'Submit detailed numerical solutions with step-by-step calculations.',
    assignmentTotalMarks: 20,
    assignmentDeadline: '',
  });

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Video & PDF file upload states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState<string>('');
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);

  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState<string>('');
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingVideo(true);
      setVideoUploadError(null);
      setVideoUploadProgress(`Uploading ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);

      // Attempt to automatically extract duration via HTML5 Video element
      if (typeof window !== 'undefined') {
        try {
          const tempVideo = document.createElement('video');
          tempVideo.preload = 'metadata';
          tempVideo.onloadedmetadata = () => {
            window.URL.revokeObjectURL(tempVideo.src);
            const totalSec = Math.floor(tempVideo.duration);
            if (!isNaN(totalSec) && totalSec > 0) {
              const mins = Math.floor(totalSec / 60);
              const secs = totalSec % 60;
              const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
              setLessonForm((prev) => ({ ...prev, videoDuration: formatted }));
            }
          };
          tempVideo.src = URL.createObjectURL(file);
        } catch {
          // ignore duration parsing error
        }
      }

      const res = await api.upload(file);
      setLessonForm((prev) => ({
        ...prev,
        videoUrl: res.url,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));
      setVideoUploadProgress(`Upload complete: ${file.name}`);
    } catch (err: any) {
      setVideoUploadError(err.message || 'Failed to upload video lecture file');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPdf(true);
      setPdfUploadError(null);
      setPdfUploadProgress(`Uploading ${file.name}...`);
      const res = await api.upload(file);
      setLessonForm((prev) => ({
        ...prev,
        pdfUrl: res.url,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));
      setPdfUploadProgress(`Upload complete: ${file.name}`);
    } catch (err: any) {
      setPdfUploadError(err.message || 'Failed to upload PDF notes');
    } finally {
      setUploadingPdf(false);
    }
  };

  if (!isOpen) return null;

  const toggleExpand = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const expandAll = () => {
    const map: Record<string, boolean> = {};
    course.modules?.forEach((m) => {
      map[m.id] = true;
      m.subModules?.forEach((sub) => {
        map[sub.id] = true;
      });
    });
    setExpandedModules(map);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  // --- Section Handlers ---
  const handleOpenAddSection = (parentId?: string) => {
    setEditingModule(null);
    setParentModuleIdForNew(parentId);
    setSectionForm({
      title: '',
      description: '',
      status: 'active',
      visibility: 'public',
      availabilityDate: '',
    });
    setSectionModalOpen(true);
  };

  const handleOpenEditSection = (m: Module) => {
    setEditingModule(m);
    setParentModuleIdForNew(m.parentId);
    setSectionForm({
      title: m.title,
      description: m.description || '',
      status: m.status || 'active',
      visibility: m.visibility || 'public',
      availabilityDate: m.availabilityDate || '',
    });
    setSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.title.trim()) return;

    setLoadingAction('save-section');
    try {
      if (editingModule) {
        await api.modules.update(editingModule.id, {
          title: sectionForm.title.trim(),
          description: sectionForm.description.trim(),
          status: sectionForm.status,
          visibility: sectionForm.visibility,
          availabilityDate: sectionForm.availabilityDate || undefined,
        });
        setActionMessage({ type: 'success', text: `Section "${sectionForm.title}" updated.` });
      } else {
        await api.modules.create(course.id, {
          title: sectionForm.title.trim(),
          description: sectionForm.description.trim(),
          parentId: parentModuleIdForNew,
          status: sectionForm.status,
          visibility: sectionForm.visibility,
          availabilityDate: sectionForm.availabilityDate || undefined,
        });
        setActionMessage({ type: 'success', text: `Section "${sectionForm.title}" created.` });
      }
      setSectionModalOpen(false);
      await onRefreshCourse();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to save section' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteSection = async (modId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete section "${title}" and all its lessons?`)) {
      return;
    }
    setLoadingAction(`del-mod-${modId}`);
    try {
      await api.modules.delete(modId);
      setActionMessage({ type: 'success', text: `Section "${title}" removed.` });
      await onRefreshCourse();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to delete section' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDuplicateSection = async (modId: string) => {
    setLoadingAction(`dup-mod-${modId}`);
    try {
      await api.modules.duplicate(modId);
      setActionMessage({ type: 'success', text: 'Section duplicated with all lessons.' });
      await onRefreshCourse();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to duplicate section' });
    } finally {
      setLoadingAction(null);
    }
  };

  // Reorder Sections
  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const modules = [...(course.modules || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= modules.length) return;

    const temp = modules[index];
    modules[index] = modules[targetIdx];
    modules[targetIdx] = temp;

    setLoadingAction('reorder-modules');
    try {
      await api.modules.reorder(
        course.id,
        modules.map((m) => m.id)
      );
      await onRefreshCourse();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to reorder' });
    } finally {
      setLoadingAction(null);
    }
  };

  // --- Lesson Handlers ---
  const handleOpenAddLesson = (modId: string) => {
    setTargetModuleId(modId);
    setEditingLesson(null);
    setLessonForm({
      title: '',
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      videoDuration: '45:00',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pagesCount: 10,
      contentText: '',
      linkUrl: '',
      downloadable: true,
      isFreePreview: false,
      status: 'active',
      dripDays: 0,
      quizQuestions: [
        {
          question: 'What is the standard unit of magnetic flux in SI system?',
          options: ['Weber', 'Tesla', 'Henry', 'Ampere-turn'],
          correctOption: 0,
          explanation: 'Weber (Wb) is the SI unit of magnetic flux.',
          marks: 1,
        },
      ],
      quizTimeLimit: 15,
      quizPassPercent: 50,
      assignmentInstructions: 'Submit detailed numerical solutions with step-by-step calculations.',
      assignmentTotalMarks: 20,
      assignmentDeadline: '',
    });
    setLessonModalOpen(true);
  };

  const handleOpenEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setTargetModuleId(lesson.moduleId);
    setLessonForm({
      title: lesson.title,
      type: lesson.type,
      videoUrl: lesson.videoUrl || '',
      videoDuration: lesson.videoDuration || '30:00',
      pdfUrl: lesson.pdfUrl || '',
      pagesCount: lesson.pagesCount || 8,
      contentText: lesson.contentText || '',
      linkUrl: lesson.linkUrl || '',
      downloadable: lesson.downloadable !== false,
      isFreePreview: Boolean(lesson.isFreePreview),
      status: lesson.status || 'active',
      dripDays: lesson.dripDays || 0,
      quizQuestions: [
        {
          question: 'Sample Quiz Question 1?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctOption: 0,
          explanation: 'Correct explanation',
          marks: 1,
        },
      ],
      quizTimeLimit: 15,
      quizPassPercent: 50,
      assignmentInstructions: 'Complete the questions and attach PDF.',
      assignmentTotalMarks: 20,
      assignmentDeadline: '',
    });
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) return;

    setLoadingAction('save-lesson');
    try {
      const payload: Partial<Lesson> = {
        title: lessonForm.title.trim(),
        type: lessonForm.type,
        videoUrl: lessonForm.type === 'video' ? lessonForm.videoUrl : undefined,
        videoDuration: lessonForm.type === 'video' ? lessonForm.videoDuration : undefined,
        pdfUrl: lessonForm.type === 'pdf' ? lessonForm.pdfUrl : undefined,
        pagesCount: lessonForm.type === 'pdf' ? Number(lessonForm.pagesCount) : undefined,
        contentText: lessonForm.type === 'document' ? lessonForm.contentText : undefined,
        linkUrl: lessonForm.type === 'link' ? lessonForm.linkUrl : undefined,
        downloadable: lessonForm.downloadable,
        isFreePreview: lessonForm.isFreePreview,
        status: lessonForm.status,
        dripDays: lessonForm.dripDays ? Number(lessonForm.dripDays) : undefined,
      };

      if (editingLesson) {
        await api.lessons.update(editingLesson.id, payload);
        setActionMessage({ type: 'success', text: `Lesson "${lessonForm.title}" updated.` });
      } else {
        await api.lessons.create(targetModuleId, {
          ...payload,
          courseId: course.id,
        });
        setActionMessage({ type: 'success', text: `Lesson "${lessonForm.title}" added.` });
      }
      setLessonModalOpen(false);
      await onRefreshCourse();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to save lesson' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (!window.confirm(`Delete lecture "${title}"?`)) return;
    setLoadingAction(`del-les-${lessonId}`);
    try {
      await api.lessons.delete(lessonId);
      setActionMessage({ type: 'success', text: `Lecture "${title}" deleted.` });
      await onRefreshCourse();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to delete lesson' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMoveLesson = async (
    moduleId: string,
    lessonList: Lesson[],
    index: number,
    direction: 'up' | 'down'
  ) => {
    const list = [...lessonList];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    setLoadingAction(`reorder-lessons-${moduleId}`);
    try {
      await api.lessons.reorder(
        moduleId,
        list.map((l) => l.id)
      );
      await onRefreshCourse();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to reorder lessons' });
    } finally {
      setLoadingAction(null);
    }
  };

  // Helper for content icon
  const getContentIcon = (type: LessonType) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-indigo-400" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case 'assignment':
        return <ClipboardList className="w-4 h-4 text-blue-400" />;
      case 'link':
        return <LinkIcon className="w-4 h-4 text-teal-400" />;
      case 'resource':
        return <Archive className="w-4 h-4 text-purple-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  // Active selection for two-panel layout
  const activeModule = course.modules?.find((m) => m.id === selectedModuleId) || course.modules?.[0];
  let activeLesson: Lesson | undefined;

  for (const m of course.modules || []) {
    const found = m.lessons?.find((l) => l.id === selectedLessonId);
    if (found) {
      activeLesson = found;
      break;
    }
    for (const sub of m.subModules || []) {
      const subFound = sub.lessons?.find((l) => l.id === selectedLessonId);
      if (subFound) {
        activeLesson = subFound;
        break;
      }
    }
  }

  if (!activeLesson && activeModule?.lessons?.[0]) {
    activeLesson = activeModule.lessons[0];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-7xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col transition-colors">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Course Structure Builder
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                  {course.courseCode || course.id}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white truncate max-w-xl">
                {course.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddSection()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-200 dark:shadow-emerald-950 transition-all cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              + Add Section
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Status Notification */}
        {actionMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-800/40'
                : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-b border-rose-200 dark:border-rose-800/40'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-[11px]"
            >
              ✕
            </button>
          </div>
        )}

        {/* TWO-PANEL MAIN WORKSPACE */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">

          {/* ==========================================================
              LEFT PANEL: Course Structure / Sections / Lectures Hierarchy
          ========================================================== */}
          <div className="w-full lg:w-5/12 xl:w-5/12 flex flex-col bg-slate-50/70 dark:bg-slate-950/40 overflow-hidden">
            {/* Hierarchy Toolbar */}
            <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px]">View:</span>
                <button
                  onClick={expandAll}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] cursor-pointer"
                >
                  Collapse All
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Folder className="w-3.5 h-3.5 text-amber-500" />
                  <strong className="text-slate-900 dark:text-white">{course.modules?.length || 0}</strong> Sections
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-indigo-500" />
                  <strong className="text-slate-900 dark:text-white">
                    {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0}
                  </strong> Lectures
                </span>
              </div>
            </div>

            {/* Tree Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(!course.modules || course.modules.length === 0) ? (
                <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <FolderPlus className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Sections Yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Add your first section to organize course chapters and lectures.
                  </p>
                  <button
                    onClick={() => handleOpenAddSection()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Section
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {course.modules.map((module, modIdx) => {
                    const isExpanded = Boolean(expandedModules[module.id]);
                    const lessonCount = module.lessons?.length || 0;
                    const isModuleSelected = activeModule?.id === module.id;

                    return (
                      <div
                        key={module.id}
                        className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-xs transition-all ${
                          isModuleSelected
                            ? 'border-emerald-300 dark:border-emerald-700/80 ring-1 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {/* Section Header Row */}
                        <div
                          className={`p-3 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            isModuleSelected
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                          onClick={() => {
                            setSelectedModuleId(module.id);
                            if (module.lessons && module.lessons.length > 0 && !module.lessons.some((l) => l.id === selectedLessonId)) {
                              setSelectedLessonId(module.lessons[0].id);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(module.id);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>

                            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-500/20">
                              {isExpanded ? (
                                <FolderOpen className="w-4 h-4" />
                              ) : (
                                <Folder className="w-4 h-4" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                  Section {modIdx + 1}
                                </span>
                                <span className="text-slate-900 dark:text-white font-bold text-xs truncate">
                                  {module.title}
                                </span>
                                {module.status === 'hidden' && (
                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-semibold flex items-center gap-0.5">
                                    <EyeOff className="w-2.5 h-2.5" />
                                    Hidden
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Section Action Controls */}
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                              {lessonCount}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleOpenAddLesson(module.id)}
                              className="px-2 py-1 bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Add Lesson to this Section"
                            >
                              <FilePlus className="w-3 h-3" />
                              <span>+ Lesson</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditSection(module)}
                              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Edit Section"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSection(module.id, module.title)}
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Delete Section"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Content Area */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 p-2.5 space-y-2">
                            {/* Nested Submodules */}
                            {module.subModules && module.subModules.length > 0 && (
                              <div className="space-y-1.5 pl-3 border-l-2 border-indigo-400/40">
                                {module.subModules.map((sub) => (
                                  <div
                                    key={sub.id}
                                    className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <Folder className="w-3 h-3 text-indigo-500" />
                                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                                        {sub.title}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleOpenAddLesson(sub.id)}
                                      className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded"
                                    >
                                      + Lesson
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Lessons List in this Module */}
                            {(!module.lessons || module.lessons.length === 0) ? (
                              <div className="py-4 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                No lectures yet. Click "+ Lesson" to add video, PDF, or quiz.
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {module.lessons.map((lesson, lesIdx) => {
                                  const isSelected = activeLesson?.id === lesson.id;
                                  return (
                                    <div
                                      key={lesson.id}
                                      onClick={() => {
                                        setSelectedLessonId(lesson.id);
                                        setSelectedModuleId(module.id);
                                      }}
                                      className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-2 text-xs cursor-pointer transition-all ${
                                        isSelected
                                          ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-600 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-500/20 shadow-xs'
                                          : 'bg-white dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                        <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                                          {getContentIcon(lesson.type)}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-1.5">
                                            <span className={`font-semibold truncate ${isSelected ? 'text-indigo-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                                              {lesson.title}
                                            </span>
                                            {lesson.isFreePreview && (
                                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[9px] font-black uppercase">
                                                Free
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                            <span className="uppercase font-mono font-medium">
                                              {lesson.type}
                                            </span>
                                            {lesson.videoDuration && (
                                              <span>• {lesson.videoDuration}</span>
                                            )}
                                            {lesson.pagesCount && (
                                              <span>• {lesson.pagesCount} Pages</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Reorder and Quick Actions */}
                                      <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          type="button"
                                          onClick={() => handleMoveLesson(module.id, module.lessons, lesIdx, 'up')}
                                          disabled={lesIdx === 0}
                                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20"
                                          title="Move Up"
                                        >
                                          <ArrowUp className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleMoveLesson(module.id, module.lessons, lesIdx, 'down')}
                                          disabled={lesIdx === module.lessons.length - 1}
                                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20"
                                          title="Move Down"
                                        >
                                          <ArrowDown className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditLesson(lesson)}
                                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300"
                                          title="Edit Lesson"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                                          title="Delete Lesson"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ==========================================================
              RIGHT PANEL: Selected Lecture / Video / Content Details
          ========================================================== */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto p-6 space-y-6">
            {activeLesson ? (
              <div className="space-y-6 max-w-3xl">
                {/* Lecture Header Banner */}
                <div className="p-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800/60">
                        {getContentIcon(activeLesson.type)}
                        <span>{activeLesson.type} Lecture</span>
                      </span>

                      {activeLesson.isFreePreview && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/60">
                          Free Preview
                        </span>
                      )}

                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Section: <strong>{activeModule?.title}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditLesson(activeLesson!)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Content</span>
                      </button>

                      {onPreviewLesson && (
                        <button
                          onClick={() => onPreviewLesson(activeLesson!)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Student View</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteLesson(activeLesson!.id, activeLesson!.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                        title="Delete Lecture"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {activeLesson.title}
                    </h3>
                    {activeLesson.videoDuration && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Estimated Duration: <strong>{activeLesson.videoDuration}</strong></span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Video Player Display (if video) */}
                {activeLesson.type === 'video' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 shadow-md">
                      {activeLesson.videoUrl ? (
                        <video
                          key={activeLesson.id}
                          controls
                          poster={course.thumbnail}
                          src={activeLesson.videoUrl}
                          className="w-full aspect-video object-contain bg-black"
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="aspect-video flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                          <Film className="w-12 h-12 text-slate-600" />
                          <p className="text-sm font-semibold">No video URL configured</p>
                          <p className="text-xs text-slate-500 max-w-sm">
                            Click "Edit Content" above to upload an MP4 lecture or specify a video link.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span className="font-semibold">Direct Video Stream URL:</span>
                        <span className="font-mono text-[11px] truncate max-w-xs">{activeLesson.videoUrl || 'None'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PDF Document Display (if pdf) */}
                {activeLesson.type === 'pdf' && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/40">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {activeLesson.title} (PDF Document)
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {activeLesson.pagesCount ? `${activeLesson.pagesCount} Pages • ` : ''}
                        {activeLesson.downloadable ? 'Downloadable for enrolled students' : 'Read-only view'}
                      </p>
                    </div>
                    {activeLesson.pdfUrl && (
                      <div className="pt-2">
                        <a
                          href={activeLesson.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open PDF Document</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz Display (if quiz) */}
                {activeLesson.type === 'quiz' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/40 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-amber-800 dark:text-amber-300 block">
                          Practice Quiz Assessment
                        </span>
                        <span className="text-[11px] text-amber-700 dark:text-amber-400">
                          {activeLesson.quizQuestions?.length || 0} Questions • Passing: {activeLesson.quizPassPercent || 50}% • Time: {activeLesson.quizTimeLimit || 15} Mins
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-lg text-xs font-bold">
                        Interactive
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(activeLesson.quizQuestions || []).map((q, qIdx) => (
                        <div key={qIdx} className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                          <p className="font-bold text-slate-900 dark:text-white">
                            Q{qIdx + 1}: {q.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-lg border text-[11px] ${
                                  oIdx === q.correctOption
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}. {opt}
                                {oIdx === q.correctOption && ' (Correct)'}
                              </div>
                            ))}
                          </div>
                          {q.explanation && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200 dark:border-slate-800">
                              Explanation: {q.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignment Display */}
                {activeLesson.type === 'assignment' && (
                  <div className="p-6 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/40 space-y-3 text-xs">
                    <span className="font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider block">
                      Engineering Assignment Submission
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeLesson.assignmentInstructions || 'Complete homework problems and submit your solution.'}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-blue-200 dark:border-blue-900/40">
                      <span>Total Marks: <strong>{activeLesson.assignmentTotalMarks || 20}</strong></span>
                      {activeLesson.assignmentDeadline && (
                        <span>Deadline: <strong>{new Date(activeLesson.assignmentDeadline).toLocaleDateString()}</strong></span>
                      )}
                    </div>
                  </div>
                )}

                {/* Digital Document / Study Notes */}
                {(activeLesson.type === 'document' || activeLesson.contentText) && (
                  <div className="p-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                      Study Material & Notes
                    </span>
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {activeLesson.contentText || 'No study notes attached to this lesson.'}
                    </div>
                  </div>
                )}

                {/* External Link */}
                {activeLesson.type === 'link' && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-center">
                    <LinkIcon className="w-8 h-8 mx-auto text-teal-500" />
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">External Reference Resource</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono break-all">{activeLesson.linkUrl}</p>
                    {activeLesson.linkUrl && (
                      <a
                        href={activeLesson.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Visit Resource</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-24 text-center space-y-3 m-auto">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No Lecture Selected
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Select a lecture or section from the left navigation panel to view its video lecture, notes, and curriculum content.
                </p>
                {activeModule && (
                  <button
                    onClick={() => handleOpenAddLesson(activeModule.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <FilePlus className="w-4 h-4" />
                    + Add Lesson to "{activeModule.title}"
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Changes to course structure are automatically synchronized to enrolled students in real time.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Done Editing
          </button>
        </div>
      </div>

      {/* ============================================================
          SUB-MODAL 1: ADD / EDIT SECTION MODAL
      ============================================================ */}
      {sectionModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {editingModule
                  ? 'Edit Section / Module'
                  : parentModuleIdForNew
                  ? 'Add Nested Subfolder'
                  : 'Add New Section'}
              </h3>
              <button
                onClick={() => setSectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Name / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Power System or Basic Electronics"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Summary of syllabus covered in this section..."
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section Status</label>
                  <select
                    value={sectionForm.status}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="hidden">Hidden</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Visibility</label>
                  <select
                    value={sectionForm.visibility}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, visibility: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="public">Public</option>
                    <option value="enrolled_only">Enrolled Only</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction === 'save-section'}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {loadingAction === 'save-section' ? 'Saving...' : 'Save Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-MODAL 2: ADD / EDIT LESSON & CONTENT MODAL (7 TYPES)
      ============================================================ */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 my-6 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingLesson ? 'Edit Lesson Content' : 'Add Content / Lecture to Section'}
              </h3>
              <button
                onClick={() => setLessonModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Content / Lecture Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lecture 1 – Introduction to Power System"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Content Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Content Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'video', label: 'Video Lecture', icon: Video },
                      { id: 'pdf', label: 'PDF Notes', icon: FileText },
                      { id: 'document', label: 'Digital Notes', icon: FileText },
                      { id: 'quiz', label: 'Quiz', icon: HelpCircle },
                      { id: 'assignment', label: 'Assignment', icon: ClipboardList },
                      { id: 'link', label: 'External Link', icon: LinkIcon },
                      { id: 'resource', label: 'ZIP / Resource', icon: Archive },
                    ] as const
                  ).map((t) => {
                    const IconComp = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setLessonForm({ ...lessonForm, type: t.id })}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          lessonForm.type === t.id
                            ? 'bg-emerald-50 dark:bg-emerald-600/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SPECIFIC FIELDS BY CONTENT TYPE */}
              {lessonForm.type === 'video' && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Film className="w-4 h-4" />
                      Video Lecture Settings & Direct Upload
                    </span>
                    <span className="text-[10px] text-slate-400">Max file size: 500MB</span>
                  </div>

                  {/* Direct Video Upload Dropzone */}
                  <div className="p-4 rounded-xl border-2 border-dashed border-indigo-900/60 bg-indigo-950/20 hover:border-indigo-500/80 transition-all text-center space-y-2">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-1">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-200">
                        Upload Video Lecture File from Computer
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supports MP4, WebM, MOV, MKV, AVI (up to 500MB)
                      </p>
                    </div>

                    <label className="inline-block mt-2">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,video/*"
                        disabled={uploadingVideo}
                        onChange={handleVideoFileUpload}
                        className="hidden"
                      />
                      <span className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors">
                        {uploadingVideo ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Uploading Video...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            Browse & Upload Video Lecture
                          </>
                        )}
                      </span>
                    </label>

                    {videoUploadProgress && (
                      <p className="text-[11px] text-emerald-400 font-semibold pt-1">
                        {videoUploadProgress}
                      </p>
                    )}

                    {videoUploadError && (
                      <p className="text-[11px] text-rose-400 font-semibold pt-1">
                        {videoUploadError}
                      </p>
                    )}
                  </div>

                  {/* Video URL & Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Video Stream URL or Storage Path <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. /uploads/video.mp4 or https://youtube.com/watch?v=..."
                        value={lessonForm.videoUrl}
                        onChange={(e) =>
                          setLessonForm({ ...lessonForm, videoUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Duration (hh:mm / mm:ss)</label>
                      <input
                        type="text"
                        placeholder="45:00"
                        value={lessonForm.videoDuration}
                        onChange={(e) =>
                          setLessonForm({ ...lessonForm, videoDuration: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Live Video Preview in Modal */}
                  {lessonForm.videoUrl && (
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Lecture Video Live Preview:
                      </span>
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black max-h-[220px]">
                        {lessonForm.videoUrl.includes('youtube.com') || lessonForm.videoUrl.includes('youtu.be') ? (
                          <iframe
                            src={
                              lessonForm.videoUrl.includes('watch?v=')
                                ? `https://www.youtube.com/embed/${new URL(lessonForm.videoUrl).searchParams.get('v')}?rel=0`
                                : `https://www.youtube.com/embed/${lessonForm.videoUrl.split('youtu.be/')[1]?.split('?')[0]}?rel=0`
                            }
                            className="w-full h-full border-0"
                            title="Video Preview"
                          />
                        ) : (
                          <video
                            src={lessonForm.videoUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {lessonForm.type === 'pdf' && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      PDF Document / Study Notes
                    </span>
                    <span className="text-[10px] text-slate-400">Direct PDF Upload</span>
                  </div>

                  {/* Direct PDF Upload */}
                  <div className="p-3.5 rounded-xl border-2 border-dashed border-rose-900/60 bg-rose-950/20 hover:border-rose-500/80 transition-all text-center space-y-1.5">
                    <p className="text-xs font-bold text-slate-200">
                      Upload PDF Document / Notes
                    </p>
                    <label className="inline-block">
                      <input
                        type="file"
                        accept="application/pdf"
                        disabled={uploadingPdf}
                        onChange={handlePdfFileUpload}
                        className="hidden"
                      />
                      <span className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors">
                        {uploadingPdf ? 'Uploading PDF...' : 'Browse & Upload PDF'}
                      </span>
                    </label>
                    {pdfUploadProgress && (
                      <p className="text-[11px] text-emerald-400 font-semibold">{pdfUploadProgress}</p>
                    )}
                    {pdfUploadError && (
                      <p className="text-[11px] text-rose-400 font-semibold">{pdfUploadError}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] text-slate-400">PDF Document Link / Storage URL</label>
                      <input
                        type="text"
                        required
                        placeholder="https://... or /uploads/notes.pdf"
                        value={lessonForm.pdfUrl}
                        onChange={(e) => setLessonForm({ ...lessonForm, pdfUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Pages Count</label>
                      <input
                        type="number"
                        min={1}
                        placeholder="12"
                        value={lessonForm.pagesCount}
                        onChange={(e) =>
                          setLessonForm({ ...lessonForm, pagesCount: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {lessonForm.type === 'document' && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 block">
                    Digital Notes / Study Article Content
                  </span>
                  <textarea
                    rows={5}
                    placeholder="Enter article text, key formulas, revision bullet points..."
                    value={lessonForm.contentText}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, contentText: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              )}

              {lessonForm.type === 'link' && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-teal-400 block">
                    External Web Resource
                  </span>
                  <input
                    type="url"
                    placeholder="https://external-resource.com/docs"
                    value={lessonForm.linkUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, linkUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              )}

              {lessonForm.type === 'quiz' && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-amber-400 block">
                    Interactive Quiz Configuration
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Time Limit (Minutes)</label>
                      <input
                        type="number"
                        min={1}
                        value={lessonForm.quizTimeLimit}
                        onChange={(e) =>
                          setLessonForm({ ...lessonForm, quizTimeLimit: Number(e.target.value) })
                        }
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Pass Percentage (%)</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={lessonForm.quizPassPercent}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            quizPassPercent: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Toggles & Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-white block">Free Preview</span>
                    <span className="text-[10px] text-slate-400">
                      Accessible without purchasing course
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={lessonForm.isFreePreview}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })
                    }
                    className="rounded text-emerald-600 w-4 h-4"
                  />
                </label>

                <label className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-white block">Allow Download</span>
                    <span className="text-[10px] text-slate-400">
                      Enable offline PDF / resource download
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={lessonForm.downloadable}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, downloadable: e.target.checked })
                    }
                    className="rounded text-emerald-600 w-4 h-4"
                  />
                </label>
              </div>

              {/* Drip Content option */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Drip Content Schedule</span>
                  <span className="text-[10px] text-slate-400">
                    Unlock automatically after X days from student enrollment
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={lessonForm.dripDays}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, dripDays: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                  />
                  <span className="text-xs text-slate-400">days</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction === 'save-lesson'}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950"
                >
                  {loadingAction === 'save-lesson' ? 'Saving...' : 'Save Content Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
