import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, Copy, Check, Gift, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export function ReferralTree() {
  const { user, systemSetting } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const refCode = user?.referralCode || "INV8888";
  const refLink = `${window.location.origin}/register?ref=${refCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-400" />
          <CardTitle>Referral Program & Rewards</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-slate-300">
          Invite friends to Invest Different. Earn{" "}
          <strong className="text-amber-400">{systemSetting.referralBonusPercent}% instant bonus</strong> when
          they make a deposit of $80 or more!
        </p>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Your Unique Invite Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={refLink}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
            />
            <Button size="sm" variant="gold" onClick={copyLink}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Referred</span>
            <span className="text-xl font-bold text-slate-100">0 Investors</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Bonus Earned</span>
            <span className="text-xl font-bold text-emerald-400">$0.00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
