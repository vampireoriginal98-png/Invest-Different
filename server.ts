import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GoogleGenAI } from "@google/genai";
import firebaseConfigJson from "./firebase-applet-config.json";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "invest-different-super-secret-key-2026";

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Firebase Client Initialization for Server Persistence
let firestoreDb: any = null;
try {
  const fbApp = getApps().length === 0 ? initializeApp({
    apiKey: firebaseConfigJson.apiKey,
    authDomain: firebaseConfigJson.authDomain,
    projectId: firebaseConfigJson.projectId,
    storageBucket: firebaseConfigJson.storageBucket,
    messagingSenderId: firebaseConfigJson.messagingSenderId,
    appId: firebaseConfigJson.appId,
  }) : getApp();
  firestoreDb = getFirestore(fbApp, firebaseConfigJson.firestoreDatabaseId || "(default)");
  console.log("🔥 Firestore initialized on server!");
} catch (e) {
  console.error("Firestore init warning:", e);
}

// File-based persistent storage helper
const DB_FILE = path.join(process.cwd(), "db.json");

async function syncToFirestore(data: any) {
  if (!firestoreDb) return;
  try {
    const docRef = doc(firestoreDb, "app_state", "main_db");
    const sanitizedUsers = (data.users || []).map((u: any) => {
      const userCopy = { ...u };
      delete userCopy.password;
      delete userCopy.transactionPin;
      return userCopy;
    });

    const payload = JSON.parse(JSON.stringify({
      users: sanitizedUsers,
      systemSetting: data.systemSetting || {},
      activities: (data.activities || []).slice(0, 50),
      updatedAt: new Date().toISOString(),
    }));

    await setDoc(docRef, payload);
  } catch (e) {
    console.error("Firestore sync error:", e);
  }
}

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
  socialLinks: any[];
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
    socialLinks: [],
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
    if (!parsed.socialLinks) parsed.socialLinks = [];
    return parsed;
  } catch (e) {
    console.error("DB Read Error:", e);
    return getInitialDB();
  }
}

function writeDB(data: DBData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    syncToFirestore(data).catch(() => {});
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

// ------------------- AUTH API ROUTES ------------------- //

app.post("/api/auth/register", (req: Request, res: Response) => {
  const { name, email, password, referralCode: inputRefCode } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = readDB();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "An account with this email already exists" });
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

app.post("/api/user/social-link", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const { platform, handleOrUrl } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIndex];
  if (!user.linkedSocials) user.linkedSocials = {};
  user.linkedSocials[platform] = handleOrUrl;

  // Add to admin review queue
  if (!db.socialLinks) db.socialLinks = [];
  db.socialLinks.unshift({
    id: "soc_" + Date.now(),
    userId: user.id,
    userName: user.name || user.email,
    userEmail: user.email,
    platform: String(platform),
    handleOrUrl: String(handleOrUrl),
    status: "PENDING",
    createdAt: new Date().toISOString(),
  });

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: user.id,
    message: `📱 Link request for ${platform} submitted! Admin will verify and credit your $5 bonus.`,
    read: false,
    type: "GENERAL",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  const { password: _, ...userWithoutPassword } = user;
  return res.json({ success: true, user: userWithoutPassword });
});

// Admin Social Links Queue
app.get("/api/admin/social-links/pending", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const db = readDB();
  const pending = (db.socialLinks || []).filter((s) => s.status === "PENDING");
  return res.json({ socialLinks: pending });
});

app.post("/api/admin/social-links/review", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { id, action } = req.body;
  const db = readDB();
  const link = (db.socialLinks || []).find((s) => s.id === id);
  if (!link) return res.status(404).json({ error: "Social link request not found" });

  link.status = action === "approve" ? "APPROVED" : "REJECTED";

  if (action === "approve") {
    const userIndex = db.users.findIndex((u) => u.id === link.userId);
    if (userIndex !== -1) {
      db.users[userIndex].balance += 5; // $5 reward
      db.activities.unshift({
        id: "act_" + Date.now(),
        userId: link.userId,
        title: "Social Link Approved",
        description: `+$5 reward credited for verifying ${link.platform}`,
        amount: 5,
        type: "task",
        createdAt: new Date().toISOString(),
      });
      db.notifications.unshift({
        id: "notif_" + Date.now(),
        userId: link.userId,
        message: `🎉 Your ${link.platform} social link was approved! +$5 reward credited to your balance.`,
        read: false,
        type: "GENERAL",
        createdAt: new Date().toISOString(),
      });
    }
  } else {
    db.notifications.unshift({
      id: "notif_" + Date.now(),
      userId: link.userId,
      message: `❌ Your ${link.platform} social link verification was rejected.`,
      read: false,
      type: "GENERAL",
      createdAt: new Date().toISOString(),
    });
  }

  writeDB(db);
  return res.json({ success: true });
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

  const { betAmount, rewardWon } = req.body;
  if (!betAmount || betAmount < 2) {
    return res.status(400).json({ error: "Minimum spin bet is $2" });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === auth.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  const user = db.users[userIndex];
  if (user.balance < betAmount) {
    return res.status(400).json({ error: "Insufficient wallet balance to place spin bet" });
  }

  // Deduct bet amount
  user.balance -= Number(betAmount);

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
    title: "Wheel Spin Completed",
    description: `Bet $${betAmount} on Wheel of Fortune -> Won: ${rewardWon.label}`,
    amount: prizeValue - betAmount,
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
  return res.json({ success: true, rewardWon, newBalance: user.balance });
});

// 5. DAILY TASKS API
app.get("/api/tasks/list", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const user = db.users.find((u) => u.id === auth.id);

  const claimedList = db.claimedTasks.filter((ct) => ct.userId === auth.id).map((ct) => ct.taskId);

  const tasks = [
    { id: "tsk_kyc", title: "Complete KYC Verification", description: "Submit state ID & selfie verification", rewardAmount: 5, requiredCount: 1, currentCount: user?.kycStatus === "APPROVED" ? 1 : 0 },
    { id: "tsk_dep", title: "First Capital Deposit", description: "Deposit at least $50 into wallet balance", rewardAmount: 10, requiredCount: 1, currentCount: (user?.totalDeposited || 0) >= 50 ? 1 : 0 },
    { id: "tsk_trd", title: "First Market Trade", description: "Execute 1 trade in Forex/Broker replica", rewardAmount: 5, requiredCount: 1, currentCount: db.tradeOrders.filter((t) => t.userId === auth.id).length >= 1 ? 1 : 0 },
    { id: "tsk_ref", title: "Refer an Investor", description: "Refer 1 investor with a confirmed deposit", rewardAmount: 20, requiredCount: 1, currentCount: db.users.filter((u) => u.referredBy === auth.id).length >= 1 ? 1 : 0 },
    { id: "tsk_stk", title: "Stock Investor", description: "Buy $500 or more in global stock index", rewardAmount: 15, requiredCount: 1, currentCount: db.stockHoldings.filter((s) => s.userId === auth.id).length >= 1 ? 1 : 0 },
  ];

  const result = tasks.map((t) => ({
    ...t,
    completed: t.currentCount >= t.requiredCount,
    claimed: claimedList.includes(t.id),
  }));

  return res.json({ tasks: result });
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

  // Determine reward
  const rewardMap: Record<string, number> = {
    tsk_kyc: 5,
    tsk_dep: 10,
    tsk_trd: 5,
    tsk_ref: 20,
    tsk_stk: 15,
  };

  const reward = rewardMap[taskId] || 5;

  db.users[userIndex].balance += reward;

  db.claimedTasks.push({
    userId: auth.id,
    taskId,
    claimedAt: new Date().toISOString(),
  });

  db.activities.unshift({
    id: "act_" + Date.now(),
    userId: auth.id,
    title: "Daily Task Claimed",
    description: `Claimed +$${reward} task bonus reward`,
    amount: reward,
    type: "task",
    createdAt: new Date().toISOString(),
  });

  db.notifications.unshift({
    id: "notif_" + Date.now(),
    userId: auth.id,
    message: `🎁 Task Claimed! +$${reward} bonus credited to wallet balance.`,
    read: false,
    type: "TASK",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return res.json({ success: true, reward, newBalance: db.users[userIndex].balance });
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
  const users = db.users.map(({ password, ...u }) => u);
  return res.json({ users });
});

app.put("/api/admin/users/role", (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden: Admin access required" });

  const { userId, role, balance, kycStatus, insuranceLevel } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.id === userId);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  if (role) db.users[userIndex].role = role;
  if (balance !== undefined) db.users[userIndex].balance = Number(balance);
  if (kycStatus) db.users[userIndex].kycStatus = kycStatus;
  if (insuranceLevel !== undefined) db.users[userIndex].insuranceLevel = Number(insuranceLevel);
  db.users[userIndex].updatedAt = new Date().toISOString();

  writeDB(db);
  const { password: _, ...updatedUser } = db.users[userIndex];
  return res.json({ success: true, user: updatedUser });
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

  if (targetUserId === "ALL") {
    db.users.forEach((u) => {
      db.notifications.unshift({
        id: "notif_" + Date.now() + Math.random().toString(36).substring(2, 4),
        userId: u.id,
        message,
        read: false,
        type: type || "ADMIN",
        createdAt: new Date().toISOString(),
      });
    });
  } else {
    db.notifications.unshift({
      id: "notif_" + Date.now(),
      userId: targetUserId,
      message,
      read: false,
      type: type || "ADMIN",
      createdAt: new Date().toISOString(),
    });
  }

  writeDB(db);
  return res.json({ success: true });
});

// ------------------- INVESTMENTS API ROUTES ------------------- //

app.get("/api/investments", (req: Request, res: Response) => {
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const userInvestments = (db.investments || []).filter((inv: any) => inv.userId === auth.id);
  return res.json({ investments: userInvestments });
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

  const newInvestment = {
    id: "inv_" + Date.now() + Math.random().toString(36).substring(2, 5),
    userId: dbUser.id,
    planType: planType || "Bot Yield Plan",
    amount: Number(amount),
    durationDays: durationDays || 30,
    profitPercent: profitPercent || 10,
    profitEarned: 0,
    status: "ACTIVE",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + (durationDays || 30) * 86400000).toISOString(),
  };

  if (!db.investments) db.investments = [];
  db.investments.unshift(newInvestment);

  writeDB(db);
  return res.json({ success: true, newBalance: dbUser.balance, investment: newInvestment });
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
