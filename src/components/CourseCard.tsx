import React, { useState, useRef } from 'react';
import { Course } from '../types';
import { Clock, PlayCircle, FileText, Star, ArrowRight, ShoppingCart } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onView: (slug: string) => void;
  onBuy: (courseId: string) => void;
  isEnrolled?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onView, onBuy, isEnrolled }) => {
  const discountPercent = course.price > course.discountPrice
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0;

  // 3D Parallax Tilt & Glare state
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // smooth tilt angle
    const rotateY = ((x - centerX) / centerX) * 10;

    setCardRotate({ x: rotateX, y: rotateY });
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    setCardRotate({ x: 0, y: 0 });
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div className="perspective-[1000px]">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: cardRotate.x === 0 ? 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'transform 0.1s ease-out',
        }}
        className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-300 dark:hover:border-indigo-700/80 transition-shadow duration-300 flex flex-col overflow-hidden will-change-transform"
      >
        {/* Specular 3D Glare Reflection */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glarePos.opacity}) 0%, transparent 60%)`,
          }}
        />
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-950 cursor-pointer" onClick={() => onView(course.slug)}>
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-900/85 backdrop-blur-md text-white shadow-sm">
            {course.exam}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-600/90 backdrop-blur-md text-white">
            {course.category}
          </span>
        </div>

        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-rose-600 text-white text-xs font-extrabold px-2 py-1 rounded-md shadow-md animate-pulse">
            {discountPercent}% OFF
          </div>
        )}

        {isEnrolled && (
          <div className="absolute bottom-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
            ✓ Enrolled
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Level */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <div className="flex items-center gap-1 font-semibold text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{course.rating || 4.9}</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal">({course.enrolledStudentsCount || 0} students)</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
              {course.difficulty}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onView(course.slug)}
            className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {course.title}
          </h3>

          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {course.subtitle || course.description}
          </p>

          {/* Instructor snippet */}
          {course.instructor && (
            <div className="mt-3 flex items-center gap-2">
              <img
                src={course.instructor.photo}
                alt={course.instructor.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                {course.instructor.name}
              </span>
            </div>
          )}

          {/* Metadata chips */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{course.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <PlayCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{course.lecturesCount || 0} Lectures</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{course.materialsCount || 0} PDFs</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                ₹{course.discountPrice.toLocaleString('en-IN')}
              </span>
              {course.price > course.discountPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{course.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider block">
              {course.courseType === 'free' || course.price === 0
                ? 'Free Enrollment'
                : course.validityType === 'limited' && course.validityDays
                ? `${course.validityDays} Days Validity`
                : 'Lifetime Access'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onView(course.slug)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              View
            </button>

            {isEnrolled ? (
              <button
                onClick={() => onView(course.slug)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
              >
                Learn
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onBuy(course.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 dark:shadow-none transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Buy Course
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
