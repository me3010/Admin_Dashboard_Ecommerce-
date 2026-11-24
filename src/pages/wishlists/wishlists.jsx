import {
	AlertTriangle,
	Eye,
	Heart,
	ImageOff,
	Inbox,
	RefreshCw,
	Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import PageBanner from "../../components/common/PageBanner";
import Pagination from "../../components/common/Pagination";
import Select from "../../components/common/Select";
import {
	useGetAllWishlistsQuery,
	useGetWishlistStatsQuery,
} from "../../redux/features/wishlists/wishlistApiSlice";
import WishlistModal from "./WishlistModal";
import {
	PAGE_SIZE,
	buildStats,
	extractWishlists,
	formatDate,
	formatMoney,
	normalizeWishlist,
} from "./wishlistUtils";

const ROW_H = "h-[76px]";
const COLS = ["User", "Saved items", "Value", "Updated", "Details"];

const SORTS = {
	items: { label: "Most items", fn: (a, b) => b.count - a.count },
	value: { label: "Highest value", fn: (a, b) => b.value - a.value },
	recent: {
		label: "Recently updated",
		fn: (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
	},
};

function Thumbs({ products }) {
	const shown = products.slice(0, 4);
	const extra = products.length - shown.length;
	if (products.length === 0)
		return <span className="text-xs text-ink-3">Empty</span>;
	return (
		<div className="flex items-center">
			<div className="flex -space-x-2.5">
				{shown.map((p, i) => (
					<div
						key={`${p.id}-${i}`}
						title={p.name}
						className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border-2 border-surface bg-surface-3 text-ink-3"
					>
						{p.image ? (
							<img
								src={p.image}
								alt={p.name}
								loading="lazy"
								className="h-full w-full object-cover"
							/>
						) : (
							<ImageOff size={13} />
						)}
					</div>
				))}
			</div>
			<span className="ml-3 text-sm font-bold tabular-nums">
				{products.length}
				{extra > 0 && (
					<span className="ml-1 text-xs font-medium text-ink-3">
						(+{extra})
					</span>
				)}
			</span>
		</div>
	);
}

function TopProducts({ items }) {
	if (!items.length) return null;
	const max = items[0].count || 1;
	return (
		<section className="rounded-3xl border border-line bg-surface p-5 shadow-card">
			<div className="mb-4 flex items-center gap-2">
				<Heart size={16} className="text-rose-500" />
				<h2 className="text-sm font-extrabold">Most wishlisted products</h2>
			</div>
			<ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
				{items.map((p) => (
					<li
						key={p.id || p.name}
						className="min-w-0 rounded-2xl border border-line bg-surface-2 p-3"
					>
						<div className="flex items-center gap-2.5">
							<div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-3 text-ink-3">
								{p.image ? (
									<img
										src={p.image}
										alt={p.name}
										loading="lazy"
										className="h-full w-full object-cover"
									/>
								) : (
									<ImageOff size={14} />
								)}
							</div>
							<p className="line-clamp-2 text-xs font-semibold leading-snug">
								{p.name}
							</p>
						</div>
						<div className="mt-3 flex items-center gap-2">
							<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
								<div
									className="h-full rounded-full bg-rose-500"
									style={{ width: `${Math.max(8, (p.count / max) * 100)}%` }}
								/>
							</div>
							<span className="text-xs font-bold tabular-nums text-ink-2">
								{p.count}
							</span>
						</div>
					</li>
				))}
			</ol>
		</section>
	);
}

export default function Wishlists() {
	const { data, isLoading, isFetching, isError, refetch } =
		useGetAllWishlistsQuery();
	const { data: statsData } = useGetWishlistStatsQuery();

	const [search, setSearch] = useState("");
	const [sort, setSort] = useState("items");
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState(null);

	const wishlists = useMemo(
		() => extractWishlists(data).map(normalizeWishlist),
		[data],
	);
	const stats = useMemo(
		() => buildStats(statsData, wishlists),
		[statsData, wishlists],
	);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return wishlists
			.filter(
				(w) =>
					!q ||
					w.userName.toLowerCase().includes(q) ||
					w.userEmail.toLowerCase().includes(q) ||
					w.products.some((p) => p.name.toLowerCase().includes(q)),
			)
			.sort(SORTS[sort].fn);
	}, [wishlists, search, sort]);

	const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const currentPage = Math.min(page, pageCount);
	const rows = filtered.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE,
	);
	const fillerCount = pageCount > 1 ? PAGE_SIZE - rows.length : 0;
	const showEmpty = !isLoading && !isError && filtered.length === 0;

	return (
		<div className="space-y-4 sm:space-y-5">
			<PageBanner
				icon={Heart}
				title="Wishlists"
				subtitle="See what your customers are saving for later."
				stats={[
					{
						label: "wishlists",
						value: stats.totalWishlists.toLocaleString("en-US"),
					},
					{
						label: "saved items",
						value: stats.totalItems.toLocaleString("en-US"),
					},
				]}
			/>

			{!isLoading && <TopProducts items={stats.top} />}

			<section className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
				<div className="relative">
					<Search
						size={18}
						className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
					/>
					<input
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
						placeholder="Search user or product…"
						aria-label="Search wishlists"
						autoComplete="off"
						className="h-12 w-full rounded-2xl border border-line bg-surface-2 pl-11 pr-4 text-sm text-ink outline-none [--autofill-text:var(--ink)] placeholder:text-ink-3 focus:ring-2 focus:ring-brand/50"
					/>
				</div>
				<Select
					ariaLabel="Sort wishlists"
					value={sort}
					onChange={(v) => {
						setSort(v);
						setPage(1);
					}}
					options={Object.entries(SORTS).map(([k, v]) => ({
						value: k,
						label: v.label,
					}))}
				/>
			</section>

			<section className="overflow-hidden rounded-3xl border border-line bg-surface text-ink shadow-card">
				<div className="overflow-x-auto">
					<table className="w-full min-w-190 table-fixed text-sm">
						<colgroup>
							<col />
							<col className="w-55" />
							<col className="w-38" />
							<col className="w-33" />
							<col className="w-24" />
						</colgroup>
						<thead>
							<tr className="h-12 bg-surface-2 text-left text-xs font-bold tracking-wide text-ink-3">
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
									(k) => (
										<tr key={k} className={`border-t border-line ${ROW_H}`}>
											{COLS.map((c) => (
												<td key={c} className="px-4">
													<div className="h-4 animate-pulse rounded-full bg-ink-3/20" />
												</td>
											))}
										</tr>
									),
								)}

							{!isLoading &&
								rows.map((w) => (
									<tr
										key={w.id}
										className={`border-t border-line transition-colors hover:bg-surface-2 ${ROW_H}`}
									>
										<td className="pl-6 pr-4">
											<div className="flex min-w-0 items-center gap-3">
												<div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-brand-ink">
													{(w.userName || "U").charAt(0).toUpperCase()}
												</div>
												<div className="min-w-0">
													<p className="truncate font-semibold">
														{w.userName || "—"}
													</p>
													{w.userEmail && (
														<p className="truncate text-xs text-ink-3">
															{w.userEmail}
														</p>
													)}
												</div>
											</div>
										</td>
										<td className="px-4">
											<Thumbs products={w.products} />
										</td>
										<td className="whitespace-nowrap px-4 font-semibold tabular-nums">
											{formatMoney(w.value)}
										</td>
										<td className="whitespace-nowrap px-4 text-ink-3">
											{formatDate(w.updatedAt)}
										</td>
										<td className="pl-2 pr-6">
											<div className="flex justify-end">
												<button
													type="button"
													onClick={() => setSelected(w)}
													aria-label={`View ${w.userName || "user"} wishlist`}
													className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-line bg-surface-2 text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
												>
													<Eye size={18} />
												</button>
											</div>
										</td>
									</tr>
								))}

							{!isLoading &&
								Array.from({ length: fillerCount }, (_, i) => `f${i}`).map(
									(k) => (
										<tr key={k} className={`border-t border-line ${ROW_H}`}>
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
						<p className="font-semibold">Couldn’t load wishlists</p>
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
						<p className="font-semibold">No wishlists found</p>
						<p className="text-xs text-ink-3">
							{search
								? "Try a different search."
								: "Customers haven’t saved anything yet."}
						</p>
					</div>
				)}

				{!isLoading && !isError && filtered.length > 0 && (
					<Pagination
						page={currentPage}
						pageCount={pageCount}
						total={filtered.length}
						pageSize={PAGE_SIZE}
						onChange={setPage}
					/>
				)}
			</section>

			{selected && (
				<WishlistModal wishlist={selected} onClose={() => setSelected(null)} />
			)}
		</div>
	);
}
