import React from 'react';
import { Instructor, Course } from '../types';
import { Star, Award, BookOpen, ArrowRight } from 'lucide-react';

interface InstructorsPageProps {
  instructors: Instructor[];
  courses: Course[];
  onViewCourse: (slug: string) => void;
}

export const InstructorsPage: React.FC<InstructorsPageProps> = ({
  instructors,
  courses,
  onViewCourse,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
          Faculty Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Meet Our Distinguished Engineering Educators
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Learn from former Indian Engineering Services (IES) officers, IIT post-graduates and state examination rank-holders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {instructors.map((inst) => {
          const taughtCourses = courses.filter((c) => c.instructorId === inst.id);

          return (
            <div
              key={inst.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-7 shadow-sm hover:shadow-xl dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={inst.photo}
                    alt={inst.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-50 dark:ring-indigo-950 shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug">{inst.name}</h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{inst.qualification}</p>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{inst.rating}</span>
                      <span className="text-slate-400 dark:text-slate-500 font-normal">
                        ({inst.totalStudents || 12000}+ students)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <strong className="block text-slate-900 dark:text-white font-bold mb-0.5">Teaching Experience:</strong>
                  {inst.experience}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{inst.bio}</p>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                    Core Subjects:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {inst.subjects.map((sub, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {taughtCourses.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                      Courses Taught ({taughtCourses.length}):
                    </span>
                    <div className="space-y-1.5">
                      {taughtCourses.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => onViewCourse(c.slug)}
                          className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer font-medium p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <span className="truncate max-w-[230px]">{c.title}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
