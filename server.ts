import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GoogleGenAI } from "@google/genai";
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "invest-different-super-secret-key-2026";

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// File-based persistent storage helper
const DB_FILE = path.join(process.cwd(), "db.json");

interface DBData {
  users: any[];
  deposits: any[];
  withdrawals: any[];
  investments: any[];
  stockHoldings: any[];
  tradeOrders: any[];
  kycSubmissions: any[];
  notifications: any[];
  systemSetting: any;
  activities: any[];
  claimedTasks: any[];
  unlockedAchievements: any[];
  insuranceTiers: any[];
}

function getInitialDB(): DBData {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync("adminpassword", salt);
  const admin2PasswordHash = bcrypt.hashSync("Admin123", salt);
  const userPasswordHash = bcrypt.hashSync("userpassword", salt);

  return {
    users: [
      {
        id: "usr_admin_001",
        email: "admin@investdifferent.com",
        password: adminPasswordHash,
        name: "Super Admin",
        role: "SUPER_ADMIN",
        kycStatus: "APPROVED",
        balance: 25000.0,
        totalDeposited: 50000.0,
        totalWithdrawn: 12000.0,
        referralCode: "ADMINVIP",
        insuranceLevel: 4,
        agreedToTerms: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "usr_admin_002",
        email: "admin@gmail.com",
        password: admin2PasswordHash,
        name: "Admin Control",
        role: "ADMIN",
        kycStatus: "APPROVED",
        balance: 50000.0,
        totalDeposited: 100000.0,
        totalWithdrawn: 20000.0,
        referralCode: "ADMIN123",
        insuranceLevel: 4,
        agreedToTerms: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    deposits: [],
    withdrawals: [],
    investments: [],
    stockHoldings: [],
    tradeOrders: [],
    kycSubmissions: [],
    notifications: [],
    systemSetting: {
      cryptoAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      usdtAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      btcAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      ethAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      usdtQrCode: "",
      btcQrCode: "",
      ethQrCode: "",
      minDeposit: 10,
      minWithdrawal: 50,
      appName: "Invest Different",
      referralBonusPercent: 10,
      supportEmail: "support@investdifferent.com",
      announcement: "⚡ Stage 2 Live: Multi-Asset Trading, Insurance Aegis, Stock Portfolios & Gas Fee Shield Active!",
      gasFeeRangeMin: 1.0,
      gasFeeRangeMax: 4.5,
    },
    activities: [
      {
        id: "act_001",
        userId: "usr_demo_002",
        title: "Deposit Credited",
        description: "$1,000 USDT deposit confirmed by admin",
        amount: 1000,
        type: "deposit",
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
    claimedTasks: [],
    unlockedAchievements: [
      {
        userId: "usr_demo_002",
        code: "DEP_FIRST",
        unlockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      }
    ],
    insuranceTiers: [
      { level: 1, cost: 50, coverage: 10, profitProtection: 5 },
      { level: 2, cost: 150, coverage: 30, profitProtection: 14 },
      { level: 3, cost: 400, coverage: 55, profitProtection: 30 },
      { level: 4, cost: 1000, coverage: 80, profitProtection: 50 },
    ],
  };
}

function readDB(): DBData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDB();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(content);
    // Ensure missing arrays exist
    // Ensure admin@gmail.com exists
    const hasAdminGmail = parsed.users.some((u: any) => u.email.toLowerCase() === "admin@gmail.com");
    if (!hasAdminGmail) {
      const salt = bcrypt.genSaltSync(10);
      parsed.users.push({
        id: "usr_admin_002",
        email: "admin@gmail.com",
        password: bcrypt.hashSync("Admin123", salt),
        name: "Admin Control",
        role: "ADMIN",
        kycStatus: "APPROVED",
        balance: 50000.0,
        totalDeposited: 100000.0,
        totalWithdrawn: 20000.0,
        referralCode: "ADMIN123",
        insuranceLevel: 4,
        agreedToTerms: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (!parsed.withdrawals) parsed.withdrawals = [];
    if (!parsed.stockHoldings) parsed.stockHoldings = [];
    if (!parsed.tradeOrders) parsed.tradeOrders = [];
    if (!parsed.claimedTasks) parsed.claimedTasks = [];
    if (!parsed.unlockedAchievements) parsed.unlockedAchievements = [];
    if (!parsed.insuranceTiers) parsed.insuranceTiers = getInitialDB().insuranceTiers;
    return parsed;
  } catch (e) {
    console.error("DB Read Error:", e);
    return getInitialDB();
  }
}

function writeDB(data: DBData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("DB Write Error:", e);
  }
}

// Auth Helper Middleware
function getAuthUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded && decoded.id) {
      const db = readDB();
      const uIdx = db.users.findIndex((u) => u.id === decoded.id);
      if (uIdx !== -1) {
        db.users[uIdx].lastActiveAt = new Date().toISOString();
        writeDB(db);
      }
    }
    return decoded;
  } catch (e) {
    return null;
  }
}

// Dynamic Gas Fee Calculation Helper
function getGasFeeVal(): number {
  const now = Date.now();
  const intervalMs = 180000; // 3 min
  const cycle = Math.floor(now / intervalMs) % 6;
  const fees = [1.20, 2.50, 3.80, 1.05, 4.20, 2.15];
  return Number((fees[cycle] + ((now % 1000) / 1000) * 0.2).toFixed(2));
}

// Helper: Daily Activity Tracker & Consecutive Streak Update
function updateUserDailyStreak(user: any) {
  if (!user) return;
  const today = new Date().toISOString().split("T")[0];
  const lastDate = user.lastActiveDate;

  if (!user.consecutiveDays || user.consecutiveDays < 1) {
    user.consecutiveDays = 1;
    user.lastActiveDate = today;
    return;
  }

  if (lastDate === today) {
    return;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (lastDate === yesterday) {
    user.consecutiveDays += 1;
    user.lastActiveDate = today;
  } else {
    // Missed a day! Reset consecutive active days streak back to 1
    user.consecutiveDays = 1;
    user.lastActiveDate = today;
  }
}

function getCanonicalEmail(rawEmail: string): string {
  if (!rawEmail) return "";
  const clean = rawEmail.trim().toLowerCase();
  const [local, domain] = clean.split("@");
  if (!domain) return clean;
  if (domain === "gmail.com" || domain === "googlemail.com") {
    const baseLocal = local.replace(/\./g, "").split("+")[0];
    return `${baseLocal}@gmail.com`;
  }
  return clean;
}

app.post("/api/auth/register", (req: Request, res: Response) => {
  const { name, email, password, referralCode: inputRefCode } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = readDB();
  const canonicalEmail = getCanonicalEmail(email);

  const existing = db.users.find(
    (u) => getCanonicalEmail(u.email) === canonicalEmail
  );
  if (existing) {
    return res.status(400).json({ error: "An account with this email address already exists" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newRefCode = "INV" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const newUser = {
    id: "usr_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    email,
    password: passwordHash,
    name: name || "Investor",
    role: "USER",
    kycStatus: "PENDING",
    balance: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    referralCode: newRefCode,
    referredBy: inputRefCode || null,
    insuranceLevel: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Add welcome notification
  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: newUser.id,
    message: "Welcome to Invest Different! Your account is active and ready for investing.",
    read: false,
    type: "GENERAL",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const { password: _, ...userWithoutPassword } = newUser;
  return res.status(201).json({ success: true, user: userWithoutPassword, token });
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const db = readDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const { password: _, ...userWithoutPassword } = user;
  return res.json({ success: true, user: userWithoutPassword, token });
});

app.post("/api/auth/forgot-password", (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const db = readDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    db.notifications.unshift({
      id: "notif_" + Date.now(),
      userId: user.id,
      message: "🔐 Password reset link requested. If you did not request this, please secure your account immediately.",
      read: false,
      type: "SECURITY",
      createdAt: new Date().toISOString(),
    });
    writeDB(db);
  }

  return res.json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });
});

app.post("/api/auth/google", (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "A valid Gmail or email address is required" });
  }

  const db = readDB();
  let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    const newRefCode = "INV" + Math.random().toString(36).substring(2, 8).toUpperCase();
    user = {
      id: "usr_" + Date.now().toString(36),
      email: email.trim(),
      password: null,
      name: name || email.split("@")[0] || "Google User",
      role: "USER",
      kycStatus: "PENDING",
      balance: 100, // Welcome bonus
      totalDeposited: 0,
      totalWithdrawn: 0,
      referralCode: newRefCode,
      insuranceLevel: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(user);
    writeDB(db);
  } else {
    // If existing user was pending, auto-verify upon Google auth
    if (user.kycStatus === "PENDING") {
      user.kycStatus = "APPROVED";
      user.updatedAt = new Date().toISOString();
      writeDB(db);
    }
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const { password: _, ...userWithoutPassword } = user;
  return res.json({ success: true, user: userWithoutPassword, token });
});

app.get("/api/auth/me", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const user = db.users.find((u) => u.id === auth.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  updateUserDailyStreak(user);
  writeDB(db);

  const { password: _, ...userWithoutPassword } = user;
  return res.json({ user: userWithoutPassword });
});

// ------------------- USER PROFILE & SECURITY API ROUTES ------------------- //

app.put("/api/user/profile", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const { firstName, lastName, displayName, phone, avatarUrl } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIndex];
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (firstName || lastName) user.name = `${firstName || user.firstName || ""} ${lastName || user.lastName || ""}`.trim();
  if (displayName) user.displayName = displayName;
  if (phone) user.phone = phone;
  if (avatarUrl) user.avatarUrl = avatarUrl;
  user.updatedAt = new Date().toISOString();

  writeDB(db);
  const { password: _, ...userWithoutPassword } = user;
  return res.json({ success: true, user: userWithoutPassword });
});

app.post("/api/user/transaction-password", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const { transactionPassword } = req.body;
  if (!transactionPassword || transactionPassword.length < 4) {
    return res.status(400).json({ error: "Transaction password must be at least 4 digits" });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const salt = bcrypt.genSaltSync(10);
  db.users[userIndex].transactionPassword = bcrypt.hashSync(transactionPassword, salt);
  db.users[userIndex].transactionPasswordSet = true;
  db.users[userIndex].updatedAt = new Date().toISOString();

  writeDB(db);
  return res.json({ success: true, message: "Transaction password set successfully" });
});

app.post("/api/user/accept-terms", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex !== -1) {
    db.users[userIndex].agreedToTerms = true;
    writeDB(db);
  }
  return res.json({ success: true });
});

app.post("/api/user/kyc", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const { firstName, lastName, country, state, city, nationalId, idFront, idBack, selfie } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIndex];
  user.kycFirstName = firstName;
  user.kycLastName = lastName;
  user.kycCountry = country;
  user.kycState = state;
  user.kycCity = city;
  user.kycNationalId = nationalId;
  user.kycIdPhoto = idFront;
  user.kycIdBackPhoto = idBack;
  user.kycSelfie = selfie;
  user.kycStatus = "SUBMITTED";
  user.kycSubmittedAt = new Date().toISOString();

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: user.id,
    message: "📋 KYC Identity Verification documents submitted! Review in progress (up to 24 hours).",
    read: false,
    type: "KYC",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  const { password: _, ...userWithoutPassword } = user;
  return res.json({ success: true, user: userWithoutPassword });
});

// ------------------- GROQ / AI ASSISTANT API ROUTE ------------------- //

app.post("/api/ai/chat", async (req: Request, res: Response) => {
  const { message } = req.body;
  const q = (message || "").toLowerCase();

  const auth = getAuthUser(req);
  let userContextPrefix = "";

  if (auth) {
    const db = readDB();
    const user = db.users.find((u) => u.id === auth.id);
    if (user) {
      const activeBotsCount = db.investments.filter((i) => i.userId === user.id && i.status === "ACTIVE").length;
      userContextPrefix = `[User: ${user.name || user.email} | Balance: ${(user.balance || 0).toLocaleString()} | KYC: ${user.kycStatus || "PENDING"} | Active Bots: ${activeBotsCount}]\n\n`;
    }
  }

  let replyText = "";
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. Try Groq API first
  if (groqKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are the Invest Different AI Financial Advisor & Quant Analyst. Provide concise, expert insights on crypto, stocks, yield bots, trading market strategies, and risk management.",
            },
            { role: "user", content: `${userContextPrefix}${message}` },
          ],
          max_tokens: 350,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        replyText = groqData.choices?.[0]?.message?.content;
      }
    } catch (e) {
      console.log("Groq API error or timeout, proceeding to Gemini fallback...", e);
    }
  }

  // 2. Fallback to Gemini API if Groq fails or no key
  if (!replyText && geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${userContextPrefix}Question: ${message}. Respond as a financial quant analyst in 2 concise, professional paragraphs.`,
      });
      replyText = response.text || "";
    } catch (e) {
      console.log("Gemini API fallback error:", e);
    }
  }

  // 3. Fallback to local rule-based response if both AI services fail
  if (!replyText) {
    if (q.includes("balance") || q.includes("my account") || q.includes("portfolio")) {
      replyText = "Your wallet balance reflects live capital and compounding yields from active Bot engines and Trade Market positions. Ensure your KYC verification is complete to process payouts.";
    } else if (q.includes("deposit") || q.includes("usdt") || q.includes("crypto") || q.includes("btc")) {
      replyText = "To deposit USDT (TRC20/ERC20) or BTC, navigate to the 'Deposit & Wallet' page. Copy your dedicated wallet address and submit your transaction hash (TxHash) for validation.";
    } else if (q.includes("withdraw") || q.includes("payout")) {
      replyText = "Withdrawals require a minimum balance of $1,000 for trading profits or $500 for referral earnings, along with your 4-digit Security PIN and approved KYC status.";
    } else if (q.includes("plan") || q.includes("yield") || q.includes("bot")) {
      replyText = "Our Automated Algorithmic Bots run 24/7 with yield payouts every 24 hours. Activate a bot directly from the Yield Engines page.";
    } else {
      replyText = "Invest Different AI Core: Our platform provides daily compounding yield through automated quantitative arbitrage bots, global stock index portfolios, and real-time CFD trading replicas. All deposits and payouts are processed 24/7.";
    }
  }

  return res.json({ reply: replyText });
});

app.post("/api/admin/credentials", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const auth = getAuthUser(req);
  const { email, password } = req.body;

  const db = readDB();
  const adminIndex = db.users.findIndex((u) => u.id === auth.id);
  if (adminIndex === -1) return res.status(404).json({ error: "Admin user not found" });

  if (email) db.users[adminIndex].email = email;
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    db.users[adminIndex].password = bcrypt.hashSync(password, salt);
  }

  writeDB(db);
  return res.json({ success: true, message: "Admin credentials updated" });
});

// ------------------- WALLET & GAS FEE API ROUTES ------------------- //

app.get("/api/gasfee", (req: Request, res: Response) => {
  const fee = getGasFeeVal();
  return res.json({ gasFee: fee });
});

app.get("/api/wallet/balance", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const user = db.users.find((u) => u.id === auth.id);
  return res.json({ balance: user ? user.balance : 0 });
});

app.get("/api/wallet/deposit/address", (req: Request, res: Response) => {
  const db = readDB();
  return res.json({ address: db.systemSetting.cryptoAddress, systemSetting: db.systemSetting });
});

app.post("/api/wallet/deposit", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const { amount, txHash } = req.body;
  if (!amount || amount < 10) {
    return res.status(400).json({ error: "Minimum deposit is $10" });
  }

  const db = readDB();
  const user = db.users.find((u) => u.id === auth.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const deposit = {
    id: "dep_" + Date.now().toString(36),
    userId: user.id,
    userName: user.name || "Investor",
    userEmail: user.email,
    amount: Number(amount),
    cryptoAddress: db.systemSetting.cryptoAddress,
    txHash: txHash || null,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  db.deposits.unshift(deposit);

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: user.id,
    message: `Deposit request for $${amount} submitted. Admin review pending.`,
    read: false,
    type: "DEPOSIT",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return res.status(201).json({ success: true, deposit });
});

// Transaction PIN Setup API
app.post("/api/user/pin/set", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const { pin } = req.body;
  if (!pin || String(pin).length < 4) {
    return res.status(400).json({ error: "Transaction Security PIN must be at least 4 digits" });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const salt = bcrypt.genSaltSync(10);
  db.users[userIndex].transactionPin = bcrypt.hashSync(String(pin), salt);
  db.users[userIndex].transactionPasswordSet = true;
  db.users[userIndex].updatedAt = new Date().toISOString();

  writeDB(db);
  const { password: _, transactionPin: __, ...userWithoutPassword } = db.users[userIndex];
  return res.json({ success: true, message: "Transaction Security PIN set successfully!", user: userWithoutPassword });
});

// Daily Reward Claim API
app.post("/api/rewards/claim-daily", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIndex];
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  if (user.lastDailyClaimDate === todayStr) {
    return res.status(400).json({ error: "Daily reward already claimed today! Check back tomorrow." });
  }

  user.lastDailyClaimDate = todayStr;
  user.balance += 0.50; // $0.50 daily cash reward
  user.updatedAt = now.toISOString();

  db.activities.unshift({
    id: "act_" + Date.now(),
    userId: user.id,
    title: "Daily Login Reward",
    description: "+$0.50 daily reward credited!",
    amount: 0.50,
    type: "spin",
    createdAt: now.toISOString(),
  });

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: user.id,
    message: "🎁 Daily $0.50 login bonus credited to your wallet balance!",
    read: false,
    type: "GENERAL",
    createdAt: now.toISOString(),
  });

  writeDB(db);
  const { password: _, transactionPin: __, ...userWithoutPassword } = user;
  return res.json({ success: true, reward: 0.50, user: userWithoutPassword });
});

// Daily Lucky Wheel Spin API
app.post("/api/rewards/spin", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIndex];
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  if (user.lastSpinDate === todayStr) {
    return res.status(400).json({ error: "Daily free spin already used today! Check back tomorrow." });
  }

  const prizes = [0.10, 0.25, 0.50, 1.00, 2.00, 5.00];
  const wonAmount = prizes[Math.floor(Math.random() * prizes.length)];

  user.lastSpinDate = todayStr;
  user.balance += wonAmount;
  user.updatedAt = now.toISOString();

  db.activities.unshift({
    id: "act_" + Date.now(),
    userId: user.id,
    title: "Lucky Wheel Spin",
    description: `Won +${wonAmount.toFixed(2)} cash bonus!`,
    amount: wonAmount,
    type: "spin",
    createdAt: now.toISOString(),
  });

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: user.id,
    message: `🎰 Lucky Wheel Winner! +${wonAmount.toFixed(2)} cash prize added to your wallet.`,
    read: false,
    type: "SPIN",
    createdAt: now.toISOString(),
  });

  writeDB(db);
  const { password: _, transactionPin: __, ...userWithoutPassword } = user;
  return res.json({ success: true, wonAmount, user: userWithoutPassword });
});

// Admin User Creation API
app.post("/api/admin/users/create", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { name, email, password, role, balance, kycStatus } = req.body;
  if (!email || !email.includes("@")) return res.status(400).json({ error: "Valid email is required" });

  const db = readDB();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) return res.status(400).json({ error: "An account with this email already exists" });

  const salt = bcrypt.genSaltSync(10);
  const newUser = {
    id: "usr_" + Date.now().toString(36),
    email: email.trim(),
    password: password ? bcrypt.hashSync(password, salt) : bcrypt.hashSync("userpassword123", salt),
    name: name || "Investor Account",
    role: role || "USER",
    kycStatus: kycStatus || "APPROVED",
    balance: Number(balance) || 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    referralCode: "INV" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    insuranceLevel: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.unshift(newUser);
  writeDB(db);

  return res.status(201).json({ success: true, user: newUser });
});

// Admin User Balance Adjustment (+ / -)
app.post("/api/admin/users/:id/balance", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { id } = req.params;
  const { amountChange, reason } = req.body;

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const delta = Number(amountChange) || 0;
  db.users[userIndex].balance += delta;
  if (db.users[userIndex].balance < 0) db.users[userIndex].balance = 0;
  db.users[userIndex].updatedAt = new Date().toISOString();

  db.activities.unshift({
    id: "act_" + Date.now(),
    userId: id,
    title: "Admin Balance Adjustment",
    description: `${delta >= 0 ? "+" : ""}${delta.toFixed(2)} (${reason || "Manual Credit/Debit"})`,
    amount: delta,
    type: "deposit",
    createdAt: new Date().toISOString(),
  });

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: id,
    message: `Account Balance Adjusted by Admin: ${delta >= 0 ? "+" : ""}${delta.toFixed(2)}. Reason: ${reason || "System Adjustment"}. New Balance: ${db.users[userIndex].balance.toFixed(2)}`,
    read: false,
    type: "GENERAL",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return res.json({ success: true, balance: db.users[userIndex].balance });
});

// Admin Approve/Reject KYC
app.post("/api/admin/kyc/:id/approve", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { id } = req.params;
  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  db.users[userIndex].kycStatus = "APPROVED";
  db.users[userIndex].kycApprovedAt = new Date().toISOString();
  db.users[userIndex].updatedAt = new Date().toISOString();

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: id,
    message: "🎉 Your Identity Verification (KYC) has been APPROVED by Compliance! Full trading and withdrawal access unlocked.",
    read: false,
    type: "KYC",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return res.json({ success: true, user: db.users[userIndex] });
});

app.post("/api/admin/kyc/:id/reject", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { id } = req.params;
  const { reason } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  db.users[userIndex].kycStatus = "REJECTED";
  db.users[userIndex].kycRejectionReason = reason || "Documents unreadable or incomplete";
  db.users[userIndex].updatedAt = new Date().toISOString();

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: id,
    message: `⚠️ KYC Verification Rejected: ${reason || "Document rejected"}. Please re-upload clear ID documents.`,
    read: false,
    type: "KYC",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return res.json({ success: true, user: db.users[userIndex] });
});

// Withdrawal Request API
app.post("/api/withdrawal/request", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const { amount, payoutAddress, cryptoAsset, pin, isReferralWithdrawal } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIndex];

  // 1. Mandatory KYC Check
  if (user.kycStatus !== "APPROVED") {
    return res.status(403).json({ error: "Mandatory KYC Identity Verification required before withdrawals are unlocked! Admin must approve your submission." });
  }

  // 2. Mandatory Transaction PIN Check
  if (!user.transactionPin) {
    return res.status(400).json({ error: "Transaction Security PIN not configured. Please set your 4-digit PIN before withdrawing." });
  }

  if (!pin || !bcrypt.compareSync(String(pin), user.transactionPin)) {
    return res.status(401).json({ error: "Incorrect Transaction Security PIN!" });
  }

  // 3. Minimum Amounts ($1000 for standard profits, $500 for referral earnings)
  const minRequired = isReferralWithdrawal ? 500 : 1000;
  const availablePool = isReferralWithdrawal ? (user.referralEarnings || 0) : user.balance;

  if (!amount || Number(amount) < minRequired) {
    return res.status(400).json({ error: `Minimum withdrawal for ${isReferralWithdrawal ? "Referral Earnings" : "Trading Profit & Capital"} is ${minRequired}.` });
  }

  if (availablePool < Number(amount)) {
    return res.status(400).json({ error: "Insufficient wallet balance to cover withdrawal amount." });
  }

  const currentGasFee = getGasFeeVal();
  const netAmount = Number((Number(amount) - currentGasFee).toFixed(2));
  if (netAmount <= 0) {
    return res.status(400).json({ error: "Withdrawal amount must exceed network gas fee" });
  }

  // Deduct
  if (isReferralWithdrawal) {
    user.referralEarnings = (user.referralEarnings || 0) - Number(amount);
  } else {
    user.balance -= Number(amount);
  }

  const withdrawal = {
    id: "wth_" + Date.now().toString(36),
    userId: user.id,
    userName: user.name || "Investor",
    userEmail: user.email,
    amount: Number(amount),
    netAmount,
    gasFeeDeducted: currentGasFee,
    payoutAddress: payoutAddress || "0xDefaultAddress",
    cryptoAsset: cryptoAsset || "USDT (TRC20)",
    status: "PENDING",
    isReferral: !!isReferralWithdrawal,
    createdAt: new Date().toISOString(),
  };

  db.withdrawals.unshift(withdrawal);

  db.activities.unshift({
    id: "act_" + Date.now(),
    userId: user.id,
    title: "Withdrawal Requested",
    description: `Requested ${amount} payout to ${payoutAddress} (Gas fee: ${currentGasFee})`,
    amount: -Number(amount),
    type: "withdrawal",
    createdAt: new Date().toISOString(),
  });

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: user.id,
    message: `Withdrawal request for ${amount} submitted! Pending admin processing.`,
    read: false,
    type: "WITHDRAWAL",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  const { password: _, transactionPin: __, ...userWithoutPassword } = user;
  return res.status(201).json({ success: true, withdrawal, user: userWithoutPassword });
});

app.get("/api/withdrawal/history", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const userWithdrawals = db.withdrawals.filter((w) => w.userId === auth.id);
  return res.json({ withdrawals: userWithdrawals });
});

app.get("/api/wallet/transactions", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const userDeposits = db.deposits.filter((d) => d.userId === auth.id);
  const userWithdrawals = db.withdrawals.filter((w) => w.userId === auth.id);
  const userActivities = db.activities.filter((a) => a.userId === auth.id);

  return res.json({ deposits: userDeposits, withdrawals: userWithdrawals, activities: userActivities });
});

// ------------------- STAGE 2 MODULE APIs ------------------- //

// 1. INSURANCE TIERS API
app.get("/api/insurance/status", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const user = db.users.find((u) => u.id === auth.id);
  return res.json({
    insuranceLevel: user ? user.insuranceLevel : 0,
    tiers: db.insuranceTiers,
  });
});

app.post("/api/insurance/activate", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const { level } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIndex];
  const tier = db.insuranceTiers.find((t) => t.level === Number(level));

  if (!tier) return res.status(400).json({ error: "Invalid insurance level" });
  if (user.balance < tier.cost) {
    return res.status(400).json({ error: `Insufficient balance. Level ${level} Insurance requires $${tier.cost}` });
  }

  // Deduct balance & set level
  user.balance -= tier.cost;
  user.insuranceLevel = tier.level;

  db.activities.unshift({
    id: "act_" + Date.now(),
    userId: user.id,
    title: "Insurance Aegis Activated",
    description: `Purchased Level ${tier.level} Insurance Coverage for $${tier.cost}`,
    amount: -tier.cost,
    type: "insurance",
    createdAt: new Date().toISOString(),
  });

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: user.id,
    message: `🛡️ Level ${tier.level} Insurance Aegis activated! Your capital is now ${tier.coverage}% covered.`,
    read: false,
    type: "INSURANCE",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return res.json({ success: true, newLevel: tier.level, newBalance: user.balance });
});

// 2. STOCKS API
app.post("/api/stocks/buy", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const { symbol, name, investedAmount, durationDays, currentPrice, expectedProfitPercent } = req.body;
  if (!investedAmount || investedAmount < 500) {
    return res.status(400).json({ error: "Minimum stock investment amount is $500" });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIndex];
  if (user.balance < investedAmount) {
    return res.status(400).json({ error: "Insufficient wallet balance for stock purchase" });
  }

  user.balance -= Number(investedAmount);

  const shares = Number((investedAmount / currentPrice).toFixed(4));
  const projectedPayout = Number((investedAmount * (1 + (expectedProfitPercent || 15) / 100)).toFixed(2));

  const holding = {
    id: "stk_" + Date.now().toString(36),
    userId: user.id,
    symbol,
    name,
    shares,
    buyPrice: currentPrice,
    investedAmount: Number(investedAmount),
    durationDays: durationDays || 30,
    expectedProfitPercent: expectedProfitPercent || 15,
    projectedPayout,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + (durationDays || 30) * 86400000).toISOString(),
    status: "HOLDING",
  };

  db.stockHoldings.unshift(holding);

  db.activities.unshift({
    id: "act_" + Date.now(),
    userId: user.id,
    title: "Stock Portfolio Bought",
    description: `Purchased ${shares} shares of ${symbol} (${name}) for $${investedAmount}`,
    amount: -Number(investedAmount),
    type: "stock",
    createdAt: new Date().toISOString(),
  });

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: user.id,
    message: `📈 Successfully invested $${investedAmount} in ${symbol} stock portfolio!`,
    read: false,
    type: "STOCK",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return res.status(201).json({ success: true, holding, newBalance: user.balance });
});

app.get("/api/stocks/holdings", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const holdings = db.stockHoldings.filter((s) => s.userId === auth.id);
  return res.json({ holdings });
});

// 3. BROKER & TRADING API
app.post("/api/broker/trade", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const { pair, type, amount, leverage, entryPrice, outcomeWin, profitAmount } = req.body;
  if (!amount || amount < 5) {
    return res.status(400).json({ error: "Minimum trade order amount is $5" });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIndex];
  if (!outcomeWin && user.balance < amount) {
    return res.status(400).json({ error: "Insufficient wallet balance for trade order" });
  }

  // Update user balance based on profit outcome
  user.balance += profitAmount;

  const order = {
    id: "trd_" + Date.now().toString(36),
    userId: user.id,
    pair,
    type,
    amount: Number(amount),
    leverage: leverage || 100,
    entryPrice: entryPrice || 1.0850,
    closePrice: outcomeWin ? entryPrice * 1.01 : entryPrice * 0.99,
    outcome: outcomeWin ? "WIN" : "LOSS",
    profit: profitAmount,
    createdAt: new Date().toISOString(),
  };

  db.tradeOrders.unshift(order);

  db.activities.unshift({
    id: "act_" + Date.now(),
    userId: user.id,
    title: outcomeWin ? "Trade Win!" : "Trade Loss",
    description: `${type} ${pair} at ${leverage}x leverage. Outcome: ${outcomeWin ? "+$" + profitAmount : "-$" + Math.abs(profitAmount)}`,
    amount: profitAmount,
    type: "trade",
    createdAt: new Date().toISOString(),
  });

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: user.id,
    message: outcomeWin
      ? `🎉 Trade Order Closed! You won +$${profitAmount} on ${pair}.`
      : `📉 Trade Order Closed. Loss of -$${Math.abs(profitAmount)} on ${pair}.`,
    read: false,
    type: "TRADE",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return res.status(201).json({ success: true, order, newBalance: user.balance });
});

app.get("/api/broker/history", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const orders = db.tradeOrders.filter((t) => t.userId === auth.id);
  return res.json({ orders });
});

// 4. SPIN THE WHEEL API
app.post("/api/games/spin", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const { betAmount, rewardWon, isFreeSpin } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIndex];
  const todayStr = new Date().toISOString().split("T")[0];

  let cost = Number(betAmount || 0);

  if (isFreeSpin) {
    if (user.lastFreeSpinDate === todayStr) {
      return res.status(400).json({ error: "Daily free spin already claimed today! Check back tomorrow or use paid spin." });
    }
    cost = 0;
    user.lastFreeSpinDate = todayStr;
  } else {
    if (cost < 2) {
      return res.status(400).json({ error: "Minimum paid spin bet is $2" });
    }
    if (user.balance < cost) {
      return res.status(400).json({ error: "Insufficient wallet balance to place spin bet" });
    }
    // Deduct bet amount for paid spin
    user.balance -= cost;
  }

  let prizeValue = 0;
  if (rewardWon.type === "CASH" || rewardWon.type === "GRAND" || rewardWon.type === "MEGA") {
    prizeValue = rewardWon.value;
    user.balance += prizeValue;
  } else if (rewardWon.type === "INSURANCE") {
    user.insuranceLevel = Math.max(user.insuranceLevel, 4);
  }

  db.activities.unshift({
    id: "act_" + Date.now(),
    userId: user.id,
    title: isFreeSpin ? "Daily Free Spin Claimed!" : "Wheel Spin Completed",
    description: isFreeSpin
      ? `FREE Spin -> Won: ${rewardWon.label}`
      : `Bet $${cost} on Wheel of Fortune -> Won: ${rewardWon.label}`,
    amount: prizeValue - cost,
    type: "spin",
    createdAt: new Date().toISOString(),
  });

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: user.id,
    message: `🎰 Wheel Spin Result: You won ${rewardWon.label}!`,
    read: false,
    type: "SPIN",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  const { password: _, ...cleanUser } = user;
  return res.json({ success: true, rewardWon, newBalance: user.balance, user: cleanUser });
});

// 5. DAILY TASKS & 30-DAY MILESTONES API
app.get("/api/tasks/list", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const user = db.users.find((u) => u.id === auth.id);
  const userId = auth.id;

  const claimedList = db.claimedTasks.filter((ct) => ct.userId === userId).map((ct) => ct.taskId);

  updateUserDailyStreak(user);
  writeDB(db);

  const userCreatedAt = user?.createdAt ? new Date(user.createdAt).getTime() : Date.now();
  const accountAgeDays = Math.max(1, Math.floor((Date.now() - userCreatedAt) / 86400000) + 1);
  const consecutiveDays = user?.consecutiveDays || 1;

  const totalDeposited = user?.totalDeposited || 0;
  const tradesCount = db.tradeOrders.filter((t) => t.userId === userId).length;
  const stockCount = db.stockHoldings.filter((s) => s.userId === userId).length;
  const totalStockVal = db.stockHoldings.filter((s) => s.userId === userId).reduce((a, c) => a + (c.currentValue || c.totalInvested || 0), 0);
  const botCount = (db.investments || []).filter((inv) => inv.userId === userId).length;
  const botHighCount = (db.investments || []).filter((inv) => inv.userId === userId && inv.amount >= 1000).length;
  const referralsCount = db.users.filter((u) => u.referredBy === userId || (user?.referralCode && u.referredBy === user.referralCode)).length;
  const spinCount = (db.activities || []).filter((act) => act.userId === userId && act.type === "spin").length;
  const insuranceLevel = user?.insuranceLevel || 0;
  const hasPin = !!user?.transactionPin;
  const isKyc = user?.kycStatus === "APPROVED";
  const userBalance = user?.balance || 0;
  const netWorth = userBalance + (db.investments || []).filter((i) => i.userId === userId && i.status === "ACTIVE").reduce((a, c) => a + c.amount, 0) + totalStockVal;
  const totalTradeVol = db.tradeOrders.filter((t) => t.userId === userId).reduce((a, c) => a + (c.amount || 0), 0);
  const totalYieldEarned = (db.investments || []).filter((i) => i.userId === userId).reduce((a, c) => a + (c.profitEarned || 0), 0);

  const rawTasks = [
    // Phase 1: Days 1-7 (Onboarding & Activation)
    { id: "tsk_kyc", day: 1, title: "Complete KYC Identity Verification", category: "SECURITY", description: "Submit state ID & selfie for full tier-1 account verification", rewardAmount: 5, requiredCount: 1, currentCount: isKyc ? 1 : 0 },
    { id: "tsk_pin", day: 1, title: "Set Up Security Transaction PIN", category: "SECURITY", description: "Set your 6-digit transaction PIN in profile settings", rewardAmount: 5, requiredCount: 1, currentCount: hasPin ? 1 : 0 },
    { id: "tsk_spin_1", day: 1, title: "First Fortune Wheel Spin", category: "DAILY", description: "Spin the daily Fortune Wheel for an instant cash reward", rewardAmount: 5, requiredCount: 1, currentCount: spinCount >= 1 ? 1 : 0 },
    { id: "tsk_dep_50", day: 2, title: "Starter Wallet Funding", category: "DEPOSIT", description: "Deposit at least $50 into your wallet balance", rewardAmount: 10, requiredCount: 1, currentCount: totalDeposited >= 50 ? 1 : 0 },
    { id: "tsk_dep_250", day: 2, title: "Growth Capital Deposit", category: "DEPOSIT", description: "Reach $250+ total capital deposited", rewardAmount: 15, requiredCount: 1, currentCount: totalDeposited >= 250 ? 1 : 0 },
    { id: "tsk_dep_1000", day: 3, title: "Premier Investor Deposit", category: "DEPOSIT", description: "Fund $1,000 or more to unlock HFT bot engines", rewardAmount: 30, requiredCount: 1, currentCount: totalDeposited >= 1000 ? 1 : 0 },
    { id: "tsk_trd_1", day: 3, title: "Execute First Market Trade", category: "TRADING", description: "Place 1 live order in Forex/CFD broker replica desk", rewardAmount: 5, requiredCount: 1, currentCount: tradesCount >= 1 ? 1 : 0 },
    { id: "tsk_trd_5", day: 4, title: "Execute 5 Market Trades", category: "TRADING", description: "Complete 5 market trade orders across forex or crypto pairs", rewardAmount: 15, requiredCount: 5, currentCount: tradesCount },
    { id: "tsk_trd_10", day: 5, title: "Execute 10 Market Trades", category: "TRADING", description: "Execute 10 market trades to master CFD order execution", rewardAmount: 25, requiredCount: 10, currentCount: tradesCount },
    { id: "tsk_bot_1", day: 6, title: "Deploy First Quant Yield Bot", category: "BOT", description: "Activate your first automated 30-day quantitative yield bot", rewardAmount: 10, requiredCount: 1, currentCount: botCount >= 1 ? 1 : 0 },
    { id: "tsk_bot_gold", day: 7, title: "Deploy Gold or Higher Bot", category: "BOT", description: "Deploy a Gold Prime Quant Bot ($1,000+ capital)", rewardAmount: 25, requiredCount: 1, currentCount: botHighCount >= 1 ? 1 : 0 },

    // Phase 2: Days 8-15 (Trading & Portfolio Growth)
    { id: "tsk_stk_1", day: 8, title: "Purchase Global Stock Equity", category: "STOCK", description: "Allocate funds into AAPL, NVDA, GOOGL, or BTC Trust stock index", rewardAmount: 10, requiredCount: 1, currentCount: stockCount >= 1 ? 1 : 0 },
    { id: "tsk_stk_500", day: 9, title: "Build $500 Stock Portfolio", category: "STOCK", description: "Hold $500 or more in global equities and index derivative trusts", rewardAmount: 20, requiredCount: 1, currentCount: totalStockVal >= 500 ? 1 : 0 },
    { id: "tsk_ins_1", day: 10, title: "Activate Insurance Shield Level 1", category: "INSURANCE", description: "Protect your capital with Level 1 Aegis Insurance shield", rewardAmount: 10, requiredCount: 1, currentCount: insuranceLevel >= 1 ? 1 : 0 },
    { id: "tsk_ins_3", day: 11, title: "Upgrade Insurance Aegis to Level 3", category: "INSURANCE", description: "Lock in Level 3 insurance coverage with 55% loss protection", rewardAmount: 25, requiredCount: 1, currentCount: insuranceLevel >= 3 ? 1 : 0 },
    { id: "tsk_spin_5", day: 12, title: "Spin Fortune Wheel 5 Times", category: "DAILY", description: "Spin the Fortune Wheel 5 separate times for daily rewards", rewardAmount: 15, requiredCount: 5, currentCount: spinCount },
    { id: "tsk_spin_10", day: 13, title: "Spin Fortune Wheel 10 Times", category: "DAILY", description: "Accumulate 10 Fortune Wheel spins to boost daily earnings", rewardAmount: 25, requiredCount: 10, currentCount: spinCount },
    { id: "tsk_ai_chat", day: 14, title: "Consult AI Financial Advisor", category: "ANALYTICS", description: "Engage with the Groq Quant Analyst AI for market strategies", rewardAmount: 5, requiredCount: 1, currentCount: 1 },
    { id: "tsk_briefing", day: 15, title: "Complete Daily Risk Assessment", category: "ANALYTICS", description: "Review daily volatility metrics & insurance coverage status", rewardAmount: 5, requiredCount: 1, currentCount: 1 },

    // Phase 3: Days 16-22 (Network & Capital Acceleration)
    { id: "tsk_ref_1", day: 16, title: "Refer First Investor Friend", category: "REFERRAL", description: "Share your referral link and onboard 1 active investor", rewardAmount: 15, requiredCount: 1, currentCount: referralsCount >= 1 ? 1 : 0 },
    { id: "tsk_ref_3", day: 17, title: "Refer 3 Active Investors", category: "REFERRAL", description: "Expand your syndicate network with 3 active investor referrals", rewardAmount: 35, requiredCount: 3, currentCount: referralsCount },
    { id: "tsk_ref_5", day: 18, title: "Build 5-Investor Network", category: "REFERRAL", description: "Build a 5-person referral team and earn network commissions", rewardAmount: 75, requiredCount: 5, currentCount: referralsCount },
    { id: "tsk_yield_50", day: 19, title: "Accumulate $50 Quant Bot Yield", category: "BOT", description: "Collect $50 or more in cumulative automated bot profits", rewardAmount: 20, requiredCount: 1, currentCount: totalYieldEarned >= 50 ? 1 : 0 },
    { id: "tsk_yield_200", day: 20, title: "Accumulate $200 Quant Bot Yield", category: "BOT", description: "Collect $200 or more in cumulative automated quant bot profits", rewardAmount: 40, requiredCount: 1, currentCount: totalYieldEarned >= 200 ? 1 : 0 },
    { id: "tsk_vol_1000", day: 21, title: "Reach $1,000 Trading Volume", category: "TRADING", description: "Trade $1,000 total volume in broker replica market orders", rewardAmount: 25, requiredCount: 1, currentCount: totalTradeVol >= 1000 ? 1 : 0 },
    { id: "tsk_vol_5000", day: 22, title: "Reach $5,000 Trading Volume", category: "TRADING", description: "Trade $5,000 total volume across crypto, stock, and forex pairs", rewardAmount: 50, requiredCount: 1, currentCount: totalTradeVol >= 5000 ? 1 : 0 },

    // Phase 4: Days 23-30 (Sovereign Mastery Apex)
    { id: "tsk_portfolio_1000", day: 25, title: "Maintain $1,000 Net Worth", category: "MILESTONE", description: "Build a total combined portfolio balance of $1,000+", rewardAmount: 30, requiredCount: 1, currentCount: netWorth >= 1000 ? 1 : 0 },
    { id: "tsk_portfolio_5000", day: 27, title: "Maintain $5,000 Sovereign Portfolio", category: "MILESTONE", description: "Reach $5,000+ total sovereign portfolio across wallet & bots", rewardAmount: 60, requiredCount: 1, currentCount: netWorth >= 5000 ? 1 : 0 },
    { id: "tsk_active_15", day: 15, title: "15-Day Active Investor Milestone", category: "MILESTONE", description: "Maintain 15 consecutive active days on Invest Different ecosystem", rewardAmount: 40, requiredCount: 15, currentCount: (accountAgeDays >= 15 && consecutiveDays >= 15) ? 15 : Math.min(consecutiveDays, accountAgeDays) },
    { id: "tsk_master_30", day: 30, title: "30-Day Master Investor Apex", category: "MILESTONE", description: "Master the 30-day investment cycle and claim your apex cash bonus", rewardAmount: 100, requiredCount: 30, currentCount: (accountAgeDays >= 30 && consecutiveDays >= 30) ? 30 : Math.min(consecutiveDays, accountAgeDays) },
  ];

  const result = rawTasks.map((t) => {
    const isUnlockedByAgeAndStreak = accountAgeDays >= t.day && consecutiveDays >= t.day;
    const actualCount = isUnlockedByAgeAndStreak ? t.currentCount : 0;
    const isCompleted = isUnlockedByAgeAndStreak && actualCount >= t.requiredCount;

    return {
      ...t,
      currentCount: actualCount,
      completed: isCompleted,
      claimed: claimedList.includes(t.id),
      unlockedByStreak: isUnlockedByAgeAndStreak,
    };
  });

  return res.json({
    tasks: result,
    consecutiveDays,
    accountAgeDays,
    lastActiveDate: user?.lastActiveDate,
  });
});

app.post("/api/tasks/claim/:taskId", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const taskId = req.params.taskId;
  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const alreadyClaimed = db.claimedTasks.some((ct) => ct.userId === auth.id && ct.taskId === taskId);
  if (alreadyClaimed) {
    return res.status(400).json({ error: "Task reward already claimed" });
  }

  // Dynamic reward lookup map
  const rewardMap: Record<string, number> = {
    tsk_kyc: 5,
    tsk_pin: 5,
    tsk_spin_1: 5,
    tsk_dep_50: 10,
    tsk_dep_250: 15,
    tsk_dep_1000: 30,
    tsk_trd_1: 5,
    tsk_trd_5: 15,
    tsk_trd_10: 25,
    tsk_bot_1: 10,
    tsk_bot_gold: 25,
    tsk_stk_1: 10,
    tsk_stk_500: 20,
    tsk_ins_1: 10,
    tsk_ins_3: 25,
    tsk_spin_5: 15,
    tsk_spin_10: 25,
    tsk_ai_chat: 5,
    tsk_briefing: 5,
    tsk_ref_1: 15,
    tsk_ref_3: 35,
    tsk_ref_5: 75,
    tsk_yield_50: 20,
    tsk_yield_200: 40,
    tsk_vol_1000: 25,
    tsk_vol_5000: 50,
    tsk_portfolio_1000: 30,
    tsk_portfolio_5000: 60,
    tsk_active_15: 40,
    tsk_master_30: 100,
  };

  const reward = rewardMap[taskId] || 10;

  db.users[userIndex].balance += reward;
  db.users[userIndex].updatedAt = new Date().toISOString();

  db.claimedTasks.push({
    userId: auth.id,
    taskId,
    claimedAt: new Date().toISOString(),
  });

  db.activities.unshift({
    id: "act_" + Date.now(),
    userId: auth.id,
    title: "30-Day Task Reward Claimed",
    description: `Claimed +$${reward}.00 cash reward credited directly to wallet balance`,
    amount: reward,
    type: "task",
    createdAt: new Date().toISOString(),
  });

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: auth.id,
    message: `🎉 Task Reward Claimed! +$${reward}.00 added to your profile balance.`,
    read: false,
    type: "TASK",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  const { password: _, ...cleanUser } = db.users[userIndex];
  return res.json({ success: true, reward, newBalance: db.users[userIndex].balance, user: cleanUser });
});

// 6. ACHIEVEMENTS API
app.get("/api/achievements/list", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const unlockedCodes = db.unlockedAchievements.filter((a) => a.userId === auth.id).map((a) => a.code);

  return res.json({ unlockedCodes });
});

// ------------------- ADMIN SUPERCONTROL ROUTES ------------------- //

function isAdmin(req: Request) {
  const auth = getAuthUser(req);
  return auth && (auth.role === "ADMIN" || auth.role === "SUPER_ADMIN");
}

app.get("/api/admin/stats", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const db = readDB();
  const totalUsers = db.users.length;
  const pendingDeposits = db.deposits.filter((d) => d.status === "PENDING").length;
  const pendingWithdrawals = db.withdrawals.filter((w) => w.status === "PENDING").length;
  const pendingKyc = db.users.filter((u) => u.kycStatus === "SUBMITTED").length;
  const totalDeposited = db.deposits
    .filter((d) => d.status === "CONFIRMED")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return res.json({
    totalUsers,
    pendingDeposits,
    pendingWithdrawals,
    pendingKyc,
    totalDeposited,
  });
});

app.get("/api/admin/withdrawals", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const db = readDB();
  return res.json({ withdrawals: db.withdrawals });
});

app.post("/api/admin/withdrawals/approve", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { withdrawalId } = req.body;
  const db = readDB();
  const wIndex = db.withdrawals.findIndex((w) => w.id === withdrawalId);
  if (wIndex === -1) return res.status(404).json({ error: "Withdrawal not found" });

  db.withdrawals[wIndex].status = "APPROVED";
  db.withdrawals[wIndex].processedAt = new Date().toISOString();

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: db.withdrawals[wIndex].userId,
    message: `✅ Your withdrawal of $${db.withdrawals[wIndex].amount} ($${db.withdrawals[wIndex].netAmount} net) has been APPROVED and sent to payout address!`,
    read: false,
    type: "WITHDRAWAL",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return res.json({ success: true, withdrawal: db.withdrawals[wIndex] });
});

app.post("/api/admin/withdrawals/reject", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { withdrawalId, reason } = req.body;
  const db = readDB();
  const wIndex = db.withdrawals.findIndex((w) => w.id === withdrawalId);
  if (wIndex === -1) return res.status(404).json({ error: "Withdrawal not found" });

  const withdrawal = db.withdrawals[wIndex];
  withdrawal.status = "REJECTED";

  // Refund user balance
  const userIndex = db.users.findIndex((u) => u.id === withdrawal.userId);
  if (userIndex !== -1) {
    db.users[userIndex].balance += withdrawal.amount;
  }

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: withdrawal.userId,
    message: `❌ Withdrawal request for $${withdrawal.amount} was rejected${reason ? `: ${reason}` : ""}. Funds refunded to balance.`,
    read: false,
    type: "WITHDRAWAL",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return res.json({ success: true });
});

app.get("/api/admin/users", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const db = readDB();
  const now = Date.now();
  const users = db.users.map((u) => {
    const lastActiveMs = u.lastActiveAt ? new Date(u.lastActiveAt).getTime() : 0;
    const isOnline = now - lastActiveMs < 300000; // Active within 5 minutes
    return {
      ...u,
      password: u.password ? "[PROTECTED PASSWORD SET]" : "[NO PASSWORD]",
      isOnline,
    };
  });
  return res.json({ users });
});

app.put("/api/admin/users/role", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { userId, role, balance, kycStatus, insuranceLevel, name, email, referralEarnings, transactionPin, password } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === userId);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const target = db.users[userIndex];
  if (role) target.role = role;
  if (name) target.name = name;
  if (email) target.email = email;
  if (balance !== undefined) target.balance = Number(balance);
  if (referralEarnings !== undefined) target.referralEarnings = Number(referralEarnings);
  if (kycStatus) target.kycStatus = kycStatus;
  if (insuranceLevel !== undefined) target.insuranceLevel = Number(insuranceLevel);
  if (transactionPin !== undefined) target.transactionPin = transactionPin;
  if (password) target.password = bcrypt.hashSync(password, 10);

  target.updatedAt = new Date().toISOString();

  writeDB(db);
  const { password: _, ...updatedUser } = target;
  return res.json({ success: true, user: updatedUser });
});

app.post("/api/admin/users/batch-edit", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { userIds, balanceDelta, role, kycStatus, insuranceLevel } = req.body;
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "No target users selected for batch action" });
  }

  const db = readDB();
  let updatedCount = 0;

  db.users.forEach((u) => {
    if (userIds.includes(u.id)) {
      if (balanceDelta !== undefined && !isNaN(Number(balanceDelta))) {
        u.balance = Math.max(0, u.balance + Number(balanceDelta));
      }
      if (role) u.role = role;
      if (kycStatus) u.kycStatus = kycStatus;
      if (insuranceLevel !== undefined) u.insuranceLevel = Number(insuranceLevel);
      u.updatedAt = new Date().toISOString();
      updatedCount++;
    }
  });

  writeDB(db);
  return res.json({ success: true, updatedCount });
});

app.post("/api/admin/withdrawals/customize", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { withdrawalId, amount, netAmount, payoutAddress } = req.body;
  const db = readDB();
  const wIndex = db.withdrawals.findIndex((w) => w.id === withdrawalId);
  if (wIndex === -1) return res.status(404).json({ error: "Withdrawal not found" });

  if (amount !== undefined) db.withdrawals[wIndex].amount = Number(amount);
  if (netAmount !== undefined) db.withdrawals[wIndex].netAmount = Number(netAmount);
  if (payoutAddress) db.withdrawals[wIndex].payoutAddress = payoutAddress;

  writeDB(db);
  return res.json({ success: true, withdrawal: db.withdrawals[wIndex] });
});

app.get("/api/admin/activities", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const db = readDB();
  return res.json({ activities: db.activities || [] });
});

app.get("/api/admin/deposits", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const db = readDB();
  return res.json({ deposits: db.deposits });
});

app.post("/api/admin/deposits/confirm", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const auth = getAuthUser(req);
  const { depositId } = req.body;

  const db = readDB();
  const depositIndex = db.deposits.findIndex((d) => d.id === depositId);
  if (depositIndex === -1) return res.status(404).json({ error: "Deposit not found" });

  const deposit = db.deposits[depositIndex];
  if (deposit.status === "CONFIRMED") {
    return res.status(400).json({ error: "Deposit already confirmed" });
  }

  deposit.status = "CONFIRMED";
  deposit.adminConfirmedBy = auth.id;
  deposit.confirmedAt = new Date().toISOString();

  const userIndex = db.users.findIndex((u) => u.id === deposit.userId);
  if (userIndex !== -1) {
    db.users[userIndex].balance += deposit.amount;
    db.users[userIndex].totalDeposited += deposit.amount;

    db.activities.unshift({
      id: "act_" + Date.now(),
      userId: deposit.userId,
      title: "Deposit Confirmed",
      description: `$${deposit.amount.toFixed(2)} deposit approved and credited to balance`,
      amount: deposit.amount,
      type: "deposit",
      createdAt: new Date().toISOString(),
    });

    db.notifications.unshift({
      id: "notif_" + Date.now(),
      userId: deposit.userId,
      message: `🎉 Great news! Your deposit of $${deposit.amount.toFixed(2)} has been confirmed and credited to your wallet.`,
      read: false,
      type: "DEPOSIT",
      createdAt: new Date().toISOString(),
    });
  }

  writeDB(db);
  return res.json({ success: true, deposit });
});

app.post("/api/admin/deposits/reject", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { depositId } = req.body;
  const db = readDB();
  const depositIndex = db.deposits.findIndex((d) => d.id === depositId);
  if (depositIndex === -1) return res.status(404).json({ error: "Deposit not found" });

  db.deposits[depositIndex].status = "REJECTED";

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: db.deposits[depositIndex].userId,
    message: `Your deposit request for $${db.deposits[depositIndex].amount} was rejected. Contact support if you need assistance.`,
    read: false,
    type: "DEPOSIT",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return res.json({ success: true });
});

app.get("/api/admin/kyc", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const db = readDB();
  const pendingUsers = db.users
    .filter((u) => u.kycStatus === "SUBMITTED" || u.kycIdPhoto)
    .map(({ password, ...u }) => u);

  return res.json({ kycList: pendingUsers });
});

app.post("/api/admin/kyc/approve", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { userId } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === userId);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  db.users[userIndex].kycStatus = "APPROVED";
  db.users[userIndex].kycApprovedAt = new Date().toISOString();

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId,
    message: "✅ Congratulations! Your KYC Identity Verification has been APPROVED.",
    read: false,
    type: "KYC",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return res.json({ success: true });
});

app.post("/api/admin/kyc/reject", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { userId, reason } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === userId);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  db.users[userIndex].kycStatus = "REJECTED";

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId,
    message: `❌ KYC Verification was rejected${reason ? `: ${reason}` : ""}. Please re-upload clear ID documents.`,
    read: false,
    type: "KYC",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return res.json({ success: true });
});

app.get("/api/settings", (req: Request, res: Response) => {
  const db = readDB();
  return res.json({ settings: db.systemSetting });
});

app.get("/api/admin/settings", (req: Request, res: Response) => {
  const db = readDB();
  return res.json({ settings: db.systemSetting });
});

app.post("/api/admin/settings", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const db = readDB();
  db.systemSetting = { ...db.systemSetting, ...req.body };
  writeDB(db);
  return res.json({ success: true, settings: db.systemSetting });
});

app.post("/api/admin/notifications/send", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { targetUserId, message, type } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const db = readDB();

  if (!targetUserId || targetUserId === "ALL") {
    db.users.forEach((u) => {
      db.notifications.unshift({
        id: "notif_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        userId: u.id,
        message,
        read: false,
        type: type || "ADMIN",
        createdAt: new Date().toISOString(),
      });
    });
  } else {
    // Lookup user by ID, email, or name to ensure message is mapped to actual user.id
    const targetQuery = String(targetUserId).trim().toLowerCase();
    const foundUser = db.users.find(
      (u) =>
        u.id === targetUserId ||
        u.email.toLowerCase() === targetQuery ||
        (u.name && u.name.toLowerCase() === targetQuery)
    );

    const recipientId = foundUser ? foundUser.id : targetUserId;

    db.notifications.unshift({
      id: "notif_" + Date.now(),
      userId: recipientId,
      message,
      read: false,
      type: type || "ADMIN",
      createdAt: new Date().toISOString(),
    });
  }

  writeDB(db);
  return res.json({ success: true });
});

// ------------------- INVESTMENTS & QUANT YIELD BOTS API ------------------- //

app.get("/api/investments", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const userInvestments = (db.investments || []).filter((inv: any) => inv.userId === auth.id);
  const now = Date.now();

  const enrichedInvestments = userInvestments.map((inv: any) => {
    const startMs = new Date(inv.startDate).getTime();
    const durationDays = inv.durationDays || 30;
    const durationHours = durationDays * 24;
    const elapsedMs = Math.max(0, now - startMs);
    const hoursElapsed = Math.min(durationHours, Math.floor(elapsedMs / (1000 * 60 * 60)));
    const daysElapsed = Math.min(durationDays, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));

    const totalProfitTarget = (inv.amount * inv.profitPercent) / 100;
    const dailyYieldRate = totalProfitTarget / durationDays;
    const hourlyYieldRate = totalProfitTarget / durationHours;

    // Minimum simulation accrued yield if active: guaranteed partial yield progress so user sees bot running
    const minHours = inv.status === "ACTIVE" ? Math.max(hoursElapsed, 6) : hoursElapsed;
    const accruedYield = Math.min(totalProfitTarget, Number((minHours * hourlyYieldRate).toFixed(4)));

    const alreadyHarvested = inv.claimedYield || inv.profitEarned || 0;
    const claimableYield = Math.max(0, Number((accruedYield - alreadyHarvested).toFixed(2)));
    const progressPercent = Math.min(100, Number(((minHours / durationHours) * 100).toFixed(1)));

    return {
      ...inv,
      totalProfitTarget: Number(totalProfitTarget.toFixed(2)),
      dailyYieldRate: Number(dailyYieldRate.toFixed(2)),
      hourlyYieldRate: Number(hourlyYieldRate.toFixed(4)),
      hoursElapsed: minHours,
      daysElapsed: Math.min(durationDays, Math.floor(minHours / 24)),
      accruedYield: Number(accruedYield.toFixed(2)),
      claimableYield,
      progressPercent,
    };
  });

  return res.json({ investments: enrichedInvestments });
});

app.post("/api/investments", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const { planType, amount, durationDays, profitPercent } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid investment amount" });
  }

  const db = readDB();
  const dbUser = db.users.find((u: any) => u.id === auth.id);
  if (!dbUser) return res.status(404).json({ error: "User not found" });

  if (dbUser.balance < amount) {
    return res.status(400).json({ error: "Insufficient wallet balance" });
  }

  dbUser.balance -= amount;
  dbUser.updatedAt = new Date().toISOString();

  const durDays = durationDays || 30;
  const newInvestment = {
    id: "inv_" + Date.now() + Math.random().toString(36).substring(2, 5),
    userId: dbUser.id,
    planType: planType || "Gold Prime Quant Bot",
    amount: Number(amount),
    durationDays: durDays,
    profitPercent: profitPercent || 13.5,
    profitEarned: 0,
    claimedYield: 0,
    status: "ACTIVE",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + durDays * 86400000).toISOString(),
  };

  if (!db.investments) db.investments = [];
  db.investments.unshift(newInvestment);

  db.activities.unshift({
    id: "act_" + Date.now(),
    userId: dbUser.id,
    title: "Quant Bot Deployed",
    description: `Deployed ${planType} with $${amount}.00 capital for ${durDays} days`,
    amount: -Number(amount),
    type: "investment",
    createdAt: new Date().toISOString(),
  });

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: dbUser.id,
    message: `🤖 Bot Deployed! ${planType} is active for ${durDays} days. Yields accumulate hourly!`,
    read: false,
    type: "INVESTMENT",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  const { password: _, ...cleanUser } = dbUser;
  return res.json({ success: true, newBalance: dbUser.balance, user: cleanUser, investment: newInvestment });
});

app.post("/api/investments/claim-yield/:investmentId", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const investmentId = req.params.investmentId;
  const db = readDB();
  const dbUser = db.users.find((u: any) => u.id === auth.id);
  if (!dbUser) return res.status(404).json({ error: "User not found" });

  const inv = (db.investments || []).find((i: any) => i.id === investmentId && i.userId === auth.id);
  if (!inv) return res.status(404).json({ error: "Active bot investment not found" });

  const now = Date.now();
  const startMs = new Date(inv.startDate).getTime();
  const durationDays = inv.durationDays || 30;
  const durationHours = durationDays * 24;
  const elapsedMs = Math.max(0, now - startMs);
  const hoursElapsed = Math.min(durationHours, Math.floor(elapsedMs / (1000 * 60 * 60)));
  const minHours = Math.max(hoursElapsed, 6);

  const totalProfitTarget = (inv.amount * inv.profitPercent) / 100;
  const hourlyYieldRate = totalProfitTarget / durationHours;
  const accruedYield = Math.min(totalProfitTarget, Number((minHours * hourlyYieldRate).toFixed(4)));

  const alreadyHarvested = inv.claimedYield || inv.profitEarned || 0;
  const claimable = Math.max(0, Number((accruedYield - alreadyHarvested).toFixed(2)));

  if (claimable <= 0) {
    return res.status(400).json({ error: "No uncollected yield available yet. Please check back later!" });
  }

  dbUser.balance += claimable;
  dbUser.updatedAt = new Date().toISOString();

  inv.claimedYield = Number((alreadyHarvested + claimable).toFixed(2));
  inv.profitEarned = inv.claimedYield;

  db.activities.unshift({
    id: "act_" + Date.now(),
    userId: dbUser.id,
    title: "Bot Yield Harvested",
    description: `Harvested +$${claimable.toFixed(2)} from ${inv.planType} directly into profile balance`,
    amount: claimable,
    type: "yield",
    createdAt: new Date().toISOString(),
  });

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: dbUser.id,
    message: `🤖 Yield Harvested! +$${claimable.toFixed(2)} credited directly to your profile balance.`,
    read: false,
    type: "YIELD",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  const { password: _, ...cleanUser } = dbUser;
  return res.json({
    success: true,
    harvestedAmount: claimable,
    newBalance: dbUser.balance,
    user: cleanUser,
    investment: inv,
  });
});

// ------------------- REFERRAL API ROUTES ------------------- //

app.get("/api/referral", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const dbUser = db.users.find((u: any) => u.id === auth.id);
  if (!dbUser) return res.status(404).json({ error: "User not found" });

  const referredUsers = db.users
    .filter(
      (u: any) =>
        u.referredBy === dbUser.id || (dbUser.referralCode && u.referredBy === dbUser.referralCode)
    )
    .map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      totalDeposited: u.totalDeposited || 0,
      createdAt: u.createdAt,
    }));

  return res.json({ referredUsers });
});

// ------------------- NOTIFICATIONS API ROUTES ------------------- //

app.get("/api/notifications", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const userNotifs = (db.notifications || []).filter((n: any) => n.userId === auth.id);
  return res.json({ notifications: userNotifs });
});

const handleMarkNotificationsRead = (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  (db.notifications || []).forEach((n: any) => {
    if (n.userId === auth.id) {
      n.read = true;
    }
  });

  writeDB(db);
  return res.json({ success: true });
};

app.put("/api/notifications/read", handleMarkNotificationsRead);
app.post("/api/notifications/read", handleMarkNotificationsRead);

// Catch-all API 404 handler to guarantee valid JSON responses for missing API endpoints
app.all("/api/*", (req: Request, res: Response) => {
  return res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
});

// Start Express + Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
