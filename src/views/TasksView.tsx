import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  CheckCircle2,
  Gift,
  Clock,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  completed: boolean;
  claimed: boolean;
}

export function TasksView() {
  const { token, updateBalance } = useAuthStore();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClaim = async (taskId: string) => {
    setLoadingId(taskId);
    try {
      const res = await fetch(`/api/tasks/claim/${taskId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Claim failed");

      toast.success(`🎁 Claimed +$${data.reward} task reward!`);
      updateBalance(data.newBalance);
      fetchTasks();
    } catch (err: any) {
      toast.error(err.message || "Failed to claim task");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-amber-500/30 p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
              <Gift className="w-4 h-4" />
              <span>EFFORT REWARDING SYSTEM</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Daily Platform Tasks & Rewards
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mt-1">
              Complete daily action goals and claim instant cash rewards directly credited to your wallet balance!
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 shrink-0">
            <Award className="w-8 h-8 text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Task Bonus Center</p>
              <p className="text-lg font-black text-emerald-400">INSTANT CASH</p>
            </div>
          </div>
        </div>
      </div>

      {/* Standard Daily Tasks Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <span>Standard Platform Daily Action Tasks</span>
        </h2>

        <div className="space-y-3">
          {tasks.map((tsk) => (
            <div
              key={tsk.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl backdrop-blur-md"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-white">{tsk.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    +${tsk.rewardAmount} Bonus
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{tsk.description}</p>
              </div>

              <div>
                {tsk.claimed ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> CLAIMED
                  </span>
                ) : tsk.completed ? (
                  <button
                    onClick={() => handleClaim(tsk.id)}
                    disabled={loadingId === tsk.id}
                    className="gold-gradient text-slate-950 font-black px-6 py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 cursor-pointer"
                  >
                    {loadingId === tsk.id ? "Claiming..." : "CLAIM REWARD"}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-950 text-slate-500 border border-slate-800">
                    <Clock className="w-4 h-4" /> IN PROGRESS
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
