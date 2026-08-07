import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  User as UserIcon,
  ShieldCheck,
  KeyRound,
  Share2,
  Lock,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  Check,
  ExternalLink,
} from "lucide-react";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
];

export function ProfileView() {
  const { user, setUser } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName || user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.lastName || user?.name?.split(" ")[1] || "");
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || AVATAR_PRESETS[0]);
  
  // Security Passwords
  const [txPassword, setTxPassword] = useState("");
  const [confirmTxPassword, setConfirmTxPassword] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  
  // Social Linking
  const [socials, setSocials] = useState({
    facebook: user?.linkedSocials?.facebook || "",
    twitter: user?.linkedSocials?.twitter || "",
    tiktok: user?.linkedSocials?.tiktok || "",
    snapchat: user?.linkedSocials?.snapchat || "",
    pinterest: user?.linkedSocials?.pinterest || "",
  });

  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);

    try {
      const token = localStorage.getItem("invest_token");
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          displayName,
          phone,
          avatarUrl,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setMsg({ type: "success", text: "Profile details updated successfully!" });
      } else {
        setMsg({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Network error updating profile" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetTxPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (txPassword !== confirmTxPassword) {
      setMsg({ type: "error", text: "Transaction Security PINs do not match" });
      return;
    }
    if (txPassword.length < 4) {
      setMsg({ type: "error", text: "Transaction Security PIN must be at least 4 digits" });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("invest_token");
      const res = await fetch("/api/user/pin/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pin: txPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.user) setUser(data.user);
        setMsg({ type: "success", text: "Transaction Security PIN configured successfully!" });
        setTxPassword("");
        setConfirmTxPassword("");
      } else {
        setMsg({ type: "error", text: data.error || "Failed to set transaction PIN" });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Error setting transaction PIN" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkSocial = async (platform: keyof typeof socials) => {
    const handleOrUrl = socials[platform];
    if (!handleOrUrl) return;

    try {
      const token = localStorage.getItem("invest_token");
      const res = await fetch("/api/user/social-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ platform, handleOrUrl }),
      });

      const d = await res.json();
      if (res.ok) {
        setMsg({ type: "success", text: `Submitted ${String(platform)} for review (+ $5 reward upon admin approval)!` });
      } else {
        setMsg({ type: "error", text: d.error || "Failed to submit social link" });
      }
    } catch (e) {
      setMsg({ type: "error", text: "Error submitting social link" });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-20 w-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl"
            />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg gold-gradient text-slate-950 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {displayName || user?.name || "Investor Profile"}
            </h1>
            <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                KYC: {user?.kycStatus}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                Ref Code: {user?.referralCode}
              </span>
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-semibold ${
            msg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {msg.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Grid Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <UserIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Personal Information
            </h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Choose Profile Avatar
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {AVATAR_PRESETS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Preset"
                    onClick={() => setAvatarUrl(url)}
                    className={`h-11 w-11 rounded-xl object-cover cursor-pointer transition border-2 ${
                      avatarUrl === url ? "border-amber-400 scale-105" : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                placeholder="CryptoInvestor99"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                placeholder="+1 555-0192"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full gold-gradient py-3 rounded-xl text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
            >
              Save Profile Details
            </button>
          </form>
        </div>

        {/* Security & Transaction Passwords */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Lock className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Security & PIN Shield
            </h2>
          </div>

          <form onSubmit={handleSetTxPassword} className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Set a secret <strong className="text-amber-300">Transaction Password</strong> to authorize capital withdrawals and high-value transfers.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Transaction Password</label>
              <input
                type="password"
                value={txPassword}
                onChange={(e) => setTxPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm Transaction Password</label>
              <input
                type="password"
                value={confirmTxPassword}
                onChange={(e) => setConfirmTxPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !txPassword}
              className="w-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 py-3 rounded-xl text-amber-300 font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Update Transaction Password
            </button>
          </form>
        </div>
      </div>

      {/* Social Media Integration */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Social Media Linking
              </h2>
              <p className="text-xs text-slate-400">
                Link your social handles & receive a $5 bonus per approved account!
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            +$5 Bonus / Link
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(["facebook", "twitter", "tiktok", "snapchat", "pinterest"] as const).map((plat) => (
            <div key={plat} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <label className="block text-xs font-extrabold text-slate-200 capitalize flex items-center justify-between">
                <span>{plat} Handle / Profile URL</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={socials[plat]}
                  onChange={(e) => setSocials({ ...socials, [plat]: e.target.value })}
                  placeholder={`@your${plat}handle`}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                />
                <button
                  onClick={() => handleLinkSocial(plat)}
                  className="bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 px-3 py-2 rounded-xl text-xs font-bold transition"
                >
                  Link
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
