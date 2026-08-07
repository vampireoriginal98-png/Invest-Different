import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Sparkles, Check, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function InvestmentPreview() {
  const { setCurrentTab } = useAuthStore();

  const plans = [
    {
      name: "Bronze Starter",
      min: 50,
      monthly: 8.5,
      duration: "30 Days",
      popular: false,
      badge: "Beginner",
    },
    {
      name: "Silver Growth",
      min: 250,
      monthly: 10.5,
      duration: "30 Days",
      popular: false,
      badge: "Steady",
    },
    {
      name: "Gold Prime",
      min: 1000,
      monthly: 13.5,
      duration: "30 Days",
      popular: true,
      badge: "Most Popular",
    },
  ];

  return (
    <Card className="h-full border-amber-500/20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <CardTitle>Investment Portfolio Plans</CardTitle>
        </div>
        <button
          onClick={() => setCurrentTab("investments")}
          className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium"
        >
          View All Plans <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border transition-all ${
              plan.popular
                ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/5"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm">{plan.name}</span>
                <Badge variant={plan.popular ? "gold" : "info"}>{plan.badge}</Badge>
              </div>
              <span className="text-xs font-bold text-emerald-400">+{plan.monthly}% / month</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
              <span>Min Capital: <strong className="text-slate-200">{formatCurrency(plan.min)}</strong></span>
              <span>Duration: <strong className="text-slate-200">{plan.duration}</strong></span>
            </div>
          </div>
        ))}

        <Button
          variant="gold"
          className="w-full mt-2 flex items-center justify-center gap-2"
          onClick={() => setCurrentTab("investments")}
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Start Yield Investment</span>
        </Button>
      </CardContent>
    </Card>
  );
}
