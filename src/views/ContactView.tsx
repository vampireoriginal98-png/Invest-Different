import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

export function ContactView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Deposit / Wallet Inquiry");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 py-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> 24/7 Institutional Support
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white">Contact Our Desk</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Need assistance with deposits, withdrawals, KYC verification, or custom investment plans? Our team is available round the clock.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Cards */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Official Support Email</h3>
            <p className="text-xs text-amber-300 font-medium">support@investdifferent.com</p>
            <p className="text-[11px] text-slate-500">Average response time: &lt; 15 minutes</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Registered Headquarters</h3>
            <p className="text-xs text-slate-300">Global Financial House, Suite 402, Victoria, Seychelles</p>
            <p className="text-[11px] text-slate-500">Regulated Financial Entity No. SY-88912</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Trading Hours</h3>
            <p className="text-xs text-emerald-400 font-semibold">24/7 Algorithmic Engine Active</p>
            <p className="text-[11px] text-slate-500">Live human desks operate non-stop</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">Support Ticket Submitted!</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Thank you for contacting Invest Different. Ticket #TK-{Math.floor(100000 + Math.random() * 900000)} has been generated. An institutional support officer will respond shortly via email.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="gold-gradient px-6 py-2.5 rounded-xl text-slate-950 font-bold text-xs uppercase"
              >
                Send Another Ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                Send Direct Message
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                    placeholder="Alex Mercer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                    placeholder="alex@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Inquiry Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="Deposit / Wallet Inquiry">Deposit / Wallet Inquiry</option>
                  <option value="Withdrawal Processing">Withdrawal Processing</option>
                  <option value="KYC Verification Support">KYC Verification Support</option>
                  <option value="Bot Yield & Investment Plans">Bot Yield & Investment Plans</option>
                  <option value="Insurance Aegis Claim">Insurance Aegis Claim</option>
                  <option value="Institutional VIP Plan">Institutional VIP Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Message Details</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="Describe your inquiry in detail..."
                />
              </div>

              <button
                type="submit"
                className="w-full gold-gradient py-3.5 rounded-xl text-slate-950 font-black text-xs uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
