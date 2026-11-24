import {
	AlertTriangle,
	ChevronDown,
	Crown,
	Inbox,
	Package,
	RefreshCw,
	Search,
	ShoppingCart,
	Ticket,
	Wallet,
} from "lucide-react";
import { Fragment, useState } from "react";
import PageBanner from "../../components/common/PageBanner";
import Pagination from "../../components/common/Pagination";
import Select from "../../components/common/Select";
import useIsDark from "../../hooks/useIsDark";
import { useGetAdminAllCartsQuery } from "../../redux/features/orders/ordersApiSlice";
import { useGetSingleProductQuery } from "../../redux/features/products/productsApiSlice";
import {
	PAGE_SIZE,
	formatDate,
	formatMoney,
	getTheme,
} from "../orders/orderUtils";

const STALE_DAYS = 7;
const ROW_H = "h-[76px]";
const COLS = ["Customer", "Products", "Quantity", "Total", "Updated", ""];

const FILTERS = [
	{ value: "all", label: "All carts" },
	{ value: "high", label: "High value" },
	{ value: "stale", label: "Stale" },
	{ value: "single", label: "Single item" },
	{ value: "coupon", label: "With coupon" },
];

const SORTS = [
	{ value: "newest", label: "Newest first" },
	{ value: "total", label: "Highest total" },
];

const getItems = (cart) => cart.items ?? [];

const getSubtotal = (cart) =>
	cart.subtotal ??
	getItems(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);

const getItemCount = (cart) =>
	cart.itemCount ??
	getItems(cart).reduce((sum, item) => sum + item.quantity, 0);

const getDiscount = (cart) => {
	const coupon = cart.coupon;
	if (!coupon?.code) return 0;

	const subtotal = getSubtotal(cart);
	let discount = coupon.discountValue;
	if (coupon.discountType === "percentage") {
		discount = (subtotal * coupon.discountValue) / 100;
	}
	return Math.min(discount, subtotal);
};

const getTotal = (cart) => getSubtotal(cart) - getDiscount(cart);

const getDaysAgo = (cart) =>
	Math.floor((Date.now() - new Date(cart.updatedAt)) / 86400000);

const getUpdatedBadge = (days) => {
	if (days <= 0) {
		return {
			text: "Today",
			style:
				"bg-cyan-100 text-cyan-800 border-cyan-600/40 dark:bg-cyan-400/10 dark:text-cyan-300 dark:border-cyan-400/30",
		};
	}
	if (days >= STALE_DAYS) {
		return {
			text: `Stale · ${days}d`,
			style:
				"bg-amber-100 text-amber-800 border-amber-500/50 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/30",
		};
	}
	return {
		text: `${days}d ago`,
		style:
			"bg-slate-200 text-slate-700 border-slate-400 dark:bg-slate-400/10 dark:text-slate-300 dark:border-slate-400/30",
	};
};

function ProductImage({ src, name, size, onFail }) {
	const [failed, setFailed] = useState(false);

	return (
		<div
			className={`${size} grid shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-soft text-sm font-bold text-brand-ink`}
		>
			{src && !failed ? (
				<img
					src={src}
					alt={name}
					onError={() => {
						setFailed(true);
						if (onFail) onFail();
					}}
					className="h-full w-full object-cover"
				/>
			) : (
				name.charAt(0).toUpperCase()
			)}
		</div>
	);
}

function CartItem({ item }) {
	const [imageFailed, setImageFailed] = useState(false);

	const { error } = useGetSingleProductQuery(item.product, {
		skip: !imageFailed || typeof item.product !== "string",
	});
	const isRemoved = error?.status === 404;

	return (
		<li className="flex items-center gap-3">
			<ProductImage
				src={item.image}
				name={item.name}
				size="h-12 w-12"
				onFail={() => setImageFailed(true)}
			/>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold">{item.name}</p>
				<p className="text-xs text-ink-2">
					{formatMoney(item.price)} × {item.quantity}
				</p>
				{isRemoved && (
					<p className="text-xs font-bold text-red-600 dark:text-red-400">
						Product removed
					</p>
				)}
			</div>
			<p className="text-sm font-bold tabular-nums">
				{formatMoney(item.price * item.quantity)}
			</p>
		</li>
	);
}

function StatCard({ icon: Icon, label, value, hint, t }) {
	return (
		<div
			className={`flex items-center gap-4 rounded-3xl border p-5 shadow-card ${t.card}`}
		>
			<div
				className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${t.avatar}`}
			>
				<Icon size={22} />
			</div>
			<div className="min-w-0">
				<p className="text-xs font-bold uppercase tracking-wide text-ink-2">
					{label}
				</p>
				<p className="truncate text-2xl font-extrabold tabular-nums">{value}</p>
				{hint && <p className="truncate text-xs text-ink-2">{hint}</p>}
			</div>
		</div>
	);
}

const bar = "animate-pulse rounded-full bg-ink-3/20";

function PageSkeleton({ t }) {
	return (
		<div className="space-y-4 sm:space-y-5" aria-busy="true">
			<div className={`rounded-3xl border p-6 shadow-card ${t.card}`}>
				<div className={`${bar} h-3 w-40`} />
				<div className={`${bar} mt-4 h-9 w-72 max-w-full`} />
				<div className={`${bar} mt-4 h-3 w-56`} />
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{["a", "b", "c", "d"].map((k) => (
					<div
						key={k}
						className={`rounded-3xl border p-5 shadow-card ${t.card}`}
					>
						<div className={`${bar} h-3 w-24`} />
						<div className={`${bar} mt-4 h-8 w-32`} />
						<div className={`${bar} mt-4 h-3 w-20`} />
					</div>
				))}
			</div>

			<div className={`rounded-3xl border shadow-card ${t.card}`}>
				{Array.from({ length: 6 }, (_, i) => `row${i}`).map((k) => (
					<div
						key={k}
						className={`flex items-center gap-4 border-t px-6 first:border-t-0 ${t.divider} ${ROW_H}`}
					>
						<div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-ink-3/20" />
						<div className={`${bar} h-4 w-1/4`} />
						<div className={`${bar} h-4 w-1/6`} />
						<div className={`${bar} ml-auto h-4 w-1/6`} />
					</div>
				))}
			</div>
		</div>
	);
}

const Cart = () => {
	const isDark = useIsDark();
	const t = getTheme(isDark);

	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState("all");
	const [sort, setSort] = useState("newest");
	const [openId, setOpenId] = useState(null);

	const { data, isLoading, isFetching, isError, refetch } =
		useGetAdminAllCartsQuery({ page, limit: PAGE_SIZE });

	const carts = data?.carts ?? [];
	const totalCarts = data?.total ?? carts.length;
	const pageCount = data?.totalPages ?? 1;

	let itemsCount = 0;
	let totalValue = 0;
	let topCart = null;
	for (const cart of carts) {
		itemsCount += getItemCount(cart);
		totalValue += getTotal(cart);
		if (!topCart || getTotal(cart) > getTotal(topCart)) topCart = cart;
	}
	const average = carts.length > 0 ? totalValue / carts.length : 0;

	const text = search.trim().toLowerCase();
	const rows = carts.filter((cart) => {
		const name = (cart.user?.username ?? "").toLowerCase();
		const email = (cart.user?.email ?? "").toLowerCase();
		const hasProduct = getItems(cart).some((item) =>
			item.name.toLowerCase().includes(text),
		);

		if (text && !name.includes(text) && !email.includes(text) && !hasProduct) {
			return false;
		}
		if (filter === "high") return getTotal(cart) >= average;
		if (filter === "stale") return getDaysAgo(cart) >= STALE_DAYS;
		if (filter === "single") return getItems(cart).length === 1;
		if (filter === "coupon") return Boolean(cart.coupon?.code);
		return true;
	});

	rows.sort((a, b) => {
		if (sort === "total") return getTotal(b) - getTotal(a);
		return new Date(b.updatedAt) - new Date(a.updatedAt);
	});

	const fillerCount = pageCount > 1 ? PAGE_SIZE - rows.length : 0;
	const showEmpty = !isError && rows.length === 0;

	if (isLoading) return <PageSkeleton t={t} />;

	return (
		<div className="space-y-4 sm:space-y-5">
			<PageBanner
				icon={ShoppingCart}
				title="Carts"
				subtitle="Review what customers have in their carts."
				stats={[
					{ label: "total carts", value: totalCarts.toLocaleString("en-US") },
				]}
			/>

			<section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard icon={ShoppingCart} label="Carts" value={totalCarts} t={t} />
				<StatCard
					icon={Package}
					label="Items (this page)"
					value={itemsCount}
					t={t}
				/>
				<StatCard
					icon={Wallet}
					label="Value (this page)"
					value={formatMoney(totalValue)}
					t={t}
				/>
				<StatCard
					icon={Crown}
					label="Top cart"
					value={topCart ? formatMoney(getTotal(topCart)) : "—"}
					hint={topCart?.user?.username}
					t={t}
				/>
			</section>

			<section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_190px_190px]">
				<div className="relative sm:col-span-2 lg:col-span-1">
					<Search
						size={18}
						className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
					/>
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search customer, email, product…"
						aria-label="Search carts"
						autoComplete="off"
						className={`h-12 w-full rounded-2xl border pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand/50 ${t.input}`}
					/>
				</div>

				<Select
					ariaLabel="Filter carts"
					value={filter}
					onChange={setFilter}
					options={FILTERS}
				/>

				<Select
					ariaLabel="Sort carts"
					value={sort}
					onChange={setSort}
					options={SORTS}
				/>
			</section>

			<section
				className={`overflow-hidden rounded-3xl border shadow-card ${t.card}`}
			>
				<div className="overflow-x-auto">
					<table className="w-full min-w-215 table-fixed text-sm">
						<colgroup>
							<col />
							<col className="w-28" />
							<col className="w-28" />
							<col className="w-48" />
							<col className="w-48" />
							<col className="w-16" />
						</colgroup>
						<thead>
							<tr
								className={`h-12 text-left text-xs font-bold tracking-wide ${t.thead}`}
							>
								{COLS.map((c, i) => (
									<th
										key={c || "toggle"}
										scope="col"
										className={i === 0 ? "pl-6" : "px-4"}
									>
										{c}
									</th>
								))}
							</tr>
						</thead>

						<tbody>
							{rows.map((cart) => {
								const items = getItems(cart);
								const discount = getDiscount(cart);
								const badge = getUpdatedBadge(getDaysAgo(cart));
								const isOpen = openId === cart._id;
								const toggle = () => setOpenId(isOpen ? null : cart._id);

								return (
									<Fragment key={cart._id}>
										<tr
											className={`border-t transition-colors ${ROW_H} ${t.divider} ${t.rowHover}`}
										>
											<td className="pl-6 pr-2">
												<button
													type="button"
													onClick={toggle}
													className="flex w-full min-w-0 cursor-pointer items-center gap-3 text-left"
												>
													<span
														className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold ${t.avatar}`}
													>
														{(cart.user?.username || "G")
															.charAt(0)
															.toUpperCase()}
													</span>
													<span className="min-w-0">
														<span className="block truncate font-semibold">
															{cart.user?.username || "Guest"}
														</span>
														<span className="block truncate text-xs text-ink-2">
															{cart.user?.email}
														</span>
													</span>
												</button>
											</td>

											<td className="px-4 tabular-nums">{items.length}</td>
											<td className="px-4 tabular-nums">
												{getItemCount(cart)}
											</td>

											<td className="px-4">
												<p className="font-semibold tabular-nums">
													{formatMoney(getTotal(cart))}
												</p>
												{cart.coupon?.code && (
													<p className="mt-1 flex items-center gap-1 text-xs font-bold text-brand-ink">
														<Ticket size={12} />
														{cart.coupon.code} · -{formatMoney(discount)}
													</p>
												)}
											</td>

											<td className="px-4">
												<p className="whitespace-nowrap text-ink-2">
													{formatDate(cart.updatedAt)}
												</p>
												<span
													className={`mt-1 inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.style}`}
												>
													{badge.text}
												</span>
											</td>

											<td className="px-4">
												<button
													type="button"
													onClick={toggle}
													aria-expanded={isOpen}
													aria-label={isOpen ? "Hide items" : "Show items"}
													className={`grid h-9 w-9 cursor-pointer place-items-center rounded-xl border ${t.iconBtn}`}
												>
													<ChevronDown
														size={16}
														className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
													/>
												</button>
											</td>
										</tr>

										{isOpen && (
											<tr className={`border-t bg-surface-2 ${t.divider}`}>
												<td colSpan={COLS.length} className="px-6 py-4">
													{items.length === 0 ? (
														<p className="text-sm text-ink-2">
															This cart is empty.
														</p>
													) : (
														<ul className="grid gap-4 md:grid-cols-2">
															{items.map((item) => (
																<CartItem key={item._id} item={item} />
															))}
														</ul>
													)}

													<div className="mt-4 flex flex-wrap justify-end gap-x-8 gap-y-1 border-t border-dashed border-line pt-3 text-sm">
														<span className="text-ink-2">
															Subtotal: {formatMoney(getSubtotal(cart))}
														</span>
														{discount > 0 && (
															<span className="font-semibold text-brand-ink">
																Coupon: -{formatMoney(discount)}
															</span>
														)}
														<span className="font-bold">
															Total: {formatMoney(getTotal(cart))}
														</span>
													</div>
												</td>
											</tr>
										)}
									</Fragment>
								);
							})}

							{Array.from({ length: fillerCount }, (_, i) => `f${i}`).map(
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
						<p className="font-semibold">Couldn’t load carts</p>
						<button
							type="button"
							onClick={() => refetch()}
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
						<p className="font-semibold">No carts found</p>
						<p className="text-xs text-ink-2">
							Try changing the search or filters.
						</p>
					</div>
				)}

				{!isError && carts.length > 0 && (
					<Pagination
						page={page}
						pageCount={pageCount}
						total={totalCarts}
						pageSize={PAGE_SIZE}
						onChange={setPage}
					/>
				)}
			</section>
		</div>
	);
};

export default Cart;
