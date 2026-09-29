import React, { useState } from 'react';
import { Course, SiteSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  QrCode,
  CreditCard,
  Upload,
  CheckCircle,
  Copy,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CheckoutPageProps {
  course: Course;
  settings?: SiteSettings;
  onNavigate: (path: string) => void;
  onSuccess: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  course,
  settings,
  onNavigate,
  onSuccess,
}) => {
  const { user } = useAuth();

  // If not logged in, prompt user
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Please login or create an account before purchasing{' '}
            <strong className="text-slate-800 dark:text-white font-bold">"{course.title}"</strong>.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => onNavigate(`/login?redirect=/checkout/${course.id}`)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Log In to Continue
          </button>
          <button
            onClick={() => onNavigate(`/signup?redirect=/checkout/${course.id}`)}
            className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors"
          >
            Create New Student Account
          </button>
        </div>
      </div>
    );
  }

  // Form states
  const [transactionId, setTransactionId] = useState('');
  const [studentPhone, setStudentPhone] = useState(user.phone || '');
  const [studentName, setStudentName] = useState(user.name || '');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedModalOpen, setSubmittedModalOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const upiId = settings?.upiId || 'techsetu@upi';
  const qrUrl =
    settings?.upiQrUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(
      upiId
    )}&pn=TechSetu%20Education&am=${course.discountPrice}&cu=INR`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB. Please choose a smaller screenshot.');
      return;
    }

    setReceiptFile(file);

    // Show local preview
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setError('Transaction ID / UTR Number is required for verification.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let uploadedReceiptUrl = '';
      if (receiptFile) {
        setUploadingReceipt(true);
        const uploadRes = await api.upload(receiptFile);
        uploadedReceiptUrl = uploadRes.url;
        setUploadingReceipt(false);
      }

      await api.payments.submitManual({
        courseId: course.id,
        amount: course.discountPrice,
        transactionId: transactionId.trim(),
        receiptUrl: uploadedReceiptUrl,
        studentName,
        studentPhone,
        paymentDate,
      });

      setSubmittedModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Payment submission failed');
    } finally {
      setSubmitting(false);
      setUploadingReceipt(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Course Checkout</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete payment using our official UPI QR code. Submit the transaction reference for admin approval.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: UPI QR & Instructions */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Step 1: Scan & Pay via UPI</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Google Pay • PhonePe • Paytm • BHIM</p>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100">
              <img
                src={qrUrl}
                alt="UPI Payment QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-4 text-center">
              Scan with any UPI Banking App to Pay ₹{course.discountPrice}
            </p>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Account: {settings?.upiAccountHolder || 'TechSetu Education Services'}
            </span>

            {/* UPI ID pill with copy */}
            <div className="mt-4 flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400">{upiId}</span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Copy UPI ID"
              >
                <Copy className="w-4 h-4" />
              </button>
              {copiedUpi && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Copied!</span>
              )}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">
              Payment Instructions:
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Open your favorite UPI app (GPay, PhonePe, Paytm, etc.).</li>
              <li>Scan the QR code above or send exactly <strong className="text-slate-900 dark:text-white">₹{course.discountPrice}</strong> to <code className="font-mono text-indigo-700 dark:text-indigo-400 font-bold">{upiId}</code>.</li>
              <li>Once payment succeeds, note down the <strong className="text-slate-900 dark:text-white">12-digit UTR / Reference ID</strong> and take a screenshot.</li>
              <li>Fill the submission form on the right and click "Submit Payment for Verification".</li>
            </ol>
          </div>
        </div>

        {/* Right: Payment Verification Form */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Step 2: Submit Verification Details</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Fast-track admin approval within 15-60 mins</p>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                  {course.exam}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{course.title}</h4>
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white shrink-0">
                ₹{course.discountPrice}
              </span>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registered Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Paid (INR)
                </label>
                <input
                  type="number"
                  disabled
                  value={course.discountPrice}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Transaction ID / UPI Reference / UTR Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 428910482910 or UPI-123456"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Found on your Google Pay / PhonePe transaction details page.
              </span>
            </div>

            {/* Payment screenshot upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Screenshot / Receipt (Optional but recommended)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/40 cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleReceiptFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-8 w-8 text-slate-400" />
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Click to upload screenshot</span> or drag & drop
                  </div>
                  <p className="text-[11px] text-slate-400">PNG, JPG, WEBP up to 15MB</p>
                </div>
              </div>

              {receiptPreview && (
                <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={receiptPreview}
                      alt="Receipt Preview"
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-200 truncate max-w-xs font-medium">
                      {receiptFile?.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptFile(null);
                      setReceiptPreview(null);
                    }}
                    className="text-xs text-rose-600 dark:text-rose-400 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting || uploadingReceipt}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {submitting || uploadingReceipt ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{uploadingReceipt ? 'Uploading Screenshot...' : 'Verifying & Submitting...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Payment for Verification</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Submission Success Confirmation Modal */}
      {submittedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Payment Submitted Successfully!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Your payment submission for <strong className="text-slate-900 dark:text-white">"{course.title}"</strong> has been logged in our verification queue.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">Pending Admin Verification</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction UTR:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{course.discountPrice}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Once approved by our administrators, this course will immediately appear in your <strong className="text-slate-700 dark:text-slate-300">"My Courses"</strong> tab with full video and notes access.
            </p>

            <button
              onClick={() => {
                setSubmittedModalOpen(false);
                onSuccess();
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Go to Student Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
