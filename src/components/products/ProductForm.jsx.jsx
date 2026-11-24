import {
	AlertCircle,
	ImagePlus,
	Plus,
	RefreshCw,
	Save,
	Star,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import { memo, useCallback, useMemo } from "react";

const CATEGORIES = [
	"electronics",
	"fashion",
	"home",
	"beauty",
	"sports",
	"accessories",
	"other",
];

const INPUT_CLASS =
	"w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/10 dark:border-slate-700/80 dark:bg-[#080d18] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/15";

const LABEL_CLASS =
	"mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300";

const CHECKBOX_CARD_CLASS =
	"flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-[#080d18]";

const SECTION_CLASS =
	"rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/70 dark:bg-[#111a2a] sm:p-6";

const PRIMARY_BUTTON_CLASS =
	"bg-[#086477] text-white hover:bg-[#075363] dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300";

const SECONDARY_BUTTON_CLASS =
	"border-slate-200 bg-white text-slate-600 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800";

const ProductForm = memo(function ProductForm({
	form,
	setForm,
	isDarkMode = true,
	onSubmit,
	onCancel,
	previews = [],
	fileInputRef,
	handleImageChange,
	removeImage,
	onAddImages,
	maxImages = 5,
	tagInput = "",
	setTagInput,
	addTag,
	handleTagKeyDown,
	removeTag,
	busy = false,
	uploading = false,
	isUpdating = false,
	submitLabel = "Save Product",
	title = "Product Information",
	description = "Update the product details and availability.",
}) {
	void isDarkMode;

	const tags = useMemo(
		() => (Array.isArray(form?.tags) ? form.tags : []),
		[form?.tags],
	);

	const isMaxReached = previews.length >= maxImages;

	const handleChange = useCallback(
		(event) => {
			const { name, value } = event.target;
			setForm((previous) => ({
				...previous,
				[name]: value,
			}));
		},
		[setForm],
	);

	const handleCheckboxChange = useCallback(
		(event) => {
			const { name, checked } = event.target;
			setForm((previous) => ({
				...previous,
				[name]: checked,
			}));
		},
		[setForm],
	);

	const handleTagInputChange = useCallback(
		(event) => {
			setTagInput?.(event.target.value);
		},
		[setTagInput],
	);

	const renderSubmitContent = () => {
		if (uploading) {
			return (
				<>
					<Upload size={16} className="animate-pulse" />
					Uploading images...
				</>
			);
		}

		if (isUpdating) {
			return (
				<>
					<RefreshCw size={16} className="animate-spin" />
					Saving...
				</>
			);
		}

		return (
			<>
				<Save size={16} />
				{submitLabel}
			</>
		);
	};

	return (
		<form onSubmit={onSubmit} className="space-y-5">
			<div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
				<section className={`${SECTION_CLASS} order-1`}>
					<div className="mb-5 flex items-center justify-between gap-3">
						<div>
							<h2 className="font-bold text-slate-900 dark:text-white">
								Product Gallery
							</h2>

							<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
								Add, preview, or remove product images.
							</p>
						</div>

						<span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-500">
							{previews.length}/{maxImages}
						</span>
					</div>

					{previews.length > 0 ? (
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							{previews.map((img, index) => (
								<div
									key={img.id}
									className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-[#080d18]"
								>
									<div className="relative aspect-4/3 overflow-hidden rounded-lg bg-slate-900">
										<img
											src={img.url}
											alt={`Product ${index + 1}`}
											className="h-full w-full object-cover"
										/>

										<button
											type="button"
											onClick={() => removeImage(img)}
											disabled={busy}
											aria-label={`Remove image ${index + 1}`}
											className="absolute right-2 top-2 cursor-pointer rounded-lg bg-rose-500 p-2 text-white hover:bg-rose-600 disabled:opacity-50"
										>
											<Trash2 size={14} />
										</button>

										<div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-black/80 to-transparent px-3 pb-3 pt-8">
											<span className="text-xs text-white">
												Image {index + 1}
											</span>

											{img.type === "new" && (
												<span className="rounded bg-emerald-500 px-2 py-1 text-[9px] font-bold text-white">
													NEW
												</span>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center dark:border-slate-700 dark:bg-[#080d18]">
							<ImagePlus size={32} className="text-cyan-500" />

							<p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
								No product images
							</p>

							<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
								Upload at least one image before saving.
							</p>
						</div>
					)}

					<input
						ref={fileInputRef}
						type="file"
						accept="image/jpeg,image/png,image/webp"
						multiple
						onChange={handleImageChange}
						className="hidden"
					/>

					<button
						type="button"
						onClick={onAddImages}
						disabled={isMaxReached || busy}
						className="mt-4 flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-700/30 bg-cyan-50 px-4 py-6 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-cyan-400/30 dark:bg-cyan-400/5 dark:text-cyan-300 dark:hover:bg-cyan-400/10"
					>
						<ImagePlus size={22} />
						<span>Add images</span>
						<span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
							PNG, JPG, WEBP · Maximum 5 MB per image
						</span>
					</button>

					<div className="mt-4 flex items-start gap-2 rounded-xl border p-3 text-xs text-slate-500 dark:text-slate-400">
						<AlertCircle size={15} className="mt-0.5 shrink-0 text-cyan-500" />
						<span>Existing images are retained unless you remove them.</span>
					</div>
				</section>

				<section className={`${SECTION_CLASS} order-2`}>
					<div className="mb-5 border-b border-slate-500/15 pb-4">
						<h2 className="font-bold text-slate-900 dark:text-white">
							{title}
						</h2>

						<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
							{description}
						</p>
					</div>

					<div className="space-y-4">
						<div>
							<label htmlFor="name" className={LABEL_CLASS}>
								Product Name
							</label>

							<input
								id="name"
								name="name"
								value={form.name ?? ""}
								onChange={handleChange}
								required
								placeholder="Enter product name"
								className={INPUT_CLASS}
							/>
						</div>

						<div>
							<label htmlFor="shortDescription" className={LABEL_CLASS}>
								Short Description
							</label>

							<input
								id="shortDescription"
								name="shortDescription"
								value={form.shortDescription ?? ""}
								onChange={handleChange}
								placeholder="A short summary of the product"
								className={INPUT_CLASS}
							/>
						</div>

						<div>
							<label htmlFor="description" className={LABEL_CLASS}>
								Description
							</label>

							<textarea
								id="description"
								name="description"
								value={form.description ?? ""}
								onChange={handleChange}
								rows={4}
								placeholder="Describe your product..."
								className={`${INPUT_CLASS} resize-y`}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label htmlFor="price" className={LABEL_CLASS}>
									Price
								</label>

								<input
									id="price"
									name="price"
									type="number"
									min="0"
									step="0.01"
									value={form.price ?? ""}
									onChange={handleChange}
									required
									placeholder="0.00"
									className={INPUT_CLASS}
								/>
							</div>

							<div>
								<label htmlFor="discountPrice" className={LABEL_CLASS}>
									Discount Price
								</label>

								<input
									id="discountPrice"
									name="discountPrice"
									type="number"
									min="0"
									step="0.01"
									value={form.discountPrice ?? ""}
									onChange={handleChange}
									placeholder="0.00"
									className={INPUT_CLASS}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label htmlFor="stock" className={LABEL_CLASS}>
									Stock
								</label>

								<input
									id="stock"
									name="stock"
									type="number"
									min="0"
									step="1"
									value={form.stock ?? ""}
									onChange={handleChange}
									required
									placeholder="0"
									className={INPUT_CLASS}
								/>
							</div>

							<div>
								<label htmlFor="sku" className={LABEL_CLASS}>
									SKU
								</label>

								<input
									id="sku"
									name="sku"
									value={form.sku ?? ""}
									onChange={handleChange}
									placeholder="Product SKU"
									className={INPUT_CLASS}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label htmlFor="category" className={LABEL_CLASS}>
									Category
								</label>

								<select
									id="category"
									name="category"
									value={form.category ?? "electronics"}
									onChange={handleChange}
									className={INPUT_CLASS}
								>
									{CATEGORIES.map((category) => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</select>
							</div>

							<div>
								<label htmlFor="subcategory" className={LABEL_CLASS}>
									Subcategory
								</label>

								<input
									id="subcategory"
									name="subcategory"
									value={form.subcategory ?? ""}
									onChange={handleChange}
									placeholder="Subcategory"
									className={INPUT_CLASS}
								/>
							</div>
						</div>

						<div>
							<label htmlFor="brand" className={LABEL_CLASS}>
								Brand
							</label>

							<input
								id="brand"
								name="brand"
								value={form.brand ?? ""}
								onChange={handleChange}
								placeholder="Brand name"
								className={INPUT_CLASS}
							/>
						</div>

						<div>
							<label htmlFor="tagInput" className={LABEL_CLASS}>
								Tags
							</label>

							<div className="flex gap-2">
								<input
									id="tagInput"
									value={tagInput}
									onChange={handleTagInputChange}
									onKeyDown={handleTagKeyDown}
									placeholder="Type a tag and press +"
									className={INPUT_CLASS}
								/>

								<button
									type="button"
									onClick={addTag}
									disabled={busy}
									className={`cursor-pointer rounded-xl px-4 disabled:opacity-50 ${PRIMARY_BUTTON_CLASS}`}
									aria-label="Add tag"
								>
									<Plus size={17} />
								</button>
							</div>

							<div className="mt-3 flex flex-wrap gap-2">
								{tags.map((tag, index, list) => {
									const occurrence = list
										.slice(0, index)
										.filter((item) => item === tag).length;
									return (
										<span
											key={`${tag}-${occurrence}`}
											className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-500"
										>
											{tag}

											<button
												type="button"
												onClick={() => removeTag(tag)}
												aria-label={`Remove tag ${tag}`}
												className="cursor-pointer"
											>
												<X size={13} />
											</button>
										</span>
									);
								})}
							</div>
						</div>

						<div className="grid grid-cols-1 gap-3 border-t border-slate-500/15 pt-4 sm:grid-cols-2">
							<label className={CHECKBOX_CARD_CLASS}>
								<input
									type="checkbox"
									name="isFeatured"
									checked={Boolean(form.isFeatured)}
									onChange={handleCheckboxChange}
									className="h-4 w-4 accent-cyan-500"
								/>

								<Star size={17} className="text-amber-400" />

								<span className="text-sm text-slate-900 dark:text-white">
									Featured product
								</span>
							</label>

							<label className={CHECKBOX_CARD_CLASS}>
								<input
									type="checkbox"
									name="isActive"
									checked={Boolean(form.isActive)}
									onChange={handleCheckboxChange}
									className="h-4 w-4 accent-cyan-500"
								/>

								<span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

								<span className="text-sm text-slate-900 dark:text-white">
									Active product
								</span>
							</label>
						</div>

						<div className="flex gap-3 border-t border-slate-500/15 pt-4">
							<button
								type="submit"
								disabled={busy}
								className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${PRIMARY_BUTTON_CLASS}`}
							>
								{renderSubmitContent()}
							</button>

							<button
								type="button"
								onClick={onCancel}
								disabled={busy}
								className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-50 ${SECONDARY_BUTTON_CLASS}`}
							>
								Cancel
							</button>
						</div>
					</div>
				</section>
			</div>
		</form>
	);
});

export default ProductForm;
