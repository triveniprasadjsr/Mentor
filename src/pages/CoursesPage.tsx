import React, { useState } from 'react';
import { Course } from '../types';
import { CourseCard } from '../components/CourseCard';
import { Search, Filter, BookOpen, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface CoursesPageProps {
  courses: Course[];
  onViewCourse: (slug: string) => void;
  onBuyCourse: (courseId: string) => void;
  enrolledCourseIds: Set<string>;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({
  courses,
  onViewCourse,
  onBuyCourse,
  enrolledCourseIds,
}) => {
  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const exams = ['SSC JE', 'RRB JE', 'State AE/JE', 'Junior Engineer'];
  const categories = [
    'Electrical Engineering',
    'Civil Engineering',
    'Mechanical Engineering',
    'Electrical & Electronics',
  ];

  const filtered = courses.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.exam.toLowerCase().includes(search.toLowerCase());

    const matchExam = !selectedExam || c.exam.toLowerCase().includes(selectedExam.toLowerCase());
    const matchCat = !selectedCategory || c.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchSearch && matchExam && matchCat;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.discountPrice - b.discountPrice;
    if (sortBy === 'price-high') return b.discountPrice - a.discountPrice;
    if (sortBy === 'popular') return (b.enrolledStudentsCount || 0) - (a.enrolledStudentsCount || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const resetFilters = () => {
    setSearch('');
    setSelectedExam('');
    setSelectedCategory('');
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Explore Engineering Courses</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Structured comprehensive batches for SSC JE, RRB JE, State AE/JE and competitive engineering examinations.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Exam Filter */}
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="">All Examinations</option>
            {exams.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>

          {/* Discipline Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="">All Engineering Disciplines</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="newest">Sort: Newest Batches</option>
            <option value="popular">Sort: Most Popular</option>
            <option value="price-low">Sort: Price (Low to High)</option>
            <option value="price-high">Sort: Price (High to Low)</option>
          </select>
        </div>

        {/* Active filters row */}
        {(search || selectedExam || selectedCategory) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-800 dark:text-white">{sorted.length}</span> matching course{sorted.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Results Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sorted.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onView={onViewCourse}
              onBuy={onBuyCourse}
              isEnrolled={enrolledCourseIds.has(course.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <BookOpen className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No courses match your criteria</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search keyword or examination discipline filter.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
