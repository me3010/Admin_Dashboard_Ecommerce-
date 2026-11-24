import { AlertCircle, ArrowUpRight, Box, Star, TrendingUp } from "lucide-react";

import { memo, useMemo } from "react";

const STAT_CONFIG = [
	{
		key: "total",
		title: "Total Products",
		subtitle: "Products in your catalog",
		icon: Box,
		accent: "cyan",
	},
	{
		key: "featured",
		title: "Featured Products",
		subtitle: "Highlighted products",
		icon: Star,
		accent: "amber",
	},
	{
		key: "inStock",
		title: "In Stock",
		subtitle: "Available for sale",
		icon: TrendingUp,
		accent: "emerald",
	},
	{
		key: "outOfStock",
		title: "Out of Stock",
		subtitle: "Need restocking",
		icon: AlertCircle,
		accent: "rose",
	},
];

const ACCENT_PALETTE = {
	cyan: {
		icon: "text-cyan-400",
		glow: "from-cyan-400/15",
		line: "bg-cyan-400",
		iconBox:
			"bg-cyan-50 border-cyan-200 dark:bg-cyan-400/10 dark:border-cyan-400/20",
	},
	amber: {
		icon: "text-amber-400",
		glow: "from-amber-400/15",
		line: "bg-amber-400",
		iconBox:
			"bg-amber-50 border-amber-200 dark:bg-amber-400/10 dark:border-amber-400/20",
	},
	emerald: {
		icon: "text-emerald-400",
		glow: "from-emerald-400/15",
		line: "bg-emerald-400",
		iconBox:
			"bg-emerald-50 border-emerald-200 dark:bg-emerald-400/10 dark:border-emerald-400/20",
	},
	rose: {
		icon: "text-rose-400",
		glow: "from-rose-400/15",
		line: "bg-rose-400",
		iconBox:
			"bg-rose-50 border-rose-200 dark:bg-rose-400/10 dark:border-rose-400/20",
	},
};

function formatStatValue(val) {
	return Number(val || 0).toLocaleString("en-US");
}

const ProductsStats = memo(function ProductsStats({
	totalProducts = 0,
	featuredCount = 0,
	inStockCount = 0,
	outOfStockCount = 0,
}) {
	const items = useMemo(() => {
		const values = {
			total: totalProducts,
			featured: featuredCount,
			inStock: inStockCount,
			outOfStock: outOfStockCount,
		};

		return STAT_CONFIG.map((cfg) => {
			const palette = ACCENT_PALETTE[cfg.accent];
			return {
				...cfg,
				formattedValue: formatStatValue(values[cfg.key]),
				iconClass: palette.icon,
				glowClass: palette.glow,
				lineClass: palette.line,
				iconBoxClass: palette.iconBox,
			};
		});
	}, [totalProducts, featuredCount, inStockCount, outOfStockCount]);

	return (
		<section
			aria-label="Product statistics"
			className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
		>
			{items.map((stat) => {
				const Icon = stat.icon;

				return (
					<article
						key={stat.key}
						className="group relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-white via-white to-cyan-50/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-900/10 dark:border-slate-700/70 dark:from-slate-900 dark:via-slate-900 dark:to-[#102b3b] dark:shadow-lg dark:shadow-black/10 dark:hover:border-cyan-400/40"
					>
						<div
							className={`pointer-events-none absolute -right-12 -top-12 -z-10 h-32 w-32 rounded-full bg-linear-to-br ${stat.glowClass} to-transparent opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100`}
						/>

						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
									{stat.title}
								</p>

								<div className="mt-4 flex items-baseline gap-2">
									<p className="text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white sm:text-4xl">
										{stat.formattedValue}
									</p>

									<ArrowUpRight
										size={16}
										className={`shrink-0 opacity-60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${stat.iconClass}`}
									/>
								</div>
							</div>

							<div
								className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition-transform duration-300 group-hover:scale-105 ${stat.iconBoxClass}`}
							>
								<Icon size={22} className={stat.iconClass} strokeWidth={1.8} />
							</div>
						</div>

						<p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
							{stat.subtitle}
						</p>

						<div
							className={`mt-5 h-1 w-10 rounded-full opacity-80 transition-all duration-300 group-hover:w-full ${stat.lineClass}`}
						/>
					</article>
				);
			})}
		</section>
	);
});

export default ProductsStats;
