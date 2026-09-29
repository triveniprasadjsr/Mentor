import React from 'react';
import { GraduationCap, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  onNavigate: (path: string) => void;
  settings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, settings }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onNavigate('/')}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/50">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  {settings?.siteName || 'TechSetu'}
                </span>
                <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  JE / AE
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {settings?.tagline ||
                'India’s premier learning academy for Junior Engineer (JE) and Assistant Engineer (AE) competitive technical examinations.'}
            </p>
            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{settings?.contactEmail || 'support@techsetu.com'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{settings?.contactPhone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{settings?.address || 'Noida, Sector 62, Uttar Pradesh'}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/courses')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  All Courses
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/instructors')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Expert Instructors
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  About Academy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Exams */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Exams Covered
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/courses?exam=SSC+JE')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  SSC JE (Tech + Non-Tech)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/courses?exam=RRB+JE')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  RRB JE (CBT 1 & 2)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/courses?exam=State+AE%2FJE')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  State AE / JE Exams
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/courses?category=Electrical')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Electrical Engineering
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/courses?category=Civil')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Civil Engineering
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Admin */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Legal & Access
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/privacy-policy')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/terms')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/refund-policy')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Refund Policy
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => onNavigate('/admin/login')}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} {settings?.siteName || 'TechSetu'} Education Services. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>ISO 9001:2015 Certified Curriculum</span>
            <span>Secure 256-Bit SSL Encrypted Learning</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
