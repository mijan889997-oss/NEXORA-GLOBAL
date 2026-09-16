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

export const INITIAL_NATIVE_TASKS: Task[] = [];

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
        if (!parsed.withdrawals) parsed.withdrawals = [];
        if (!parsed.task_submissions) parsed.task_submissions = [];

        // Ensure default seed withdrawals exist if empty
        if (parsed.withdrawals.length === 0) {
          const nowIso = new Date().toISOString();
          parsed.withdrawals = [
            {
              id: 'wd_seed_001',
              withdrawalNumber: 'WD-2026-89101',
              userId: 'usr_1789095361946_x8xkf',
              userName: 'Test Worker',
              userEmail: 'testworker@example.com',
              amount: 15.00,
              fee: 0,
              netAmount: 15.00,
              paymentMethod: 'bKash Personal',
              method: 'bKash Personal',
              accountDetails: {
                accountNumber: '01712345678',
                emailOrWalletAddress: '01712345678',
              },
              accountNumber: '01712345678',
              status: 'Pending',
              createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
              updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
            {
              id: 'wd_seed_002',
              withdrawalNumber: 'WD-2026-89102',
              userId: 'usr_1789095361946_x8xkf',
              userName: 'Test Worker',
              userEmail: 'testworker@example.com',
              amount: 25.00,
              fee: 0,
              netAmount: 25.00,
              paymentMethod: 'Nagad Personal',
              method: 'Nagad Personal',
              accountDetails: {
                accountNumber: '01898765432',
                emailOrWalletAddress: '01898765432',
              },
              accountNumber: '01898765432',
              status: 'Completed',
              createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
              updatedAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: 'wd_seed_003',
              withdrawalNumber: 'WD-2026-89103',
              userId: 'usr_seed_earner_002',
              userName: 'Elena Rostova',
              userEmail: 'elena.rostova@nexvora.com',
              amount: 10.00,
              fee: 0,
              netAmount: 10.00,
              paymentMethod: 'Rocket Personal',
              method: 'Rocket Personal',
              accountDetails: {
                accountNumber: '01987654321',
                emailOrWalletAddress: '01987654321',
              },
              accountNumber: '01987654321',
              status: 'Pending',
              createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
              updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            },
          ];
        }

        // Ensure default seed task submissions exist if empty
        if (parsed.task_submissions.length === 0) {
          parsed.task_submissions = [
            {
              id: 'sub_seed_001',
              taskId: 'adsterra_1',
              taskTitle: 'Adsterra প্রিমিয়াম স্পন্সরড ভিজিট ১',
              taskCategory: 'Visit & Earn',
              userId: 'usr_1789095361946_x8xkf',
              userName: 'Test Worker',
              userEmail: 'testworker@example.com',
              rewardAmount: 0.02,
              proofData: {
                textNotes: 'Visited target page and completed full 15s session duration.',
                screenshotUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80',
                proofUrl: 'https://www.profitableratecpmnetwork.com/yct17pt7yz',
              },
              status: 'pending_review',
              submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
              createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
              updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
            {
              id: 'sub_seed_002',
              taskId: 'monetag_1',
              taskTitle: 'Monetag স্মার্টলিঙ্ক টাস্ক ১',
              taskCategory: 'Sponsored',
              userId: 'usr_seed_earner_002',
              userName: 'Elena Rostova',
              userEmail: 'elena.rostova@nexvora.com',
              rewardAmount: 0.02,
              proofData: {
                textNotes: 'Verified smartlink action and confirmed redirect url.',
                proofUrl: 'https://omg10.com/4/11775258',
              },
              status: 'approved',
              reviewedBy: 'usr_superadmin_001',
              reviewedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
              submittedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
              createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
              updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
            },
          ];
        }

        // Ensure registered seed users exist
        if (!parsed.users.some((u: any) => u.email === 'elena.rostova@nexvora.com')) {
          parsed.users.push({
            id: 'usr_seed_earner_002',
            email: 'elena.rostova@nexvora.com',
            passwordHash: '***',
            fullName: 'Elena Rostova',
            username: 'elena_r',
            phone: '+18005550188',
            role: 'USER',
            status: 'active',
            referralCode: 'ELENA_PRO',
            emailVerified: true,
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

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
