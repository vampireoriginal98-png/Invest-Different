const NAMES = [
  "John D.", "Sarah M.", "Mike K.", "Emma W.", "David R.",
  "Lisa B.", "James P.", "Anna S.", "Robert C.", "Maria L.",
  "Viktor V.", "Chen W.", "Elena K.", "Carlos G.", "Fatima A."
];

const ACTIONS = [
  "earned ${amount} from Automated Bot Yield!",
  "just executed a withdrawal of ${amount} USDT!",
  "invested ${amount} into the Platinum Bot Plan!",
  "bought ${amount} in AAPL stock portfolio!",
  "won ${amount} on Spin the Wheel!",
  "unlocked Level ${level} Insurance Aegis!",
  "earned ${amount} referral commission payout!",
  "completed Daily Task & claimed bonus reward!",
];

export function generateActivityItem() {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const rawAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const amountVal = (Math.random() * 4500 + 150).toFixed(2);
  const levelVal = (Math.floor(Math.random() * 4) + 1).toString();

  const action = rawAction
    .replace("${amount}", `$${amountVal}`)
    .replace("${level}", levelVal);

  return {
    id: "feed_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
    name,
    action,
    time: "Just now",
  };
}
