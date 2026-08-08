import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Zap,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

interface AuthViewProps {
  initialMode?: "login" | "register";
  onSuccess: () => void;
}

const COUNTRY_CODES = [
  { code: "+1", country: "🇺🇸 USA/CAN" },
  { code: "+44", country: "🇬🇧 UK" },
  { code: "+234", country: "🇳🇬 Nigeria" },
  { code: "+91", country: "🇮🇳 India" },
  { code: "+61", country: "🇦🇺 Australia" },
  { code: "+49", country: "🇩🇪 Germany" },
  { code: "+33", country: "🇫🇷 France" },
  { code: "+81", country: "🇯🇵 Japan" },
  { code: "+55", country: "🇧🇷 Brazil" },
  { code: "+971", country: "🇦🇪 UAE" },
  { code: "+27", country: "🇿🇦 S. Africa" },
];

export function AuthView({ initialMode = "login", onSuccess }: AuthViewProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const { setUser, setCurrentTab } = useAuthStore();

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [adminGmail, setAdminGmail] = useState("admin@gmail.com");
  const [forgotSent, setForgotSent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email) {
      setErrorMsg("Please enter your account email address");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, adminGmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit recovery request");
      setForgotSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit recovery request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === "register") {
      if (!firstName || !lastName) {
        setErrorMsg("First Name and Last Name are required");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match");
        return;
      }
      if (password.length < 8) {
        setErrorMsg("Password must be at least 8 characters");
        return;
      }
      if (!agreedToTerms) {
        setErrorMsg("You must accept the Terms of Service to proceed");
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        mode === "register"
          ? {
              name: `${firstName} ${lastName}`.trim(),
              firstName,
              lastName,
              displayName: displayName || `${firstName} ${lastName}`,
              email,
              phone: `${countryCode} ${phoneNumber}`.trim(),
              password,
              referralCode,
              agreedToTerms: true,
            }
          : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      localStorage.setItem("invest_token", data.token);
      setUser(data.user, data.token);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");

  const handleGoogleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!googleEmail || !googleEmail.includes("@")) {
      setErrorMsg("Please enter a valid Gmail address");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleEmail,
          name: googleName || googleEmail.split("@")[0],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google Sign-In failed");
      localStorage.setItem("invest_token", data.token);
      setUser(data.user, data.token);
      setShowGoogleModal(false);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Google Sign In failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 my-8">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div
            onClick={() => setCurrentTab("dashboard")}
            className="flex h-12 w-12 items-center justify-center rounded-2xl gold-gradient mx-auto shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Zap className="w-7 h-7 text-slate-950 fill-slate-950" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
            {mode === "login" ? "Access Investor Desk" : "Create Sovereign Account"}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === "login"
              ? "Welcome back. Enter your credentials to manage your yield."
              : "Register in 30 seconds to access institutional portfolios."}
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

          {isForgotPassword ? (
            <div className="space-y-4">
              {forgotSent ? (
                <div className="text-center space-y-3 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                  <div className="text-3xl">🔐</div>
                  <h3 className="text-sm font-bold text-white">Password Recovery Request Submitted</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your password reset ticket for <strong>{email}</strong> has been logged to Admin (<strong>{adminGmail}</strong>).
                  </p>
                  <p className="text-[11px] text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                    💡 Please contact customer service on another account with your ID and email, or wait 3 hours for administrative account verification.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setForgotSent(false);
                    }}
                    className="mt-2 text-xs text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Your Account Email / ID</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                        placeholder="investor@domain.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Admin Support Gmail</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={adminGmail}
                        onChange={(e) => setAdminGmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                        placeholder="admin@gmail.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full gold-gradient py-3.5 rounded-xl text-slate-950 font-black text-xs uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <span>{isLoading ? "Submitting Request..." : "Submit Password Reset Ticket"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                        placeholder="Alex"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                        placeholder="Mercer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Display Handle (Optional)</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                      placeholder="CryptoPro88"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Phone Number</label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-xs text-slate-200 focus:outline-none"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.country} ({c.code})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                        placeholder="555 019 2831"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                    placeholder="investor@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === "login" && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                    />
                    <span>Remember Me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-amber-400 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

          {mode === "register" && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Referral Code (Optional)</label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="ADMINVIP"
                />
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-[11px] text-slate-400">
                  I agree to the Terms of Service, Risk Disclosure, and Privacy Policy.
                </span>
              </label>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full gold-gradient py-3.5 rounded-xl text-slate-950 font-black text-xs uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <span>{isLoading ? "Processing..." : mode === "login" ? "Sign In to Desk" : "Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] text-slate-500 font-bold uppercase">OR</span>
        </div>

        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          disabled={isLoading}
          className="w-full bg-slate-950 border border-amber-500/30 hover:border-amber-400 py-3 rounded-xl text-slate-100 text-xs font-bold transition flex items-center justify-center gap-2.5 cursor-pointer shadow-md"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
            />
          </svg>
          <span>Continue with Google Account</span>
        </button>

        {/* Google Authentication Modal */}
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-6 space-y-5 relative shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-extrabold text-white">Google Account Sign-In</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleGoogleAuth} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Your Gmail Address
                  </label>
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-xs font-bold hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 gold-gradient py-2.5 rounded-xl text-slate-950 text-xs font-black uppercase tracking-wider hover:brightness-110 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    {isLoading ? "Signing in..." : "Continue"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-slate-400 pt-2">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-amber-400 font-bold hover:underline cursor-pointer"
              >
                Register Free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-amber-400 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
