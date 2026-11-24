export default function PageBanner({
	title,
	subtitle,
	stats = [],
	icon: Icon,
}) {
	return (
		<section className="relative overflow-hidden rounded-3xl border  border-cyan-400/30  dark:bg-linear-to-r from-slate-900 via-slate-800 to-cyan-900 px-5 py-5 dark:text-white shadow-card sm:px-6 sm:py-6">
			<div className="pointer-events-none absolute -right-24 -top-32 h-95 w-95 rounded-full bg-cyan-400/15 blur-2xl" />
			<div className="pointer-events-none absolute -bottom-40 right-24 hidden h-80 w-80 rounded-full border border-cyan-300/20 sm:block" />

			<div className="relative flex flex-wrap items-center justify-between gap-4">
				<div className="flex min-w-0 items-center gap-4">
					{Icon && (
						<div className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-400 bg-white/10 sm:grid">
							<Icon size={22} className="text-cyan-300" />
						</div>
					)}
					<div className="min-w-0">
						<h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
						<p className="mt-1 max-w-prose text-sm text-cyan-600">{subtitle}</p>
					</div>
				</div>

				{stats.length > 0 && (
					<div className="flex flex-wrap gap-2.5">
						{stats.map((s) => (
							<div
								key={s.label}
								className="rounded-2xl border border-cyan-400 bg-white/10 px-4 py-2.5 backdrop-blur-md"
							>
								<span className="block text-2xl font-extrabold leading-none tabular-nums">
									{s.value}
								</span>
								<span className="mt-1 block text-xs text-cyan-500">
									{s.label}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
