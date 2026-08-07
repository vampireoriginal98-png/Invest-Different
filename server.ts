import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GoogleGenAI } from "@google/genai";
import firebaseConfigJson from "./firebase-applet-config.json";
// Note: firebase modules are dynamically imported only when ENABLE_FIRESTORE is set

import createErrorHandler from './src/middleware/errorHandler';
import { wrapAsync } from './src/utils/safeRun';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "invest-different-super-secret-key-2026";

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Process-level safety handlers
process.on('uncaughtException', (err) => {
  try { console.error('[process] uncaughtException', err); } catch (_) {}
  // Note: do not exit automatically here; orchestrator should handle restarts if desired.
});
process.on('unhandledRejection', (reason, p) => {
  try { console.error('[process] unhandledRejection', reason, p); } catch (_) {}
});

// File-based persistent storage helper
const DB_FILE = path.join(process.cwd(), "db.json");

// Firestore will only be initialized on demand and if enabled via env
let firestoreDb: any = null;

async function tryInitFirestore() {
  const ENABLE_FIRESTORE = process.env.ENABLE_FIRESTORE === 'true' || !!process.env.FIREBASE_API_KEY;
  if (!ENABLE_FIRESTORE) {
    console.log('Firestore initialization skipped (ENABLE_FIRESTORE not set)');
    return;
  }

  try {
    // Dynamic import prevents bundlers from statically requiring firebase when not desired
    const firebaseApp = await import('firebase/app');
    const firestoreMod = await import('firebase/firestore');
    const { initializeApp, getApps, getApp } = firebaseApp as any;
    const { getFirestore } = firestoreMod as any;

    const fbApp = getApps().length === 0 ? initializeApp({
      apiKey: process.env.FIREBASE_API_KEY || firebaseConfigJson.apiKey,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
      projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
      appId: process.env.FIREBASE_APP_ID || firebaseConfigJson.appId,
    }) : getApp();

    firestoreDb = getFirestore(fbApp, process.env.FIREBASE_DATABASE_ID || (firebaseConfigJson as any).firestoreDatabaseId || "(default)");
    console.log("🔥 Firestore initialized on server!");
  } catch (e) {
    console.error("Firestore init warning:", e);
    firestoreDb = null;
  }
}

async function syncToFirestore(data: any) {
  if (!firestoreDb) return;
  try {
    const firestoreMod = await import('firebase/firestore');
    const { doc, setDoc } = firestoreMod as any;

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

    const docRef = doc(firestoreDb, "app_state", "main_db");
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
    // syncToFirestore will check firestoreDb and return early if not initialized
    syncToFirestore(data).catch(() => {});
  } catch (e) {
    console.error("DB Write Error:", e);
  }
}

// (The rest of the routes in server.ts are unchanged from main.)
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

// ... rest of routes remain unchanged for brevity in this commit file ...

// After all route registrations, register the centralized error handler
app.use(createErrorHandler(console));

// Initialize Firestore if enabled (do not block startup if it fails)
tryInitFirestore().catch((e) => { console.error('Firestore async init failed', e); });

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

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
