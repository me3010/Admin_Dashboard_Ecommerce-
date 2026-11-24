import { Package } from "lucide-react";
import { memo } from "react";

const STAT_SLOTS = [0, 1, 2, 3];
const PRODUCT_CARD_SLOTS = [0, 1, 2, 3, 4, 5];
const CARD_BUTTON_SLOTS = [0, 1, 2, 3];

const CARD_CLASS =
	"rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111a2a]";

const SKELETON_GRADIENT =
	"from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-600 dark:to-slate-800";

const SkeletonBlock = memo(function SkeletonBlock({ className = "" }) {
	return (
		<div
			className={`animate-pulse rounded-lg bg-linear-to-r motion-reduce:animate-none ${SKELETON_GRADIENT} ${className}`}
		/>
	);
});

const ProductSkeleton = memo(function ProductSkeleton() {
	return (
		<section
			aria-label="Loading products"
			aria-busy="true"
			className="space-y-5 sm:space-y-6"
		>
			<div className="flex flex-col items-center justify-center py-7">
				<div className="relative grid h-20 w-20 place-items-center">
					<div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-400 motion-reduce:animate-none dark:border-slate-700/60" />

					<div className="grid h-14 w-14 place-items-center rounded-full bg-cyan-50 dark:bg-[#14263a]">
						<Package size={29} className="text-cyan-500" />
					</div>
				</div>

				<h2 className="mt-5 text-lg font-bold text-slate-800 dark:text-slate-200">
					Products
				</h2>

				<p className="mt-2 animate-pulse text-sm text-cyan-500 motion-reduce:animate-none">
					Loading your products...
				</p>
			</div>

			<div className={`${CARD_CLASS} p-5 sm:p-7`}>
				<div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
					<div className="flex items-center gap-4">
						<SkeletonBlock className="h-14 w-14 shrink-0" />

						<div className="min-w-0 flex-1 space-y-3">
							<SkeletonBlock className="h-3 w-32" />
							<SkeletonBlock className="h-7 w-44 max-w-full" />
							<SkeletonBlock className="h-3 w-64 max-w-full" />
						</div>
					</div>

					<SkeletonBlock className="h-11 w-full sm:w-36" />
				</div>

				<div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-4 dark:border-slate-700/40">
					<SkeletonBlock className="h-7 w-36" />
					<SkeletonBlock className="h-7 w-36" />
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{STAT_SLOTS.map((index) => (
					<div key={index} className={`${CARD_CLASS} p-5`}>
						<SkeletonBlock className="h-3 w-28" />
						<SkeletonBlock className="mt-5 h-9 w-20" />
						<SkeletonBlock className="mt-4 h-3 w-36" />
						<SkeletonBlock className="mt-5 h-1 w-full" />
					</div>
				))}
			</div>

			<div className={`${CARD_CLASS} p-4 sm:p-5`}>
				<SkeletonBlock className="mb-5 h-4 w-32" />

				<div className="flex flex-col gap-3 sm:flex-row">
					<SkeletonBlock className="h-11 flex-1" />
					<SkeletonBlock className="h-11 w-full sm:w-28" />
					<SkeletonBlock className="h-11 w-full sm:w-28" />
				</div>
			</div>

			<div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
				{PRODUCT_CARD_SLOTS.map((index) => (
					<div key={index} className={`${CARD_CLASS} overflow-hidden`}>
						<SkeletonBlock className="h-48 w-full rounded-none" />

						<div className="space-y-4 p-4 sm:p-5">
							<div className="flex items-center justify-between gap-3">
								<SkeletonBlock className="h-5 w-24" />
								<SkeletonBlock className="h-3 w-16" />
							</div>

							<SkeletonBlock className="h-5 w-3/4" />
							<SkeletonBlock className="h-3 w-full" />
							<SkeletonBlock className="h-3 w-2/3" />

							<div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700/60">
								<SkeletonBlock className="h-3 w-24" />
								<SkeletonBlock className="mt-3 h-7 w-28" />
							</div>

							<div className="grid grid-cols-2 gap-2">
								{CARD_BUTTON_SLOTS.map((buttonIndex) => (
									<SkeletonBlock key={buttonIndex} className="h-10" />
								))}
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
});

export default ProductSkeleton;
