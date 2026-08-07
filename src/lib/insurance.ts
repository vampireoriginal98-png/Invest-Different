import { InsuranceTier } from "@/types";

export const DEFAULT_INSURANCE_TIERS: InsuranceTier[] = [
  {
    level: 1,
    cost: 50,
    coverage: 10,
    profitProtection: 5,
    badge: "Bronze Guardian",
    description: "Covers 10% loss on bot cancellation and shields 5% yield.",
  },
  {
    level: 2,
    cost: 150,
    coverage: 30,
    profitProtection: 14,
    badge: "Silver Defender",
    description: "Covers 30% loss on bot cancellation and shields 14% yield.",
  },
  {
    level: 3,
    cost: 400,
    coverage: 55,
    profitProtection: 30,
    badge: "Gold Vault",
    description: "Covers 55% loss on bot cancellation and shields 30% yield.",
  },
  {
    level: 4,
    cost: 1000,
    coverage: 80,
    profitProtection: 50,
    badge: "Platinum Aegis",
    description: "Covers 80% loss on bot cancellation and shields 50% yield.",
  },
];
