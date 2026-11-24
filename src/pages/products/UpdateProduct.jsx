import { AlertCircle, ArrowLeft, Package, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import ProductForm from "../../components/products/ProductForm.jsx";
import ProductSkeleton from "../../components/products/ProductSkeleton.jsx";
import useLoginTheme from "../../components/theme";
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

const extractTagNames = (tags) => {
	if (!Array.isArray(tags)) return [];
	return tags
		.map((tag) => (typeof tag === "string" ? tag : tag?.name))
		.filter(Boolean);
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
		return data.errors
			.map((item) => item?.msg || item?.message || String(item))
			.filter(Boolean)
			.join(" | ");
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

	const tagsList = Array.isArray(form.tags) ? form.tags : [];
	if (tagsList.length === 0) {
		return "At least one Tag is required before updating.";
	}

	if (previewsCount === 0) {
		return "Product must have at least one image before updating.";
	}

	return "";
}

const UpdateProductEditor = ({
	product,
	productId,
	isDarkMode,
	isFetching,
	onBack,
	onNameChange,
}) => {
	const navigate = useNavigate();

	const initialData = useMemo(() => {
		const parsedImages = parseProductImages(product?.images);
		const parsedTags = extractTagNames(product?.tags);
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

	useEffect(() => {
		onNameChange?.(form.name || "Product");
	}, [form.name, onNameChange]);

	const previews = useMemo(
		() => [
			...existingImages.map((image) => ({
				type: "existing",
				id: image.id,
				url: image.url,
			})),
			...newFiles.map((file, index) => ({
				type: "new",
				id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
				index,
				url: newPreviews[index],
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
		const tag = tagInput.trim().replace(/^#/, "");
		if (!tag) {
			toast.error("Please enter a tag name first.");
			return;
		}

		const currentTags = Array.isArray(form.tags) ? form.tags : [];
		const alreadyExists = currentTags.some(
			(item) =>
				typeof item === "string" && item.toLowerCase() === tag.toLowerCase(),
		);

		if (alreadyExists) {
			toast.info("This tag already exists.");
			return;
		}

		setForm((previous) => ({
			...previous,
			tags: [...previous.tags, tag],
		}));

		setTagInput("");
	}, [tagInput, form.tags]);

	const removeTag = useCallback((tagToRemove) => {
		setForm((previous) => ({
			...previous,
			tags: previous.tags.filter((tag) => tag !== tagToRemove),
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

	const handleCancel = useCallback(() => {
		navigate("/dashboard/products");
	}, [navigate]);

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

			const normalizedTags = (Array.isArray(form.tags) ? form.tags : [])
				.map((tag) => (typeof tag === "string" ? tag.trim() : ""))
				.filter(Boolean);
			for (const tag of normalizedTags) {
				formData.append("tags", tag);
			}

			formData.append("featured", String(Boolean(form.isFeatured)));
			formData.append("isActive", String(Boolean(form.isActive)));
			formData.append("deletedImages", JSON.stringify(deletedImages));

			for (const file of newFiles) {
				formData.append("images", file);
			}

			try {
				await updateProduct({ id: productId, body: formData }).unwrap();
				toast.success("Product updated successfully!");
				navigate("/dashboard/products");
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
			navigate,
		],
	);

	return (
		<>
			<section className="relative isolate overflow-hidden rounded-2xl border border-cyan-500/30   px-4 py-5 text-slate-900 shadow-md transition-none    dark:text-white sm:rounded-3xl sm:px-6 sm:py-6 lg:px-8">
				<div className="pointer-events-none absolute -right-20 -top-28 h-52 w-52 rounded-full bg-cyan-400/25 blur-xl dark:bg-cyan-400/15 sm:h-64 sm:w-64" />

				<div className="pointer-events-none absolute -bottom-32 right-8 hidden h-64 w-64 rounded-full border border-cyan-400/20 sm:block lg:right-24 lg:h-80 lg:w-80" />

				<div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
					<div className="flex min-w-0 items-center gap-3 sm:gap-4">
						<div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-cyan-700/15 bg-white/70 dark:border-white/15 dark:bg-white/10 sm:h-14 sm:w-14 sm:rounded-2xl">
							<Package size={25} className="text-cyan-500" />
						</div>

						<div className="min-w-0">
							<p className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-800 dark:text-cyan-300 sm:text-xs">
								<span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
								Commerce / Admin Panel
							</p>

							<h1 className="wrap-break-word text-2xl font-extrabold tracking-tight sm:text-3xl">
								Update Product
							</h1>

							<p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-600 dark:text-slate-300 sm:text-sm">
								Edit product details, pricing, inventory and images.
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={onBack}
						className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition-none hover:border-cyan-600/30 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:bg-slate-800 sm:w-auto"
					>
						<ArrowLeft size={17} />
						Back to products
					</button>
				</div>

				<div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-cyan-800/10 pt-4 dark:border-white/10">
					<span className="inline-flex items-center gap-2 rounded-full border border-cyan-700/15 bg-white/60 px-3 py-1.5 text-[11px] font-semibold text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300">
						<Package size={13} />
						Product management
					</span>

					<span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
						<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
						Edit inventory
					</span>

					{isFetching && (
						<span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-500">
							<RefreshCw size={12} className="animate-spin" />
							Refreshing product...
						</span>
					)}
				</div>
			</section>

			<ProductForm
				form={form}
				setForm={setForm}
				isDarkMode={isDarkMode}
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				previews={previews}
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
				title="Product Information"
				description="Update the product details and availability."
				gridClassName="grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]"
				className="grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]"
			/>
		</>
	);
};

const UpdateProduct = () => {
	const isDarkMode = useLoginTheme();
	const { id } = useParams();
	const navigate = useNavigate();

	const [editingLabel, setEditingLabel] = useState("Product");

	const {
		data: response,
		isLoading,
		isFetching,
		isError,
		error,
		refetch,
	} = useGetSingleProductQuery(id, { skip: !id });

	const product = useMemo(() => getProductFromResponse(response), [response]);

	const handleBackToProducts = useCallback(() => {
		navigate("/dashboard/products");
	}, [navigate]);

	if (isLoading || isFetching) {
		return (
			<main className="min-h-screen   p-3 text-slate-900 transition-none   dark:text-slate-100 sm:p-5 lg:p-6">
				<div className="mx-auto max-w-360">
					<ProductSkeleton isDarkMode={isDarkMode} />
				</div>
			</main>
		);
	}

	const loadedProductId = product
		? String(product._id || product.id || "")
		: "";

	if (isError || !product || !loadedProductId) {
		return (
			<main className="min-h-screen   text-slate-900   dark:text-slate-100 sm:p-6">
				<div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700/70 dark:bg-[#111a2a]">
					<div className="grid h-14 w-14 place-items-center rounded-2xl border border-rose-500/20 bg-rose-500/10">
						<AlertCircle className="h-7 w-7 text-rose-500" />
					</div>

					<h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
						Unable to load product
					</h2>

					<p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
						{getErrorMessage(error)}
					</p>

					<div className="mt-5 flex flex-wrap justify-center gap-3">
						<button
							type="button"
							onClick={refetch}
							className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#086477] px-4 py-2.5 text-sm font-bold text-white shadow-cyan-900/10 transition-none hover:bg-[#075363] dark:bg-cyan-400 dark:text-slate-950 dark:shadow-cyan-950/20 dark:hover:bg-cyan-300"
						>
							<RefreshCw size={15} />
							Try Again
						</button>

						<button
							type="button"
							onClick={handleBackToProducts}
							className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-none hover:border-cyan-600/30 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:bg-slate-800"
						>
							Back to products
						</button>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen  p-3 text-slate-900 transition-none   dark:text-slate-100 sm:p-5 lg:p-6">
			<div className="mx-auto max-w-360 space-y-5 sm:space-y-6">
				<UpdateProductEditor
					key={loadedProductId}
					product={product}
					productId={id || loadedProductId}
					isDarkMode={isDarkMode}
					isFetching={isFetching}
					onBack={handleBackToProducts}
					onNameChange={setEditingLabel}
				/>

				<footer className="flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-xs text-slate-500 dark:text-slate-400">
						Product management dashboard
					</p>
					<p className="text-xs text-slate-500 dark:text-slate-400">
						Editing: {editingLabel}
					</p>
				</footer>
			</div>
		</main>
	);
};

export default UpdateProduct;
