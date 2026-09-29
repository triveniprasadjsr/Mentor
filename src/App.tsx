import React, { useState, useEffect } from 'react';
import './firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { CoursePlayerPage } from './pages/CoursePlayerPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { InstructorsPage } from './pages/InstructorsPage';
import { PolicyPage } from './pages/PolicyPage';
import { Course, Instructor, SiteSettings } from './types';
import { api } from './services/api';

function AppContent() {
  const { user, isAdmin, isStudent, loading: authLoading } = useAuth();

  // Routing state - default is always homepage '/'
  const [currentPath, setCurrentPath] = useState<string>('/');

  // Global cached catalog data
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [settings, setSettings] = useState<SiteSettings | undefined>(undefined);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());

  // Listen to browser popstate (back/forward)
  useEffect(() => {
    const handlePop = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // Ensure default page always defaults to homepage
  useEffect(() => {
    const p = window.location.pathname;
    if (!p || p === '/') {
      setCurrentPath('/');
    } else {
      const validPaths = [
        '/courses',
        '/about',
        '/contact',
        '/instructors',
        '/admin',
        '/admin/login',
        '/login',
        '/signup',
        '/dashboard',
        '/privacy-policy',
        '/terms',
        '/refund-policy',
      ];
      const isValid =
        validPaths.includes(p) ||
        p.startsWith('/courses/') ||
        p.startsWith('/checkout/') ||
        p.startsWith('/learn/');
      if (isValid) {
        setCurrentPath(p);
      } else {
        window.history.replaceState({}, '', '/');
        setCurrentPath('/');
      }
    }
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load public catalog and settings on mount and listen to instant admin update events
  useEffect(() => {
    loadPublicData();

    // Listen to local in-window admin data changes
    const handleDataUpdated = () => {
      loadPublicData();
    };
    window.addEventListener('techsetu:data-updated', handleDataUpdated);

    // Listen to cross-tab storage updates
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'techsetu_sync_ts') {
        loadPublicData();
      }
    };
    window.addEventListener('storage', handleStorage);

    // Periodic silent sync check every 4 seconds to guarantee instant visibility of admin changes
    const syncInterval = setInterval(() => {
      loadPublicData();
    }, 4000);

    return () => {
      window.removeEventListener('techsetu:data-updated', handleDataUpdated);
      window.removeEventListener('storage', handleStorage);
      clearInterval(syncInterval);
    };
  }, []);

  // When user changes, refresh enrolled course ids
  useEffect(() => {
    if (user && isStudent) {
      api.payments.getMyCourses().then((res) => {
        const ids = new Set((res.myCourses || []).map((c) => c.course.id));
        setEnrolledCourseIds(ids);
      }).catch(() => {});
    } else {
      setEnrolledCourseIds(new Set());
    }
  }, [user, isStudent]);

  const loadPublicData = async () => {
    try {
      const [coursesRes, instructorsRes, settingsRes] = await Promise.all([
        api.courses.list(),
        api.instructors.list(),
        api.settings.get(),
      ]);
      setCourses(coursesRes.courses || []);
      setInstructors(instructorsRes.instructors || []);
      setSettings(settingsRes.settings);
    } catch (err) {
      console.error('Failed to load initial site data:', err);
    }
  };

  // Global Actions
  const handleViewCourse = (slug: string) => {
    navigate(`/courses/${slug}`);
  };

  const handleBuyCourse = (courseId: string) => {
    if (!user) {
      navigate(`/login?redirect=/checkout/${courseId}`);
    } else {
      navigate(`/checkout/${courseId}`);
    }
  };

  const handleStartLearning = (courseId: string) => {
    navigate(`/learn/${courseId}`);
  };

  // URL parsing helper
  const pathname = currentPath.split('?')[0];

  // Route matches
  let pageContent: React.ReactNode = null;

  if (pathname === '/') {
    pageContent = (
      <HomePage
        courses={courses}
        instructors={instructors}
        settings={settings}
        onNavigate={navigate}
        onViewCourse={handleViewCourse}
        onBuyCourse={handleBuyCourse}
        enrolledCourseIds={enrolledCourseIds}
      />
    );
  } else if (pathname === '/courses') {
    pageContent = (
      <CoursesPage
        courses={courses}
        onViewCourse={handleViewCourse}
        onBuyCourse={handleBuyCourse}
        enrolledCourseIds={enrolledCourseIds}
      />
    );
  } else if (pathname.startsWith('/courses/')) {
    const slug = pathname.replace('/courses/', '');
    pageContent = (
      <CourseDetailPage
        slug={slug}
        onBuy={handleBuyCourse}
        onStartLearning={handleStartLearning}
      />
    );
  } else if (pathname.startsWith('/checkout/')) {
    const courseId = pathname.replace('/checkout/', '');
    const targetCourse = courses.find((c) => c.id === courseId);
    if (targetCourse) {
      pageContent = (
        <CheckoutPage
          course={targetCourse}
          settings={settings}
          onNavigate={navigate}
          onSuccess={() => navigate('/dashboard')}
        />
      );
    } else {
      pageContent = (
        <div className="py-20 text-center">
          <p className="text-slate-500">Course not found. Loading catalog...</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs"
          >
            Back to Courses
          </button>
        </div>
      );
    }
  } else if (pathname.startsWith('/learn/')) {
    const courseId = pathname.replace('/learn/', '');
    pageContent = (
      <CoursePlayerPage
        courseId={courseId}
        onBackToDashboard={() => navigate('/dashboard')}
        onExploreCourses={() => navigate('/courses')}
      />
    );
  } else if (pathname === '/dashboard') {
    if (!user) {
      pageContent = <LoginPage onNavigate={navigate} redirectPath="/dashboard" />;
    } else {
      pageContent = (
        <StudentDashboardPage
          onLearnCourse={handleStartLearning}
          onExploreCourses={() => navigate('/courses')}
        />
      );
    }
  } else if (pathname === '/login') {
    const searchParams = new URLSearchParams(window.location.search);
    const redirectParam = searchParams.get('redirect') || '/dashboard';
    pageContent = <LoginPage onNavigate={navigate} redirectPath={redirectParam} />;
  } else if (pathname === '/signup') {
    const searchParams = new URLSearchParams(window.location.search);
    const redirectParam = searchParams.get('redirect') || '/dashboard';
    pageContent = <RegisterPage onNavigate={navigate} redirectPath={redirectParam} />;
  } else if (pathname === '/admin/login') {
    pageContent = (
      <AdminLoginPage
        onSuccess={() => navigate('/admin')}
        onNavigateHome={() => navigate('/')}
      />
    );
  } else if (pathname === '/admin') {
    if (!user || !isAdmin) {
      pageContent = (
        <AdminLoginPage
          onSuccess={() => navigate('/admin')}
          onNavigateHome={() => navigate('/')}
        />
      );
    } else {
      return (
        <AdminDashboardPage
          onNavigateHome={() => {
            loadPublicData();
            navigate('/');
          }}
          onDataChanged={loadPublicData}
        />
      );
    }
  } else if (pathname === '/about') {
    pageContent = <AboutPage settings={settings} onNavigate={navigate} />;
  } else if (pathname === '/contact') {
    pageContent = <ContactPage settings={settings} />;
  } else if (pathname === '/instructors') {
    pageContent = (
      <InstructorsPage
        instructors={instructors}
        courses={courses}
        onViewCourse={handleViewCourse}
      />
    );
  } else if (pathname === '/privacy-policy') {
    pageContent = <PolicyPage type="privacy" settings={settings} />;
  } else if (pathname === '/terms') {
    pageContent = <PolicyPage type="terms" settings={settings} />;
  } else if (pathname === '/refund-policy') {
    pageContent = <PolicyPage type="refund" settings={settings} />;
  } else {
    // Default page is always HomePage
    pageContent = (
      <HomePage
        courses={courses}
        instructors={instructors}
        settings={settings}
        onNavigate={navigate}
        onViewCourse={handleViewCourse}
        onBuyCourse={handleBuyCourse}
        enrolledCourseIds={enrolledCourseIds}
      />
    );
  }

  const isLearningPlayer = pathname.startsWith('/learn/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-150">
      {!isLearningPlayer && (
        <Navbar currentPath={pathname} onNavigate={navigate} siteName={settings?.siteName} />
      )}

      <main className="flex-1">{pageContent}</main>

      {!isLearningPlayer && (
        <Footer onNavigate={navigate} settings={settings} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
