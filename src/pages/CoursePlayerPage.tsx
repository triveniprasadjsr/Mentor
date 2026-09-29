import React, { useState, useEffect } from 'react';
import { Course, Module, Lesson, CourseProgress, Announcement } from '../types';
import { api } from '../services/api';
import { VideoPlayer } from '../components/VideoPlayer';
import { PdfViewer } from '../components/PdfViewer';
import { QuizPlayer } from '../components/QuizPlayer';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  ArrowLeft,
  CheckCircle,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Award,
  Bell,
  Download,
  Upload,
} from 'lucide-react';

interface CoursePlayerPageProps {
  courseId: string;
  onBackToDashboard: () => void;
  onExploreCourses: () => void;
}

export const CoursePlayerPage: React.FC<CoursePlayerPageProps> = ({
  courseId,
  onBackToDashboard,
  onExploreCourses,
}) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPurchase, setNeedsPurchase] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tab below player: 'notes' | 'announcements' | 'assignment'
  const [bottomTab, setBottomTab] = useState<'notes' | 'announcements' | 'assignment'>('notes');

  // Assignment upload state
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [assignmentComments, setAssignmentComments] = useState('');
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  useEffect(() => {
    loadCoursePlayer();
  }, [courseId]);

  const loadCoursePlayer = async () => {
    try {
      setLoading(true);
      setError(null);
      setNeedsPurchase(false);
      const res = await api.courses.getLearn(courseId);
      setCourse(res.course);
      setModules(res.modules);
      setProgress(res.progress);
      setAnnouncements(res.announcements || []);

      // Find first lesson or resume from last accessed
      const allLessons = res.modules.flatMap((m) => m.lessons);
      if (allLessons.length > 0) {
        const last = allLessons.find((l) => l.id === res.progress?.lastAccessedLessonId);
        setActiveLesson(last || allLessons[0]);
      }
    } catch (err: any) {
      if (err.message?.includes('enrollment') || err.message?.includes('purchase')) {
        setNeedsPurchase(true);
      }
      setError(err.message || 'Failed to load course player');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setSidebarOpen(false);
    setAssignmentSuccess(false);
    setAssignmentFile(null);
  };

  const toggleLessonComplete = async (lessonId: string) => {
    if (!progress) return;
    const isCompleted = progress.completedLessonIds.includes(lessonId);
    try {
      const res = await api.progress.markLesson(courseId, lessonId, !isCompleted);
      setProgress(res.progress);
    } catch (err) {
      console.error('Failed to update lesson progress:', err);
    }
  };

  // Previous & Next navigation
  const allLessons = modules.flatMap((m) => m.lessons);
  const currentIndex = activeLesson ? allLessons.findIndex((l) => l.id === activeLesson.id) : -1;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleNextLesson = () => {
    if (nextLesson) {
      handleLessonSelect(nextLesson);
    }
  };

  const handlePrevLesson = () => {
    if (prevLesson) {
      handleLessonSelect(prevLesson);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentFile || !activeLesson?.assignmentId) return;

    try {
      setAssignmentSubmitting(true);
      const uploadRes = await api.upload(assignmentFile);
      await api.assignments.submit(activeLesson.assignmentId, {
        fileUrl: uploadRes.url,
        comments: assignmentComments,
      });
      setAssignmentSuccess(true);
      setAssignmentFile(null);
      setAssignmentComments('');
      // auto mark complete
      toggleLessonComplete(activeLesson.id);
    } catch (err: any) {
      alert(err.message || 'Failed to submit assignment');
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  const isExpired = error?.toLowerCase().includes('expired') || error?.toLowerCase().includes('validity');

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-3 bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Entering digital classroom...</p>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-300 dark:border-rose-900/80 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto ring-8 ring-rose-50 dark:ring-rose-950/40">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-black uppercase tracking-wider border border-rose-300 dark:border-rose-800">
              Access Revoked: Course Validity Expired
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white pt-1">
              Validity Period Completed
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your enrollment validity period has ended. In accordance with platform policy, access to 1080p video lectures, chapter numerical test simulators, and formula PDFs has been automatically revoked.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
            Need an extension? Contact academic counseling or purchase a validity extension override.
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              onClick={onBackToDashboard}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
            <button
              onClick={onExploreCourses}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Renew Batch Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (needsPurchase) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto ring-8 ring-amber-50 dark:ring-amber-950/40">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Protected Course Content</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              You do not have an active verified enrollment for this course yet. Once your payment is approved, full video and notes access is unlocked.
            </p>
          </div>
          <button
            onClick={onExploreCourses}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            View Course & Buy Access
          </button>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-3xl text-center space-y-4 shadow-xl">
          <h3 className="text-lg font-bold text-rose-800 dark:text-rose-400">Error Loading Course</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">{error}</p>
          <button
            onClick={onBackToDashboard}
            className="px-6 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer hover:bg-rose-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isCurrentCompleted = activeLesson ? progress?.completedLessonIds.includes(activeLesson.id) : false;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden absolute bottom-5 right-5 z-40 p-3.5 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* LEFT: Curriculum Syllabus Sidebar */}
      <div
        className={`w-80 sm:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-transform duration-300 z-30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } absolute lg:relative h-full shadow-xl lg:shadow-none`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
          <h2 className="font-extrabold text-sm text-slate-900 dark:text-white truncate" title={course.title}>
            {course.title}
          </h2>

          {/* Progress Mini Bar */}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-500 dark:text-slate-400">Progress</span>
              <span className="text-indigo-600 dark:text-indigo-400">{progress?.progressPercentage || 0}% Complete</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                style={{ width: `${progress?.progressPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Modules & Lessons Scrollable Tree */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-2">
          {modules.map((mod, modIdx) => (
            <div key={mod.id} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span className="truncate">
                  {modIdx + 1}. {mod.title}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal shrink-0">
                  {mod.lessons.length}
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {mod.lessons.map((lesson) => {
                  const isActive = activeLesson?.id === lesson.id;
                  const isDone = progress?.completedLessonIds.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleLessonSelect(lesson)}
                      className={`px-3.5 py-2.5 flex items-center justify-between gap-2.5 cursor-pointer text-xs transition-colors ${
                        isActive
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/60 font-bold text-indigo-900 dark:text-indigo-300 border-l-4 border-indigo-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : lesson.type === 'video' ? (
                          <PlayCircle className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : lesson.type === 'pdf' ? (
                          <FileText className="w-4 h-4 text-red-400 shrink-0" />
                        ) : lesson.type === 'quiz' ? (
                          <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : (
                          <ClipboardList className="w-4 h-4 text-purple-500 shrink-0" />
                        )}
                        <span className="truncate leading-tight">{lesson.title}</span>
                      </div>

                      {lesson.videoDuration && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {lesson.videoDuration}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Content Player & Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Top Control Bar */}
        <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded shrink-0">
              {activeLesson?.type.toUpperCase()}
            </span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {activeLesson?.title || 'Select a lecture to begin'}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            {activeLesson && (
              <>
                <button
                  onClick={() => toggleLessonComplete(activeLesson.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    isCurrentCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {isCurrentCompleted ? 'Completed' : 'Mark as Completed'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevLesson}
                    disabled={!prevLesson}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                    title="Previous Lecture"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextLesson}
                    disabled={!nextLesson}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                    title="Next Lecture"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Media / Content Area */}
        <div className="p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6">
          {activeLesson ? (
            <>
              {activeLesson.type === 'video' && (
                <VideoPlayer
                  url={activeLesson.videoUrl}
                  title={activeLesson.title}
                  onEnded={() => toggleLessonComplete(activeLesson.id)}
                />
              )}

              {activeLesson.type === 'pdf' && (
                <PdfViewer url={activeLesson.pdfUrl} title={activeLesson.title} />
              )}

              {activeLesson.type === 'quiz' && activeLesson.quizId && (
                <QuizPlayer
                  quizId={activeLesson.quizId}
                  onCompleted={() => toggleLessonComplete(activeLesson.id)}
                />
              )}

              {activeLesson.type === 'assignment' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                  <div>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                      Assignment Task
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{activeLesson.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      {activeLesson.contentText ||
                        'Complete the assigned technical numerical problems and upload your scanned handwritten calculations as a PDF or image.'}
                    </p>
                  </div>

                  {assignmentSuccess ? (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Assignment solution submitted successfully! Your submission is logged for mentor review.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleAssignmentSubmit} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Upload Assignment Solution (PDF / Image)
                        </label>
                        <input
                          type="file"
                          required
                          accept=".pdf,image/*"
                          onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/60 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Notes / Solution Comments (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={assignmentComments}
                          onChange={(e) => setAssignmentComments(e.target.value)}
                          placeholder="Any assumptions made or questions for the instructor..."
                          className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={assignmentSubmitting || !assignmentFile}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50"
                      >
                        {assignmentSubmitting ? 'Uploading...' : 'Submit Solution'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Lower Tabs: Notes / Announcements */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="border-b border-slate-100 dark:border-slate-800 flex items-center gap-6 px-6 pt-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                  <button
                    onClick={() => setBottomTab('notes')}
                    className={`pb-3 transition-colors ${
                      bottomTab === 'notes'
                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-extrabold'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Lecture Summary & Key Formulas
                  </button>
                  <button
                    onClick={() => setBottomTab('announcements')}
                    className={`pb-3 transition-colors flex items-center gap-1.5 ${
                      bottomTab === 'announcements'
                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-extrabold'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Batch Notices ({announcements.length})
                  </button>
                </div>

                <div className="p-6">
                  {bottomTab === 'notes' && (
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-3">
                      <p>{activeLesson.contentText || 'No supplementary textual notes for this lecture.'}</p>
                      {activeLesson.pdfUrl && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                          <FileText className="w-4 h-4 text-red-500" />
                          <span className="font-semibold text-slate-800 dark:text-white">Downloadable Reference Attached</span>
                          <a
                            href={activeLesson.pdfUrl}
                            download
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] rounded-lg"
                          >
                            Download Notes
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {bottomTab === 'announcements' && (
                    <div className="space-y-4">
                      {announcements.length > 0 ? (
                        announcements.map((ann) => (
                          <div
                            key={ann.id}
                            className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-slate-900 dark:text-white">{ann.title}</h4>
                              <span className="text-[10px] text-slate-400">
                                {new Date(ann.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300">{ann.content}</p>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block pt-1">
                              Posted by {ann.authorName}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">No active announcements for this course.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
              Select a lecture from the curriculum sidebar to begin watching.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
