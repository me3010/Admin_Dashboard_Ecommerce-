import { AlertCircle, Box, Plus, RefreshCw } from "lucide-react";

import { memo, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProductsPageSkeleton from "../../components/products/ProductSkeleton";
import ProductsFilters from "../../components/products/ProductsFilters";
import ProductsGrid from "../../components/products/ProductsGrid";
import ProductsStats from "../../components/products/ProductsStats";

import useLoginTheme from "../../components/theme";
import { useGetAllProductsQuery } from "../../redux/features/products/productsApiSlice";

function extractProducts(response) {
	if (Array.isArray(response)) return response;
	if (Array.isArray(response?.products)) return response.products;
	if (Array.isArray(response?.data?.products)) return response.data.products;
	if (Array.isArray(response?.data)) return response.data;
	return [];
}

const Products = memo(function Products() {
	const isDarkMode = useLoginTheme();
	const navigate = useNavigate();

	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [category, setCategory] = useState("");
	const [subcategory, setSubcategory] = useState("");
	const [showFilters, setShowFilters] = useState(false);

	const queryParams = useMemo(
		() => ({
			search: searchTerm || undefined,
			category: category || undefined,
			subcategory: subcategory.trim() || undefined,
		}),
		[searchTerm, category, subcategory],
	);

	const {
		data: apiResponse,
		isLoading,
		isFetching,
		isError,
		error,
		refetch,
	} = useGetAllProductsQuery(queryParams);

	const products = useMemo(() => extractProducts(apiResponse), [apiResponse]);

	const stats = useMemo(() => {
		let featuredCount = 0;
		let inStockCount = 0;
		let outOfStockCount = 0;

		for (const product of products) {
			if (!product || typeof product !== "object") continue;
			if (product.featured) featuredCount += 1;
			if (Number(product.stock) > 0) {
				inStockCount += 1;
			} else {
				outOfStockCount += 1;
			}
		}

		const meta =
			apiResponse &&
			typeof apiResponse === "object" &&
			!Array.isArray(apiResponse)
				? apiResponse
				: {};

		const totalProducts = Number(
			meta.totalProducts ?? meta.total ?? meta.count ?? products.length,
		);

		return {
			totalProducts: Number.isFinite(totalProducts)
				? totalProducts
				: products.length,
			featuredCount,
			inStockCount,
			outOfStockCount,
		};
	}, [products, apiResponse]);

	const handleSearch = useCallback(() => {
		setSearchTerm(searchInput.trim());
	}, [searchInput]);

	const handleReset = useCallback(() => {
		setSearchInput("");
		setSearchTerm("");
		setCategory("");
		setSubcategory("");
	}, []);

	const handleSearchKeyDown = useCallback(
		(event) => {
			if (event.key === "Enter") {
				handleSearch();
			}
		},
		[handleSearch],
	);

	const handleNavigateAdd = useCallback(() => {
		navigate("/dashboard/add_products");
	}, [navigate]);

	if (isLoading) {
		return (
			<main className="min-h-screen bg-slate-50 p-3 text-slate-900 dark:bg-[#080d18] dark:text-slate-100 sm:p-5 lg:p-6">
				<div className="mx-auto max-w-360">
					<ProductsPageSkeleton isDarkMode={isDarkMode} />
				</div>
			</main>
		);
	}

	const errorMessage =
		error?.data?.message ||
		error?.error ||
		"Something went wrong while fetching products. Please try again.";

	return (
		<main className="min-h-screen bg-slate-50 p-3 text-slate-900 dark:bg-[#080d18] dark:text-slate-100 sm:p-5 lg:p-6">
			<div className="mx-auto max-w-360 space-y-5 sm:space-y-6">
				<section className="relative isolate overflow-hidden rounded-2xl border border-cyan-500/30 bg-linear-to-r from-[#eaf3fb] via-[#e2f4f7] to-[#c8f1f5] px-4 py-5 text-slate-900 shadow-md transition-none dark:from-[#101a2d] dark:via-[#1b3043] dark:to-[#086477] dark:text-white sm:rounded-3xl sm:px-6 sm:py-6 lg:px-8">
					<div className="pointer-events-none absolute -right-20 -top-28 h-52 w-52 rounded-full bg-cyan-400/25 blur-xl dark:bg-cyan-400/15 sm:h-64 sm:w-64" />

					<div className="pointer-events-none absolute -bottom-32 right-8 hidden h-64 w-64 rounded-full border border-cyan-400/20 sm:block lg:right-24 lg:h-80 lg:w-80" />

					<div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
						<div className="flex min-w-0 items-center gap-3 sm:gap-4">
							<div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-cyan-700/15 bg-white/70 dark:border-white/15 dark:bg-white/10 sm:h-14 sm:w-14 sm:rounded-2xl">
								<Box size={25} className="text-cyan-500" />
							</div>

							<div className="min-w-0">
								<p className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-800 dark:text-cyan-300 sm:text-xs">
									<span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
									Commerce / Admin Panel
								</p>

								<h1 className="wrap-break-word text-2xl font-extrabold tracking-tight sm:text-3xl">
									Products
								</h1>

								<p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-600 dark:text-slate-300 sm:text-sm">
									Manage your products, inventory, pricing and categories from
									one place.
								</p>
							</div>
						</div>

						<button
							type="button"
							onClick={handleNavigateAdd}
							className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#086477] px-5 py-3 text-sm font-bold text-white shadow-cyan-900/10 transition-none hover:-translate-y-0.5 hover:bg-[#075363] dark:bg-cyan-400 dark:text-slate-950 dark:shadow-cyan-950/20 dark:hover:bg-cyan-300 sm:w-auto"
						>
							<Plus size={17} />
							Add Product
						</button>
					</div>

					<div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-cyan-800/10 pt-4 dark:border-white/10">
						<span className="inline-flex items-center gap-2 rounded-full border border-cyan-700/15 bg-white/60 px-3 py-1.5 text-[11px] font-semibold text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300">
							<Box size={13} />
							Product management
						</span>

						<span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
							<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
							Inventory overview
						</span>

						{isFetching && (
							<span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-500">
								<RefreshCw size={12} className="animate-spin" />
								Updating products...
							</span>
						)}
					</div>
				</section>

				<section className="min-w-0">
					<ProductsStats
						isDarkMode={isDarkMode}
						totalProducts={products.length}
						featuredCount={stats.featuredCount}
						inStockCount={stats.inStockCount}
						outOfStockCount={stats.outOfStockCount}
					/>
				</section>

				<section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700/70 dark:bg-[#111a2a] sm:p-4">
					<div className="mb-3 flex items-center gap-2">
						<div className="h-5 w-1 rounded-full bg-cyan-500" />
						<h2 className="text-sm font-bold text-slate-900 dark:text-white">
							Find products
						</h2>
					</div>

					<ProductsFilters
						isDarkMode={isDarkMode}
						searchInput={searchInput}
						setSearchInput={setSearchInput}
						handleSearch={handleSearch}
						handleSearchKeyDown={handleSearchKeyDown}
						category={category}
						setCategory={setCategory}
						subcategory={subcategory}
						setSubcategory={setSubcategory}
						showFilters={showFilters}
						setShowFilters={setShowFilters}
						handleReset={handleReset}
					/>
				</section>

				{isError && (
					<div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-800/60 dark:bg-rose-950/20 sm:p-8">
						<div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-rose-500/20 bg-rose-500/10">
							<AlertCircle className="h-7 w-7 text-rose-500" />
						</div>

						<h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
							Failed to load products
						</h2>

						<p className="mx-auto mb-5 mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
							{errorMessage}
						</p>

						<button
							type="button"
							onClick={refetch}
							className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#086477] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#075363] dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
						>
							<RefreshCw size={15} />
							Try Again
						</button>
					</div>
				)}

				{!isError &&
					(products.length > 0 ? (
						<section className="min-w-0">
							<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
								<div>
									<h2 className="text-lg font-bold text-slate-900 dark:text-white">
										Your products
									</h2>

									<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
										Browse and manage your product listings.
									</p>
								</div>

								<span className="rounded-full border border-cyan-700/15 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300">
									{products.length}{" "}
									{products.length === 1 ? "product" : "products"}
								</span>
							</div>

							<ProductsGrid products={products} isDarkMode={isDarkMode} />
						</section>
					) : (
						<div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center dark:border-slate-700/70 dark:bg-[#111a2a] sm:py-16">
							<div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-cyan-200 bg-cyan-50 dark:border-cyan-400/15 dark:bg-cyan-400/10">
								<Box className="h-8 w-8 text-cyan-500" />
							</div>

							<h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
								No products found
							</h2>

							<p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
								No products match your current search or filters. Try changing
								your criteria or clearing the filters.
							</p>

							<button
								type="button"
								onClick={handleReset}
								className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-700/20 bg-white/70 px-4 py-2.5 text-sm font-semibold text-cyan-800 hover:bg-white dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300 dark:hover:bg-cyan-400/20"
							>
								<RefreshCw size={14} />
								Clear filters
							</button>
						</div>
					))}
			</div>
		</main>
	);
});

export default Products;
