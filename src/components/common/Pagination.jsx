import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
	page,
	pageCount,
	total,
	pageSize,
	onChange,
}) {
	const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, total);

	const btn =
		"grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface-2 text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

	return (
		<div className="flex h-16 items-center justify-between gap-3 border-t border-line px-4 text-xs text-ink-3 sm:px-6">
			<span className="tabular-nums">
				Showing {from}–{to} of {total}
			</span>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => onChange(page - 1)}
					disabled={page === 1}
					aria-label="Previous page"
					className={btn}
				>
					<ChevronLeft size={16} />
				</button>
				<span className="min-w-14 text-center font-bold tabular-nums text-ink">
					{page} / {pageCount}
				</span>
				<button
					type="button"
					onClick={() => onChange(page + 1)}
					disabled={page === pageCount}
					aria-label="Next page"
					className={btn}
				>
					<ChevronRight size={16} />
				</button>
			</div>
		</div>
	);
}
