# Project Architectural Guidelines & Operational Rules

## Environment & Build Rules
- **Port**: Always bind dev & production server to port `3000` (`0.0.0.0:3000`).
- **Build Output**: `npm run build` compiles Vite frontend assets and bundles `server.ts` into a CommonJS bundle at `dist/server.cjs`.
- **Start Script**: `npm start` executes `node dist/server.cjs`.

## Features Scope
1. **Notifications & Direct Messaging**: Super Admin messages route through `/api/admin/notifications/send` and match user by `id`, `email`, or `name`.
2. **Admin SuperControl**: Contains horizontal navigation row and dynamic dropdown selector for all management views (Overview, Deposits, Withdrawals, KYC, Socials, Users, Direct Messages, System Settings).
3. **Daily Free Rewards**: All free daily rewards (Spin Wheel, Daily Bonus) do not deduct wallet balance.
4. **Actual Stocks & Insurance Shields**: STOCKS_CATALOG includes AAPL, NVDA, TSLA, MSFT, GOOGL, META, SPY, QQQ, GOLD, BTC Trust with duration calculations. Insurance Aegis provides Level 1-4 shields.
