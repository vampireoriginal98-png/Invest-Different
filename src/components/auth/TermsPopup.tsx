import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { ShieldCheck, FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export function TermsPopup() {
  const { showTermsModal, acceptTerms, user } = useAuthStore();
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showTermsModal) return null;

  const handleAccept = async () => {
    if (!agreed1 || !agreed2) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("invest_token");
      await fetch("/api/user/accept-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.error("Terms accept sync error:", e);
    } finally {
      setIsSubmitting(false);
      acceptTerms();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl gold-gradient text-slate-950 shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wide">
              Terms of Service & Investor Protection
            </h2>
            <p className="text-xs text-amber-400 font-semibold">
              Action Required to Access Your Institutional Account
            </p>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 max-h-48 overflow-y-auto text-xs text-slate-300 space-y-3 leading-relaxed">
          <p className="font-bold text-slate-100">
            Welcome to Invest Different. By continuing, you confirm compliance with institutional platform rules:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-400">
            <li>Digital assets and financial portfolios are subject to market volatility and risk parameters.</li>
            <li>KYC Identity Verification is required prior to processing large capital withdrawals.</li>
            <li>All deposit transactions must be confirmed on the respective blockchain network before allocation.</li>
            <li>Insurance Aegis policies protect specified percentage brackets according to selected coverage tiers.</li>
            <li>You agree to keep your transaction password and login credentials confidential.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition">
            <input
              type="checkbox"
              checked={agreed1}
              onChange={(e) => setAgreed1(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-xs text-slate-300">
              I have read, understood, and agree to the <strong className="text-amber-300">Terms of Service</strong>, <strong className="text-amber-300">Privacy Policy</strong>, and <strong className="text-amber-300">Risk Disclosure Statement</strong>.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition">
            <input
              type="checkbox"
              checked={agreed2}
              onChange={(e) => setAgreed2(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-xs text-slate-300">
              I certify that I am at least 18 years of age and authorized to operate a digital investment portfolio in my jurisdiction.
            </span>
          </label>
        </div>

        <button
          onClick={handleAccept}
          disabled={!agreed1 || !agreed2 || isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl gold-gradient py-3.5 px-6 text-slate-950 font-black text-sm uppercase tracking-wider disabled:opacity-40 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer shadow-lg shadow-amber-500/20"
        >
          <span>{isSubmitting ? "Saving..." : "Accept & Enter Ecosystem"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
