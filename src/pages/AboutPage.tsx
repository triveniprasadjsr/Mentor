import React from 'react';
import { SiteSettings } from '../types';
import { GraduationCap, Award, Users, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  settings?: SiteSettings;
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
          About TechSetu Academy
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Empowering Engineering Aspirants Across India
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {settings?.aboutContent ||
            'TechSetu is India\'s dedicated preparation ecosystem engineered exclusively for diploma and engineering degree graduates preparing for RRB JE, SSC JE, State Public Service Commission AE/JE, and PSU technical positions.'}
        </p>
      </div>

      {/* Visual Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dedicated Technical Focus</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            We do not dilute our curriculum with unrelated general exams. Every formula, derivation, and numerical question matches current competitive engineering blueprints.
          </p>
        </div>

        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Proven Top Rank Pedagogy</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Our faculty comprises former IES officers and IIT graduates who simplify complex electrical, civil, and mechanical theories into easily recallable memory keys.
          </p>
        </div>

        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Fair & Transparent Learning</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Manual UPI payments verified with human oversight, instant enrollment activation, zero hidden charges, and lifetime access to study materials.
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 transition-colors">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Pedagogical Framework</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Built to help diploma and degree engineers clear cutoffs in first attempts.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 dark:text-white font-bold mb-0.5">Concept-First Derivations:</strong>
              Understanding the physical meaning behind Kirchhoff's laws, Maxwell equations, and Mohr's circles.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 dark:text-white font-bold mb-0.5">Speed Optimization Shortcuts:</strong>
              Techniques to solve complex multi-loop circuit numericals within 45 seconds for CBT exams.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 dark:text-white font-bold mb-0.5">Hand-written Formula Sheets:</strong>
              Downloadable condensed PDF notes ideal for last-minute revision before exam day.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 dark:text-white font-bold mb-0.5">Full CBT Mock Simulator:</strong>
              Interactive chapter tests with negative marking calculation matching RRB & SSC standards.
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('/courses')}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-950 transition-all hover:scale-105"
        >
          Explore Engineering Batches
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
