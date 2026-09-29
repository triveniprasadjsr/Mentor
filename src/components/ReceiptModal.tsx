import React from 'react';
import { Payment } from '../types';
import { X, CheckCircle, XCircle, ExternalLink, Calendar, CreditCard, User, Mail, Phone } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment | null;
  onClose: () => void;
  onApprove: (paymentId: string) => void;
  onReject: (paymentId: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
              Order {payment.orderId}
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Payment Verification Review</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable details */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Amount</span>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">₹{payment.amount}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Method</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase mt-1">Manual UPI</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status</span>
              <p className="text-xs font-extrabold mt-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full ${
                    payment.status === 'approved'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : payment.status === 'pending'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {payment.status.toUpperCase()}
                </span>
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Date</span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 truncate">
                {new Date(payment.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Student & Course info */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-semibold text-slate-900 dark:text-white">Course:</span>
              <span className="truncate">{payment.courseTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-900 dark:text-white">Student:</span>
              <span>{payment.studentName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-900 dark:text-white">Email:</span>
              <span>{payment.studentEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-900 dark:text-white">Phone:</span>
              <span>{payment.studentPhone}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white">Transaction ID / UTR:</span>
              <code className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono font-bold text-indigo-700 dark:text-indigo-400 text-xs select-all">
                {payment.transactionId}
              </code>
            </div>
          </div>

          {/* Receipt Image / Screenshot */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Uploaded Payment Screenshot</h4>
              {payment.receiptUrl && (
                <a
                  href={payment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Original Image
                </a>
              )}
            </div>

            {payment.receiptUrl ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2 overflow-hidden flex justify-center">
                <img
                  src={payment.receiptUrl}
                  alt="Payment Receipt"
                  className="max-h-[350px] w-auto object-contain rounded-lg shadow-sm"
                />
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-sm">
                No screenshot uploaded by student (UTR provided).
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>

          {payment.status === 'pending' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onReject(payment.id)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => onApprove(payment.id)}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200 dark:shadow-emerald-950 rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Approve & Enroll
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
