import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  ShieldCheck,
  ShieldAlert,
  Upload,
  CheckCircle2,
  Clock,
  FileText,
  Camera,
  AlertCircle,
  User,
  Globe,
  MapPin,
  Lock,
} from "lucide-react";

export function KYCView() {
  const { user, setUser } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.kycFirstName || user?.firstName || "");
  const [lastName, setLastName] = useState(user?.kycLastName || user?.lastName || "");
  const [country, setCountry] = useState(user?.kycCountry || "United States");
  const [stateRegion, setStateRegion] = useState(user?.kycState || "");
  const [city, setCity] = useState(user?.kycCity || "");
  const [nationalId, setNationalId] = useState(user?.kycNationalId || "");

  const [idFront, setIdFront] = useState<string | null>(user?.kycIdPhoto || null);
  const [idBack, setIdBack] = useState<string | null>(user?.kycIdBackPhoto || null);
  const [selfie, setSelfie] = useState<string | null>(user?.kycSelfie || null);

  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFront || !idBack || !selfie) {
      setMsg({ type: "error", text: "Please upload ID Front, ID Back, and Selfie photo" });
      return;
    }

    setIsLoading(true);
    setMsg(null);

    try {
      const token = localStorage.getItem("invest_token");
      const res = await fetch("/api/user/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          country,
          state: stateRegion,
          city,
          nationalId,
          idFront,
          idBack,
          selfie,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setMsg({
          type: "success",
          text: "KYC documents submitted! Your application is in the 24-hour admin review queue.",
        });
      } else {
        setMsg({ type: "error", text: data.error || "Failed to submit KYC verification" });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Error submitting KYC documents" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Identity Verification (KYC)
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-lg">
            Mandatory compliance check to unlock unlimited capital withdrawals and high-volume trading capabilities.
          </p>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {user?.kycStatus === "APPROVED" ? (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 text-emerald-400 font-extrabold text-xs">
              <CheckCircle2 className="w-5 h-5" />
              <span>KYC APPROVED</span>
            </div>
          ) : user?.kycStatus === "SUBMITTED" ? (
            <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 text-amber-300 font-extrabold text-xs">
              <Clock className="w-5 h-5 animate-spin" />
              <span>IN 24-HOUR REVIEW QUEUE</span>
            </div>
          ) : user?.kycStatus === "REJECTED" ? (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 text-rose-400 font-extrabold text-xs">
              <AlertCircle className="w-5 h-5" />
              <span>REJECTED - RESUBMIT</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-slate-300 font-extrabold text-xs">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>UNVERIFIED</span>
            </div>
          )}
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${
            msg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {msg.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Main Verification Form */}
      {user?.kycStatus === "APPROVED" ? (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">Full Identity Verification Completed</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your account is verified and fully authorized for unlimited capital withdrawals, stock index investing, and VIP leverage.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8">
          {/* Section 1: Legal Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              1. Legal Identity Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Legal First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Legal Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Country of Residence</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="United States"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">State / Region</label>
                <input
                  type="text"
                  required
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="California"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="Los Angeles"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">National ID / Passport Number</label>
                <input
                  type="text"
                  required
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="A98124018"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Document Uploads */}
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              2. Document Uploads (Front ID, Back ID, Selfie)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* ID Front */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
                <p className="text-xs font-bold text-slate-200">ID Front Photo</p>
                {idFront ? (
                  <img src={idFront} alt="ID Front" className="h-28 w-full object-cover rounded-xl border border-emerald-500/40" />
                ) : (
                  <div className="h-28 bg-slate-900 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500">
                    <Upload className="w-6 h-6" />
                  </div>
                )}
                <label className="block bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-xs font-bold text-slate-200 cursor-pointer">
                  Upload Front
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setIdFront)} className="hidden" />
                </label>
              </div>

              {/* ID Back */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
                <p className="text-xs font-bold text-slate-200">ID Back Photo</p>
                {idBack ? (
                  <img src={idBack} alt="ID Back" className="h-28 w-full object-cover rounded-xl border border-emerald-500/40" />
                ) : (
                  <div className="h-28 bg-slate-900 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500">
                    <Upload className="w-6 h-6" />
                  </div>
                )}
                <label className="block bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-xs font-bold text-slate-200 cursor-pointer">
                  Upload Back
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setIdBack)} className="hidden" />
                </label>
              </div>

              {/* Selfie */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
                <p className="text-xs font-bold text-slate-200">Selfie Photo</p>
                {selfie ? (
                  <img src={selfie} alt="Selfie" className="h-28 w-full object-cover rounded-xl border border-emerald-500/40" />
                ) : (
                  <div className="h-28 bg-slate-900 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
                <label className="block bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-xs font-bold text-slate-200 cursor-pointer">
                  Upload Selfie
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setSelfie)} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !idFront || !idBack || !selfie}
            className="w-full gold-gradient py-4 rounded-2xl text-slate-950 font-black text-xs uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer disabled:opacity-40 shadow-lg shadow-amber-500/20"
          >
            {isLoading ? "Submitting Documents..." : "Submit Verification Application"}
          </button>
        </form>
      )}
    </div>
  );
}
