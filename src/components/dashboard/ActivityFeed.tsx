import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ActivityLog } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowUpRight, TrendingUp, ShieldCheck, Gift, Activity } from "lucide-react";

interface ActivityFeedProps {
  activities?: ActivityLog[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const defaultActivities: ActivityLog[] = [
    {
      id: "act_1",
      userId: "u1",
      title: "Deposit Approved",
      description: "$1,000.00 USDT deposit confirmed by admin",
      amount: 1000,
      type: "deposit",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "act_2",
      userId: "u1",
      title: "Gold Plan Investment",
      description: "Allocated $1,000 to Gold Yield Plan (12.5% monthly)",
      amount: -1000,
      type: "investment",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "act_3",
      userId: "u1",
      title: "Daily Profit Credited",
      description: "Automated daily yield dividend credited",
      amount: 4.16,
      type: "investment",
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  const list = activities && activities.length > 0 ? activities : defaultActivities;

  const getIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <CardTitle>Recent Activity Feed</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {list.map((act) => (
          <div
            key={act.id}
            className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                {getIcon(act.type)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{act.title}</p>
                <p className="text-xs text-slate-400">{act.description}</p>
                <span className="text-[10px] text-slate-500">{formatDate(act.createdAt)}</span>
              </div>
            </div>

            {act.amount !== undefined && (
              <div className="text-right font-bold text-sm">
                <span className={act.amount >= 0 ? "text-emerald-400" : "text-slate-300"}>
                  {act.amount >= 0 ? "+" : ""}{formatCurrency(act.amount)}
                </span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
