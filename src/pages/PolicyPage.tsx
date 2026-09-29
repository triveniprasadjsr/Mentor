import React from 'react';
import { SiteSettings } from '../types';

interface PolicyPageProps {
  type: 'privacy' | 'terms' | 'refund';
  settings?: SiteSettings;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ type, settings }) => {
  const titles = {
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    refund: 'Course Refund & Cancellation Policy',
  };

  const contents = {
    privacy:
      settings?.privacyPolicy ||
      'TechSetu respects user privacy. We do not sell or trade student personal records. All data, payment proofs, and learning records are securely encrypted and retained strictly for course delivery and academic verification.',
    terms:
      settings?.termsPolicy ||
      'By purchasing or enrolling in TechSetu courses, students agree to strictly educational usage. Screen recording, downloading for unauthorized distribution, or credential sharing is strictly prohibited and subject to account suspension without refund.',
    refund:
      settings?.refundPolicy ||
      'Due to instant access to digital proprietary video lectures and downloadable notes, refunds are only processed if requested within 24 hours of enrollment prior to accessing more than 10% of lecture materials. Transaction fees may apply.',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">{titles[type]}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Last revised: September 2026 • TechSetu Academic Governance
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm leading-relaxed text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line space-y-4 transition-colors">
        {contents[type]}
      </div>
    </div>
  );
};
