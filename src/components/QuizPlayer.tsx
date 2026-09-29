import React, { useState, useEffect } from 'react';
import { Quiz, QuizSubmission } from '../types';
import { api } from '../services/api';
import { CheckCircle2, XCircle, Clock, Award, RotateCcw } from 'lucide-react';

interface QuizPlayerProps {
  quizId: string;
  onCompleted?: (result: QuizSubmission) => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quizId, onCompleted }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<QuizSubmission | null>(null);
  const [reviewQuiz, setReviewQuiz] = useState<Quiz | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.quizzes.get(quizId);
      setQuiz(res.quiz);
      setIsSubmitted(false);
      setSubmissionResult(null);
      setSelectedAnswers({});
      setCurrentIndex(0);
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    try {
      setSubmitting(true);
      const res = await api.quizzes.submit(quiz.id, selectedAnswers);
      setSubmissionResult(res.result);
      setReviewQuiz(res.quiz);
      setIsSubmitted(true);
      if (onCompleted) onCompleted(res.result);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading quiz questions...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-center text-rose-700 dark:text-rose-300">
        <p className="font-semibold text-sm">Failed to load quiz</p>
        <p className="text-xs mt-1 text-rose-600 dark:text-rose-400">{error}</p>
        <button
          onClick={loadQuiz}
          className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-md text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  if (isSubmitted && submissionResult && reviewQuiz) {
    const passed = submissionResult.passed;
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Result Header */}
        <div
          className={`p-6 text-center text-white ${
            passed ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-rose-600 to-amber-600'
          }`}
        >
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="w-9 h-9 text-white" />
          </div>
          <h3 className="text-2xl font-black">{passed ? 'Congratulations! Passed' : 'Needs Improvement'}</h3>
          <p className="text-sm opacity-90 mt-1">
            Score: <span className="font-extrabold">{submissionResult.score}</span> / {submissionResult.totalMarks} marks ({submissionResult.percentage}%)
          </p>
          <p className="text-xs opacity-75 mt-0.5">Passing criteria: {quiz.passPercentage}%</p>
        </div>

        {/* Detailed Solutions Review */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h4 className="font-bold text-slate-800 dark:text-white">Answer Key & Detailed Explanations</h4>
            <button
              onClick={loadQuiz}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Quiz
            </button>
          </div>

          <div className="space-y-6">
            {reviewQuiz.questions.map((q, idx) => {
              const studentAnswer = submissionResult.selectedAnswers[q.id];
              const isCorrect = studentAnswer === q.correctOption;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      Q{idx + 1}. {q.question}
                    </span>
                    <span
                      className={`shrink-0 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        isCorrect
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> +{q.marks}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> 0
                        </>
                      )}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-2 mb-3">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = studentAnswer === optIdx;
                      const isOptionCorrect = q.correctOption === optIdx;

                      let optClass = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200';
                      if (isOptionCorrect) {
                        optClass = 'bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-500 font-semibold text-emerald-900 dark:text-emerald-200';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        optClass = 'bg-rose-100/70 dark:bg-rose-950/60 border-rose-500 font-semibold text-rose-900 dark:text-rose-200 line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`px-3.5 py-2.5 rounded-lg border text-xs flex items-center justify-between ${optClass}`}
                        >
                          <span>{opt}</span>
                          {isOptionCorrect && <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">✓ Correct</span>}
                          {isOptionSelected && !isOptionCorrect && (
                            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">✗ Your Choice</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="mt-2.5 p-3 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Quiz Top bar */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-800 dark:text-white">{quiz.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total {totalQuestions} Questions • {quiz.totalMarks} Marks
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <Clock className="w-4 h-4" />
          <span>{quiz.timeLimitMinutes} Mins</span>
        </div>
      </div>

      {/* Question tracker buttons */}
      <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
        {quiz.questions.map((_, idx) => {
          const isAnswered = selectedAnswers[quiz.questions[idx].id] !== undefined;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                isCurrent
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 dark:ring-indigo-700'
                  : isAnswered
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Active Question Box */}
      {currentQ && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{currentQ.marks} Marks</span>
          </div>

          <p className="text-base font-medium text-slate-900 dark:text-white leading-relaxed mb-6">
            {currentQ.question}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const selected = selectedAnswers[currentQ.id] === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(currentQ.id, idx)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                    selected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                      selected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`text-sm ${selected ? 'font-semibold text-indigo-950 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Navigation & Submit footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Answered {answeredCount} / {totalQuestions}
            </div>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((p) => Math.min(totalQuestions - 1, p + 1))}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Evaluating...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
