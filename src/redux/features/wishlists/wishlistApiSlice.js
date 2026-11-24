import { apiSlice } from "../../app/api/apiSlice";

export const wishlistApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getAllWishlists: builder.query({
			query: (params) => ({
				url: "wishlists/admin/all",
				method: "GET",
				params: { ...params },
			}),
			providesTags: ["Wishlist"],
		}),

		getWishlistStats: builder.query({
			query: () => ({
				url: "wishlists/admin/stats",
			}),
			providesTags: ["WishlistStats"],
		}),
	}),
});

export const { useGetAllWishlistsQuery, useGetWishlistStatsQuery } =
	wishlistApiSlice;
