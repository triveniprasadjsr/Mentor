import React, { useState, useEffect } from 'react';
import { Course, Instructor } from '../../../types';
import { api } from '../../../services/api';
import {
  X,
  BookOpen,
  DollarSign,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  Image,
  Globe,
  Tag,
  Clock,
  Shield,
  Plus,
  Trash2,
  Upload,
  Video,
  Film,
} from 'lucide-react';

interface CourseFormModalProps {
  isOpen: boolean;
  course: Course | null;
  instructors: Instructor[];
  onClose: () => void;
  onSave: (courseData: Partial<Course>) => Promise<void>;
}

export const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  course,
  instructors,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'visibility' | 'curriculum_meta'>('basic');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [shortName, setShortName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [discipline, setDiscipline] = useState('Electrical Engineering');
  const [category, setCategory] = useState('Engineering');
  const [subcategory, setSubcategory] = useState('Power Systems');
  const [exam, setExam] = useState('SSC JE');
  const [subject, setSubject] = useState('Complete Technical Syllabus');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [banner, setBanner] = useState('');
  const [trailerVideoUrl, setTrailerVideoUrl] = useState('');
  const [uploadingTrailer, setUploadingTrailer] = useState(false);
  const [trailerProgress, setTrailerProgress] = useState<string | null>(null);
  const [trailerError, setTrailerError] = useState<string | null>(null);
  const [instructorId, setInstructorId] = useState('inst-1');
  const [language, setLanguage] = useState('Hinglish');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'>('All Levels');

  // Pricing State
  const [isFree, setIsFree] = useState(false);
  const [originalPrice, setOriginalPrice] = useState<number>(4999);
  const [price, setPrice] = useState<number>(1999);
  const [currency, setCurrency] = useState('INR');
  const [validityType, setValidityType] = useState<'lifetime' | 'limited'>('lifetime');
  const [validityDays, setValidityDays] = useState<number>(365);

  // Visibility & Status
  const [status, setStatus] = useState<'draft' | 'published' | 'unpublished' | 'archived'>('draft');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'enrolled_only'>('public');
  const [isFeatured, setIsFeatured] = useState(false);
  const [duration, setDuration] = useState('120+ Hours');

  // Lists
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newReq, setNewReq] = useState('');
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
  const [newOutcome, setNewOutcome] = useState('');

  useEffect(() => {
    if (course) {
      setTitle(course.title || '');
      setShortName(course.shortName || course.title.substring(0, 24));
      setCourseCode(course.courseCode || `CRS-${course.id.slice(-4).toUpperCase()}`);
      setDiscipline(course.discipline || course.category || 'Electrical Engineering');
      setCategory(course.category || 'Engineering');
      setSubcategory(course.subcategory || course.subject || 'Core Engineering');
      setExam(course.exam || 'SSC JE');
      setSubject(course.subject || 'Core Technical');
      setDescription(course.description || '');
      setShortDescription(course.shortDescription || course.subtitle || '');
      setThumbnail(course.thumbnail || '');
      setBanner(course.banner || course.thumbnail || '');
      setTrailerVideoUrl(course.trailerVideoUrl || '');
      setInstructorId(course.instructorId || (instructors[0]?.id || 'inst-1'));
      setLanguage(course.language || 'Hinglish');
      setDifficulty(course.difficulty || 'All Levels');

      const isCourseFree = course.courseType === 'free' || course.price === 0;
      setIsFree(isCourseFree);
      setOriginalPrice(course.originalPrice || (course.price > 0 ? Math.round(course.price * 1.5) : 4999));
      setPrice(course.discountPrice || course.price || 1999);
      setCurrency(course.currency || 'INR');
      setValidityType(course.validityType || 'lifetime');
      setValidityDays(course.validityDays || 365);

      setStatus(course.status || 'draft');
      setVisibility(course.visibility || 'public');
      setIsFeatured(Boolean(course.isFeatured));
      setDuration(course.duration || '100+ Hours');

      setRequirements(course.requirements || []);
      setLearningOutcomes(course.learningOutcomes || []);
    } else {
      // Default new course template
      setTitle('');
      setShortName('');
      setCourseCode(`EE-${Math.floor(100 + Math.random() * 900)}`);
      setDiscipline('Electrical Engineering');
      setCategory('Engineering');
      setSubcategory('Power System');
      setExam('SSC JE');
      setSubject('Technical Core');
      setDescription('Comprehensive preparation course covering all major concepts, formulas, and previous year questions.');
      setShortDescription('Master all technical concepts and numericals with expert guidance.');
      setThumbnail('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80');
      setBanner('https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=1200&auto=format&fit=crop&q=80');
      setInstructorId(instructors[0]?.id || 'inst-1');
      setTrailerVideoUrl('');
      setLanguage('Hinglish');
      setDifficulty('All Levels');
      setIsFree(false);
      setOriginalPrice(4999);
      setPrice(1999);
      setCurrency('INR');
      setValidityType('lifetime');
      setValidityDays(365);
      setStatus('draft');
      setVisibility('public');
      setIsFeatured(false);
      setDuration('120+ Hours');
      setRequirements([
        'Basic understanding of diploma or engineering physics',
        'Dedication of 2 hours daily for video lectures and practice',
      ]);
      setLearningOutcomes([
        'Master core engineering fundamentals and numerical problem solving',
        'Solve 10+ years of previous year exam questions (PYQs)',
        'Access downloadable hand-written formula sheets and notes',
      ]);
    }
    setActiveTab('basic');
    setErrorMsg(null);
  }, [course, instructors, isOpen]);

  if (!isOpen) return null;

  // Real-time calculated discount percentage
  const discountPercent =
    !isFree && originalPrice > 0 && price < originalPrice
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const handleAddRequirement = () => {
    if (!newReq.trim()) return;
    setRequirements([...requirements, newReq.trim()]);
    setNewReq('');
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleAddOutcome = () => {
    if (!newOutcome.trim()) return;
    setLearningOutcomes([...learningOutcomes, newOutcome.trim()]);
    setNewOutcome('');
  };

  const handleRemoveOutcome = (idx: number) => {
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== idx));
  };

  const handleTrailerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingTrailer(true);
      setTrailerError(null);
      setTrailerProgress(`Uploading ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);

      const res = await api.upload(file);
      setTrailerVideoUrl(res.url);
      setTrailerProgress(`Upload complete: ${file.name}`);
    } catch (err: any) {
      setTrailerError(err.message || 'Failed to upload video lecture trailer');
    } finally {
      setUploadingTrailer(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Course Name is required.');
      setActiveTab('basic');
      return;
    }

    if (!isFree) {
      if (price < 0 || originalPrice < 0) {
        setErrorMsg('Pricing cannot be negative.');
        setActiveTab('pricing');
        return;
      }
      if (price > originalPrice) {
        setErrorMsg('Selling Price cannot exceed Original Price.');
        setActiveTab('pricing');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Partial<Course> = {
        title: title.trim(),
        shortName: shortName.trim() || title.trim().substring(0, 24),
        courseCode: courseCode.trim() || `EE-${Date.now().toString().slice(-4)}`,
        discipline,
        category,
        subcategory,
        exam,
        subject,
        description: description.trim(),
        subtitle: shortDescription.trim(),
        shortDescription: shortDescription.trim(),
        thumbnail: thumbnail.trim(),
        banner: banner.trim() || thumbnail.trim(),
        trailerVideoUrl: trailerVideoUrl.trim() || undefined,
        instructorId,
        language,
        difficulty,
        courseType: isFree ? 'free' : 'paid',
        price: isFree ? 0 : Number(originalPrice),
        discountPrice: isFree ? 0 : Number(price),
        originalPrice: isFree ? 0 : Number(originalPrice),
        currency,
        validityType,
        validityDays: validityType === 'limited' ? Number(validityDays) : undefined,
        status,
        visibility,
        isFeatured,
        duration,
        requirements,
        learningOutcomes,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {course ? 'Edit Course Settings & Pricing' : 'Create New Course'}
              </h2>
              <p className="text-xs text-slate-400">
                {course
                  ? `Configuring #${course.courseCode || course.id} • ${course.title}`
                  : 'Configure basic information, syllabus taxonomy, pricing structure, and access control'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-900/60 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'basic'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Basic Information
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'pricing'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Pricing & Access
            {discountPercent > 0 && !isFree && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                {discountPercent}% OFF
              </span>
            )}
            {isFree && (
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-black">
                FREE
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('visibility')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'visibility'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Publishing & Visibility
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('curriculum_meta')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'curriculum_meta'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Outcomes & Prerequisites
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Course Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete Preparation Course on Electrical Engineering"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Course Code / ID</label>
                  <input
                    type="text"
                    placeholder="e.g. EE-SSCJE-2026"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Short Name</label>
                  <input
                    type="text"
                    placeholder="e.g. EE Master Batch"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Discipline</label>
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Computer Science / IT">Computer Science / IT</option>
                    <option value="Non-Technical & General Studies">Non-Technical & General Studies</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Target Exam</label>
                  <select
                    value={exam}
                    onChange={(e) => setExam(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="SSC JE">SSC JE (CBT 1 & 2)</option>
                    <option value="RRB JE">RRB JE (Stage 1 & 2)</option>
                    <option value="State AE/JE">State PSC AE/JE (UPPCL, BPSC, etc.)</option>
                    <option value="GATE & ESE">GATE & ESE</option>
                    <option value="All Engineering Exams">All Engineering Exams</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Category & Subcategory</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Category e.g. Engineering"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Sub e.g. Power System"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Faculty / Lead Instructor</label>
                  <select
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.qualification})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Short Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Complete CBT-1 & CBT-2 coverage with theory, numericals, hand-written notes, and PYQs"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Complete Course Description</label>
                <textarea
                  rows={4}
                  placeholder="Detailed course overview, syllabus outline, methodology..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Hinglish">Hinglish (Hindi + English)</option>
                    <option value="English">English</option>
                    <option value="Hindi">Pure Hindi</option>
                    <option value="Bilingual">Bilingual</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="All Levels">All Levels (Beginner to Advanced)</option>
                    <option value="Beginner">Beginner (Foundational)</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced (CBT-2 / Numericals)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Estimated Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 180+ Hours"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Course Thumbnail URL</span>
                    <button
                      type="button"
                      onClick={() =>
                        setThumbnail(
                          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
                        )
                      }
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      Use High-Res Sample
                    </button>
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-24 rounded-xl object-cover border border-slate-800 mt-1"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Course Banner Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {banner && (
                    <img
                      src={banner}
                      alt="Banner preview"
                      className="w-full h-24 rounded-xl object-cover border border-slate-800 mt-1"
                    />
                  )}
                </div>
              </div>

              {/* Course Trailer / Demo Video Lecture Upload */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Course Demo / Trailer Video Lecture</span>
                  </div>
                  <span className="text-[10px] text-slate-400">MP4, WebM, MOV, MKV up to 500MB</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Upload an introductory video lecture or free preview trailer visible to prospective students before enrolling.
                </p>

                <div className="p-4 rounded-xl border-2 border-dashed border-indigo-900/50 bg-indigo-950/20 hover:border-indigo-500 transition-all text-center space-y-2">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-1">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-200">
                      Upload Video Lecture File
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Supports direct upload from computer or external URL
                    </p>
                  </div>

                  <label className="inline-block mt-2">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,video/*"
                      disabled={uploadingTrailer}
                      onChange={handleTrailerFileUpload}
                      className="hidden"
                    />
                    <span className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors">
                      {uploadingTrailer ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Uploading Video...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          Browse & Upload Video Lecture
                        </>
                      )}
                    </span>
                  </label>

                  {trailerProgress && (
                    <p className="text-[11px] text-emerald-400 font-semibold pt-1">
                      {trailerProgress}
                    </p>
                  )}

                  {trailerError && (
                    <p className="text-[11px] text-rose-400 font-semibold pt-1">
                      {trailerError}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">
                    Or Enter Video Lecture Stream URL / YouTube Link:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /uploads/lecture-demo.mp4 or https://youtube.com/watch?v=..."
                    value={trailerVideoUrl}
                    onChange={(e) => setTrailerVideoUrl(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {trailerVideoUrl && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Video Lecture Player Preview:
                    </span>
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black max-h-[200px]">
                      {trailerVideoUrl.includes('youtube.com') || trailerVideoUrl.includes('youtu.be') ? (
                        <iframe
                          src={
                            trailerVideoUrl.includes('watch?v=')
                              ? `https://www.youtube.com/embed/${new URL(trailerVideoUrl).searchParams.get('v')}?rel=0`
                              : `https://www.youtube.com/embed/${trailerVideoUrl.split('youtu.be/')[1]?.split('?')[0]}?rel=0`
                          }
                          className="w-full h-full border-0"
                          title="Video Trailer Preview"
                        />
                      ) : (
                        <video
                          src={trailerVideoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & ACCESS CONFIGURATION */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              {/* Free vs Paid Toggle Card */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Course Access Pricing Model
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Toggle whether this course is completely free for all students or requires purchase.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${!isFree ? 'text-slate-400' : 'text-blue-400'}`}>
                    Free Course
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!isFree}
                      onChange={(e) => setIsFree(!e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className={`text-xs font-bold ${!isFree ? 'text-emerald-400' : 'text-slate-400'}`}>
                    Paid Course
                  </span>
                </div>
              </div>

              {!isFree ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="INR">₹ INR (Indian Rupee)</option>
                        <option value="USD">$ USD (US Dollar)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Original Price (MRP)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                          {currency === 'INR' ? '₹' : '$'}
                        </span>
                        <input
                          type="number"
                          min={0}
                          placeholder="4999"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(Number(e.target.value))}
                          className="w-full pl-8 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Selling / Discounted Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                          {currency === 'INR' ? '₹' : '$'}
                        </span>
                        <input
                          type="number"
                          min={0}
                          placeholder="1999"
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          className="w-full pl-8 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculated Discount Card Display */}
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-black">
                        %
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                          Live Discount Display
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-lg font-black text-white">
                            {currency === 'INR' ? '₹' : '$'}
                            {price.toLocaleString()}
                          </span>
                          {originalPrice > price && (
                            <span className="text-xs text-slate-400 line-through">
                              {currency === 'INR' ? '₹' : '$'}
                              {originalPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
                            {discountPercent}% OFF
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 text-right">
                      Students save{' '}
                      <span className="text-emerald-400 font-bold">
                        {currency === 'INR' ? '₹' : '$'}
                        {(originalPrice - price).toLocaleString()}
                      </span>{' '}
                      with this configuration.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-black text-xs">
                    FREE ACCESS COURSE
                  </span>
                  <p className="text-xs text-slate-300">
                    Pricing fields are currently disabled. Any student registered on the platform will be able to enroll and access materials with zero cost.
                  </p>
                </div>
              )}

              {/* Course Validity & Expiry */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Access Validity Period
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                      validityType === 'lifetime'
                        ? 'bg-slate-900 border-emerald-500/60'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="validity"
                      checked={validityType === 'lifetime'}
                      onChange={() => setValidityType('lifetime')}
                      className="text-emerald-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Lifetime Access</span>
                      <span className="text-[10px] text-slate-400">
                        Students have unlimited access with no expiration date.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                      validityType === 'limited'
                        ? 'bg-slate-900 border-emerald-500/60'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="validity"
                      checked={validityType === 'limited'}
                      onChange={() => setValidityType('limited')}
                      className="text-emerald-600"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-white block">
                        Subscription / Validity in Days
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min={1}
                          disabled={validityType !== 'limited'}
                          value={validityDays}
                          onChange={(e) => setValidityDays(Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                        />
                        <span className="text-[11px] text-slate-400">days from enrollment</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PUBLISHING & VISIBILITY */}
          {activeTab === 'visibility' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Course Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="draft">Draft (Work in progress, hidden from public)</option>
                    <option value="published">Published (Live & available for enrollment)</option>
                    <option value="unpublished">Unpublished (Hidden from public catalog)</option>
                    <option value="archived">Archived (Closed for new sales)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Audience Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="public">Public (Visible on home & catalog pages)</option>
                    <option value="private">Private (Only accessible via direct link)</option>
                    <option value="enrolled_only">Enrolled Students Only</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Featured on Home Page
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Highlight this course on the homepage carousel and top exam cards.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: OUTCOMES & PREREQUISITES */}
          {activeTab === 'curriculum_meta' && (
            <div className="space-y-6">
              {/* Learning Outcomes */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>What Students Will Learn (Learning Outcomes)</span>
                  <span className="text-[10px] text-slate-500">{learningOutcomes.length} items</span>
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Master single phase and three phase transformer testing methods..."
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOutcome();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddOutcome}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {learningOutcomes.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-200"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOutcome(idx)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements & Prerequisites */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Requirements & Prerequisites</span>
                  <span className="text-[10px] text-slate-500">{requirements.length} items</span>
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Diploma or B.Tech in Electrical / allied disciplines..."
                    value={newReq}
                    onChange={(e) => setNewReq(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {requirements.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-200"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(idx)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Course...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{course ? 'Update Course' : 'Create Course'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
