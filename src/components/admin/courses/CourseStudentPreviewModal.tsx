import React, { useState } from 'react';
import { Course, Lesson } from '../../../types';
import { VideoPlayer } from '../../VideoPlayer';
import { PdfViewer } from '../../PdfViewer';
import { QuizPlayer } from '../../QuizPlayer';
import {
  X,
  Eye,
  Video,
  FileText,
  HelpCircle,
  Folder,
  Layers,
  CheckCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface CourseStudentPreviewModalProps {
  isOpen: boolean;
  course: Course;
  onClose: () => void;
}

export const CourseStudentPreviewModal: React.FC<CourseStudentPreviewModalProps> = ({
  isOpen,
  course,
  onClose,
}) => {
  // Find first lesson
  const allLessons: Lesson[] = [];
  course.modules?.forEach((m) => {
    m.lessons?.forEach((l) => allLessons.push(l));
    m.subModules?.forEach((sub) => {
      sub.lessons?.forEach((l) => allLessons.push(l));
    });
  });

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(allLessons[0] || null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Preview Banner */}
        <div className="px-6 py-3 bg-indigo-950/80 border-b border-indigo-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider">
              Student Preview Mode
            </span>
            <span className="text-xs text-indigo-200">
              Viewing <strong>{course.title}</strong> exactly as an enrolled student. No changes are saved to progress.
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-indigo-300 hover:text-white rounded-lg hover:bg-indigo-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Learning Player Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Content Stage */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 bg-slate-950">
            {activeLesson ? (
              <div className="space-y-4 max-w-4xl mx-auto w-full">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                    {activeLesson.type.toUpperCase()} CONTENT
                  </span>
                  <h2 className="text-xl font-black text-white mt-1">{activeLesson.title}</h2>
                </div>

                {activeLesson.type === 'video' && (
                  <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black">
                    <VideoPlayer
                      url={
                        activeLesson.videoUrl ||
                        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                      }
                      title={activeLesson.title}
                    />
                  </div>
                )}

                {activeLesson.type === 'pdf' && (
                  <div className="h-[600px] rounded-2xl overflow-hidden border border-slate-800">
                    <PdfViewer
                      url={
                        activeLesson.pdfUrl ||
                        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                      }
                      title={activeLesson.title}
                    />
                  </div>
                )}

                {activeLesson.type === 'document' && (
                  <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
                    {activeLesson.contentText ? (
                      <p className="whitespace-pre-line">{activeLesson.contentText}</p>
                    ) : (
                      <p className="text-slate-500 italic">No text provided for this document lesson.</p>
                    )}
                  </div>
                )}

                {activeLesson.type === 'quiz' && (
                  <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 mb-4">
                      Interactive mock quiz preview for testing student examination flow.
                    </p>
                    <QuizPlayer
                      quizId={activeLesson.quizId || 'quiz-seed-1'}
                      onCompleted={() => {}}
                    />
                  </div>
                )}

                {activeLesson.type === 'link' && (
                  <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-4">
                    <h3 className="text-base font-bold text-white">External Learning Resource</h3>
                    <p className="text-xs text-slate-400">{activeLesson.linkUrl}</p>
                    {activeLesson.linkUrl && (
                      <a
                        href={activeLesson.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                      >
                        Open Resource <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500">
                Select a lecture from the curriculum on the right to preview.
              </div>
            )}
          </div>

          {/* Right Curriculum Navigation Sidebar */}
          <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 shrink-0 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/40">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Course Curriculum
              </span>
              <span className="text-[11px] text-slate-500">
                {course.modules?.length || 0} Sections • {allLessons.length} Lectures
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {course.modules?.map((m, mIdx) => (
                <div key={m.id} className="space-y-1">
                  <div className="px-2 py-1.5 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5" />
                    <span>Section {mIdx + 1}: {m.title}</span>
                  </div>

                  <div className="space-y-1 pl-2">
                    {m.lessons?.map((les) => (
                      <button
                        key={les.id}
                        onClick={() => setActiveLesson(les)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition-colors ${
                          activeLesson?.id === les.id
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {les.type === 'video' ? (
                            <Video className="w-3.5 h-3.5 shrink-0" />
                          ) : les.type === 'pdf' ? (
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>
                        {les.videoDuration && (
                          <span className="text-[10px] opacity-75 shrink-0">
                            {les.videoDuration}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
