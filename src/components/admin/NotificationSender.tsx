import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Send, Bell, Megaphone } from "lucide-react";
import toast from "react-hot-toast";

interface NotificationSenderProps {
  users?: { id: string; name: string | null; email: string }[];
}

export function NotificationSender({ users: initialUsers = [] }: NotificationSenderProps) {
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string }[]>(initialUsers);
  const [targetUserId, setTargetUserId] = useState("ALL");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialUsers.length > 0) {
      setUsers(initialUsers);
    } else {
      fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("invest_token")}` },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setUsers(data);
        })
        .catch(() => {});
    }
  }, [initialUsers]);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a notification message");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
        body: JSON.stringify({
          targetUserId,
          message,
          type: "ADMIN",
        }),
      });

      if (!res.ok) throw new Error("Failed to broadcast notification");

      toast.success(
        targetUserId === "ALL"
          ? "Broadcast sent to all platform investors!"
          : "Notification sent successfully!"
      );
      setMessage("");
    } catch (e: any) {
      toast.error(e.message || "Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber-400" />
          <CardTitle>Broadcast Notification Sender</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Recipient Target
          </label>
          <select
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">📢 All Registered Users & Investors (Broadcast)</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                👤 {u.name || "User"} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Notification Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type platform announcement, promo yield notice, or account notification..."
            className="w-full h-28 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <Button
          variant="gold"
          onClick={handleSend}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? "Transmitting..." : "Send In-App Notification"}</span>
        </Button>
      </CardContent>
    </Card>
  );
}
