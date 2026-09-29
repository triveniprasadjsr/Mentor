import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import {
  GraduationCap,
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
  Home,
  Award,
  Info,
  Phone,
  ArrowRight,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  siteName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, siteName = 'TechSetu' }) => {
  const { user, isAdmin, isStudent, logout, unreadNotifs } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [sidebarPopOpen, setSidebarPopOpen] = useState(false);

  const handleNav = (path: string) => {
    onNavigate(path);
    setProfileDropdownOpen(false);
    setSidebarPopOpen(false);
  };

  const handleAdminToggle = () => {
    if (currentPath === '/admin') {
      handleNav('/');
    } else {
      handleNav('/admin');
    }
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: Home, desc: '3D Campus & Batches' },
    { label: 'Courses', path: '/courses', icon: BookOpen, desc: 'SSC JE, RRB JE, State AE' },
    { label: 'Instructors', path: '/instructors', icon: Award, desc: 'IES & IIT Post-graduates' },
    { label: 'About', path: '/about', icon: Info, desc: 'Pedagogy & Mission' },
    { label: 'Contact', path: '/contact', icon: Phone, desc: 'Academic Counselors' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Top-left Interactive Logo & Name Button that opens Sliding Drawer */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarPopOpen(true)}
              className="flex items-center gap-3 p-1.5 sm:px-2.5 sm:py-2 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-indigo-50/60 dark:hover:bg-slate-800 text-left transition-all duration-200 group cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              title="Click to open Sliding Navigation Menu"
            >
              {/* Menu Hamburger Pill Icon */}
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60 group-hover:scale-105 transition-transform shrink-0">
                <Menu className="w-4 h-4" />
              </div>

              {/* Logo Graduation Cap Icon */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-300 dark:shadow-none group-hover:scale-105 transition-transform shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {siteName} Education
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                    JE / AE
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1">
                  <span>Explore Menu & 3D Batches</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                </p>
              </div>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {isAdmin && (
              <button
                onClick={handleAdminToggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  currentPath === '/admin'
                    ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                }`}
                title={currentPath === '/admin' ? 'Close Admin Panel' : 'Open Admin Panel'}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}

            {isStudent && (
              <>
                <button
                  onClick={() => handleNav('/dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  My Courses
                </button>

                <button
                  onClick={() => handleNav('/dashboard?tab=notifications')}
                  className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                  )}
                </button>
              </>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-slate-700 dark:text-slate-200"
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>

                    {isStudent && (
                      <>
                        <button
                          onClick={() => handleNav('/dashboard')}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                          Student Dashboard
                        </button>
                        <button
                          onClick={() => handleNav('/dashboard?tab=profile')}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          My Profile
                        </button>
                      </>
                    )}

                    {isAdmin && (
                      <button
                        onClick={handleAdminToggle}
                        className="w-full text-left px-4 py-2 text-sm text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin
                      </button>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                        onNavigate('/');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 dark:shadow-none transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger button */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={() => setSidebarPopOpen(true)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* ============================================================
        COLLAPSIBLE SLIDING SIDEBAR (DRAWER NAVIGATION)
    ============================================================ */}
    {sidebarPopOpen && (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop overlay with slight blur */}
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          onClick={() => setSidebarPopOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-out Sidebar Pop Drawer with smooth cubic-bezier transition */}
        <aside className="relative w-88 max-w-[88vw] h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex-1 overflow-y-auto">
            {/* Header with Logo and Close '×' Icon */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60 sticky top-0 z-10 backdrop-blur-md">
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => handleNav('/')}
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none group-hover:scale-105 transition-transform shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {siteName} Education
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                      JE / AE
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Online Engineering Learning Portal
                  </p>
                </div>
              </div>

              {/* Close Button '×' */}
              <button
                onClick={() => setSidebarPopOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close menu drawer"
                title="Close drawer (×)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs in Sidebar Pop Type */}
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider px-2 block">
                  Platform Navigation
                </span>

                {navLinks.map((tab) => {
                  const active = currentPath === tab.path;
                  const IconComp = tab.icon;
                  return (
                    <button
                      key={tab.path}
                      onClick={() => handleNav(tab.path)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                        active
                          ? 'bg-indigo-600 text-white font-bold border-indigo-500 shadow-md shadow-indigo-200 dark:shadow-indigo-950/60'
                          : 'bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60'
                          }`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-extrabold block truncate leading-tight">
                            {tab.label}
                          </span>
                          <span
                            className={`text-xs block truncate mt-0.5 ${
                              active ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {tab.desc}
                          </span>
                        </div>
                      </div>

                      <ArrowRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          active ? 'text-white translate-x-0.5' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Portals Section */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider px-2 block">
                  Direct Portals & Classrooms
                </span>

                <button
                  onClick={() => handleNav('/dashboard')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-left bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/50 text-indigo-950 dark:text-indigo-200 transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black block text-indigo-900 dark:text-indigo-100">
                        Student Classroom & Tests
                      </span>
                      <span className="text-[11px] text-indigo-700 dark:text-indigo-300 block">
                        My Courses, CBT Tests & Digital Notes
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={handleAdminToggle}
                  className="w-full flex items-center justify-between p-3 rounded-2xl text-left bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-200 transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black block text-emerald-900 dark:text-emerald-100">
                        Admin
                      </span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">
                        Platform Management & Settings
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Bottom: Theme Toggle & User Info */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 space-y-3 shrink-0">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Color Theme (Night / Day)</span>
              <ThemeToggle />
            </div>

            {user ? (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="px-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setSidebarPopOpen(false);
                    onNavigate('/');
                  }}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:border dark:border-rose-900 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleNav('/login')}
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="w-full py-2.5 text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 dark:shadow-none transition-colors cursor-pointer"
                >
                  Sign Up Free
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    )}
  </>
  );
};
