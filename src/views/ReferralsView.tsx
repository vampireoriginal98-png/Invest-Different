import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Copy, Check, Users, Gift, Share2, Award, ArrowUpRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export function ReferralsView() {
  const { user, systemSetting } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [referredList, setReferredList] = useState<any[]>([]);

  const refCode = user?.referralCode || "INV8888";
  const refLink = `${window.location.origin}/register?ref=${refCode}`;

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const res = await fetch("/api/referral", {
          headers: { Authorization: `Bearer ${localStorage.getItem("invest_token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.referredUsers) setReferredList(data.referredUsers);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchReferrals();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast.success("Referral invite link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Referral Network & Commissions</h1>
        <p className="text-xs md:text-sm text-slate-400">
          Share your referral link to earn instant cash bonuses when your network deposits and invests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-purple-500/30 bg-slate-900/90">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-400" />
              <CardTitle>Invite Investors & Earn Instant Bonus</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xs text-slate-300 leading-relaxed">
              For every investor who registers using your code and completes a deposit of $80 or more, you receive an instant{" "}
              <strong className="text-amber-400">{systemSetting.referralBonusPercent}% bonus credit</strong> directly to your withdrawal wallet.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Your Unique Invite URL
              </label>
              <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={refLink}
                  className="bg-transparent text-xs text-slate-200 font-mono flex-1 focus:outline-none"
                />
                <Button size="sm" variant="gold" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Referral Code</span>
                <span className="text-xl font-black text-amber-400">{refCode}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Commission Rate</span>
                <span className="text-xl font-black text-emerald-400">{systemSetting.referralBonusPercent}% Instant</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestone Card */}
        <Card className="border-slate-800 bg-slate-900/90 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <CardTitle className="text-lg">Network Stats</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Total Referred Investors</span>
              <p className="text-2xl font-extrabold text-white">{referredList.length} Accounts</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Total Commissions Paid</span>
              <p className="text-2xl font-extrabold text-emerald-400">$0.00</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referred Investors List */}
      <Card>
        <CardHeader>
          <CardTitle>Referred Investor Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Deposit Status</th>
                  <th className="p-3">Total Deposited</th>
                  <th className="p-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {referredList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">
                      No referred users found yet. Share your link to start earning!
                    </td>
                  </tr>
                ) : (
                  referredList.map((ref) => (
                    <tr key={ref.id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-semibold text-slate-100">{ref.name || ref.email}</td>
                      <td className="p-3">
                        {ref.totalDeposited >= 80 ? (
                          <span className="text-emerald-400 font-bold">✓ Qualified ($80+)</span>
                        ) : (
                          <span className="text-amber-400 font-medium">Pending $80 Deposit</span>
                        )}
                      </td>
                      <td className="p-3 font-mono">{formatCurrency(ref.totalDeposited || 0)}</td>
                      <td className="p-3 text-slate-400">{formatDate(ref.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
