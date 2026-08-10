"use client";

import { useState, useEffect, useCallback } from "react";
import {
	User,
	Image,
	Calendar,
	Tag,
	Wallet,
	Package,
	Percent,
	FileText,
	Lock,
	Clock,
	BarChart3,
} from "lucide-react";
import Skeleton from "@/components/Skeleton";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { artistItems } from "@/components/dashboard/artistNav";
import { useAuth } from "@/context/AuthContext";
import type { ArtistProfileEditValues } from "@/components/ArtistProfileEditForm";
import {
	ProfileTab,
	PortfolioTab,
	BookingsTab,
	QuotesTab,
	PricesTab,
	PackagesTab,
	PricingRulesTab,
	PayoutsTab,
	AvailabilityTab,
	AnalyticsTab,
} from "@/components/artist-dashboard";
import ChangePassword from "@/components/ChangePassword";

type TabId =
	| "profile"
	| "portfolio"
	| "bookings"
	| "quotes"
	| "prices"
	| "packages"
	| "pricing"
	| "payouts"
	| "availability"
	| "analytics"
	| "account";

interface Payout {
	id: string;
	amount: number;
	status: string;
}

export default function DashboardArtist() {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [bookings, setBookings] = useState<any[]>([]);
	const [activeTab, setActiveTab] = useState<TabId>(() => {
		if (typeof window === "undefined") return "bookings";
		const fromHash = window.location.hash.replace(/^#\/?/, "") as TabId;
		return fromHash || "bookings";
	});

	const handleTabChange = useCallback((id: string) => {
		setActiveTab(id as TabId);
		if (typeof window !== "undefined") {
			history.replaceState(null, "", `#/${id}`);
		}
	}, []);

	useEffect(() => {
		let cancelled = false;

		async function fetchData() {
			try {
				if (!user?.id) {
					throw new Error("No session");
				}
				const bookingsRes = await fetch(`/api/bookings?artistId=${encodeURIComponent(user.id)}&limit=50`);

				if (!bookingsRes.ok) {
					throw new Error("Failed to fetch dashboard data");
				}

				const bookingsData = await bookingsRes.json();

				if (!cancelled) {
					setBookings(bookingsData.bookings ?? []);
				}
			} catch (err) {
				if (!cancelled) {
					console.error("Artist dashboard load error:", err);
					setError("Failed to load dashboard data");
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		fetchData();

		return () => {
			cancelled = true;
		};
	}, [user?.id]);

	const handleAcceptQuote = useCallback(async (quoteId: string) => {
		if (!user?.id) return;
		await fetch(`/api/quotes/${quoteId}/accept`, {
			method: "POST",
		});
	}, [user?.id]);

	const handleRejectQuote = useCallback(async (quoteId: string) => {
		if (!user?.id) return;
		await fetch(`/api/quotes/${quoteId}/reject`, {
			method: "POST",
		});
	}, [user?.id]);

	const handleConfirm = useCallback(async (bookingId: string) => {
		if (!user?.id) return;
		// Direct accept at fixed price
		await fetch(`/api/bookings/${bookingId}/accept`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ bookingId: Number(bookingId) }),
		});
		setBookings((prev) =>
			prev.map((b) => (b.id === bookingId ? { ...b, status: "pending" } : b)),
		);
	}, [user?.id]);

	// eslint-disable-next-line react-hooks/preserve-manual-memoization
	const handleReject = useCallback(async (bookingId: string) => {
		if (!user?.id) return;
		await fetch("/api/user/reject-booking", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ bookingId, userId: user.id }),
		});
		setBookings((prev) =>
			prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b)),
		);
	}, [user?.id]);

	const handleStartService = useCallback(async (bookingId: string) => {
		await fetch("/api/bookings", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: Number(bookingId), status: "active" }),
		});
		setBookings((prev) =>
			prev.map((b) => (b.id === bookingId ? { ...b, status: "active" } : b)),
		);
	}, []);

const handleSendQuote = useCallback(async (bookingId: string, customAmount: number | null) => {
  if (!user?.id) return;
  
  // Send a custom quote for this booking
  await fetch("/api/quotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookingId: Number(bookingId),
      amount: customAmount ? String(customAmount) : undefined,
      notes: "Custom quote sent from artist dashboard",
    }),
  });
  
  // Update booking status to quote_pending if it was requested
  setBookings((prev) =>
    prev.map((b) => (
      b.id === bookingId && b.status === "requested"
        ? { ...b, status: "quote_pending" }
        : b
    ))
  );
}, [user?.id]);


	const handleCompleteService = useCallback(async (bookingId: string) => {
		await fetch("/api/bookings", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: Number(bookingId), status: "completed" }),
		});
		setBookings((prev) =>
			prev.map((b) =>
				b.id === bookingId ? { ...b, status: "completed" } : b,
			),
		);
	}, []);

	const handleReleasePayment = useCallback(async (bookingId: string) => {
		await fetch("/api/bookings", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: Number(bookingId), status: "paid" }),
		});
		setBookings((prev) =>
			prev.map((b) => (b.id === bookingId ? { ...b, status: "paid" } : b)),
		);
	}, []);

	const handleUpdateService = useCallback(
		async (serviceId: string, data: Record<string, unknown>) => {
			const res = await fetch(`/api/services/${serviceId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error("Failed to update service");
		},
		[],
	);

	const handleUpdatePrice = useCallback(
		async (priceId: string, data: Record<string, unknown>) => {
			const res = await fetch(`/api/services/prices/${priceId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error("Failed to update price");
		},
		[],
	);

	const renderContent = () => {
		if (loading) {
			return (
				<div className="p-6 space-y-4">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-64 w-full" />
				</div>
			);
		}

		if (error) {
			return (
				<div className="p-6">
					<p className="text-red-400">{error}</p>
				</div>
			);
		}

  switch (activeTab) {
    case "profile":
      return (
        <ProfileTab
          profile={{
            name: user?.name ?? "",
            email: user?.email ?? "",
            phone: "",
            location: "",
            area: "",
            district: "",
            bio: "",
            experience: 0,
            languages: [],
            specialties: [],
            portfolio: [],
            responseTime: "",
            price: 0,
            showPrices: true,
            certifications: "",
            availability: "",
            availabilityNotes: "",
            socialProfiles: "",
            image: "",
          }}
          available
          onUpdate={async () => {}}
          userId={user?.id ?? ""}
        />
      );
    case "portfolio":
      return (
        <PortfolioTab
          portfolio={[]}
          userId={user?.id ?? ""}
          onUpdate={async () => {}}
        />
      );
    case "bookings":
      return (
        <BookingsTab
          bookings={bookings}
          onConfirm={handleConfirm}
          onReject={handleReject}
          onSendQuote={handleSendQuote}
          onStartService={handleStartService}
          isProvider={true}
          onCompleteService={handleCompleteService}
        />
      );
    case "prices":
      return (
        <PricesTab
          services={[]}
          showPrices
          userId={user?.id ?? ""}
          onUpdate={async () => {}}
          onToggleShowPrices={() => {}}
        />
      );
    case "packages":
      return (
        <PackagesTab
          artistId={user?.id ?? ""}
          services={[]}
        />
      );
    case "pricing":
      return <PricingRulesTab />;
    case "payouts":
      return <PayoutsTab payouts={[]} bankAccounts={[]} pendingBalance={0} userId={user?.id ?? ""} onRefresh={() => {}} />;
    case "availability":
      return <AvailabilityTab />;
    case "analytics":
      return <AnalyticsTab />;
    case "account":
      return <ChangePassword />;
    default:
      return null;
  }
	};

  return (
    <DashboardSidebar items={artistItems} activeId={activeTab} onTabChange={handleTabChange}>
      <div className="min-h-screen bg-neutral-950">
        <main className="lg:ml-64 p-6">{renderContent()}</main>
      </div>
    </DashboardSidebar>
  );
}
