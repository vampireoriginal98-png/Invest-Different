export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type KYCStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
export type DepositStatus = "PENDING" | "CONFIRMED" | "REJECTED";
export type WithdrawalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type InvestmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type NotificationType =
  | "DEPOSIT"
  | "INVESTMENT"
  | "TRADE"
  | "REFERRAL"
  | "KYC"
  | "WITHDRAWAL"
  | "INSURANCE"
  | "STOCK"
  | "TASK"
  | "ACHIEVEMENT"
  | "SPIN"
  | "GENERAL"
  | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  phone?: string | null;
  countryCode?: string | null;
  avatarUrl?: string | null;
  transactionPasswordSet?: boolean;
  agreedToTerms?: boolean;
  role: UserRole;
  kycStatus: KYCStatus;
  kycFirstName?: string | null;
  kycLastName?: string | null;
  kycCountry?: string | null;
  kycState?: string | null;
  kycCity?: string | null;
  kycNationalId?: string | null;
  kycIdPhoto?: string | null;
  kycIdBackPhoto?: string | null;
  kycSelfie?: string | null;
  kycSubmittedAt?: string | null;
  kycApprovedAt?: string | null;
  kycRejectionReason?: string | null;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  referralCode: string;
  referralEarnings?: number;
  referredBy?: string | null;
  insuranceLevel: number;
  consecutiveDays?: number;
  lastActiveDate?: string | null;
  lastFreeSpinDate?: string | null;
  lastDailyBonusDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Deposit {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  cryptoAddress: string;
  txHash?: string | null;
  status: DepositStatus;
  adminConfirmedBy?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  netAmount: number;
  gasFeeDeducted: number;
  payoutAddress: string;
  cryptoAsset: string;
  status: WithdrawalStatus;
  createdAt: string;
  processedAt?: string | null;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyRate: number;
  durationDays: number;
  badge: string;
  popular?: boolean;
}

export interface Investment {
  id: string;
  userId: string;
  planType: string;
  amount: number;
  durationDays: number;
  profitPercent: number;
  dailyYield: number;
  startDate: string;
  endDate: string;
  status: InvestmentStatus;
  profitEarned: number;
  autoRenew: boolean;
  createdAt: string;
}

export interface InsuranceTier {
  level: number;
  cost: number;
  coverage: number;
  profitProtection: number;
  badge: string;
  description: string;
}

export interface StockHolding {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  shares: number;
  buyPrice: number;
  investedAmount: number;
  durationDays: number;
  expectedProfitPercent: number;
  projectedPayout: number;
  startDate: string;
  endDate: string;
  status: "HOLDING" | "MATURED";
}

export interface TradeOrder {
  id: string;
  userId: string;
  pair: string;
  type: "BUY" | "SELL";
  amount: number;
  leverage: number;
  entryPrice: number;
  closePrice?: number;
  outcome?: "WIN" | "LOSS";
  profit: number;
  createdAt: string;
}

export interface SpinReward {
  id: string;
  label: string;
  value: number;
  type: "CASH" | "INSURANCE" | "FREESPIN" | "GRAND" | "MEGA";
  weight: number;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  type: string;
  requiredCount: number;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  badgeIcon: string;
  category: "DEPOSIT" | "TRADING" | "REFERRAL" | "COMMUNITY" | "MASTER";
  rewardBonus: number;
  unlocked: boolean;
  unlockedAt?: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  type: NotificationType;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referredName: string;
  referredEmail: string;
  bonusEarned: number;
  deposited: boolean;
  depositAmount?: number;
  createdAt: string;
}

export interface SystemSetting {
  cryptoAddress: string;
  btcAddress: string;
  usdtAddress: string;
  ethAddress?: string;
  usdtQrCode?: string;
  btcQrCode?: string;
  ethQrCode?: string;
  minDeposit: number;
  minWithdrawal: number;
  appName: string;
  referralBonusPercent: number;
  supportEmail: string;
  announcement?: string;
  gasFeeRangeMin?: number;
  gasFeeRangeMax?: number;
  totalInvestors?: number;
  totalTradedUsd?: string;
  avgRoiPercent?: number;
  trustRating?: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  title: string;
  description: string;
  amount?: number;
  type: "deposit" | "investment" | "kyc" | "referral" | "withdrawal" | "insurance" | "trade" | "stock" | "spin" | "task" | "system";
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
  content: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  country: string;
  countryCode: string;
  avatar: string;
  rating: number;
  comment: string;
  profitEarned: string;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

