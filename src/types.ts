/**
 * NEXVORA GLOBAL - Platform Domain Types & Schemas
 * Core models for Users, Marketplace, Tasks, Wallets, Admin & System
 */

export type UserRole =
  | 'SUPER ADMIN'
  | 'ADMIN'
  | 'FINANCE ADMIN'
  | 'MODERATOR'
  | 'SUPPORT ADMIN'
  | 'CONTENT ADMIN'
  | 'USER';

export type UserStatus = 'active' | 'suspended' | 'pending_verification' | 'banned';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  username: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  referralCode: string;
  referredBy?: string; // referralCode or userId
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  bio?: string;
  avatarUrl?: string;
  country?: string;
  city?: string;
  skills: string[];
  headline?: string;
  languages: string[];
  website?: string;
  github?: string;
  linkedin?: string;
  kycStatus: 'unsubmitted' | 'pending' | 'verified' | 'rejected';
  kycDocumentType?: string;
  kycDocumentNumber?: string;
  kycSubmittedAt?: string;
  kycNotes?: string;
  updatedAt: string;
}

export interface RolePermission {
  role: UserRole;
  description: string;
  permissions: string[];
}

export interface Service {
  id: string;
  userId: string; // Seller
  title: string;
  slug: string;
  category: 'SEO & SEM' | 'Social Media Marketing' | 'Content Creation' | 'Email Marketing' | 'Web Design' | 'Performance Ads' | 'Video & Animation' | 'Graphics & Design' | 'Photo Editing & Design';
  description: string;
  pricingTier: {
    basicPrice: number;
    basicDeliveryDays: number;
    basicDescription: string;
  };
  tags: string[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  createdAt: string;
  updatedAt: string;
  fiverrUrl?: string;
  features?: string[];
  rating?: number;
  reviewsCount?: number;
  sellerName?: string;
  sellerUsername?: string;
  sellerAvatar?: string;
  imageUrl?: string;
  sampleImages?: string[];
}

export interface Job {
  id: string;
  userId: string; // Client / Employer
  title: string;
  description: string;
  category: string;
  budgetType: 'fixed' | 'hourly';
  budget: number;
  duration: string;
  skillsRequired: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  proposalsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  jobId: string;
  freelancerId: string;
  coverLetter: string;
  bidAmount: number;
  estimatedDays: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  itemType: 'service' | 'job' | 'product';
  itemId: string;
  title: string;
  amount: number;
  feeAmount: number;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskCategory =
  | 'PTC (Website Visit)'
  | 'YouTube Video'
  | 'Social Media'
  | 'App Testing'
  | 'Data Verification'
  | 'Survey & Research'
  | 'Digital Marketing'
  | 'Micro Task'
  | string;

export type TaskVerificationType =
  | 'instant_timer'
  | 'youtube_watch'
  | 'screenshot_and_text'
  | 'link_submission'
  | 'code_confirmation';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  description: string;
  instructions: string[];
  rewardAmount: number; // In USD (e.g. 0.025)
  rewardCoins?: number; // In Coins (e.g. 25 Coins; 1,000 Coins = $1.00 USD)
  timerSeconds?: number; // E.g. 15, 30, 45, 60
  youtubeVideoId?: string; // YouTube video ID (e.g. dQw4w9WgXcQ)
  targetUrl?: string;
  totalSlots: number;
  slotsRemaining: number;
  timeLimitMinutes: number;
  verificationType: TaskVerificationType;
  requiresProof?: boolean;
  proofRequirements?: string;
  dailyLimit?: number;
  status: 'active' | 'inactive' | 'paused' | 'completed' | 'expired';
  userCompleted?: boolean;
  completedAt?: string;
  cooldownUntil?: string;
  cooldownRemainingMs?: number;
  createdById: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DailyStreakDay {
  day: number;
  coins: number;
  usd: number;
  isMilestone?: boolean;
  bonusLabel?: string;
}

export interface DailyStreakStatus {
  currentStreak: number; // 0 to 7
  lastClaimDate: string | null; // YYYY-MM-DD
  canClaimToday: boolean;
  nextRewardCoins: number;
  nextRewardUsd: number;
  streakDays: DailyStreakDay[];
  totalClaimedCoins: number;
  totalClaimedUsd: number;
  nextClaimCountdownSeconds?: number;
}

export interface TaskCompletionRecord {
  id: string;
  taskId: string;
  taskTitle?: string;
  taskCategory?: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  taskType: 'ptc' | 'youtube' | 'social' | 'microtask' | 'daily_claim';
  rewardCoins: number;
  rewardUsd: number;
  timerSeconds?: number;
  completedAt: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  taskTitle?: string;
  taskCategory?: string;
  rewardAmount?: number;
  rewardCoins?: number;
  userId: string;
  userName?: string;
  userEmail?: string;
  proofData: {
    textNotes?: string;
    proofUrl?: string;
    screenshotUrl?: string;
    transactionOrProfileId?: string;
  };
  screenshotUrl?: string;
  proofUrl?: string;
  textNotes?: string;
  transactionOrProfileId?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  instructorId: string;
  instructorName: string;
  category: 'SEO Mastery' | 'Affiliate Marketing' | 'Freelancing Foundations' | 'Paid Ads & PPC' | 'Copywriting & Content';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  price: number; // 0 for free
  lessonsCount: number;
  isPublished: boolean;
  createdAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  content: string;
  videoUrl?: string;
  durationMinutes: number;
  isFreePreview: boolean;
}

export interface DigitalProduct {
  id: string;
  sellerId?: string;
  creatorId?: string;
  title: string;
  slug?: string;
  category: 'Marketing Templates' | 'E-Books & Guides' | 'Design Assets' | 'Software Tools' | 'Social Media Kits';
  description: string;
  price: number;
  downloadUrl?: string;
  fileSizeMb?: number;
  salesCount?: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductOrder {
  id: string;
  productId: string;
  buyerId: string;
  amount: number;
  feeAmount?: number;
  paymentMethod?: string;
  downloadUrl?: string;
  status?: 'completed' | 'refunded';
  createdAt: string;
}

export interface AffiliateProgram {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  description?: string;
  commissionType?: 'percentage' | 'fixed';
  commissionRate: string | number; // e.g. 15% or $10
  cookieDurationDays: number;
  isActive: boolean;
  targetUrl?: string;
  landingPageUrl?: string;
  terms?: string;
  termsUrl?: string;
}

export interface AffiliateClick {
  id: string;
  programId: string;
  affiliateUserId: string;
  ipHash: string;
  referer?: string;
  createdAt: string;
}

export interface AffiliateConversion {
  id: string;
  programId: string;
  affiliateUserId: string;
  orderId?: string;
  saleAmount: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  status: 'registered' | 'qualified_work_completed' | 'rewarded';
  rewardAmount: number;
  rewardPaid: boolean;
  createdAt: string;
}

export interface EnrichedReferralItem {
  id: string;
  name: string;
  username?: string;
  date: string;
  status: 'registered' | 'qualified_work_completed' | 'rewarded';
  rewardAmount: number;
  rewardPaid: boolean;
}

export interface MyReferralData {
  referralCode: string;
  totalReferrals: number;
  qualifiedCount: number;
  rewardsEarned: number;
  referrals: EnrichedReferralItem[];
  appUrl?: string;
  referralLink?: string;
}

export interface Wallet {
  id: string;
  userId: string;
  availableBalance: number; // Real funds available to withdraw
  pendingBalance: number;   // Funds in escrow / holding period
  totalEarned: number;      // Lifetime approved earnings
  totalWithdrawn: number;   // Lifetime confirmed withdrawals
  currency: string;
  updatedAt: string;
}

export type TransactionType =
  | 'Earning'
  | 'Commission'
  | 'Referral Reward'
  | 'Withdrawal'
  | 'Refund'
  | 'Fee'
  | 'Order Payment'
  | 'Adjustment';

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  amount: number; // positive for credit, negative for debit
  balanceAfter: number;
  referenceType?:
    | 'order'
    | 'task_submission'
    | 'withdrawal'
    | 'referral'
    | 'admin_adjustment'
    | 'cpx_survey'
    | 'wannads_offer'
    | 'monlix_task'
    | 'adgate_offer'
    | 'cpagrip_lead'
    | 'cpalead_offer'
    | 'timewall_task'
    | 'sponsored_ad'
    | 'daily_bonus'
    | 'native_task';
  referenceId?: string;
  description: string;
  createdAt: string;
}

export type OfferwallNetworkId = 'cpx' | 'wannads' | 'monlix' | 'adgate' | 'cpagrip' | 'cpalead' | 'timewall';

export interface OfferwallNetwork {
  id: OfferwallNetworkId;
  name: string;
  category: string;
  tagline: string;
  description: string;
  badge: string;
  color: string;
  accentColor: string;
  urlGenerator: (userId: string) => string;
  postbackEndpoint: string;
}

export interface CpagripOffer {
  offer_id: string;
  title: string;
  description: string;
  payout: string;
  netepc?: string;
  type?: string;
  accepted_countries?: string;
  category?: string;
  offerlink: string;
  offerphoto?: string;
}

export interface CpagripFeedResponse {
  success: boolean;
  userId: string;
  offersCount: number;
  offers: CpagripOffer[];
  detectedCountry?: string;
  feedUrl?: string;
  credentials?: {
    userId: string;
    pubkey: string;
  };
  error?: string;
}

export interface CpxConfigResponse {
  appId: string;
  isConfigured: boolean;
  extUserId: string;
  email: string;
  username: string;
  postbackEndpoint: string;
  surveyWallUrl: string;
}

export type WithdrawalStatus =
  | 'Pending'
  | 'Under Review'
  | 'Approved'
  | 'Processing'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export type PaymentMethodType =
  | 'bKash Personal'
  | 'Nagad Personal'
  | 'Rocket Personal'
  | 'USDT / Binance Pay'
  | 'bKash'
  | 'Nagad'
  | 'Rocket'
  | 'Bank Transfer'
  | 'PayPal'
  | 'Payoneer'
  | 'USDT/Crypto';

export interface Withdrawal {
  id: string;
  withdrawalNumber: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  accountIdentifier?: string;
  walletId: string;
  amount: number;
  fee: number;
  netAmount: number;
  paymentMethod: PaymentMethodType;
  accountDetails: {
    accountNumber?: string;
    accountHolderName?: string;
    bankName?: string;
    swiftCode?: string;
    branch?: string;
    emailOrWalletAddress?: string;
    cryptoNetwork?: string;
  };
  status: WithdrawalStatus;
  notes?: string;
  adminFeedback?: string;
  paymentConfirmationRef?: string;
  processedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentGatewayConfig {
  id: PaymentMethodType;
  name: string;
  isConfigured: boolean;
  statusMessage: string;
  minWithdrawal: number;
  maxWithdrawal: number;
  feePercentage: number;
  processingTime: string;
  supportedCurrencies: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'order' | 'task' | 'wallet' | 'withdrawal' | 'security' | 'course';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  itemType: 'service' | 'freelancer' | 'product';
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  ticketNumber: string;
  orderId?: string;
  raisedById: string;
  againstUserId?: string;
  subject: string;
  description: string;
  category: 'order_issue' | 'payment' | 'account' | 'task_submission' | 'other';
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolutionNotes?: string;
  assignedAdminId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  actorEmail?: string;
  action: string;
  targetModel: string;
  targetId?: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export type SystemLog = AuditLog;

export interface PlatformStats {
  totalRegisteredUsers: number;
  totalDisbursedAmount: number;
  pendingWithdrawalsAmount: number;
  totalRealFeesEarned: number;
  activeServicesCount: number;
  openJobsCount: number;
  approvedTasksCount: number;
}

export interface SystemSettings {
  id: string;
  platformName: string;
  tagline: string;
  supportEmail: string;
  platformFeePercent: number;
  minWithdrawalUsd: number;
  requireKycForWithdrawal: boolean;
  maintenanceMode: boolean;
  earningsDisclaimer: string;
  allowRegistration: boolean;
  gatewayStatus: Partial<Record<PaymentMethodType, boolean>>;
  videoTaskLimit?: number; // Daily Video Limit (default: 10)
  videoTaskCooldown?: number; // Cooldown Timer in seconds (default: 30)
  videoTaskRewardCoins?: number; // Reward Coins per video (default: 5)
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    username: string;
    role: UserRole;
    status: UserStatus;
    referralCode: string;
  };
  profile: Profile;
}
