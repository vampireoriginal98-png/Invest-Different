import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Notification, SystemSetting } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  currentTab: string;
  theme: "dark" | "light";
  notifications: Notification[];
  unreadCount: number;
  systemSetting: SystemSetting;
  showTermsModal: boolean;

  // Actions
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
  setKycStatus: (status: User["kycStatus"]) => void;
  setCurrentTab: (tab: string) => void;
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationsRead: () => void;
  setSystemSetting: (setting: Partial<SystemSetting>) => void;
  setShowTermsModal: (show: boolean) => void;
  acceptTerms: () => void;
  fetchMe: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchSettings: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      currentTab: "dashboard",
      theme: "dark",
      notifications: [],
      unreadCount: 0,
      showTermsModal: false,
      systemSetting: {
        cryptoAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        btcAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        usdtAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        ethAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        minDeposit: 10,
        minWithdrawal: 50,
        appName: "Invest Different",
        referralBonusPercent: 10,
        supportEmail: "support@investdifferent.com",
        announcement: "⚡ Stage 2 Active: Institutional Yield, Multi-Asset Trading, Insurance Shield & AI Market Engine",
        totalInvestors: 52783,
        totalTradedUsd: "2.4B+",
        avgRoiPercent: 23.4,
        trustRating: 4.8,
      },

      fetchSettings: async () => {
        try {
          const res = await fetch("/api/settings");
          if (res.ok) {
            const data = await res.json();
            if (data.settings) {
              set((state) => ({
                systemSetting: { ...state.systemSetting, ...data.settings },
              }));
            }
          }
        } catch (e) {
          console.error("fetchSettings error:", e);
        }
      },

      fetchMe: async () => {
        const token = localStorage.getItem("invest_token") || get().token;
        if (!token) return;
        try {
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            get().setUser(data.user, token);
          }
        } catch (e) {
          console.error("fetchMe error:", e);
        }
      },

      fetchNotifications: async () => {
        const token = localStorage.getItem("invest_token") || get().token;
        if (!token) return;
        try {
          const res = await fetch("/api/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            get().setNotifications(data.notifications || []);
          }
        } catch (e) {
          console.error("fetchNotifications error:", e);
        }
      },

      setUser: (user, token) => {
        const needsTerms = user ? !user.agreedToTerms : false;
        set((state) => ({
          user,
          token: token !== undefined ? token : state.token,
          isAuthenticated: !!user,
          showTermsModal: needsTerms,
        }));
      },

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          currentTab: "dashboard",
          showTermsModal: false,
        }),

      updateBalance: (newBalance) =>
        set((state) => ({
          user: state.user ? { ...state.user, balance: newBalance } : null,
        })),

      setKycStatus: (status) =>
        set((state) => ({
          user: state.user ? { ...state.user, kycStatus: status } : null,
        })),

      setCurrentTab: (tab) => set({ currentTab: tab }),

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          if (theme === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
          } else {
            document.documentElement.classList.add("light");
            document.documentElement.classList.remove("dark");
          }
        }
      },

      toggleTheme: () => {
        const nextTheme = get().theme === "dark" ? "light" : "dark";
        get().setTheme(nextTheme);
      },

      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.read).length,
        }),

      addNotification: (notification) =>
        set((state) => {
          const updated = [notification, ...state.notifications];
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        }),

      markNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      setSystemSetting: (setting) =>
        set((state) => ({
          systemSetting: { ...state.systemSetting, ...setting },
        })),

      setShowTermsModal: (show) => set({ showTermsModal: show }),

      acceptTerms: () =>
        set((state) => ({
          showTermsModal: false,
          user: state.user ? { ...state.user, agreedToTerms: true } : null,
        })),
    }),
    {
      name: "invest-different-auth",
    }
  )
);
