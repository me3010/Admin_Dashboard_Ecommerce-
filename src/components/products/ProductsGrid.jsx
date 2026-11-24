import { memo, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
	ArrowUpRight,
	BadgePercent,
	Box,
	ChevronLeft,
	ChevronRight,
	Edit,
	Eye,
	Layers,
	LoaderCircle,
	Star,
	Trash2,
	Zap,
} from "lucide-react";

import { useDeleteProductMutation } from "../../redux/features/products/productsApiSlice";
import ProductModal from "./ProductModal";

const FALLBACK_IMAGE = "https://placehold.co/600x400?text=Product";

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

function formatCurrency(amount) {
	return `$${CURRENCY_FORMATTER.format(Number(amount) || 0)}`;
}

const ACTION_BUTTON_CLASS =
	"border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-300";

function extractImages(images) {
	if (!Array.isArray(images)) return [FALLBACK_IMAGE];
	const urls = images
		.map((image) =>
			typeof image === "string"
				? image
				: image?.url || image?.secure_url || image?.imageUrl,
		)
		.filter(Boolean);
	return urls.length ? urls : [FALLBACK_IMAGE];
}

function extractTags(tags) {
	if (!Array.isArray(tags)) return [];
	return tags
		.map((tag) => (typeof tag === "string" ? tag : tag?.name))
		.filter(Boolean);
}

const ProductCard = memo(function ProductCard({
	product,
	isDarkMode = true,
	onQuickEdit,
}) {
	const navigate = useNavigate();
	const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

	const productId = product?._id || product?.id;
	const productName = product?.name || "Unnamed Product";

	const [prevEl, setPrevEl] = useState(null);
	const [nextEl, setNextEl] = useState(null);

	const displayImages = useMemo(
		() => extractImages(product?.images),
		[product?.images],
	);

	const tags = useMemo(() => extractTags(product?.tags), [product?.tags]);

	const pricing = useMemo(() => {
		const price = Number(product?.price) || 0;
		const rawDiscount =
			product?.discountPrice != null ? Number(product.discountPrice) : null;
		const hasDiscount =
			rawDiscount !== null &&
			Number.isFinite(rawDiscount) &&
			rawDiscount >= 0 &&
			rawDiscount < price;
		const displayPrice = hasDiscount ? rawDiscount : price;
		const discountPercent = hasDiscount
			? Math.round(((price - rawDiscount) / price) * 100)
			: 0;
		const savedAmount = hasDiscount ? price - rawDiscount : 0;

		return {
			price,
			hasDiscount,
			displayPrice,
			discountPercent,
			savedAmount,
		};
	}, [product?.price, product?.discountPrice]);

	const stock = Number(product?.stock ?? product?.quantity ?? 0) || 0;

	const categoryName =
		typeof product?.category === "object"
			? product.category?.name || product.category?.title
			: product?.category;

	const handleImageError = useCallback((e) => {
		e.currentTarget.onerror = null;
		e.currentTarget.src = FALLBACK_IMAGE;
	}, []);

	const handleViewDetails = useCallback(() => {
		if (!productId) return;
		navigate(`/dashboard/products/view/${productId}`);
	}, [navigate, productId]);

	const handleEditProduct = useCallback(() => {
		if (!productId) return;
		navigate(`/dashboard/products/edit/${productId}`);
	}, [navigate, productId]);

	const handleQuickEditClick = useCallback(() => {
		if (!productId || !onQuickEdit) return;
		onQuickEdit(productId);
	}, [onQuickEdit, productId]);

	const handleDelete = useCallback(async () => {
		if (!productId) return;

		const swalTheme = {
			background: isDarkMode ? "#111a2a" : "#ffffff",
			color: isDarkMode ? "#f1f5f9" : "#0f172a",
		};

		const result = await Swal.fire({
			title: "Are you sure?",
			text: `You are about to delete "${productName}". This action cannot be undone!`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#e11d48",
			cancelButtonColor: "#64748b",
			confirmButtonText: "Yes, delete it!",
			cancelButtonText: "Cancel",
			reverseButtons: true,
			...swalTheme,
		});

		if (!result.isConfirmed) return;

		try {
			await deleteProduct(productId).unwrap();
			await Swal.fire({
				title: "Deleted!",
				text: "Product has been deleted successfully.",
				icon: "success",
				confirmButtonColor: "#06b6d4",
				...swalTheme,
			});
		} catch (error) {
			Swal.fire({
				title: "Error!",
				text: error?.data?.message || "Failed to delete product.",
				icon: "error",
				confirmButtonColor: "#e11d48",
				...swalTheme,
			});
		}
	}, [deleteProduct, isDarkMode, productId, productName]);

	if (!product || typeof product !== "object") return null;

	const hasMultipleImages = displayImages.length > 1;
	const visibleTags = tags.slice(0, 3);
	const extraTagsCount = Math.max(0, tags.length - 3);

	return (
		<article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-900/10 dark:border-slate-700/70 dark:bg-[#111a2a] dark:hover:border-cyan-400/50 dark:hover:shadow-cyan-950/30">
			<div className="group/slider relative h-48 overflow-hidden bg-slate-100 dark:bg-[#0a1120]">
				<Swiper
					key={`${productId || productName}-${displayImages.length}`}
					modules={[Navigation, Pagination, Autoplay]}
					slidesPerView={1}
					navigation={
						hasMultipleImages
							? {
									prevEl,
									nextEl,
								}
							: false
					}
					onBeforeInit={(swiper) => {
						if (hasMultipleImages && prevEl && nextEl) {
							swiper.params.navigation.prevEl = prevEl;
							swiper.params.navigation.nextEl = nextEl;
						}
					}}
					pagination={hasMultipleImages ? { clickable: true } : false}
					autoplay={
						hasMultipleImages
							? {
									delay: 1000,
									disableOnInteraction: false,
									pauseOnMouseEnter: true,
								}
							: false
					}
					loop={false}
					rewind={false}
					observer
					observeParents
					className="product-card-swiper h-full w-full [&_.swiper-button-next]:hidden [&_.swiper-button-prev]:hidden"
				>
					{displayImages.map((image, index, list) => {
						const occurrence = list
							.slice(0, index)
							.filter((item) => item === image).length;
						return (
							<SwiperSlide key={`${image}-${occurrence}`}>
								<img
									src={image}
									alt={`${productName} - ${index + 1}`}
									loading="lazy"
									onError={handleImageError}
									className="h-full w-full object-cover object-center transition-transform duration-500 group-hover/slider:scale-105"
								/>
							</SwiperSlide>
						);
					})}
				</Swiper>

				{hasMultipleImages && (
					<>
						<button
							ref={setPrevEl}
							type="button"
							aria-label="Previous product image"
							className="absolute left-2.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl border border-cyan-400/30 bg-slate-950/75 text-cyan-300 shadow-lg backdrop-blur-md transition hover:scale-105 hover:border-cyan-400 hover:bg-cyan-500 hover:text-slate-950 disabled:pointer-events-none disabled:opacity-30"
						>
							<ChevronLeft size={16} />
						</button>

						<button
							ref={setNextEl}
							type="button"
							aria-label="Next product image"
							className="absolute right-2.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl border border-cyan-400/30 bg-slate-950/75 text-cyan-300 shadow-lg backdrop-blur-md transition hover:scale-105 hover:border-cyan-400 hover:bg-cyan-500 hover:text-slate-950 disabled:pointer-events-none disabled:opacity-30"
						>
							<ChevronRight size={16} />
						</button>
					</>
				)}

				<div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-linear-to-t from-slate-950/50 to-transparent" />

				{product.featured && (
					<span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-slate-950/75 px-2.5 py-1 text-[11px] font-semibold text-amber-300 shadow-sm backdrop-blur-md">
						<Star size={12} className="fill-amber-300" />
						Featured
					</span>
				)}

				{pricing.hasDiscount && (
					<span className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1 rounded-lg bg-cyan-400 px-2.5 py-1 text-[11px] font-extrabold text-slate-950 shadow-md">
						<BadgePercent size={13} />
						{pricing.discountPercent}% OFF
					</span>
				)}

				<span
					className={`absolute right-3 top-3 z-20 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-md ${
						stock > 0
							? "border-emerald-300/30 bg-emerald-950/80 text-emerald-300"
							: "border-rose-300/30 bg-rose-950/80 text-rose-300"
					}`}
				>
					{stock > 0 ? `${stock} in stock` : "Out of stock"}
				</span>

				{hasMultipleImages && (
					<span className="absolute bottom-3 right-3 z-20 rounded-md bg-slate-950/75 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
						{displayImages.length} Photos
					</span>
				)}
			</div>

			<div className="flex flex-1 flex-col p-4 sm:p-5">
				<div className="flex-1">
					<div className="mb-2 flex flex-wrap items-center gap-2">
						<span className="inline-flex max-w-full items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-500">
							<Layers size={11} />
							<span className="truncate">
								{categoryName || "Uncategorized"}
							</span>
						</span>

						{product.brand && (
							<span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
								{product.brand}
							</span>
						)}
					</div>

					<div className="flex items-start justify-between gap-2">
						<h3
							title={product.name || ""}
							className="line-clamp-2 min-w-0 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-cyan-500 dark:text-slate-100"
						>
							{productName}
						</h3>

						<button
							type="button"
							aria-label={`View ${productName} details`}
							onClick={handleViewDetails}
							className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-700 dark:text-slate-400 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-300"
						>
							<ArrowUpRight size={17} />
						</button>
					</div>

					<p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
						{product.shortDescription ||
							product.description ||
							"No description available."}
					</p>

					{visibleTags.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-1.5">
							{visibleTags.map((tag, index, list) => {
								const occurrence = list
									.slice(0, index)
									.filter((item) => item === tag).length;
								return (
									<span
										key={`${tag}-${occurrence}`}
										className="max-w-full truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300"
									>
										#{tag}
									</span>
								);
							})}

							{extraTagsCount > 0 && (
								<span className="px-1 py-1 text-[10px] text-slate-500 dark:text-slate-400">
									+{extraTagsCount} more
								</span>
							)}
						</div>
					)}
				</div>

				<div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700/70 dark:bg-[#0c1422]">
					<div className="flex items-end justify-between gap-3">
						<div className="min-w-0">
							<p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
								Selling price
							</p>

							<p className="mt-1 wrap-break-word text-xl font-extrabold tracking-tight text-cyan-500 sm:text-2xl">
								{formatCurrency(pricing.displayPrice)}
							</p>
						</div>

						{pricing.hasDiscount && (
							<div className="min-w-0 text-right">
								<p className="text-[10px] text-slate-500 dark:text-slate-400">
									Regular price
								</p>

								<p className="mt-1 text-xs line-through text-slate-500 dark:text-slate-400">
									{formatCurrency(pricing.price)}
								</p>

								<p className="mt-1 text-[10px] font-bold text-emerald-500">
									Save {formatCurrency(pricing.savedAmount)}
								</p>
							</div>
						)}
					</div>
				</div>

				<div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3 dark:border-slate-700/70">
					<button
						type="button"
						onClick={handleViewDetails}
						className={`flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition ${ACTION_BUTTON_CLASS}`}
					>
						<Eye size={14} />
						View details
					</button>

					<button
						type="button"
						onClick={handleEditProduct}
						className={`flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition ${ACTION_BUTTON_CLASS}`}
					>
						<Edit size={14} />
						Edit
					</button>

					<button
						type="button"
						onClick={handleQuickEditClick}
						className={`flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition ${ACTION_BUTTON_CLASS}`}
					>
						<Zap size={14} />
						Quick edit
					</button>

					<button
						type="button"
						onClick={handleDelete}
						disabled={isDeleting}
						className="flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2 py-2 text-xs font-semibold text-rose-500 transition hover:border-rose-500/40 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isDeleting ? (
							<LoaderCircle size={14} className="animate-spin" />
						) : (
							<Trash2 size={14} />
						)}
						{isDeleting ? "Deleting..." : "Delete"}
					</button>
				</div>
			</div>
		</article>
	);
});

const ProductsGrid = memo(function ProductsGrid({
	products = [],
	isDarkMode = true,
}) {
	const [selectedProductId, setSelectedProductId] = useState(null);

	const validProducts = useMemo(
		() =>
			Array.isArray(products)
				? products.filter((item) => item && typeof item === "object")
				: [],
		[products],
	);

	const handleQuickEdit = useCallback((productId) => {
		setSelectedProductId(productId);
	}, []);

	const handleCloseModal = useCallback(() => {
		setSelectedProductId(null);
	}, []);

	if (!validProducts.length) {
		return (
			<div className="rounded-2xl border border-slate-200 bg-white py-12 text-center dark:border-slate-700 dark:bg-[#111a2a]">
				<div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cyan-500/10">
					<Box className="h-7 w-7 text-cyan-500" />
				</div>

				<h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
					No products available
				</h3>

				<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Try changing your search or filter criteria.
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
				{validProducts.map((product, index) => (
					<ProductCard
						key={product._id || product.id || `product-${index}`}
						product={product}
						isDarkMode={isDarkMode}
						onQuickEdit={handleQuickEdit}
					/>
				))}
			</div>

			{selectedProductId && (
				<ProductModal
					isOpen={Boolean(selectedProductId)}
					productId={selectedProductId}
					onClose={handleCloseModal}
				/>
			)}
		</>
	);
});

export default ProductsGrid;
