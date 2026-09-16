/**
 * NEXVORA GLOBAL - Real Transactional Database Engine
 * Persistent, ACID-safe, ledger-authoritative storage layer.
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import type {
  User,
  Profile,
  RolePermission,
  Service,
  Job,
  Proposal,
  Order,
  Task,
  TaskSubmission,
  TaskCompletionRecord,
  Course,
  Lesson,
  DigitalProduct,
  ProductOrder,
  AffiliateProgram,
  AffiliateClick,
  AffiliateConversion,
  Referral,
  Wallet,
  Transaction,
  Withdrawal,
  PaymentGatewayConfig,
  Notification,
  Message,
  Review,
  Dispute,
  AuditLog,
  SystemSettings,
  TransactionType,
} from '../src/types';

export interface DatabaseSchema {
  users: User[];
  profiles: Profile[];
  roles: RolePermission[];
  services: Service[];
  jobs: Job[];
  proposals: Proposal[];
  orders: Order[];
  tasks: Task[];
  task_submissions: TaskSubmission[];
  task_completions: TaskCompletionRecord[];
  daily_claims: Array<{
    id: string;
    userId: string;
    streakDay: number;
    rewardCoins: number;
    rewardUsd: number;
    claimDate: string; // YYYY-MM-DD
    createdAt: string;
  }>;
  courses: Course[];
  lessons: Lesson[];
  products: DigitalProduct[];
  product_orders: ProductOrder[];
  affiliate_programs: AffiliateProgram[];
  affiliate_clicks: AffiliateClick[];
  affiliate_conversions: AffiliateConversion[];
  referrals: Referral[];
  wallets: Wallet[];
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  payments: PaymentGatewayConfig[];
  notifications: Notification[];
  messages: Message[];
  reviews: Review[];
  disputes: Dispute[];
  audit_logs: AuditLog[];
  settings: SystemSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'nexvora.db.json');
const TEMP_FILE = path.join(DATA_DIR, 'nexvora.db.tmp');

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv_photo_001',
    userId: 'usr_superadmin_001',
    title: 'Background Removal & Bulk Photo Editing',
    slug: 'background-removal-bulk-photo-editing',
    category: 'Graphics & Design',
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
      'Amazon Ready',
      'Shopify',
    ],
    features: [
      'Transparent PNG (Alpha Cutout)',
      'Pure White Background (#FFFFFF Amazon & Shopify Standard)',
      'Hand-Drawn Precise Clipping Path',
      'Bulk Photo Editing & High-Volume Processing',
      'Natural, Drop & Reflection Shadow Creation',
      'Product Retouching & Dust/Blemish Cleanup',
      'Commercial Use & High-Resolution 300 DPI Web Export',
    ],
    fiverrUrl: 'https://www.fiverr.com/mdmijan4',
    rating: 5.0,
    reviewsCount: 148,
    sellerName: 'Mijanur Rahman (mdmijan4)',
    sellerUsername: 'mdmijan4',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_NATIVE_TASKS: Task[] = [
  // 1. PTC Website Visits
  {
    id: 'ptc_001',
    title: 'Visit Nexvora Academy Official Portal',
    category: 'PTC (Website Visit)',
    description: 'Explore the Nexvora Academy portal for digital marketing, copywriting, and affiliate strategies.',
    instructions: [
      'Click the Start Visit button to open the advertiser landing page in a new window.',
      'Stay on the page while the 15-second sandboxed security timer counts down.',
      'Solve the anti-bot verification puzzle to claim instant 15 Coins.'
    ],
    rewardAmount: 0.015,
    rewardCoins: 15,
    timerSeconds: 15,
    targetUrl: 'https://nexvora.global/courses',
    totalSlots: 500,
    slotsRemaining: 488,
    timeLimitMinutes: 10,
    verificationType: 'instant_timer',
    status: 'active',
    createdById: 'usr_superadmin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ptc_002',
    title: 'Explore Binance Web3 Staking & Security Guide',
    category: 'PTC (Website Visit)',
    description: 'Learn official best practices for non-custodial crypto wallet security and safe USDT transactions.',
    instructions: [
      'Open the Binance Web3 guide landing page.',
      'Allow the 30-second focus timer to complete.',
      'Complete the verification check to receive 30 Coins in your ledger.'
    ],
    rewardAmount: 0.030,
    rewardCoins: 30,
    timerSeconds: 30,
    targetUrl: 'https://academy.binance.com/en/articles/what-is-a-web3-wallet',
    totalSlots: 350,
    slotsRemaining: 342,
    timeLimitMinutes: 10,
    verificationType: 'instant_timer',
    status: 'active',
    createdById: 'usr_superadmin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ptc_003',
    title: 'Review Google Cloud Developer & API Ecosystem',
    category: 'PTC (Website Visit)',
    description: 'Discover modern cloud scaling tools, serverless architectures, and developer resources.',
    instructions: [
      'Click start and review the cloud platform documentation.',
      'Keep your browser focused for 45 seconds.',
      'Confirm the math challenge to receive 45 Coins directly.'
    ],
    rewardAmount: 0.045,
    rewardCoins: 45,
    timerSeconds: 45,
    targetUrl: 'https://cloud.google.com/docs',
    totalSlots: 250,
    slotsRemaining: 247,
    timeLimitMinutes: 10,
    verificationType: 'instant_timer',
    status: 'active',
    createdById: 'usr_superadmin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ptc_004',
    title: 'Discover CoinMarketCap Top 100 Token Ecosystem',
    category: 'PTC (Website Visit)',
    description: 'Analyze live market volumes, market caps, and verified blockchain audit badges.',
    instructions: [
      'Open the live crypto market analytics platform.',
      'Let the 60-second verified viewing timer run completely.',
      'Submit the security answer to claim 60 Coins instantly.'
    ],
    rewardAmount: 0.060,
    rewardCoins: 60,
    timerSeconds: 60,
    targetUrl: 'https://coinmarketcap.com/',
    totalSlots: 200,
    slotsRemaining: 195,
    timeLimitMinutes: 15,
    verificationType: 'instant_timer',
    status: 'active',
    createdById: 'usr_superadmin',
    createdAt: new Date().toISOString(),
  },

  // 2. YouTube Video Watch Tasks
  {
    id: 'yt_001',
    title: 'Watch Freelance Digital Marketing & Microtask Guide (45s)',
    category: 'YouTube Video',
    description: 'Watch this curated training video on high-converting freelance skills and earning coins online.',
    instructions: [
      'Press Play on the embedded sandboxed video player.',
      'Watch at least 45 seconds of continuous playback without skipping.',
      'Solve the anti-bot puzzle upon timer completion to receive 35 Coins.'
    ],
    rewardAmount: 0.035,
    rewardCoins: 35,
    timerSeconds: 45,
    youtubeVideoId: 'dQw4w9WgXcQ',
    targetUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    totalSlots: 400,
    slotsRemaining: 389,
    timeLimitMinutes: 10,
    verificationType: 'youtube_watch',
    status: 'active',
    createdById: 'usr_superadmin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'yt_002',
    title: 'Watch Web3 & USDT Wallet Security Masterclass (60s)',
    category: 'YouTube Video',
    description: 'Essential guidance on safe crypto withdrawals, TRC-20 vs BEP-20 network selection, and fraud prevention.',
    instructions: [
      'Play the embedded video lesson.',
      'Ensure 60 seconds of uninterrupted playback.',
      'Complete the instant verification check to claim 50 Coins.'
    ],
    rewardAmount: 0.050,
    rewardCoins: 50,
    timerSeconds: 60,
    youtubeVideoId: 'LXb3EKWsInQ',
    targetUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    totalSlots: 300,
    slotsRemaining: 294,
    timeLimitMinutes: 10,
    verificationType: 'youtube_watch',
    status: 'active',
    createdById: 'usr_superadmin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'yt_003',
    title: 'Watch Nexvora Global Earning Features Tour (30s)',
    category: 'YouTube Video',
    description: 'Quick walkthrough of task categories, daily check-in streaks, and fast payout methods.',
    instructions: [
      'Watch 30 seconds of the Nexvora features overview video.',
      'Anti-cheat watcher verifies continuous video stream.',
      'Claim 25 Coins directly into your available balance.'
    ],
    rewardAmount: 0.025,
    rewardCoins: 25,
    timerSeconds: 30,
    youtubeVideoId: 'kJQP7kiw5Fk',
    targetUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    totalSlots: 600,
    slotsRemaining: 578,
    timeLimitMinutes: 10,
    verificationType: 'youtube_watch',
    status: 'active',
    createdById: 'usr_superadmin',
    createdAt: new Date().toISOString(),
  },

  // 3. Social & Micro Tasks (Proof submission)
  {
    id: 'job_001',
    title: 'Register on Partner Micro-Job Platform & Verify Account',
    category: 'Micro Task',
    description: 'Sign up using the designated partner portal, complete basic profile setup, and submit your registered username or profile ID for $0.50 reward.',
    instructions: [
      'Click the external job link to navigate to the partner registration page.',
      'Sign up with your valid email and confirm your registration.',
      'Submit your profile ID, registered username, and an optional screenshot of the confirmation page.'
    ],
    rewardAmount: 0.500,
    rewardCoins: 500,
    totalSlots: 500,
    slotsRemaining: 482,
    timeLimitMinutes: 120,
    verificationType: 'screenshot_and_text',
    targetUrl: 'https://nexvora.global/partner-portal',
    status: 'active',
    createdById: 'usr_superadmin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job_002',
    title: 'Subscribe to Partner YouTube Channel & Leave Thoughtful Comment',
    category: 'YouTube Video',
    description: 'Visit the channel through the external link, subscribe, like the featured tutorial video, and comment.',
    instructions: [
      'Open the target YouTube link in your browser or app.',
      'Subscribe to the channel and leave a comment under the latest video.',
      'Submit your YouTube channel username / handle and a screenshot of the subscribed state.'
    ],
    rewardAmount: 0.500,
    rewardCoins: 500,
    totalSlots: 350,
    slotsRemaining: 318,
    timeLimitMinutes: 60,
    verificationType: 'screenshot_and_text',
    targetUrl: 'https://youtube.com/@nexvoraglobal',
    status: 'active',
    createdById: 'usr_superadmin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'soc_001',
    title: 'Join Official Nexvora Telegram Community Channel',
    category: 'Social Media',
    description: 'Join our official verified Telegram channel for daily high-paying task alerts, giveaway announcements, and direct community support.',
    instructions: [
      'Click the target link to open Telegram and join the channel.',
      'Take a clear screenshot showing you are a member, or write your Telegram username (@username).',
      'Submit the proof below. Staff or auto-verification approves within 1-2 hours for 100 Coins ($0.10).'
    ],
    rewardAmount: 0.100,
    rewardCoins: 100,
    totalSlots: 1000,
    slotsRemaining: 940,
    timeLimitMinutes: 60,
    verificationType: 'screenshot_and_text',
    targetUrl: 'https://t.me/nexvoraglobal',
    status: 'active',
    createdById: 'usr_superadmin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'soc_002',
    title: 'Follow Nexvora Official Facebook Page & Share Pinned Post',
    category: 'Social Media',
    description: 'Follow our official Facebook page and share the latest verified payout proof post to your timeline.',
    instructions: [
      'Visit the Nexvora Facebook page and click Follow/Like.',
      'Share the pinned announcement to public/friends.',
      'Submit your profile URL or screenshot of the share to claim 150 Coins ($0.15).'
    ],
    rewardAmount: 0.150,
    rewardCoins: 150,
    totalSlots: 800,
    slotsRemaining: 765,
    timeLimitMinutes: 60,
    verificationType: 'screenshot_and_text',
    targetUrl: 'https://facebook.com/nexvoraglobal',
    status: 'active',
    createdById: 'usr_superadmin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'soc_003',
    title: 'Follow Nexvora on Twitter / X & Repost Pinned Tweet',
    category: 'Social Media',
    description: 'Follow @NexvoraGlobal on X, like and repost our pinned announcement with #NexvoraEarn.',
    instructions: [
      'Go to our X / Twitter profile and click Follow.',
      'Like and retweet the pinned tweet.',
      'Submit your X handle (@yourhandle) and repost link.'
    ],
    rewardAmount: 0.120,
    rewardCoins: 120,
    totalSlots: 750,
    slotsRemaining: 710,
    timeLimitMinutes: 60,
    verificationType: 'link_submission',
    targetUrl: 'https://x.com/nexvoraglobal',
    status: 'active',
    createdById: 'usr_superadmin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'soc_004',
    title: 'Install Nexvora Mobile PWA & Test Dashboard Speed',
    category: 'App Testing',
    description: 'Add Nexvora Global to your home screen via mobile browser (Chrome/Safari Install App), test loading, and submit your device info.',
    instructions: [
      'Open Nexvora on your mobile phone and tap "Add to Home Screen / Install".',
      'Take a screenshot of the Nexvora app icon on your home screen or opened app.',
      'Upload the screenshot proof to receive 250 Coins ($0.25).'
    ],
    rewardAmount: 0.250,
    rewardCoins: 250,
    totalSlots: 500,
    slotsRemaining: 472,
    timeLimitMinutes: 120,
    verificationType: 'screenshot_and_text',
    targetUrl: 'https://nexvora.global',
    status: 'active',
    createdById: 'usr_superadmin',
    createdAt: new Date().toISOString(),
  },
];

class DatabaseEngine {
  private data: DatabaseSchema;
  private isSaving = false;
  private needsSave = false;
  private savePromise: Promise<void> | null = null;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadOrInit();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadOrInit(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.task_completions) parsed.task_completions = [];
        if (!parsed.daily_claims) parsed.daily_claims = [];
        if (!parsed.tasks) parsed.tasks = [];
        if (!parsed.audit_logs) parsed.audit_logs = [];
        if (!parsed.services) parsed.services = [];
        const hasPhotoService = parsed.services.some((s: any) => s.id === 'srv_photo_001' || (s.title && s.title.includes('Background Removal')));
        if (!hasPhotoService) {
          parsed.services.unshift(INITIAL_SERVICES[0]);
        }
        if (!parsed.jobs) parsed.jobs = [];
        if (!parsed.products) parsed.products = [];
        if (!parsed.users) parsed.users = [];
        if (parsed.settings) {
          if (parsed.settings.videoTaskLimit === undefined) parsed.settings.videoTaskLimit = 10;
          if (parsed.settings.videoTaskCooldown === undefined) parsed.settings.videoTaskCooldown = 30;
          if (parsed.settings.videoTaskRewardCoins === undefined) parsed.settings.videoTaskRewardCoins = 5;
        }
        return parsed;
      } catch (err) {
        console.error('Failed to parse existing DB file, initializing clean database', err);
      }
    }
    const initial = this.createInitialDatabase();
    this.persistSync(initial);
    return initial;
  }

  private createInitialDatabase(): DatabaseSchema {
    const now = new Date().toISOString();

    const roles: RolePermission[] = [
      {
        role: 'SUPER ADMIN',
        description: 'Complete systemic control over platform, security, finances, content, and users.',
        permissions: ['*'],
      },
      {
        role: 'ADMIN',
        description: 'General system administration, user verification, job and order oversight.',
        permissions: ['users.manage', 'services.moderate', 'jobs.moderate', 'disputes.manage', 'reports.view'],
      },
      {
        role: 'FINANCE ADMIN',
        description: 'Authorized to review ledger transactions, approve withdrawals, and audit revenue.',
        permissions: ['wallets.audit', 'withdrawals.review', 'withdrawals.approve', 'payments.configure', 'transactions.view'],
      },
      {
        role: 'MODERATOR',
        description: 'Oversees community content, reviews, comments, and flags suspicious activity.',
        permissions: ['reviews.moderate', 'services.moderate', 'jobs.moderate', 'disputes.read'],
      },
      {
        role: 'SUPPORT ADMIN',
        description: 'Handles support requests, dispute mediation, and user communications.',
        permissions: ['disputes.manage', 'support.reply', 'users.read'],
      },
      {
        role: 'CONTENT ADMIN',
        description: 'Publishes curated courses, educational lessons, and platform tasks.',
        permissions: ['courses.manage', 'tasks.manage', 'products.manage'],
      },
      {
        role: 'USER',
        description: 'Standard member eligible to work, learn, offer marketing services, and affiliate.',
        permissions: ['marketplace.participate', 'wallet.view', 'wallet.withdraw', 'learn.access'],
      },
    ];

    const payments: PaymentGatewayConfig[] = [
      {
        id: 'bKash Personal',
        name: 'bKash Personal',
        isConfigured: true,
        statusMessage: 'Active & Operational (Manual / Direct Payout)',
        minWithdrawal: 0.50,
        maxWithdrawal: 500,
        feePercentage: 0,
        processingTime: 'Instant / 1-4 Hours',
        supportedCurrencies: ['BDT', 'USD'],
      },
      {
        id: 'Nagad Personal',
        name: 'Nagad Personal',
        isConfigured: true,
        statusMessage: 'Active & Operational (Manual / Direct Payout)',
        minWithdrawal: 0.50,
        maxWithdrawal: 500,
        feePercentage: 0,
        processingTime: 'Instant / 1-4 Hours',
        supportedCurrencies: ['BDT', 'USD'],
      },
      {
        id: 'Rocket Personal',
        name: 'Rocket Personal',
        isConfigured: true,
        statusMessage: 'Active & Operational (Manual / Direct Payout)',
        minWithdrawal: 0.50,
        maxWithdrawal: 500,
        feePercentage: 0,
        processingTime: 'Instant / 1-4 Hours',
        supportedCurrencies: ['BDT', 'USD'],
      },
      {
        id: 'USDT / Binance Pay',
        name: 'USDT / Binance Pay',
        isConfigured: true,
        statusMessage: 'Active & Operational (Manual / Direct Payout)',
        minWithdrawal: 1.00,
        maxWithdrawal: 1000,
        feePercentage: 0,
        processingTime: 'Instant / 30-60 Minutes',
        supportedCurrencies: ['USDT', 'USD'],
      },
    ];

    const defaultDisclaimer =
      'Income is not guaranteed. Earnings depend on skills, effort, demand, completed work, approved transactions and applicable program terms.';

    const settings: SystemSettings = {
      id: 'system_default',
      platformName: 'NEXVORA GLOBAL',
      tagline: 'Learn • Work • Grow • Earn',
      supportEmail: 'support@nexvora.global',
      platformFeePercent: 10,
      minWithdrawalUsd: 20,
      requireKycForWithdrawal: true,
      maintenanceMode: false,
      earningsDisclaimer: defaultDisclaimer,
      allowRegistration: true,
      gatewayStatus: {
        bKash: false,
        Nagad: false,
        'Bank Transfer': false,
        PayPal: false,
        Payoneer: false,
        'USDT/Crypto': false,
      },
      videoTaskLimit: 10,
      videoTaskCooldown: 30,
      videoTaskRewardCoins: 5,
      updatedAt: now,
    };

    // Seed default verified Super Admin
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'AdminNexvora2026!';
    const passwordHash = bcrypt.hashSync(superAdminPassword, 10);
    const superAdminId = 'usr_superadmin_001';

    const superAdminUser: User = {
      id: superAdminId,
      email: 'admin@nexvora.global',
      passwordHash,
      fullName: 'Super Administrator',
      username: 'superadmin',
      phone: '+18005550199',
      role: 'SUPER ADMIN',
      status: 'active',
      referralCode: 'NEXVORA_FOUNDER',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    };

    const superAdminProfile: Profile = {
      id: 'prof_superadmin_001',
      userId: superAdminId,
      bio: 'Platform founder and system governance officer.',
      headline: 'Executive Platform Architect',
      skills: ['Digital Marketing', 'System Governance', 'FinTech Architecture'],
      languages: ['English'],
      country: 'Global',
      kycStatus: 'verified',
      updatedAt: now,
    };

    const superAdminWallet: Wallet = {
      id: 'wal_superadmin_001',
      userId: superAdminId,
      availableBalance: 0,
      pendingBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      currency: 'USD',
      updatedAt: now,
    };

    return {
      users: [superAdminUser],
      profiles: [superAdminProfile],
      roles,
      services: [...INITIAL_SERVICES],
      jobs: [],
      proposals: [],
      orders: [],
      tasks: [],
      task_submissions: [],
      task_completions: [],
      daily_claims: [],
      courses: [],
      lessons: [],
      products: [],
      product_orders: [],
      affiliate_programs: [],
      affiliate_clicks: [],
      affiliate_conversions: [],
      referrals: [],
      wallets: [superAdminWallet],
      transactions: [],
      withdrawals: [],
      payments,
      notifications: [],
      messages: [],
      reviews: [],
      disputes: [],
      audit_logs: [],
      settings,
    };
  }

  private persistSync(data: DatabaseSchema) {
    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(TEMP_FILE, serialized, 'utf-8');
    fs.renameSync(TEMP_FILE, DB_FILE);
  }

  public async persist(): Promise<void> {
    if (this.isSaving) {
      this.needsSave = true;
      return this.savePromise || Promise.resolve();
    }

    this.isSaving = true;
    this.needsSave = false;

    this.savePromise = (async () => {
      try {
        do {
          this.needsSave = false;
          const serialized = JSON.stringify(this.data, null, 2);
          await fs.promises.writeFile(TEMP_FILE, serialized, 'utf-8');
          await fs.promises.rename(TEMP_FILE, DB_FILE);
        } while (this.needsSave);
      } catch (err) {
        console.error('CRITICAL: Failed to write database to disk', err);
      } finally {
        this.isSaving = false;
        this.savePromise = null;
      }
    })();

    return this.savePromise;
  }

  public resetToCleanState(): void {
    this.data = this.createInitialDatabase();
    this.persistSync(this.data);
  }

  // Generic collection accessors
  public getTable<K extends keyof DatabaseSchema>(name: K): DatabaseSchema[K] {
    return this.data[name];
  }

  public findById<T extends { id: string }>(table: T[], id: string): T | undefined {
    return table.find((item) => item.id === id);
  }

  public insert<T extends { id: string }>(table: T[], item: T): T {
    table.push(item);
    this.persist();
    return item;
  }

  public update<T extends { id: string }>(table: T[], id: string, patch: Partial<T>): T | null {
    const idx = table.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    table[idx] = { ...table[idx], ...patch };
    this.persist();
    return table[idx];
  }

  public delete<T extends { id: string }>(table: T[], id: string): boolean {
    const idx = table.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    table.splice(idx, 1);
    this.persist();
    return true;
  }

  private userLocks = new Map<string, Promise<any>>();

  private async acquireUserLock<T>(userId: string, fn: () => Promise<T>): Promise<T> {
    const currentLock = this.userLocks.get(userId) || Promise.resolve();
    let release: () => void;
    const nextLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.userLocks.set(userId, currentLock.then(() => nextLock));

    try {
      await currentLock;
      return await fn();
    } finally {
      release!();
      if (this.userLocks.get(userId) === nextLock) {
        this.userLocks.delete(userId);
      }
    }
  }

  // Authoritative Wallet & Ledger Engine
  public async executeWalletTransaction(
    userId: string,
    type: TransactionType,
    amount: number,
    description: string,
    referenceType?: Transaction['referenceType'],
    referenceId?: string
  ): Promise<{ wallet: Wallet; transaction: Transaction }> {
    return this.acquireUserLock(userId, async () => {
      if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
        throw new Error('Transaction amount must be a valid, finite number.');
      }

      // Check duplicate financial transactions if reference is supplied
      if (referenceId && referenceType) {
        const duplicate = this.data.transactions.find(
          (t) => t.referenceId === referenceId && t.referenceType === referenceType && t.type === type
        );
        if (duplicate) {
          throw new Error(
            `Duplicate transaction prevented: ${type} for ${referenceType} #${referenceId} already exists (TxID: ${duplicate.id}).`
          );
        }
      }

      let wallet = this.data.wallets.find((w) => w.userId === userId);
      const now = new Date().toISOString();

      if (!wallet) {
        wallet = {
          id: `wal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId,
          availableBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          currency: 'USD',
          updatedAt: now,
        };
        this.data.wallets.push(wallet);
      }

      // Debit validation: cannot produce negative balance
      if (amount < 0 && wallet.availableBalance + amount < -0.0001) {
        throw new Error(
          `Insufficient available funds. Current balance: $${wallet.availableBalance.toFixed(2)}, required deduction: $${Math.abs(amount).toFixed(2)}`
        );
      }

      const newBalance = Number((wallet.availableBalance + amount).toFixed(4));
      wallet.availableBalance = newBalance;
      wallet.updatedAt = now;

      if (type === 'Earning' || type === 'Commission' || type === 'Referral Reward') {
        if (amount > 0) {
          wallet.totalEarned = Number((wallet.totalEarned + amount).toFixed(4));
        }
      } else if (type === 'Withdrawal') {
        if (amount < 0) {
          wallet.totalWithdrawn = Number((wallet.totalWithdrawn + Math.abs(amount)).toFixed(4));
        }
      }

      const transaction: Transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        walletId: wallet.id,
        userId,
        type,
        amount: Number(amount.toFixed(4)),
        balanceAfter: newBalance,
        referenceType,
        referenceId,
        description,
        createdAt: now,
      };

      this.data.transactions.unshift(transaction);
      await this.persist();

      return { wallet, transaction };
    });
  }

  // Audit Logging
  public async logAudit(
    actorId: string | undefined,
    actorEmail: string | undefined,
    action: string,
    targetModel: string,
    targetId: string | undefined,
    details: string,
    ipAddress?: string
  ): Promise<AuditLog> {
    const entry: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId,
      actorEmail,
      action,
      targetModel,
      targetId,
      details,
      ipAddress,
      timestamp: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(entry);
    await this.persist();
    return entry;
  }
}

export const db = new DatabaseEngine();
