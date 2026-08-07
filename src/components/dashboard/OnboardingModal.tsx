import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Sparkles, Shield, TrendingUp, Landmark, ArrowRight, CheckCircle2 } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export function OnboardingModal({ isOpen, onClose, onNavigateTab }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Invest Different",
      icon: <Sparkles className="w-8 h-8 text-amber-400" />,
      description: "Your sovereign multi-asset desk combining automated bot yields, real-time CFD trading, global index portfolios, and Insurance Aegis protection.",
      actionLabel: "Next Step",
      highlight: "Start compounding capital in under 2 minutes",
    },
    {
      title: "1. Deposit Capital & Gas Shield",
      icon: <TrendingUp className="w-8 h-8 text-emerald-400" />,
      description: "Fund your wallet via USDT (TRC20/ERC20) or Bitcoin. Our Gas Fee Shield automatically subsidizes blockchain tx fees on every deposit.",
      actionLabel: "Next Step",
      highlight: "Minimum deposit is only $10",
    },
    {
      title: "2. Deploy Yield Bots & Stocks",
      icon: <Landmark className="w-8 h-8 text-blue-400" />,
      description: "Select from 4 Bot Yield Tiers (1.2% - 3.5%/day) or trade S&P500, NASDAQ, Gold & Forex in our real-time broker execution engine.",
      actionLabel: "Next Step",
      highlight: "Yields accrue 24/7 with auto-compound option",
    },
    {
      title: "3. Insurance Aegis & Daily Tasks",
      icon: <Shield className="w-8 h-8 text-indigo-400" />,
      description: "Lock in Level 1-4 insurance coverage backed by our $50M reserve. Complete daily tasks and spin the Fortune Wheel for instant cash bonuses.",
      actionLabel: "Complete Guide",
      highlight: "Claim up to $55+ in welcome task bonuses",
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-6 text-center py-2">
        <div className="flex justify-center">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl shadow-amber-500/10">
            {currentStep.icon}
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Step {step + 1} of {steps.length}
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">{currentStep.title}</h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">{currentStep.description}</p>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-amber-400 font-semibold">
          💡 {currentStep.highlight}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-xs border-slate-800 hover:bg-slate-800"
          >
            Skip Tutorial
          </Button>

          <Button
            variant="gold"
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 text-xs font-bold"
          >
            <span>{currentStep.actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
