// Dynamic Gas Fee Engine
// Changes every 3 minutes (180,000ms), 6 cycle non-repeat pattern

const BASE_FEES = [1.20, 2.50, 3.80, 1.05, 4.20, 2.15];

export function getGasFee(): { fee: number; cycleIndex: number; nextUpdateSeconds: number } {
  const now = Date.now();
  const intervalMs = 180000; // 3 minutes
  const cycle = Math.floor(now / intervalMs);
  const cycleIndex = cycle % 6;
  
  // Seeded variation so fee stays exact during the 3 minute window
  const timeRemainder = now % intervalMs;
  const nextUpdateSeconds = Math.ceil((intervalMs - timeRemainder) / 1000);

  const baseFee = BASE_FEES[cycleIndex];
  // Stable decimal shift inside the window
  const microShift = ((cycle * 13) % 40) / 100;
  const finalFee = Number((baseFee + microShift).toFixed(2));

  return {
    fee: finalFee,
    cycleIndex,
    nextUpdateSeconds,
  };
}
