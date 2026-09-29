import React, { useState, useEffect } from 'react';
import { Course, Lesson } from '../types';
import { api } from '../services/api';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  Clock,
  PlayCircle,
  FileText,
  Lock,
  Play,
  CheckCircle,
  HelpCircle,
  Star,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface CourseDetailPageProps {
  slug: string;
  onBuy: (courseId: string) => void;
  onStartLearning: (courseId: string) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  slug,
  onBuy,
  onStartLearning,
}) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Free preview modal state
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  // Collapsible module states
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadCourseDetails();
  }, [slug]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.courses.getBySlug(slug);
      setCourse(res.course);
      setIsEnrolled(res.isEnrolled);

      // Expand all modules by default
      const exp: Record<string, boolean> = {};
      res.course.modules?.forEach((m) => {
        exp[m.id] = true;
      });
      setExpandedModules(exp);
    } catch (err: any) {
      setError(err.message || 'Course not found');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
            <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-60 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-3xl text-center space-y-4">
        <h3 className="text-lg font-bold text-rose-800 dark:text-rose-300">Course Unavailable</h3>
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">{error || 'Unable to load course details. Please try again.'}</p>
        <button
          onClick={loadCourseDetails}
          className="mt-4 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const discountPercent = course.price > course.discountPrice
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0;

  return (
    <div className="space-y-12 pb-20">
      {/* Top Breadcrumb & Hero Header */}
      <section className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Course Summary */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 text-xs font-extrabold uppercase">
                  {course.exam}
                </span>
                <span className="px-2.5 py-1 rounded bg-indigo-900 text-indigo-200 text-xs font-semibold border border-indigo-700">
                  {course.category}
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-medium">
                  {course.difficulty}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {course.subtitle || course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{course.rating || 4.9}</span>
                  <span className="text-slate-400 font-normal">
                    ({course.enrolledStudentsCount || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{course.enrolledStudentsCount || 0} Enrolled Aspirants</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{course.duration}</span>
                </div>
                <div>
                  Language: <span className="text-white font-semibold">{course.language}</span>
                </div>
              </div>

              {course.instructor && (
                <div className="pt-4 flex items-center gap-3 border-t border-slate-800">
                  <img
                    src={course.instructor.photo}
                    alt={course.instructor.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500"
                  />
                  <div>
                    <p className="text-xs text-slate-400">Course Mentor</p>
                    <p className="text-sm font-bold text-white">{course.instructor.name}</p>
                    <p className="text-[11px] text-slate-400">{course.instructor.qualification}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sticky Purchase Widget */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5">
              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 relative group">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Look for free preview lecture */}
                {course.modules?.some((m) => m.lessons.some((l) => l.isFreePreview)) && (
                  <button
                    onClick={() => {
                      for (const m of course.modules || []) {
                        const fp = m.lessons.find((l) => l.isFreePreview && l.videoUrl);
                        if (fp) {
                          setPreviewLesson(fp);
                          break;
                        }
                      }
                    }}
                    className="absolute inset-0 bg-slate-950/40 hover:bg-slate-950/20 flex flex-col items-center justify-center text-white transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 ml-1 fill-current" />
                    </div>
                    <span className="text-xs font-bold mt-2 bg-slate-900/80 px-2.5 py-1 rounded-full">
                      Watch Free Preview Lecture
                    </span>
                  </button>
                )}
              </div>

              {/* Price Tag */}
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      ₹{course.discountPrice.toLocaleString('en-IN')}
                    </span>
                    {course.price > course.discountPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        ₹{course.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    One-time payment • Lifetime validity
                  </span>
                </div>
                {discountPercent > 0 && (
                  <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-black text-xs rounded-lg">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Primary Action Button */}
              {isEnrolled ? (
                <button
                  onClick={() => onStartLearning(course.id)}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 transition-all"
                >
                  <PlayCircle className="w-5 h-5" />
                  Continue Learning (Enrolled)
                </button>
              ) : (
                <button
                  onClick={() => onBuy(course.id)}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Course Now
                </button>
              )}

              {/* Course includes */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] block">
                  This Masterclass Includes:
                </span>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>{course.lecturesCount || 0} Comprehensive Video Lectures</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>{course.materialsCount || 0} Downloadable Hand-written PDF Notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Chapter-wise Quizzes & PYQ Practice</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Manual Payment & Verification Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Details Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left main syllabus & description */}
        <div className="lg:col-span-8 space-y-10">
          {/* What you will learn */}
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4">What You Will Learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {course.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum / Syllabus Accordion */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Course Curriculum</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {course.modules?.length || 0} Modules • {course.lecturesCount || 0} Lectures • {course.materialsCount || 0} Study PDFs
                </p>
              </div>

              {!isEnrolled && (
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Locked until purchased
                </span>
              )}
            </div>

            {/* Modules */}
            <div className="space-y-3 pt-2">
              {course.modules?.map((mod, modIdx) => {
                const isExpanded = expandedModules[mod.id] ?? true;
                return (
                  <div
                    key={mod.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/40"
                  >
                    {/* Module Header */}
                    <div
                      onClick={() => toggleModule(mod.id)}
                      className="px-5 py-4 bg-slate-100/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          {modIdx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white">{mod.title}</h4>
                          {mod.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{mod.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>{mod.lessons.length} lessons</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Lesson Items */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {mod.lessons.map((lesson) => {
                          const isFree = lesson.isFreePreview;
                          const locked = !isEnrolled && !isFree;

                          return (
                            <div
                              key={lesson.id}
                              className="px-5 py-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {lesson.type === 'video' ? (
                                  <PlayCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                ) : lesson.type === 'pdf' ? (
                                  <FileText className="w-4 h-4 text-red-500 shrink-0" />
                                ) : (
                                  <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                )}

                                <span className={`truncate font-medium ${locked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                                  {lesson.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                {lesson.videoDuration && (
                                  <span className="text-slate-400 text-[11px]">{lesson.videoDuration}</span>
                                )}

                                {isFree && (
                                  <button
                                    onClick={() => setPreviewLesson(lesson)}
                                    className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                    Free Preview
                                  </button>
                                )}

                                {locked && (
                                  <div className="flex items-center gap-1 text-slate-400">
                                    <Lock className="w-3.5 h-3.5" />
                                  </div>
                                )}

                                {isEnrolled && (
                                  <button
                                    onClick={() => onStartLearning(course.id)}
                                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                                  >
                                    Watch
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Requirements & Description */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Detailed Course Description</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>

            {course.requirements && course.requirements.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Prerequisites & Eligibility</h3>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Instructor Bio */}
        <div className="lg:col-span-4 space-y-6">
          {course.instructor && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Lead Educator
              </span>
              <div className="flex items-center gap-3">
                <img
                  src={course.instructor.photo}
                  alt={course.instructor.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-100 dark:ring-indigo-900"
                />
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{course.instructor.name}</h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{course.instructor.qualification}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{course.instructor.experience}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                {course.instructor.bio}
              </p>

              <div className="pt-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Specialized Subjects:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {course.instructor.subjects.map((sub, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] rounded-md font-medium"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Guarantee Box */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              100% Verified Quality Content
            </h4>
            <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed">
              Every formula, derivation, and numerical question matches current exam blueprints. Access is granted as soon as payment is submitted and approved.
            </p>
          </div>
        </div>
      </div>

      {/* Free Preview Video Modal */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-700">
            <div className="px-6 py-4 bg-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
                  Free Preview Lecture
                </span>
                <h3 className="font-bold text-base text-white mt-1">{previewLesson.title}</h3>
              </div>
              <button
                onClick={() => setPreviewLesson(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <VideoPlayer url={previewLesson.videoUrl} title={previewLesson.title} />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-300">
                  Like this lecture? Enroll now to unlock all {course.lecturesCount} lectures and hand-written notes.
                </p>
                <button
                  onClick={() => {
                    setPreviewLesson(null);
                    onBuy(course.id);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shrink-0 flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy Full Course (₹{course.discountPrice})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
