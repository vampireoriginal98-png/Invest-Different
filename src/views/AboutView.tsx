import React from "react";
import { Shield, Building2, Globe2, Award, Users, CheckCircle2, TrendingUp, Sparkles, ArrowRight, Zap } from "lucide-react";

const TEAM_MEMBERS = [
  {
    name: "Alistair & Ethan Vance",
    role: "Founders & Genius Twin Architects",
    bio: "Outstanding genius twin visionaries from Houston, Texas. Developed high-frequency quantitative arbitrage engines in association with Google AI & Tesla engineering.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    badge: "Houston Twins (Founders)",
  },
  {
    name: "Dr. Elena Rostova",
    role: "Chief Technology Officer",
    bio: "PhD in Machine Learning & Quantitative Arbitrage from ETH Zürich. Led AI trading systems at Swiss Capital Labs.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    badge: "Quant Lead",
  },
  {
    name: "Marcus Thorne",
    role: "Head of Risk & Insurance Aegis",
    bio: "Certified Financial Risk Manager (FRM). Pioneer in algorithmic loss-shielding protocols and liquidity insurance reserves.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    badge: "Risk Architect",
  },
  {
    name: "Samantha Lin",
    role: "Global Compliance Officer",
    bio: "12+ years in international fintech regulatory frameworks across EU, UK, and APAC financial centers.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
    badge: "Legal Director",
  },
];

export function AboutView() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-300 py-4">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-slate-900 border border-amber-500/30 p-8 md:p-12 overflow-hidden text-center space-y-4">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300">
          <Building2 className="w-4 h-4 text-amber-400" /> Houston, Texas Innovation Hub
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Redefining Capital Yield Through Genius Engineering
        </h1>
        <p className="max-w-3xl mx-auto text-sm md:text-base text-slate-300 leading-relaxed font-normal">
          Founded by outstanding genius twins from Houston, Texas in association with Google, sponsored by Tesla, SpaceX/X, and premier stock market organizations. "Earn at home is the new future — this isn't a course, but an effort-rewarding quantitative system."
        </p>

        {/* Official Sponsorship Emblems */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-bold text-white">
            <span className="text-amber-400 font-black">Google</span>
            <span className="text-[10px] text-slate-400 uppercase">Associate Partner</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-bold text-white">
            <span className="text-rose-400 font-black">Tesla</span>
            <span className="text-[10px] text-slate-400 uppercase">Strategic Sponsor</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-bold text-white">
            <span className="text-slate-100 font-black">X (Twitter)</span>
            <span className="text-[10px] text-slate-400 uppercase">Viral Distribution</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-bold text-white">
            <span className="text-emerald-400 font-black">Houston HQ</span>
            <span className="text-[10px] text-slate-400 uppercase">Texas, USA</span>
          </div>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Global Investors", value: "52,783+", icon: Users },
          { label: "Total Traded Capital", value: "$2.4 Billion", icon: TrendingUp },
          { label: "Countries Served", value: "142 Countries", icon: Globe2 },
          { label: "Insurance Coverage Pool", value: "$50,000,000", icon: Shield },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-2">
            <stat.icon className="w-6 h-6 text-amber-400 mx-auto" />
            <h3 className="text-xl md:text-2xl font-black text-white">{stat.value}</h3>
            <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Leadership Team Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">
            Executive Leadership & Houston Visionaries
          </h2>
          <p className="text-xs text-slate-400">
            Guided by veteran Houston twin architects, machine learning quant leads, and risk specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM_MEMBERS.map((member, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-3 hover:border-amber-500/30 transition">
              <img
                src={member.image}
                alt={member.name}
                className="h-28 w-28 rounded-2xl object-cover mx-auto border border-slate-700 shadow-md"
              />
              <div>
                <span className="inline-block rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 mb-1">
                  {member.badge}
                </span>
                <h3 className="text-base font-bold text-white">{member.name}</h3>
                <p className="text-xs text-amber-400 font-semibold">{member.role}</p>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Licensing & Regulatory Guarantee */}
      <div className="bg-slate-900/90 border border-amber-500/20 rounded-3xl p-8 space-y-4 text-center">
        <Award className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-lg font-black text-white uppercase tracking-wider">
          Licensed & Regulated Infrastructure
        </h3>
        <p className="max-w-2xl mx-auto text-xs text-slate-300 leading-relaxed">
          Invest Different operates under strict financial compliance frameworks, maintaining multi-signature cold storage vaults, independent annual audit verifications, and Tier-1 liquidity insurance reserves.
        </p>
      </div>
    </div>
  );
}
