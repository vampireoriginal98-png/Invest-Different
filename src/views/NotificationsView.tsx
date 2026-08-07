import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Bell, CheckCheck, Megaphone, ShieldCheck, Wallet, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export function NotificationsView() {
  const { notifications, setNotifications, markNotificationsRead } = useAuthStore();

  const fetchNotifs = async () => {
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("invest_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) setNotifications(data.notifications);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications/read", {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("invest_token")}` },
      });
      markNotificationsRead();
      toast.success("All notifications marked as read!");
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return <Wallet className="w-4 h-4 text-emerald-400" />;
      case "INVESTMENT":
        return <TrendingUp className="w-4 h-4 text-amber-400" />;
      case "KYC":
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      default:
        return <Megaphone className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">In-App Notifications</h1>
          <p className="text-xs md:text-sm text-slate-400">
            Real-time updates regarding deposits, KYC reviews, dividends, and system broadcasts.
          </p>
        </div>

        {notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="divide-y divide-slate-800/80 p-0">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No notifications found.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 flex items-start justify-between gap-4 transition ${
                  !notif.read ? "bg-amber-500/5" : "hover:bg-slate-900/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={notif.type === "DEPOSIT" ? "success" : "gold"} className="text-[10px]">
                        {notif.type}
                      </Badge>
                      <span className="text-[10px] text-slate-500">{formatDate(notif.createdAt)}</span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-200 leading-relaxed">{notif.message}</p>
                  </div>
                </div>

                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-2" title="Unread" />
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
