import { apiSlice } from "../../app/api/apiSlice";

export const adminCartApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		applyCoupon: builder.mutation({
			query: (couponData) => ({
				url: "carts/coupon",
				method: "POST",
				body: couponData,
			}),
			invalidatesTags: ["Cart"],
		}),

		removeCoupon: builder.mutation({
			query: () => ({
				url: "carts/coupon",
				method: "DELETE",
			}),
			invalidatesTags: ["Cart"],
		}),
	}),
});

export const { useApplyCouponMutation, useRemoveCouponMutation } =
	adminCartApiSlice;
