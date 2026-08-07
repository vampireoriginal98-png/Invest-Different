import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, Clock, CheckCircle2, Headphones, HelpCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

export function WalletView() {
  const { systemSetting, user, setCurrentTab } = useAuthStore();
  const [selectedAsset, setSelectedAsset] = useState<"USDT" | "BTC" | "ETH">("USDT");
  const [amount, setAmount] = useState<number>(100);
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState<any[]>([]);

  const cryptoAddress =
    selectedAsset === "BTC"
      ? systemSetting.btcAddress || "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
      : selectedAsset === "ETH"
      ? systemSetting.ethAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
      : systemSetting.usdtAddress || systemSetting.cryptoAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

  const customQrCode =
    selectedAsset === "BTC"
      ? systemSetting.btcQrCode
      : selectedAsset === "ETH"
      ? systemSetting.ethQrCode
      : systemSetting.usdtQrCode;

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/wallet/transactions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("invest_token")}` },
      });
      const data = await res.json();
      if (data.deposits) setDeposits(data.deposits);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(cryptoAddress);
    setCopied(true);
    toast.success(`${selectedAsset} Deposit Address copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < (systemSetting.minDeposit || 10)) {
      toast.error(`Minimum deposit amount is $${systemSetting.minDeposit || 10}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
        body: JSON.stringify({ amount, txHash }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deposit submission failed");

      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      toast.success("Deposit request submitted! Admin will credit your balance after confirmation.");
      setTxHash("");
      fetchTransactions();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit deposit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Deposit Wallet</h1>
        <p className="text-xs md:text-sm text-slate-400">
          Fund your account with cryptocurrency. All deposits are reviewed and credited securely.
        </p>
      </div>

      {/* Customer Service Assistance Notice */}
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-500/10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Having problems making a deposit?</h4>
            <p className="text-xs text-amber-200/90 font-medium">
              Contact our 24/7 VIP Customer Service team for immediate deposit aid, payment routing, or manual verification assistance.
            </p>
          </div>
        </div>
        <Button
          variant="gold"
          onClick={() => setCurrentTab("support")}
          className="whitespace-nowrap flex items-center gap-2 cursor-pointer text-xs font-black shadow-md shadow-amber-500/20 shrink-0"
        >
          <Headphones className="w-4 h-4" />
          <span>Contact Customer Aid</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit Request Card */}
        <Card className="border-amber-500/30 bg-slate-900/90 space-y-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-400" />
              <CardTitle>1. Choose Payment Currency & Amount</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Asset Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Crypto Network
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["USDT", "BTC", "ETH"] as const).map((asset) => (
                  <button
                    key={asset}
                    type="button"
                    onClick={() => setSelectedAsset(asset)}
                    className={`p-3 rounded-xl border text-center transition font-bold text-xs cursor-pointer ${
                      selectedAsset === asset
                        ? "border-amber-500 bg-amber-500/15 text-amber-300"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {asset} ({asset === "USDT" ? "TRC20/ERC20" : asset === "BTC" ? "Bitcoin" : "ERC20"})
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Preset Amount (USD)
              </label>
              <div className="flex flex-wrap gap-2">
                {[50, 100, 250, 500, 1000, 2500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      amount === val
                        ? "border-amber-500 bg-amber-500/20 text-amber-300"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Custom Deposit Amount ($ USD)
                </label>
                <Input
                  type="number"
                  min={systemSetting.minDeposit || 10}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Blockchain Tx Hash / Transaction ID (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 0x3f1a9b2c..."
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                disabled={loading}
                className="w-full font-bold"
              >
                {loading ? "Transmitting..." : `Submit $${amount} Deposit Request`}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* QR Code & Wallet Address Display */}
        <Card className="border-slate-800 bg-slate-900/90 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">2. Send Crypto to Address</CardTitle>
              <Badge variant="gold">{selectedAsset}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-center p-4 bg-white rounded-2xl w-fit mx-auto shadow-xl">
              {customQrCode ? (
                <img
                  src={customQrCode}
                  alt={`${selectedAsset} Deposit QR Code`}
                  className="w-[180px] h-[180px] object-contain rounded-lg"
                />
              ) : (
                <QRCodeSVG value={cryptoAddress} size={180} level="H" />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Official Platform {selectedAsset} Deposit Address
              </label>
              <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 break-all">
                <span className="text-xs font-mono text-slate-200 flex-1">{cryptoAddress}</span>
                <Button size="sm" variant="gold" onClick={handleCopy} className="shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-amber-400">⚠️ Deposit Instructions:</p>
              <p>• Send exactly ${amount} in {selectedAsset} to the address above.</p>
              <p>• Deposits are reviewed by admin and credited within 1-24 hours.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Deposit History */}
      <Card>
        <CardHeader>
          <CardTitle>Deposit History & Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase">
                <tr>
                  <th className="p-3">Deposit ID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Tx Hash</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No deposits recorded yet. Submit your first deposit above!
                    </td>
                  </tr>
                ) : (
                  deposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-mono text-slate-400">{dep.id}</td>
                      <td className="p-3 font-bold text-emerald-400">{formatCurrency(dep.amount)}</td>
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
                      <td className="p-3 font-mono text-slate-400 truncate max-w-xs">
                        {dep.txHash || "Pending Confirmation"}
                      </td>
                      <td className="p-3 text-slate-400">{formatDate(dep.createdAt)}</td>
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
