import {
	AlertCircle,
	ArrowLeft,
	BadgePercent,
	Boxes,
	ChevronLeft,
	ChevronRight,
	DollarSign,
	Layers,
	Package,
	RefreshCw,
	Sparkles,
	Star,
	Tag,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ProductSkeleton from "../../components/products/ProductSkeleton";
import useLoginTheme from "../../components/theme";
import { useGetSingleProductQuery } from "../../redux/features/products/productsApiSlice";

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

function formatMoney(value) {
	const num = Number(value);
	if (!Number.isFinite(num)) return "0.00";
	return CURRENCY_FORMATTER.format(num);
}

function resolveProduct(response) {
	return (
		response?.product ??
		response?.data?.product ??
		response?.data?.data?.product ??
		response?.data ??
		response
	);
}

function extractImages(rawImages) {
	if (!Array.isArray(rawImages)) return [];
	return rawImages
		.map((img) => (typeof img === "string" ? img : img?.url || img?.secure_url))
		.filter((img) => typeof img === "string" && img.trim().length > 0);
}

function extractTags(rawTags) {
	const list = Array.isArray(rawTags) ? rawTags : rawTags ? [rawTags] : [];
	return list
		.map((tag) => (typeof tag === "string" ? tag : tag?.name))
		.filter(Boolean);
}

function extractHighlights(product) {
	if (!product || typeof product !== "object") return [];

	const list = [];

	if (
		product.brand &&
		typeof product.brand === "string" &&
		product.brand.trim()
	) {
		list.push(`Brand: ${product.brand.trim()}`);
	}

	if (
		product.shortDescription &&
		typeof product.shortDescription === "string" &&
		product.shortDescription.trim()
	) {
		list.push(product.shortDescription.trim());
	}

	const rawHighlights = product.highlights;
	let items = [];
	if (Array.isArray(rawHighlights)) {
		items = rawHighlights;
	} else if (typeof rawHighlights === "string") {
		const trimmed = rawHighlights.trim();
		if (trimmed.startsWith("[")) {
			try {
				const parsed = JSON.parse(trimmed);
				items = Array.isArray(parsed) ? parsed : trimmed.split(",");
			} catch {
				items = trimmed.split(",");
			}
		} else if (trimmed) {
			items = trimmed.split(",");
		}
	} else if (rawHighlights && typeof rawHighlights === "object") {
		items = [rawHighlights];
	}

	for (const item of items) {
		const text =
			typeof item === "string"
				? item.trim()
				: (item?.title || item?.description || item?.name || "").trim();
		if (text) list.push(text);
	}

	return list;
}

function extractLabelValue(field, fallback = "") {
	if (!field) return fallback;
	if (typeof field === "object") {
		return (field.name || field.title || fallback).trim();
	}
	return String(field).trim() || fallback;
}

const ProductDetails = memo(function ProductDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const isDarkMode = useLoginTheme();

	const [activeImage, setActiveImage] = useState(0);
	const [failedUrls, setFailedUrls] = useState([]);

	const {
		data: response,
		isLoading,
		isError,
		error,
		refetch,
		isFetching,
	} = useGetSingleProductQuery(id, { skip: !id });

	const product = useMemo(() => resolveProduct(response), [response]);

	const hasProduct = Boolean(
		product && typeof product === "object" && (product._id || product.id),
	);

	const images = useMemo(
		() => extractImages(product?.images),
		[product?.images],
	);
	const tags = useMemo(() => extractTags(product?.tags), [product?.tags]);
	const highlights = useMemo(() => extractHighlights(product), [product]);

	const reviews = useMemo(
		() => (Array.isArray(product?.reviews) ? product.reviews : []),
		[product?.reviews],
	);

	const averageRating = useMemo(() => {
		const rating = Number(product?.averageRating);
		return Number.isFinite(rating) ? rating : 0;
	}, [product?.averageRating]);

	const numReviews = useMemo(() => {
		const count = Number(product?.numReviews ?? reviews.length);
		return Number.isFinite(count) ? count : reviews.length;
	}, [product?.numReviews, reviews.length]);

	const pricing = useMemo(() => {
		const originalPrice = Number(product?.price);
		const discountPrice = Number(product?.discountPrice);
		const hasValidDiscount =
			Number.isFinite(originalPrice) &&
			Number.isFinite(discountPrice) &&
			originalPrice > 0 &&
			discountPrice >= 0 &&
			discountPrice < originalPrice;
		const discountPercentage = hasValidDiscount
			? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
			: 0;

		return {
			originalPrice,
			discountPrice,
			hasValidDiscount,
			discountPercentage,
		};
	}, [product?.price, product?.discountPrice]);

	const safeStock = useMemo(() => {
		const stock = Number(product?.stock ?? product?.quantity ?? 0);
		return Number.isFinite(stock) ? stock : 0;
	}, [product?.stock, product?.quantity]);

	const category = useMemo(
		() => extractLabelValue(product?.category, "Uncategorized"),
		[product?.category],
	);

	const subcategory = useMemo(
		() => extractLabelValue(product?.subcategory, ""),
		[product?.subcategory],
	);

	useEffect(() => {
		if (images.length === 0) return;
		if (activeImage >= images.length) {
			setActiveImage(0);
		}
	}, [activeImage, images.length]);

	const goBack = useCallback(() => {
		navigate("/dashboard/products");
	}, [navigate]);

	const handleSelectImage = useCallback((idx) => {
		setActiveImage(idx);
	}, []);

	const handlePrevImage = useCallback(() => {
		setActiveImage((current) =>
			images.length < 2 ? 0 : (current - 1 + images.length) % images.length,
		);
	}, [images.length]);

	const handleNextImage = useCallback(() => {
		setActiveImage((current) =>
			images.length < 2 ? 0 : (current + 1) % images.length,
		);
	}, [images.length]);

	const handleImageError = useCallback((url) => {
		if (!url) return;
		setFailedUrls((current) =>
			current.includes(url) ? current : [...current, url],
		);
	}, []);

	if (isLoading || !response) {
		return (
			<main className="min-h-screen bg-slate-50 p-3 transition-none dark:bg-[#080d18] sm:p-5 lg:p-6">
				<div className="mx-auto max-w-360">
					<ProductSkeleton isDarkMode={isDarkMode} />
				</div>
			</main>
		);
	}

	if (isError || !hasProduct) {
		const errorMessage =
			error?.data?.message || error?.message || "Product not found.";

		return (
			<div className="flex min-h-[70vh] items-center justify-center bg-slate-50 p-4 dark:bg-[#080d18] sm:p-6">
				<div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl dark:border-cyan-500/25 dark:bg-[#101b2c] sm:p-8">
					<div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-red-500/20 bg-red-500/10">
						<AlertCircle size={30} className="text-red-500" />
					</div>

					<h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
						Unable to load product
					</h2>

					<p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
						{errorMessage}
					</p>

					<div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
						<button
							type="button"
							onClick={refetch}
							className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
						>
							<RefreshCw size={15} />
							Try again
						</button>

						<button
							type="button"
							onClick={goBack}
							className="cursor-pointer rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
						>
							Back to products
						</button>
					</div>
				</div>
			</div>
		);
	}

	const productName = product.name || "Product Name";
	const currentUrl = images[activeImage] || "";
	const isCurrentFailed = !currentUrl || failedUrls.includes(currentUrl);
	const inStock = safeStock > 0;

	return (
		<div className="min-h-screen bg-slate-50 p-3 dark:bg-[#080d18] sm:p-5 lg:p-6">
			<div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
				<section className="relative isolate overflow-hidden rounded-3xl border border-cyan-400/40 bg-linear-to-r from-[#e5f7fc] via-[#d3f1f7] to-[#b7e9f1] px-5 py-5 text-slate-900 shadow-xl transition-none dark:from-[#101a2d] dark:via-[#07334a] dark:to-[#08758a] dark:text-white sm:px-6 sm:py-6">
					<div className="pointer-events-none absolute -right-24 -top-32 h-95 w-95 rounded-full bg-cyan-400/25 blur-2xl dark:bg-cyan-400/20" />

					<div className="pointer-events-none absolute -bottom-40 right-24 hidden h-80 w-80 rounded-full border border-cyan-300/25 sm:block" />

					<div className="relative">
						<button
							type="button"
							onClick={goBack}
							className="mb-4 inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-cyan-700 dark:text-slate-300 dark:hover:text-cyan-300"
						>
							<ArrowLeft size={14} />
							Back
						</button>

						<div className="flex min-w-0 items-center gap-3 sm:gap-4">
							<div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-700/15 bg-white/70 dark:border-white/15 dark:bg-white/10">
								<Package size={22} className="text-cyan-400" />
							</div>

							<div className="min-w-0">
								<h1 className="wrap-break-word text-xl font-extrabold tracking-tight sm:text-2xl">
									{productName}
								</h1>

								<p className="mt-1 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
									Product details overview
								</p>
							</div>
						</div>

						<div className="mt-4 flex flex-wrap items-center gap-2 border-t border-cyan-400/20 pt-4">
							<span className="inline-flex items-center gap-2 rounded-full border border-cyan-700/20 bg-white/60 px-3 py-1.5 text-[11px] font-semibold text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300">
								<Package size={13} />
								Product information
							</span>

							<span
								className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
									inStock
										? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
										: "border-red-500/25 bg-red-500/10 text-red-500"
								}`}
							>
								<span
									className={`h-1.5 w-1.5 rounded-full ${
										inStock ? "bg-emerald-400" : "bg-red-400"
									}`}
								/>
								{inStock ? "In Stock" : "Out of Stock"}
							</span>

							{isFetching && (
								<span className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400">
									<RefreshCw size={12} className="animate-spin" />
									Updating...
								</span>
							)}
						</div>
					</div>
				</section>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
					<div className="min-w-0 space-y-4 lg:col-span-6 xl:col-span-7">
						<div className="relative flex h-50 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-cyan-500/40 dark:bg-[#0b1725] sm:h-85">
							{!isCurrentFailed ? (
								<img
									src={currentUrl}
									alt={productName}
									onError={() => handleImageError(currentUrl)}
									className="h-full w-full object-cover"
								/>
							) : (
								<div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
									<Package size={32} />
									<span className="text-xs">No image available</span>
								</div>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
							{images.map((img, idx, list) => {
								const occurrence = list
									.slice(0, idx)
									.filter((item) => item === img).length;
								const isThumbFailed = failedUrls.includes(img);
								return (
									<button
										key={`${img}-${occurrence}`}
										type="button"
										aria-label={`Select image ${idx + 1}`}
										onClick={() => handleSelectImage(idx)}
										className={`relative flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border transition ${
											activeImage === idx
												? "border-cyan-400 ring-1 ring-cyan-400/50"
												: "border-slate-200 hover:border-cyan-400 dark:border-slate-700 dark:hover:border-cyan-400/50"
										}`}
									>
										{!isThumbFailed ? (
											<img
												src={img}
												alt={`${productName} ${idx + 1}`}
												onError={() => handleImageError(img)}
												className="h-full w-full object-cover"
											/>
										) : (
											<Package
												size={26}
												className="text-slate-500 dark:text-slate-400"
											/>
										)}
									</button>
								);
							})}
						</div>

						<div className="relative flex h-77 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-cyan-500/40 dark:bg-[#0b1725] sm:h-105">
							{!isCurrentFailed ? (
								<>
									<img
										src={currentUrl}
										alt={productName}
										onError={() => handleImageError(currentUrl)}
										className="h-full w-full object-cover"
									/>

									{images.length > 1 && (
										<>
											<button
												type="button"
												aria-label="Previous image"
												onClick={handlePrevImage}
												className="absolute left-3 top-1/2 flex h-9 w-9 cursor-pointer -translate-y-1/2 items-center justify-center rounded-xl border border-cyan-500/20 bg-slate-950/70 text-white shadow-lg backdrop-blur transition hover:bg-cyan-600"
											>
												<ChevronLeft size={18} />
											</button>

											<button
												type="button"
												aria-label="Next image"
												onClick={handleNextImage}
												className="absolute right-3 top-1/2 flex h-9 w-9 cursor-pointer -translate-y-1/2 items-center justify-center rounded-xl border border-cyan-500/20 bg-slate-950/70 text-white shadow-lg backdrop-blur transition hover:bg-cyan-600"
											>
												<ChevronRight size={18} />
											</button>
										</>
									)}

									<span className="absolute bottom-3 right-3 rounded-lg border border-white/15 bg-slate-950/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
										{activeImage + 1} / {images.length}
									</span>
								</>
							) : (
								<div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
									<Package size={40} />
									<span className="text-xs">No image available</span>
								</div>
							)}
						</div>
					</div>

					<div className="min-w-0 space-y-4 lg:col-span-6 xl:col-span-5">
						<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-cyan-500/25 dark:bg-[#101b2c] sm:p-5">
							<div className="mb-4 flex items-center gap-2">
								<div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/10">
									<Package size={16} className="text-cyan-400" />
								</div>

								<span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">
									Overview
								</span>
							</div>

							<h2 className="wrap-break-word text-3xl font-bold text-slate-900 dark:text-white">
								{product.name || "Unnamed product"}
							</h2>

							<p className="mt-2 whitespace-pre-line wrap-break-word text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
								{product.description || "No description provided."}
							</p>

							<div className="mt-5 grid grid-cols-2 gap-3">
								<div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-cyan-400/50 dark:border-cyan-500/20 dark:bg-[#0b1725]">
									<div className="flex items-center gap-1.5">
										<DollarSign size={13} className="text-cyan-400" />
										<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
											Price
										</span>
									</div>

									<p className="mt-2 wrap-break-word text-base font-extrabold tabular-nums text-slate-900 dark:text-white sm:text-lg">
										{formatMoney(product.price)}
									</p>

									<p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
										Regular price
									</p>
								</div>

								<div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-cyan-400/50 dark:border-cyan-500/20 dark:bg-[#0b1725]">
									<div className="flex items-center gap-1.5">
										<BadgePercent size={13} className="text-cyan-400" />
										<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
											Discount
										</span>
									</div>

									<p className="mt-2 wrap-break-word text-base font-extrabold tabular-nums text-slate-900 dark:text-white sm:text-lg">
										{pricing.hasValidDiscount
											? formatMoney(pricing.discountPrice)
											: "—"}
									</p>

									<p
										className={`mt-1 text-[10px] font-semibold ${
											pricing.hasValidDiscount
												? "text-emerald-500"
												: "text-slate-500 dark:text-slate-400"
										}`}
									>
										{pricing.hasValidDiscount
											? `${pricing.discountPercentage}% OFF`
											: "No active discount"}
									</p>
								</div>

								<div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-cyan-400/50 dark:border-cyan-500/20 dark:bg-[#0b1725]">
									<div className="flex items-center gap-1.5">
										<Boxes size={13} className="text-cyan-400" />
										<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
											Stock
										</span>
									</div>

									<p
										className={`mt-2 text-base font-extrabold tabular-nums sm:text-lg ${
											inStock ? "text-emerald-500" : "text-red-500"
										}`}
									>
										{safeStock}
									</p>

									<p
										className={`mt-1 text-[10px] font-semibold ${
											inStock ? "text-emerald-500" : "text-red-500"
										}`}
									>
										{inStock ? "In Stock" : "Out of Stock"}
									</p>
								</div>

								<div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-cyan-400/50 dark:border-cyan-500/20 dark:bg-[#0b1725]">
									<div className="flex items-center gap-1.5">
										<Tag size={13} className="text-cyan-400" />
										<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
											SKU
										</span>
									</div>

									<p
										title={product.sku || "N/A"}
										className="mt-2 break-all text-xs font-bold text-slate-900 dark:text-white sm:text-sm"
									>
										{product.sku || "N/A"}
									</p>

									<p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
										Product identifier
									</p>
								</div>
							</div>
						</div>

						<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-cyan-500/25 dark:bg-[#101b2c] sm:p-5">
							<div className="mb-3 flex items-center gap-2">
								<Tag size={14} className="text-cyan-400" />
								<h3 className="text-xs font-semibold text-slate-900 dark:text-white">
									Tags
								</h3>
							</div>

							{tags.length > 0 ? (
								<div className="flex flex-wrap gap-2">
									{tags.map((tagName, index, list) => {
										const occurrence = list
											.slice(0, index)
											.filter((item) => item === tagName).length;
										return (
											<span
												key={`${tagName}-${occurrence}`}
												className="max-w-full wrap-break-word rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 text-[11px] font-medium text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300"
											>
												#{tagName}
											</span>
										);
									})}
								</div>
							) : (
								<p className="text-xs text-slate-500 dark:text-slate-400">
									No tags added.
								</p>
							)}
						</div>

						<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-cyan-500/25 dark:bg-[#101b2c] sm:p-5">
							<div className="mb-3 flex items-center gap-2">
								<Layers size={14} className="text-cyan-400" />
								<h3 className="text-xs font-semibold text-slate-900 dark:text-white">
									Category Info
								</h3>
							</div>

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-cyan-500/20 dark:bg-[#0b1725]">
									<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
										Category
									</span>
									<p className="mt-1.5 wrap-break-word text-xs font-semibold capitalize text-slate-900 dark:text-white">
										{category}.{subcategory || "No subcategory"}.
										{product.name.split(" ").slice(0, 1)}
									</p>
								</div>
							</div>
						</div>

						<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-cyan-500/25 dark:bg-[#101b2c] sm:p-5">
							<div className="mb-3 flex items-center justify-between gap-2">
								<div className="flex items-center gap-2">
									<Sparkles size={14} className="text-cyan-400" />
									<h3 className="text-xs font-semibold text-slate-900 dark:text-white">
										Highlights & Reviews
									</h3>
								</div>

								<div className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
									<Star size={12} className="fill-amber-400 text-amber-400" />
									<span>{averageRating.toFixed(1)}</span>
									<span className="text-slate-500 dark:text-slate-400">
										({numReviews})
									</span>
								</div>
							</div>

							{highlights.length > 0 ? (
								<ul className="space-y-2">
									{highlights.map((text, index, list) => {
										const occurrence = list
											.slice(0, index)
											.filter((item) => item === text).length;
										return (
											<li
												key={`${text}-${occurrence}`}
												className="flex items-start gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300"
											>
												<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
												<span className="wrap-break-word">{text}</span>
											</li>
										);
									})}
								</ul>
							) : (
								<p className="text-xs text-slate-500 dark:text-slate-400">
									No highlights available.
								</p>
							)}

							<div className="mt-4 border-t border-slate-200 pt-4 dark:border-cyan-500/15">
								<p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
									Customer Reviews ({numReviews})
								</p>

								{reviews.length > 0 ? (
									<div className="space-y-2.5">
										{reviews.map((rev, index) => {
											const reviewerName =
												rev?.username || rev?.user?.name || "Customer";
											const revRating = Number(rev?.rating ?? 0);
											return (
												<div
													key={rev?._id || `${reviewerName}-${index}`}
													className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-cyan-500/20 dark:bg-[#0b1725]"
												>
													<div className="flex items-center justify-between gap-2">
														<span className="truncate text-xs font-semibold text-slate-900 dark:text-white">
															{reviewerName}
														</span>

														<span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-amber-400">
															<Star
																size={11}
																className="fill-amber-400 text-amber-400"
															/>
															{Number.isFinite(revRating)
																? revRating.toFixed(1)
																: "0.0"}
														</span>
													</div>

													{rev?.comment && (
														<p className="mt-1.5 wrap-break-word text-xs leading-relaxed text-slate-600 dark:text-slate-300">
															{rev.comment}
														</p>
													)}
												</div>
											);
										})}
									</div>
								) : (
									<p className="text-xs text-slate-500 dark:text-slate-400">
										No reviews yet.
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
});

export default ProductDetails;
