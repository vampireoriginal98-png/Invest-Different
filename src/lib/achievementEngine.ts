export interface AchievementDef {
  code: string;
  title: string;
  description: string;
  badgeIcon: string;
  category: "DEPOSIT" | "TRADING" | "REFERRAL" | "COMMUNITY" | "MASTER";
  rewardBonus: number;
}

export const MASTER_ACHIEVEMENTS: AchievementDef[] = [
  { code: "DEP_FIRST", title: "First Capital", description: "Make your first deposit of at least $10.", badgeIcon: "💳", category: "DEPOSIT", rewardBonus: 5 },
  { code: "DEP_500", title: "High Roller", description: "Reach $500 total deposited capital.", badgeIcon: "💎", category: "DEPOSIT", rewardBonus: 25 },
  { code: "DEP_10000", title: "Whale Investor", description: "Reach $10,000 total deposited capital.", badgeIcon: "🐋", category: "DEPOSIT", rewardBonus: 100 },
  { code: "TRADE_FIRST", title: "Market Novice", description: "Place your first Forex or Crypto trade order.", badgeIcon: "📈", category: "TRADING", rewardBonus: 5 },
  { code: "TRADE_10", title: "Day Trader", description: "Complete 10 trades on the Forex/Broker replica.", badgeIcon: "⚡", category: "TRADING", rewardBonus: 15 },
  { code: "STOCK_FIRST", title: "Shareholder", description: "Purchase shares in top global tech or ETF stocks.", badgeIcon: "🏛️", category: "TRADING", rewardBonus: 10 },
  { code: "SPIN_10", title: "Lucky Spinner", description: "Spin the reward wheel 10 times.", badgeIcon: "🎰", category: "COMMUNITY", rewardBonus: 10 },
  { code: "REF_FIRST", title: "Networker", description: "Refer your first active investor via unique link.", badgeIcon: "🤝", category: "REFERRAL", rewardBonus: 20 },
  { code: "REF_5", title: "Influencer", description: "Build a tree of 5 active referrals.", badgeIcon: "🌟", category: "REFERRAL", rewardBonus: 50 },
  { code: "INS_AEGIS", title: "Shield Bearer", description: "Activate Level 4 Insurance Aegis coverage.", badgeIcon: "🛡️", category: "MASTER", rewardBonus: 30 },
  { code: "TASK_10", title: "Taskmaster", description: "Complete and claim 10 daily system tasks.", badgeIcon: "✅", category: "COMMUNITY", rewardBonus: 20 },
  { code: "WITHDRAW_1", title: "Payout Master", description: "Request and receive your first wallet withdrawal.", badgeIcon: "💸", category: "DEPOSIT", rewardBonus: 10 },
];
