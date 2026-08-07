import React, { useState } from "react";
import { BookOpen, Calendar, Clock, User, ArrowRight, X, Sparkles, Tag } from "lucide-react";
import { BlogPost } from "@/types";

const INITIAL_POSTS: BlogPost[] = [
  {
    id: "blog_01",
    title: "Understanding Quantitative Arbitrage in Modern Crypto Markets",
    excerpt: "How high-frequency algorithmic models capitalize on cross-exchange price spreads without directional market risk.",
    category: "QUANT TRADING",
    readTime: "5 min read",
    date: "May 20, 2025",
    author: "Dr. Elena Rostova",
    image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&auto=format&fit=crop&q=80",
    content: `Quantitative arbitrage relies on sophisticated algorithmic models that continuously scan dozens of global liquidity venues simultaneously. By identifying microsecond price discrepancies between spot and derivatives markets, automated execution engines capture guaranteed profit margins before market equilibrium is restored.

Key advantages of institutional arbitrage:
1. Low Directional Exposure: Profits are generated regardless of whether Bitcoin or Ethereum moves up or down.
2. Automated Risk Controls: Stop-loss shields and slippage limits protect capital against sudden volatility spikes.
3. Compound Yield Distribution: Daily returns are reinvested directly into active algorithmic pools to maximize exponential growth.`
  },
  {
    id: "blog_02",
    title: "The Insurance Aegis Shield: Capital Protection Explained",
    excerpt: "Discover how Tier-1 liquidity reserve pools safeguard user principal during severe market downturns.",
    category: "RISK SHIELD",
    readTime: "4 min read",
    date: "May 18, 2025",
    author: "Marcus Thorne",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80",
    content: `In financial markets, preserving capital is the prerequisite to achieving sustainable long-term yield. The Insurance Aegis protocol maintains an independent multi-asset reserve pool funded by a fraction of platform protocol fees.

When a user activates Level 1 to Level 4 Insurance Aegis coverage:
- Coverage Floor: Up to 80% of invested principal is guaranteed against catastrophic trading drawdowns.
- Profit Shield: Accrued daily yield is protected against market slippage.
- Instant Claim Authorization: Claims are automatically disbursed to wallet balances upon policy maturity.`
  },
  {
    id: "blog_03",
    title: "Global Stock Indices vs. Automated Bot Portfolios: Performance Benchmark",
    excerpt: "A comparative analysis between traditional S&P 500 indexing and AI-driven daily yield allocation.",
    category: "PORTFOLIO STRATEGY",
    readTime: "6 min read",
    date: "May 12, 2025",
    author: "Alistair Vance",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80",
    content: `While traditional stock index funds like the S&P 500 or Nasdaq 100 deliver historical averages of 8-10% annually, automated multi-asset yield strategies offer daily compounding liquidity that adapts dynamically to macroeconomic interest rates and volatility cycles.`
  },
  {
    id: "blog_04",
    title: "5 Golden Rules of Crypto Wallet Security & Gas Fee Optimization",
    excerpt: "Essential guidelines to protect your digital asset keys while minimizing blockchain gas fee overheads.",
    category: "SECURITY",
    readTime: "3 min read",
    date: "May 05, 2025",
    author: "Samantha Lin",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
    content: `Security is non-negotiable. Always verify destination wallet addresses, enable two-factor authentication, and monitor real-time network gas fees before executing large USDT transactions.`
  }
];

export function BlogView() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Market Research & Insights
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Invest Different Knowledge Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Institutional research, algorithmic analysis, and market strategy guides.
          </p>
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INITIAL_POSTS.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  {post.category}
                </span>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {post.readTime}
                  </span>
                </div>

                <h2 className="text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-800/60 mt-auto">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> {post.author}
              </span>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                Read Article <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase">
                {selectedPost.category}
              </span>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1.5 text-slate-400 hover:text-white transition rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {selectedPost.title}
            </h2>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>By {selectedPost.author}</span>
              <span>•</span>
              <span>{selectedPost.date}</span>
              <span>•</span>
              <span>{selectedPost.readTime}</span>
            </div>

            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className="w-full h-56 rounded-2xl object-cover border border-slate-800"
            />

            <div className="text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed whitespace-pre-line font-normal">
              {selectedPost.content}
            </div>

            <button
              onClick={() => setSelectedPost(null)}
              className="w-full gold-gradient py-3 rounded-xl text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Close Article
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
