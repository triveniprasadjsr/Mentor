import React, { useState, useEffect, useRef } from 'react';
import { Course, Instructor, SiteSettings } from '../types';
import { CourseCard } from '../components/CourseCard';
import {
  BookOpen,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Search,
  ShieldCheck,
  TrendingUp,
  Play,
  Pause,
  Star,
  Flame,
  Zap,
  Clock,
  Download,
  Layers,
  Video,
  FileText,
  ChevronRight,
  GraduationCap,
  Eye,
  ShieldAlert,
  Percent,
} from 'lucide-react';

interface HomePageProps {
  courses: Course[];
  instructors: Instructor[];
  settings?: SiteSettings;
  onNavigate: (path: string) => void;
  onViewCourse: (slug: string) => void;
  onBuyCourse: (courseId: string) => void;
  enrolledCourseIds: Set<string>;
}

export const HomePage: React.FC<HomePageProps> = ({
  courses,
  instructors,
  settings,
  onNavigate,
  onViewCourse,
  onBuyCourse,
  enrolledCourseIds,
}) => {
  const [selectedExam, setSelectedExam] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [active3DCourseIndex, setActive3DCourseIndex] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // 3D Parallax Tilt state for Hero Card
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const heroCardRef = useRef<HTMLDivElement>(null);

  // Live Admissions Countdown Timer (2 days from now)
  const [timeLeft, setTimeLeft] = useState({ hours: 47, minutes: 54, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 48, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live enrollment social proof ticker
  const [recentEnrollmentIndex, setRecentEnrollmentIndex] = useState(0);
  const recentEnrollments = [
    { name: 'Aditya Verma', city: 'Prayagraj', course: 'SSC JE Electrical 2026 Batch', time: '2 mins ago' },
    { name: 'Priya Sharma', city: 'Bhopal', course: 'RRB JE CBT 1 + 2 Super Batch', time: '5 mins ago' },
    { name: 'Rohit Kulkarni', city: 'Pune', course: 'State PSC AE Mechanical Batch', time: '8 mins ago' },
    { name: 'Sneha Patel', city: 'Ahmedabad', course: 'Civil Engineering Formula Vault', time: '12 mins ago' },
  ];

  useEffect(() => {
    const ticker = setInterval(() => {
      setRecentEnrollmentIndex((prev) => (prev + 1) % recentEnrollments.length);
    }, 4500);
    return () => clearInterval(ticker);
  }, [recentEnrollments.length]);

  const exams = ['All', 'SSC JE', 'RRB JE', 'State AE/JE', 'Electrical Engineering', 'Civil Engineering'];

  const filteredCourses = courses.filter((c) => {
    const matchesExam =
      selectedExam === 'All' ||
      c.exam.toLowerCase().includes(selectedExam.toLowerCase()) ||
      c.category.toLowerCase().includes(selectedExam.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.exam.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesExam && matchesSearch;
  });

  // Featured 3D courses (or fallback if empty)
  const featuredCourses = courses.slice(0, 4);
  const activeCourse = featuredCourses[active3DCourseIndex] || courses[0];

  // Mouse move handler for 3D card tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; // tilt angle
    const rotateY = ((x - centerX) / centerX) * 12;

    setCardRotate({ x: rotateX, y: rotateY });
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25,
    });
  };

  const handleMouseLeave = () => {
    setCardRotate({ x: 0, y: 0 });
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div className="space-y-20 pb-20 overflow-x-hidden">
      {/* ============================================================
          TOP ANNOUNCEMENT & LIVE ADMISSIONS TICKER
      ============================================================ */}
      {settings?.announcementBannerActive !== false && (
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 text-white px-4 py-2.5 shadow-md border-b border-indigo-700/50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold uppercase tracking-wider text-amber-300">Announcements:</span>
              <span className="font-medium text-slate-100">
                {settings?.announcementBanner || 'SSC JE & RRB JE 2026 Comprehensive Master Batches Admissions Open'}
              </span>
              {settings?.announcementBannerUrl && (
                <button
                  onClick={() => onNavigate(settings.announcementBannerUrl!)}
                  className="underline text-amber-300 hover:text-white font-bold text-xs ml-1 cursor-pointer transition-colors"
                >
                  View Details →
                </button>
              )}
            </div>

            {/* Admissions Early Bird Countdown */}
            <div className="flex items-center gap-2 font-mono font-bold text-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Offer Ends in:</span>
              <span className="px-1.5 py-0.5 rounded bg-black/40 text-white font-extrabold">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span>:</span>
              <span className="px-1.5 py-0.5 rounded bg-black/40 text-white font-extrabold">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span>:</span>
              <span className="px-1.5 py-0.5 rounded bg-black/40 text-white font-extrabold text-amber-300">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SECTION 1: 3D PERSPECTIVE LANDING HERO (COURSES SELLING STAGE)
      ============================================================ */}
      <section className="relative overflow-hidden pt-6 pb-16 lg:pt-14 lg:pb-24">
        {/* 3D Space Background Ambient Glows & Isometric Grid */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none -z-10">
          <div className="absolute top-10 left-1/4 w-[500px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-blue-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute top-20 right-1/4 w-[400px] h-[300px] bg-gradient-to-bl from-emerald-500/15 via-teal-500/10 to-indigo-500/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Selling Headline & Action Stack */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* High-Impact 3D Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-950/80 border border-indigo-200/90 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold tracking-wide shadow-xs backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>INDIA'S #1 3D ENGINEERING LEARNING PLATFORM</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                  94.8% AIR Rate
                </span>
              </div>

              {/* Main Selling Typography */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                {settings?.heroTitle ? (
                  <span>{settings.heroTitle}</span>
                ) : (
                  <>
                    Crack <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">SSC JE & RRB JE</span> on First Attempt.
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                {settings?.heroSubtitle ||
                  'Structured masterclasses with 1080p video lectures, chapter-wise numerical modules, hand-written formula books, and all-India CBT mock test rankings.'}
              </p>

              {/* Selling USPs with 3D checkmarks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-semibold text-slate-700 dark:text-slate-200 text-left">
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-xs">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span>Ex-IES / IITian Faculty</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-xs">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <span>350+ Hours HD Lectures</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-xs col-span-2 sm:col-span-1">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>100% TCS CBT Pattern</span>
                </div>
              </div>

              {/* High Conversion CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => onNavigate('/courses')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-base shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                  <span>Explore Courses & Batches</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('/signup')}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-base border border-slate-200 dark:border-slate-800 shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Start Free Preview</span>
                </button>
              </div>

              {/* Live social proof banner */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-3">
                <div className="flex -space-x-2">
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Student"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Student"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                    alt="Student"
                  />
                  <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    45k+
                  </div>
                </div>

                <div className="text-left text-xs">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="font-extrabold text-slate-800 dark:text-white ml-1">4.9 / 5.0</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Rated by 12,400+ Junior & Assistant Engineer Aspirants
                  </p>
                </div>
              </div>
            </div>

            {/* Right: INTERACTIVE 3D PERSPECTIVE COURSE STAGE */}
            <div className="lg:col-span-5 relative perspective-[1200px] flex flex-col items-center">
              {/* Batch Carousel Selector Tabs */}
              {featuredCourses.length > 1 && (
                <div className="flex items-center gap-1.5 p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 mb-4 shadow-sm z-20">
                  {featuredCourses.map((c, idx) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActive3DCourseIndex(idx);
                        setIsPlayingPreview(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        active3DCourseIndex === idx
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {c.exam || `Batch ${idx + 1}`}
                    </button>
                  ))}
                </div>
              )}

              {/* The 3D Interactive Tilt Container */}
              <div
                ref={heroCardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `perspective(1000px) rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg)`,
                  transformStyle: 'preserve-3d',
                  transition: cardRotate.x === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
                }}
                className="relative w-full max-w-[440px] rounded-3xl bg-slate-900 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-950/40 p-5 overflow-hidden text-white cursor-pointer select-none group"
              >
                {/* Specular 3D Glare Reflection */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glarePos.opacity}) 0%, transparent 60%)`,
                  }}
                />

                {/* 3D Holographic Badges Floating with Depth (translateZ) */}
                <div
                  style={{ transform: 'translateZ(40px)' }}
                  className="flex items-center justify-between gap-2 mb-3"
                >
                  <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Flame className="w-3.5 h-3.5 fill-slate-950" />
                    BESTSELLER BATCH
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    ● Live Admissions Open
                  </span>
                </div>

                {/* Video / Thumbnail Player Stage */}
                <div
                  style={{ transform: 'translateZ(30px)' }}
                  className="relative h-48 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group-hover:border-indigo-500/50 transition-colors"
                >
                  <img
                    src={
                      activeCourse?.thumbnail ||
                      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={activeCourse?.title || 'Engineering Course'}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                  {/* Simulated 3D Video Play Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlayingPreview(!isPlayingPreview);
                    }}
                    className="absolute inset-0 m-auto w-14 h-14 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 backdrop-blur-md text-white flex items-center justify-center shadow-xl shadow-indigo-950/60 transition-transform hover:scale-110 cursor-pointer"
                    title={isPlayingPreview ? 'Pause Lecture Preview' : 'Play Free Lecture Preview'}
                  >
                    {isPlayingPreview ? (
                      <Pause className="w-6 h-6 fill-white" />
                    ) : (
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    )}
                  </button>

                  {/* Video audio waves animation if playing */}
                  {isPlayingPreview && (
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                      <span className="w-1.5 h-3 bg-emerald-400 animate-pulse"></span>
                      <span className="w-1.5 h-4 bg-emerald-400 animate-pulse delay-75"></span>
                      <span className="w-1.5 h-2 bg-emerald-400 animate-pulse delay-150"></span>
                      <span>Streaming Demo Lecture 1 (1080p 60FPS)</span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-mono text-slate-300">
                    {activeCourse?.duration || '180+ Hours'}
                  </div>
                </div>

                {/* Course Metadata with 3D Depth */}
                <div style={{ transform: 'translateZ(45px)' }} className="pt-4 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                      <span>{activeCourse?.exam || 'SSC JE 2026'}</span>
                      <span>•</span>
                      <span>{activeCourse?.category || 'Electrical'}</span>
                    </div>
                    <h3 className="text-lg font-black text-white mt-1 line-clamp-2">
                      {activeCourse?.title || 'SSC JE & RRB JE 2026: Complete Engineering Foundation Batch'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {activeCourse?.subtitle ||
                        'Comprehensive theory, hand-annotated digital formulas, 15+ years PYQ solved, and TCS format test series.'}
                    </p>
                  </div>

                  {/* 3D Price Ribbon & Instant Action */}
                  <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-emerald-400">
                          ₹{activeCourse?.discountPrice || activeCourse?.price || 1999}
                        </span>
                        {(activeCourse?.originalPrice || 4999) >
                          (activeCourse?.discountPrice || activeCourse?.price || 1999) && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{activeCourse?.originalPrice || 4999}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-black">
                          70% OFF
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Valid for 365 Days • Instant Access</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeCourse) onBuyCourse(activeCourse.id);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-950 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Enroll Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating 3D Stat Cube (Right side) */}
              <div className="absolute -bottom-6 -right-4 bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-2xl border border-slate-200 dark:border-slate-800 hidden sm:flex items-center gap-3 z-30 animate-bounce duration-1000">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">AIR-1 in 2024</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">TechSetu Direct Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: 3D INTERACTIVE PILLARS ("THE 4 DIMENSIONS")
      ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/60">
            Next-Generation Pedagogy
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3">
            Why Aspirants Select TechSetu Over Generic Apps
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
            Every feature is engineered around technical civil, electrical, and mechanical engineering exam blueprints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Dimension 1 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                1080p Ultra-HD Video Lectures
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Crystal clear smartboard lectures. Control playback from 0.5x to 2.0x, auto-resume across mobile and web, zero ads.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <span>Includes Free Demos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Dimension 2 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Exact TCS Exam Simulator
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Practice in the exact interface used by SSC & RRB exam centers. Real countdown timer, negative marking, all-India percentile.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>Chapter & Full Mock Tests</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Dimension 3 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-500/50 transition-all duration-300 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Handwritten Digital Notes Vault
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Color-coded formula cheat-sheets, unit derivation charts, and previous year error-spotting summaries downloadable as high-res PDFs.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span>Downloadable Offline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Dimension 4 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-500/50 transition-all duration-300 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                1-on-1 Faculty Doubt Resolution
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Never stay stuck on difficult circuit numericals or bending moment equations. Direct doubt clearing forum with faculty replies.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <span>Direct Mentorship</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: POPULAR COURSES SELLING CATALOG
      ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Targeted Exam Batches</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              Explore Our Comprehensive Batches
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select your targeted engineering examination below to view live batch curricula, lecture counts and pricing.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by topic, exam, or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
          </div>
        </div>

        {/* Filter Pills with 3D styling */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {exams.map((exam) => (
            <button
              key={exam}
              onClick={() => setSelectedExam(exam)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedExam === exam
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300/40 dark:shadow-none scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {exam}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                onView={onViewCourse}
                onBuy={onBuyCourse}
                isEnrolled={enrolledCourseIds.has(c.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No courses match your filter</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try resetting the exam category or searching for another keyword.
            </p>
            <button
              onClick={() => {
                setSelectedExam('All');
                setSearchQuery('');
              }}
              className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={() => onNavigate('/courses')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-extrabold text-sm transition-all hover:scale-105 cursor-pointer"
          >
            <span>Browse Complete Course Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ============================================================
          SECTION 3.5: DISTINGUISHED FACULTY & INSTRUCTORS SHOWCASE
      ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>IES & IIT Post-Graduate Educators</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              Learn From Elite Engineering Mentors
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Our faculty members have cleared UPSC Engineering Services, scored top percentiles in GATE, and trained 10,000+ Junior Engineers.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/instructors')}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>Meet All Faculty Members</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {instructors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instructors.map((inst) => (
              <div
                key={inst.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={inst.photo}
                      alt={inst.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30 dark:ring-emerald-500/40 group-hover:scale-105 transition-transform shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                          {inst.name}
                        </h3>
                        <span className="text-xs font-bold text-amber-500 dark:text-amber-400 shrink-0">
                          ★ {inst.rating || 4.9}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                        {inst.qualification}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {inst.experience}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {inst.bio}
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400 block">
                      Specializations & Subjects:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {inst.subjects.map((sub, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-medium border border-slate-200 dark:border-slate-700"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {inst.coursesCount !== undefined ? `${inst.coursesCount} Active Batches` : 'Lead Faculty'}
                  </span>
                  <button
                    onClick={() => onNavigate('/courses')}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>View Courses</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Faculty profiles are loading...</p>
          </div>
        )}
      </section>

      {/* ============================================================
          SECTION 4: 3D TOPPERS HALL OF FAME
      ============================================================ */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/60 dark:to-slate-950 py-16 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
              Hall of Fame
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-3">
              Proven Selections in Central & State Engineering
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Meet our students who converted their dream of becoming Junior & Assistant Engineers into reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Ranker 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400/40 dark:border-amber-500/30 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 font-black text-xs px-4 py-1 rounded-bl-2xl shadow-sm">
                AIR-1 SSC JE (Electrical)
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                    alt="Pooja Sharma"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-400 shadow-md"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Pooja Sharma</h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Central Water Commission (CPWD)</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "TechSetu's question bank and video lecture shortcuts for circuit analysis saved me at least 25 minutes during CBT-2. The hand-annotated formula book was my everyday revision companion."
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Verified Enrollment #TS-9421</span>
                <span className="font-bold text-amber-500">Score: 312 / 360</span>
              </div>
            </div>

            {/* Ranker 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300/80 dark:border-slate-700 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-slate-300 to-slate-400 text-slate-950 font-black text-xs px-4 py-1 rounded-bl-2xl shadow-sm">
                AIR-4 RRB JE (Mechanical)
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80"
                    alt="Rahul Anand"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-300 shadow-md"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Rahul Anand</h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Indian Railways Mechanical Div.</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "The SOM and Fluid Mechanics lecture series broke down heavy numericals into simple 2-step methods. The TCS exam format mock tests matched the real exam pattern 100%."
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Verified Enrollment #TS-7819</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">CBT-1: 99.4 Percentile</span>
              </div>
            </div>

            {/* Ranker 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-600/40 dark:border-amber-600/30 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-600 to-amber-700 text-white font-black text-xs px-4 py-1 rounded-bl-2xl shadow-sm">
                AIR-2 State PSC AE (Civil)
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80"
                    alt="Ankit Verma"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-600 shadow-md"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Ankit Verma</h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Irrigation & Water Resources Dept.</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "Manual UPI payment was verified within 15 minutes by the admin team, and I started studying immediately. The faculty cleared every doubt personally on the dashboard."
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Verified Enrollment #TS-5104</span>
                <span className="font-bold text-amber-600">Selected in First Try</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: HIGH-CONVERSION SELLING CTA BANNER
      ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950 text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden border border-indigo-700/50">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>

          <div className="max-w-2xl space-y-5 relative z-10">
            <span className="inline-block text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-3.5 py-1 rounded-full border border-amber-300/30">
              Limited Batch Seats Available
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
              Begin Your Journey to Becoming a Junior Engineer
            </h2>
            <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
              Enroll today with instant UPI payment. Get immediate access to 350+ hours of video lectures, handwritten digital notes, and active teacher support.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('/courses')}
                className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-950/40 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>Enroll in a Course Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('/contact')}
                className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer"
              >
                Talk to Academic Counselor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Recent Enrollment Toast */}
      <div className="fixed bottom-5 left-5 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 max-w-sm animate-in fade-in slide-in-from-bottom duration-300">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-slate-900 dark:text-white">
            {recentEnrollments[recentEnrollmentIndex].name} ({recentEnrollments[recentEnrollmentIndex].city})
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[210px]">
            Enrolled in {recentEnrollments[recentEnrollmentIndex].course}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {recentEnrollments[recentEnrollmentIndex].time}
          </span>
        </div>
      </div>
    </div>
  );
};

