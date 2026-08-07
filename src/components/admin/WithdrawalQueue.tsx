import React, { useState } from "react";
import { Withdrawal } from "@/types";
import { CheckCircle2, XCircle, ArrowUpRight, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  withdrawals?: Withdrawal[];
  onRefresh?: () => void;
}

export function WithdrawalQueue({ withdrawals: externalWithdrawals, onRefresh }: Props) {
  const [internalWithdrawals, setInternalWithdrawals] = useState<Withdrawal[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch("/api/admin/withdrawals", {
        headers: { Authorization: `Bearer ${localStorage.getItem("invest_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInternalWithdrawals(data.withdrawals || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    if (!externalWithdrawals) {
      fetchWithdrawals();
    }
  }, [externalWithdrawals]);

  const withdrawals = externalWithdrawals || internalWithdrawals;
  const triggerRefresh = onRefresh || fetchWithdrawals;

  const handleApprove = async (withdrawalId: string) => {
    setLoadingId(withdrawalId);
    try {
      const res = await fetch("/api/admin/withdrawals/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
        body: JSON.stringify({ withdrawalId }),
      });

      if (!res.ok) throw new Error("Approval failed");
      toast.success("✅ Withdrawal approved and marked processed!");
      triggerRefresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to approve withdrawal");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    setLoadingId(withdrawalId);
    try {
      const res = await fetch("/api/admin/withdrawals/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
        body: JSON.stringify({ withdrawalId }),
      });

      if (!res.ok) throw new Error("Rejection failed");
      toast.success("❌ Withdrawal rejected and refunded to user balance.");
      triggerRefresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to reject withdrawal");
    } finally {
      setLoadingId(null);
    }
  };

  const pending = withdrawals.filter((w) => w.status === "PENDING");

  return (
    <div className="space-y-4">
      {pending.length === 0 ? (
        <div className="p-8 border border-slate-800 rounded-2xl text-center text-slate-400 text-sm">
          No pending withdrawal requests in queue.
        </div>
      ) : (
        pending.map((w) => (
          <div
            key={w.id}
            className="p-5 border border-slate-800 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-white">{w.userName || w.userEmail}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  ${w.amount} Gross (${w.netAmount} Net)
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">Address: {w.payoutAddress}</p>
              <p className="text-[11px] text-slate-500">Asset: {w.cryptoAsset} | Gas Deducted: ${w.gasFeeDeducted}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleApprove(w.id)}
                disabled={loadingId === w.id}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Payout
              </button>
              <button
                onClick={() => handleReject(w.id)}
                disabled={loadingId === w.id}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 transition cursor-pointer"
              >
                <XCircle className="w-4 h-4" /> Reject & Refund
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
