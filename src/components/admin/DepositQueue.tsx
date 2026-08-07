import React from "react";
import { Deposit } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface DepositQueueProps {
  deposits?: Deposit[];
  onRefresh?: () => void;
}

export function DepositQueue({ deposits: externalDeposits, onRefresh }: DepositQueueProps) {
  const [internalDeposits, setInternalDeposits] = React.useState<Deposit[]>([]);

  const fetchDeposits = async () => {
    try {
      const res = await fetch("/api/admin/deposits", {
        headers: { Authorization: `Bearer ${localStorage.getItem("invest_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInternalDeposits(data.deposits || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    if (!externalDeposits) {
      fetchDeposits();
    }
  }, [externalDeposits]);

  const deposits = externalDeposits || internalDeposits;
  const triggerRefresh = onRefresh || fetchDeposits;
  const handleConfirm = async (depositId: string, amount: number, name: string) => {
    try {
      const res = await fetch("/api/admin/deposits/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
        body: JSON.stringify({ depositId }),
      });

      if (!res.ok) throw new Error("Failed to confirm deposit");

      toast.success(`Deposit of ${formatCurrency(amount)} for ${name} CONFIRMED!`);
      triggerRefresh();
    } catch (e: any) {
      toast.error(e.message || "Confirmation failed");
    }
  };

  const handleReject = async (depositId: string) => {
    try {
      const res = await fetch("/api/admin/deposits/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
        body: JSON.stringify({ depositId }),
      });

      if (!res.ok) throw new Error("Failed to reject deposit");

      toast.error("Deposit request rejected.");
      triggerRefresh();
    } catch (e: any) {
      toast.error(e.message || "Rejection failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Wallet Address / TxHash</th>
              <th className="p-3">Timestamp</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {deposits.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No deposit requests found in queue.
                </td>
              </tr>
            ) : (
              deposits.map((dep) => (
                <tr key={dep.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-3">
                    <p className="font-semibold text-slate-100">{dep.userName || "Investor"}</p>
                    <p className="text-slate-400">{dep.userEmail}</p>
                  </td>
                  <td className="p-3 font-bold text-amber-400 text-sm">
                    {formatCurrency(dep.amount)}
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        dep.status === "CONFIRMED"
                          ? "success"
                          : dep.status === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {dep.status}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-400 break-all max-w-xs">
                    {dep.cryptoAddress}
                    {dep.txHash && (
                      <span className="block text-emerald-400 text-[10px]">Tx: {dep.txHash}</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-400">{formatDate(dep.createdAt)}</td>
                  <td className="p-3 text-right">
                    {dep.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="gold"
                          onClick={() => handleConfirm(dep.id, dep.amount, dep.userName || "User")}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirm & Credit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(dep.id)}
                          className="flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px] font-medium">Processed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
