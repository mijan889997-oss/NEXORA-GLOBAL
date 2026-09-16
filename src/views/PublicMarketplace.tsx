import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Briefcase,
  CheckSquare,
  BookOpen,
  Package,
  Search,
  Filter,
  ArrowRight,
  Clock,
  DollarSign,
  User,
  ShieldCheck,
  Send,
  AlertCircle,
  FileQuestion,
  Flame,
  Upload,
  Image as ImageIcon,
  Camera,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { Service, Job, Task, Course, DigitalProduct } from '../types';
import { TaskCard, extractTaskTargetUrl } from '../components/TaskCard';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { ServiceCard } from '../components/ServiceCard';
import { DigitalProductsSection } from '../components/DigitalProductsSection';
import { FreelanceMarketplaceView } from '../components/FreelanceMarketplaceView';
import { openUdemyAffiliate, UDEMY_AFFILIATE_URL } from '../config/affiliateLinks';

interface PublicMarketplaceProps {
  initialTab?: 'services' | 'jobs' | 'tasks' | 'courses' | 'products';
  navigate: (path: string) => void;
}

export const PublicMarketplace: React.FC<PublicMarketplaceProps> = ({
  initialTab = 'services',
  navigate,
}) => {
  const { user, apiFetch } = useAuth();
  const [activeTab, setActiveTab] = useState<'services' | 'jobs' | 'tasks' | 'courses' | 'products'>(
    (initialTab as string) === 'surveys' || (initialTab as string) === 'offers' ? 'tasks' : (initialTab as any)
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Proposal modal for jobs
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('5');
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(null);
  const [proposalError, setProposalError] = useState<string | null>(null);

  // Task submit modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskNotes, setTaskNotes] = useState('');
  const [taskProofUrl, setTaskProofUrl] = useState('');
  const [taskTransactionOrProfileId, setTaskTransactionOrProfileId] = useState('');
  const [taskScreenshotUrl, setTaskScreenshotUrl] = useState('');
  const [taskScreenshotFileName, setTaskScreenshotFileName] = useState('');
  const [taskScreenshotFileSize, setTaskScreenshotFileSize] = useState('');
  const [taskIsProcessingImg, setTaskIsProcessingImg] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);
  const taskFileInputRef = React.useRef<HTMLInputElement | null>(null);

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

  const handleTaskFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setTaskIsProcessingImg(true);
      setTaskError(null);
      const dataUri = await processImageFile(file);
      setTaskScreenshotUrl(dataUri);
      setTaskScreenshotFileName(file.name);
      setTaskScreenshotFileSize(formatFileSize(file.size));
    } catch (err: any) {
      setTaskError(err.message || 'Error loading image / ছবি লোড করতে সমস্যা হয়েছে।');
    } finally {
      setTaskIsProcessingImg(false);
    }
  };

  const handleRemoveTaskScreenshot = () => {
    setTaskScreenshotUrl('');
    setTaskScreenshotFileName('');
    setTaskScreenshotFileSize('');
    if (taskFileInputRef.current) {
      taskFileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      const [sRes, jRes, tRes, cRes, pRes] = await Promise.all([
        fetch('/api/services').then((r) => r.json()),
        fetch('/api/jobs').then((r) => r.json()),
        fetch('/api/tasks').then((r) => r.json()),
        fetch('/api/courses').then((r) => r.json()),
        fetch('/api/products').then((r) => r.json()),
      ]);
      setServices(sRes.services || []);
      setJobs(jRes.jobs || []);
      
      // Filter out deleted and inactive tasks using persistent state & overrides
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

      const rawTasks = tRes.tasks || [];
      const visibleTasks = rawTasks.filter((t: any) => {
        if (!t || !t.id) return false;
        if (deletedIds.includes(t.id)) return false;
        const effStatus = statusOverrides[t.id] || t.status;
        return effStatus === 'active';
      });

      setTasks(visibleTasks);
      setCourses(cRes.courses || []);
      setProducts(pRes.products || []);
    } catch (err) {
      console.error('Failed to load marketplace records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaceData();

    const handleTasksUpdate = () => {
      loadMarketplaceData();
    };
    window.addEventListener('tasks_updated', handleTasksUpdate);
    window.addEventListener('storage', handleTasksUpdate);
    return () => {
      window.removeEventListener('tasks_updated', handleTasksUpdate);
      window.removeEventListener('storage', handleTasksUpdate);
    };
  }, []);

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setProposalError(null);
    setProposalSuccess(null);

    try {
      await apiFetch(`/api/jobs/${selectedJob.id}/proposals`, {
        method: 'POST',
        body: JSON.stringify({
          coverLetter,
          bidAmount: Number(bidAmount),
          estimatedDays: Number(estimatedDays),
        }),
      });
      setProposalSuccess('Proposal submitted successfully for client review.');
      setCoverLetter('');
      setBidAmount('');
      setTimeout(() => setSelectedJob(null), 1800);
    } catch (err: any) {
      setProposalError(err.message || 'Failed to submit proposal');
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setTaskError(null);
    setTaskSuccess(null);

    try {
      await apiFetch(`/api/tasks/${selectedTask.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          textNotes: taskNotes,
          proofUrl: taskProofUrl,
          screenshotUrl: taskScreenshotUrl,
          transactionOrProfileId: taskTransactionOrProfileId.trim(),
        }),
      });
      setTaskSuccess('Task submission received! It will be reviewed by admin for escrow balance approval.');
      setTaskNotes('');
      setTaskProofUrl('');
      setTaskTransactionOrProfileId('');
      setTaskScreenshotUrl('');
      setTimeout(() => setSelectedTask(null), 1800);
    } catch (err: any) {
      setTaskError(err.message || 'Failed to submit verification');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Navigation Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white font-['Space_Grotesk']">
              Nexvora Global Marketplace
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Browse legitimate marketing services, freelance jobs, verified microtasks, courses, and SOPs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={() => navigate('/dashboard/services')}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition-colors"
              >
                + Offer Service / Post Work
              </button>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'services'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Marketing Services ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'jobs'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4 text-indigo-400" />
            Freelance Marketplace (Kwork)
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'tasks'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Verified Paid Tasks ({tasks.length})
          </button>
          <button
            id="public-market-timewall-btn"
            onClick={() => navigate('/earn')}
            className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>TimeWall Micro-Tasks</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/30 text-amber-200">
              HOT
            </span>
          </button>
          <button
            id="cat-academy-courses-btn"
            onClick={() => {
              setActiveTab('courses');
              openUdemyAffiliate();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'courses'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Academy Courses ({courses.length})</span>
            <ExternalLink className="w-3 h-3 text-amber-300 ml-0.5" />
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'products'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            Digital Products ({products.length})
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading authentic database records...</div>
      ) : (
        <div>
          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Verified E-Commerce & Creative Services
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Order high-converting background removal, bulk photo editing, and marketing deliverables with buyer protection.
                  </p>
                </div>
                {user && (
                  <button
                    onClick={() => navigate('/dashboard/services')}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold self-start sm:self-auto cursor-pointer"
                  >
                    Post Service
                  </button>
                )}
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
                    navigate={navigate}
                    featured={srv.id === 'srv_photo_001' || srv.title.includes('Background Removal')}
                    onInternalOrder={() => {
                      if (!user) navigate('/login');
                      else navigate('/dashboard/orders');
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* JOBS TAB */}
          {activeTab === 'jobs' && (
            <FreelanceMarketplaceView
              onNavigate={navigate}
              onSelectLocalJob={(job) => setSelectedJob(job)}
              isLoggedIn={!!user}
            />
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>সকল মাইক্রোটাস্কের রিওয়ার্ড এসক্রো ফান্ডে গ্যারান্টিযুক্ত ও ভেরিফিকেশন সাপেক্ষে তাৎক্ষণিক ব্যালেন্সে যুক্ত হয়।</span>
                </div>
                <span className="font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800 self-start sm:self-auto">
                  🛡️ 100% Ledger Escrow Protected
                </span>
              </div>

              {tasks.length === 0 ? (
                <div className="p-16 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-sm space-y-3">
                  <CheckSquare className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="font-bold text-white text-base">No active tasks available right now.</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Check back soon or explore our survey offerwalls and freelancing marketplace services.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStartTask={(t) => {
                        if (!user) navigate('/login');
                        else setSelectedTask(t);
                      }}
                      isLoggedIn={!!user}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MY COURSES TAB */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              {/* Udemy Official Affiliate Program Showcase Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1.5 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Official Udemy Learning Partner (Impact Verified)</span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                    Master Technical Skills with Certified Udemy Courses
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Enroll in top-rated courses on Web Development, Digital Marketing, SEO, Copywriting, and Graphic Design with industry-recognized certificates.
                  </p>
                </div>
                <button
                  onClick={() => openUdemyAffiliate()}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-950/50 cursor-pointer shrink-0 transition-transform active:scale-95"
                >
                  <span>Explore All on Udemy</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-medium">
                          {course.category}
                        </span>
                        <span className="text-slate-400">{course.level}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">{course.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{course.description}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-white font-['Space_Grotesk']">
                        {course.price === 0 ? <span className="text-emerald-400">Free Access</span> : `$${course.price.toFixed(2)}`}
                      </span>
                      <button
                        onClick={() => openUdemyAffiliate()}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Enroll (Udemy)</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <DigitalProductsSection onNavigate={navigate} />
          )}
        </div>
      )}

      {/* JOB PROPOSAL MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Submit Proposal</h3>
                <p className="text-xs text-slate-400">{selectedJob.title}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {proposalError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {proposalError}
              </div>
            )}
            {proposalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
                {proposalSuccess}
              </div>
            )}

            <form onSubmit={handleProposalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Your Bid Amount ($ USD)</label>
                <input
                  type="number"
                  required
                  min="5"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Client budget: $${selectedJob.budget}`}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Delivery Time (Days)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Cover Letter & Approach</label>
                <textarea
                  rows={4}
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain your relevant marketing experience, methodology, and tools..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK SUBMIT MODAL */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSuccessSubmit={() => {
          loadMarketplaceData();
        }}
        isLoggedIn={!!user}
      />
    </div>
  );
};
