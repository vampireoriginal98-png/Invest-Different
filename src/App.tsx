import React, { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { LandingView } from "./views/LandingView";
import { AuthView } from "./views/AuthView";
import { DashboardView } from "./views/DashboardView";
import { WalletView } from "./views/WalletView";
import { WithdrawalsView } from "./views/WithdrawalsView";
import { InvestmentsView } from "./views/InvestmentsView";
import { StocksView } from "./views/StocksView";
import { BrokerView } from "./views/BrokerView";
import { InsuranceView } from "./views/InsuranceView";
import { SpinWheelView } from "./views/SpinWheelView";
import { PredictTrendView } from "./views/PredictTrendView";
import { TasksView } from "./views/TasksView";
import { AchievementsView } from "./views/AchievementsView";
import { KYCView } from "./views/KYCView";
import { ReferralsView } from "./views/ReferralsView";
import { ProfileView } from "./views/ProfileView";
import { AboutView } from "./views/AboutView";
import { BlogView } from "./views/BlogView";
import { ContactView } from "./views/ContactView";
import { TermsView } from "./views/TermsView";
import { AdminView } from "./views/AdminView";
import { NotificationsView } from "./views/NotificationsView";
import { TermsPopup } from "./components/auth/TermsPopup";
import { GroqAssistant } from "./components/ai/GroqAssistant";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

export function App() {
  const { user, currentTab, setCurrentTab, fetchMe, fetchNotifications, fetchSettings, theme } = useAuthStore();

  useEffect(() => {
    fetchSettings();
    fetchMe();
    fetchNotifications();
  }, []);

  // Theme Syncing
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // If user is not authenticated
  if (!user) {
    if (currentTab === "auth") {
      return <AuthView onSuccess={() => setCurrentTab("dashboard")} />;
    }
    if (["about", "blog", "contact", "terms"].includes(currentTab)) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
            <button
              onClick={() => setCurrentTab("landing")}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              ← Back to Homepage
            </button>
            <button
              onClick={() => setCurrentTab("auth")}
              className="px-4 py-2 rounded-xl gold-gradient text-slate-950 text-xs font-black uppercase cursor-pointer"
            >
              Sign In
            </button>
          </header>
          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
            <ErrorBoundary>
              {currentTab === "about" && <AboutView />}
              {currentTab === "blog" && <BlogView />}
              {currentTab === "contact" && <ContactView />}
              {currentTab === "terms" && <TermsView />}
            </ErrorBoundary>
          </main>
        </div>
      );
    }
    return (
      <LandingView
        onGetStarted={() => setCurrentTab("auth")}
        onLogin={() => setCurrentTab("auth")}
        onNavigateTab={(t) => setCurrentTab(t)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Terms & Conditions Popup */}
      <TermsPopup />

      {/* Main Header */}
      <Header />

      <div className="flex flex-1">
        {/* Main Sidebar */}
        <Sidebar />

        {/* Main Content Stage */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <ErrorBoundary>
            {currentTab === "dashboard" && <DashboardView />}
            {currentTab === "wallet" && <WalletView />}
            {currentTab === "withdrawals" && <WithdrawalsView />}
            {currentTab === "investments" && <InvestmentsView />}
            {currentTab === "stocks" && <StocksView />}
            {currentTab === "broker" && <BrokerView />}
            {currentTab === "insurance" && <InsuranceView />}
            {currentTab === "spin" && <SpinWheelView />}
            {currentTab === "predict" && <PredictTrendView />}
            {currentTab === "tasks" && <TasksView />}
            {currentTab === "achievements" && <AchievementsView />}
            {currentTab === "kyc" && <KYCView />}
            {currentTab === "referrals" && <ReferralsView />}
            {currentTab === "profile" && <ProfileView />}
            {currentTab === "about" && <AboutView />}
            {currentTab === "blog" && <BlogView />}
            {currentTab === "contact" && <ContactView />}
            {currentTab === "terms" && <TermsView />}
            {currentTab === "notifications" && <NotificationsView />}
            {currentTab === "admin" && <AdminView />}
          </ErrorBoundary>
        </main>
      </div>

      {/* Floating AI Assistant Chatbot */}
      <GroqAssistant />
    </div>
  );
}

export default App;
