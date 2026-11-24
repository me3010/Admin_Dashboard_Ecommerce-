import { Heart, ImageOff, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { formatDate, formatMoney } from "./wishlistUtils";

export default function WishlistModal({ wishlist, onClose }) {
	useEffect(() => {
		const onKey = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	return createPortal(
		<div className="fixed inset-0 z-70 flex items-end justify-center p-0 sm:items-center sm:p-4">
			<button
				type="button"
				aria-label="Close"
				tabIndex={-1}
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
			/>

			<dialog
				open
				aria-modal="true"
				aria-label="Wishlist details"
				className="relative m-0 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-line bg-surface p-0 text-ink shadow-2xl sm:rounded-3xl"
			>
				<div className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
					<div className="flex min-w-0 items-center gap-3">
						<div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-soft text-lg font-bold text-brand-ink">
							{(wishlist.userName || "U").charAt(0).toUpperCase()}
						</div>
						<div className="min-w-0">
							<h2 className="truncate text-lg font-extrabold">
								{wishlist.userName || "Unknown user"}
							</h2>
							<p className="truncate text-xs text-ink-3">
								{wishlist.userEmail || "No email"} · Updated{" "}
								{formatDate(wishlist.updatedAt)}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl border border-line bg-surface-2 text-ink-2 hover:bg-surface-3"
					>
						<X size={16} />
					</button>
				</div>

				<div className="grid grid-cols-2 divide-x divide-line border-b border-line text-center">
					<div className="py-3">
						<p className="text-xl font-extrabold tabular-nums">
							{wishlist.count}
						</p>
						<p className="text-xs text-ink-3">saved items</p>
					</div>
					<div className="py-3">
						<p className="text-xl font-extrabold tabular-nums">
							{formatMoney(wishlist.value)}
						</p>
						<p className="text-xs text-ink-3">total value</p>
					</div>
				</div>

				<div className="overflow-y-auto p-5 sm:p-6">
					{wishlist.products.length === 0 ? (
						<div className="flex flex-col items-center gap-2 py-10 text-center">
							<Heart size={28} className="text-ink-3" />
							<p className="font-semibold">This wishlist is empty</p>
						</div>
					) : (
						<ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							{wishlist.products.map((p, i) => (
								<li
									key={`${p.id}-${i}`}
									className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 p-2.5"
								>
									<div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-3 text-ink-3">
										{p.image ? (
											<img
												src={p.image}
												alt={p.name}
												loading="lazy"
												className="h-full w-full object-cover"
											/>
										) : (
											<ImageOff size={20} />
										)}
									</div>
									<div className="min-w-0">
										<p className="truncate text-sm font-semibold">{p.name}</p>
										{p.category && (
											<p className="truncate text-xs text-ink-3">
												{p.category}
											</p>
										)}
										<p className="mt-0.5 text-sm font-bold tabular-nums text-brand-ink">
											{formatMoney(p.price)}
										</p>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</dialog>
		</div>,
		document.body,
	);
}
