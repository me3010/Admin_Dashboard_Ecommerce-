import {
	ArrowRight,
	Banknote,
	Box,
	Clock,
	RefreshCw,
	ShoppingBag,
	ShoppingCart,
	UsersRound,
} from "lucide-react";
import { useMemo } from "react";

import { Link } from "react-router-dom";
import { useGetAdminDashboardStatsQuery } from "../../redux/features/orders/ordersApiSlice";

const numberFormatter = new Intl.NumberFormat(undefined, {
	maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat(undefined, {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
	month: "short",
	day: "numeric",
	year: "numeric",
});

const localProductImages = [
	{ keywords: ["phone", "smartphone", "mobile"], src: "/phone.jfif" },
	{ keywords: ["air fryer", "airfryer", "air-fryers"], src: "/AirFryers.jfif" },
	{ keywords: ["shoes", "sneakers", "shoe"], src: "/shoes.jfif" },
	{ keywords: ["lamp", "lighting"], src: "/lamp.jfif" },
];

const cardToneStyles = {
	teal: {
		border:
			"before:bg-gradient-to-r before:from-emerald-400 before:to-teal-500",
		icon: "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-emerald-950/30",
	},
	orange: {
		border:
			"before:bg-gradient-to-r before:from-amber-400 before:to-orange-500",
		icon: "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-950/30",
	},
	pink: {
		border: "before:bg-gradient-to-r before:from-pink-500 before:to-rose-500",
		icon: "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-pink-950/30",
	},
	cyan: {
		border: "before:bg-gradient-to-r before:from-cyan-400 before:to-sky-500",
		icon: "bg-gradient-to-br from-cyan-400 to-sky-500 text-white shadow-sky-950/30",
	},
	purple: {
		border:
			"before:bg-gradient-to-r before:from-purple-500 before:to-fuchsia-500",
		icon: "bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white shadow-purple-950/30",
	},
	slate: {
		border: "before:bg-gradient-to-r before:from-slate-500 before:to-slate-700",
		icon: "bg-gradient-to-br from-slate-500 to-slate-700 text-white shadow-slate-950/30",
	},
};

const statusBadgeStyles = {
	pending: "border-amber-500 bg-white text-amber-500",
	processing: "border-sky-500 bg-white text-sky-500",
	confirmed: "border-cyan-500 bg-white text-cyan-500",
	shipped: "border-violet-500 bg-white text-violet-500",
	delivered: "border-emerald-500 bg-white text-emerald-500",
	cancelled: "border-rose-500 bg-white text-rose-500",
	returned: "border-orange-500 bg-white text-orange-500",
};

const statusSummaryStyles = {
	pending:
		"border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
	processing: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
	confirmed:
		"border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
	shipped:
		"border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
	delivered:
		"border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
	cancelled:
		"border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
	returned:
		"border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
};

const defaultStatuses = [
	"pending",
	"processing",
	"confirmed",
	"shipped",
	"delivered",
	"cancelled",
];

function formatNumber(value) {
	return numberFormatter.format(Number(value) || 0);
}

function formatMoney(value) {
	return currencyFormatter.format(Number(value) || 0);
}

function formatDate(value) {
	if (!value) return "—";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function getProductImage(product, index = 0) {
	const name = String(product?.name || "").toLowerCase();

	const matchedImage = localProductImages.find(({ keywords }) =>
		keywords.some((keyword) => name.includes(keyword)),
	);

	if (matchedImage) {
		return matchedImage.src;
	}

	const candidate =
		product?.image ||
		product?.imageUrl ||
		product?.thumbnail ||
		(Array.isArray(product?.images) ? product.images[0] : "") ||
		(Array.isArray(product?.photos) ? product.photos[0] : "");

	if (typeof candidate === "string" && candidate.trim()) {
		return candidate;
	}

	if (candidate && typeof candidate === "object") {
		const url = candidate.url || candidate.secure_url || candidate.src;
		if (url) return url;
	}

	return localProductImages[index % localProductImages.length].src;
}

function getErrorMessage(error) {
	if (typeof error?.data?.message === "string") return error.data.message;
	if (typeof error?.error === "string") return error.error;
	return "Please try again in a moment.";
}

function Panel({ children, className = "", ...props }) {
	return (
		<section
			className={`rounded-[20px] border border-slate-300 bg-[#e8eef5] p-5 shadow-[7px_7px_16px_rgba(148,163,184,0.38),-7px_-7px_16px_rgba(255,255,255,0.75)] backdrop-blur-sm transition-colors duration-200 dark:border-cyan-900/70 dark:bg-[#0b111b]/95 dark:shadow-[0_0_24px_rgba(34,211,238,0.035)] sm:p-6 ${className}`}
			{...props}
		>
			{children}
		</section>
	);
}

function SectionHeading({ eyebrow, title, right }) {
	return (
		<div className="mb-5 flex flex-wrap items-start justify-between gap-3">
			<div>
				{eyebrow && (
					<p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-500 dark:text-cyan-400">
						{eyebrow}
					</p>
				)}
				<h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
					{title}
				</h2>
			</div>
			{right}
		</div>
	);
}

function StatCard({
	title,
	value,
	detail,
	icon: Icon,
	tone = "teal",
	compactValue = false,
}) {
	const style = cardToneStyles[tone] || cardToneStyles.teal;

	return (
		<article
			className={`group relative min-w-0 overflow-hidden rounded-[18px] border border-slate-300 bg-[#e8eef5] p-4 shadow-[7px_7px_16px_rgba(148,163,184,0.38),-7px_-7px_16px_rgba(255,255,255,0.75)] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-cyan-500/60 hover:shadow-xl motion-reduce:transform-none motion-reduce:transition-none before:absolute before:left-0 before:right-0 before:top-0 before:h-1 dark:border-cyan-900/70 dark:bg-linear-to-br dark:from-[#101a25] dark:to-[#11131f] dark:shadow-[0_0_18px_rgba(34,211,238,0.05)] dark:hover:border-cyan-400/70 dark:hover:shadow-cyan-950/25 ${style.border}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="text-sm font-medium text-slate-600 dark:text-slate-400">
						{title}
					</p>
					<p
						className={`mt-4 font-extrabold tracking-tight text-slate-900 dark:text-white ${
							compactValue
								? "line-clamp-2 text-xl leading-snug sm:text-2xl"
								: "wrap-break-word text-[28px] leading-tight sm:text-[30px]"
						}`}
					>
						{value}
					</p>
				</div>
				<span
					className={`grid size-13 shrink-0 place-items-center rounded-2xl shadow-lg ${style.icon}`}
				>
					<Icon size={23} strokeWidth={2.1} aria-hidden="true" />
				</span>
			</div>
			<p className="mt-2 min-h-5 text-xs text-slate-500">{detail}</p>
			<div className="mt-5 h-px bg-slate-300 dark:bg-slate-800/80" />
		</article>
	);
}

function StatusBadge({ status = "pending" }) {
	const normalized = String(status).toLowerCase();

	return (
		<span
			className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
				statusBadgeStyles[normalized] ||
				"border-slate-700 bg-slate-800 text-slate-300"
			}`}
		>
			{normalized}
		</span>
	);
}

function EmptyState({ message }) {
	return (
		<div className="grid min-h-28 place-items-center rounded-2xl border border-dashed border-slate-300 bg-[#f8fafc] px-4 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-[#080f20] dark:text-slate-500">
			{message}
		</div>
	);
}

function StatsGrid({
	revenue,
	orders,
	totalCustomers,
	monthlyRevenue,
	topProduct,
}) {
	const topProductSold =
		topProduct?.totalSold ?? topProduct?.sold ?? topProduct?.quantity ?? 0;

	const stats = [
		{
			key: "total-orders",
			title: "Total Orders",
			value: formatNumber(orders.total),
			detail: "All orders received",
			icon: ShoppingBag,
			tone: "teal",
		},
		{
			key: "pending-orders",
			title: "Pending Orders",
			value: formatNumber(orders.pending),
			detail: "Awaiting action",
			icon: Clock,
			tone: "orange",
		},
		{
			key: "revenue",
			title: "Revenue",
			value: formatMoney(revenue.total),
			detail:
				revenue.growthPercent == null
					? "Total gross revenue"
					: `${formatNumber(revenue.growthPercent)}% vs. last month`,
			icon: Banknote,
			tone: "pink",
		},
		{
			key: "this-month",
			title: "This Month",
			value: monthlyRevenue == null ? "—" : formatMoney(monthlyRevenue),
			detail: "Monthly sales target",
			icon: ShoppingCart,
			tone: "cyan",
		},
		{
			key: "top-product",
			title: "Top Product",
			value: topProduct?.name || "—",
			detail: topProduct?.name
				? `${formatNumber(topProductSold)} sold`
				: "No sales data yet",
			icon: Box,
			tone: "purple",
			compactValue: true,
		},
		{
			key: "users",
			title: "Users",
			value: formatNumber(totalCustomers),
			detail: "Registered customers",
			icon: UsersRound,
			tone: "slate",
		},
	];

	return (
		<section
			aria-label="Store statistics"
			className="grid gap-4 rounded-[20px] sm:grid-cols-2 lg:grid-cols-3"
		>
			{stats.map(({ key, ...stat }) => (
				<StatCard key={key} {...stat} />
			))}
		</section>
	);
}

function RevenueChartCard() {
	return (
		<div className="min-w-0">
			<div className="relative h-44 overflow-hidden rounded-xl border border-slate-300 bg-[#f8fafc] p-3 dark:border-slate-800 dark:bg-[#080f20]">
				<div
					className="absolute inset-0 opacity-50"
					style={{
						backgroundImage:
							"linear-gradient(to bottom, rgba(71,85,105,.22) 1px, transparent 1px)",
						backgroundSize: "100% 25%",
					}}
				/>
				<svg
					viewBox="0 0 600 170"
					preserveAspectRatio="none"
					className="relative h-full w-full"
					role="img"
					aria-label="Decorative revenue trend visualization"
				>
					<defs>
						<linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#22d3ee" stopOpacity=".35" />
							<stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
						</linearGradient>
					</defs>
					<path
						d="M0 145 C35 115 55 112 85 128 S135 142 170 90 S225 110 260 75 S310 96 350 56 S405 90 445 50 S520 58 600 12 L600 170 L0 170 Z"
						fill="url(#revenueFill)"
					/>
					<path
						d="M0 145 C35 115 55 112 85 128 S135 142 170 90 S225 110 260 75 S310 96 350 56 S405 90 445 50 S520 58 600 12"
						fill="none"
						stroke="#22d3ee"
						strokeWidth="3"
						strokeLinecap="round"
					/>
					<circle
						cx="600"
						cy="12"
						r="5"
						fill="#22d3ee"
						stroke="#a5f3fc"
						strokeWidth="2"
					/>
				</svg>
			</div>
			<div className="mt-3 flex justify-between text-[11px] text-slate-500">
				<span>Overview</span>
				<span>Revenue trend illustration</span>
				<span>Today</span>
			</div>
		</div>
	);
}

function OrderSnapshotCard({ orders }) {
	const totalOrders = Number(orders.total || 0);
	const pendingOrders = Number(orders.pending || 0);
	const deliveredOrders = Number(orders.delivered || 0);
	const otherOrders = Math.max(
		0,
		totalOrders - pendingOrders - deliveredOrders,
	);

	const breakdown = [
		["Pending", "#22d3ee", pendingOrders],
		["Delivered", "#3b82f6", deliveredOrders],
		["Other statuses", "#60a5fa", otherOrders],
	];

	return (
		<div className="rounded-2xl border border-slate-300 bg-[#f8fafc] p-4 dark:border-slate-800 dark:bg-[#080f20]">
			<p className="text-sm font-semibold text-slate-900 dark:text-white">
				Order Snapshot
			</p>
			<p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
				Orders by status
			</p>
			<div
				className="mx-auto my-5 grid size-36 place-items-center rounded-full"
				style={{
					background:
						"conic-gradient(#22d3ee 0 28%, #3b82f6 28% 52%, #60a5fa 52% 70%, #0891b2 70% 86%, #334155 86% 100%)",
				}}
			>
				<div className="grid size-24 place-items-center rounded-full bg-[#f8fafc] text-center dark:bg-[#080f20]">
					<span>
						<strong className="block text-xl text-slate-900 dark:text-white">
							{formatNumber(totalOrders)}
						</strong>
						<small className="text-[10px] text-slate-600 dark:text-slate-400">
							TOTAL ORDERS
						</small>
					</span>
				</div>
			</div>
			<div className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
				{breakdown.map(([label, color, value]) => (
					<div key={label} className="flex items-center justify-between gap-2">
						<span className="flex items-center gap-2">
							<i
								className="size-2 rounded-full"
								style={{ backgroundColor: color }}
							/>
							{label}
						</span>
						<b>{formatNumber(value)}</b>
					</div>
				))}
			</div>
		</div>
	);
}

function RevenueOverview({ revenue, orders }) {
	return (
		<Panel>
			<SectionHeading
				eyebrow="PERFORMANCE"
				title="Revenue Overview"
				right={
					<span className="rounded-lg border border-slate-300 bg-[#f8fafc] px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
						Store summary
					</span>
				}
			/>
			<div className="mb-3 flex items-end justify-between gap-3">
				<div>
					<p className="text-xs text-slate-600 dark:text-slate-400">
						Total revenue
					</p>
					<p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
						{formatMoney(revenue.total)}
					</p>
				</div>
				<span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400">
					{revenue.growthPercent == null
						? "All time"
						: `${formatNumber(revenue.growthPercent)}% growth`}
				</span>
			</div>
			<div className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
				<RevenueChartCard />
				<OrderSnapshotCard orders={orders} />
			</div>
		</Panel>
	);
}

function StatusSummary({ statuses = [], orders = {} }) {
	const rows = useMemo(() => {
		if (statuses.length) return statuses;
		return defaultStatuses
			.map((status) => ({ _id: status, count: orders[status] || 0 }))
			.filter((status) => Number(status.count) > 0);
	}, [statuses, orders]);

	return (
		<Panel>
			<SectionHeading
				eyebrow="Order status"
				title="Live fulfillment breakdown"
				right={
					<span className="mt-1 inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-3 py-1.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
						<span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
						Updated from API
					</span>
				}
			/>
			{rows.length ? (
				<div className="grid gap-3 sm:grid-cols-2">
					{rows.map((status) => {
						const key = String(status._id || "pending").toLowerCase();
						return (
							<div
								key={key}
								className={`rounded-[23px] border p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:brightness-110 hover:shadow-lg sm:p-5 motion-reduce:transform-none motion-reduce:transition-none ${
									statusSummaryStyles[key] ||
									"border-slate-700 bg-slate-800/50 text-slate-300"
								}`}
							>
								<p className="text-xs font-semibold uppercase tracking-[0.3em]">
									{key}
								</p>
								<p className="mt-4 text-[30px] font-bold leading-none">
									{formatNumber(status.count)}
								</p>
							</div>
						);
					})}
				</div>
			) : (
				<EmptyState message="No order statuses to display yet." />
			)}
		</Panel>
	);
}

function RecentOrders({ orders = [] }) {
	const visibleOrders = useMemo(() => orders.slice(0, 6), [orders]);

	return (
		<Panel className="overflow-hidden">
			<SectionHeading
				eyebrow="Recent orders"
				title="Latest customer activity"
				right={
					<span className="rounded-full bg-cyan-600/10 px-3 py-1.5 text-xs font-medium text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-300">
						{orders.length} orders
					</span>
				}
			/>
			{visibleOrders.length ? (
				<div className="space-y-3">
					{visibleOrders.map((order, index) => {
						const customer =
							order.user?.name ||
							order.user?.username ||
							order.customer?.name ||
							order.shippingAddress?.fullName ||
							"Customer";
						const items = Array.isArray(order.orderItems)
							? order.orderItems
							: Array.isArray(order.items)
								? order.items
								: [];
						const productNames = items
							.map((item) => item.name || item.product?.name)
							.filter(Boolean)
							.slice(0, 2)
							.join(", ");
						const status = String(order.status || "pending").toLowerCase();

						return (
							<div
								key={order._id || index}
								className="flex flex-col gap-3 rounded-[22px] border border-slate-300 bg-[#e8eef5] px-4 py-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:border-slate-400 hover:bg-[#f8fafc] hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none dark:border-slate-800 dark:bg-[#050b1b] dark:hover:border-slate-600 dark:hover:bg-[#081126] dark:hover:shadow-cyan-950/20 sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="min-w-0">
									<p className="text-sm font-semibold text-slate-900 dark:text-white">
										{customer}
									</p>
									<p className="mt-1 truncate text-xs text-slate-600 dark:text-slate-400">
										{productNames ||
											`Order #${String(order._id || "").slice(-7) || "—"}`}
										<span className="px-1.5 text-slate-500">·</span>
										{formatDate(order.createdAt)}
									</p>
								</div>
								<div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
									<StatusBadge status={status} />
									<span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
										{formatMoney(order.totalPrice)}
									</span>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<EmptyState message="No recent orders yet." />
			)}
			<div className="mt-5 flex justify-end">
				<Link
					to="/dashboard/orders"
					className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 transition hover:text-cyan-500 dark:text-cyan-300 dark:hover:text-cyan-200"
				>
					View all orders <ArrowRight size={16} aria-hidden="true" />
				</Link>
			</div>
		</Panel>
	);
}

function TopProducts({ products = [] }) {
	const visibleProducts = useMemo(() => products.slice(0, 6), [products]);

	return (
		<Panel className="overflow-hidden">
			<SectionHeading
				eyebrow="Top products"
				title="Best sellers"
				right={
					<Link
						to="/dashboard/products"
						className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-600 transition hover:text-cyan-500 dark:text-cyan-300 dark:hover:text-cyan-200"
					>
						All products <ArrowRight size={15} aria-hidden="true" />
					</Link>
				}
			/>
			{visibleProducts.length ? (
				<div className="space-y-3">
					{visibleProducts.map((product, index) => (
						<div
							key={product._id || index}
							className="flex min-w-0 items-center gap-3 rounded-[22px] border border-slate-300 bg-[#e8eef5] p-3.5 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-slate-400 hover:bg-[#f8fafc] hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none dark:border-slate-800 dark:bg-[#050b1b] dark:hover:border-slate-600 dark:hover:bg-[#081126] dark:hover:shadow-cyan-950/20 sm:gap-4"
						>
							<img
								src={getProductImage(product, index)}
								alt={product.name || "Product"}
								loading="lazy"
								className="size-17 shrink-0 rounded-2xl border border-slate-800 bg-slate-900 object-cover shadow-sm sm:size-19"
								onError={(event) => {
									event.currentTarget.onerror = null;
									event.currentTarget.src =
										"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=240&q=80";
								}}
							/>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-bold text-slate-900 dark:text-white">
									{product.name || "Unnamed product"}
								</p>
								<p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
									{formatNumber(product.totalSold)} units sold
									<span className="px-1.5 text-slate-500">·</span>
									{formatMoney(product.revenue)}
								</p>
							</div>
							<span className="hidden rounded-xl bg-violet-500/10 p-2.5 text-violet-600 dark:text-violet-300 sm:grid">
								<Box size={19} aria-hidden="true" />
							</span>
						</div>
					))}
				</div>
			) : (
				<EmptyState message="No product sales to display yet." />
			)}
		</Panel>
	);
}

function DashboardSkeleton() {
	const pulse =
		"animate-pulse rounded bg-slate-200 dark:bg-slate-700/70 motion-reduce:animate-none";
	const surface =
		"border-slate-300 bg-white/80 dark:border-slate-800 dark:bg-slate-900/70";

	return (
		<output
			aria-live="polite"
			aria-label="Loading dashboard"
			className="m-3 block min-h-screen rounded-[28px] border border-slate-300 bg-[#e2e8f0] px-3 py-6 text-slate-900 shadow-2xl transition-colors duration-300 dark:border-cyan-500/30 dark:bg-[#050a12] dark:text-slate-100 sm:m-5 sm:px-5 sm:py-8 lg:m-7 lg:px-7"
		>
			<div className="mx-auto max-w-360">
				<div className="mb-8 flex flex-col items-center text-center">
					<div className="mb-3 grid size-16 place-items-center overflow-hidden rounded-2xl border border-cyan-500/30 bg-white p-2 shadow-lg shadow-cyan-950/10">
						<img
							src="https://i.pinimg.com/736x/4c/94/0d/4c940d51cc08a9007d20b690aaeafbb9.jpg"
							alt="Veyora Store Logo"
							className="size-full rounded-xl object-cover"
						/>
					</div>
					<h1 className="text-xl font-bold tracking-tight sm:text-2xl">
						Veyora Store
					</h1>
					<p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
						<span className="size-2 animate-pulse rounded-full bg-cyan-500 motion-reduce:animate-none" />
						Loading dashboard...
					</p>
				</div>

				<div className="space-y-5 sm:space-y-6">
					<section className={`rounded-[20px] border p-5 sm:p-6 ${surface}`}>
						<div className="mb-6 space-y-3">
							<div className={`h-3 w-28 max-w-full ${pulse}`} />
							<div className={`h-7 w-56 max-w-full ${pulse}`} />
							<div className={`h-4 w-72 max-w-full ${pulse}`} />
						</div>
						<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
							{["revenue", "orders", "customers", "products"].map((stat) => (
								<article
									key={stat}
									className={`rounded-[18px] border p-4 ${surface}`}
								>
									<div className="flex items-start justify-between gap-4">
										<div className="w-full space-y-4">
											<div className={`h-3 w-24 max-w-full ${pulse}`} />
											<div className={`h-8 w-32 max-w-full ${pulse}`} />
										</div>
										<div
											className={
												"size-12·shrink-0·animate-pulse·rounded-2xl·bg-slate-200·dark:bg-slate-700/70·motion-reduce:animate-none"
											}
										/>
									</div>
									<div className={`mt-5 h-3 w-3/4 ${pulse}`} />
								</article>
							))}
						</div>
					</section>

					<div className="grid gap-5 xl:grid-cols-2">
						{[0, 1].map((panel) => (
							<section
								key={panel}
								className={`rounded-[20px] border p-5 sm:p-6 ${surface}`}
							>
								<div className="mb-6 space-y-3">
									<div className={`h-3 w-24 max-w-full ${pulse}`} />
									<div className={`h-6 w-48 max-w-full ${pulse}`} />
								</div>
								<div className="space-y-3">
									{["first", "second", "third"].map((row) => (
										<div
											key={row}
											className={`flex items-center gap-4 rounded-2xl border p-4 ${surface}`}
										>
											<div
												className={
													"size-12·shrink-0·animate-pulse·rounded-xl·bg-slate-200·dark:bg-slate-700/70·motion-reduce:animate-none"
												}
											/>
											<div className="flex-1 space-y-3">
												<div className={`h-3 w-2/3 ${pulse}`} />
												<div className={`h-3 w-1/2 ${pulse}`} />
											</div>
											<div
												className={
													"h-6·w-16·animate-pulse·rounded-full·bg-slate-200·dark:bg-slate-700/70·motion-reduce:animate-none"
												}
											/>
										</div>
									))}
								</div>
							</section>
						))}
					</div>
				</div>
			</div>
		</output>
	);
}

export default function Dashboard() {
	const { data, error, isError, isFetching, isLoading, refetch } =
		useGetAdminDashboardStatsQuery();
	const dashboard = data?.dashboard;

	if (isLoading) {
		return <DashboardSkeleton />;
	}

	if (isError || !dashboard) {
		return (
			<div className="mx-auto mt-8 max-w-xl rounded-3xl border border-rose-500/30 bg-[#0e1729] p-7 text-center">
				<span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-500/10 text-rose-300">
					<Box size={22} aria-hidden="true" />
				</span>
				<h1 className="mt-4 text-xl font-bold text-white">
					Dashboard data unavailable
				</h1>
				<p className="mt-2 text-sm text-slate-400">{getErrorMessage(error)}</p>
				<button
					className="mt-5 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white transition hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60"
					disabled={isFetching}
					onClick={() => refetch()}
					type="button"
				>
					<RefreshCw
						size={15}
						className={isFetching ? "animate-spin" : ""}
						aria-hidden="true"
					/>
					Try again
				</button>
			</div>
		);
	}

	const {
		orders = {},
		revenue = {},
		recentOrders = [],
		topProducts = [],
	} = dashboard;

	const monthlyRevenue =
		revenue.thisMonth ?? revenue.monthly ?? dashboard.monthlyRevenue;
	const totalCustomers =
		dashboard.totalCustomers ??
		dashboard.customersCount ??
		dashboard.usersCount;
	const topProduct = topProducts[0] || dashboard.topProduct || null;

	return (
		<main className="relative m-3 min-h-screen overflow-hidden rounded-[28px] border border-slate-300 bg-[#e2e8f0] px-3 py-5 text-slate-900 shadow-2xl transition-colors duration-300 dark:border-cyan-500/30 dark:bg-[#050a12] dark:text-slate-100 sm:m-5 sm:px-5 sm:py-6 lg:m-7 lg:px-7">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-90 bg-[radial-gradient(ellipse_at_12%_0%,rgba(6,182,212,0.09),transparent_55%),radial-gradient(ellipse_at_90%_0%,rgba(37,99,235,0.07),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_12%_0%,rgba(6,182,212,0.10),transparent_55%),radial-gradient(ellipse_at_90%_0%,rgba(37,99,235,0.10),transparent_45%)]" />
			<div className="relative mx-auto max-w-360 space-y-5 pb-10 sm:space-y-6">
				<Panel className="relative overflow-hidden border-slate-300 bg-[#e8eef5] px-5 py-7 dark:border-slate-700/80 dark:bg-linear-to-br dark:from-[#0b1728] dark:via-[#0e1729] dark:to-[#101827] sm:px-8 sm:py-8">
					<div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-cyan-500/10 blur-3xl" />
					<div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
						<div>
							<p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-cyan-500 dark:text-cyan-400">
								STORE OVERVIEW
							</p>
							<h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
								Dashboard
							</h1>
							<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
								Here’s what’s happening with your store today.
							</p>
						</div>
					</div>
				</Panel>

				<StatsGrid
					revenue={revenue}
					orders={orders}
					totalCustomers={totalCustomers}
					monthlyRevenue={monthlyRevenue}
					topProduct={topProduct}
				/>

				<div className="grid gap-5 xl:grid-cols-[1.7fr_0.9fr]">
					<RevenueOverview revenue={revenue} orders={orders} />
					<StatusSummary orders={orders} statuses={dashboard.ordersByStatus} />
				</div>

				<div className="grid gap-5 xl:grid-cols-2">
					<TopProducts products={topProducts} />
					<RecentOrders orders={recentOrders} />
				</div>
			</div>
		</main>
	);
}
