import { useMemo } from "react";
import useIsDark from "../../hooks/useIsDark";

const THUMBNAIL_SLOTS = ["image-1", "image-2", "image-3", "image-4", "image-5"];
const FIELD_SLOTS = [
	"name",
	"summary",
	"price",
	"category",
	"description",
	"tags",
];

const STORE_LOGO_URL =
	"https://i.pinimg.com/736x/4c/94/0d/4c940d51cc08a9007d20b690aaeafbb9.jpg";

function getTheme(isDark) {
	return {
		shell: isDark
			? "border-cyan-500/20 bg-[#050a12] text-slate-100"
			: "border-slate-300 bg-[#e2e8f0] text-slate-900",
		surface: isDark
			? "border-slate-800 bg-slate-900/70"
			: "border-slate-300 bg-white/80",
		placeholder: isDark ? "bg-slate-700/70" : "bg-slate-200",
		mutedText: isDark ? "text-slate-400" : "text-slate-600",
		dropzone: isDark
			? "border-slate-700 bg-slate-800/50"
			: "border-slate-300 bg-slate-100",
		divider: isDark ? "border-slate-700/30" : "border-slate-200/80",
	};
}

export default function AddProductSkeleton() {
	const isDark = useIsDark();
	const t = useMemo(() => getTheme(isDark), [isDark]);
	const pulse = `animate-pulse ${t.placeholder} motion-reduce:animate-none`;

	return (
		<output
			aria-live="polite"
			aria-label="Loading add product page"
			className={`m-3 block min-h-screen rounded-[28px] border px-3 py-6 shadow-2xl transition-colors duration-300 sm:m-5 sm:px-5 sm:py-8 lg:m-7 lg:px-7 ${t.shell}`}
		>
			<div className="mx-auto max-w-362">
				<div className="mb-8 flex flex-col items-center text-center">
					<div className="mb-3 grid size-16 place-items-center overflow-hidden rounded-2xl border border-cyan-500/30 bg-white p-2 shadow-lg shadow-cyan-950/10">
						<img
							src={STORE_LOGO_URL}
							alt="Veyora Store Logo"
							className="size-full rounded-xl object-cover"
						/>
					</div>
					<h1 className="text-xl font-bold tracking-tight sm:text-2xl">
						Veyora Store
					</h1>
					<p
						className={`mt-2 inline-flex items-center gap-2 text-sm ${t.mutedText}`}
					>
						<span className="size-2 animate-pulse rounded-full bg-cyan-500 motion-reduce:animate-none" />
						Loading add product...
					</p>
				</div>

				<header className="mb-5 flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className={`size-10 rounded-xl ${pulse}`} />
						<div className="space-y-2">
							<div className={`h-6 w-40 rounded ${pulse}`} />
							<div className={`h-3 w-64 max-w-full rounded ${pulse}`} />
						</div>
					</div>
					<div className="flex gap-2">
						<div className={`h-10 w-20 rounded-xl ${pulse}`} />
						<div className={`h-10 w-36 rounded-xl ${pulse}`} />
					</div>
				</header>

				<div className="grid items-start gap-5 lg:grid-cols-[1.05fr_1fr]">
					<section
						className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${t.surface}`}
					>
						<div className="mb-4 flex items-center justify-between">
							<div className="space-y-2">
								<div className={`h-4 w-32 rounded ${pulse}`} />
								<div className={`h-3 w-40 rounded ${pulse}`} />
							</div>
							<div className={`size-9 rounded-lg ${pulse}`} />
						</div>

						<div
							className={`grid min-h-70 place-items-center rounded-2xl border-2 border-dashed p-5 sm:min-h-85 ${t.dropzone}`}
						>
							<div className="flex flex-col items-center gap-4">
								<div className={`size-20 rounded-3xl ${pulse}`} />
								<div className={`h-4 w-48 rounded ${pulse}`} />
								<div className={`h-3 w-40 rounded ${pulse}`} />
							</div>
						</div>

						<div className="mt-4 flex justify-between">
							<div className={`h-3 w-28 rounded ${pulse}`} />
							<div className={`h-3 w-16 rounded ${pulse}`} />
						</div>

						<div className="mt-3 grid grid-cols-5 gap-2">
							{THUMBNAIL_SLOTS.map((slot) => (
								<div
									key={slot}
									className={`aspect-square rounded-xl ${pulse}`}
								/>
							))}
						</div>

						<div className={`mt-5 h-12 rounded-xl ${pulse}`} />
					</section>

					<section
						className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${t.surface}`}
					>
						<div
							className={`mb-5 flex items-center gap-3 border-b pb-4 ${t.divider}`}
						>
							<div className={`size-11 rounded-xl ${pulse}`} />
							<div className="space-y-2">
								<div className={`h-4 w-40 rounded ${pulse}`} />
								<div className={`h-3 w-56 max-w-full rounded ${pulse}`} />
							</div>
						</div>

						<div className="space-y-4">
							{FIELD_SLOTS.map((field) => (
								<div key={field}>
									<div className={`mb-2 h-3 w-28 rounded ${pulse}`} />
									<div className={`h-10 rounded-xl ${pulse}`} />
								</div>
							))}
						</div>
					</section>
				</div>
			</div>
		</output>
	);
}
