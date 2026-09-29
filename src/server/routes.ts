import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from './db';
import {
  AuthRequest,
  signToken,
  hashPassword,
  comparePassword,
  requireAuth,
  requireAdmin,
} from './auth';
import { Course, Lesson, Module, Payment } from '../types';

const router = Router();

// Configure Multer for file uploads
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const UPLOAD_DIR = isVercel
  ? path.resolve('/tmp', 'uploads')
  : path.resolve(process.cwd(), 'uploads');

try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Could not initialize upload directory:', err);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max for video lectures & learning materials
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf|doc|docx|zip|mp4|webm|mkv|mov|m4v|avi/i;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowed.test(ext) || allowed.test(mime) || mime.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: mp4, webm, mov, mkv, jpg, png, webp, pdf, doc, zip'));
    }
  },
});

// ==========================================
// 1. FILE UPLOAD ROUTE
// ==========================================
router.post('/upload', upload.single('file'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
  });
});

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/register', (req, res) => {
  const { name, email, phone, password, dob, city, state } = req.body;

  if (!name || !email || !phone || !password) {
    res.status(400).json({ error: 'Name, email, phone, and password are required' });
    return;
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email address' });
    return;
  }

  // Phone check
  if (phone.replace(/\D/g, '').length < 10) {
    res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    return;
  }

  // Password length
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long' });
    return;
  }

  // Duplicate checks
  if (db.findUserByEmail(email)) {
    res.status(400).json({ error: 'An account with this email already exists' });
    return;
  }
  if (db.findUserByPhone(phone)) {
    res.status(400).json({ error: 'An account with this phone number already exists' });
    return;
  }

  const now = new Date().toISOString();
  const passwordHash = hashPassword(password);

  const newUser = db.createUser({
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    email: email.toLowerCase(),
    phone,
    role: 'student',
    dob,
    city,
    state,
    status: 'active',
    passwordHash,
    createdAt: now,
    updatedAt: now,
  });

  // Welcome notification
  db.createNotification({
    id: `notif-${Date.now()}`,
    userId: newUser.id,
    title: 'Welcome to TechSetu! 🚀',
    message: 'Explore our comprehensive engineering courses for RRB JE, SSC JE & State AE/JE exams.',
    link: '/courses',
    type: 'info',
    read: false,
    createdAt: now,
  });

  const token = signToken(newUser);
  res.status(201).json({ user: newUser, token });
});

router.post('/auth/login', (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body || {};
    const loginId = identifier || email || phone;

    if (!loginId || !password) {
      res.status(400).json({ success: false, error: 'Email/Phone and password are required' });
      return;
    }

    const cleanId = String(loginId).trim();
    let user = db.findUserByEmail(cleanId);
    if (!user) {
      user = db.findUserByPhone(cleanId);
    }

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid credentials. User not found.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ success: false, error: 'This account has been suspended. Please contact admin.' });
      return;
    }

    const valid = comparePassword(String(password), user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid password. Please try again.' });
      return;
    }

    const { passwordHash: _, ...safeUser } = user;
    const token = signToken(safeUser);
    res.json({ success: true, user: safeUser, token });
  } catch (err: any) {
    console.error('[Login Error] Unexpected error during login:', err);
    res.status(500).json({
      success: false,
      error: 'Authentication failed due to a server error. Please try again.',
    });
  }
});

router.post('/auth/admin-login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Admin email and password are required' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = db.findUserByEmail(cleanEmail);
    if (!user || user.role !== 'admin') {
      res.status(401).json({ success: false, error: 'Invalid admin credentials or insufficient privileges' });
      return;
    }

    if (!user.passwordHash) {
      console.error(`[Admin Login Error] User ${user.email} has no password hash set.`);
      res.status(401).json({ success: false, error: 'Admin password not initialized. Please contact support.' });
      return;
    }

    const valid = comparePassword(String(password), user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid admin password' });
      return;
    }

    try {
      db.addAuditLog({
        adminEmail: user.email,
        action: 'ADMIN_LOGIN',
        entityType: 'User',
        entityId: user.id,
        details: 'Admin logged into administration panel successfully.',
      });
    } catch (auditErr) {
      console.warn('[Audit Log Warning] Failed to save login audit log:', auditErr);
    }

    const { passwordHash: _, ...safeUser } = user;
    const token = signToken(safeUser);
    res.json({ success: true, user: safeUser, token });
  } catch (err: any) {
    console.error('[Admin Login Error] Fatal exception during admin authentication:', err);
    res.status(500).json({
      success: false,
      error: 'Server encountered an unexpected error during admin authentication: ' + (err.message || 'Unknown error'),
    });
  }
});

router.get('/auth/me', requireAuth, (req: AuthRequest, res) => {
  const user = req.user!;
  const unreadNotifs = db.listNotifications(user.id, user.role).filter((n) => !n.read).length;
  res.json({ user, unreadNotifs });
});

router.put('/auth/profile', requireAuth, (req: AuthRequest, res) => {
  const user = req.user!;
  const { name, phone, dob, city, state, profilePhoto } = req.body;

  const updated = db.updateUser(user.id, {
    name: name || user.name,
    phone: phone || user.phone,
    dob: dob !== undefined ? dob : user.dob,
    city: city !== undefined ? city : user.city,
    state: state !== undefined ? state : user.state,
    profilePhoto: profilePhoto !== undefined ? profilePhoto : user.profilePhoto,
  });

  res.json({ user: updated });
});

router.post('/auth/change-password', requireAuth, (req: AuthRequest, res) => {
  const user = req.user!;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters' });
    return;
  }

  const userWithHash = db.findUserById(user.id);
  if (!userWithHash) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const match = comparePassword(currentPassword, userWithHash.passwordHash);
  if (!match) {
    res.status(400).json({ error: 'Current password does not match' });
    return;
  }

  const newHash = hashPassword(newPassword);
  db.updateUser(user.id, { passwordHash: newHash });

  if (user.role === 'admin') {
    db.addAuditLog({
      adminEmail: user.email,
      action: 'ADMIN_PASSWORD_CHANGED',
      entityType: 'User',
      entityId: user.id,
      details: 'Administrator changed their account password.',
    });
  }

  res.json({ success: true, message: 'Password updated successfully' });
});

// ==========================================
// 3. COURSE CATALOG & DETAIL
// ==========================================
router.get('/courses', (req, res) => {
  const { search, category, exam, instructorId, sort, status } = req.query;
  const courses = db.listCourses({
    search: search as string,
    category: category as string,
    exam: exam as string,
    instructorId: instructorId as string,
    sort: sort as string,
    status: status as string,
  });
  res.json({ courses });
});

router.get('/courses/:slug', (req: AuthRequest, res) => {
  const course = db.findCourseBySlug(req.params.slug);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  // Check enrollment
  const isEnrolled = req.user ? db.hasActiveEnrollment(req.user.id, course.id) : false;
  const isAdmin = req.user?.role === 'admin';

  // Sanitized curriculum: lock protected URLs unless enrolled or admin
  const sanitizedModules = course.modules?.map((m) => ({
    ...m,
    lessons: m.lessons.map((l) => {
      const canAccess = isEnrolled || isAdmin || l.isFreePreview;
      return {
        id: l.id,
        moduleId: l.moduleId,
        courseId: l.courseId,
        title: l.title,
        order: l.order,
        type: l.type,
        videoDuration: l.videoDuration,
        isFreePreview: l.isFreePreview,
        isLocked: !canAccess,
        videoUrl: canAccess ? l.videoUrl : undefined,
        pdfUrl: canAccess ? l.pdfUrl : undefined,
        contentText: canAccess ? l.contentText : undefined,
        quizId: l.quizId,
        assignmentId: l.assignmentId,
        createdAt: l.createdAt,
      };
    }),
  }));

  res.json({
    course: {
      ...course,
      modules: sanitizedModules,
    },
    isEnrolled,
    isAdmin,
  });
});

// ==========================================
// 4. PROTECTED COURSE LEARNING (LMS PLAYER)
// ==========================================
router.get('/courses/:id/learn', requireAuth, (req: AuthRequest, res) => {
  const courseId = req.params.id;
  const user = req.user!;

  const course = db.findCourseById(courseId);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const isEnrolled = db.hasActiveEnrollment(user.id, courseId);
  const isAdmin = user.role === 'admin';

  if (!isEnrolled && !isAdmin) {
    const userEnrollments = db.listEnrollments(user.id);
    const matched = userEnrollments.find((e) => e.courseId === courseId);
    const isExpired = matched && (matched.isExpired || matched.status === 'expired');

    res.status(403).json({
      error: isExpired
        ? 'Your course access validity has expired. Access to video lectures, test simulators, and PDFs has been revoked.'
        : 'You do not have active enrollment for this course. Please purchase the course to access lectures.',
      courseId,
      needsPurchase: true,
      isExpired: Boolean(isExpired),
      expiredEnrollment: isExpired ? matched : undefined,
    });
    return;
  }

  // Full unlocked modules and lessons
  const modules = db.getData().modules
    .filter((m) => m.courseId === courseId)
    .sort((a, b) => a.order - b.order)
    .map((m) => {
      const lessons = db.getData().lessons
        .filter((l) => l.moduleId === m.id)
        .sort((a, b) => a.order - b.order);
      return { ...m, lessons };
    });

  const progress = db.getProgress(user.id, courseId);
  const announcements = db.listAnnouncements(courseId);

  res.json({
    course,
    modules,
    progress,
    announcements,
  });
});

// ==========================================
// 5. PROGRESS TRACKING
// ==========================================
router.get('/progress/:courseId', requireAuth, (req: AuthRequest, res) => {
  const p = db.getProgress(req.user!.id, req.params.courseId);
  res.json({ progress: p });
});

router.post('/progress/mark-lesson', requireAuth, (req: AuthRequest, res) => {
  const { courseId, lessonId, completed } = req.body;
  if (!courseId || !lessonId) {
    res.status(400).json({ error: 'courseId and lessonId are required' });
    return;
  }

  const p = db.markLessonComplete(req.user!.id, courseId, lessonId, completed !== false);
  res.json({ progress: p });
});

// ==========================================
// 6. STUDENT DASHBOARD & MY COURSES
// ==========================================
router.get('/student/my-courses', requireAuth, (req: AuthRequest, res) => {
  const studentId = req.user!.id;
  const enrollments = db.listEnrollments(studentId).filter((e) => e.status === 'active');
  const myCourses = enrollments.map((enr) => {
    const course = db.findCourseById(enr.courseId);
    const prog = db.getProgress(studentId, enr.courseId);
    return {
      enrollment: enr,
      course,
      progress: prog,
    };
  });
  res.json({ myCourses });
});

router.get('/student/payments', requireAuth, (req: AuthRequest, res) => {
  const payments = db.listPayments({ studentId: req.user!.id });
  res.json({ payments });
});

// ==========================================
// 7. COURSE PURCHASE & PAYMENT WORKFLOW
// ==========================================
router.post('/payments/submit-manual', requireAuth, (req: AuthRequest, res) => {
  const user = req.user!;
  const {
    courseId,
    amount,
    transactionId,
    receiptUrl,
    paymentDate,
    studentName,
    studentPhone,
  } = req.body;

  if (!courseId || !amount || !transactionId) {
    res.status(400).json({ error: 'Course, amount, and Transaction ID / UTR are required' });
    return;
  }

  const course = db.findCourseById(courseId);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  // Check if student already enrolled
  if (db.hasActiveEnrollment(user.id, courseId)) {
    res.status(400).json({ error: 'You are already actively enrolled in this course!' });
    return;
  }

  const orderId = `ORD-${Date.now().toString().slice(-8)}`;
  const payment: Payment = {
    id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    orderId,
    studentId: user.id,
    studentName: studentName || user.name,
    studentEmail: user.email,
    studentPhone: studentPhone || user.phone,
    courseId,
    courseTitle: course.title,
    amount: Number(amount),
    paymentMethod: 'manual_upi',
    transactionId: transactionId.trim(),
    receiptUrl: receiptUrl || '',
    status: 'pending',
    adminNote: '',
    submittedAt: paymentDate || new Date().toISOString(),
  };

  db.createPayment(payment);

  // Notify Student
  db.createNotification({
    id: `notif-${Date.now()}`,
    userId: user.id,
    title: 'Payment Received (Pending Verification)',
    message: `Your payment of ₹${payment.amount} for "${course.title}" was submitted. Order ID: ${orderId}. Admin verification is in progress.`,
    link: '/dashboard',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString(),
  });

  // Notify Admin
  db.createNotification({
    id: `notif-admin-${Date.now()}`,
    userId: 'admin',
    title: 'New Course Payment Awaiting Approval',
    message: `${user.name} submitted ₹${payment.amount} for "${course.title}" (UTR: ${transactionId}).`,
    link: '/admin',
    type: 'warning',
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    message: 'Payment submitted successfully. Your enrollment is pending admin verification.',
    payment,
  });
});

// ==========================================
// 8. ADMIN: PAYMENTS VERIFICATION
// ==========================================
router.get('/admin/payments', requireAdmin, (req, res) => {
  const { status, search } = req.query;
  const payments = db.listPayments({
    status: status as string,
    search: search as string,
  });
  res.json({ payments });
});

router.post('/admin/payments/:id/approve', requireAdmin, (req: AuthRequest, res) => {
  const paymentId = req.params.id;
  const { adminNote } = req.body;
  const adminEmail = req.user!.email;

  const result = db.updatePaymentStatus(paymentId, 'approved', adminEmail, adminNote);
  if (!result) {
    res.status(404).json({ error: 'Payment not found' });
    return;
  }

  db.addAuditLog({
    adminEmail,
    action: 'PAYMENT_APPROVED',
    entityType: 'Payment',
    entityId: paymentId,
    details: `Approved payment of ₹${result.payment.amount} for ${result.payment.studentName} (${result.payment.courseTitle}). Enrollment activated.`,
  });

  res.json({
    success: true,
    message: 'Payment approved and student enrollment granted successfully',
    payment: result.payment,
    enrollment: result.enrollment,
  });
});

router.post('/admin/payments/:id/reject', requireAdmin, (req: AuthRequest, res) => {
  const paymentId = req.params.id;
  const { adminNote } = req.body;
  const adminEmail = req.user!.email;

  const result = db.updatePaymentStatus(paymentId, 'rejected', adminEmail, adminNote);
  if (!result) {
    res.status(404).json({ error: 'Payment not found' });
    return;
  }

  db.addAuditLog({
    adminEmail,
    action: 'PAYMENT_REJECTED',
    entityType: 'Payment',
    entityId: paymentId,
    details: `Rejected payment for ${result.payment.studentName} (${result.payment.courseTitle}). Reason: ${adminNote || 'None'}`,
  });

  res.json({
    success: true,
    message: 'Payment marked as rejected.',
    payment: result.payment,
  });
});

router.delete('/admin/payments/:id', requireAdmin, (req: AuthRequest, res) => {
  const ok = db.deletePayment(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'Payment not found' });
    return;
  }

  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'PAYMENT_DELETED',
    entityType: 'Payment',
    entityId: req.params.id,
    details: `Admin deleted payment record ${req.params.id}.`,
  });

  res.json({ success: true, message: 'Payment record deleted successfully.' });
});

// ==========================================
// 9. ADMIN: ENROLLMENTS & STUDENTS
// ==========================================
router.get('/admin/enrollments', requireAdmin, (_req, res) => {
  const enrollments = db.listEnrollments();
  res.json({ enrollments });
});

router.post('/admin/enrollments/manual-grant', requireAdmin, (req: AuthRequest, res) => {
  const { studentId, courseId, validityDays, enrollmentDate } = req.body;
  if (!studentId || !courseId) {
    res.status(400).json({ error: 'studentId and courseId are required' });
    return;
  }

  const enr = db.grantManualEnrollment(
    studentId,
    courseId,
    req.user!.email,
    validityDays ? Number(validityDays) : undefined,
    enrollmentDate
  );
  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'MANUAL_ENROLLMENT_GRANTED',
    entityType: 'Enrollment',
    entityId: enr.id,
    details: `Admin manually granted enrollment to student ${studentId} for course ${courseId} (${enr.validityDuration || 'Standard'}, Starts: ${enr.enrolledAt}, Expires: ${enr.expiresAt || 'Lifetime'}).`,
  });

  res.status(201).json({ success: true, enrollment: enr });
});

router.delete('/admin/enrollments/:id', requireAdmin, (req: AuthRequest, res) => {
  const ok = db.deleteEnrollment(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'Enrollment not found' });
    return;
  }

  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'ENROLLMENT_DELETED',
    entityType: 'Enrollment',
    entityId: req.params.id,
    details: `Admin deleted enrollment record ${req.params.id}.`,
  });

  res.json({ success: true, message: 'Enrollment record deleted successfully.' });
});

router.post('/admin/enrollments/:id/override', requireAdmin, (req: AuthRequest, res) => {
  const { override, extendDays, newExpiryDate, reason } = req.body;
  const enr = db.toggleEnrollmentOverride(req.params.id, {
    override,
    extendDays: extendDays ? Number(extendDays) : undefined,
    newExpiryDate,
    reason,
  });

  if (!enr) {
    res.status(404).json({ error: 'Enrollment not found' });
    return;
  }

  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'ENROLLMENT_OVERRIDE_UPDATED',
    entityType: 'Enrollment',
    entityId: req.params.id,
    details: `Admin updated validity override for enrollment ID ${req.params.id}. Status: ${enr.status}, Exp: ${enr.expiresAt || 'Lifetime'}.`,
  });

  res.json({ success: true, enrollment: enr, message: 'Enrollment validity override updated successfully.' });
});

router.post('/admin/enrollments/:id/revoke', requireAdmin, (req: AuthRequest, res) => {
  const success = db.revokeEnrollment(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Enrollment not found' });
    return;
  }

  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'ENROLLMENT_REVOKED',
    entityType: 'Enrollment',
    entityId: req.params.id,
    details: `Admin revoked enrollment ID ${req.params.id}.`,
  });

  res.json({ success: true, message: 'Enrollment revoked' });
});

router.get('/admin/students', requireAdmin, (req, res) => {
  const { search } = req.query;
  let students = db.listUsers('student');
  if (search) {
    const q = (search as string).toLowerCase();
    students = students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q)
    );
  }

  // Attach active course count
  const withStats = students.map((s) => {
    const enrs = db.listEnrollments(s.id).filter((e) => e.status === 'active');
    const pays = db.listPayments({ studentId: s.id });
    return {
      ...s,
      activeCoursesCount: enrs.length,
      paymentsCount: pays.length,
    };
  });

  res.json({ students: withStats });
});

router.put('/admin/students/:id/status', requireAdmin, (req: AuthRequest, res) => {
  const { status } = req.body; // 'active' | 'suspended'
  if (status !== 'active' && status !== 'suspended') {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const updated = db.updateUser(req.params.id, { status });
  if (!updated) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  db.addAuditLog({
    adminEmail: req.user!.email,
    action: `STUDENT_${status.toUpperCase()}`,
    entityType: 'User',
    entityId: req.params.id,
    details: `Admin changed student status to ${status}.`,
  });

  res.json({ student: updated });
});

// ==========================================
// 10. ADMIN: COURSE CRUD & BUILDER
// ==========================================
router.post('/admin/courses', requireAdmin, (req: AuthRequest, res) => {
  const {
    title,
    shortName,
    courseCode,
    subtitle,
    description,
    shortDescription,
    discipline,
    category,
    subcategory,
    exam,
    subject,
    courseType,
    instructorId,
    price,
    originalPrice,
    discountPrice,
    currency,
    validityType,
    validityDays,
    thumbnail,
    banner,
    duration,
    language,
    difficulty,
    visibility,
    requirements,
    learningOutcomes,
    status,
    isFeatured,
  } = req.body;

  if (!title || !category) {
    res.status(400).json({ error: 'Title and category are required' });
    return;
  }

  const isFree = courseType === 'free' || Number(price) === 0;
  const finalPrice = isFree ? 0 : Math.max(0, Number(price) || 0);
  const finalOrigPrice = isFree ? 0 : Math.max(finalPrice, Number(originalPrice) || Math.round(finalPrice * 1.5));
  const finalDiscPrice = isFree ? 0 : (discountPrice !== undefined ? Math.max(0, Number(discountPrice)) : finalPrice);

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const now = new Date().toISOString();
  const newCourse: Course = {
    id: `course-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    shortName: shortName || title.substring(0, 24),
    courseCode: courseCode || `EE-${Date.now().toString().slice(-4)}`,
    slug: `${slug}-${Date.now().toString().slice(-4)}`,
    subtitle: subtitle || '',
    description: description || '',
    shortDescription: shortDescription || (subtitle ? subtitle.substring(0, 120) : ''),
    discipline: discipline || category || 'Engineering',
    category,
    subcategory: subcategory || subject || '',
    exam: exam || 'All Engineering Exams',
    subject: subject || '',
    courseType: isFree ? 'free' : (courseType || 'paid'),
    instructorId: instructorId || 'inst-1',
    price: finalPrice,
    originalPrice: finalOrigPrice,
    discountPrice: finalDiscPrice,
    currency: currency || 'INR',
    validityType: validityType || 'lifetime',
    validityDays: validityDays ? Number(validityDays) : undefined,
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    banner: banner || thumbnail || '',
    duration: duration || '100+ Hours',
    language: language || 'Hinglish',
    difficulty: difficulty || 'All Levels',
    visibility: visibility || 'public',
    requirements: Array.isArray(requirements) ? requirements : [],
    learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : [],
    status: status || 'draft',
    isFeatured: Boolean(isFeatured),
    createdAt: now,
    updatedAt: now,
  };

  const created = db.createCourse(newCourse);
  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'COURSE_CREATED',
    entityType: 'Course',
    entityId: created.id,
    details: `Created course "${created.title}" with status ${created.status}, code ${created.courseCode}.`,
  });

  res.status(201).json({ course: created });
});

router.put('/admin/courses/:id', requireAdmin, (req: AuthRequest, res) => {
  const courseId = req.params.id;
  const updates = { ...req.body };

  if (updates.courseType === 'free') {
    updates.price = 0;
    updates.discountPrice = 0;
    updates.originalPrice = 0;
  } else if (updates.price !== undefined) {
    updates.price = Math.max(0, Number(updates.price));
    if (updates.originalPrice !== undefined) {
      updates.originalPrice = Math.max(updates.price, Number(updates.originalPrice));
    }
  }

  const updated = db.updateCourse(courseId, updates);
  if (!updated) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'COURSE_UPDATED',
    entityType: 'Course',
    entityId: courseId,
    details: `Updated course "${updated.title}" (Status: ${updated.status}, Visibility: ${updated.visibility}).`,
  });

  res.json({ course: updated });
});

router.delete('/admin/courses/:id', requireAdmin, (req: AuthRequest, res) => {
  const result = db.deleteCourse(req.params.id);
  if (!result.success) {
    res.status(404).json({ error: result.message });
    return;
  }

  db.addAuditLog({
    adminEmail: req.user!.email,
    action: result.softDeleted ? 'COURSE_ARCHIVED' : 'COURSE_DELETED',
    entityType: 'Course',
    entityId: req.params.id,
    details: result.message,
  });

  res.json(result);
});

// Quick status toggle (Draft <-> Published <-> Unpublished <-> Archived)
router.post('/admin/courses/:id/status', requireAdmin, (req: AuthRequest, res) => {
  const { status } = req.body;
  if (!['draft', 'published', 'unpublished', 'archived'].includes(status)) {
    res.status(400).json({ error: 'Invalid course status' });
    return;
  }

  const updated = db.updateCourse(req.params.id, { status });
  if (!updated) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  db.addAuditLog({
    adminEmail: req.user!.email,
    action: `COURSE_STATUS_${status.toUpperCase()}`,
    entityType: 'Course',
    entityId: req.params.id,
    details: `Changed course status of "${updated.title}" to ${status}.`,
  });

  res.json({ course: updated, message: `Course status changed to ${status}.` });
});

// Duplicate course (deep clone)
router.post('/admin/courses/:id/duplicate', requireAdmin, (req: AuthRequest, res) => {
  const cloned = db.duplicateCourse(req.params.id);
  if (!cloned) {
    res.status(404).json({ error: 'Course not found or duplicate failed' });
    return;
  }

  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'COURSE_DUPLICATED',
    entityType: 'Course',
    entityId: cloned.id,
    details: `Cloned course from original ID ${req.params.id} as "${cloned.title}".`,
  });

  res.status(201).json({ course: cloned, message: 'Course duplicated successfully with all modules and lessons.' });
});

// Publish readiness checklist
router.get('/admin/courses/:id/publish-checklist', requireAdmin, (req: AuthRequest, res) => {
  const course = db.findCourseById(req.params.id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const allModules = db.getData().modules.filter((m) => m.courseId === course.id);
  const allLessons = db.getData().lessons.filter((l) => l.courseId === course.id);

  const checks = [
    {
      id: 'title_desc',
      label: 'Course title & comprehensive description',
      passed: Boolean(course.title && course.description && course.description.length > 20),
      warning: false,
    },
    {
      id: 'thumbnail',
      label: 'Course thumbnail & banner image configured',
      passed: Boolean(course.thumbnail),
      warning: false,
    },
    {
      id: 'pricing',
      label: 'Pricing or Free course setting configured',
      passed: course.courseType === 'free' || (course.price !== undefined && course.price >= 0),
      warning: false,
    },
    {
      id: 'instructor',
      label: 'Faculty / Lead Instructor assigned',
      passed: Boolean(course.instructorId),
      warning: false,
    },
    {
      id: 'has_sections',
      label: 'At least 1 Curriculum Section / Module created',
      passed: allModules.length > 0,
      warning: allModules.length === 0,
    },
    {
      id: 'has_lessons',
      label: 'At least 1 Lecture / Lesson / Resource added',
      passed: allLessons.length > 0,
      warning: allLessons.length === 0,
    },
    {
      id: 'preview_content',
      label: 'At least 1 Free Preview lesson available for trial',
      passed: allLessons.some((l) => l.isFreePreview),
      warning: true, // optional warning
    },
  ];

  const canPublish = checks.filter((c) => !c.warning).every((c) => c.passed);

  res.json({
    courseId: course.id,
    courseTitle: course.title,
    currentStatus: course.status,
    canPublish,
    checks,
  });
});

// Get enrolled students for a specific course
router.get('/admin/courses/:id/students', requireAdmin, (req: AuthRequest, res) => {
  const courseId = req.params.id;
  const course = db.findCourseById(courseId);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const enrollments = db.listEnrollments().filter((e) => e.courseId === courseId);
  const studentList = enrollments.map((e) => {
    const student = db.findUserById(e.studentId);
    const progress = db.getProgress(e.studentId, courseId);
    return {
      enrollmentId: e.id,
      studentId: e.studentId,
      name: student?.name || 'Unknown Student',
      email: student?.email || 'N/A',
      phone: student?.phone || 'N/A',
      city: student?.city || '',
      state: student?.state || '',
      enrolledAt: e.enrolledAt,
      grantedBy: e.grantedBy,
      status: e.status,
      progressPercentage: progress.progressPercentage,
      completedLessonsCount: progress.completedLessonIds.length,
      lastAccessedAt: progress.lastAccessedAt,
    };
  });

  res.json({
    courseTitle: course.title,
    courseId,
    totalEnrolled: studentList.length,
    students: studentList,
  });
});

// --- Modules & Lessons Builder ---
router.post('/admin/courses/:id/modules', requireAdmin, (req: AuthRequest, res) => {
  const courseId = req.params.id;
  const { title, description, parentId, thumbnail, status, visibility, availabilityDate } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Section title is required' });
    return;
  }

  const existing = db.getData().modules.filter((m) => m.courseId === courseId);
  const newModule: Module = {
    id: `mod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    courseId,
    parentId: parentId || undefined,
    title,
    description: description || '',
    thumbnail: thumbnail || '',
    status: status || 'active',
    visibility: visibility || 'public',
    availabilityDate: availabilityDate || undefined,
    order: existing.length + 1,
    lessons: [],
    createdAt: new Date().toISOString(),
  };

  const created = db.createModule(newModule);
  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'SECTION_CREATED',
    entityType: 'Module',
    entityId: created.id,
    details: `Created section "${created.title}" in course ${courseId}.`,
  });

  res.status(201).json({ module: created });
});

router.put('/admin/modules/:id', requireAdmin, (req: AuthRequest, res) => {
  const updated = db.updateModule(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Section not found' });
    return;
  }

  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'SECTION_UPDATED',
    entityType: 'Module',
    entityId: req.params.id,
    details: `Updated section "${updated.title}".`,
  });

  res.json({ module: updated });
});

router.delete('/admin/modules/:id', requireAdmin, (req: AuthRequest, res) => {
  const ok = db.deleteModule(req.params.id);
  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'SECTION_DELETED',
    entityType: 'Module',
    entityId: req.params.id,
    details: `Deleted section ID ${req.params.id} and its associated lessons.`,
  });
  res.json({ success: ok });
});

// Duplicate module inside the same course
router.post('/admin/modules/:id/duplicate', requireAdmin, (req: AuthRequest, res) => {
  const cloned = db.duplicateModule(req.params.id);
  if (!cloned) {
    res.status(404).json({ error: 'Section not found' });
    return;
  }

  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'SECTION_DUPLICATED',
    entityType: 'Module',
    entityId: cloned.id,
    details: `Duplicated section from ID ${req.params.id} as "${cloned.title}".`,
  });

  res.status(201).json({ module: cloned, message: 'Section duplicated successfully.' });
});

router.post('/admin/modules/:id/lessons', requireAdmin, (req: AuthRequest, res) => {
  const moduleId = req.params.id;
  const {
    courseId,
    title,
    type,
    videoUrl,
    videoDuration,
    pdfUrl,
    pagesCount,
    contentText,
    linkUrl,
    downloadable,
    isFreePreview,
    status,
    dripDays,
    releaseDate,
    quizId,
    assignmentId,
  } = req.body;

  if (!courseId || !title || !type) {
    res.status(400).json({ error: 'courseId, title, and type are required' });
    return;
  }

  const existing = db.getData().lessons.filter((l) => l.moduleId === moduleId);
  const newLesson: Lesson = {
    id: `les-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    moduleId,
    courseId,
    title,
    order: existing.length + 1,
    type,
    videoUrl: videoUrl || '',
    videoDuration: videoDuration || '30:00',
    pdfUrl: pdfUrl || '',
    pagesCount: pagesCount ? Number(pagesCount) : undefined,
    contentText: contentText || '',
    linkUrl: linkUrl || '',
    downloadable: downloadable !== undefined ? Boolean(downloadable) : true,
    isFreePreview: Boolean(isFreePreview),
    status: status || 'active',
    dripDays: dripDays ? Number(dripDays) : undefined,
    releaseDate: releaseDate || undefined,
    quizId: quizId || undefined,
    assignmentId: assignmentId || undefined,
    createdAt: new Date().toISOString(),
  };

  const created = db.createLesson(newLesson);
  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'LESSON_CREATED',
    entityType: 'Lesson',
    entityId: created.id,
    details: `Added ${created.type} lesson "${created.title}" to module ${moduleId}.`,
  });

  res.status(201).json({ lesson: created });
});

router.put('/admin/lessons/:id', requireAdmin, (req: AuthRequest, res) => {
  const updated = db.updateLesson(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'LESSON_UPDATED',
    entityType: 'Lesson',
    entityId: req.params.id,
    details: `Updated lesson "${updated.title}".`,
  });

  res.json({ lesson: updated });
});

router.delete('/admin/lessons/:id', requireAdmin, (req: AuthRequest, res) => {
  const ok = db.deleteLesson(req.params.id);
  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'LESSON_DELETED',
    entityType: 'Lesson',
    entityId: req.params.id,
    details: `Deleted lesson ID ${req.params.id}.`,
  });
  res.json({ success: ok });
});

router.post('/admin/modules/reorder', requireAdmin, (req, res) => {
  const { courseId, moduleIds } = req.body;
  if (!courseId || !Array.isArray(moduleIds)) {
    res.status(400).json({ error: 'courseId and moduleIds array required' });
    return;
  }
  db.reorderModules(courseId, moduleIds);
  res.json({ success: true });
});

router.post('/admin/lessons/reorder', requireAdmin, (req, res) => {
  const { moduleId, lessonIds } = req.body;
  if (!moduleId || !Array.isArray(lessonIds)) {
    res.status(400).json({ error: 'moduleId and lessonIds array required' });
    return;
  }
  db.reorderLessons(moduleId, lessonIds);
  res.json({ success: true });
});

// ==========================================
// 11. QUIZZES & ASSIGNMENTS
// ==========================================
router.get('/quizzes/:id', requireAuth, (req: AuthRequest, res) => {
  const quiz = db.findQuizById(req.params.id);
  if (!quiz) {
    res.status(404).json({ error: 'Quiz not found' });
    return;
  }

  // If student, hide correct answer before submission
  if (req.user!.role !== 'admin') {
    const sanitizedQuestions = quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      marks: q.marks,
    }));
    res.json({ quiz: { ...quiz, questions: sanitizedQuestions } });
    return;
  }

  res.json({ quiz });
});

router.post('/quizzes/:id/submit', requireAuth, (req: AuthRequest, res) => {
  const { answers } = req.body;
  try {
    const result = db.submitQuiz(req.params.id, req.user!.id, answers || {});
    const fullQuiz = db.findQuizById(req.params.id);
    res.json({ result, quiz: fullQuiz });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/assignments/:id', requireAuth, (req, res) => {
  const a = db.findAssignmentById(req.params.id);
  if (!a) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  res.json({ assignment: a });
});

router.post('/assignments/:id/submit', requireAuth, (req: AuthRequest, res) => {
  const { fileUrl, comments } = req.body;
  if (!fileUrl) {
    res.status(400).json({ error: 'File URL or attachment is required' });
    return;
  }

  const sub = db.submitAssignment({
    id: `asub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    assignmentId: req.params.id,
    studentId: req.user!.id,
    studentName: req.user!.name,
    fileUrl,
    comments,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  });

  res.status(201).json({ submission: sub });
});

// ==========================================
// 12. INSTRUCTORS
// ==========================================
router.get('/instructors', (_req, res) => {
  const instructors = db.listInstructors();
  res.json({ instructors });
});

router.post('/admin/instructors', requireAdmin, (req: AuthRequest, res) => {
  const { name, qualification, experience, subjects, examExpertise, bio, photo } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Instructor name is required' });
    return;
  }

  const newInst = db.createInstructor({
    id: `inst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    qualification: qualification || 'M.Tech / B.Tech',
    experience: experience || '5+ Years Teaching Experience',
    subjects: Array.isArray(subjects) ? subjects : [subjects || 'Engineering'],
    examExpertise: Array.isArray(examExpertise) ? examExpertise : [examExpertise || 'JE/AE'],
    bio: bio || '',
    rating: 4.9,
    createdAt: new Date().toISOString(),
  });

  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'INSTRUCTOR_ADDED',
    entityType: 'Instructor',
    entityId: newInst.id,
    details: `Added new instructor: ${newInst.name}.`,
  });

  res.status(201).json({ instructor: newInst });
});

router.put('/admin/instructors/:id', requireAdmin, (req: AuthRequest, res) => {
  const updated = db.updateInstructor(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Instructor not found' });
    return;
  }
  res.json({ instructor: updated });
});

router.delete('/admin/instructors/:id', requireAdmin, (req: AuthRequest, res) => {
  const ok = db.deleteInstructor(req.params.id);
  res.json({ success: ok });
});

// ==========================================
// 13. ANALYTICS & CSV EXPORT
// ==========================================
router.get('/admin/analytics', requireAdmin, (_req, res) => {
  const analytics = db.getAnalytics();
  res.json({ analytics });
});

router.get('/admin/export/:type', requireAdmin, (req, res) => {
  const { type } = req.params;

  if (type === 'payments') {
    const payments = db.listPayments();
    let csv = 'Payment ID,Order ID,Student Name,Email,Phone,Course Title,Amount,Method,Transaction ID,Status,Submitted At\n';
    payments.forEach((p) => {
      csv += `"${p.id}","${p.orderId}","${p.studentName}","${p.studentEmail}","${p.studentPhone}","${p.courseTitle}",${p.amount},"${p.paymentMethod}","${p.transactionId}","${p.status}","${p.submittedAt}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="techsetu-payments.csv"');
    res.send(csv);
    return;
  }

  if (type === 'students') {
    const students = db.listUsers('student');
    let csv = 'Student ID,Name,Email,Phone,City,State,Status,Registration Date\n';
    students.forEach((s) => {
      csv += `"${s.id}","${s.name}","${s.email}","${s.phone}","${s.city || ''}","${s.state || ''}","${s.status}","${s.createdAt}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="techsetu-students.csv"');
    res.send(csv);
    return;
  }

  if (type === 'enrollments') {
    const enrollments = db.listEnrollments();
    let csv = 'Enrollment ID,Student Name,Student Email,Course Title,Status,Enrolled Date,Granted By,Progress %\n';
    enrollments.forEach((e) => {
      csv += `"${e.id}","${e.student?.name || ''}","${e.student?.email || ''}","${e.course?.title || ''}","${e.status}","${e.enrolledAt}","${e.grantedBy}",${e.progressPercentage || 0}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="techsetu-enrollments.csv"');
    res.send(csv);
    return;
  }

  res.status(400).json({ error: 'Unknown export type' });
});

// ==========================================
// 14. NOTIFICATIONS & ANNOUNCEMENTS
// ==========================================
router.get('/notifications', requireAuth, (req: AuthRequest, res) => {
  const notifs = db.listNotifications(req.user!.id, req.user!.role);
  res.json({ notifications: notifs });
});

router.post('/notifications/:id/read', requireAuth, (req, res) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

router.get('/announcements', (_req, res) => {
  const announcements = db.listAnnouncements();
  res.json({ announcements });
});

router.post('/admin/announcements', requireAdmin, (req: AuthRequest, res) => {
  const { title, content, courseId } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  const ann = db.createAnnouncement({
    id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    courseId: courseId || 'all',
    title,
    content,
    authorName: req.user!.name,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ announcement: ann });
});

// ==========================================
// 15. SETTINGS, AUDIT LOGS, CONTACT
// ==========================================
router.get('/settings', (_req, res) => {
  const settings = db.getSettings();
  res.json({ settings });
});

router.put('/admin/settings', requireAdmin, (req: AuthRequest, res) => {
  const updated = db.updateSettings(req.body);
  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'SETTINGS_UPDATED',
    entityType: 'Settings',
    entityId: 'settings-1',
    details: 'Platform configuration and payment parameters updated.',
  });
  res.json({ settings: updated });
});

router.get('/admin/audit-logs', requireAdmin, (_req, res) => {
  const logs = db.listAuditLogs();
  res.json({ auditLogs: logs });
});

router.post('/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email and message are required' });
    return;
  }

  const msg = db.createContactMessage({
    id: `msg-${Date.now()}`,
    name,
    email,
    phone: phone || '',
    subject,
    message,
    status: 'new',
    createdAt: new Date().toISOString(),
  });

  db.createNotification({
    id: `notif-contact-${Date.now()}`,
    userId: 'admin',
    title: 'New Student Inquiry',
    message: `Message from ${name} (${email}): "${(subject || message).slice(0, 50)}..."`,
    link: '/admin',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ success: true, message: 'Message sent successfully. Our counselors will reach out to you.' });
});

router.get('/admin/contact-messages', requireAdmin, (_req, res) => {
  const messages = db.listContactMessages();
  res.json({ contactMessages: messages });
});

router.put('/admin/contact-messages/:id', requireAdmin, (req, res) => {
  const { status } = req.body;
  db.updateContactMessageStatus(req.params.id, status);
  res.json({ success: true });
});

router.post('/admin/contact-messages/:id/reply', requireAdmin, (req: AuthRequest, res) => {
  const { reply } = req.body;
  if (!reply || !reply.trim()) {
    res.status(400).json({ error: 'Reply content cannot be empty' });
    return;
  }

  const updated = db.replyToContactMessage(req.params.id, reply.trim(), req.user?.email);
  if (!updated) {
    res.status(404).json({ error: 'Inquiry message not found' });
    return;
  }

  db.addAuditLog({
    adminEmail: req.user!.email,
    action: 'INQUIRY_REPLIED',
    entityType: 'ContactMessage',
    entityId: req.params.id,
    details: `Admin replied to inquiry from ${updated.name} (${updated.email}).`,
  });

  res.json({ success: true, message: updated });
});

export default router;
