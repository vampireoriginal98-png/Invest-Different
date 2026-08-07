import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Share2, Check, X, Clock, Award } from "lucide-react";
import toast from "react-hot-toast";

interface SocialLinkRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  platform: string;
  handleOrUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export function SocialLinksQueue() {
  const [links, setLinks] = useState<SocialLinkRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingLinks = async () => {
    try {
      const res = await fetch("/api/admin/social-links/pending", {
        headers: { Authorization: `Bearer ${localStorage.getItem("invest_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLinks(data.socialLinks || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPendingLinks();
  }, []);

  const handleReview = async (id: string, action: "approve" | "reject") => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/social-links/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        toast.success(action === "approve" ? "Social link approved (+$5 bonus credited)" : "Social link request rejected");
        fetchPendingLinks();
      } else {
        toast.error("Failed to update social link status");
      }
    } catch (e) {
      toast.error("Error reviewing social link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <CardTitle>Pending Social Link Verification Queue</CardTitle>
          </div>
          <span className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full font-bold">
            {links.length} Pending Approval
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {links.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No pending social link verification requests.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Handle / Link</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Reward</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-950/50">
                    <td className="p-3">
                      <div className="font-bold">{link.userName || "Investor"}</div>
                      <div className="text-[10px] text-slate-400">{link.userEmail}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-bold uppercase text-[10px]">
                        {link.platform}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-emerald-400">{link.handleOrUrl}</td>
                    <td className="p-3 text-slate-400">{new Date(link.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> +$5.00
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Button
                        disabled={loading}
                        onClick={() => handleReview(link.id, "approve")}
                        className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold px-3 py-1.5 h-auto"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                      <Button
                        disabled={loading}
                        onClick={() => handleReview(link.id, "reject")}
                        variant="outline"
                        className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10 text-xs px-3 py-1.5 h-auto"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
