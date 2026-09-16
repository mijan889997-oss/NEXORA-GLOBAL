import React, { useEffect, useState } from 'react';
import {
  Globe,
  Briefcase,
  Layers,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Package,
  Award,
  Users,
  Lock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { Service, Task, Course } from '../types';
import { LivePayoutsSection } from '../components/LivePayoutsSection';
import { ServiceCard } from '../components/ServiceCard';
import { openUdemyAffiliate } from '../config/affiliateLinks';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [srvRes, tskRes, crsRes] = await Promise.all([
          fetch('/api/services').then((r) => r.json()),
          fetch('/api/tasks').then((r) => r.json()),
          fetch('/api/courses').then((r) => r.json()),
        ]);
        setServices(srvRes.services || []);
        setTasks(tskRes.tasks || []);
        setCourses(crsRes.courses || []);
      } catch (err) {
        console.error('Error fetching preview data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 lg:pb-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-cyan-400 mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Legitimate Digital Marketing & Online Work Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-['Space_Grotesk'] leading-[1.1] max-w-4xl mx-auto">
            NEXVORA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">GLOBAL</span>
          </h1>

          <p className="mt-4 text-xl sm:text-2xl font-semibold text-slate-300 tracking-wide font-['Space_Grotesk']">
            Learn • Work • Grow • Earn
          </p>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The authentic ecosystem for skilled freelancers, verified digital marketers, task contributors, and educators. Strictly backed by real transactional ledgers with zero synthetic numbers.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-get-started-btn"
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-base shadow-xl shadow-cyan-900/20 flex items-center justify-center gap-2 transition-all"
            >
              Join Nexvora Global
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              id="hero-explore-tasks-btn"
              onClick={() => navigate('/tasks')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base flex items-center justify-center gap-2 transition-all"
            >
              Browse Verified Tasks
            </button>
          </div>

          {/* Value Highlights */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-cyan-400 font-bold text-sm flex items-center gap-1.5 mb-1 font-['Space_Grotesk']">
                <BookOpen className="w-4 h-4" /> 1. Learn
              </div>
              <p className="text-xs text-slate-400">Master SEO, PPC, copywriting, and freelancing techniques.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-indigo-400 font-bold text-sm flex items-center gap-1.5 mb-1 font-['Space_Grotesk']">
                <Briefcase className="w-4 h-4" /> 2. Work
              </div>
              <p className="text-xs text-slate-400">Bid on client projects or fulfill verified microtasks.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-purple-400 font-bold text-sm flex items-center gap-1.5 mb-1 font-['Space_Grotesk']">
                <TrendingUp className="w-4 h-4" /> 3. Grow
              </div>
              <p className="text-xs text-slate-400">Scale marketing services and monetize digital SOP assets.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5 mb-1 font-['Space_Grotesk']">
                <Award className="w-4 h-4" /> 4. Earn
              </div>
              <p className="text-xs text-slate-400">Withdraw approved balances via certified payment methods.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Integrity & Anti-Fraud Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40 text-xs font-semibold uppercase tracking-wider mb-3">
              <Lock className="w-3.5 h-3.5" /> Platform Integrity Standards
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
              Engineered on Transparent Accounting & Real Ledger Verification
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Unlike fraudulent schemes, NEXVORA GLOBAL never creates artificial money or deceptive counters. Every single cent in a user&apos;s wallet originates from an approved milestone, a verified task deliverable, or a documented affiliate conversion.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">Immutable Ledger Engine</h3>
              <p className="text-xs text-slate-400">
                Every balance change creates an unalterable audit record with balance-after snapshots. Direct balance manipulation is blocked.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">No Guaranteed Returns</h3>
              <p className="text-xs text-slate-400">
                Earnings depend purely on user capability, demand, and completed milestones. Zero speculative trading or fake ROI promises.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">Multi-Role Governance</h3>
              <p className="text-xs text-slate-400">
                Separation of powers between Super Admin, Finance Admin, Support, and Content Moderators protects platform stability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Payouts & Proof of Settlement */}
      <LivePayoutsSection navigate={navigate} />

      {/* Core Platform Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
              Featured Opportunities & Academy
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Active verified tasks, courses, and digital marketing services currently available.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View All Tasks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
            No live microtasks currently open. Client campaigns and verified audit tasks will appear here as they are published.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks.slice(0, 2).map((task) => (
              <div
                key={task.id}
                className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {task.category}
                    </span>
                    <span className="text-sm font-bold text-emerald-400 font-['Space_Grotesk']">
                      ${task.rewardAmount.toFixed(2)} Reward
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{task.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{task.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Slots Remaining: <strong className="text-white">{task.slotsRemaining}</strong> / {task.totalSlots}
                  </span>
                  <button
                    onClick={() => navigate('/tasks')}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
                  >
                    View Requirements
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Featured Marketplace Services Section */}
        <div className="pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Featured Creative & E-Commerce Services
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Vetted high-volume photo editing, transparent background cutouts & professional e-commerce graphics.
              </p>
            </div>
            <button
              onClick={() => navigate('/services')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              Explore All Services <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(services.length > 0
              ? services.filter((s) => s.id === 'srv_photo_001' || s.title.includes('Background Removal'))
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
                featured={true}
              />
            ))}
          </div>
        </div>

        {/* Courses Section */}
        <div className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 mb-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Udemy Affiliate Certified</span>
              </div>
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                Nexvora Academy: Professional Skill Tracks
              </h3>
            </div>
            <button
              onClick={() => openUdemyAffiliate()}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All on Udemy</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
              No academy courses published yet. Approved curricula and certifications will be listed here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-medium">
                        {course.category}
                      </span>
                      <span className="text-slate-400">{course.level}</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-2">{course.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{course.description}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-['Space_Grotesk']">
                      {course.price === 0 ? (
                        <span className="text-emerald-400">Free Access</span>
                      ) : (
                        `$${course.price.toFixed(2)}`
                      )}
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
          )}
        </div>
      </section>

      {/* Mandatory Statutory Disclaimer Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
            Mandatory Earnings Disclaimer & Performance Notice
          </h3>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto italic leading-relaxed">
            &ldquo;Income is not guaranteed. Earnings depend on skills, effort, demand, completed work, approved transactions and applicable program terms.&rdquo;
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/earnings-disclaimer')}
              className="text-xs font-semibold text-amber-400 hover:underline"
            >
              Read Platform Regulatory Policies & Compliance Terms →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
