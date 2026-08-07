import React from "react";
import { useAuthStore } from "@/store/authStore";
import { ShieldAlert, ArrowRight, CheckCircle2, Clock } from "lucide-react";

export function KYCHoverAlert() {
  const { user, setCurrentTab } = useAuthStore();
  if (!user || user.kycStatus === "APPROVED") return null;

  const isSubmitted = user.kycStatus === "SUBMITTED";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/50 p-4 shadow-xl shadow-amber-500/10 mb-6 group animate-pulse-subtle">
      {/* Background Glowing Orb */}
      <div className="absolute -right-10 -top-10 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            isSubmitted
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : "bg-amber-500/20 border-amber-400 text-amber-300 animate-bounce"
          }`}>
            {isSubmitted ? (
              <Clock className="w-5 h-5" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white tracking-wide">
                {isSubmitted ? "KYC Verification Under Review" : "Identity Verification Required (Compulsory)"}
              </h4>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                isSubmitted
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-red-500/20 text-red-300 border-red-500/40"
              }`}>
                {isSubmitted ? "PENDING REVIEW" : "ACTION REQUIRED"}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {isSubmitted
                ? "Your KYC documents have been submitted to compliance and are currently pending Admin review. Full withdrawal features will unlock automatically once approved."
                : "You must complete your KYC Identity Verification to unlock deposits, bot deployments, market trading, and referral commissions."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentTab("kyc")}
          className="gold-gradient text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-110 transition shrink-0 flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <span>{isSubmitted ? "View Status" : "Verify Account Now"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
