import { Loader2, Package, X } from "lucide-react";
import { useState } from "react";
import Select from "../../components/common/Select";
import {
	ORDER_STATUSES,
	PAYMENT_METHOD_LABELS,
	PAYMENT_STYLES,
	STATUS_STYLES,
	capitalize,
	formatDate,
	formatMoney,
	getTheme,
} from "./orderUtils";

const InfoRow = ({ label, value, muted, divider }) => (
	<div
		className={`flex items-start justify-between gap-4 px-4 py-3 text-xs sm:text-sm ${divider}`}
	>
		<span className={`shrink-0 ${muted}`}>{label}</span>
		<span className="text-right font-semibold wrap-break-word">
			{value || "—"}
		</span>
	</div>
);

const SummaryRow = ({ label, value, muted, bold = false }) => (
	<div
		className={`flex items-center justify-between gap-4 py-1.5 text-xs sm:text-sm ${
			bold ? "border-t border-line pt-2.5 mt-1 font-bold" : ""
		}`}
	>
		<span className={bold ? "" : muted}>{label}</span>
		<span
			className={
				bold ? "tabular-nums font-extrabold" : "tabular-nums font-medium"
			}
		>
			{value}
		</span>
	</div>
);

function formatShippingAddress(address) {
	if (!address) return "";
	if (typeof address === "string") return address;
	if (typeof address === "object") {
		const parts = [
			address.address,
			address.city,
			address.state,
			address.postalCode,
			address.country,
		].filter(Boolean);
		return parts.length > 0
			? parts.join(", ")
			: Object.values(address).filter(Boolean).join(", ");
	}
	return String(address);
}

export default function OrderDetailsModal({
	order,
	isDark,
	saving,
	onClose,
	onSave,
}) {
	const t = getTheme(isDark);
	const raw = order?.raw && typeof order.raw === "object" ? order.raw : {};

	const [status, setStatus] = useState(order.status || "pending");
	const [adminNote, setAdminNote] = useState(raw?.adminNote ?? "");

	const items = Array.isArray(order.items) ? order.items : [];
	const shippingText = formatShippingAddress(order.address);

	const customerName =
		order.customerName ||
		raw?.shippingAddress?.fullName ||
		raw?.user?.username ||
		raw?.user?.name ||
		"Customer";

	const customerEmail =
		order.customerEmail ||
		raw?.user?.email ||
		raw?.shippingAddress?.email ||
		"—";

	const subtotal =
		raw?.subtotal != null
			? Number(raw.subtotal)
			: items.reduce((sum, it) => {
					const price = Number(it?.price ?? it?.product?.price ?? 0);
					const qty = Number(it?.quantity ?? it?.qty ?? 1);
					return (
						sum +
						(Number.isFinite(price) ? price : 0) *
							(Number.isFinite(qty) ? qty : 1)
					);
				}, 0);

	const shippingFee = raw?.shippingFee != null ? Number(raw.shippingFee) : 0;
	const tax = raw?.tax != null ? Number(raw.tax) : 0;
	const discount = raw?.discount != null ? Number(raw.discount) : 0;
	const total =
		order.total != null && !Number.isNaN(order.total)
			? order.total
			: subtotal + shippingFee + tax - discount;

	const statusMeta = STATUS_STYLES[order.status] ?? {
		label: capitalize(order.status),
		badge:
			"bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-400/10 dark:text-slate-300 dark:border-slate-400/30",
		dot: "bg-slate-500",
	};

	const initialNote = String(raw?.adminNote ?? "").trim();
	const currentNote = adminNote.trim();
	const hasChanges = status !== order.status || currentNote !== initialNote;

	const handleSubmit = () => {
		if (!order?.id || saving || !hasChanges) return;
		onSave?.(order, status, currentNote);
	};

	return (
		<div className="fixed inset-0 z-70 flex justify-end">
			<button
				type="button"
				aria-label="Close"
				tabIndex={-1}
				className="fixed inset-0 bg-black/50 backdrop-blur-[2px] cursor-default"
				onClick={onClose}
			/>

			<dialog
				open
				aria-modal="true"
				aria-label={`Order details ${order.shortId}`}
				className={`relative z-10 m-0 flex h-full max-h-none w-full max-w-110 flex-col overflow-y-auto border-0 border-l p-0 shadow-2xl ${t.modal}`}
			>
				{/* Top Header */}
				<div
					className={`sticky top-0 z-20 flex items-start justify-between border-b px-5 py-4 backdrop-blur-md ${t.divider} bg-inherit/95`}
				>
					<div>
						<p
							className={`text-[11px] font-bold uppercase tracking-[0.18em] ${t.muted}`}
						>
							ORDER DETAIL
						</p>
						<h2 className="mt-0.5 font-mono text-xl font-extrabold tracking-tight">
							{order.shortId}
						</h2>
					</div>

					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition cursor-pointer ${t.iconBtn}`}
					>
						<X size={17} />
					</button>
				</div>

				<div className="space-y-5 p-5">
					{/* Status, Payment Status & Method */}
					<div className="flex items-center justify-between gap-2">
						<div className="flex flex-wrap items-center gap-2">
							<span
								className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badge}`}
							>
								<span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
								{statusMeta.label}
							</span>

							<span
								className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
									PAYMENT_STYLES[order.paymentStatus] ??
									"bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300"
								}`}
							>
								{order.paymentStatus || "pending"}
							</span>
						</div>

						<span className={`shrink-0 text-xs font-semibold ${t.muted}`}>
							{PAYMENT_METHOD_LABELS[order.method] ?? capitalize(order.method)}
						</span>
					</div>

					{/* INFO Card */}
					<div>
						<p
							className={`mb-2 text-[11px] font-bold uppercase tracking-[0.16em] ${t.muted}`}
						>
							INFO
						</p>
						<div
							className={`divide-y rounded-2xl border ${t.card} ${t.divider}`}
						>
							<InfoRow
								label="Placed"
								value={formatDate(order.date)}
								muted={t.muted}
								divider={t.divider}
							/>
							<InfoRow
								label="Customer"
								value={customerName}
								muted={t.muted}
								divider={t.divider}
							/>
							<InfoRow
								label="Email"
								value={customerEmail}
								muted={t.muted}
								divider={t.divider}
							/>
							<InfoRow
								label="Ship to"
								value={shippingText}
								muted={t.muted}
								divider={t.divider}
							/>
						</div>
					</div>

					{/* ITEMS List */}
					<div>
						<p
							className={`mb-2 text-[11px] font-bold uppercase tracking-[0.16em] ${t.muted}`}
						>
							ITEMS
						</p>

						{items.length > 0 ? (
							<ul className="space-y-2.5">
								{items.map((it, i) => {
									const name =
										it?.product?.name ??
										it?.product?.title ??
										it?.name ??
										it?.title ??
										"Item";
									const imgSrc =
										it?.image ??
										it?.product?.images?.[0]?.url ??
										it?.product?.images?.[0] ??
										"";
									const qty = Number(it?.quantity ?? it?.qty ?? 1) || 1;
									const unitPrice = Number(
										it?.price ?? it?.product?.price ?? 0,
									);
									const lineTotal = Number.isFinite(unitPrice)
										? unitPrice * qty
										: null;

									return (
										<li
											key={it?._id ?? `${name}-${i}`}
											className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${t.card}`}
										>
											<div className="flex min-w-0 items-center gap-3">
												{imgSrc ? (
													<img
														src={imgSrc}
														alt={name}
														className="h-12 w-12 shrink-0 rounded-xl border border-line object-cover"
													/>
												) : (
													<div
														className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border ${t.iconBtn}`}
													>
														<Package size={18} />
													</div>
												)}

												<div className="min-w-0">
													<p className="truncate text-sm font-semibold">
														{name}
													</p>
													<p className={`mt-0.5 text-xs ${t.muted}`}>
														× {qty}
														{Number.isFinite(unitPrice) &&
															` · ${formatMoney(unitPrice)}`}
													</p>
												</div>
											</div>

											{lineTotal != null && (
												<span className="shrink-0 text-sm font-bold tabular-nums">
													{formatMoney(lineTotal)}
												</span>
											)}
										</li>
									);
								})}
							</ul>
						) : (
							<div
								className={`rounded-2xl border p-4 text-center text-xs ${t.card} ${t.muted}`}
							>
								No items in this order.
							</div>
						)}
					</div>

					{/* Totals Summary */}
					<div className={`rounded-2xl border p-4 ${t.card}`}>
						<SummaryRow
							label="Subtotal"
							value={formatMoney(subtotal)}
							muted={t.muted}
						/>
						<SummaryRow
							label="Shipping"
							value={formatMoney(shippingFee)}
							muted={t.muted}
						/>
						<SummaryRow
							label="Tax (14%)"
							value={formatMoney(tax)}
							muted={t.muted}
						/>
						{discount > 0 && (
							<SummaryRow
								label="Discount"
								value={`-${formatMoney(discount)}`}
								muted={t.muted}
							/>
						)}
						<SummaryRow
							label="Total"
							value={formatMoney(total)}
							muted={t.muted}
							bold
						/>
					</div>

					{/* UPDATE STATUS */}
					<div className={`rounded-2xl border p-4 space-y-3 ${t.card}`}>
						<label
							htmlFor="order-status-select"
							className={`block text-[11px] font-bold uppercase tracking-[0.16em] ${t.muted}`}
						>
							UPDATE STATUS
						</label>

						<Select
							id="order-status-select"
							ariaLabel="Order status"
							value={status}
							onChange={setStatus}
							options={ORDER_STATUSES.map((s) => ({
								value: s,
								label: STATUS_STYLES[s]?.label ?? capitalize(s),
							}))}
						/>

						<textarea
							rows={3}
							value={adminNote}
							onChange={(e) => setAdminNote(e.target.value)}
							placeholder="Admin note (optional)..."
							aria-label="Admin note"
							className={`w-full resize-none rounded-xl border p-3 text-sm outline-none transition focus:ring-2 focus:ring-brand/40 ${t.input}`}
						/>

						<button
							type="button"
							onClick={handleSubmit}
							disabled={saving || !hasChanges}
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{saving && <Loader2 size={16} className="animate-spin" />}
							Save changes
						</button>
					</div>
				</div>
			</dialog>
		</div>
	);
}
