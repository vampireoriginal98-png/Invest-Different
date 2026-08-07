import React, { useState } from "react";
import { User } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, Shield, Edit3, DollarSign, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

interface UserTableProps {
  users?: User[];
  onRefresh?: () => void;
}

export function UserTable({ users: externalUsers, onRefresh }: UserTableProps) {
  const [internalUsers, setInternalUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState("");
  const [newRole, setNewRole] = useState("USER");

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

  React.useEffect(() => {
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

  const handleSaveUser = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
        body: JSON.stringify({
          userId,
          role: newRole,
          balance: newBalance !== "" ? Number(newBalance) : undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to update user");

      toast.success("User account updated!");
      setEditingUserId(null);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <Input
            placeholder="Search users by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

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
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold">
            <tr>
              <th className="p-3">User / Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">KYC Status</th>
              <th className="p-3">Wallet Balance</th>
              <th className="p-3">Total Deposited</th>
              <th className="p-3">Joined</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-slate-900/50 transition">
                <td className="p-3">
                  <p className="font-semibold text-slate-100">{user.name || "Investor"}</p>
                  <p className="text-slate-400">{user.email}</p>
                  <span className="text-[10px] text-slate-500 font-mono">Ref: {user.referralCode}</span>
                </td>
                <td className="p-3">
                  {editingUserId === user.id ? (
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  ) : (
                    <Badge variant={user.role.includes("ADMIN") ? "gold" : "info"}>
                      {user.role}
                    </Badge>
                  )}
                </td>
                <td className="p-3">
                  <Badge
                    variant={
                      user.kycStatus === "APPROVED"
                        ? "success"
                        : user.kycStatus === "SUBMITTED"
                        ? "warning"
                        : user.kycStatus === "REJECTED"
                        ? "danger"
                        : "info"
                    }
                  >
                    {user.kycStatus}
                  </Badge>
                </td>
                <td className="p-3 font-bold">
                  {editingUserId === user.id ? (
                    <Input
                      type="number"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      className="w-24 h-7 text-xs"
                    />
                  ) : (
                    <span className="text-emerald-400">{formatCurrency(user.balance)}</span>
                  )}
                </td>
                <td className="p-3 font-medium text-slate-300">
                  {formatCurrency(user.totalDeposited)}
                </td>
                <td className="p-3 text-slate-400">{formatDate(user.createdAt)}</td>
                <td className="p-3 text-right">
                  {editingUserId === user.id ? (
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="gold" onClick={() => handleSaveUser(user.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingUserId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingUserId(user.id);
                        setNewBalance(String(user.balance));
                        setNewRole(user.role);
                      }}
                      className="flex items-center gap-1 text-amber-400 hover:text-amber-300 ml-auto"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
