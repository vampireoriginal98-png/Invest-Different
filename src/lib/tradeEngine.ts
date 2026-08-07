function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function calculateTradeOutcome(userId: string, amount: number): { win: boolean; profit: number; percentage: number } {
  const timeBlock = Math.floor(Date.now() / 60000); // changes every minute
  const seed = hashString(userId + timeBlock.toString() + amount.toString());
  const randomVal = seededRandom(seed);

  let winRate: number;
  if (amount < 50) winRate = 0.60;      // 60% win rate for small trades
  else if (amount < 250) winRate = 0.50; // 50% win rate
  else if (amount < 1000) winRate = 0.40;// 40% win rate
  else winRate = 0.30;                   // 30% win rate for high stakes

  const win = randomVal < winRate;
  const pct = (0.02 + seededRandom(seed + 1) * 0.08); // 2% to 10% movement
  const profit = win ? Number((amount * pct).toFixed(2)) : Number((-amount * (pct * 0.8)).toFixed(2));

  return { win, profit, percentage: Number((pct * 100).toFixed(2)) };
}

export const TRADING_PAIRS = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", category: "Forex", basePrice: 1.0885, maxLeverage: 500 },
  { symbol: "GBP/JPY", name: "British Pound / Japanese Yen", category: "Forex", basePrice: 194.20, maxLeverage: 500 },
  { symbol: "BTC/USD", name: "Bitcoin / US Dollar", category: "Crypto", basePrice: 64200.0, maxLeverage: 100 },
  { symbol: "ETH/USDT", name: "Ethereum / Tether", category: "Crypto", basePrice: 3450.0, maxLeverage: 100 },
  { symbol: "XAU/USD", name: "Gold Spot / US Dollar", category: "Commodities", basePrice: 2410.50, maxLeverage: 200 },
];
