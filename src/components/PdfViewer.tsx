import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';

interface PdfViewerProps {
  url?: string;
  title?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, title }) => {
  if (!url) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400">
        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
        <p className="text-sm">No document attached to this lesson.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* PDF Controls header */}
      <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
            PDF
          </div>
          <div>
            <h4 className="font-bold text-sm truncate max-w-md">{title || 'Course Material Notes'}</h4>
            <p className="text-[11px] text-slate-400">Official Exam Reference & Study Notes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Fullscreen
          </a>
          <a
            href={url}
            download
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </a>
        </div>
      </div>

      {/* Embed frame */}
      <div className="h-[650px] w-full bg-slate-100 dark:bg-slate-950">
        <iframe
          src={`${url}#toolbar=1`}
          title={title || 'PDF Document'}
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};
