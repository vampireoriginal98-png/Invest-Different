import React, { useState } from "react";
import { Withdrawal } from "@/types";
import { CheckCircle2, XCircle, ArrowUpRight, DollarSign, Edit3, ShieldAlert } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

interface Props {
  withdrawals?: Withdrawal[];
  onRefresh?: () => void;
}

export function WithdrawalQueue({ withdrawals: externalWithdrawals, onRefresh }: Props) {
  const [internalWithdrawals, setInternalWithdrawals] = useState<Withdrawal[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Customize Modal State
  const [customizingWithdrawal, setCustomizingWithdrawal] = useState<Withdrawal | null>(null);
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [customNetAmount, setCustomNetAmount] = useState<number>(0);
  const [customAddress, setCustomAddress] = useState<string>("");

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

  const openCustomizeModal = (w: Withdrawal) => {
    setCustomizingWithdrawal(w);
    setCustomAmount(w.amount);
    setCustomNetAmount(w.netAmount);
    setCustomAddress(w.payoutAddress);
  };

  const handleSaveCustomization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customizingWithdrawal) return;

    try {
      const res = await fetch("/api/admin/withdrawals/customize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
        body: JSON.stringify({
          withdrawalId: customizingWithdrawal.id,
          amount: customAmount,
          netAmount: customNetAmount,
          payoutAddress: customAddress,
        }),
      });

      if (!res.ok) throw new Error("Customization failed");
      toast.success("Withdrawal details customized!");
      setCustomizingWithdrawal(null);
      triggerRefresh();
    } catch (e: any) {
      toast.error(e.message || "Customization failed");
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
                <span className="font-bold text-white text-sm">{w.userName || w.userEmail}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  ${w.amount} Gross (${w.netAmount} Net)
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {w.source || "Balance"}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">Payout Address: {w.payoutAddress}</p>
              <p className="text-[11px] text-slate-500">Asset: {w.cryptoAsset} | Network Gas Deducted: ${w.gasFeeDeducted}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openCustomizeModal(w)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Customize
              </button>

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

      {/* Customize Withdrawal Modal */}
      {customizingWithdrawal && (
        <Modal
          isOpen={!!customizingWithdrawal}
          onClose={() => setCustomizingWithdrawal(null)}
          title="Customize Payout Parameters"
        >
          <form onSubmit={handleSaveCustomization} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Gross Requested Amount ($)</label>
              <Input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Net Payout Amount ($)</label>
              <Input
                type="number"
                value={customNetAmount}
                onChange={(e) => setCustomNetAmount(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Destination Wallet Payout Address</label>
              <Input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCustomizingWithdrawal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-black"
              >
                Save Customization
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
