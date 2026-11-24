import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import Select from "../common/Select";

const DEFAULT_CATEGORIES = [
	"electronics",
	"phones",
	"fashion",
	"home",
	"beauty",
	"sports",
];

const INPUT_CLASS =
	"w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-cyan-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400";

const LABEL_CLASS =
	"mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400";

const ProductsFilters = memo(function ProductsFilters({
	isDarkMode = true,
	searchInput = "",
	setSearchInput,
	handleSearch,
	handleSearchKeyDown,
	category = "",
	setCategory,
	subcategory = "",
	setSubcategory,
	showFilters = false,
	setShowFilters,
	handleReset,
	categories = DEFAULT_CATEGORIES,
}) {
	const categoryOptions = useMemo(() => {
		const list = Array.isArray(categories) ? categories : DEFAULT_CATEGORIES;
		return [
			{ value: "all", label: "All Categories" },
			...list.map((cat) => ({
				value: cat,
				label: cat.charAt(0).toUpperCase() + cat.slice(1),
			})),
		];
	}, [categories]);

	const handleSearchChange = useCallback(
		(event) => {
			setSearchInput?.(event.target.value);
		},
		[setSearchInput],
	);

	const handleClearSearch = useCallback(() => {
		setSearchInput?.("");
	}, [setSearchInput]);

	const handleToggleFilters = useCallback(() => {
		setShowFilters?.((previous) => !previous);
	}, [setShowFilters]);

	const handleCategoryChange = useCallback(
		(value) => {
			setCategory?.(value === "all" ? "" : value);
		},
		[setCategory],
	);

	const handleSubcategoryChange = useCallback(
		(event) => {
			setSubcategory?.(event.target.value);
		},
		[setSubcategory],
	);

	return (
		<section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none sm:p-5">
			<div className="flex flex-col gap-3 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

					<input
						type="text"
						value={searchInput}
						onChange={handleSearchChange}
						onKeyDown={handleSearchKeyDown}
						placeholder="Search products by name..."
						className={`${INPUT_CLASS} pl-10 ${searchInput ? "pr-10" : "pr-4"}`}
					/>

					{searchInput && (
						<button
							type="button"
							onClick={handleClearSearch}
							aria-label="Clear search text"
							className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					)}
				</div>

				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={handleSearch}
						className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300 sm:flex-none"
					>
						<Search className="h-4 w-4" />
						Search
					</button>

					<button
						type="button"
						onClick={handleToggleFilters}
						aria-expanded={showFilters}
						className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:flex-none"
					>
						{showFilters ? (
							<X className="h-4 w-4" />
						) : (
							<SlidersHorizontal className="h-4 w-4" />
						)}

						{showFilters ? "Hide Filters" : "Filters"}
					</button>
				</div>
			</div>

			{showFilters && (
				<div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-200 pt-5 dark:border-slate-800 sm:grid-cols-2">
					<div>
						<label htmlFor="filter-category" className={LABEL_CLASS}>
							Category
						</label>

						<Select
							id="filter-category"
							isDarkMode={isDarkMode}
							ariaLabel="Filter by category"
							value={category || "all"}
							onChange={handleCategoryChange}
							options={categoryOptions}
						/>
					</div>

					<div>
						<label htmlFor="filter-subcategory" className={LABEL_CLASS}>
							Subcategory
						</label>

						<input
							id="filter-subcategory"
							type="text"
							value={subcategory}
							onChange={handleSubcategoryChange}
							placeholder="e.g. smartphones"
							className={`${INPUT_CLASS} px-3`}
						/>
					</div>

					<div className="flex justify-end sm:col-span-2">
						<button
							type="button"
							onClick={handleReset}
							className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						>
							<RotateCcw className="h-4 w-4" />
							Clear all filters
						</button>
					</div>
				</div>
			)}
		</section>
	);
});

export default ProductsFilters;
