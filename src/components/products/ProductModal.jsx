import { AlertCircle, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

import useLoginTheme from "../theme";
import ProductForm from "./ProductForm.jsx";
import ProductSkeleton from "./ProductSkeleton.jsx";

import {
	useGetSingleProductQuery,
	useUpdateProductMutation,
} from "../../redux/features/products/productsApiSlice";

const MAX_IMAGES = 5;

const getProductFromResponse = (response) =>
	response?.product ?? response?.data?.product ?? response?.data ?? response;

const getImageUrl = (image) => {
	if (typeof image === "string") return image;
	return image?.url ?? image?.secure_url ?? image?.imageUrl ?? "";
};

const parseProductImages = (images) => {
	if (!Array.isArray(images)) return [];
	return images
		.map((image, index) => {
			const url = getImageUrl(image);
			return {
				id: `${index}-${url}`,
				url,
				public_id: image?.public_id ?? image?.publicId ?? "",
			};
		})
		.filter((image) => image.url);
};

const sanitizeTagValue = (rawTag) => {
	if (typeof rawTag !== "string") return "";
	return rawTag.trim().replace(/^#+/, "").trim();
};

const normalizeTagsList = (tags) => {
	let source = [];

	if (Array.isArray(tags)) {
		source = tags;
	} else if (typeof tags === "string") {
		const trimmed = tags.trim();
		if (trimmed.startsWith("[")) {
			try {
				const parsed = JSON.parse(trimmed);
				source = Array.isArray(parsed) ? parsed : trimmed.split(",");
			} catch {
				source = trimmed.split(",");
			}
		} else {
			source = trimmed.split(",");
		}
	}

	const result = [];
	const seen = new Set();

	for (const item of source) {
		const rawName = typeof item === "string" ? item : item?.name;
		const cleanTag = sanitizeTagValue(rawName);
		if (!cleanTag) continue;

		const key = cleanTag.toLowerCase();
		if (seen.has(key)) continue;

		seen.add(key);
		result.push(cleanTag);
	}

	return result;
};

const buildFormFromProduct = (product, parsedImages, parsedTags) => ({
	name: product?.name ?? "",
	shortDescription: product?.shortDescription ?? "",
	description: product?.description ?? "",
	price: product?.price ?? "",
	discountPrice: product?.discountPrice ?? "",
	stock: product?.stock ?? "",
	sku: product?.sku ?? "",
	category:
		typeof product?.category === "object"
			? product.category?.name || ""
			: (product?.category ?? ""),
	subcategory: product?.subcategory ?? "",
	brand: product?.brand ?? "",
	tags: parsedTags,
	isFeatured: Boolean(product?.featured ?? product?.isFeatured),
	isActive: product?.isActive ?? true,
	images: parsedImages.map((image) => image.url),
});

const getErrorMessage = (error) => {
	const data = error?.data;

	if (Array.isArray(data?.errors) && data.errors.length > 0) {
		const details = data.errors
			.map((item) => item?.message ?? item?.msg ?? item?.path ?? "")
			.filter(Boolean)
			.join(" | ");
		if (details) return details;
	}

	if (typeof data?.message === "string" && data.message) {
		return data.message;
	}

	if (typeof data?.error === "string" && data.error) {
		return data.error;
	}

	if (typeof error?.error === "string" && error.error) {
		return error.error;
	}

	if (typeof error?.message === "string" && error.message) {
		return error.message;
	}

	return "Something went wrong. Please try again.";
};

function validateProductForm(form, previewsCount) {
	if (!form.name.trim()) {
		return "Product Name is required before updating.";
	}

	if (form.name.trim().length < 3) {
		return "Product Name must be at least 3 characters.";
	}

	if (!form.shortDescription.trim()) {
		return "Short Description is required before updating.";
	}

	if (form.shortDescription.trim().length < 10) {
		return "Short Description must be at least 10 characters.";
	}

	if (
		String(form.price).trim() === "" ||
		!Number.isFinite(Number(form.price)) ||
		Number(form.price) < 0
	) {
		return "Price is required before updating.";
	}

	if (
		String(form.discountPrice).trim() === "" ||
		!Number.isFinite(Number(form.discountPrice)) ||
		Number(form.discountPrice) < 0
	) {
		return "Discount Price is required before updating.";
	}

	if (Number(form.discountPrice) > Number(form.price)) {
		return "Discount price cannot exceed the original price.";
	}

	if (
		String(form.stock).trim() === "" ||
		!Number.isInteger(Number(form.stock)) ||
		Number(form.stock) < 0
	) {
		return "Stock is required before updating.";
	}

	if (!form.sku.trim()) {
		return "SKU is required before updating.";
	}

	if (!form.description.trim()) {
		return "Description is required before updating.";
	}

	if (form.description.trim().length < 20) {
		return "Description must be at least 20 characters.";
	}

	if (!form.category.trim()) {
		return "Category is required before updating.";
	}

	if (!form.subcategory.trim()) {
		return "Subcategory is required before updating.";
	}

	if (!form.brand.trim()) {
		return "Brand is required before updating.";
	}

	const tagsList = normalizeTagsList(form.tags);
	if (tagsList.length === 0) {
		return "At least one Tag is required before updating.";
	}

	if (previewsCount === 0) {
		return "Product must have at least one image before updating.";
	}

	return "";
}

function buildUpdatePayload(form, deletedImages, newFiles) {
	const cleanTags = normalizeTagsList(form.tags);
	const formData = new FormData();

	formData.append("name", form.name.trim());
	formData.append("shortDescription", form.shortDescription.trim());
	formData.append("description", form.description.trim());
	formData.append("price", String(Number(form.price)));
	formData.append("discountPrice", String(Number(form.discountPrice)));
	formData.append("stock", String(Number.parseInt(form.stock, 10)));
	formData.append("sku", form.sku.trim());
	formData.append("category", form.category.trim().toLowerCase());
	formData.append("subcategory", form.subcategory.trim().toLowerCase());
	formData.append("brand", form.brand.trim());

	for (const tag of cleanTags) {
		formData.append("tags", tag);
	}

	formData.append("featured", String(Boolean(form.isFeatured)));
	formData.append("isActive", String(Boolean(form.isActive)));
	formData.append("deletedImages", JSON.stringify(deletedImages));

	for (const file of newFiles) {
		formData.append("images", file);
	}

	return formData;
}

const ProductEditorForm = ({
	product,
	productId,
	isDarkMode,
	onClose,
	onUpdated,
	onBusyChange,
}) => {
	const initialData = useMemo(() => {
		const parsedImages = parseProductImages(product?.images);
		const parsedTags = normalizeTagsList(product?.tags);
		return {
			parsedImages,
			formValues: buildFormFromProduct(product, parsedImages, parsedTags),
		};
	}, [product]);

	const fileInputRef = useRef(null);

	const [form, setForm] = useState(initialData.formValues);
	const [existingImages, setExistingImages] = useState(
		initialData.parsedImages,
	);
	const [newFiles, setNewFiles] = useState([]);
	const [deletedImages, setDeletedImages] = useState([]);
	const [tagInput, setTagInput] = useState("");

	const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

	useEffect(() => {
		onBusyChange?.(isUpdating);
	}, [isUpdating, onBusyChange]);

	const newPreviews = useMemo(
		() => newFiles.map((file) => URL.createObjectURL(file)),
		[newFiles],
	);

	useEffect(() => {
		return () => {
			for (const url of newPreviews) {
				URL.revokeObjectURL(url);
			}
		};
	}, [newPreviews]);

	const previews = useMemo(
		() => [
			...existingImages.map((image, index) => ({
				type: "existing",
				id: image.id,
				url: image.url,
				label: `Image ${index + 1}`,
			})),
			...newFiles.map((file, index) => ({
				type: "new",
				id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
				index,
				url: newPreviews[index],
				label: `Image ${existingImages.length + index + 1}`,
			})),
		],
		[existingImages, newFiles, newPreviews],
	);

	const handleImageChange = useCallback(
		(event) => {
			const selected = Array.from(event.target.files || []);
			if (!selected.length) return;

			const validFiles = selected.filter((file) =>
				file.type.startsWith("image/"),
			);

			if (validFiles.length !== selected.length) {
				toast.error("Please select image files only.");
			}

			const remainingSlots = Math.max(0, MAX_IMAGES - existingImages.length);
			const merged = [...newFiles, ...validFiles];

			if (merged.length > remainingSlots) {
				toast.info(`You can upload up to ${MAX_IMAGES} images.`);
			}

			setNewFiles(merged.slice(0, remainingSlots));
			event.target.value = "";
		},
		[existingImages.length, newFiles],
	);

	const removeImage = useCallback((imageToRemove) => {
		if (imageToRemove.type === "existing") {
			setExistingImages((prev) => {
				const target = prev.find((item) => item.id === imageToRemove.id);
				if (target?.public_id) {
					setDeletedImages((delPrev) =>
						delPrev.includes(target.public_id)
							? delPrev
							: [...delPrev, target.public_id],
					);
				}
				return prev.filter((item) => item.id !== imageToRemove.id);
			});
			return;
		}

		setNewFiles((prev) => prev.filter((_, idx) => idx !== imageToRemove.index));
	}, []);

	const addTag = useCallback(() => {
		const cleanTag = sanitizeTagValue(tagInput);
		if (!cleanTag) {
			toast.error("Please enter a tag name first.");
			return;
		}

		const currentTags = normalizeTagsList(form.tags);
		const alreadyExists = currentTags.some(
			(item) => item.toLowerCase() === cleanTag.toLowerCase(),
		);

		if (alreadyExists) {
			toast.info("This tag already exists.");
			return;
		}

		setForm((previous) => ({
			...previous,
			tags: [...normalizeTagsList(previous.tags), cleanTag],
		}));

		setTagInput("");
	}, [tagInput, form.tags]);

	const removeTag = useCallback((tagToRemove) => {
		setForm((previous) => ({
			...previous,
			tags: normalizeTagsList(previous.tags).filter(
				(tag) => tag !== tagToRemove,
			),
		}));
	}, []);

	const handleTagKeyDown = useCallback(
		(event) => {
			if (event.key === "Enter") {
				event.preventDefault();
				addTag();
			}
		},
		[addTag],
	);

	const handleOpenFiles = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleSubmit = useCallback(
		async (event) => {
			event.preventDefault();
			if (isUpdating) return;

			if (!productId) {
				toast.error("Product ID is missing.");
				return;
			}

			const validationError = validateProductForm(form, previews.length);
			if (validationError) {
				toast.error(validationError);
				return;
			}

			const body = buildUpdatePayload(form, deletedImages, newFiles);

			try {
				await updateProduct({
					id: productId,
					body,
				}).unwrap();

				toast.success("Product updated successfully!");
				onUpdated?.();
				onClose?.();
			} catch (err) {
				toast.error(getErrorMessage(err));
			}
		},
		[
			isUpdating,
			productId,
			form,
			previews.length,
			deletedImages,
			newFiles,
			updateProduct,
			onUpdated,
			onClose,
		],
	);

	return (
		<ProductForm
			form={form}
			setForm={setForm}
			isDarkMode={isDarkMode}
			onSubmit={handleSubmit}
			onCancel={onClose}
			previews={previews}
			allImages={previews}
			showAllImages
			fileInputRef={fileInputRef}
			handleImageChange={handleImageChange}
			removeImage={removeImage}
			onAddImages={handleOpenFiles}
			maxImages={MAX_IMAGES}
			tagInput={tagInput}
			setTagInput={setTagInput}
			addTag={addTag}
			handleTagKeyDown={handleTagKeyDown}
			removeTag={removeTag}
			busy={isUpdating}
			uploading={false}
			isUpdating={isUpdating}
			submitLabel="Save Product"
			title="Product Gallery"
			description="Upload and manage product images."
		/>
	);
};

const ProductModal = ({ productId, isOpen, onClose, onUpdated }) => {
	const isDarkMode = useLoginTheme();
	const [busy, setBusy] = useState(false);

	const {
		data: response,
		isLoading,
		isFetching,
		isError,
		error,
		refetch,
	} = useGetSingleProductQuery(productId, {
		skip: !isOpen || !productId,
	});

	const product = useMemo(() => getProductFromResponse(response), [response]);

	useEffect(() => {
		if (!isOpen) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const handleEscape = (event) => {
			if (event.key === "Escape" && !busy) {
				onClose?.();
			}
		};

		window.addEventListener("keydown", handleEscape);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, busy, onClose]);

	const handleBackdropMouseDown = useCallback(
		(event) => {
			if (event.target === event.currentTarget && !busy) {
				onClose?.();
			}
		},
		[busy, onClose],
	);

	if (!isOpen) return null;

	const showLoading = isLoading || isFetching;
	const loadedId = product ? String(product._id || product.id || "") : "";
	const isMatchingProduct =
		Boolean(product) &&
		typeof product === "object" &&
		Boolean(loadedId) &&
		loadedId === String(productId);
	const showError = !showLoading && (isError || !isMatchingProduct);

	return (
		<div
			className="fixed inset-0 z-9999 flex items-center justify-center overflow-y-auto bg-slate-950/75 p-2 backdrop-blur-md sm:p-4"
			onMouseDown={handleBackdropMouseDown}
		>
			<dialog
				open
				aria-modal="true"
				aria-labelledby="product-modal-title"
				className="relative z-10000 m-0 flex max-h-[96dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl shadow-black/40 dark:border-slate-700/70 dark:bg-[#101a2d] dark:text-slate-100 sm:max-h-[92dvh] sm:rounded-3xl"
			>
				<header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700/70 sm:px-5">
					<div className="flex min-w-0 items-center gap-2.5">
						<span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />

						<h2
							id="product-modal-title"
							className="truncate text-sm font-bold sm:text-base"
						>
							Edit Product
						</h2>
					</div>

					<button
						type="button"
						onClick={onClose}
						disabled={busy}
						aria-label="Close modal"
						className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:border-cyan-400/50 dark:hover:text-cyan-300"
					>
						<X size={16} />
					</button>
				</header>

				<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5">
					{showLoading ? (
						<div className="p-4">
							<ProductSkeleton isDarkMode={isDarkMode} />
						</div>
					) : showError ? (
						<div className="flex min-h-78 flex-col items-center justify-center text-center">
							<div className="grid h-14 w-14 place-items-center rounded-2xl border border-rose-500/20 bg-rose-500/10">
								<AlertCircle size={27} className="text-rose-500" />
							</div>

							<h3 className="mt-4 text-lg font-bold">Unable to load product</h3>

							<p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
								{getErrorMessage(error)}
							</p>

							<button
								type="button"
								onClick={refetch}
								className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
							>
								<RefreshCw size={15} />
								Try Again
							</button>
						</div>
					) : (
						<ProductEditorForm
							key={loadedId}
							product={product}
							productId={productId}
							isDarkMode={isDarkMode}
							onClose={onClose}
							onUpdated={onUpdated}
							onBusyChange={setBusy}
						/>
					)}
				</div>
			</dialog>
		</div>
	);
};

export default ProductModal;
