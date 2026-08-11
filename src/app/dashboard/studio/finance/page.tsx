"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DollarSign, TrendingUp, Wallet, Banknote, Download, CheckCircle, Clock, XCircle } from "lucide-react";
import { DashboardLoading } from "@/components/DashboardLoading";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { studioItems } from "@/components/dashboard/studioNav";
import { useAuth } from "@/context/AuthContext";
import { useStudioAuth } from "@/lib/auth/studio";

interface Payout {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

interface BankAccount {
  id: string;
  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
}

const payoutStatusIcon: Record<string, typeof Clock> = {
  paid: CheckCircle,
  pending: Clock,
  failed: XCircle,
};

const payoutStatusColor: Record<string, string> = {
  paid: "text-green-600 bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/50",
  pending: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50",
  failed: "text-red-600 bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50",
};

export default function StudioFinance() {
  const { user } = useAuth();
  const { studioRole, isStudioUser, can } = useStudioAuth();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: "", bankCode: "", accountNumber: "", accountHolder: "" });
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      try {
        const [paymentsData, studioData] = await Promise.all([
          fetch(`/api/payments?action=payouts&userId=${user.id}`).then((r) => r.json()),
          fetch(`/api/studios?action=dashboard&userId=${user.id}`).then((r) => r.json()),
        ]);
        if (paymentsData?.pendingBalance !== undefined) setPendingBalance(paymentsData.pendingBalance);
        if (paymentsData?.payouts) setPayouts(paymentsData.payouts);
        if (paymentsData?.bankAccounts) setBankAccounts(paymentsData.bankAccounts);
        if (studioData?.stats?.revenue !== undefined) setRevenue(studioData.stats.revenue);
      } catch {
        setFetchError("Failed to load finance data");
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const handleRegisterBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    // Check if user has permission to register bank accounts
    if (!can("finance:create")) {
      setFetchError("You don't have permission to register bank accounts");
      return;
    }
    
    await fetch("/api/payments?action=register-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, ...bankForm }),
    });
    setShowBankForm(false);
    setBankForm({ bankName: "", bankCode: "", accountNumber: "", accountHolder: "" });
    const res = await fetch(`/api/payments?action=payouts&userId=${user.id}`);
    if (res.ok) {
      const data = await res.json();
      setBankAccounts(data.bankAccounts || []);
    }
  };

  const activeId = studioItems.find((item) => pathname === item.href)?.id || "overview";

  return (
    <DashboardSidebar items={studioItems} activeId={activeId}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Finance</h1>

        {fetchError ? (
          <p className="text-red-500 text-center py-16">{fetchError}</p>
        ) : loading ? (
          <DashboardLoading />
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="p-5 bg-green-50 dark:bg-green-950/30 rounded-2xl border border-green-100 dark:border-green-900/50">
                <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-green-500" /><span className="text-xs font-medium text-green-600 dark:text-green-400">Total Revenue</span></div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">MYR {revenue.toLocaleString()}</p>
                <p className="text-xs text-green-500 flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3" /> Live from bookings</p>
              </div>
              <div className="p-5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                <div className="flex items-center gap-2 mb-2"><Wallet className="w-4 h-4 text-amber-500" /><span className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending Payouts</span></div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">MYR {pendingBalance.toLocaleString()}</p>
              </div>
              <div className="p-5 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center gap-2 mb-2"><Banknote className="w-4 h-4 text-blue-500" /><span className="text-xs font-medium text-blue-600 dark:text-blue-400">Bank Account</span></div>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {bankAccounts.length > 0 && bankAccounts[0].bankName
                    ? `${bankAccounts[0].bankName}${bankAccounts[0].accountNumber ? ` •••• ${bankAccounts[0].accountNumber.slice(-4)}` : ""}`
                    : "Not registered"}
                </p>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payouts</h2>
                {bankAccounts.length === 0 && (
                  <button
                    onClick={() => setShowBankForm(!showBankForm)}
                    className="px-4 py-2 text-sm font-medium rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                  >
                    + Register Bank
                  </button>
                )}
              </div>

              {showBankForm && (
                <form onSubmit={handleRegisterBank} className="mb-6 p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl space-y-3">
                  <input placeholder="Bank Name (e.g. Maybank, CIMB)" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" required />
                  <input placeholder="Bank Code / SWIFT (e.g. MBBEMYKL) - optional" value={bankForm.bankCode} onChange={(e) => setBankForm({ ...bankForm, bankCode: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  <input placeholder="Account Number" value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" required />
                  <input placeholder="Account Holder Name" value={bankForm.accountHolder} onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" required />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 text-sm font-medium rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors">Save</button>
                    <button type="button" onClick={() => setShowBankForm(false)} className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">Cancel</button>
                  </div>
                </form>
              )}

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Payout History</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50"><Download className="w-3.5 h-3.5" /> Export</button>
              </div>
              {payouts.length === 0 ? (
                <p className="text-sm text-gray-400">No transactions yet. Bookings with completed payments will appear here.</p>
              ) : (
                <div className="space-y-2">
                  {payouts.map((p) => {
                    const Icon = payoutStatusIcon[p.status] || Clock;
                    const colorClass = payoutStatusColor[p.status] || "";
                    return (
                      <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border ${colorClass}`}>
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold capitalize">{p.status}</p>
                            <p className="text-xs opacity-70">
                              {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) : ""}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold">MYR {Number(p.amount).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardSidebar>
  );
}
