import { Check, Eye, MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ORDER_STATUSES, STATUS_STYLES, getTheme } from "./orderUtils";

const MENU_WIDTH = 208;
const MENU_HEIGHT = 300;

export default function OrderActionsMenu({
	order,
	isDark,
	busy,
	onView,
	onStatus,
}) {
	const t = getTheme(isDark);
	const btnRef = useRef(null);
	const [pos, setPos] = useState(null);

	useEffect(() => {
		if (!pos) return;
		const close = () => setPos(null);
		window.addEventListener("scroll", close, true);
		window.addEventListener("resize", close);
		return () => {
			window.removeEventListener("scroll", close, true);
			window.removeEventListener("resize", close);
		};
	}, [pos]);

	const toggle = () => {
		if (pos) return setPos(null);
		const r = btnRef.current.getBoundingClientRect();
		let top = r.bottom + 6;
		if (top + MENU_HEIGHT > window.innerHeight) {
			top = Math.max(8, r.top - MENU_HEIGHT - 6);
		}
		const left = Math.max(8, r.right - MENU_WIDTH);
		setPos({ top, left });
	};

	return (
		<>
			<button
				type="button"
				ref={btnRef}
				onClick={toggle}
				disabled={busy}
				aria-label="Order actions"
				className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait ${t.iconBtn}`}
			>
				<MoreVertical size={18} />
			</button>

			{pos &&
				createPortal(
					<>
						<button
							type="button"
							aria-label="Close menu"
							tabIndex={-1}
							className="fixed inset-0 z-60 cursor-default"
							onClick={() => setPos(null)}
						/>
						<div
							style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
							className={`fixed z-61 rounded-2xl border shadow-2xl p-1.5 text-sm ${t.menu}`}
						>
							<button
								type="button"
								onClick={() => {
									setPos(null);
									onView(order);
								}}
								className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl font-medium cursor-pointer ${t.menuItem}`}
							>
								<Eye size={16} /> View details
							</button>

							<div className={`my-1.5 border-t ${t.divider}`} />
							<p
								className={`px-3 pb-1 text-[10px] font-bold uppercase tracking-widest ${t.muted}`}
							>
								Set status
							</p>

							{ORDER_STATUSES.map((s) => {
								const active = order.status === s;
								return (
									<button
										type="button"
										key={s}
										disabled={active}
										onClick={() => {
											setPos(null);
											onStatus(order, s);
										}}
										className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer disabled:cursor-default ${
											active ? "font-bold" : t.menuItem
										}`}
									>
										<span
											className={`w-2 h-2 rounded-full ${STATUS_STYLES[s].dot}`}
										/>
										{STATUS_STYLES[s].label}
										{active && (
											<Check size={15} className="ml-auto text-cyan-700" />
										)}
									</button>
								);
							})}
						</div>
					</>,
					document.body,
				)}
		</>
	);
}
