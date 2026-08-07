# Investment & Trading Engine Platform - Deployment & Operations Guide

A full-stack algorithmic trading, bot investment, stock portfolio, and capital protection platform built with Express, Vite, React, and Tailwind CSS.

---

## 🚀 Deployment Guide: Railway & Render

This application is packaged with a single-file bundled server (`dist/server.cjs`) and Vite SPA frontend build pipeline, making it ready for instant deployment on cloud providers like **Railway**, **Render**, **Fly.io**, or **Cloud Run**.

---

### Option A: Deploying on Railway

1. **Connect GitHub Repository**:
   - Log in to your [Railway Dashboard](https://railway.app/).
   - Click **+ New Project** -> **Deploy from GitHub repo**.
   - Select this repository.

2. **Configure Build & Start Settings**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `/` (default)

3. **Set Required Environment Variables** (in Railway Settings -> Variables):
   ```env
   PORT=3000
   NODE_ENV=production
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Deploy**:
   - Railway will run `npm run build` and launch `node dist/server.cjs`.
   - Your public domain will be generated under Railway's service network.

---

### Option B: Deploying on Render

1. **Create Web Service**:
   - Log in to [Render Dashboard](https://dashboard.render.com/).
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository.

2. **Fill Instance Configuration**:
   - **Name**: `trading-platform-engine`
   - **Environment**: `Node`
   - **Region**: Select your preferred region (e.g., Oregon, Frankfurt).
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

3. **Add Environment Variables**:
   In the **Environment** tab, add:
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
   - `GROQ_API_KEY`: *(Optional)* Your Groq API key for AI Bot generation
   - `GEMINI_API_KEY`: *(Optional)* Your Gemini API key

4. **Deploy**:
   - Render will build static assets into `/dist` and start the Express CommonJS bundle on port 3000.

---

## 🛠️ Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`.

3. **Build & Test Production Server Locally**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔑 Key Features Overview

- **Quant Yield Bot Engine**: Automated yield bots with tiered returns, real-time live trading chart feeds, and bot deployment.
- **Stock & Index ETF Portfolios**: Actual stock equities (AAPL, NVDA, TSLA, MSFT, GOOGL, META, SPY, QQQ, GOLD, BTC Trust).
- **Insurance Aegis Shields**: Tiered protection levels shielding bot yields and equity drawdowns against market liquidations.
- **Admin SuperControl Suite**: Manage user KYC verification, process deposits and withdrawals queue, dispatch user direct messages, update system wallets, and upload payment QR codes.
- **Spin Wheel & Daily Rewards**: Free daily spin instance and deposit rewards.
- **Theme & Screen Responsiveness**: Auto-fits to mobile, tablet, and ultra-wide screens with dark/light mode toggle.
