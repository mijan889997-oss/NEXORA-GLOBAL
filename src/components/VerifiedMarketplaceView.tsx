import React, { useState, useRef, useEffect } from 'react';
import { 
  Briefcase, 
  CheckCircle, 
  DollarSign, 
  Layers, 
  ShieldCheck, 
  BookOpen, 
  AlertCircle,
  Clock,
  Send,
  RefreshCw,
  X,
  ExternalLink,
  CheckCircle2,
  FileText,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Camera,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Service } from '../types';
import { ServiceCard } from './ServiceCard';
import { openUdemyAffiliate } from '../config/affiliateLinks';
import { markTaskAsCompleted } from '../lib/taskLockUtils';
import { fetchSupabaseMicrotasks, subscribeToMicrotasks, subscribeToSubmissions } from '../lib/supabase';

export interface Task {
  id: string;
  title: string;
  category: string;
  reward: number;
  rewardAmount?: number;
  rewardCoins?: number;
  spotsLeft: number;
  totalSlots?: number;
  slotsRemaining?: number;
  employer: string;
  targetUrl?: string;
  description?: string;
  instructions?: string;
  proofRequirements?: string;
  status?: string;
}

// Sub-component for Task Submission Modal with completely fresh isolated state per task open
interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onSuccess: (taskId: string) => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
  refreshMe?: () => Promise<any>;
  user: any;
}

function TaskProofModal({ task, onClose, onSuccess, apiFetch, refreshMe, user }: TaskModalProps) {
  const [proofNotes, setProofNotes] = useState('');
  const [transactionOrProfileId, setTransactionOrProfileId] = useState('');
  const [screenshotData, setScreenshotData] = useState('');
  const [screenshotFileName, setScreenshotFileName] = useState('');
  const [screenshotFileSize, setScreenshotFileSize] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file (PNG, JPG, JPEG, WEBP) / অনুগ্রহ করে একটি ছবি নির্বাচন করুন।'));
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        reject(new Error('Image file is too large (maximum 15MB) / ফাইলের সাইজ ১৫ মেগাবাইটের বেশি হতে পারবে না।'));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file from device / ডিভাইস থেকে ছবি পড়তে ব্যর্থ হয়েছে।'));
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) {
          reject(new Error('Image conversion failed / ছবি রূপান্তর ব্যর্থ হয়েছে।'));
          return;
        }

        if (file.size < 600 * 1024) {
          resolve(result);
          return;
        }

        const img = new Image();
        img.onerror = () => resolve(result);
        img.onload = () => {
          try {
            const maxDim = 1600;
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(result);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const compressedData = canvas.toDataURL('image/jpeg', 0.85);
            resolve(compressedData);
          } catch {
            resolve(result);
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setSubmitMsg(null);
      const dataUri = await processImageFile(file);
      setScreenshotData(dataUri);
      setScreenshotFileName(file.name);
      setScreenshotFileSize(formatFileSize(file.size));
    } catch (err: any) {
      setSubmitMsg({
        type: 'error',
        text: err.message || 'Error loading image / ছবি লোড করতে সমস্যা হয়েছে।',
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setSubmitMsg(null);
      const dataUri = await processImageFile(file);
      setScreenshotData(dataUri);
      setScreenshotFileName(file.name);
      setScreenshotFileSize(formatFileSize(file.size));
    } catch (err: any) {
      setSubmitMsg({
        type: 'error',
        text: err.message || 'Error loading image / ছবি লোড করতে সমস্যা হয়েছে।',
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotData('');
    setScreenshotFileName('');
    setScreenshotFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMsg(null);

    if (!user) {
      setSubmitMsg({
        type: 'error',
        text: 'Please log in to submit task verification proof / টাস্ক জমা দিতে লগইন করুন।',
      });
      return;
    }

    if (!proofNotes.trim() && !screenshotData.trim() && !transactionOrProfileId.trim()) {
      setSubmitMsg({
        type: 'error',
        text: 'Please provide proof (Screenshot, Transaction/Profile ID, or completion notes).',
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await apiFetch(`/api/tasks/${task.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          taskTitle: task.title,
          taskCategory: task.category,
          reward: task.reward,
          rewardAmount: task.reward,
          textNotes: proofNotes,
          screenshotUrl: screenshotData,
          transactionOrProfileId: transactionOrProfileId.trim(),
        }),
      });

      setSubmitMsg({
        type: 'success',
        text: res.message || 'Task proof submitted successfully! Review pending / প্রমাণ সফলভাবে জমা দেওয়া হয়েছে!',
      });

      // Save submission to localStorage so it syncs immediately with Admin Panel Task Approvals
      try {
        const localSubmission = {
          id: res?.submission?.id || `sub_${Date.now()}`,
          taskId: task.id,
          taskTitle: task.title,
          taskCategory: task.category,
          rewardAmount: task.reward,
          userId: user?.id || 'usr_local',
          userName: user?.fullName || user?.email || 'Worker',
          userEmail: user?.email || '',
          textNotes: proofNotes,
          screenshotUrl: screenshotData,
          transactionOrProfileId: transactionOrProfileId.trim(),
          status: 'pending_review',
          submittedAt: new Date().toISOString(),
        };
        const existingSubs = JSON.parse(localStorage.getItem('nexvora_custom_submissions') || '[]');
        existingSubs.unshift(localSubmission);
        localStorage.setItem('nexvora_custom_submissions', JSON.stringify(existingSubs));
        window.dispatchEvent(new Event('submissions_updated'));
      } catch (e) {
        console.warn('localStorage submission sync warning:', e);
      }

      const completedAt = res?.completedAt || new Date().toISOString();
      const cooldownUntil = res?.cooldownUntil || new Date(Date.now() + 5 * 3600 * 1000).toISOString();
      markTaskAsCompleted(task.id, user?.id, completedAt, cooldownUntil);

      onSuccess(task.id);
      setProofNotes('');
      setTransactionOrProfileId('');
      setScreenshotData('');
      setScreenshotFileName('');
      setScreenshotFileSize('');

      if (refreshMe) {
        await refreshMe();
      }

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setSubmitMsg({
        type: 'error',
        text: err.message || 'Failed to submit task proof / টাস্ক জমা দিতে ব্যর্থ হয়েছে।',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-7 space-y-5 shadow-2xl my-8 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pr-8">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-bold">
              {task.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold">
              100% Escrow Reward
            </span>
          </div>
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] pt-1">
            {task.title}
          </h3>
        </div>

        {/* Payout Information */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Task Reward Amount</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              ${task.reward.toFixed(2)} USD
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Approx. BDT</span>
            <span className="text-xs text-emerald-500 font-bold font-mono">
              ≈ ৳{(task.reward * 120).toFixed(0)} BDT
            </span>
          </div>
        </div>

        {/* Task Description */}
        {task.description && (
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs space-y-1">
            <strong className="text-slate-300 block font-semibold">Task Description:</strong>
            <p className="text-slate-400 leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Task Instructions */}
        {task.instructions && (
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/70 text-amber-200 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Task Instructions & Steps:</span>
            </div>
            <p className="text-amber-100/90 leading-relaxed font-medium whitespace-pre-line">
              {task.instructions}
            </p>
          </div>
        )}

        {/* Proof Requirements */}
        {task.proofRequirements && (
          <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/70 text-purple-200 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-purple-300">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Proof Requirements (Mandatory):</span>
            </div>
            <p className="text-purple-100/90 leading-relaxed font-medium whitespace-pre-line">
              {task.proofRequirements}
            </p>
          </div>
        )}

        {/* Target URL if available */}
        {task.targetUrl && (
          <a
            href={task.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-800 hover:border-cyan-600 text-cyan-300 text-xs font-semibold flex items-center justify-between gap-2 transition"
          >
            <span>👉 Open Task Link in New Tab ({task.targetUrl})</span>
            <ExternalLink className="w-4 h-4 shrink-0" />
          </a>
        )}

        {/* Submission Message Feedback */}
        {submitMsg && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
              submitMsg.type === 'success'
                ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                : 'bg-rose-950 border border-rose-700 text-rose-300'
            }`}
          >
            {submitMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{submitMsg.text}</span>
          </div>
        )}

        {/* Proof Submission Form - 100% File Upload & Secret Code */}
        <form id="task-proof-submission-form" onSubmit={handleSubmitProof} className="space-y-4 text-xs">
          {/* Transaction ID or Profile ID */}
          <div className="space-y-1.5">
            <label htmlFor="task-profile-id" className="block text-white font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Transaction ID or Profile / Username ID</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">e.g. Registered User ID, @username, or TX ID</span>
            </label>
            <input
              id="task-profile-id"
              type="text"
              value={transactionOrProfileId}
              onChange={(e) => setTransactionOrProfileId(e.target.value)}
              placeholder="e.g. @telegram_user, User #849201, or TX hash..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-400 transition placeholder:text-slate-500 font-medium"
            />
          </div>

          {/* Secret Code / Notes Input */}
          <div className="space-y-1.5">
            <label htmlFor="task-proof-notes" className="block text-white font-bold flex items-center justify-between">
              <span>Proof Notes & Completion Details / কাজের বিবরণ</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional if screenshot or ID provided</span>
            </label>
            <textarea
              id="task-proof-notes"
              rows={2}
              value={proofNotes}
              onChange={(e) => setProofNotes(e.target.value)}
              placeholder="Enter your verification secret code, username, or completion details..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 transition placeholder:text-slate-500 font-medium"
            />
          </div>

          {/* Direct Screenshot File Upload Section - 100% No URL Input */}
          <div className="space-y-2">
            <label htmlFor="task-screenshot-file-input" className="block text-white font-bold flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Upload Screenshot from Gallery / গ্যালারি থেকে ছবি আপলোড করুন</span>
            </label>

            {/* Hidden Native File Input */}
            <input
              ref={fileInputRef}
              id="task-screenshot-file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {screenshotData ? (
              /* Image Thumbnail Preview Card */
              <div 
                id="screenshot-preview-card" 
                className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-700/80 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Screenshot Selected / ছবি যুক্ত হয়েছে</span>
                  </div>
                  <button
                    type="button"
                    id="remove-screenshot-btn"
                    onClick={handleRemoveScreenshot}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/90 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove / মুছে ফেলুন</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-black flex items-center justify-center">
                    <img
                      src={screenshotData}
                      alt="Screenshot Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-bold text-white truncate">
                      {screenshotFileName || 'screenshot_proof.png'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      File Size: <strong className="text-slate-300">{screenshotFileSize || 'Optimized'}</strong>
                    </p>
                    <p className="text-[11px] text-emerald-400 font-medium">
                      ✓ Base64 Data ready for instant submission
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Direct Gallery Picker & Drag-and-Drop Area */
              <div
                id="screenshot-dropzone"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-3 cursor-pointer ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-950/40 scale-[0.99]'
                    : 'border-slate-700 hover:border-cyan-500 bg-slate-950/70 hover:bg-slate-950'
                }`}
              >
                {isProcessingImage ? (
                  <div className="py-4 flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                    <span className="text-xs font-semibold text-cyan-300">
                      Processing & converting image to Base64...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400">
                      <Upload className="w-6 h-6" />
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">
                        Click to select screenshot from Gallery or drag & drop
                      </p>
                      <p className="text-[11px] text-slate-400">
                        গ্যালারি অথবা ক্যামেরা থেকে স্ক্রিনশট সিলেক্ট করুন (PNG, JPG, WEBP)
                      </p>
                    </div>

                    <button
                      type="button"
                      id="browse-gallery-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-950/50 transition cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Choose Image / ছবি নির্বাচন করুন</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              id="cancel-submission-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
            >
              Cancel / বাতিল
            </button>
            <button
              type="submit"
              id="submit-proof-confirm-btn"
              disabled={submitting || isProcessingImage}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Proof...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Proof / প্রমাণ জমা দিন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifiedMarketplaceView() {
  const { apiFetch, user, refreshMe } = useAuth();
  const [activeTab, setActiveTab] = useState<'tasks' | 'my-submissions' | 'services' | 'jobs' | 'academy'>('tasks');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submittedTasks, setSubmittedTasks] = useState<Record<string, boolean>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const isAdminUser = Boolean(
    user && (user.email === 'admin@nexvora.global' || user.role === 'SUPER ADMIN' || user.role === 'ADMIN')
  );

  const loadServices = async () => {
    try {
      const res = await apiFetch('/api/services');
      if (res && Array.isArray(res.services)) {
        setServices(res.services);
      }
    } catch (err) {
      console.warn('Could not load services:', err);
    }
  };

  const loadMySubmissions = async () => {
    if (!user) return;
    try {
      setLoadingSubmissions(true);
      // Fetch from API
      const res = await apiFetch('/api/tasks/my-submissions');
      let apiSubs: any[] = [];
      if (res && Array.isArray(res.submissions)) {
        apiSubs = res.submissions;
      }

      // Also merge any submissions from localStorage
      let localSubs: any[] = [];
      try {
        const raw = localStorage.getItem('nexvora_custom_submissions');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            localSubs = parsed.filter((s) => !user?.id || s.userId === user.id || s.userEmail === user.email);
          }
        }
      } catch {}

      const map = new Map<string, any>();
      localSubs.forEach((s) => map.set(s.id, s));
      apiSubs.forEach((s) => map.set(s.id, s));

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
      );
      setMySubmissions(merged);
    } catch (err) {
      console.warn('Could not load user submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);

      // Clean up any legacy demo tasks from localStorage
      try {
        const rawLocal = localStorage.getItem('nexvora_custom_tasks');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(
              (t: any) =>
                t &&
                t.id !== 'TASK-101' &&
                t.id !== 'TASK-102' &&
                !t.title?.includes('Sign up and verify profile on partner website') &&
                !t.title?.includes('App feedback & UI bug testing')
            );
            if (filtered.length !== parsed.length) {
              localStorage.setItem('nexvora_custom_tasks', JSON.stringify(filtered));
            }
          }
        }
      } catch (err) {
        console.warn('LocalStorage task cleanup notice:', err);
      }

      // 1. Fetch from Supabase database
      let supabaseTasks: Task[] = [];
      try {
        const sbData = await fetchSupabaseMicrotasks();
        if (Array.isArray(sbData)) {
          supabaseTasks = sbData
            .filter(
              (t: any) =>
                t &&
                t.id !== 'TASK-101' &&
                t.id !== 'TASK-102' &&
                !t.title?.includes('Sign up and verify profile on partner website') &&
                !t.title?.includes('App feedback & UI bug testing')
            )
            .map((t: any) => ({
              id: t.id,
              title: t.title,
              category: t.category || 'Microtask',
              reward: t.rewardAmount !== undefined ? t.rewardAmount : (t.rewardCoins ? t.rewardCoins / 1000 : 0.25),
              rewardAmount: t.rewardAmount,
              rewardCoins: t.rewardCoins,
              spotsLeft: t.slotsRemaining !== undefined ? t.slotsRemaining : (t.spotsLeft !== undefined ? t.spotsLeft : 50),
              totalSlots: t.totalSlots || 100,
              employer: t.employer || 'Nexora Verified',
              targetUrl: t.targetUrl,
              description: t.description,
              instructions: Array.isArray(t.instructions) ? t.instructions.join('\n') : (t.instructions || t.description),
              proofRequirements: t.proofRequirements,
              status: t.status,
            }));
        }
      } catch (err) {
        console.warn('[Supabase] Could not fetch tasks:', err);
      }

      // 2. Fetch from server API
      let serverTasks: Task[] = [];
      try {
        const res = await apiFetch('/api/tasks');
        if (res && Array.isArray(res.tasks)) {
          serverTasks = res.tasks
            .filter(
              (t: any) =>
                t &&
                t.id !== 'TASK-101' &&
                t.id !== 'TASK-102' &&
                !t.title?.includes('Sign up and verify profile on partner website') &&
                !t.title?.includes('App feedback & UI bug testing')
            )
            .map((t: any) => ({
              id: t.id,
              title: t.title,
              category: t.category || 'Microtask',
              reward: t.rewardAmount !== undefined ? t.rewardAmount : (t.rewardCoins ? t.rewardCoins / 1000 : 0.25),
              rewardAmount: t.rewardAmount,
              rewardCoins: t.rewardCoins,
              spotsLeft: t.slotsRemaining !== undefined ? t.slotsRemaining : (t.totalSlots || 50),
              totalSlots: t.totalSlots || 100,
              employer: t.employer || 'Nexora Verified',
              targetUrl: t.targetUrl,
              description: t.description,
              instructions: Array.isArray(t.instructions) ? t.instructions.join('\n') : (t.instructions || t.description),
              proofRequirements: t.proofRequirements,
              status: t.status,
            }));
        }
      } catch (err) {
        console.warn('Could not fetch server tasks:', err);
      }

      // 3. Read from localStorage custom tasks (Admin created tasks)
      let localTasks: Task[] = [];
      try {
        const raw = localStorage.getItem('nexvora_custom_tasks');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            localTasks = parsed
              .filter(
                (t: any) =>
                  t &&
                  t.id !== 'TASK-101' &&
                  t.id !== 'TASK-102' &&
                  !t.title?.includes('Sign up and verify profile on partner website') &&
                  !t.title?.includes('App feedback & UI bug testing')
              )
              .map((t: any) => ({
                id: t.id,
                title: t.title,
                category: t.category || 'Microtask',
                reward: t.rewardAmount !== undefined ? t.rewardAmount : (t.reward !== undefined ? t.reward : (t.rewardCoins ? t.rewardCoins / 1000 : 0.25)),
                rewardAmount: t.rewardAmount || t.reward,
                rewardCoins: t.rewardCoins,
                spotsLeft: t.spotsLeft !== undefined ? t.spotsLeft : (t.slotsRemaining !== undefined ? t.slotsRemaining : 50),
                totalSlots: t.totalSlots || 100,
                employer: t.employer || 'Admin Verified',
                targetUrl: t.targetUrl,
                description: t.description,
                instructions: Array.isArray(t.instructions) ? t.instructions.join('\n') : (t.instructions || t.description),
                proofRequirements: t.proofRequirements,
                status: t.status,
              }));
          }
        }
      } catch (err) {
        console.warn('Could not parse localStorage tasks:', err);
      }

      // Retrieve blacklist of deleted tasks and status overrides
      let deletedIds: string[] = [];
      try {
        const rawDel = localStorage.getItem('nexvora_deleted_tasks');
        if (rawDel) deletedIds = JSON.parse(rawDel);
      } catch {}

      let statusOverrides: Record<string, string> = {};
      try {
        const rawOv = localStorage.getItem('nexvora_task_status_overrides');
        if (rawOv) statusOverrides = JSON.parse(rawOv);
      } catch {}

      const isValidActiveTask = (t: Task) => {
        if (!t || !t.id) return false;
        if (deletedIds.includes(t.id)) return false;
        const effStatus = statusOverrides[t.id] || (t as any).status;
        if (effStatus && effStatus !== 'active') return false;
        return true;
      };

      // Merge: Supabase, Server, and Local Admin tasks
      const mergedMap = new Map<string, Task>();
      supabaseTasks.filter(isValidActiveTask).forEach((t) => mergedMap.set(t.id, t));
      serverTasks.filter(isValidActiveTask).forEach((t) => mergedMap.set(t.id, t));
      localTasks.filter(isValidActiveTask).forEach((t) => mergedMap.set(t.id, t));

      setTasks(Array.from(mergedMap.values()));

      // Also restore submitted state from localStorage
      try {
        const rawSubs = localStorage.getItem('nexvora_custom_submissions');
        if (rawSubs) {
          const parsed = JSON.parse(rawSubs);
          if (Array.isArray(parsed)) {
            const map: Record<string, boolean> = {};
            parsed.forEach((s: any) => {
              if (s.taskId) map[s.taskId] = true;
            });
            setSubmittedTasks((prev) => ({ ...prev, ...map }));
          }
        }
      } catch {}
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
    loadServices();
    loadMySubmissions();
    const handleUpdate = () => {
      loadTasks();
      loadServices();
      loadMySubmissions();
    };
    window.addEventListener('tasks_updated', handleUpdate);
    window.addEventListener('submissions_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Supabase real-time subscriptions for instant live task syncing
    const unsubMicro = subscribeToMicrotasks(() => {
      console.log('[Supabase Realtime] Microtasks table changed. Syncing UI...');
      loadTasks();
    });
    const unsubSubs = subscribeToSubmissions(() => {
      console.log('[Supabase Realtime] Submissions table changed. Syncing UI...');
      loadMySubmissions();
    });

    return () => {
      window.removeEventListener('tasks_updated', handleUpdate);
      window.removeEventListener('submissions_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      if (typeof unsubMicro === 'function') unsubMicro();
      if (typeof unsubSubs === 'function') unsubSubs();
    };
  }, [user]);

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  const handleTaskSuccess = (taskId: string) => {
    setSubmittedTasks((prev) => ({ ...prev, [taskId]: true }));
    loadMySubmissions();
    if (refreshMe) {
      refreshMe();
    }
  };

  return (
    <div key="verified-marketplace-container" className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* Header & Compliance Notice */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white font-['Space_Grotesk']">Nexvora Global Marketplace</h1>
            <p className="text-xs text-slate-400">100% Verified Manual Microtasks, Quality Assurance & Freelance Work</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-800/70 text-emerald-300 px-3.5 py-1.5 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Manual Compliance Review & Real Payouts</span>
        </div>
      </div>

      {/* Marketplace Category Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'tasks' 
              ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-950/50' 
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" /> Available Tasks ({tasks.length})
        </button>
        <button 
          onClick={() => setActiveTab('my-submissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'my-submissions' 
              ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-950/50' 
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" /> My Submissions ({mySubmissions.length})
        </button>
        {isAdminUser && (
          <>
            <button 
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'services' 
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-950/50' 
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" /> Marketing Services ({services.length > 0 ? services.length : 1})
            </button>
            <button 
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'jobs' 
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-950/50' 
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Freelance Jobs (0)
            </button>
          </>
        )}
        <button 
          onClick={() => {
            openUdemyAffiliate();
            setActiveTab('academy');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'academy' 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/50' 
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span>Academy Courses (Udemy Partner)</span>
          <ExternalLink className="w-3.5 h-3.5 text-purple-300" />
        </button>
      </div>

      {/* Main Task List Container */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Available Verified Work
              </h2>
              <p className="text-xs text-slate-400">Complete task requirements and submit proof of work for escrow payouts</p>
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
              Manual Verification
            </span>
          </div>

          {loadingTasks ? (
            <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-2xl text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Loading verified tasks from database...</p>
            </div>
          ) : tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => {
                const isSubmitted = submittedTasks[task.id];
                return (
                  <div 
                    key={task.id} 
                    className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-5 sm:p-6 rounded-2xl transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center gap-1.5">
                          {task.category}
                        </span>
                        <div className="text-right">
                          <span className="text-emerald-400 font-black text-lg sm:text-xl font-mono flex items-center justify-end">
                            <DollarSign className="w-4 h-4" />
                            {task.reward.toFixed(2)} USD
                          </span>
                          <span className="text-[10px] text-emerald-500 font-semibold block">
                            ≈ ৳{(task.reward * 120).toFixed(0)} BDT
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-base leading-snug">{task.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">Employer: <strong className="text-slate-300">{task.employer}</strong></p>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-300 bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-xl line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {task.proofRequirements && (
                        <div className="text-xs text-purple-300 bg-purple-950/30 border border-purple-800/60 p-2.5 rounded-xl flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <strong className="text-purple-200 block text-[11px] font-semibold">Required Proof:</strong>
                            <span className="text-purple-300/90 line-clamp-2 text-[11px]">{task.proofRequirements}</span>
                          </div>
                        </div>
                      )}

                      {task.instructions && !task.description && (
                        <p className="text-xs text-slate-400 bg-slate-950/60 border border-slate-800 p-3 rounded-xl line-clamp-2">
                          {task.instructions}
                        </p>
                      )}
                      {task.targetUrl && (
                        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] text-slate-400 block">External Job Link:</span>
                            <span className="text-xs font-bold text-cyan-300 block truncate font-mono">
                              {task.targetUrl}
                            </span>
                          </div>
                          <a
                            href={task.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow transition cursor-pointer"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {task.spotsLeft} spots remaining
                      </span>

                      {isSubmitted ? (
                        <span className="px-3.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          Proof Submitted (Pending Review)
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleOpenTask(task)}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-emerald-950/50 cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Submit Proof
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white font-['Space_Grotesk']">No tasks available right now</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                There are currently no tasks available. When an administrator adds tasks from the Admin Panel, they will appear here in real-time.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MY SUBMISSIONS & EARNINGS TAB */}
      {activeTab === 'my-submissions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> My Task Submissions & Approvals
              </h2>
              <p className="text-xs text-slate-400">
                Track your submitted proofs. When approved by admin, funds are credited immediately to your wallet balance.
              </p>
            </div>
            <button
              onClick={loadMySubmissions}
              disabled={loadingSubmissions}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSubmissions ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Total Submissions</span>
              <span className="text-xl font-bold text-white font-mono">{mySubmissions.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-800/40">
              <span className="text-[11px] text-amber-400/90 block">Pending Review</span>
              <span className="text-xl font-bold text-amber-300 font-mono">
                {mySubmissions.filter((s) => s.status === 'pending_review' || s.status === 'in_review' || !s.status).length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-800/40">
              <span className="text-[11px] text-emerald-400/90 block">Approved & Credited</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {mySubmissions.filter((s) => s.status === 'approved').length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-emerald-400/90 block">Earned from Approvals</span>
              <span className="text-xl font-bold text-emerald-300 font-mono">
                $
                {mySubmissions
                  .filter((s) => s.status === 'approved')
                  .reduce((acc, curr) => acc + (curr.rewardAmount || curr.reward || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submissions List */}
          {mySubmissions.length > 0 ? (
            <div className="space-y-3">
              {mySubmissions.map((sub) => {
                const isApproved = sub.status === 'approved';
                const isRejected = sub.status === 'rejected';
                const isPending = !isApproved && !isRejected;

                return (
                  <div
                    key={sub.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isApproved
                        ? 'bg-slate-900/90 border-emerald-800/60'
                        : isRejected
                        ? 'bg-slate-900/90 border-rose-800/60'
                        : 'bg-slate-900/90 border-amber-800/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-semibold">
                            {sub.taskCategory || 'Microtask'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'Recently'}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                          {sub.taskTitle || 'Micro-Job Task'}
                        </h4>
                      </div>

                      {/* Status and Payout display */}
                      <div className="flex sm:flex-col sm:items-end justify-between items-center gap-1 shrink-0">
                        <span className="text-sm sm:text-base font-bold font-mono text-emerald-400">
                          +${(sub.rewardAmount || sub.reward || 0).toFixed(2)} USD
                        </span>
                        {isApproved && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Approved & Balance Credited
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-700 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                            In Admin Review
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-700 text-rose-300 text-[11px] font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-400" />
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Submitted details */}
                    <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {sub.transactionOrProfileId && (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Submitted ID / Username:</span>
                          <span className="font-mono font-bold text-amber-300">{sub.transactionOrProfileId}</span>
                        </div>
                      )}

                      {sub.textNotes && (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Proof Notes:</span>
                          <span className="text-slate-200">{sub.textNotes}</span>
                        </div>
                      )}

                      {sub.screenshotUrl && (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 md:col-span-2">
                          <img
                            src={sub.screenshotUrl}
                            alt="Submitted Screenshot"
                            className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0 cursor-pointer"
                            onClick={() => window.open(sub.screenshotUrl, '_blank')}
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400 block">Submitted Screenshot Proof</span>
                            <a
                              href={sub.screenshotUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:underline text-[11px] font-medium inline-flex items-center gap-1 mt-0.5"
                            >
                              <span>View Full Size</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      {sub.adminNotes && (
                        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-700 md:col-span-2 text-slate-300">
                          <span className="text-[10px] text-slate-400 block font-semibold">Admin Feedback:</span>
                          <span>{sub.adminNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl text-center space-y-3">
              <Clock className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No task submissions yet</p>
              <p className="text-xs text-slate-500">
                You haven't submitted any tasks yet. Browse Available Tasks, perform the instructions, and submit your proof to earn cash rewards!
              </p>
              <button
                onClick={() => setActiveTab('tasks')}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition"
              >
                Browse Available Tasks
              </button>
            </div>
          )}
        </div>
      )}

      {/* Services Tab Container */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Verified Marketing & Creative Services
              </h2>
              <p className="text-xs text-slate-400">
                Order verified freelance services with direct delivery or official Fiverr buyer protection
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
              Verified Providers
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(services.length > 0
              ? services
              : [
                  {
                    id: 'srv_photo_001',
                    userId: 'usr_superadmin_001',
                    title: 'Background Removal & Bulk Photo Editing',
                    slug: 'background-removal-bulk-photo-editing',
                    category: 'Graphics & Design' as const,
                    description:
                      'Professional e-commerce product background removal and high-volume photo editing. Get clean transparent PNG cutouts, 100% pure Amazon/eBay/Shopify compliant white backgrounds, and razor-sharp hand-drawn clipping paths for high-converting store listings.',
                    pricingTier: {
                      basicPrice: 5.0,
                      basicDeliveryDays: 1,
                      basicDescription:
                        '10 E-Commerce Products: Precise clipping path, pure white (#FFFFFF) or transparent PNG, shadow creation & web-ready export.',
                    },
                    tags: [
                      'Background Removal',
                      'Bulk Photo Editing',
                      'Transparent PNG',
                      'White Background',
                      'Clipping Path',
                      'E-Commerce Editing',
                    ],
                    features: [
                      'Transparent PNG (Alpha Cutout)',
                      'Pure White Background (#FFFFFF Amazon & Shopify Standard)',
                      'Hand-Drawn Precise Clipping Path',
                      'Bulk Photo Editing & High-Volume Processing',
                      'Natural, Drop & Reflection Shadow Creation',
                    ],
                    fiverrUrl: 'https://www.fiverr.com/mdmijan4',
                    rating: 5.0,
                    reviewsCount: 148,
                    sellerName: 'Mijanur Rahman (mdmijan4)',
                    sellerUsername: 'mdmijan4',
                    status: 'active' as const,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ]
            ).map((srv) => (
              <ServiceCard
                key={srv.id}
                service={srv}
                featured={srv.id === 'srv_photo_001' || srv.title.includes('Background Removal')}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'academy' && (
        <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 p-8 sm:p-10 rounded-2xl text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto shadow-lg">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Official Udemy Learning Partner</span>
            </span>
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mt-2">
              Nexvora Academy — Powered by Udemy
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore thousands of accredited courses in SEO, Freelancing, Digital Marketing, AI Engineering, and Full-Stack Web Development with verifiable completion certificates.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openUdemyAffiliate()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 transition cursor-pointer"
            >
              <span>Browse All Courses on Udemy</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {activeTab !== 'tasks' && activeTab !== 'services' && activeTab !== 'academy' && (
        <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-base font-semibold text-slate-300">No listings currently published in this category</p>
          <p className="text-xs text-slate-500">Verified freelance jobs will appear here when posted.</p>
        </div>
      )}

      {/* Render Task Proof Modal with Keyed State */}
      {selectedTask && (
        <TaskProofModal
          key={`task-modal-${selectedTask.id}`}
          task={selectedTask}
          user={user}
          apiFetch={apiFetch}
          refreshMe={refreshMe}
          onClose={handleCloseModal}
          onSuccess={handleTaskSuccess}
        />
      )}
    </div>
  );
}
