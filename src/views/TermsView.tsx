import React, { useState } from "react";
import { ShieldCheck, FileText, Lock, AlertTriangle, Cookie } from "lucide-react";

export function TermsView() {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy" | "risk" | "cookies">("terms");

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 py-4">
      {/* Tab Selectors */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: "terms", label: "Terms of Service", icon: FileText },
          { id: "privacy", label: "Privacy Policy", icon: Lock },
          { id: "risk", label: "Risk Disclosure", icon: AlertTriangle },
          { id: "cookies", label: "Cookie Policy", icon: Cookie },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === t.id
                ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <t.icon className="w-4 h-4 text-amber-400" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Document Body */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 text-xs text-slate-300 leading-relaxed font-normal">
        {activeTab === "terms" && (
          <div className="space-y-4">
            <h1 className="text-xl font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Master Terms of Service & Investor Agreement
            </h1>
            <p>
              Last Updated: May 2025. By accessing or using the Invest Different ecosystem, web application, automated yield bots, brokerage replica tools, or digital wallet services, you enter into a legally binding agreement.
            </p>

            <h3 className="font-extrabold text-amber-300 text-sm">1. Account Eligibility & KYC Compliance</h3>
            <p>
              Users must be at least 18 years of age or the legal age of majority in their jurisdiction. Identity verification (KYC) documentation, including government-issued photo ID and proof of selfie, may be requested prior to processing capital payouts exceeding standard thresholds.
            </p>

            <h3 className="font-extrabold text-amber-300 text-sm">2. Deposits, Wallet Mechanics & Confirmations</h3>
            <p>
              Deposits are credited to user balances upon confirmation on the relevant blockchain network or manual admin validation. Users are strictly responsible for sending funds to the correct wallet address (USDT TRC20/ERC20, BTC).
            </p>

            <h3 className="font-extrabold text-amber-300 text-sm">3. Yield Accumulation & Insurance Aegis</h3>
            <p>
              Bot Yield Plans calculate daily returns based on specified algorithmic targets. Insurance Aegis policies cover loss brackets specified at the level of activation.
            </p>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-4">
            <h1 className="text-xl font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Global Privacy & Data Protection Policy
            </h1>
            <p>
              Invest Different adheres to strict data privacy principles equivalent to GDPR standards. User emails, identity credentials, and transaction histories are stored in encrypted cold vaults and never sold to third parties.
            </p>
          </div>
        )}

        {activeTab === "risk" && (
          <div className="space-y-4">
            <h1 className="text-xl font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              High-Risk Financial Disclosure Statement
            </h1>
            <p>
              Trading digital assets, foreign exchange contracts, derivative orders, and stock indices involves substantial risk of loss. Historical performance does not guarantee future results. Never invest capital you cannot afford to lose.
            </p>
          </div>
        )}

        {activeTab === "cookies" && (
          <div className="space-y-4">
            <h1 className="text-xl font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Cookie & Session Policy
            </h1>
            <p>
              We use strictly necessary session cookies and token authentication to maintain user security, enable theme preferences, and protect active sessions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
