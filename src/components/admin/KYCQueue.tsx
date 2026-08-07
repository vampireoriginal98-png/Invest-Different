import React, { useState } from "react";
import { User } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CheckCircle2, XCircle, Eye, ShieldCheck, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface KYCQueueProps {
  kycList?: User[];
  onRefresh?: () => void;
}

export function KYCQueue({ kycList: externalKycList, onRefresh }: KYCQueueProps) {
  const [internalKycList, setInternalKycList] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchKycList = async () => {
    try {
      const res = await fetch("/api/admin/kyc", {
        headers: { Authorization: `Bearer ${localStorage.getItem("invest_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInternalKycList(data.kycList || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    if (!externalKycList) {
      fetchKycList();
    }
  }, [externalKycList]);

  const kycList = externalKycList || internalKycList;

  const handleApprove = async (userId: string, name: string) => {
    try {
      const res = await fetch("/api/admin/kyc/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error("Failed to approve KYC");

      toast.success(`KYC for ${name} APPROVED!`);
      setSelectedUser(null);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || "Approval failed");
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/kyc/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
        body: JSON.stringify({ userId, reason: "Incomplete or blurry document photos" }),
      });

      if (!res.ok) throw new Error("Failed to reject KYC");

      toast.error("KYC submission rejected.");
      setSelectedUser(null);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || "Rejection failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">KYC Status</th>
              <th className="p-3">ID Upload</th>
              <th className="p-3">Selfie Upload</th>
              <th className="p-3 text-right">Review Documents</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {kycList.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No KYC submissions waiting for review.
                </td>
              </tr>
            ) : (
              kycList.map((user) => (
                <tr key={user.id} className="hover:bg-slate-900/50 transition">
                  <td className="p-3">
                    <p className="font-semibold text-slate-100">{user.name || "Investor"}</p>
                    <p className="text-slate-400">{user.email}</p>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        user.kycStatus === "APPROVED"
                          ? "success"
                          : user.kycStatus === "SUBMITTED"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {user.kycStatus}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {user.kycIdPhoto ? (
                      <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" /> ID Attached
                      </span>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </td>
                  <td className="p-3">
                    {user.kycSelfie ? (
                      <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" /> Selfie Attached
                      </span>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="gold"
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect Photos
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* KYC Inspection Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`KYC Document Review: ${selectedUser.name || selectedUser.email}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Government ID Document</p>
                {selectedUser.kycIdPhoto ? (
                  <img
                    src={selectedUser.kycIdPhoto}
                    alt="ID Document"
                    className="w-full h-44 object-cover rounded-xl border border-slate-700 bg-black"
                  />
                ) : (
                  <div className="h-44 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                    No photo uploaded
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Portrait Selfie Photo</p>
                {selectedUser.kycSelfie ? (
                  <img
                    src={selectedUser.kycSelfie}
                    alt="Selfie Document"
                    className="w-full h-44 object-cover rounded-xl border border-slate-700 bg-black"
                  />
                ) : (
                  <div className="h-44 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                    No photo uploaded
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <Button
                variant="destructive"
                onClick={() => handleReject(selectedUser.id)}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Reject KYC
              </Button>

              <Button
                variant="gold"
                onClick={() => handleApprove(selectedUser.id, selectedUser.name || "User")}
                className="flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Approve Identity
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
