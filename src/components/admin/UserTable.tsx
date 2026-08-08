import React, { useState, useEffect } from "react";
import { User } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, Shield, Edit3, DollarSign, UserCheck, KeyRound, Eye, Lock, RefreshCw, CheckSquare, Square } from "lucide-react";
import toast from "react-hot-toast";

interface UserTableProps {
  users?: User[];
  onRefresh?: () => void;
}

export function UserTable({ users: externalUsers, onRefresh }: UserTableProps) {
  const [internalUsers, setInternalUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Detailed User Modal State
  const [inspectUser, setInspectUser] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    balance: 0,
    referralEarnings: 0,
    role: "USER",
    kycStatus: "PENDING",
    insuranceLevel: 0,
    transactionPin: "",
    newPassword: "",
  });

  // Batch Action State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchBalanceDelta, setBatchBalanceDelta] = useState("");
  const [batchKycStatus, setBatchKycStatus] = useState("");
  const [batchRole, setBatchRole] = useState("");
  const [batchInsuranceLevel, setBatchInsuranceLevel] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("invest_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInternalUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!externalUsers) {
      fetchUsers();
    }
  }, [externalUsers]);

  const users = externalUsers || internalUsers;

  const countries = Array.from(
    new Set(users.map((u: any) => u.kycCountry || u.country).filter(Boolean))
  );

  const filtered = users.filter((u: any) => {
    const matchesSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
      u.id.toLowerCase().includes(search.toLowerCase());

    const countryVal = u.kycCountry || u.country;
    const matchesCountry = selectedCountry === "ALL" || countryVal === selectedCountry;

    return matchesSearch && matchesCountry;
  });

  const handleSelectAll = () => {
    if (selectedUserIds.length === filtered.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filtered.map((u) => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((i) => i !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const openInspectModal = (user: any) => {
    setInspectUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      balance: user.balance || 0,
      referralEarnings: user.referralEarnings || 0,
      role: user.role || "USER",
      kycStatus: user.kycStatus || "PENDING",
      insuranceLevel: user.insuranceLevel || 0,
      transactionPin: user.transactionPin || "",
      newPassword: "",
    });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectUser) return;

    try {
      const res = await fetch("/api/admin/users/role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
        body: JSON.stringify({
          userId: inspectUser.id,
          name: editFormData.name,
          email: editFormData.email,
          role: editFormData.role,
          balance: editFormData.balance,
          referralEarnings: editFormData.referralEarnings,
          kycStatus: editFormData.kycStatus,
          insuranceLevel: editFormData.insuranceLevel,
          transactionPin: editFormData.transactionPin || undefined,
          password: editFormData.newPassword || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to update user");

      toast.success("Client account & credentials updated successfully!");
      setInspectUser(null);
      if (onRefresh) onRefresh();
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to update user");
    }
  };

  const handleApplyBatchEdit = async () => {
    if (selectedUserIds.length === 0) return;

    try {
      const res = await fetch("/api/admin/users/batch-edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
        body: JSON.stringify({
          userIds: selectedUserIds,
          balanceDelta: batchBalanceDelta !== "" ? Number(batchBalanceDelta) : undefined,
          role: batchRole || undefined,
          kycStatus: batchKycStatus || undefined,
          insuranceLevel: batchInsuranceLevel !== "" ? Number(batchInsuranceLevel) : undefined,
        }),
      });

      if (!res.ok) throw new Error("Batch update failed");
      const data = await res.json();

      toast.success(`Batch changes applied to ${data.updatedCount} accounts!`);
      setShowBatchModal(false);
      setSelectedUserIds([]);
      if (onRefresh) onRefresh();
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || "Batch update failed");
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <Input
            placeholder="Search users by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none w-full sm:w-auto"
          >
            <option value="ALL">All Countries ({countries.length})</option>
            {countries.map((c: any) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {selectedUserIds.length > 0 && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => setShowBatchModal(true)}
              className="whitespace-nowrap font-bold"
            >
              Batch Edit ({selectedUserIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold">
            <tr>
              <th className="p-3 w-10">
                <button
                  onClick={handleSelectAll}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {selectedUserIds.length === filtered.length && filtered.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="p-3">User & Credentials</th>
              <th className="p-3">Online Status</th>
              <th className="p-3">Role</th>
              <th className="p-3">KYC Identity</th>
              <th className="p-3">Wallet Balance</th>
              <th className="p-3">Ref Earnings</th>
              <th className="p-3 text-right">SuperControl</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filtered.map((u: any) => {
              const isSelected = selectedUserIds.includes(u.id);
              return (
                <tr key={u.id} className={`hover:bg-slate-900/50 transition ${isSelected ? "bg-emerald-500/5" : ""}`}>
                  <td className="p-3">
                    <button
                      onClick={() => toggleSelectUser(u.id)}
                      className="text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  <td className="p-3">
                    <p className="font-bold text-slate-100 flex items-center gap-1.5">
                      {u.name || "Investor"}
                    </p>
                    <p className="text-slate-400">{u.email}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                      <span className="text-amber-400 font-bold">ID: {u.id}</span>
                      <span>•</span>
                      <span>Ref: {u.referralCode}</span>
                      <span>•</span>
                      <span>PIN: {u.transactionPin ? "✅ Active" : "❌ Unset"}</span>
                    </div>
                  </td>

                  <td className="p-3">
                    {u.isOnline ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        ONLINE NOW
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium">
                        {u.lastActiveAt ? `Last active ${formatDate(u.lastActiveAt)}` : "Offline"}
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={async () => {
                        const newRole = u.role === "ADMIN" ? "USER" : "ADMIN";
                        try {
                          const res = await fetch("/api/admin/users/role", {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
                            },
                            body: JSON.stringify({ userId: u.id, role: newRole }),
                          });
                          if (res.ok) {
                            toast.success(`Role updated to ${newRole}`);
                            if (onRefresh) onRefresh();
                            fetchUsers();
                          }
                        } catch (e) {
                          toast.error("Role toggle failed");
                        }
                      }}
                      className="cursor-pointer hover:opacity-80 transition text-left"
                      title="Click to toggle between USER and ADMIN"
                    >
                      <Badge variant={u.role?.includes("ADMIN") ? "gold" : "info"}>
                        {u.role} 🔄
                      </Badge>
                    </button>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={async () => {
                        const newKyc = u.kycStatus === "APPROVED" ? "PENDING" : "APPROVED";
                        try {
                          const res = await fetch("/api/admin/users/role", {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
                            },
                            body: JSON.stringify({ userId: u.id, kycStatus: newKyc }),
                          });
                          if (res.ok) {
                            toast.success(`KYC status updated to ${newKyc}`);
                            if (onRefresh) onRefresh();
                            fetchUsers();
                          }
                        } catch (e) {
                          toast.error("KYC toggle failed");
                        }
                      }}
                      className="cursor-pointer hover:opacity-80 transition text-left"
                      title="Click to toggle KYC approval"
                    >
                      <Badge
                        variant={
                          u.kycStatus === "APPROVED"
                            ? "success"
                            : u.kycStatus === "SUBMITTED"
                            ? "warning"
                            : u.kycStatus === "REJECTED"
                            ? "danger"
                            : "info"
                        }
                      >
                        {u.kycStatus} 🔄
                      </Badge>
                    </button>
                  </td>

                  <td className="p-3 font-bold text-emerald-400">
                    {formatCurrency(u.balance || 0)}
                  </td>

                  <td className="p-3 font-semibold text-amber-400">
                    {formatCurrency(u.referralEarnings || 0)}
                  </td>

                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openInspectModal(u)}
                      className="flex items-center gap-1 text-amber-400 hover:text-amber-300 ml-auto cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Full Edit
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Inspect & Edit User Modal */}
      {inspectUser && (
        <Modal
          isOpen={!!inspectUser}
          onClose={() => setInspectUser(null)}
          title={`Full Client SuperControl: ${inspectUser.name || inspectUser.email}`}
        >
          <form onSubmit={handleSaveUser} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <p>User ID: <strong className="text-slate-200 font-mono">{inspectUser.id}</strong></p>
              <p>Referral Code: <strong className="text-amber-300 font-mono">{inspectUser.referralCode}</strong></p>
              <p>Referred By: <strong className="text-slate-200 font-mono">{inspectUser.referredBy || "Direct / None"}</strong></p>
              <p>Registration Date: <strong className="text-slate-200">{formatDate(inspectUser.createdAt)}</strong></p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Legal Name</label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <Input
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Wallet Balance ($)</label>
                <Input
                  type="number"
                  value={editFormData.balance}
                  onChange={(e) => setEditFormData({ ...editFormData, balance: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Referral Earnings ($)</label>
                <Input
                  type="number"
                  value={editFormData.referralEarnings}
                  onChange={(e) => setEditFormData({ ...editFormData, referralEarnings: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Access Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">KYC Verification Status</label>
                <select
                  value={editFormData.kycStatus}
                  onChange={(e) => setEditFormData({ ...editFormData, kycStatus: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Insurance Aegis Level (0-4)</label>
                <Input
                  type="number"
                  min="0"
                  max="4"
                  value={editFormData.insuranceLevel}
                  onChange={(e) => setEditFormData({ ...editFormData, insuranceLevel: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Transaction Security PIN (6-Digit)</label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={editFormData.transactionPin}
                  onChange={(e) => setEditFormData({ ...editFormData, transactionPin: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Reset Account Password (Optional)</label>
              <Input
                type="password"
                placeholder="Leave blank to keep existing password"
                value={editFormData.newPassword}
                onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setInspectUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold">
                Save Account Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Batch Edit Modal */}
      {showBatchModal && (
        <Modal
          isOpen={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          title={`Batch Edit (${selectedUserIds.length} Selected Accounts)`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Apply structural changes across <strong className="text-emerald-400">{selectedUserIds.length}</strong> client profiles simultaneously.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Add/Subtract Wallet Balance ($)</label>
                <Input
                  type="number"
                  placeholder="e.g. +500 or -100 (leave blank to unchange)"
                  value={batchBalanceDelta}
                  onChange={(e) => setBatchBalanceDelta(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Set KYC Status</label>
                <select
                  value={batchKycStatus}
                  onChange={(e) => setBatchKycStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold"
                >
                  <option value="">-- No Change --</option>
                  <option value="APPROVED">APPROVED (Verified)</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Set Access Role</label>
                <select
                  value={batchRole}
                  onChange={(e) => setBatchRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold"
                >
                  <option value="">-- No Change --</option>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Set Insurance Aegis Tier Level</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  placeholder="0, 1, 2, 3, or 4 (leave blank to unchange)"
                  value={batchInsuranceLevel}
                  onChange={(e) => setBatchInsuranceLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBatchModal(false)}>
                Cancel
              </Button>
              <Button variant="gold" onClick={handleApplyBatchEdit}>
                Apply Batch Updates
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
