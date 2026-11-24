import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const SIZES = {
	md: "h-12 rounded-2xl pl-4 pr-3 text-sm",
	sm: "h-11 rounded-xl pl-3.5 pr-3 text-sm",
};

const PANEL_MAX_HEIGHT = 264;
const GAP = 6;

export default function Select({
	id: externalId,
	value,
	onChange,
	options = [],
	placeholder = "Select…",
	ariaLabel,
	disabled = false,
	size = "md",
	className = "",
}) {
	const generatedId = useId();
	const id = externalId || generatedId;
	const buttonRef = useRef(null);
	const listRef = useRef(null);
	const typeahead = useRef({ text: "", timer: null });

	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(-1);
	const [pos, setPos] = useState(null);

	const selectedIndex = options.findIndex((o) => o.value === value);
	const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

	const close = (refocus = true) => {
		setOpen(false);
		if (refocus) buttonRef.current?.focus();
	};

	const openMenu = () => {
		if (disabled) return;
		setActive(selectedIndex >= 0 ? selectedIndex : firstEnabled(options));
		setOpen(true);
	};

	const choose = (index) => {
		const opt = options[index];
		if (!opt || opt.disabled) return;
		if (opt.value !== value) onChange(opt.value);
		close();
	};

	useLayoutEffect(() => {
		if (!open || !buttonRef.current) return;
		const r = buttonRef.current.getBoundingClientRect();
		const wanted = Math.min(PANEL_MAX_HEIGHT, options.length * 42 + 12);
		const below = window.innerHeight - r.bottom - GAP;
		const above = r.top - GAP;
		const up = below < wanted && above > below;
		setPos({
			left: r.left,
			width: r.width,
			up,
			top: up ? undefined : r.bottom + GAP,
			bottom: up ? window.innerHeight - r.top + GAP : undefined,
			maxHeight: Math.max(120, Math.min(PANEL_MAX_HEIGHT, up ? above : below)),
		});
	}, [open, options.length]);

	useEffect(() => {
		if (!open) return;
		const onPointerDown = (e) => {
			if (
				buttonRef.current?.contains(e.target) ||
				listRef.current?.contains(e.target)
			)
				return;
			setOpen(false);
		};
		const onScrollOrResize = (e) => {
			if (listRef.current?.contains(e.target)) return;
			setOpen(false);
		};
		document.addEventListener("pointerdown", onPointerDown);
		window.addEventListener("resize", onScrollOrResize);
		window.addEventListener("scroll", onScrollOrResize, true);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			window.removeEventListener("resize", onScrollOrResize);
			window.removeEventListener("scroll", onScrollOrResize, true);
		};
	}, [open]);

	useEffect(() => {
		if (!open || active < 0) return;
		listRef.current
			?.querySelector(`[data-index="${active}"]`)
			?.scrollIntoView({ block: "nearest" });
	}, [open, active]);

	const move = (from, step) => {
		const n = options.length;
		for (let i = 1; i <= n; i++) {
			const next = (from + step * i + n * 2) % n;
			if (!options[next].disabled) return next;
		}
		return from;
	};

	const onKeyDown = (e) => {
		if (disabled) return;
		switch (e.key) {
			case "ArrowDown":
			case "ArrowUp": {
				e.preventDefault();
				if (!open) return openMenu();
				setActive((a) => move(a, e.key === "ArrowDown" ? 1 : -1));
				break;
			}
			case "Home":
			case "End": {
				if (!open) return;
				e.preventDefault();
				setActive(
					e.key === "Home" ? firstEnabled(options) : lastEnabled(options),
				);
				break;
			}
			case "Enter":
			case " ": {
				e.preventDefault();
				if (!open) openMenu();
				else choose(active);
				break;
			}
			case "Escape": {
				if (open) {
					e.preventDefault();
					close();
				}
				break;
			}
			case "Tab": {
				if (open) setOpen(false);
				break;
			}
			default: {
				if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
				const ta = typeahead.current;
				clearTimeout(ta.timer);
				ta.text += e.key.toLowerCase();
				ta.timer = setTimeout(() => {
					ta.text = "";
				}, 600);
				const hit = options.findIndex(
					(o) =>
						!o.disabled && String(o.label).toLowerCase().startsWith(ta.text),
				);
				if (hit >= 0) {
					if (!open) setOpen(true);
					setActive(hit);
				}
			}
		}
	};

	return (
		<div className={`relative ${className}`}>
			<button
				id={id}
				ref={buttonRef}
				type="button"
				aria-label={ariaLabel}
				aria-expanded={open}
				aria-controls={`${id}-list`}
				aria-activedescendant={
					open && active >= 0 ? `${id}-${active}` : undefined
				}
				disabled={disabled}
				onClick={() => (open ? close(false) : openMenu())}
				onKeyDown={onKeyDown}
				className={`group flex w-full cursor-pointer items-center justify-between gap-2 border bg-surface-2 font-medium text-ink outline-none transition-colors hover:border-ink-3/60 focus-visible:ring-2 focus-visible:ring-ink-3/30 disabled:cursor-not-allowed disabled:opacity-50 ${
					open ? "border-ink-3 ring-2 ring-ink-3/20" : "border-line"
				} ${SIZES[size] ?? SIZES.md}`}
			>
				<span className={`truncate ${selected ? "" : "text-ink-3"}`}>
					{selected ? selected.label : placeholder}
				</span>
				<ChevronDown
					size={16}
					className={`shrink-0 text-ink-3 transition-transform duration-200 group-hover:text-ink-2 ${
						open ? "rotate-180 text-ink-2" : ""
					}`}
				/>
			</button>

			{open &&
				pos &&
				createPortal(
					<motion.div
						ref={listRef}
						id={`${id}-list`}
						aria-label={ariaLabel}
						initial={{ opacity: 0, y: pos.up ? 6 : -6, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ duration: 0.12, ease: "easeOut" }}
						style={{
							position: "fixed",
							left: pos.left,
							width: pos.width,
							top: pos.top,
							bottom: pos.bottom,
							maxHeight: pos.maxHeight,
							transformOrigin: pos.up ? "bottom" : "top",
						}}
						className="z-1000 overflow-y-auto overscroll-contain rounded-2xl border border-line bg-surface p-1.5 shadow-card ring-1 ring-black/5 scrollbar-thin"
					>
						{options.map((opt, i) => {
							const isSelected = opt.value === value;
							const isActive = i === active;
							return (
								<button
									key={String(opt.value)}
									id={`${id}-${i}`}
									type="button"
									data-index={i}
									disabled={opt.disabled}
									aria-pressed={isSelected}
									onPointerEnter={() => !opt.disabled && setActive(i)}
									onPointerDown={(e) => e.preventDefault()}
									onClick={() => choose(i)}
									className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
										opt.disabled
											? "cursor-not-allowed opacity-40"
											: isSelected
												? "bg-surface-3 font-semibold text-ink"
												: isActive
													? "bg-surface-2 text-ink"
													: "text-ink-2"
									}`}
								>
									<span className="truncate">{opt.label}</span>
									{isSelected && (
										<Check size={16} className="shrink-0 text-ink-2" />
									)}
								</button>
							);
						})}
					</motion.div>,
					document.body,
				)}
		</div>
	);
}

function firstEnabled(options) {
	const i = options.findIndex((o) => !o.disabled);
	return i < 0 ? 0 : i;
}

function lastEnabled(options) {
	for (let i = options.length - 1; i >= 0; i--) {
		if (!options[i].disabled) return i;
	}
	return 0;
}
