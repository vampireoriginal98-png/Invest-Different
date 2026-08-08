import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ActivityLog } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, TrendingUp, ShieldCheck, Gift, Activity, Clock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface ActivityFeedProps {
  activities?: ActivityLog[];
}

export function ActivityFeed({ activities: propsActivities }: ActivityFeedProps) {
  const { token } = useAuthStore();
  const [items, setItems] = useState<ActivityLog[]>(propsActivities || []);
  const [loading, setLoading] = useState(!propsActivities);

  useEffect(() => {
    if (propsActivities) {
      setItems(propsActivities);
      return;
    }
    fetchRealActivities();
  }, [token, propsActivities]);

  const fetchRealActivities = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/user/activity", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.activities || []);
      }
    } catch (e) {
      console.error("Failed to fetch activity history:", e);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
      case "withdrawal":
        return <ArrowDownRight className="w-4 h-4 text-rose-400" />;
      case "investment":
        return <TrendingUp className="w-4 h-4 text-amber-400" />;
      case "kyc":
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      case "referral":
        return <Gift className="w-4 h-4 text-purple-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <CardTitle>Account Activity Log</CardTitle>
        </div>
        <button
          onClick={fetchRealActivities}
          className="text-slate-400 hover:text-amber-400 transition cursor-pointer"
          title="Refresh History"
        >
          <Clock className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading activity history...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <p className="font-semibold text-slate-400">No activity recorded yet</p>
            <p>Your deposit approvals, yield dividends, withdrawals, and trade positions will appear here.</p>
          </div>
        ) : (
          items.map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  {getIcon(act.type)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">{act.title}</p>
                  <p className="text-[11px] text-slate-400 leading-tight">{act.description}</p>
                  <span className="text-[10px] text-slate-500 font-mono">{formatDate(act.createdAt)}</span>
                </div>
              </div>

              {act.amount !== undefined && (
                <div className="text-right font-bold text-xs shrink-0 font-mono">
                  <span className={act.amount >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {act.amount >= 0 ? "+" : ""}{formatCurrency(act.amount)}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
