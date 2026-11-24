import { apiSlice } from "../../app/api/apiSlice";

export const productsApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getAllProducts: builder.query({
			query: (params) => ({
				url: "products",
				params: { ...params },
			}),
			providesTags: ["Product"],
		}),

		createProduct: builder.mutation({
			query: (productData) => ({
				url: "products",
				method: "POST",
				body: productData,
			}),
			invalidatesTags: ["Product"],
		}),

		searchProducts: builder.query({
			query: (params) => ({
				url: "products/search",
				method: "GET",
				params: { ...params },
			}),
			providesTags: ["Product"],
		}),

		getSingleProduct: builder.query({
			query: (id) => ({
				url: `products/${id}`,
				method: "GET",
			}),
			providesTags: (result, error, id) => [{ type: "Product", id }],
		}),

		updateProduct: builder.mutation({
			query: ({ id, body, ...patchData }) => ({
				url: `products/update/${id}`,
				method: "PATCH",
				body: body ?? patchData,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: "Product", id },
				"Product",
			],
		}),
		deleteProduct: builder.mutation({
			query: (id) => ({
				url: `products/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Product"],
		}),

		getProductReviews: builder.query({
			query: (productId) => ({
				url: `products/${productId}/reviews`,
			}),
			providesTags: (result, error, productId) => [
				{ type: "Review", id: productId },
				"Review",
			],
		}),

		addProductReview: builder.mutation({
			query: ({ productId, ...reviewData }) => ({
				url: `products/${productId}/reviews`,
				method: "POST",
				body: reviewData,
			}),
			invalidatesTags: (result, error, { productId }) => [
				{ type: "Review", id: productId },
				"Review",
				{ type: "Product", id: productId },
			],
		}),

		deleteProductReview: builder.mutation({
			query: ({ productId, reviewId }) => ({
				url: `products/${productId}/reviews/${reviewId}`,
				method: "DELETE",
			}),
			invalidatesTags: (result, error, { productId }) => [
				{ type: "Review", id: productId },
				"Review",
				{ type: "Product", id: productId },
			],
		}),
	}),
});

export const {
	useGetAllProductsQuery,
	useCreateProductMutation,
	useSearchProductsQuery,
	useLazySearchProductsQuery,
	useGetSingleProductQuery,
	useUpdateProductMutation,
	useDeleteProductMutation,
	useGetProductReviewsQuery,
	useAddProductReviewMutation,
	useDeleteProductReviewMutation,
} = productsApiSlice;
