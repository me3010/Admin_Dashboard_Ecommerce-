import {
	AlertTriangle,
	Inbox,
	RefreshCw,
	Search,
	ShoppingCart,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import PageBanner from "../../components/common/PageBanner";
import Pagination from "../../components/common/Pagination";
import Select from "../../components/common/Select";
import useIsDark from "../../hooks/useIsDark";
import {
	useGetAllAdminOrdersQuery,
	useUpdateOrderStatusMutation,
} from "../../redux/features/orders/ordersApiSlice";
import OrderActionsMenu from "./OrderActionsMenu";
import OrderDetailsModal from "./OrderDetailsModal";
import {
	ORDER_STATUSES,
	PAGE_SIZE,
	PAYMENT_METHODS,
	PAYMENT_METHOD_LABELS,
	PAYMENT_STYLES,
	STATUS_STYLES,
	capitalize,
	extractOrders,
	formatDate,
	formatMoney,
	getTheme,
} from "./orderUtils";

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const ROW_H = "h-[76px]";
const COLS = [
	"Order",
	"Customer",
	"Date",
	"Status",
	"Payment",
	"Total",
	"Actions",
];

const lower = (v, fallback = "") =>
	typeof v === "string" && v.trim() ? v.trim().toLowerCase() : fallback;

const normalizeAdminOrder = (o) => {
	const rawId = String(o?._id ?? o?.id ?? "");
	const userObj = o?.user && typeof o.user === "object" ? o.user : {};
	const shipObj =
		o?.shippingAddress && typeof o.shippingAddress === "object"
			? o.shippingAddress
			: {};
	const total = o?.totalPrice ?? o?.totalAmount ?? o?.total ?? o?.amount;

	return {
		raw: o,
		id: rawId,
		shortId: `#${rawId.slice(-8).toUpperCase()}`,
		customerName:
			userObj.username ??
			userObj.name ??
			userObj.fullName ??
			shipObj.fullName ??
			"",
		customerEmail: userObj.email ?? "",
		customerPhone: shipObj.phone ?? userObj.phone ?? "",
		date: o?.createdAt ?? o?.date ?? o?.orderDate ?? null,
		status: lower(o?.status ?? o?.orderStatus, "pending"),
		paymentStatus: lower(o?.paymentStatus ?? o?.payment?.status, "pending"),
		method: lower(o?.paymentMethod ?? o?.payment?.method, ""),
		total: total == null ? null : Number(total),
		items: o?.items ?? o?.orderItems ?? o?.products ?? [],
		address: o?.shippingAddress ?? o?.address ?? null,
	};
};

function StatusBadge({ status }) {
	const s = STATUS_STYLES[status] ?? {
		label: capitalize(status),
		badge:
			"bg-slate-200 text-slate-700 border-slate-400 dark:bg-slate-400/10 dark:text-slate-300 dark:border-slate-400/30",
		dot: "bg-slate-500",
	};
	return (
		<span
			className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${s.badge}`}
		>
			<span className={`h-2 w-2 rounded-full ${s.dot}`} />
			{s.label}
		</span>
	);
}

const Order = () => {
	const isDark = useIsDark();
	const t = getTheme(isDark);

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [paymentFilter, setPaymentFilter] = useState("all");
	const [methodFilter, setMethodFilter] = useState("all");
	const [page, setPage] = useState(1);
	const [selectedId, setSelectedId] = useState(null);
	const [busyId, setBusyId] = useState(null);

	const queryParams = useMemo(() => {
		const params = {
			page,
			limit: PAGE_SIZE,
			sortBy: "createdAt",
			sortDir: "desc",
		};
		if (statusFilter !== "all") params.status = statusFilter;
		if (paymentFilter !== "all") params.paymentStatus = paymentFilter;
		return params;
	}, [page, statusFilter, paymentFilter]);

	const { data, isLoading, isFetching, isError, refetch } =
		useGetAllAdminOrdersQuery(queryParams);
	const [updateOrderStatus, { isLoading: isUpdating }] =
		useUpdateOrderStatusMutation();

	const orders = useMemo(
		() => extractOrders(data).map(normalizeAdminOrder),
		[data],
	);

	const rawServerTotal =
		data?.total ?? data?.totalOrders ?? data?.count ?? data?.data?.total;
	const serverTotal =
		rawServerTotal != null && Number.isFinite(Number(rawServerTotal))
			? Number(rawServerTotal)
			: null;

	const rawServerTotalPages = data?.totalPages ?? data?.data?.totalPages;
	const serverTotalPages =
		rawServerTotalPages != null && Number.isFinite(Number(rawServerTotalPages))
			? Number(rawServerTotalPages)
			: null;

	const hasActiveClientFilters =
		search.trim().length > 0 || methodFilter !== "all";

	const methods = useMemo(() => {
		const extraMethods = orders.map((o) => o.method).filter(Boolean);
		return [...new Set([...PAYMENT_METHODS, ...extraMethods])];
	}, [orders]);

	const rows = useMemo(() => {
		const q = search.trim().toLowerCase().replace(/^#/, "");
		return orders.filter((o) => {
			if (methodFilter !== "all" && o.method !== methodFilter) return false;
			if (!q) return true;
			return [
				o.id,
				o.shortId,
				o.customerName,
				o.customerEmail,
				o.customerPhone,
			].some((v) => String(v).toLowerCase().includes(q));
		});
	}, [orders, search, methodFilter]);

	const totalCount = useMemo(() => {
		if (hasActiveClientFilters) return rows.length;
		if (serverTotal != null && serverTotal > 0) return serverTotal;
		return orders.length;
	}, [hasActiveClientFilters, rows.length, serverTotal, orders.length]);

	const pageCount = useMemo(() => {
		if (hasActiveClientFilters) return 1;
		if (serverTotalPages != null && serverTotalPages > 0) {
			return serverTotalPages;
		}
		if (serverTotal != null && serverTotal > 0) {
			return Math.max(1, Math.ceil(serverTotal / PAGE_SIZE));
		}
		return 1;
	}, [hasActiveClientFilters, serverTotalPages, serverTotal]);

	const currentPage = isLoading ? page : Math.min(Math.max(1, page), pageCount);
	const fillerCount = pageCount > 1 ? Math.max(0, PAGE_SIZE - rows.length) : 0;

	const selectedOrder = useMemo(
		() => orders.find((o) => o.id === selectedId) ?? null,
		[orders, selectedId],
	);

	const withReset = (setter) => (v) => {
		setter(v);
		setPage(1);
	};

	const handlePageChange = (nextPage) => {
		const safePage = Math.min(Math.max(1, Number(nextPage) || 1), pageCount);
		setPage(safePage);
	};

	const handleStatus = async (order, status, adminNote) => {
		if (!order?.id) return;
		setBusyId(order.id);
		try {
			const payload = { id: order.id, status };
			if (typeof adminNote === "string" && adminNote.trim()) {
				payload.adminNote = adminNote.trim();
			}
			await updateOrderStatus(payload).unwrap();
			toast.success(`Order ${order.shortId} → ${capitalize(status)}`);
			setSelectedId(null);
		} catch (err) {
			toast.error(err?.data?.message || "Failed to update order status");
		} finally {
			setBusyId(null);
		}
	};

	const showEmpty = !isLoading && !isError && rows.length === 0;
	const bannerTotal = serverTotal != null ? serverTotal : orders.length;

	return (
		<div className="space-y-4 sm:space-y-5">
			<PageBanner
				icon={ShoppingCart}
				title="Orders"
				subtitle="Track and manage all customer orders in one place."
				stats={[
					{
						label: "total orders",
						value: bannerTotal.toLocaleString("en-US"),
					},
				]}
			/>

			<section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_180px]">
				<div className="relative sm:col-span-2 lg:col-span-1">
					<Search
						size={18}
						className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
					/>
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search ID, customer, phone…"
						aria-label="Search orders"
						autoComplete="off"
						className={`h-12 w-full rounded-2xl border pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand/50 ${t.input}`}
					/>
				</div>

				<Select
					ariaLabel="Filter by status"
					value={statusFilter}
					onChange={withReset(setStatusFilter)}
					options={[
						{ value: "all", label: "All statuses" },
						...ORDER_STATUSES.map((s) => ({
							value: s,
							label: STATUS_STYLES[s]?.label ?? capitalize(s),
						})),
					]}
				/>

				<Select
					ariaLabel="Filter by payment"
					value={paymentFilter}
					onChange={withReset(setPaymentFilter)}
					options={[
						{ value: "all", label: "All payments" },
						...PAYMENT_STATUSES.map((s) => ({
							value: s,
							label: capitalize(s),
						})),
					]}
				/>

				<Select
					ariaLabel="Filter by method"
					value={methodFilter}
					onChange={withReset(setMethodFilter)}
					options={[
						{ value: "all", label: "All methods" },
						...methods.map((m) => ({
							value: m,
							label: PAYMENT_METHOD_LABELS[m] ?? capitalize(m),
						})),
					]}
				/>
			</section>

			<section
				className={`overflow-hidden rounded-3xl border shadow-card ${t.card}`}
			>
				<div className="overflow-x-auto">
					<table className="w-full min-w-245 table-fixed text-sm">
						<colgroup>
							<col className="w-30" />
							<col />
							<col className="w-33" />
							<col className="w-37" />
							<col className="w-33" />
							<col className="w-35" />
							<col className="w-21" />
						</colgroup>
						<thead>
							<tr
								className={`h-12 text-left text-xs font-bold tracking-wide ${t.thead}`}
							>
								{COLS.map((c, i) => (
									<th
										key={c}
										scope="col"
										className={`${i === 0 ? "pl-6" : "px-4"} ${i === COLS.length - 1 ? "pr-6 text-right" : ""}`}
									>
										{c}
									</th>
								))}
							</tr>
						</thead>

						<tbody>
							{isLoading &&
								Array.from({ length: PAGE_SIZE }, (_, i) => `sk${i}`).map(
									(rowKey) => (
										<tr
											key={rowKey}
											className={`border-t ${t.divider} ${ROW_H}`}
										>
											{COLS.map((c) => (
												<td key={c} className="px-4">
													<div className="h-4 animate-pulse rounded-full bg-ink-3/20" />
												</td>
											))}
										</tr>
									),
								)}

							{!isLoading &&
								rows.map((o) => (
									<tr
										key={o.id}
										className={`border-t transition-colors ${ROW_H} ${t.divider} ${t.rowHover}`}
									>
										<td className="truncate pl-6 pr-2 font-mono text-xs font-bold">
											{o.shortId}
										</td>

										<td className="px-4">
											<div className="flex min-w-0 items-center gap-3">
												<div
													className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold ${t.avatar}`}
												>
													{(o.customerName || "U").charAt(0).toUpperCase()}
												</div>
												<div className="min-w-0">
													<p className="truncate font-semibold">
														{o.customerName || "—"}
													</p>
													{(o.customerEmail || o.customerPhone) && (
														<p className={`truncate text-xs ${t.muted}`}>
															{o.customerEmail || o.customerPhone}
														</p>
													)}
												</div>
											</div>
										</td>

										<td className={`whitespace-nowrap px-4 ${t.muted}`}>
											{formatDate(o.date)}
										</td>

										<td className="px-4">
											<StatusBadge status={o.status} />
										</td>

										<td className="px-4">
											<span
												className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold ${
													PAYMENT_STYLES[o.paymentStatus] ??
													"bg-slate-200 text-slate-700 dark:bg-slate-400/10 dark:text-slate-300"
												}`}
											>
												{capitalize(o.paymentStatus)}
											</span>
											<p className={`mt-1 truncate text-xs ${t.muted}`}>
												{PAYMENT_METHOD_LABELS[o.method] ??
													capitalize(o.method)}
											</p>
										</td>

										<td className="whitespace-nowrap px-4 font-semibold tabular-nums">
											{formatMoney(o.total)}
										</td>

										<td className="pl-2 pr-6">
											<div className="flex justify-end">
												<OrderActionsMenu
													order={o}
													isDark={isDark}
													busy={busyId === o.id}
													onView={(ord) => setSelectedId(ord.id)}
													onStatus={handleStatus}
												/>
											</div>
										</td>
									</tr>
								))}

							{!isLoading &&
								Array.from({ length: fillerCount }, (_, i) => `f${i}`).map(
									(k) => (
										<tr key={k} className={`border-t ${t.divider} ${ROW_H}`}>
											<td colSpan={COLS.length} />
										</tr>
									),
								)}
						</tbody>
					</table>
				</div>

				{isError && (
					<div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
						<AlertTriangle size={32} className="text-red-500" />
						<p className="font-semibold">Couldn’t load orders</p>
						<button
							type="button"
							onClick={refetch}
							className="flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-400/40 bg-linear-to-r from-slate-800 to-cyan-800 px-4 py-2 text-xs font-semibold text-white"
						>
							<RefreshCw
								size={14}
								className={isFetching ? "animate-spin" : ""}
							/>
							Retry
						</button>
					</div>
				)}

				{showEmpty && (
					<div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
						<Inbox size={32} className="text-ink-3" />
						<p className="font-semibold">No orders found</p>
						<p className={`text-xs ${t.muted}`}>
							Try changing the search or filters.
						</p>
					</div>
				)}

				{!isLoading && !isError && rows.length > 0 && (
					<Pagination
						page={currentPage}
						pageCount={pageCount}
						total={totalCount}
						pageSize={PAGE_SIZE}
						onChange={handlePageChange}
					/>
				)}
			</section>

			{selectedOrder && (
				<OrderDetailsModal
					key={selectedOrder.id}
					order={selectedOrder}
					isDark={isDark}
					saving={isUpdating}
					onClose={() => setSelectedId(null)}
					onSave={handleStatus}
				/>
			)}
		</div>
	);
};

export default Order;
