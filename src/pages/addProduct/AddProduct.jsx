import {
	ArrowLeft,
	CheckCircle2,
	ImagePlus,
	LoaderCircle,
	PackagePlus,
	Plus,
	Tag,
	Upload,
	X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useIsDark from "../../hooks/useIsDark";
import { useCreateProductMutation } from "../../redux/features/products/productsApiSlice";
import AddProductSkeleton from "./AddProductSkeleton";

const MAX_IMAGES = 5;
const THUMBNAIL_SLOTS = [0, 1, 2, 3, 4];

const INITIAL_FIELDS = {
	name: "",
	shortDescription: "",
	price: "",
	discountPrice: "",
	stock: "",
	sku: "",
	description: "",
	category: "",
	subcategory: "",
	brand: "",
	featured: false,
	isActive: true,
};

function notify(id, type, message) {
	toast.dismiss(id);
	toast[type](message, { toastId: id });
}

function getTheme(isDark) {
	return {
		shell: isDark
			? "border-[#243b56] bg-[#050a12] text-white"
			: "border-slate-300 bg-[#f1f5f9] text-slate-900",
		glow: isDark
			? "bg-[radial-gradient(ellipse_at_10%_0%,rgba(6,182,212,0.12),transparent_55%),radial-gradient(ellipse_at_90%_0%,rgba(37,99,235,0.12),transparent_50%)]"
			: "bg-[radial-gradient(ellipse_at_10%_0%,rgba(6,182,212,0.08),transparent_55%),radial-gradient(ellipse_at_90%_0%,rgba(37,99,235,0.07),transparent_50%)]",
		header: isDark
			? "border-[#243b56] bg-[#0b111b]/90"
			: "border-slate-300 bg-[#f8fafc]",
		panel: isDark
			? "border-[#243b56] bg-[#0b111b]/95 shadow-[0_0_25px_rgba(34,211,238,0.035)] hover:border-cyan-400/35"
			: "border-slate-300 bg-white shadow-[7px_7px_16px_rgba(148,163,184,0.24),-7px_-7px_16px_rgba(255,255,255,0.7)]",
		field: isDark
			? "border-[#30445f] bg-[#101d30] text-white placeholder:text-slate-500 hover:border-[#426080] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15"
			: "border-slate-300 bg-[#f1f5f9] text-slate-900 placeholder:text-slate-500 hover:border-slate-400 focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-500/15",
		label: isDark ? "text-slate-300" : "text-slate-700",
		muted: isDark ? "text-slate-400" : "text-slate-600",
		subtle: isDark ? "text-slate-500" : "text-slate-500",
		title: isDark ? "text-white" : "text-slate-900",
		bodyText: isDark ? "text-slate-200" : "text-slate-800",
		accentText: isDark ? "text-cyan-400" : "text-cyan-700",
		accentSoftText: isDark ? "text-cyan-300" : "text-cyan-800",
		backBtn: isDark
			? "border-[#30445f] bg-[#101d30] text-cyan-300 hover:border-cyan-400 hover:bg-cyan-400/10"
			: "border-slate-300 bg-slate-100 text-cyan-800 hover:border-cyan-500 hover:bg-cyan-50",
		readyBox: isDark
			? "border-emerald-500/20 bg-emerald-500/5 text-emerald-100"
			: "border-emerald-200 bg-emerald-50 text-emerald-900",
		readySub: isDark ? "text-emerald-200/70" : "text-emerald-800",
		uploadArea: isDark
			? "border-[#30445f] bg-[#101d30] hover:border-cyan-400 hover:bg-[#12233a]"
			: "border-slate-400 bg-[#f1f5f9] hover:border-cyan-600 hover:bg-slate-200/70",
		uploadIconBox: isDark
			? "border-cyan-300/20 bg-cyan-400/10 text-cyan-300 group-hover:border-cyan-300/40 group-hover:bg-cyan-400/15"
			: "border-cyan-600/20 bg-cyan-500/10 text-cyan-700 group-hover:bg-cyan-500/15",
		addMoreTile: isDark
			? "border-[#30445f] bg-[#0b111b] text-cyan-300 hover:border-cyan-400"
			: "border-slate-300 bg-white text-cyan-800 hover:border-cyan-600",
		thumbBox: isDark
			? "border-[#30445f] bg-[#101d30]"
			: "border-slate-300 bg-[#f1f5f9]",
		tipBox: isDark
			? "border-cyan-400/15 bg-cyan-400/5"
			: "border-cyan-600/20 bg-cyan-50",
		divider: isDark ? "border-[#243b56]" : "border-slate-200",
		iconBadge: isDark
			? "border-cyan-400/15 bg-cyan-400/10 text-cyan-300"
			: "border-cyan-600/20 bg-cyan-50 text-cyan-700",
		tagPill: isDark
			? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
			: "border-cyan-600/25 bg-cyan-50 text-cyan-800",
		optionsBox: isDark
			? "border-[#30445f] bg-[#101d30]"
			: "border-slate-300 bg-[#f1f5f9]",
		optionHover: isDark ? "hover:bg-cyan-400/5" : "hover:bg-white/80",
		cancelBtn: isDark
			? "border-[#30445f] bg-[#101d30] text-slate-300 hover:border-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300"
			: "border-slate-300 bg-white text-slate-700 hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-800",
		primaryBtn: isDark
			? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 hover:shadow-[0_8px_25px_rgba(6,182,212,0.18)]"
			: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 hover:shadow-[0_8px_25px_rgba(6,182,212,0.18)]",
	};
}

function getBackendErrorMessage(error) {
	if (Array.isArray(error?.data?.errors) && error.data.errors.length > 0) {
		return error.data.errors
			.map((item) => item?.msg || item?.message || String(item))
			.join(" | ");
	}
	return (
		error?.data?.message ||
		error?.data?.error ||
		error?.error ||
		"Unable to create the product. Please check the fields and try again."
	);
}

function getRequiredFieldError(fields, tagsCount, imagesCount) {
	if (!fields.name.trim()) return "Product Name field must be filled.";
	if (fields.name.trim().length < 3)
		return "Product Name must be at least 3 characters.";
	if (!fields.shortDescription.trim())
		return "Short Description field must be filled.";
	if (fields.shortDescription.trim().length < 10)
		return "Short Description must be at least 10 characters.";
	if (String(fields.price).trim() === "" || Number(fields.price) < 0)
		return "Price field must be filled.";
	if (
		String(fields.discountPrice).trim() === "" ||
		Number(fields.discountPrice) < 0
	)
		return "Discount Price field must be filled.";
	if (String(fields.stock).trim() === "" || Number(fields.stock) < 0)
		return "Stock field must be filled.";
	if (!fields.sku.trim()) return "SKU field must be filled.";
	if (!fields.description.trim()) return "Description field must be filled.";
	if (fields.description.trim().length < 20)
		return "Description must be at least 20 characters.";
	if (!fields.category.trim()) return "Category field must be filled.";
	if (!fields.subcategory.trim()) return "Subcategory field must be filled.";
	if (!fields.brand.trim()) return "Brand field must be filled.";
	if (tagsCount === 0) return "Tags field must be filled.";
	if (imagesCount === 0) return "Product Images field must be filled.";
	return "";
}

const AddProduct = () => {
	const isDark = useIsDark();
	const t = useMemo(() => getTheme(isDark), [isDark]);
	const navigate = useNavigate();

	const [createProduct, { isLoading }] = useCreateProductMutation();

	const [fields, setFields] = useState(INITIAL_FIELDS);
	const [images, setImages] = useState([]);
	const [tags, setTags] = useState([]);
	const [tagInput, setTagInput] = useState("");

	const imagePreviews = useMemo(
		() => images.map((file) => URL.createObjectURL(file)),
		[images],
	);

	useEffect(() => {
		return () => {
			for (const url of imagePreviews) {
				URL.revokeObjectURL(url);
			}
		};
	}, [imagePreviews]);

	const updateField = useCallback((name, value) => {
		setFields((prev) => ({ ...prev, [name]: value }));
	}, []);

	const handleFieldBlur = useCallback(
		(name, label) => {
			const val = fields[name];
			const isEmpty =
				typeof val === "boolean" ? false : String(val ?? "").trim() === "";
			if (isEmpty) {
				notify(
					`empty-field-${name}`,
					"warning",
					`${label} field must be filled.`,
				);
			}
		},
		[fields],
	);

	const handleImageChange = useCallback(
		(event) => {
			const selectedImages = Array.from(event.target.files || []);
			if (!selectedImages.length) return;

			const validImages = selectedImages.filter((file) =>
				file.type.startsWith("image/"),
			);

			if (validImages.length !== selectedImages.length) {
				notify(
					"product-image-type",
					"error",
					"Please select image files only.",
				);
			}

			const merged = [...images, ...validImages];
			if (merged.length > MAX_IMAGES) {
				notify(
					"product-image-limit",
					"info",
					`You can upload up to ${MAX_IMAGES} images.`,
				);
			}

			setImages(merged.slice(0, MAX_IMAGES));
			event.target.value = "";
		},
		[images],
	);

	const removeImage = useCallback((index) => {
		setImages((current) => current.filter((_, idx) => idx !== index));
	}, []);

	const addTags = useCallback(() => {
		const newTags = tagInput
			.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean);

		if (!newTags.length) {
			notify("product-tag-empty", "warning", "Tags field must be filled.");
			return;
		}

		setTags((current) => {
			const existing = new Set(current.map((item) => item.toLowerCase()));
			const unique = newTags.filter((tag) => {
				const lower = tag.toLowerCase();
				if (existing.has(lower)) return false;
				existing.add(lower);
				return true;
			});
			return [...current, ...unique];
		});
		setTagInput("");
	}, [tagInput]);

	const removeTag = useCallback((tagToRemove) => {
		setTags((current) => current.filter((tag) => tag !== tagToRemove));
	}, []);

	const handleSubmit = useCallback(
		async (event) => {
			event.preventDefault();

			const missingMessage = getRequiredFieldError(
				fields,
				tags.length,
				images.length,
			);
			if (missingMessage) {
				notify("product-required-error", "error", missingMessage);
				return;
			}

			const formData = new FormData();
			formData.append("name", fields.name.trim());
			formData.append("shortDescription", fields.shortDescription.trim());
			formData.append("description", fields.description.trim());
			formData.append("price", String(Number(fields.price)));
			formData.append("discountPrice", String(Number(fields.discountPrice)));
			formData.append("stock", String(Number.parseInt(fields.stock, 10)));
			formData.append("sku", fields.sku.trim());
			formData.append("category", fields.category.trim().toLowerCase());
			formData.append("subcategory", fields.subcategory.trim().toLowerCase());
			formData.append("brand", fields.brand.trim());

			for (const tag of tags) {
				formData.append("tags", tag);
			}

			formData.append("featured", String(Boolean(fields.featured)));
			formData.append("isActive", String(Boolean(fields.isActive)));

			for (const image of images) {
				formData.append("images", image);
			}

			try {
				await createProduct(formData).unwrap();
				notify("product-created", "success", "Product created successfully.");
				setFields(INITIAL_FIELDS);
				setImages([]);
				setTags([]);
				setTagInput("");
				navigate("/dashboard/products");
			} catch (error) {
				notify("product-created", "error", getBackendErrorMessage(error));
			}
		},
		[fields, images, tags, createProduct, navigate],
	);

	const inputClass = `w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition duration-200 ${t.field}`;
	const labelClass = `mb-2 block text-xs font-semibold tracking-wide ${t.label}`;

	if (isLoading) {
		return <AddProductSkeleton />;
	}

	return (
		<main
			className={`relative min-h-screen overflow-hidden rounded-[28px] border p-3 shadow-xl transition-colors duration-300 sm:p-5 lg:p-7 ${t.shell}`}
		>
			<div
				className={`pointer-events-none absolute inset-x-0 top-0 h-78 ${t.glow}`}
			/>

			<div className="relative mx-auto max-w-362">
				<header
					className={`mb-6 flex flex-col justify-between gap-5 rounded-[22px] border p-5 shadow-lg transition-colors duration-200 sm:flex-row sm:items-center sm:p-6 ${t.header}`}
				>
					<div>
						<button
							type="button"
							onClick={() => navigate("/dashboard/products")}
							className={`mb-4 inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition ${t.backBtn}`}
						>
							<ArrowLeft size={24} />
							<span>Back to products</span>
						</button>

						<div>
							<p
								className={`text-[10px] font-semibold uppercase tracking-[0.35em] ${t.accentText}`}
							>
								PRODUCT MANAGEMENT
							</p>

							<h1
								className={`mt-2 flex items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl ${t.title}`}
							>
								<PackagePlus
									size={21}
									className={`shrink-0 ${t.accentText}`}
									aria-hidden="true"
								/>
								Add Product
							</h1>

							<p className={`mt-1 text-xs leading-5 sm:text-sm ${t.muted}`}>
								Add product details, pricing, and images to your store.
							</p>
						</div>
					</div>

					<div
						className={`flex items-center gap-3 rounded-xl border p-4 sm:max-w-xs ${t.readyBox}`}
					>
						<CheckCircle2
							size={22}
							className="shrink-0 text-emerald-500"
							aria-hidden="true"
						/>
						<div>
							<p className="text-sm font-bold">Ready</p>
							<p className={`mt-1 text-xs ${t.readySub}`}>
								Create, validate, and save with one click.
							</p>
						</div>
					</div>
				</header>

				<form
					id="add-product-form"
					noValidate
					onSubmit={handleSubmit}
					className="grid items-start gap-5 xl:grid-cols-[0.9fr_1.1fr]"
				>
					<section
						className={`min-w-0 rounded-[22px] border p-4 transition-colors duration-200 sm:p-6 ${t.panel}`}
					>
						<div className="mb-5 flex flex-col items-start gap-4">
							<div>
								<p
									className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${t.accentText}`}
								>
									PRODUCT MEDIA
								</p>

								<h2
									className={`mt-2 flex items-center gap-2 text-base font-bold ${t.title}`}
								>
									<ImagePlus
										size={20}
										className={`shrink-0 ${t.accentSoftText}`}
										aria-hidden="true"
									/>
									Gallery
								</h2>

								<p className={`mt-1 text-xs ${t.muted}`}>
									Upload multiple images and preview instantly
								</p>
							</div>

							<img
								src="/smartphone.jfif"
								alt="Smartphone product preview"
								className="h-64 w-full rounded-2xl border border-cyan-400/20 bg-[#b9bdc4] p-3 object-contain shadow-lg sm:h-80"
							/>
						</div>

						<input
							id="product-images"
							type="file"
							accept="image/*"
							multiple
							className="sr-only"
							onChange={handleImageChange}
						/>

						<label
							htmlFor="product-images"
							className={`group flex min-h-70 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[20px] border-2 border-dashed p-4 text-center transition duration-300 sm:min-h-85 sm:p-6 ${t.uploadArea}`}
						>
							{imagePreviews.length > 0 ? (
								<div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
									{imagePreviews.map((preview, index) => (
										<div
											key={`${images[index].name}-${images[index].lastModified}`}
											className="group/preview relative aspect-square overflow-hidden rounded-xl border border-[#30445f] bg-[#050a12]"
										>
											<img
												src={preview}
												alt={`Product preview ${index + 1}`}
												className="h-full w-full object-cover transition duration-300 group-hover/preview:scale-105"
											/>

											<span className="absolute bottom-2 left-2 rounded-md bg-slate-950/80 px-2 py-1 text-[10px] font-semibold text-white">
												Image {index + 1}
											</span>
										</div>
									))}

									{images.length < MAX_IMAGES && (
										<div
											className={`grid aspect-square place-items-center rounded-xl border border-dashed transition ${t.addMoreTile}`}
										>
											<div className="text-center">
												<ImagePlus size={24} className="mx-auto" />
												<span className="mt-2 block text-[10px] font-semibold">
													Add more
												</span>
											</div>
										</div>
									)}
								</div>
							) : (
								<>
									<div
										className={`mb-5 grid size-20 place-items-center rounded-3xl border transition duration-300 group-hover:scale-105 ${t.uploadIconBox}`}
									>
										<Upload size={34} strokeWidth={1.5} />
									</div>

									<p className={`text-sm font-bold ${t.title}`}>
										Drag &amp; drop files here
									</p>

									<p className={`mt-2 text-xs ${t.accentSoftText}`}>
										Or click to browse
									</p>

									<p
										className={`mt-5 max-w-xs text-[11px] leading-5 ${t.subtle}`}
									>
										Select clear product photos from your device.
										<br />
										You can upload up to {MAX_IMAGES} images.
									</p>
								</>
							)}
						</label>

						<div className="mt-5 flex items-center justify-between gap-3">
							<p className={`text-xs ${t.muted}`}>
								Selected images:{" "}
								<span className={`font-bold ${t.accentSoftText}`}>
									{images.length}/{MAX_IMAGES}
								</span>
							</p>

							{images.length > 0 && (
								<button
									type="button"
									onClick={() => setImages([])}
									className="cursor-pointer text-xs font-semibold text-rose-400 transition hover:text-rose-300"
								>
									Remove all
								</button>
							)}
						</div>

						<div className="mt-3 grid grid-cols-5 gap-2">
							{THUMBNAIL_SLOTS.map((index) => (
								<div
									key={index}
									className={`group relative aspect-square min-w-0 overflow-hidden rounded-xl border ${t.thumbBox}`}
								>
									{imagePreviews[index] ? (
										<>
											<img
												src={imagePreviews[index]}
												alt={`Thumbnail ${index + 1}`}
												className="h-full w-full object-cover"
											/>

											<button
												type="button"
												aria-label={`Remove image ${index + 1}`}
												onClick={() => removeImage(index)}
												className="absolute right-1 top-1 grid size-6 cursor-pointer place-items-center rounded-md bg-slate-950/80 text-white opacity-100 transition hover:bg-rose-600 sm:opacity-0 sm:group-hover:opacity-100"
											>
												<X size={13} />
											</button>
										</>
									) : (
										<div
											className={`grid h-full place-items-center ${t.subtle}`}
										>
											<ImagePlus size={17} />
										</div>
									)}
								</div>
							))}
						</div>

						<div
							className={`mt-5 flex items-start gap-3 rounded-xl border p-3.5 ${t.tipBox}`}
						>
							<CheckCircle2
								size={17}
								className={`mt-0.5 shrink-0 ${t.accentSoftText}`}
							/>

							<p className={`text-[11px] leading-5 ${t.muted}`}>
								<span className={`font-semibold ${t.accentSoftText}`}>
									Image tip:
								</span>{" "}
								Use clear, well-lit product photos to improve the shopping
								experience.
							</p>
						</div>
					</section>

					<section
						className={`min-w-0 rounded-[22px] border p-4 transition-colors duration-200 sm:p-6 ${t.panel}`}
					>
						<div
							className={`mb-6 flex items-center gap-3 border-b pb-5 ${t.divider}`}
						>
							<div
								className={`grid size-12 shrink-0 place-items-center rounded-xl border ${t.iconBadge}`}
							>
								<PackagePlus size={21} />
							</div>

							<div>
								<p
									className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${t.accentText}`}
								>
									PRODUCT DETAILS
								</p>

								<h2 className={`mt-1 text-base font-bold ${t.title}`}>
									Product Information
								</h2>

								<p className={`mt-1 text-xs ${t.muted}`}>
									Complete all required product details.
								</p>
							</div>
						</div>

						<div className="space-y-5">
							<div>
								<label className={labelClass} htmlFor="product-name">
									Product Name <span className={t.accentText}>*</span>
								</label>

								<input
									id="product-name"
									name="name"
									value={fields.name}
									onChange={(e) => updateField("name", e.target.value)}
									onBlur={() => handleFieldBlur("name", "Product Name")}
									className={inputClass}
									placeholder="Enter product name..."
									minLength={3}
									maxLength={200}
								/>
							</div>

							<div>
								<label className={labelClass} htmlFor="short-description">
									Short Description <span className={t.accentText}>*</span>
								</label>

								<input
									id="short-description"
									name="shortDescription"
									value={fields.shortDescription}
									onChange={(e) =>
										updateField("shortDescription", e.target.value)
									}
									onBlur={() =>
										handleFieldBlur("shortDescription", "Short Description")
									}
									className={inputClass}
									placeholder="A concise summary of the product"
									minLength={10}
									maxLength={500}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<label className={labelClass} htmlFor="price">
										Price <span className={t.accentText}>*</span>
									</label>

									<div className="relative">
										<input
											id="price"
											name="price"
											type="number"
											min="0"
											step="0.01"
											value={fields.price}
											onChange={(e) => updateField("price", e.target.value)}
											onBlur={() => handleFieldBlur("price", "Price")}
											className={`${inputClass} pr-14`}
											placeholder="0.00"
										/>

										<span
											className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold ${t.subtle}`}
										>
											USD
										</span>
									</div>
								</div>

								<div>
									<label className={labelClass} htmlFor="discount-price">
										Discount Price <span className={t.accentText}>*</span>
									</label>

									<div className="relative">
										<input
											id="discount-price"
											name="discountPrice"
											type="number"
											min="0"
											step="0.01"
											value={fields.discountPrice}
											onChange={(e) =>
												updateField("discountPrice", e.target.value)
											}
											onBlur={() =>
												handleFieldBlur("discountPrice", "Discount Price")
											}
											className={`${inputClass} pr-14`}
											placeholder="0.00"
										/>

										<span
											className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold ${t.subtle}`}
										>
											USD
										</span>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<label className={labelClass} htmlFor="stock">
										Stock <span className={t.accentText}>*</span>
									</label>

									<input
										id="stock"
										name="stock"
										type="number"
										min="0"
										step="1"
										value={fields.stock}
										onChange={(e) => updateField("stock", e.target.value)}
										onBlur={() => handleFieldBlur("stock", "Stock")}
										className={inputClass}
										placeholder="Enter quantity"
									/>
								</div>

								<div>
									<label className={labelClass} htmlFor="sku">
										SKU <span className={t.accentText}>*</span>
									</label>

									<input
										id="sku"
										name="sku"
										value={fields.sku}
										onChange={(e) => updateField("sku", e.target.value)}
										onBlur={() => handleFieldBlur("sku", "SKU")}
										className={inputClass}
										placeholder="Product SKU"
									/>
								</div>
							</div>

							<div>
								<label className={labelClass} htmlFor="description">
									Description <span className={t.accentText}>*</span>
								</label>

								<textarea
									id="description"
									name="description"
									value={fields.description}
									onChange={(e) => updateField("description", e.target.value)}
									onBlur={() => handleFieldBlur("description", "Description")}
									className={`${inputClass} min-h-32 resize-y`}
									placeholder="Describe the product, features, and benefits..."
									minLength={20}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<label className={labelClass} htmlFor="category">
										Category <span className={t.accentText}>*</span>
									</label>

									<input
										id="category"
										name="category"
										value={fields.category}
										onChange={(e) => updateField("category", e.target.value)}
										onBlur={() => handleFieldBlur("category", "Category")}
										className={inputClass}
										placeholder="Enter category"
									/>
								</div>

								<div>
									<label className={labelClass} htmlFor="subcategory">
										Subcategory <span className={t.accentText}>*</span>
									</label>

									<input
										id="subcategory"
										name="subcategory"
										value={fields.subcategory}
										onChange={(e) => updateField("subcategory", e.target.value)}
										onBlur={() => handleFieldBlur("subcategory", "Subcategory")}
										className={inputClass}
										placeholder="Enter subcategory"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<label className={labelClass} htmlFor="brand">
										Brand <span className={t.accentText}>*</span>
									</label>

									<input
										id="brand"
										name="brand"
										value={fields.brand}
										onChange={(e) => updateField("brand", e.target.value)}
										onBlur={() => handleFieldBlur("brand", "Brand")}
										className={inputClass}
										placeholder="Enter brand"
									/>
								</div>

								<div>
									<label className={labelClass} htmlFor="tags">
										Tags <span className={t.accentText}>*</span>
									</label>

									<div className="relative">
										<Tag
											size={16}
											className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${t.accentText}`}
										/>

										<input
											id="tags"
											name="tagInput"
											value={tagInput}
											onChange={(event) => setTagInput(event.target.value)}
											onBlur={() => {
												if (tags.length === 0 && !tagInput.trim()) {
													notify(
														"empty-field-tags",
														"warning",
														"Tags field must be filled.",
													);
												}
											}}
											onKeyDown={(event) => {
												if (event.key === "Enter") {
													event.preventDefault();
													addTags();
												}
											}}
											className={`${inputClass} pl-9 pr-12`}
											placeholder="Enter a tag"
										/>
										<button
											type="button"
											onClick={addTags}
											aria-label="Add tag"
											className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg bg-cyan-500 text-white transition hover:bg-cyan-400"
										>
											<Plus size={18} aria-hidden="true" />
										</button>
									</div>
									{tags.length > 0 && (
										<ul className="mt-2 flex flex-wrap gap-2">
											{tags.map((tag) => (
												<li
													key={tag}
													className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${t.tagPill}`}
												>
													{tag}
													<button
														type="button"
														onClick={() => removeTag(tag)}
														aria-label={`Remove ${tag} tag`}
														className="cursor-pointer rounded-full transition hover:text-rose-400"
													>
														<X size={13} aria-hidden="true" />
													</button>
												</li>
											))}
										</ul>
									)}
								</div>
							</div>

							<div
								className={`grid gap-3 rounded-2xl border p-4 sm:grid-cols-2 ${t.optionsBox}`}
							>
								<label
									className={`flex cursor-pointer items-start gap-3 rounded-xl p-2 transition ${t.optionHover}`}
								>
									<input
										type="checkbox"
										name="featured"
										checked={fields.featured}
										onChange={(e) => updateField("featured", e.target.checked)}
										className="mt-0.5 size-4 accent-cyan-400"
									/>

									<span>
										<span
											className={`block text-xs font-semibold ${t.bodyText}`}
										>
											Featured Product
										</span>

										<span
											className={`mt-1 block text-[11px] leading-5 ${t.subtle}`}
										>
											Highlight this product in your store.
										</span>
									</span>
								</label>

								<label
									className={`flex cursor-pointer items-start gap-3 rounded-xl p-2 transition ${t.optionHover}`}
								>
									<input
										type="checkbox"
										name="isActive"
										checked={fields.isActive}
										onChange={(e) => updateField("isActive", e.target.checked)}
										className="mt-0.5 size-4 accent-cyan-400"
									/>

									<span>
										<span
											className={`block text-xs font-semibold ${t.bodyText}`}
										>
											Active in Store
										</span>

										<span
											className={`mt-1 block text-[11px] leading-5 ${t.subtle}`}
										>
											Make this product available to customers.
										</span>
									</span>
								</label>
							</div>
						</div>
					</section>
				</form>

				<div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
					<button
						type="button"
						onClick={() => navigate("/dashboard/products")}
						className={`inline-flex cursor-pointer items-center justify-center rounded-xl border px-6 py-3 text-sm font-semibold transition ${t.cancelBtn}`}
					>
						Cancel
					</button>
					<button
						type="submit"
						form="add-product-form"
						disabled={isLoading}
						className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${t.primaryBtn}`}
					>
						{isLoading ? (
							<>
								<LoaderCircle size={17} className="animate-spin" />
								Publishing...
							</>
						) : (
							<>
								<PackagePlus size={17} />
								Publish Product
							</>
						)}
					</button>
				</div>
			</div>
		</main>
	);
};

export default AddProduct;
