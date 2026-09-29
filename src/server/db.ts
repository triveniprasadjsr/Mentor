import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Instructor,
  Course,
  Module,
  Lesson,
  Quiz,
  QuizSubmission,
  Assignment,
  AssignmentSubmission,
  Payment,
  Enrollment,
  CourseProgress,
  Notification,
  Announcement,
  SiteSettings,
  AuditLog,
  ContactMessage,
} from '../types';

const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const ROOT_DATA_DIR = path.resolve(process.cwd(), 'data');
const SEED_DB_FILE = path.resolve(ROOT_DATA_DIR, 'db.json');
const RUNTIME_DATA_DIR = isVercel ? path.resolve('/tmp', 'data') : ROOT_DATA_DIR;
const DB_FILE = path.resolve(RUNTIME_DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  instructors: Instructor[];
  courses: Course[];
  modules: Module[];
  lessons: Lesson[];
  quizzes: Quiz[];
  quizSubmissions: QuizSubmission[];
  assignments: Assignment[];
  assignmentSubmissions: AssignmentSubmission[];
  payments: Payment[];
  enrollments: Enrollment[];
  progress: CourseProgress[];
  notifications: Notification[];
  announcements: Announcement[];
  settings: SiteSettings;
  auditLogs: AuditLog[];
  contactMessages: ContactMessage[];
}

function ensureDataDir() {
  if (!fs.existsSync(RUNTIME_DATA_DIR)) {
    try {
      fs.mkdirSync(RUNTIME_DATA_DIR, { recursive: true });
    } catch (err) {
      console.warn('Could not create runtime data directory:', err);
    }
  }
}

function generateInitialData(): DatabaseSchema {
  // Hash passwords
  const adminSalt = bcrypt.genSaltSync(10);
  const initialAdminPass = process.env.ADMIN_PASSWORD || 'A23741';
  const adminPasswordHash = bcrypt.hashSync(initialAdminPass, adminSalt);

  const studentSalt = bcrypt.genSaltSync(10);
  const studentPasswordHash = bcrypt.hashSync('323741', studentSalt);

  const now = new Date().toISOString();

  const instructors: Instructor[] = [
    {
      id: 'inst-1',
      name: 'Er. Rajiv Sharma',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      qualification: 'M.Tech (Power Systems, IIT Delhi), Ex-IES',
      experience: '12+ Years Teaching Experience for SSC JE & RRB JE',
      subjects: ['Circuit Theory', 'Electrical Machines', 'Power Systems'],
      examExpertise: ['SSC JE', 'RRB JE', 'UPPCL AE/JE', 'State PSC AE'],
      bio: 'Er. Rajiv Sharma has trained over 45,000+ engineering aspirants with hundreds of top-100 ranks across national engineering examinations. Known for his intuitive visual explanation of electrical machines.',
      rating: 4.9,
      totalStudents: 14200,
      coursesCount: 3,
      createdAt: now,
    },
    {
      id: 'inst-2',
      name: 'Er. Ananya Sen',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      qualification: 'M.Tech (IIT Roorkee), Gold Medalist',
      experience: '9+ Years in Technical & Non-Tech Aptitude for Engineering Exams',
      subjects: ['Basic Electronics', 'Measurement & Instrumentation', 'Engineering Mathematics'],
      examExpertise: ['RRB JE CBT 1 & 2', 'SSC JE', 'DMRC JE'],
      bio: 'Specialist in simplifying complex instrumentation diagrams and non-technical quantitative sections for diploma and degree engineers.',
      rating: 4.85,
      totalStudents: 11800,
      coursesCount: 2,
      createdAt: now,
    },
    {
      id: 'inst-3',
      name: 'Er. Vikram Patel',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      qualification: 'B.Tech (Civil Engineering, IIT BHU), Senior Structural Consultant',
      experience: '14+ Years in AE/JE Coaching & Infrastructure Consulting',
      subjects: ['Strength of Materials (SOM)', 'RCC Structures', 'Fluid Mechanics', 'Surveying'],
      examExpertise: ['State AE/JE', 'SSC JE Civil', 'BPSC AE', 'UKPSC JE'],
      bio: 'Authored 4 best-selling study guides for Civil Engineering competitive exams with practical field examples and short tricks.',
      rating: 4.92,
      totalStudents: 16500,
      coursesCount: 2,
      createdAt: now,
    },
  ];

  const courses: Course[] = [
    {
      id: 'course-1',
      title: 'SSC JE 2026: Electrical Engineering Comprehensive Master Batch',
      slug: 'ssc-je-2026-electrical-engineering-master-batch',
      subtitle: 'Complete CBT-1 & CBT-2 coverage with theory, numericals, hand-written notes, and PYQs',
      description: 'The definitive all-in-one preparation program for SSC JE Electrical aspirants. Covers Circuit Laws, AC Fundamentals, Magnetic Circuits, Electrical Machines (Transformers, DC Machines, Synchronous & Induction Motors), Generation & Transmission, Switchgear, Estimation & Costing, Basic Electronics, and General Science non-tech support.',
      category: 'Electrical Engineering',
      exam: 'SSC JE',
      subject: 'Complete Technical Syllabus',
      instructorId: 'inst-1',
      price: 2499,
      discountPrice: 1499,
      thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      duration: '180+ Hours',
      language: 'Hinglish (Hindi + English Technical Terms)',
      difficulty: 'All Levels',
      requirements: [
        'Diploma or B.Tech/B.E. in Electrical / EEE Engineering',
        'Basic understanding of 10th/12th physics and algebra',
        'Dedication of at least 2-3 hours daily for video lectures and revision',
      ],
      learningOutcomes: [
        'Master all SSC JE CBT-1 & CBT-2 Technical concepts with high numerical solving speed',
        'Solve 15+ years of previous year questions (PYQs) with shortcut techniques',
        'Access downloadable hand-written formula sheets and lecture PDF notes',
        'Practice with chapter-wise and full-length timed quizzes',
      ],
      status: 'published',
      isFeatured: true,
      modulesCount: 3,
      lecturesCount: 8,
      materialsCount: 4,
      enrolledStudentsCount: 384,
      rating: 4.9,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course-2',
      title: 'RRB JE 2026: CBT-1 + CBT-2 Technical & Non-Tech Super Batch',
      slug: 'rrb-je-2026-cbt1-cbt2-super-batch',
      subtitle: 'Guaranteed syllabus completion with Mathematics, General Science, Reasoning & Core Technical',
      description: 'Specially engineered for Railway Recruitment Board Junior Engineer (RRB JE). Includes comprehensive coverage of CBT-1 (Maths, General Intelligence & Reasoning, General Awareness, General Science) and CBT-2 Stage-wise technical topics with mock test series.',
      category: 'Electrical & Electronics',
      exam: 'RRB JE',
      subject: 'CBT 1 + CBT 2 Combined',
      instructorId: 'inst-2',
      price: 2999,
      discountPrice: 1999,
      thumbnail: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&auto=format&fit=crop&q=80',
      duration: '220+ Hours',
      language: 'Hinglish',
      difficulty: 'All Levels',
      requirements: [
        'Diploma / Degree in Engineering or allied disciplines',
        'Smartphone or PC with internet connection',
      ],
      learningOutcomes: [
        'Clear RRB JE CBT-1 cutoff with high scores in Non-Tech sections',
        'Technical domain excellence in basic electrical, analog electronics and computer fundamentals',
        'Mock test analysis with ranking and speed optimization',
      ],
      status: 'published',
      isFeatured: true,
      modulesCount: 2,
      lecturesCount: 6,
      materialsCount: 3,
      enrolledStudentsCount: 512,
      rating: 4.85,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course-3',
      title: 'State AE/JE Civil Engineering: Structural & Soil Mechanics Special',
      slug: 'state-ae-je-civil-structural-soil-mechanics',
      subtitle: 'In-depth mastery of SOM, RCC, Soil Mechanics, Fluid Mechanics & Surveying for State PSCs',
      description: 'Engineered specifically for State Public Service Commission Assistant Engineer (AE) and Junior Engineer (JE) examinations (such as UPPSC AE, BPSC AE, MPPSC, UKPSC, RSMSSB JE, WBPSC). Thorough derivation, code specifications (IS 456, IS 800), and practical question banks.',
      category: 'Civil Engineering',
      exam: 'State AE/JE',
      subject: 'Civil Core Mechanics',
      instructorId: 'inst-3',
      price: 2199,
      discountPrice: 1299,
      thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
      duration: '150+ Hours',
      language: 'Hindi & English',
      difficulty: 'Intermediate',
      requirements: ['Diploma or Degree in Civil Engineering'],
      learningOutcomes: [
        'Instant recall of Indian Standard Code formulas and clauses',
        'Mastery over Bending Moment and Shear Force diagrams',
        'Complete command over Soil Geotechnical indices and foundation engineering',
      ],
      status: 'published',
      isFeatured: true,
      modulesCount: 2,
      lecturesCount: 5,
      materialsCount: 3,
      enrolledStudentsCount: 270,
      rating: 4.93,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course-4',
      title: 'Junior Engineer Mechanical Engineering: Thermal & Fluid Power Complete Suite',
      slug: 'junior-engineer-mechanical-thermal-fluid-power',
      subtitle: 'Thermodynamics, IC Engines, Power Plant, Fluid Mechanics & Strength of Materials',
      description: 'Comprehensive preparation module for Junior Engineer Mechanical positions across SSC, RRB, State Electricity Boards and Metro Rail corporations.',
      category: 'Mechanical Engineering',
      exam: 'Junior Engineer',
      subject: 'Thermal & Fluid Engineering',
      instructorId: 'inst-1',
      price: 1899,
      discountPrice: 999,
      thumbnail: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
      duration: '140+ Hours',
      language: 'Hinglish',
      difficulty: 'Beginner',
      requirements: ['Diploma or Degree in Mechanical / Automobile Engineering'],
      learningOutcomes: [
        'Complete mastery of thermodynamic cycles: Carnot, Otto, Diesel, Dual, Rankine',
        'Fluid properties, Bernoulli equation, and flow measurement devices',
        'PYQ question-solving for mechanical JE positions',
      ],
      status: 'published',
      isFeatured: false,
      modulesCount: 2,
      lecturesCount: 4,
      materialsCount: 2,
      enrolledStudentsCount: 195,
      rating: 4.8,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const modules: Module[] = [
    // Course 1 Modules
    {
      id: 'mod-1',
      courseId: 'course-1',
      title: 'Module 1: Basic Electrical Laws & Network Theorems',
      order: 1,
      description: 'Foundational concepts of circuit theory, Kirchhoff laws, node/mesh analysis and network theorems.',
      lessons: [],
      createdAt: now,
    },
    {
      id: 'mod-2',
      courseId: 'course-1',
      title: 'Module 2: Electrical Machines - Transformers & DC Machines',
      order: 2,
      description: 'In-depth analysis of single phase and three phase transformers, autotransformers and DC generators/motors.',
      lessons: [],
      createdAt: now,
    },
    {
      id: 'mod-3',
      courseId: 'course-1',
      title: 'Module 3: AC Fundamentals & Magnetic Circuits',
      order: 3,
      description: 'Phasor representations, series and parallel resonance, magnetic circuits and hysteresis.',
      lessons: [],
      createdAt: now,
    },
    // Course 2 Modules
    {
      id: 'mod-4',
      courseId: 'course-2',
      title: 'Module 1: General Science & CBT-1 Non-Technical Strategy',
      order: 1,
      description: 'Physics, Chemistry, and Life Sciences from NCERT standards with exam tricks.',
      lessons: [],
      createdAt: now,
    },
    {
      id: 'mod-5',
      courseId: 'course-2',
      title: 'Module 2: Basic Electronics & Digital Fundamentals',
      order: 2,
      description: 'Semiconductor physics, PN junction diodes, BJT, Op-Amps and Logic Gates.',
      lessons: [],
      createdAt: now,
    },
    // Course 3 Modules
    {
      id: 'mod-6',
      courseId: 'course-3',
      title: 'Module 1: Strength of Materials (SOM) & Stress Analysis',
      order: 1,
      description: 'Simple stresses and strains, SFD/BMD, principal stresses, Mohr circle and deflection of beams.',
      lessons: [],
      createdAt: now,
    },
    {
      id: 'mod-7',
      courseId: 'course-3',
      title: 'Module 2: RCC Design & IS 456 Specifications',
      order: 1,
      description: 'Limit state design philosophy, singly and doubly reinforced beams, shear and development length.',
      lessons: [],
      createdAt: now,
    },
  ];

  const lessons: Lesson[] = [
    // Mod 1 lessons
    {
      id: 'les-1',
      moduleId: 'mod-1',
      courseId: 'course-1',
      title: 'Lecture 1: Ohm’s Law, Node Analysis & KCL/KVL Applications',
      order: 1,
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      videoDuration: '42:15',
      contentText: 'Detailed derivation of Kirchhoff Current Law (KCL) and Kirchhoff Voltage Law (KVL) with reference polarity conventions.',
      isFreePreview: true, // FREE PREVIEW!
      createdAt: now,
    },
    {
      id: 'les-2',
      moduleId: 'mod-1',
      courseId: 'course-1',
      title: 'Lecture 2: Thevenin & Norton Equivalent Circuit Theorems',
      order: 2,
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      videoDuration: '38:40',
      contentText: 'Step-by-step conversion of complex active networks into Thevenin voltage and Norton current sources.',
      isFreePreview: false,
      createdAt: now,
    },
    {
      id: 'les-3',
      moduleId: 'mod-1',
      courseId: 'course-1',
      title: 'Lecture 3: Maximum Power Transfer & Superposition Theorems',
      order: 3,
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      videoDuration: '45:10',
      contentText: 'Proof of Maximum Power Transfer for DC and AC circuits, with condition for maximum efficiency.',
      isFreePreview: false,
      createdAt: now,
    },
    {
      id: 'les-4',
      moduleId: 'mod-1',
      courseId: 'course-1',
      title: 'Study Material: Circuit Theory Hand-written Master Notes & Formula Book',
      order: 4,
      type: 'pdf',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      contentText: 'Complete 35-page hand-written formula book covering sign conventions, mesh equations, star-delta transformations and quick revision tables.',
      isFreePreview: true, // Free preview material
      createdAt: now,
    },
    {
      id: 'les-5',
      moduleId: 'mod-1',
      courseId: 'course-1',
      title: 'Quiz: Circuit Theory & Network Laws Assessment',
      order: 5,
      type: 'quiz',
      quizId: 'quiz-1',
      contentText: 'Test your understanding of basic laws, node voltages, and equivalent resistance calculations.',
      isFreePreview: false,
      createdAt: now,
    },
    // Mod 2 lessons
    {
      id: 'les-6',
      moduleId: 'mod-2',
      courseId: 'course-1',
      title: 'Lecture 4: Single Phase Transformer Construction & EMF Equation',
      order: 1,
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      videoDuration: '51:20',
      contentText: 'Core and shell type construction, laminations to reduce eddy current loss, and exact EMF equation derivation.',
      isFreePreview: false,
      createdAt: now,
    },
    {
      id: 'les-7',
      moduleId: 'mod-2',
      courseId: 'course-1',
      title: 'Study Material: Transformer Losses, Efficiency & Voltage Regulation Sheet',
      order: 2,
      type: 'pdf',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      contentText: 'Includes open-circuit and short-circuit test calculations, all-day efficiency vs power efficiency equations.',
      isFreePreview: false,
      createdAt: now,
    },
    {
      id: 'les-8',
      moduleId: 'mod-2',
      courseId: 'course-1',
      title: 'Assignment: Numerical Problem Set on Auto-Transformer Copper Saving',
      order: 3,
      type: 'assignment',
      assignmentId: 'assign-1',
      contentText: 'Solve 5 standard numerical problems demonstrating copper weight reduction in autotransformers compared to 2-winding transformers.',
      isFreePreview: false,
      createdAt: now,
    },
    // Course 2 lessons
    {
      id: 'les-9',
      moduleId: 'mod-4',
      courseId: 'course-2',
      title: 'Lecture 1: General Science Physics - Kinematics, Work & Energy',
      order: 1,
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      videoDuration: '35:00',
      contentText: 'Newton laws of motion, conservation of momentum, work-energy theorem with RRB JE PYQ pattern.',
      isFreePreview: true,
      createdAt: now,
    },
    {
      id: 'les-10',
      moduleId: 'mod-4',
      courseId: 'course-2',
      title: 'Lecture 2: Quantitative Aptitude - Percentages, Profit & Loss Fast Track',
      order: 2,
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      videoDuration: '40:15',
      contentText: 'Fraction-to-percentage conversion tables and shortcut tricks for CBT-1.',
      isFreePreview: false,
      createdAt: now,
    },
    // Course 3 lessons
    {
      id: 'les-11',
      moduleId: 'mod-6',
      courseId: 'course-3',
      title: 'Lecture 1: Direct Stress & Strain, Elastic Constants Relationship',
      order: 1,
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      videoDuration: '48:30',
      contentText: 'Young modulus, Bulk modulus, Shear modulus and Poisson ratio relations (E, G, K, mu) for civil aspirants.',
      isFreePreview: true,
      createdAt: now,
    },
    {
      id: 'les-12',
      moduleId: 'mod-6',
      courseId: 'course-3',
      title: 'Study Material: SOM Complete Formulas and Mohr Circle Cheat Sheet',
      order: 2,
      type: 'pdf',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      contentText: 'Essential formula summary for State AE examinations.',
      isFreePreview: false,
      createdAt: now,
    },
  ];

  const quizzes: Quiz[] = [
    {
      id: 'quiz-1',
      lessonId: 'les-5',
      courseId: 'course-1',
      title: 'Circuit Theory & Basic Network Theorems Assessment',
      timeLimitMinutes: 15,
      totalMarks: 10,
      passPercentage: 60,
      questions: [
        {
          id: 'q-1',
          question: 'According to Kirchhoff Current Law (KCL), the algebraic sum of currents entering a node is equal to:',
          options: [
            'Zero',
            'Sum of voltages in the loop',
            'The total power dissipated',
            'Infinity in high impedance nodes',
          ],
          correctOption: 0,
          explanation: 'KCL is based on the law of conservation of electric charge: sum of entering currents = sum of leaving currents, i.e., algebraic sum = 0.',
          marks: 2,
        },
        {
          id: 'q-2',
          question: 'Thevenin theorem replaces an active two-terminal linear network by:',
          options: [
            'An ideal current source in parallel with resistance',
            'An ideal voltage source in series with resistance',
            'An ideal voltage source in parallel with inductance',
            'A pure resistance with no source',
          ],
          correctOption: 1,
          explanation: 'Thevenin equivalent consists of an open-circuit voltage source (Vth) in series with equivalent resistance (Rth).',
          marks: 2,
        },
        {
          id: 'q-3',
          question: 'Under the condition of Maximum Power Transfer in a DC network, the power transfer efficiency is:',
          options: ['100%', '75%', '50%', '25%'],
          correctOption: 2,
          explanation: 'When load resistance equals internal source resistance (RL = Rth), half the total generated power is dissipated in Rth and half in RL, giving 50% efficiency.',
          marks: 2,
        },
        {
          id: 'q-4',
          question: 'Which of the following theorems can be applied to both linear and non-linear networks?',
          options: [
            'Superposition Theorem',
            'Thevenin Theorem',
            'Tellegen Theorem',
            'Norton Theorem',
          ],
          correctOption: 2,
          explanation: 'Tellegen theorem is applicable to any lumped network whether linear or non-linear, passive or active, time-invariant or time-varying.',
          marks: 2,
        },
        {
          id: 'q-5',
          question: 'In a series RLC circuit at resonant frequency, the power factor of the circuit is:',
          options: ['Zero lagging', 'Zero leading', '0.707 lagging', 'Unity'],
          correctOption: 3,
          explanation: 'At resonance, inductive reactance cancels capacitive reactance (XL = XC), so impedance is purely resistive (Z = R) and power factor is unity (cos 0 = 1).',
          marks: 2,
        },
      ],
    },
  ];

  const assignments: Assignment[] = [
    {
      id: 'assign-1',
      lessonId: 'les-8',
      courseId: 'course-1',
      title: 'Transformer Efficiency & Copper Saving Calculation Problem Set',
      instructions: 'Review the problem statements in the lecture. Calculate the percentage saving of copper in a 220V/110V auto-transformer compared to a standard 2-winding transformer. Show full calculation steps.',
      attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      totalMarks: 20,
      deadline: '2026-12-31',
    },
  ];

  const users: (User & { passwordHash: string })[] = [
    {
      id: 'usr-admin-1',
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@techsetu.com',
      phone: '+91 9876543210',
      role: 'admin',
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      city: 'New Delhi',
      state: 'Delhi',
      status: 'active',
      passwordHash: adminPasswordHash,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-student-1',
      name: 'Aman Kumar Verma',
      email: 'student@test.com',
      phone: '+91 9123456780',
      role: 'student',
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      dob: '2001-05-14',
      city: 'Patna',
      state: 'Bihar',
      status: 'active',
      passwordHash: studentPasswordHash,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const payments: Payment[] = [
    {
      id: 'pay-seed-1',
      orderId: 'ORD-20260925-001',
      studentId: 'usr-student-1',
      studentName: 'Aman Kumar Verma',
      studentEmail: 'student@test.com',
      studentPhone: '+91 9123456780',
      courseId: 'course-1',
      courseTitle: 'SSC JE 2026: Electrical Engineering Comprehensive Master Batch',
      amount: 1499,
      paymentMethod: 'manual_upi',
      transactionId: 'UPI428910482910',
      receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      status: 'approved',
      adminNote: 'Verified via bank statement UTR matching.',
      submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      reviewedAt: new Date(Date.now() - 86400000 * 1.8).toISOString(),
      reviewedBy: 'admin@techsetu.com',
    },
    {
      id: 'pay-seed-2',
      orderId: 'ORD-20260925-002',
      studentId: 'usr-student-1',
      studentName: 'Aman Kumar Verma',
      studentEmail: 'student@test.com',
      studentPhone: '+91 9123456780',
      courseId: 'course-2',
      courseTitle: 'RRB JE 2026: CBT-1 + CBT-2 Technical & Non-Tech Super Batch',
      amount: 1999,
      paymentMethod: 'manual_upi',
      transactionId: 'UPI881928301948',
      receiptUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      status: 'pending',
      adminNote: '',
      submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ];

  const enrollments: Enrollment[] = [
    {
      id: 'enr-seed-1',
      studentId: 'usr-student-1',
      courseId: 'course-1',
      paymentId: 'pay-seed-1',
      status: 'active',
      enrolledAt: new Date(Date.now() - 86400000 * 1.8).toISOString(),
      grantedBy: 'payment_approval',
      progressPercentage: 40,
    },
  ];

  const progress: CourseProgress[] = [
    {
      id: 'prog-seed-1',
      studentId: 'usr-student-1',
      courseId: 'course-1',
      completedLessonIds: ['les-1', 'les-4'],
      lastAccessedLessonId: 'les-2',
      progressPercentage: 40,
      lastAccessedAt: new Date().toISOString(),
    },
  ];

  const notifications: Notification[] = [
    {
      id: 'notif-1',
      userId: 'usr-student-1',
      title: 'Course Access Activated! 🎉',
      message: 'Your payment of ₹1,499 for SSC JE 2026 Electrical has been verified and approved. Start learning now!',
      link: '/dashboard',
      type: 'success',
      read: false,
      createdAt: new Date(Date.now() - 86400000 * 1.8).toISOString(),
    },
    {
      id: 'notif-2',
      userId: 'admin',
      title: 'New Payment Pending Verification',
      message: 'Student Aman Kumar Verma submitted receipt for RRB JE 2026 (₹1,999, UTR: UPI881928301948).',
      link: '/admin',
      type: 'info',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ];

  const announcements: Announcement[] = [
    {
      id: 'ann-1',
      courseId: 'all',
      title: 'Special Live Doubt Clearance Session on Sunday at 7 PM IST',
      content: 'All enrolled students for SSC JE & RRB JE batches are invited to the live session covering difficult circuit numericals and test strategy.',
      authorName: 'Er. Rajiv Sharma',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const settings: SiteSettings = {
    siteName: 'TechSetu Education',
    tagline: 'Premier Learning Platform for JE & AE Competitive Technical Examinations',
    logoUrl: '',
    contactEmail: 'support@techsetu.com',
    contactPhone: '+91 98765 43210',
    address: 'TechSetu Knowledge Park, Sector 62, Noida, Uttar Pradesh 201309',
    currencySymbol: '₹',
    upiId: 'techsetu@upi',
    upiAccountHolder: 'TechSetu Education Services Pvt Ltd',
    upiQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=techsetu@upi&pn=TechSetu%20Education&cu=INR',
    paymentInstructions: '1. Scan the QR code or use the UPI ID: techsetu@upi via Google Pay, PhonePe, Paytm, or BHIM.\n2. Enter the exact course discount price.\n3. Complete payment in your banking app.\n4. Take a clear screenshot of the transaction showing the 12-digit UTR / Reference number.\n5. Fill in the form below and submit. Our admin verifies records within 15-60 minutes.',
    heroTitle: 'Learn. Prepare. Succeed.',
    heroSubtitle: 'Structured courses, expert instructors, video lectures and study materials for JE and AE competitive examinations.',
    aboutContent: 'TechSetu is India\'s dedicated preparation ecosystem engineered exclusively for engineering graduates and diploma holders aiming to crack SSC JE, RRB JE, State Public Service Commission Assistant Engineer (AE), Electricity Board exams, and PSU technical roles. Led by former IES officers and IIT alumni, our faculty delivers concept-first pedagogical excellence with complete syllabus accountability.',
    privacyPolicy: 'TechSetu respects user privacy. We do not sell or trade student personal records. All data, payment proofs, and learning records are securely encrypted and retained strictly for course delivery and academic verification.',
    termsPolicy: 'By purchasing or enrolling in TechSetu courses, students agree to strictly educational usage. Screen recording, downloading for unauthorized distribution, or credential sharing is strictly prohibited and subject to account suspension without refund.',
    refundPolicy: 'Due to instant access to digital proprietary video lectures and downloadable notes, refunds are only processed if requested within 24 hours of enrollment prior to accessing more than 10% of lecture materials. Transaction fees may apply.',
    enableManualPayment: true,
    enableOnlinePayment: true,
    announcementBanner: '🚀 Admissions Open for 2026 Engineering Exam Batches! Flat 40% Off with Early Bird Offer.',
  };

  const auditLogs: AuditLog[] = [
    {
      id: 'audit-1',
      adminEmail: 'admin@techsetu.com',
      action: 'INITIAL_SYSTEM_BOOTSTRAP',
      entityType: 'System',
      entityId: 'sys-0',
      details: 'Platform initialized with seed courses, instructors, and secure security controls.',
      timestamp: now,
    },
    {
      id: 'audit-2',
      adminEmail: 'admin@techsetu.com',
      action: 'PAYMENT_APPROVED',
      entityType: 'Payment',
      entityId: 'pay-seed-1',
      details: 'Approved manual UPI payment ₹1,499 and granted enrollment to student Aman Kumar Verma for SSC JE 2026.',
      timestamp: new Date(Date.now() - 86400000 * 1.8).toISOString(),
    },
  ];

  const contactMessages: ContactMessage[] = [
    {
      id: 'msg-1',
      name: 'Rohit Sharma',
      email: 'rohit.s@gmail.com',
      phone: '+91 9898989898',
      subject: 'Batch timing query for RRB JE',
      message: 'Hello, are the lectures live or pre-recorded? Can I watch on mobile app while traveling?',
      status: 'new',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];

  return {
    users,
    instructors,
    courses,
    modules,
    lessons,
    quizzes,
    quizSubmissions: [],
    assignments,
    assignmentSubmissions: [],
    payments,
    enrollments,
    progress,
    notifications,
    announcements,
    settings,
    auditLogs,
    contactMessages,
  };
}

class PersistentDatabase {
  private data: DatabaseSchema;

  constructor() {
    ensureDataDir();
    let loadedData: DatabaseSchema | null = null;

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        loadedData = JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse existing db.json at runtime path, checking fallback:', err);
      }
    }

    if (!loadedData && fs.existsSync(SEED_DB_FILE)) {
      try {
        const raw = fs.readFileSync(SEED_DB_FILE, 'utf-8');
        loadedData = JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse seed db.json:', err);
      }
    }

    if (loadedData) {
      this.data = loadedData;
      if (isVercel && !fs.existsSync(DB_FILE)) {
        this.save();
      }
    } else {
      this.data = generateInitialData();
      this.save();
    }
  }

  public save(): void {
    try {
      ensureDataDir();
      const tmpFile = `${DB_FILE}.tmp`;
      const payload = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(tmpFile, payload, 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Database write warning (runtime in-memory state preserved):', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // --- Users ---
  public findUserById(id: string): (User & { passwordHash: string }) | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string): (User & { passwordHash: string }) | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserByPhone(phone: string): (User & { passwordHash: string }) | undefined {
    return this.data.users.find((u) => u.phone === phone);
  }

  public createUser(user: User & { passwordHash: string }): User {
    this.data.users.push(user);
    this.save();
    const { passwordHash: _, ...safeUser } = user;
    return safeUser as User;
  }

  public updateUser(id: string, updates: Partial<User & { passwordHash: string }>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    const { passwordHash: _, ...safeUser } = this.data.users[idx];
    return safeUser as User;
  }

  public listUsers(role?: string): User[] {
    return this.data.users
      .filter((u) => !role || u.role === role)
      .map(({ passwordHash: _, ...safe }) => safe as User);
  }

  // --- Courses ---
  public listCourses(filters?: {
    search?: string;
    category?: string;
    exam?: string;
    instructorId?: string;
    status?: string;
    sort?: string;
  }): Course[] {
    let list = this.data.courses;

    if (filters?.status) {
      list = list.filter((c) => c.status === filters.status);
    } else {
      // By default list published if no specific status given
      list = list.filter((c) => c.status === 'published');
    }

    if (filters?.category) {
      list = list.filter((c) => c.category.toLowerCase().includes(filters.category!.toLowerCase()));
    }

    if (filters?.exam) {
      list = list.filter((c) => c.exam.toLowerCase().includes(filters.exam!.toLowerCase()));
    }

    if (filters?.instructorId) {
      list = list.filter((c) => c.instructorId === filters.instructorId);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.subtitle.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.exam.toLowerCase().includes(q)
      );
    }

    // Attach instructor details & lecture counts
    const populated = list.map((c) => this.populateCourseMeta(c));

    // Sorting
    if (filters?.sort === 'price-low') {
      populated.sort((a, b) => a.discountPrice - b.discountPrice);
    } else if (filters?.sort === 'price-high') {
      populated.sort((a, b) => b.discountPrice - a.discountPrice);
    } else if (filters?.sort === 'popular') {
      populated.sort((a, b) => (b.enrolledStudentsCount || 0) - (a.enrolledStudentsCount || 0));
    } else {
      // newest
      populated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return populated;
  }

  public populateCourseMeta(c: Course): Course {
    const inst = this.data.instructors.find((i) => i.id === c.instructorId);
    const allCourseModules = this.data.modules.filter((m) => m.courseId === c.id);

    // Root modules with nested subModules support
    const rootModules = allCourseModules
      .filter((m) => !m.parentId)
      .sort((a, b) => a.order - b.order)
      .map((m) => {
        const moduleLessons = this.data.lessons
          .filter((l) => l.moduleId === m.id)
          .sort((a, b) => a.order - b.order);
        const subModules = allCourseModules
          .filter((sub) => sub.parentId === m.id)
          .sort((a, b) => a.order - b.order)
          .map((sub) => ({
            ...sub,
            lessons: this.data.lessons
              .filter((l) => l.moduleId === sub.id)
              .sort((a, b) => a.order - b.order),
          }));
        return { ...m, lessons: moduleLessons, subModules };
      });

    const allLessons = this.data.lessons.filter((l) => l.courseId === c.id);
    const totalVideos = allLessons.filter((l) => l.type === 'video').length;
    const totalPdfs = allLessons.filter((l) => l.type === 'pdf').length;
    const totalNotes = allLessons.filter((l) => l.type === 'document').length;
    const totalQuizzes = allLessons.filter((l) => l.type === 'quiz').length;
    const totalAssignments = allLessons.filter((l) => l.type === 'assignment').length;
    const materials = allLessons.filter(
      (l) => l.type === 'pdf' || l.type === 'document' || l.type === 'resource' || l.type === 'link'
    );

    const enrollments = this.data.enrollments.filter(
      (e) => e.courseId === c.id && e.status === 'active'
    );
    const enrolledStudentsCount =
      enrollments.length > 0 ? enrollments.length : (c.enrolledStudentsCount || 0);

    const completedProgress = this.data.progress.filter(
      (p) => p.courseId === c.id && p.progressPercentage >= 100
    );
    const completedStudentsCount = completedProgress.length;
    const completionRate =
      enrolledStudentsCount > 0
        ? Math.round((completedStudentsCount / enrolledStudentsCount) * 100)
        : 0;

    return {
      ...c,
      shortName: c.shortName || c.courseCode || c.title.substring(0, 24),
      courseCode: c.courseCode || c.shortName || `CRS-${c.id.slice(-4).toUpperCase()}`,
      discipline: c.discipline || c.category || 'Engineering',
      subcategory: c.subcategory || c.subject || 'Core Engineering',
      courseType: c.courseType || (c.price === 0 ? 'free' : 'paid'),
      originalPrice:
        c.originalPrice !== undefined
          ? c.originalPrice
          : c.price > 0
          ? Math.round(c.price * 1.5)
          : 0,
      discountPrice: c.discountPrice !== undefined ? c.discountPrice : c.price,
      currency: c.currency || 'INR',
      visibility: c.visibility || 'public',
      status: c.status || 'published',
      instructor: inst,
      modulesCount: allCourseModules.length,
      totalSections: allCourseModules.length,
      lecturesCount: allLessons.length,
      totalLectures: allLessons.length,
      totalVideos,
      totalPdfs,
      totalNotes,
      totalQuizzes,
      totalAssignments,
      totalDuration: c.duration || `${Math.max(1, Math.round(totalVideos * 0.75))} Hours`,
      materialsCount: materials.length,
      enrolledStudentsCount,
      completedStudentsCount,
      completionRate,
      modules: rootModules,
    };
  }

  public findCourseById(id: string): Course | undefined {
    const c = this.data.courses.find((x) => x.id === id);
    if (!c) return undefined;
    return this.populateCourseMeta(c);
  }

  public findCourseBySlug(slug: string): Course | undefined {
    const c = this.data.courses.find((x) => x.slug === slug);
    if (!c) return undefined;
    return this.populateCourseMeta(c);
  }

  public createCourse(course: Course): Course {
    this.data.courses.push(course);
    this.save();
    return this.populateCourseMeta(course);
  }

  public updateCourse(id: string, updates: Partial<Course>): Course | undefined {
    const idx = this.data.courses.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.courses[idx] = {
      ...this.data.courses[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.populateCourseMeta(this.data.courses[idx]);
  }

  public deleteCourse(id: string): { success: boolean; softDeleted: boolean; message: string } {
    const idx = this.data.courses.findIndex((c) => c.id === id);
    if (idx === -1) return { success: false, softDeleted: false, message: 'Course not found' };

    const activeEnrollments = this.data.enrollments.filter(
      (e) => e.courseId === id && e.status === 'active'
    );

    if (activeEnrollments.length > 0) {
      // Protect student enrollments via soft-delete/archive!
      this.data.courses[idx].status = 'archived';
      this.save();
      return {
        success: true,
        softDeleted: true,
        message: 'Course has active enrolled students. It has been archived and hidden from catalog to preserve student access.',
      };
    }

    // Hard delete if zero enrollments
    this.data.courses.splice(idx, 1);
    // clean modules and lessons
    this.data.modules = this.data.modules.filter((m) => m.courseId !== id);
    this.data.lessons = this.data.lessons.filter((l) => l.courseId !== id);
    this.save();
    return { success: true, softDeleted: false, message: 'Course successfully deleted' };
  }

  // --- Modules & Lessons ---
  public createModule(m: Module): Module {
    this.data.modules.push(m);
    this.save();
    return m;
  }

  public updateModule(id: string, updates: Partial<Module>): Module | undefined {
    const idx = this.data.modules.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    this.data.modules[idx] = { ...this.data.modules[idx], ...updates };
    this.save();
    return this.data.modules[idx];
  }

  public deleteModule(id: string): boolean {
    const initial = this.data.modules.length;
    this.data.modules = this.data.modules.filter((m) => m.id !== id);
    this.data.lessons = this.data.lessons.filter((l) => l.moduleId !== id);
    this.save();
    return this.data.modules.length < initial;
  }

  public createLesson(l: Lesson): Lesson {
    this.data.lessons.push(l);
    this.save();
    return l;
  }

  public updateLesson(id: string, updates: Partial<Lesson>): Lesson | undefined {
    const idx = this.data.lessons.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    this.data.lessons[idx] = { ...this.data.lessons[idx], ...updates };
    this.save();
    return this.data.lessons[idx];
  }

  public deleteLesson(id: string): boolean {
    const initial = this.data.lessons.length;
    this.data.lessons = this.data.lessons.filter((l) => l.id !== id);
    this.save();
    return this.data.lessons.length < initial;
  }

  public reorderModules(courseId: string, moduleIds: string[]): void {
    moduleIds.forEach((id, idx) => {
      const m = this.data.modules.find((x) => x.id === id && x.courseId === courseId);
      if (m) m.order = idx + 1;
    });
    this.save();
  }

  public reorderLessons(moduleId: string, lessonIds: string[]): void {
    lessonIds.forEach((id, idx) => {
      const l = this.data.lessons.find((x) => x.id === id && x.moduleId === moduleId);
      if (l) l.order = idx + 1;
    });
    this.save();
  }

  public duplicateCourse(courseId: string): Course | null {
    const original = this.data.courses.find((c) => c.id === courseId);
    if (!original) return null;

    const newCourseId = `course-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const newTitle = `Copy of ${original.title}`;
    const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;

    const newCourse: Course = {
      ...original,
      id: newCourseId,
      title: newTitle,
      shortName: original.shortName ? `${original.shortName} (Copy)` : undefined,
      courseCode: original.courseCode ? `${original.courseCode}-CPY` : undefined,
      slug: newSlug,
      status: 'draft',
      enrolledStudentsCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.data.courses.push(newCourse);

    // Deep copy all modules & submodules
    const origModules = this.data.modules.filter((m) => m.courseId === courseId);
    const moduleIdMap = new Map<string, string>();

    origModules.forEach((m) => {
      const newModId = `mod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      moduleIdMap.set(m.id, newModId);
    });

    origModules.forEach((m) => {
      const newModId = moduleIdMap.get(m.id)!;
      const newParentId = m.parentId ? moduleIdMap.get(m.parentId) : undefined;
      const copiedModule: Module = {
        ...m,
        id: newModId,
        courseId: newCourseId,
        parentId: newParentId,
        lessons: [],
        createdAt: now,
      };
      this.data.modules.push(copiedModule);
    });

    // Deep copy all lessons & linked quizzes/assignments
    const origLessons = this.data.lessons.filter((l) => l.courseId === courseId);
    origLessons.forEach((l) => {
      const newModId = moduleIdMap.get(l.moduleId);
      if (newModId) {
        const newLessonId = `les-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        let newQuizId = undefined;
        let newAssignmentId = undefined;

        if (l.quizId) {
          const origQuiz = this.data.quizzes.find((q) => q.id === l.quizId);
          if (origQuiz) {
            newQuizId = `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            this.data.quizzes.push({
              ...origQuiz,
              id: newQuizId,
              lessonId: newLessonId,
              courseId: newCourseId,
            });
          }
        }

        if (l.assignmentId) {
          const origAssign = this.data.assignments.find((a) => a.id === l.assignmentId);
          if (origAssign) {
            newAssignmentId = `asg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            this.data.assignments.push({
              ...origAssign,
              id: newAssignmentId,
              lessonId: newLessonId,
              courseId: newCourseId,
            });
          }
        }

        this.data.lessons.push({
          ...l,
          id: newLessonId,
          moduleId: newModId,
          courseId: newCourseId,
          quizId: newQuizId,
          assignmentId: newAssignmentId,
          createdAt: now,
        });
      }
    });

    this.save();
    return this.populateCourseMeta(newCourse);
  }

  public duplicateModule(moduleId: string): Module | null {
    const origModule = this.data.modules.find((m) => m.id === moduleId);
    if (!origModule) return null;

    const now = new Date().toISOString();
    const newModId = `mod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const copiedModule: Module = {
      ...origModule,
      id: newModId,
      title: `${origModule.title} (Copy)`,
      order: origModule.order + 1,
      lessons: [],
      createdAt: now,
    };
    this.data.modules.push(copiedModule);

    // Copy its lessons
    const origLessons = this.data.lessons.filter((l) => l.moduleId === moduleId);
    origLessons.forEach((l) => {
      const newLessonId = `les-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      this.data.lessons.push({
        ...l,
        id: newLessonId,
        moduleId: newModId,
        title: l.title,
        createdAt: now,
      });
    });

    this.save();
    return copiedModule;
  }

  // --- Instructors ---
  public listInstructors(): Instructor[] {
    return this.data.instructors.map((inst) => {
      const coursesCount = this.data.courses.filter(
        (c) => c.instructorId === inst.id && c.status === 'published'
      ).length;
      return { ...inst, coursesCount };
    });
  }

  public findInstructorById(id: string): Instructor | undefined {
    return this.data.instructors.find((i) => i.id === id);
  }

  public createInstructor(inst: Instructor): Instructor {
    this.data.instructors.push(inst);
    this.save();
    return inst;
  }

  public updateInstructor(id: string, updates: Partial<Instructor>): Instructor | undefined {
    const idx = this.data.instructors.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    this.data.instructors[idx] = { ...this.data.instructors[idx], ...updates };
    this.save();
    return this.data.instructors[idx];
  }

  public deleteInstructor(id: string): boolean {
    const initial = this.data.instructors.length;
    this.data.instructors = this.data.instructors.filter((i) => i.id !== id);
    this.save();
    return this.data.instructors.length < initial;
  }

  // --- Payments & Enrollments ---
  public listPayments(filters?: {
    status?: string;
    studentId?: string;
    courseId?: string;
    search?: string;
  }): Payment[] {
    let list = this.data.payments;
    if (filters?.status) list = list.filter((p) => p.status === filters.status);
    if (filters?.studentId) list = list.filter((p) => p.studentId === filters.studentId);
    if (filters?.courseId) list = list.filter((p) => p.courseId === filters.courseId);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.studentName.toLowerCase().includes(q) ||
          p.studentEmail.toLowerCase().includes(q) ||
          p.transactionId.toLowerCase().includes(q) ||
          p.orderId.toLowerCase().includes(q)
      );
    }
    return [...list].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  public findPaymentById(id: string): Payment | undefined {
    return this.data.payments.find((p) => p.id === id);
  }

  public createPayment(payment: Payment): Payment {
    this.data.payments.push(payment);
    this.save();
    return payment;
  }

  public updatePaymentStatus(
    paymentId: string,
    status: 'approved' | 'rejected',
    adminEmail: string,
    adminNote?: string
  ): { payment: Payment; enrollment?: Enrollment } | undefined {
    const p = this.data.payments.find((x) => x.id === paymentId);
    if (!p) return undefined;

    p.status = status;
    p.reviewedAt = new Date().toISOString();
    p.reviewedBy = adminEmail;
    if (adminNote !== undefined) p.adminNote = adminNote;

    let enrollment: Enrollment | undefined;

    if (status === 'approved') {
      const course = this.findCourseById(p.courseId);
      const isLifetime = course?.validityType === 'lifetime';
      const validityDays = course?.validityDays || 365;
      const validityDuration = isLifetime ? 'Lifetime' : `${validityDays} Days`;
      const expiresAt = isLifetime ? undefined : new Date(Date.now() + validityDays * 86400000).toISOString();

      // Find or create enrollment
      const existingEnrollment = this.data.enrollments.find(
        (e) => e.studentId === p.studentId && e.courseId === p.courseId
      );
      if (existingEnrollment) {
        existingEnrollment.status = 'active';
        existingEnrollment.paymentId = p.id;
        existingEnrollment.validityDuration = validityDuration;
        existingEnrollment.expiresAt = expiresAt;
        existingEnrollment.isExpired = false;
        enrollment = existingEnrollment;
      } else {
        enrollment = {
          id: `enr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          studentId: p.studentId,
          courseId: p.courseId,
          paymentId: p.id,
          status: 'active',
          enrolledAt: new Date().toISOString(),
          grantedBy: 'payment_approval',
          validityDuration,
          expiresAt,
          isExpired: false,
          progressPercentage: 0,
        };
        this.data.enrollments.push(enrollment);
      }

      // Create notification for student
      this.createNotification({
        id: `notif-${Date.now()}`,
        userId: p.studentId,
        title: 'Payment Approved & Course Enrolled! 🎉',
        message: `Your payment of ₹${p.amount} for "${p.courseTitle}" has been verified. Access is active (${validityDuration}). You can now access all lectures and notes.`,
        link: `/learn/${p.courseId}`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      });
    } else if (status === 'rejected') {
      // Notify student
      this.createNotification({
        id: `notif-${Date.now()}`,
        userId: p.studentId,
        title: 'Payment Verification Update',
        message: `Your payment submission for "${p.courseTitle}" could not be verified. Note: ${adminNote || 'Transaction details did not match bank records.'}`,
        link: '/dashboard',
        type: 'alert',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.save();
    return { payment: p, enrollment };
  }

  public deletePayment(id: string): boolean {
    const initial = this.data.payments.length;
    this.data.payments = this.data.payments.filter((p) => p.id !== id);
    this.save();
    return this.data.payments.length < initial;
  }

  // --- Enrollments ---
  public listEnrollments(studentId?: string): Enrollment[] {
    let list = this.data.enrollments;
    if (studentId) list = list.filter((e) => e.studentId === studentId);

    const now = Date.now();

    return list.map((e) => {
      const student = this.data.users.find((u) => u.id === e.studentId);
      const course = this.data.courses.find((c) => c.id === e.courseId);
      const prog = this.data.progress.find((p) => p.studentId === e.studentId && p.courseId === e.courseId);
      const safeStudent = student ? (({ passwordHash: _, ...s }) => s as User)(student) : undefined;

      // Dynamic expiry calculation
      let isExpired = false;
      let daysRemaining: number | undefined;

      if (e.expiresAt) {
        const diffMs = new Date(e.expiresAt).getTime() - now;
        daysRemaining = Math.ceil(diffMs / 86400000);
        if (daysRemaining <= 0 && !e.adminOverride) {
          isExpired = true;
          if (e.status !== 'revoked') {
            e.status = 'expired';
          }
        }
      }

      const validityDuration = e.validityDuration || (course?.validityType === 'lifetime' ? 'Lifetime' : `${course?.validityDays || 365} Days`);

      return {
        ...e,
        student: safeStudent,
        course: course ? this.populateCourseMeta(course) : undefined,
        progressPercentage: prog ? prog.progressPercentage : 0,
        validityDuration,
        isExpired,
        daysRemaining,
      };
    });
  }

  public deleteEnrollment(id: string): boolean {
    const initial = this.data.enrollments.length;
    this.data.enrollments = this.data.enrollments.filter((e) => e.id !== id);
    this.save();
    return this.data.enrollments.length < initial;
  }

  public hasActiveEnrollment(studentId: string, courseId: string): boolean {
    const enr = this.data.enrollments.find((e) => e.studentId === studentId && e.courseId === courseId);
    if (!enr) return false;
    if (enr.status === 'revoked') return false;

    // Admin override explicitly grants access
    if (enr.adminOverride) return true;

    // Check expiry
    if (enr.expiresAt && new Date(enr.expiresAt).getTime() < Date.now()) {
      enr.status = 'expired';
      enr.isExpired = true;
      this.save();
      return false;
    }

    return enr.status === 'active';
  }

  public grantManualEnrollment(
    studentId: string,
    courseId: string,
    adminEmail: string,
    validityDaysOverride?: number,
    enrollmentDate?: string
  ): Enrollment {
    const course = this.findCourseById(courseId);
    const isLifetime = validityDaysOverride === -1 || course?.validityType === 'lifetime';
    const days = validityDaysOverride || course?.validityDays || 365;
    const validityDuration = isLifetime ? 'Lifetime' : `${days} Days`;
    const enrolledAt = enrollmentDate ? new Date(enrollmentDate).toISOString() : new Date().toISOString();
    const startMs = new Date(enrolledAt).getTime();
    const expiresAt = isLifetime ? undefined : new Date(startMs + days * 86400000).toISOString();
    const isExpiredNow = Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());

    const existing = this.data.enrollments.find((e) => e.studentId === studentId && e.courseId === courseId);
    if (existing) {
      existing.status = isExpiredNow ? 'expired' : 'active';
      existing.validityDuration = validityDuration;
      existing.accessDurationDays = isLifetime ? undefined : days;
      existing.enrolledAt = enrolledAt;
      existing.expiresAt = expiresAt;
      existing.isExpired = isExpiredNow;
      existing.adminOverride = false;
      this.save();
      return existing;
    }

    const enr: Enrollment = {
      id: `enr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      studentId,
      courseId,
      status: isExpiredNow ? 'expired' : 'active',
      enrolledAt,
      grantedBy: 'manual_admin',
      validityDuration,
      accessDurationDays: isLifetime ? undefined : days,
      expiresAt,
      isExpired: isExpiredNow,
      progressPercentage: 0,
    };
    this.data.enrollments.push(enr);

    this.createNotification({
      id: `notif-${Date.now()}`,
      userId: studentId,
      title: 'Course Access Granted by Admin! 🎓',
      message: `You have been directly granted access to "${course?.title || 'Course'}" (${validityDuration}). Happy learning!`,
      link: `/learn/${courseId}`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.save();
    return enr;
  }

  public toggleEnrollmentOverride(
    enrollmentId: string,
    options: { override?: boolean; extendDays?: number; newExpiryDate?: string; reason?: string }
  ): Enrollment | undefined {
    const enr = this.data.enrollments.find((e) => e.id === enrollmentId);
    if (!enr) return undefined;

    if (options.override !== undefined) {
      enr.adminOverride = options.override;
      if (options.override) {
        enr.status = 'active';
        enr.isExpired = false;
      } else if (enr.expiresAt && new Date(enr.expiresAt).getTime() < Date.now()) {
        enr.status = 'expired';
        enr.isExpired = true;
      }
    }

    if (options.extendDays) {
      const base = enr.expiresAt && new Date(enr.expiresAt).getTime() > Date.now()
        ? new Date(enr.expiresAt).getTime()
        : Date.now();
      enr.expiresAt = new Date(base + options.extendDays * 86400000).toISOString();
      enr.status = 'active';
      enr.isExpired = false;
      enr.validityDuration = `Extended (+${options.extendDays} Days)`;
    }

    if (options.newExpiryDate) {
      enr.expiresAt = options.newExpiryDate;
      enr.status = 'active';
      enr.isExpired = false;
    }

    if (options.reason) {
      enr.overrideReason = options.reason;
    }

    this.save();
    return enr;
  }

  public revokeEnrollment(enrollmentId: string): boolean {
    const enr = this.data.enrollments.find((e) => e.id === enrollmentId);
    if (!enr) return false;
    enr.status = 'revoked';
    this.save();
    return true;
  }

  // --- Course Progress ---
  public getProgress(studentId: string, courseId: string): CourseProgress {
    let p = this.data.progress.find((x) => x.studentId === studentId && x.courseId === courseId);
    if (!p) {
      p = {
        id: `prog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        studentId,
        courseId,
        completedLessonIds: [],
        progressPercentage: 0,
        lastAccessedAt: new Date().toISOString(),
      };
      this.data.progress.push(p);
      this.save();
    }
    return p;
  }

  public markLessonComplete(
    studentId: string,
    courseId: string,
    lessonId: string,
    completed: boolean
  ): CourseProgress {
    const prog = this.getProgress(studentId, courseId);
    const set = new Set(prog.completedLessonIds);

    if (completed) {
      set.add(lessonId);
    } else {
      set.delete(lessonId);
    }

    prog.completedLessonIds = Array.from(set);
    prog.lastAccessedLessonId = lessonId;
    prog.lastAccessedAt = new Date().toISOString();

    const totalLessons = this.data.lessons.filter((l) => l.courseId === courseId).length;
    prog.progressPercentage = totalLessons > 0 ? Math.round((prog.completedLessonIds.length / totalLessons) * 100) : 0;

    this.save();
    return prog;
  }

  // --- Quizzes & Assignments ---
  public findQuizById(id: string): Quiz | undefined {
    return this.data.quizzes.find((q) => q.id === id);
  }

  public findQuizByLessonId(lessonId: string): Quiz | undefined {
    return this.data.quizzes.find((q) => q.lessonId === lessonId);
  }

  public saveQuiz(quiz: Quiz): Quiz {
    const idx = this.data.quizzes.findIndex((q) => q.id === quiz.id);
    if (idx >= 0) {
      this.data.quizzes[idx] = quiz;
    } else {
      this.data.quizzes.push(quiz);
    }
    this.save();
    return quiz;
  }

  public submitQuiz(
    quizId: string,
    studentId: string,
    answers: Record<string, number>
  ): QuizSubmission {
    const quiz = this.findQuizById(quizId);
    if (!quiz) throw new Error('Quiz not found');

    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctOption) {
        score += q.marks;
      }
    });

    const percentage = quiz.totalMarks > 0 ? Math.round((score / quiz.totalMarks) * 100) : 0;
    const passed = percentage >= quiz.passPercentage;

    const sub: QuizSubmission = {
      id: `qsub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      quizId,
      studentId,
      courseId: quiz.courseId,
      score,
      totalMarks: quiz.totalMarks,
      percentage,
      passed,
      selectedAnswers: answers,
      submittedAt: new Date().toISOString(),
    };

    this.data.quizSubmissions.push(sub);
    this.save();
    return sub;
  }

  public findAssignmentById(id: string): Assignment | undefined {
    return this.data.assignments.find((a) => a.id === id);
  }

  public findAssignmentByLessonId(lessonId: string): Assignment | undefined {
    return this.data.assignments.find((a) => a.lessonId === lessonId);
  }

  public saveAssignment(assign: Assignment): Assignment {
    const idx = this.data.assignments.findIndex((a) => a.id === assign.id);
    if (idx >= 0) {
      this.data.assignments[idx] = assign;
    } else {
      this.data.assignments.push(assign);
    }
    this.save();
    return assign;
  }

  public submitAssignment(sub: AssignmentSubmission): AssignmentSubmission {
    this.data.assignmentSubmissions.push(sub);
    this.save();
    return sub;
  }

  public listAssignmentSubmissions(assignmentId?: string): AssignmentSubmission[] {
    let list = this.data.assignmentSubmissions;
    if (assignmentId) list = list.filter((s) => s.assignmentId === assignmentId);
    return list.map((s) => {
      const student = this.findUserById(s.studentId);
      return { ...s, studentName: student?.name };
    });
  }

  // --- Notifications & Announcements ---
  public listNotifications(userId: string, role: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.userId === userId || n.userId === 'all' || (role === 'admin' && n.userId === 'admin'))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(n: Notification): Notification {
    this.data.notifications.push(n);
    this.save();
    return n;
  }

  public markNotificationRead(id: string): void {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
  }

  public listAnnouncements(courseId?: string): Announcement[] {
    return this.data.announcements
      .filter((a) => a.courseId === 'all' || (courseId && a.courseId === courseId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createAnnouncement(a: Announcement): Announcement {
    this.data.announcements.push(a);
    this.save();
    return a;
  }

  // --- Settings & Audit ---
  public getSettings(): SiteSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const entry: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...log,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(entry);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
    return entry;
  }

  public listAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public createContactMessage(msg: ContactMessage): ContactMessage {
    this.data.contactMessages.push(msg);
    this.save();
    return msg;
  }

  public listContactMessages(): ContactMessage[] {
    return [...this.data.contactMessages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public updateContactMessageStatus(id: string, status: 'new' | 'read' | 'replied'): void {
    const m = this.data.contactMessages.find((x) => x.id === id);
    if (m) {
      m.status = status;
      this.save();
    }
  }

  public replyToContactMessage(id: string, reply: string, adminEmail?: string): ContactMessage | undefined {
    const m = this.data.contactMessages.find((x) => x.id === id);
    if (!m) return undefined;
    m.status = 'replied';
    m.adminReply = reply;
    m.repliedAt = new Date().toISOString();
    m.repliedBy = adminEmail || 'Admin';
    this.save();
    return m;
  }

  // --- Analytics ---
  public getAnalytics(): {
    totalStudents: number;
    totalCourses: number;
    totalInstructors: number;
    totalEnrollments: number;
    pendingPaymentsCount: number;
    approvedPaymentsCount: number;
    rejectedPaymentsCount: number;
    totalRevenue: number;
    pendingRevenue: number;
    courseSales: { courseTitle: string; enrollmentsCount: number; revenue: number }[];
    recentPayments: Payment[];
    monthlyRevenue: { month: string; revenue: number }[];
  } {
    const students = this.data.users.filter((u) => u.role === 'student');
    const courses = this.data.courses;
    const instructors = this.data.instructors;
    const enrollments = this.data.enrollments.filter((e) => e.status === 'active');

    const approvedPayments = this.data.payments.filter((p) => p.status === 'approved');
    const pendingPayments = this.data.payments.filter((p) => p.status === 'pending');
    const rejectedPayments = this.data.payments.filter((p) => p.status === 'rejected');

    const totalRevenue = approvedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingRevenue = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    const courseSalesMap = new Map<string, { count: number; rev: number }>();
    approvedPayments.forEach((p) => {
      const prev = courseSalesMap.get(p.courseTitle) || { count: 0, rev: 0 };
      courseSalesMap.set(p.courseTitle, {
        count: prev.count + 1,
        rev: prev.rev + p.amount,
      });
    });

    const courseSales = Array.from(courseSalesMap.entries()).map(([title, stats]) => ({
      courseTitle: title,
      enrollmentsCount: stats.count,
      revenue: stats.rev,
    }));

    // Monthly breakdown
    const monthsMap = new Map<string, number>();
    approvedPayments.forEach((p) => {
      const d = new Date(p.submittedAt);
      const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      monthsMap.set(key, (monthsMap.get(key) || 0) + p.amount);
    });

    const monthlyRevenue = Array.from(monthsMap.entries()).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    return {
      totalStudents: students.length,
      totalCourses: courses.length,
      totalInstructors: instructors.length,
      totalEnrollments: enrollments.length,
      pendingPaymentsCount: pendingPayments.length,
      approvedPaymentsCount: approvedPayments.length,
      rejectedPaymentsCount: rejectedPayments.length,
      totalRevenue,
      pendingRevenue,
      courseSales,
      recentPayments: this.data.payments.slice(-5).reverse(),
      monthlyRevenue,
    };
  }
}

export const db = new PersistentDatabase();
