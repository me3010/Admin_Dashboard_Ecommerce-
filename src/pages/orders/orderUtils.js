export const ORDER_STATUSES = [
	"pending",
	"confirmed",
	"processing",
	"shipped",
	"delivered",
	"cancelled",
	"returned",
];

export const PAYMENT_METHODS = ["cash", "stripe"];

export const STATUS_STYLES = {
	pending: {
		label: "Pending",
		badge:
			"bg-amber-100 text-amber-800 border-amber-500/50 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/30",
		dot: "bg-amber-500",
	},
	confirmed: {
		label: "Confirmed",
		badge:
			"bg-cyan-100 text-cyan-800 border-cyan-600/40 dark:bg-cyan-400/10 dark:text-cyan-300 dark:border-cyan-400/30",
		dot: "bg-cyan-500",
	},
	processing: {
		label: "Processing",
		badge:
			"bg-indigo-100 text-indigo-800 border-indigo-500/40 dark:bg-indigo-400/10 dark:text-indigo-300 dark:border-indigo-400/30",
		dot: "bg-indigo-500",
	},
	shipped: {
		label: "Shipped",
		badge:
			"bg-blue-100 text-blue-800 border-blue-500/40 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/30",
		dot: "bg-blue-500",
	},
	delivered: {
		label: "Delivered",
		badge:
			"bg-emerald-100 text-emerald-800 border-emerald-600/40 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/30",
		dot: "bg-emerald-500",
	},
	cancelled: {
		label: "Cancelled",
		badge:
			"bg-red-100 text-red-800 border-red-500/40 dark:bg-red-400/10 dark:text-red-300 dark:border-red-400/30",
		dot: "bg-red-500",
	},
	returned: {
		label: "Returned",
		badge:
			"bg-orange-100 text-orange-800 border-orange-500/40 dark:bg-orange-400/10 dark:text-orange-300 dark:border-orange-400/30",
		dot: "bg-orange-500",
	},
};

export const PAYMENT_STYLES = {
	pending:
		"bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300",
	paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300",
	failed: "bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-300",
	refunded:
		"bg-purple-100 text-purple-800 dark:bg-purple-400/10 dark:text-purple-300",
};

export const PAYMENT_METHOD_LABELS = {
	cash: "Cash",
	stripe: "Stripe",
};

export const PAGE_SIZE = 10;

export const extractOrders = (res) => {
	if (Array.isArray(res)) return res;
	const list =
		res?.orders ?? res?.data?.orders ?? res?.data ?? res?.results ?? [];
	return Array.isArray(list) ? list : [];
};

export const extractTotal = (res, list) => {
	const t = res?.total ?? res?.totalOrders ?? res?.count ?? res?.data?.total;
	return Math.max(Number(t) || 0, list.length);
};

const lower = (v, fallback) =>
	typeof v === "string" && v.trim() ? v.trim().toLowerCase() : fallback;

export const normalizeOrder = (o) => {
	const rawId = String(o?._id ?? o?.id ?? "");
	const customer = o?.user ?? o?.customer ?? o?.userId;
	const c = customer && typeof customer === "object" ? customer : {};
	const total = o?.totalPrice ?? o?.totalAmount ?? o?.total ?? o?.amount;

	return {
		raw: o,
		id: rawId,
		shortId: `#${rawId.slice(-8).toUpperCase()}`,
		customerName: c.username ?? c.name ?? c.fullName ?? "",
		customerEmail: c.email ?? "",
		date: o?.createdAt ?? o?.date ?? o?.orderDate ?? null,
		status: lower(o?.status ?? o?.orderStatus, "pending"),
		paymentStatus: lower(o?.paymentStatus ?? o?.payment?.status, "pending"),
		method: lower(o?.paymentMethod ?? o?.payment?.method, ""),
		total: total == null ? null : Number(total),
		items: o?.items ?? o?.orderItems ?? o?.products ?? [],
		address: o?.shippingAddress ?? o?.address ?? null,
	};
};

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sept",
	"Oct",
	"Nov",
	"Dec",
];

export const formatDate = (value) => {
	if (!value) return "—";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "—";
	return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatMoney = (n) =>
	n == null || Number.isNaN(n)
		? "—"
		: `${n.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})} EGP`;

export const capitalize = (s) =>
	s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";

export const getTheme = () => ({
	card: "bg-surface border-line text-ink",
	muted: "text-ink-3",
	input:
		"bg-surface-2 border-line text-ink placeholder:text-ink-3 [--autofill-text:var(--ink)]",
	thead: "bg-surface-2 text-ink-3",
	divider: "border-line",
	rowHover: "hover:bg-surface-2",
	iconBtn:
		"bg-surface-2 border-line text-ink-2 hover:bg-surface-3 hover:text-ink",
	avatar: "bg-brand-soft text-brand-ink",
	menu: "bg-surface border-line text-ink",
	menuItem: "hover:bg-surface-2",
	modal: "bg-surface border-line text-ink",
	accent: "text-brand-ink",
});
