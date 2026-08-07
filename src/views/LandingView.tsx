import React, { useState, useEffect } from "react";
import {
  Zap,
  TrendingUp,
  Shield,
  Award,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  BarChart2,
  Lock,
  Globe,
  Star,
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CandlestickChart,
  Wallet,
  Building2,
  HelpCircle,
  Clock,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

interface LandingViewProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onNavigateTab?: (tab: string) => void;
}

const MEDIA_LOGOS = [
  { name: "Forbes", label: "FORBES TECH" },
  { name: "Bloomberg", label: "BLOOMBERG MARKETS" },
  { name: "CoinDesk", label: "COINDESK INSIGHTS" },
  { name: "TechCrunch", label: "TECHCRUNCH" },
  { name: "Reuters", label: "REUTERS FINANCE" },
  { name: "Yahoo! Finance", label: "YAHOO FINANCE" },
];

const CAROUSEL_SLIDES = [
  {
    title: "Automated Bot Yield Engines",
    subtitle: "Algorithmic multi-asset arbitrage producing stable daily compounding yields.",
    tag: "PORTFOLIO DASHBOARD",
    image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1000&auto=format&fit=crop&q=80",
    stats: "+2.4% Daily Yield • Instant Compound",
  },
  {
    title: "Institutional Brokerage Replica",
    subtitle: "Execute Forex, Crypto, and Index CFD orders with 100x leverage and zero spreads.",
    tag: "LIVE BROKER DESK",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1000&auto=format&fit=crop&q=80",
    stats: "0.0 Spreads • Real-Time Order Book",
  },
  {
    title: "Insurance Aegis Shield",
    subtitle: "Tier-1 capital protection vaults safeguarding up to 80% principal against volatility.",
    tag: "CAPITAL PROTECTION",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1000&auto=format&fit=crop&q=80",
    stats: "$50,000,000 Aegis Reserve Pool",
  },
  {
    title: "Wall Street Stock Portfolios",
    subtitle: "Fractional shares in Apple, NVIDIA, Tesla & global technology index baskets.",
    tag: "EQUITY PORTFOLIOS",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1000&auto=format&fit=crop&q=80",
    stats: "24/7 Fractional Trading & Dividends",
  },
  {
    title: "Crypto Settlement Vaults",
    subtitle: "Multi-currency USDT TRC20/ERC20, BTC, and ETH deposits with instant wallet crediting.",
    tag: "INSTANT SETTLEMENT",
    image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=1000&auto=format&fit=crop&q=80",
    stats: "Zero Processing Fees • Gas Fee Shield",
  },
  {
    title: "AI Quant Market Engine",
    subtitle: "Deep neural network analysis scanning 1,200 asset pairs for high-probability signals.",
    tag: "AI QUANT DESK",
    image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1000&auto=format&fit=crop&q=80",
    stats: "94.2% AI Accuracy Ratio",
  },
];

const RECENT_ACTIVITY_FEED = [
  { name: "Elena V.", country: "🇪🇸 Spain", action: "Withdrew $2,450.00 USDT", time: "2 min ago" },
  { name: "Marcus K.", country: "🇩🇪 Germany", action: "Activated Gold Bot Plan ($5,000)", time: "5 min ago" },
  { name: "David S.", country: "🇬🇧 UK", action: "Won $1,000 on Wheel Spin", time: "8 min ago" },
  { name: "Aarav P.", country: "🇮🇳 India", action: "Purchased Apple Stock Portfolio", time: "12 min ago" },
  { name: "Sophia M.", country: "🇺🇸 USA", action: "Level 4 Insurance Activated", time: "15 min ago" },
];

const INVESTMENT_PLANS = [
  {
    name: "Starter Yield",
    min: 10,
    max: 499,
    rate: "1.2%",
    period: "30 Days",
    badge: "BEGINNER",
    features: ["Daily Compound Yield", "USDT / BTC Deposits", "Standard Support", "Basic Insurance"],
  },
  {
    name: "Silver Growth",
    min: 500,
    max: 2499,
    rate: "1.8%",
    period: "30 Days",
    badge: "POPULAR",
    features: ["Daily Compound Yield", "Level 1 Insurance Included", "Stock Portfolio Access", "Priority Support"],
  },
  {
    name: "Gold Institutional",
    min: 2500,
    max: 9999,
    rate: "2.5%",
    period: "30 Days",
    badge: "FEATURED",
    features: ["Daily Compound Yield", "Level 2 Insurance Included", "Broker Leverage 100x", "Dedicated Account Officer"],
  },
  {
    name: "Diamond Sovereign",
    min: 10000,
    max: 100000,
    rate: "3.5%",
    period: "30 Days",
    badge: "VIP SOVEREIGN",
    features: ["Daily Compound Yield", "Level 4 Insurance Aegis (80%)", "Direct Quant Desk Access", "Custom Profit Payouts"],
  },
];

const TESTIMONIALS = [
  {
    name: "Liam O'Connor",
    country: "☘️ Ireland",
    role: "Private Investor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "The daily yield compounding paired with the Insurance Aegis shield gives me complete confidence. Withdrawals hit my USDT wallet in minutes.",
    profit: "+$18,450 Earned",
  },
  {
    name: "Amina Al-Mansoor",
    country: "🇦🇪 UAE",
    role: "Hedge Fund Analyst",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "The execution speed on the broker replica and quantitative arbitrage bots outperforms standard retail platforms by a wide margin.",
    profit: "+$42,100 Earned",
  },
  {
    name: "Carlos Rivera",
    country: "🇲🇽 Mexico",
    role: "Tech Entrepreneur",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "Started with the Silver plan and upgraded to Diamond within 2 months. Unmatched reliability and institutional support.",
    profit: "+$27,800 Earned",
  },
];

const FAQS = [
  {
    category: "Getting Started",
    q: "How does Invest Different generate daily yields for investors?",
    a: "Invest Different deploys proprietary quantitative arbitrage bots across major cryptocurrency exchanges, forex liquidity pools, and stock index derivatives to capture microsecond price spreads and interest differentials.",
  },
  {
    category: "Wallet & Deposits",
    q: "What cryptocurrency deposit methods are accepted?",
    a: "We accept USDT (TRC20 & ERC20 networks), Bitcoin (BTC), and Ethereum (ETH). All deposits are automatically tracked on-chain or processed via admin review.",
  },
  {
    category: "Withdrawals",
    q: "What is the minimum withdrawal amount and processing speed?",
    a: "The minimum withdrawal is $50. Payouts are processed 24/7 following security verification and dispatched directly to your designated external crypto wallet.",
  },
  {
    category: "Security & Insurance",
    q: "How does the Insurance Aegis capital shield protect my principal?",
    a: "Insurance Aegis is backed by a $50,000,000 reserve pool. Depending on your active insurance tier, up to 80% of your principal is guaranteed against catastrophic market drawdowns.",
  },
];

export function LandingView({ onGetStarted, onLogin, onNavigateTab }: LandingViewProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [calcAmount, setCalcAmount] = useState(2500);

  // Auto slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const calculatedDaily = (calcAmount * 0.025).toFixed(2);
  const calculatedMonthly = (calcAmount * 0.75).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-4 py-2 text-center text-slate-950 font-extrabold text-xs tracking-wider flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
        <span>STAGE 2 LIVE: Multi-Asset Trading, Insurance Aegis, Stock Portfolios & AI Market Engine Active!</span>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient shadow-lg shadow-amber-500/20">
            <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wide bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              INVEST DIFFERENT
            </span>
            <span className="block text-[9px] font-bold text-amber-400 uppercase tracking-widest">
              Institutional Capital Platform
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-300">
          <a href="#plans" className="hover:text-amber-400 transition">Bot Yield Plans</a>
          <a href="#preview" className="hover:text-amber-400 transition">Platform Preview</a>
          <a href="#insurance" className="hover:text-amber-400 transition">Insurance Aegis</a>
          <a href="#testimonials" className="hover:text-amber-400 transition">Reviews</a>
          <a href="#faq" className="hover:text-amber-400 transition">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 hover:border-amber-500/50 hover:text-white transition text-xs font-bold cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 rounded-xl gold-gradient text-slate-950 font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition cursor-pointer shadow-lg shadow-amber-500/20"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center space-y-6 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300">
            <Award className="w-4 h-4 text-amber-400" /> Rated #1 Quantitative Investment Platform 2025
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
            Invest Different. <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Earn Institutional Yield Daily.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Automated multi-asset arbitrage, stock portfolio indices, real-time brokerage execution, and $50M Insurance Aegis capital protection — all in one sovereign platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onGetStarted}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-2xl gold-gradient text-slate-950 font-black text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition cursor-pointer shadow-xl shadow-amber-500/25"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLogin}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-800 bg-slate-900/90 text-slate-200 hover:border-amber-500/40 hover:text-white transition text-sm font-bold cursor-pointer"
            >
              <span>Sign In To Platform</span>
            </button>
          </div>
        </div>

        {/* Live Stat Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
          {[
            { label: "Active Investors", value: "52,783+" },
            { label: "Total Traded Volume", value: "$2.4 Billion" },
            { label: "Average Daily ROI", value: "2.4%" },
            { label: "Trustpilot Rating", value: "4.8 / 5.0 ★" },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-white">{stat.value}</h3>
              <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* As Seen On Strip */}
      <section className="border-y border-slate-800/80 bg-slate-950/60 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 shrink-0">
            AS FEATURED IN
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400 font-black text-sm tracking-wider">
            {MEDIA_LOGOS.map((media, i) => (
              <span key={i} className="hover:text-amber-400 transition cursor-default">
                {media.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Live Activity Ticker Feed */}
      <section className="bg-slate-900/50 border-b border-slate-800/80 py-3 overflow-hidden">
        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap text-xs font-semibold">
          {RECENT_ACTIVITY_FEED.map((act, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0 bg-slate-900 border border-slate-800 rounded-full px-4 py-1 text-slate-300">
              <span className="text-amber-400 font-bold">{act.name}</span>
              <span className="text-slate-500">({act.country})</span>
              <span className="text-emerald-400 font-bold">{act.action}</span>
              <span className="text-[10px] text-slate-500">• {act.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Preview Carousel */}
      <section id="preview" className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
            <BarChart2 className="w-3.5 h-3.5 text-amber-400" /> Interactive Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Institutional Technology Preview
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Experience the full depth of our automated quantitative tools, stock index portfolios, and risk management shields.
          </p>
        </div>

        <div className="relative bg-slate-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {CAROUSEL_SLIDES[slideIndex].tag}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {CAROUSEL_SLIDES[slideIndex].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {CAROUSEL_SLIDES[slideIndex].subtitle}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {CAROUSEL_SLIDES[slideIndex].stats}
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 mr-2">
                    {CAROUSEL_SLIDES.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setSlideIndex(dotIdx)}
                        className={`h-2.5 rounded-full transition-all cursor-pointer ${
                          slideIndex === dotIdx ? "w-7 bg-amber-400" : "w-2.5 bg-slate-700 hover:bg-slate-500"
                        }`}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setSlideIndex((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500/40 text-slate-300 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSlideIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length)}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500/40 text-slate-300 transition cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="relative h-64 lg:h-auto min-h-[320px]">
              <img
                src={CAROUSEL_SLIDES[slideIndex].image}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Bot Yield Investment Plans Showcase */}
      <section id="plans" className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> High-Yield Bot Packages
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Select Your Capital Tier
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Daily compounding yield deposited directly into your secure wallet balance.
          </p>
        </div>

        {/* Interactive Yield Calculator */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider text-center">
            Interactive Yield Calculator
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-extrabold text-slate-300">
              <span>Investment Principal: ${calcAmount.toLocaleString()}</span>
              <span className="text-amber-400">Rate: 2.5% / day</span>
            </div>
            <input
              type="range"
              min="100"
              max="50000"
              step="100"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Daily Profit</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">+${calculatedDaily}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated 30-Day Total</span>
              <p className="text-xl sm:text-2xl font-black text-amber-400">+${calculatedMonthly}</p>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INVESTMENT_PLANS.map((plan, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all duration-200 hover:-translate-y-1 shadow-xl"
            >
              <div className="space-y-4">
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                  {plan.badge}
                </span>

                <div>
                  <h3 className="text-lg font-black text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-amber-400">{plan.rate}</span>
                    <span className="text-xs text-slate-400 font-semibold">/ day</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <p>Min Deposit: <strong className="text-slate-200">${plan.min}</strong></p>
                  <p>Max Deposit: <strong className="text-slate-200">${plan.max.toLocaleString()}</strong></p>
                  <p>Duration: <strong className="text-slate-200">{plan.period}</strong></p>
                </div>

                <ul className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={onGetStarted}
                className="w-full gold-gradient py-3 rounded-xl text-slate-950 font-black text-xs uppercase tracking-wider hover:scale-[1.02] transition cursor-pointer"
              >
                Invest Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Verified Investor Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Trusted by 50,000+ Investors Globally
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="h-12 w-12 rounded-2xl object-cover border border-amber-500/40" />
                <div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-[11px] text-slate-400">{t.role} • {t.country}</p>
                </div>
              </div>

              <div className="flex text-amber-400 gap-0.5 text-xs">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{t.comment}"
              </p>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-extrabold text-emerald-400">
                <span>Verified Return</span>
                <span>{t.profit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Clear Answers
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-amber-300 transition cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-5 h-5 text-amber-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-4 md:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-10 md:p-16 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-56 w-56 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Ready to Start Earning Institutional Yield?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Create your account in 30 seconds. Fund your wallet with USDT or Bitcoin and activate your first yield package.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl gold-gradient text-slate-950 font-black text-sm uppercase tracking-wider hover:scale-105 transition cursor-pointer shadow-xl shadow-amber-500/25"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 pt-12 pb-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800/60 text-xs text-slate-400">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="font-black text-white text-base">INVEST DIFFERENT</span>
            </div>
            <p className="leading-relaxed">
              Your gateway to sovereign algorithmic yield, stock index portfolios, and capital insurance protection.
            </p>
            <p className="text-[11px] text-slate-500">
              Regulated Financial Entity • Seychelles License SY-88912
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase tracking-wider mb-3">Ecosystem</h4>
            <ul className="space-y-2">
              <li><a href="#plans" className="hover:text-amber-400 transition">Bot Yield Plans</a></li>
              <li><a href="#preview" className="hover:text-amber-400 transition">Broker Replica</a></li>
              <li><a href="#insurance" className="hover:text-amber-400 transition">Insurance Aegis</a></li>
              <li><a href="#preview" className="hover:text-amber-400 transition">Stock Portfolios</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase tracking-wider mb-3">Institutional</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigateTab && onNavigateTab("about")} className="hover:text-amber-400 transition cursor-pointer">About Us</button></li>
              <li><button onClick={() => onNavigateTab && onNavigateTab("blog")} className="hover:text-amber-400 transition cursor-pointer">Market Insights & Blog</button></li>
              <li><button onClick={() => onNavigateTab && onNavigateTab("contact")} className="hover:text-amber-400 transition cursor-pointer">24/7 Desk Support</button></li>
              <li><button onClick={() => onNavigateTab && onNavigateTab("terms")} className="hover:text-amber-400 transition cursor-pointer">Legal & Regulatory</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white uppercase tracking-wider mb-3">Headquarters</h4>
            <p className="leading-relaxed">
              Global Financial House, Suite 402<br />
              Victoria, Seychelles
            </p>
            <p className="mt-2 text-amber-400 font-bold">support@investdifferent.com</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Invest Different. All rights reserved.</p>
          <div className="flex gap-4">
            <button onClick={() => onNavigateTab && onNavigateTab("terms")} className="hover:text-slate-300">Terms of Service</button>
            <button onClick={() => onNavigateTab && onNavigateTab("terms")} className="hover:text-slate-300">Privacy Policy</button>
            <button onClick={() => onNavigateTab && onNavigateTab("terms")} className="hover:text-slate-300">Risk Disclosure</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
