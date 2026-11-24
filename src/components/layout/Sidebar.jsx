import {
	Heart,
	LayoutDashboard,
	Package,
	PlusSquare,
	Settings,
	ShoppingBag,
	ShoppingCart,
	Users,
	X,
} from "lucide-react";
import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
	{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
	{ name: "Users", path: "/dashboard/users", icon: Users },
	{ name: "Products", path: "/dashboard/products", icon: Package },
	{ name: "Add Products", path: "/dashboard/add_products", icon: PlusSquare },
	{ name: "Orders", path: "/dashboard/orders", icon: ShoppingCart },
	{ name: "Carts", path: "/dashboard/carts", icon: ShoppingBag },
	{ name: "Wishlists", path: "/dashboard/wishlists", icon: Heart },
	{ name: "Settings", path: "/dashboard/settings", icon: Settings },
];

const Sidebar = ({ open, onClose }) => {
	useEffect(() => {
		if (!open) return;
		const onKey = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	return (
		<>
			<button
				type="button"
				tabIndex={-1}
				aria-label="Close menu"
				onClick={onClose}
				className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
					open ? "opacity-100" : "pointer-events-none opacity-0"
				}`}
			/>

			<aside
				aria-label="Main navigation"
				className={`fixed bottom-3 left-3 top-3 z-55 flex w-60 flex-col gap-1.5 overflow-y-auto rounded-3xl border border-line bg-surface p-4 shadow-card transition-transform duration-300 ease-out lg:bottom-5 lg:left-5 lg:top-5 lg:translate-x-0 ${
					open ? "translate-x-0" : "translate-x-[-120%]"
				}`}
			>
				<div className="mb-3 flex items-start justify-between rounded-2xl border border-line bg-surface-2 p-3">
					<div>
						<span className="text-[11px] font-bold tracking-wide text-brand-ink">
							Commerce
						</span>
						<p className="mt-0.5 text-lg font-extrabold leading-tight text-ink">
							Admin Panel
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close menu"
						className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 hover:bg-surface-3 hover:text-ink lg:hidden cursor-pointer"
					>
						<X size={18} />
					</button>
				</div>

				<nav className="flex flex-col gap-1">
					{menuItems.map(({ name, path, icon: Icon, end }) => (
						<NavLink
							key={name}
							to={path}
							end={end}
							className={({ isActive }) =>
								`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
									isActive
										? "bg-brand-soft text-brand-ink ring-1 ring-brand/30"
										: "text-ink-2 hover:bg-surface-2 hover:text-ink"
								}`
							}
						>
							<Icon size={18} className="shrink-0" />
							<span className="truncate">{name}</span>
						</NavLink>
					))}
				</nav>

				<div className="mt-auto rounded-2xl border border-line bg-surface-2 p-3">
					<span className="flex items-center gap-2 text-[11px] font-bold text-brand-ink">
						<span className="relative flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
							<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
						</span>
						Live
					</span>
					<p className="mt-1 text-xs font-medium leading-tight text-ink-2">
						Connected to E-commerce API
					</p>
				</div>
			</aside>
		</>
	);
};

export default React.memo(Sidebar);
