import React, { useState } from 'react';
import { Course, Instructor, User } from '../../../types';
import { api } from '../../../services/api';
import { CourseFormModal } from './CourseFormModal';
import { CourseStructureBuilderModal } from './CourseStructureBuilderModal';
import { CoursePublishModal } from './CoursePublishModal';
import { CourseStudentsModal } from './CourseStudentsModal';
import { CourseStudentPreviewModal } from './CourseStudentPreviewModal';
import { ConfirmationModal } from '../../ConfirmationModal';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Layers,
  Video,
  FileText,
  HelpCircle,
  Users,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Send,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle,
  Tag,
  DollarSign,
  Grid,
  List,
  ArrowRight,
  TrendingUp,
  Shield,
  Download,
  MoreVertical,
} from 'lucide-react';

interface CourseManagementViewProps {
  courses: Course[];
  instructors: Instructor[];
  allStudents: User[];
  onRefreshCourses: () => void | Promise<void>;
}

export const CourseManagementView: React.FC<CourseManagementViewProps> = ({
  courses,
  instructors,
  allStudents,
  onRefreshCourses,
}) => {
  // View Toggle: Grid / Cards vs Table
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all'); // all, free, paid

  // Modals
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<Course | null>(null);

  const [structureBuilderOpen, setStructureBuilderOpen] = useState(false);
  const [selectedCourseForStructure, setSelectedCourseForStructure] = useState<Course | null>(null);

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedCourseForPublish, setSelectedCourseForPublish] = useState<Course | null>(null);

  const [studentsModalOpen, setStudentsModalOpen] = useState(false);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<Course | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedCourseForPreview, setSelectedCourseForPreview] = useState<Course | null>(null);

  const [deleteModalCourse, setDeleteModalCourse] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter logic
  const filteredCourses = courses.filter((c) => {
    // Search
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      (c.shortName && c.shortName.toLowerCase().includes(q)) ||
      (c.courseCode && c.courseCode.toLowerCase().includes(q)) ||
      (c.discipline && c.discipline.toLowerCase().includes(q)) ||
      c.category.toLowerCase().includes(q) ||
      c.exam.toLowerCase().includes(q);

    // Status
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;

    // Discipline
    const matchDiscipline =
      disciplineFilter === 'all' ||
      (c.discipline && c.discipline.toLowerCase().includes(disciplineFilter.toLowerCase())) ||
      c.category.toLowerCase().includes(disciplineFilter.toLowerCase());

    // Price
    const isFree = c.courseType === 'free' || c.price === 0;
    const matchPrice =
      priceFilter === 'all' ||
      (priceFilter === 'free' && isFree) ||
      (priceFilter === 'paid' && !isFree);

    return matchSearch && matchStatus && matchDiscipline && matchPrice;
  });

  // Aggregate metrics
  const totalCoursesCount = courses.length;
  const publishedCoursesCount = courses.filter((c) => c.status === 'published').length;
  const draftCoursesCount = courses.filter((c) => c.status === 'draft').length;
  const totalEnrolledCount = courses.reduce((acc, c) => acc + (c.enrolledStudentsCount || 0), 0);
  const totalSectionsCount = courses.reduce((acc, c) => acc + (c.totalSections || c.modulesCount || 0), 0);
  const totalLecturesCount = courses.reduce((acc, c) => acc + (c.totalLectures || c.lecturesCount || 0), 0);

  // Actions
  const handleOpenCreateCourse = () => {
    setSelectedCourseForEdit(null);
    setCourseFormOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setSelectedCourseForEdit(course);
    setCourseFormOpen(true);
  };

  const handleSaveCourse = async (courseData: Partial<Course>) => {
    if (selectedCourseForEdit) {
      await api.courses.update(selectedCourseForEdit.id, courseData);
      setNotification({ type: 'success', text: `Course "${courseData.title}" updated successfully.` });
    } else {
      await api.courses.create(courseData);
      setNotification({ type: 'success', text: `Course "${courseData.title}" created successfully.` });
    }
    await onRefreshCourses();
  };

  const handleOpenStructureBuilder = (course: Course) => {
    setSelectedCourseForStructure(course);
    setStructureBuilderOpen(true);
  };

  const handleDuplicateCourse = async (course: Course) => {
    try {
      const res = await api.courses.duplicate(course.id);
      setNotification({ type: 'success', text: `Course cloned as "${res.course.title}".` });
      await onRefreshCourses();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to duplicate course' });
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteModalCourse) return;
    setDeleting(true);
    try {
      const res = await api.courses.delete(deleteModalCourse.id);
      setNotification({
        type: 'success',
        text: res.message || 'Course removed or archived.',
      });
      setDeleteModalCourse(null);
      await onRefreshCourses();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to delete course' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Course Management System</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] border border-emerald-500/30">
              Admin CMS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Design hierarchical syllabus trees, manage video & PDF lectures, configure pricing and discount percentages, monitor enrollments, and publish engineering preparation courses.
          </p>
        </div>

        <button
          onClick={handleOpenCreateCourse}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          + Create Course
        </button>
      </div>

      {/* Global Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Statistics Counter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Courses</span>
          <p className="text-xl font-black text-slate-900 dark:text-white">{totalCoursesCount}</p>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Published</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{publishedCoursesCount}</p>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Drafts</span>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400">{draftCoursesCount}</p>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Sections</span>
          <p className="text-xl font-black text-slate-900 dark:text-white">{totalSectionsCount}</p>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Total Lectures</span>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{totalLecturesCount}</p>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Active Students</span>
          <p className="text-xl font-black text-teal-600 dark:text-teal-400">{totalEnrolledCount}</p>
        </div>
      </div>

      {/* Search, Filter Toolbar & View Toggle */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by course name, course ID, discipline, exam, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Status: All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="unpublished">Unpublished</option>
            <option value="archived">Archived</option>
          </select>

          {/* Discipline Filter */}
          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Discipline: All</option>
            <option value="Electrical">Electrical Engineering</option>
            <option value="Civil">Civil Engineering</option>
            <option value="Mechanical">Mechanical Engineering</option>
            <option value="Electronics">Electronics</option>
            <option value="Non-Technical">Non-Tech / General</option>
          </select>

          {/* Price Filter */}
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Price: All</option>
            <option value="free">Free Courses</option>
            <option value="paid">Paid Courses</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Grid Card View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Course Listing (Card Grid vs Detailed Table) */}
      {filteredCourses.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Courses Matching Your Filter</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try resetting your search query or status filter, or create a new course using the button above.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDisciplineFilter('all');
              setPriceFilter('all');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ================= GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCourses.map((c) => {
            const isFree = c.courseType === 'free' || c.price === 0;
            const original = c.originalPrice || (c.price > 0 ? Math.round(c.price * 1.5) : 0);
            const selling = c.discountPrice || c.price || 0;
            const discountPct = !isFree && original > selling ? Math.round(((original - selling) / original) * 100) : 0;

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col group"
              >
                {/* Course Header Thumbnail Strip */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-emerald-400 font-mono text-[10px] font-bold border border-slate-800">
                      {c.courseCode || c.id}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          c.status === 'published'
                            ? 'bg-emerald-500 text-slate-950'
                            : c.status === 'draft'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {c.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] text-slate-300 font-semibold border border-slate-700">
                        {c.visibility || 'public'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Strip on Image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600/80 backdrop-blur-md text-white font-bold text-[10px]">
                      {c.exam || 'All Exams'}
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium">
                      {c.discipline || c.category}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {c.title}
                    </h3>
                    {c.subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {c.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Pricing Display */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        Selling Price
                      </span>
                      {isFree ? (
                        <span className="text-base font-black text-blue-600 dark:text-blue-400">FREE COURSE</span>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            ₹{selling.toLocaleString()}
                          </span>
                          {original > selling && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{original.toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {!isFree && discountPct > 0 && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs border border-emerald-500/30">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>

                  {/* Automatically Calculated Metrics Badges */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Sections</span>
                      <strong className="text-slate-900 dark:text-white text-xs">
                        {c.totalSections || c.modulesCount || 0}
                      </strong>
                    </div>

                    <div className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Lectures</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 text-xs">
                        {c.totalLectures || c.lecturesCount || 0}
                      </strong>
                    </div>

                    <div className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Enrolled</span>
                      <strong className="text-teal-600 dark:text-teal-400 text-xs">
                        {c.enrolledStudentsCount || 0}
                      </strong>
                    </div>
                  </div>

                  {/* Completion Rate & Date */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      Created: {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {c.completionRate || 0}% Completed
                    </span>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                    {/* Visual Structure Builder Button */}
                    <button
                      onClick={() => handleOpenStructureBuilder(c)}
                      className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/20 transition-colors"
                      title="Open Hierarchical Structure Builder"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Structure Builder
                    </button>

                    <button
                      onClick={() => handleOpenEditCourse(c)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs transition-colors"
                      title="Edit Details & Pricing"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCourseForPreview(c);
                        setPreviewModalOpen(true);
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs transition-colors"
                      title="Preview as Student"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCourseForPublish(c);
                        setPublishModalOpen(true);
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs transition-colors"
                      title="Publish Checklist & Status"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCourseForStudents(c);
                        setStudentsModalOpen(true);
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs transition-colors"
                      title="Manage Enrolled Students"
                    >
                      <Users className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicateCourse(c)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs transition-colors"
                      title="Duplicate Course Structure"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteModalCourse(c)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 rounded-xl text-xs transition-colors"
                      title="Archive or Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Course Info</th>
                  <th className="px-5 py-3.5">Discipline & Category</th>
                  <th className="px-5 py-3.5">Pricing</th>
                  <th className="px-5 py-3.5">Structure Content</th>
                  <th className="px-5 py-3.5">Enrolled</th>
                  <th className="px-5 py-3.5">Status & Visibility</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredCourses.map((c) => {
                  const isFree = c.courseType === 'free' || c.price === 0;
                  const original = c.originalPrice || (c.price > 0 ? Math.round(c.price * 1.5) : 0);
                  const selling = c.discountPrice || c.price || 0;
                  const discountPct = !isFree && original > selling ? Math.round(((original - selling) / original) * 100) : 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.thumbnail}
                            alt={c.title}
                            className="w-14 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white text-xs block truncate max-w-xs">
                              {c.title}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                              {c.courseCode || c.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {c.discipline || c.category}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {c.subcategory || c.exam}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {isFree ? (
                          <span className="font-bold text-blue-600 dark:text-blue-400">FREE</span>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">₹{selling.toLocaleString()}</span>
                            {original > selling && (
                              <span className="text-[10px] text-slate-400 line-through">
                                ₹{original.toLocaleString()}
                              </span>
                            )}
                            {discountPct > 0 && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold block">
                                {discountPct}% OFF
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-slate-700 dark:text-slate-300 font-semibold block">
                          {c.totalSections || c.modulesCount || 0} Sections
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {c.totalLectures || c.lecturesCount || 0} Lectures • {c.totalPdfs || c.materialsCount || 0} PDFs
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {c.enrolledStudentsCount || 0}
                        </span>
                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">
                          {c.completionRate || 0}% rate
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              c.status === 'published'
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60'
                                : c.status === 'draft'
                                ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {c.status}
                          </span>
                          <span className="block text-[10px] text-slate-500 capitalize">
                            {c.visibility || 'public'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenStructureBuilder(c)}
                            className="px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center gap-1"
                            title="Structure Builder"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            Builder
                          </button>

                          <button
                            onClick={() => handleOpenEditCourse(c)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCourseForPreview(c);
                              setPreviewModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                            title="Preview as Student"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCourseForPublish(c);
                              setPublishModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl"
                            title="Publish Checklist"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDuplicateCourse(c)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteModalCourse(c)}
                            className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded-xl"
                            title="Delete / Archive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          ACTIVE MODALS
      ============================================================ */}

      {/* 1. Create / Edit Course Modal */}
      <CourseFormModal
        isOpen={courseFormOpen}
        course={selectedCourseForEdit}
        instructors={instructors}
        onClose={() => setCourseFormOpen(false)}
        onSave={handleSaveCourse}
      />

      {/* 2. Visual Structure Builder Modal */}
      {selectedCourseForStructure && (
        <CourseStructureBuilderModal
          isOpen={structureBuilderOpen}
          course={selectedCourseForStructure}
          onClose={() => setStructureBuilderOpen(false)}
          onRefreshCourse={async () => {
            await onRefreshCourses();
            // refresh active course state
            const updated = courses.find((c) => c.id === selectedCourseForStructure.id);
            if (updated) setSelectedCourseForStructure(updated);
          }}
          onPreviewLesson={(lesson) => {
            setStructureBuilderOpen(false);
            setSelectedCourseForPreview(selectedCourseForStructure);
            setPreviewModalOpen(true);
          }}
        />
      )}

      {/* 3. Publish Readiness Modal */}
      {selectedCourseForPublish && (
        <CoursePublishModal
          isOpen={publishModalOpen}
          course={selectedCourseForPublish}
          onClose={() => setPublishModalOpen(false)}
          onStatusChanged={async (newStatus) => {
            setNotification({
              type: 'success',
              text: `Course status successfully changed to "${newStatus}".`,
            });
            await onRefreshCourses();
          }}
        />
      )}

      {/* 4. Enrolled Students Roster Modal */}
      {selectedCourseForStudents && (
        <CourseStudentsModal
          isOpen={studentsModalOpen}
          course={selectedCourseForStudents}
          allStudents={allStudents}
          onClose={() => setStudentsModalOpen(false)}
          onRefreshData={onRefreshCourses}
        />
      )}

      {/* 5. Student Preview Modal */}
      {selectedCourseForPreview && (
        <CourseStudentPreviewModal
          isOpen={previewModalOpen}
          course={selectedCourseForPreview}
          onClose={() => setPreviewModalOpen(false)}
        />
      )}

      {/* 6. Confirm Delete / Archive Modal */}
      {deleteModalCourse && (
        <ConfirmationModal
          isOpen={Boolean(deleteModalCourse)}
          title="Delete or Archive Course"
          message={`Are you sure you want to delete "${deleteModalCourse.title}"? If students are actively enrolled in this course, it will be safely archived instead of hard-deleted to protect student access.`}
          confirmLabel={deleting ? 'Processing...' : 'Confirm Delete / Archive'}
          cancelLabel="Cancel"
          isDestructive={true}
          loading={deleting}
          onConfirm={handleDeleteCourse}
          onCancel={() => setDeleteModalCourse(null)}
        />
      )}
    </div>
  );
};
