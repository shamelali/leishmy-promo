"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { ClipboardList, Calendar, Clock, User, DollarSign, Filter,
ChevronDown, CheckCircle, XCircle, AlertCircle, ArrowRight, Search
} from "lucide-react";
import { DashboardLoading } from "@/components/DashboardLoading";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { studioItems } from "@/components/dashboard/studioNav";
import { useAuth } from "@/context/AuthContext";
import { useStudioAuth } from "@/lib/auth/studio";

interface Booking {
  id: string;
  userId: string;
  artistId: string | null;
  studioId: string | null;
  service: string;
  date: string;
  time: string | null;
  amount: string;
  depositAmount: string;
  status: string;
  milestone: string;
  artistName: string;
  clientName: string;
  createdAt: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
}

const statusColors: Record<string, string> = {
requested: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50",
quote_pending: "bg-purple-50 text-purple-600 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/50",
quote_sent: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50",
pending: "bg-orange-50 text-orange-600 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/50",
confirmed: "bg-green-50 text-green-600 dark:bg-green-950/30 border-green-100 dark:border-green-900/50",
in_progress: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50",
completed: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50",
cancelled: "bg-red-50 text-red-600 dark:bg-red-950/30 border-red-100 dark:border-red-900/50",
};

const statusIcons: Record<string, typeof Clock> = {
  requested: AlertCircle,
  confirmed: CheckCircle,
  in_progress: ArrowRight,
  completed: CheckCircle,
  cancelled: XCircle,
};

const filterTabs = ["all", "requested", "confirmed", "in_progress", "completed", "cancelled"] as const;

export default function StudioBookings() {
  const { user } = useAuth();
  const { studioRole, isStudioUser, can } = useStudioAuth();
  const pathname = usePathname();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      // Build query parameters for filtering
      const queryParams = new URLSearchParams();
      queryParams.append('userId', user.id);
      
      if (search) {
        queryParams.append('search', search);
      }
      
      if (startDate) {
        queryParams.append('startDate', startDate);
      }
      
      if (endDate) {
        queryParams.append('endDate', endDate);
      }
      
      const [bookingsRes, staffRes] = await Promise.all([
        fetch(`/api/bookings?${queryParams.toString()}`),
        fetch(`/api/user/studio-staff?studioId=${user.id}`),
      ]);
      const bookingsData = await bookingsRes.json();
      const staffData = await staffRes.json();
      setBookings(bookingsData.bookings || []);
      setStaff(staffData.staff || []);
    } catch {
      setError("Failed to load bookings");
    }
    setLoading(false);
  }, [user, search, startDate, endDate]);

  useEffect(() => {
    if (!user?.id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [user?.id, loadData]);

  const handleAssignArtist = async (bookingId: string, artistId: string) => {
    // Check if user has permission to assign bookings
    if (!can("bookings:assign")) {
      setError("You don't have permission to assign bookings");
      return;
    }
    
    setAssigningId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId }),
      });
      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json();
        setError(err.error || "Failed to assign artist");
      }
    } catch {
      setError("Failed to assign artist");
    }
    setAssigningId(null);
  };

  // Apply status filter to the bookings fetched from server
  const filteredBookings = filter === "all" 
    ? bookings 
    : bookings.filter((b) => b.status === filter);
    
  const activeId = studioItems.find((item) => pathname === item.href)?.id || "overview";

  return (
    <DashboardSidebar items={studioItems} activeId={activeId}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h1>
            {can("bookings:export") && (
              <button
                onClick={() => {
                  // TODO: Implement export functionality (CSV/PDF)
                  // For now, we'll just show a placeholder
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
              </button>
            )}
          </div>
          <span className="text-sm text-gray-400">{bookings.length} total</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-1 overflow-x-auto mb-6 pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                filter === tab
                  ? "bg-rose-500 text-white"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
              }`}
            >
              {tab === "all" ? "All" : tab.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        <div className="mb-6 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Filters</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Client name, artist name, or service"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm"
                />
              </div>
              <div className="space-x-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => {
                  setSearch("");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <DashboardLoading />
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">
              {filter === "all" 
                ? (search || startDate || endDate 
                  ? "No bookings match your filters." 
                  : "No bookings yet.") 
                : `No ${filter} bookings.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((b) => {
              const StatusIcon = statusIcons[b.status] || Clock;
              return (
                <div key={b.id} className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-neutral-800 shrink-0">
                      <StatusIcon className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{b.service}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[b.status] || statusColors.requested}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {b.clientName || "Anonymous"}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {b.date ? new Date(b.date).toLocaleDateString("en-MY", { month: "short", day: "numeric", year: "numeric" }) : "—"}</span>
                        {b.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {b.time}</span>}
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> MYR {Number(b.amount).toLocaleString()}</span>
                      </div>
                      {b.artistName && (
                        <p className="text-xs text-blue-500 mt-1">Assigned to: {b.artistName}</p>
                      )}

                      {(!b.artistId && b.status === "requested" && staff.length > 0) && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
                          <p className="text-xs font-medium text-gray-500 mb-2">Assign to staff:</p>
                          <div className="flex flex-wrap gap-2">
                            {staff.map((s) => (
                              <button
                                key={s.id}
                                onClick={() => handleAssignArtist(b.id, s.id)}
                                disabled={assigningId === b.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 disabled:opacity-50 transition-colors"
                              >
                                <User className="w-3 h-3" />
                                {s.name}
                                {assigningId === b.id && <span className="animate-pulse">...</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardSidebar>
  );
}
