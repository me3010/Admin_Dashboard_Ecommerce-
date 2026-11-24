import { apiSlice } from "../../app/api/apiSlice";

export const ordersApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getAdminDashboardStats: builder.query({
			query: () => ({
				url: "orders/admin/dashboard",
			}),
			providesTags: ["OrderStats"],
		}),

		getAdminAllCarts: builder.query({
			query: (params) => ({
				url: "orders/admin/carts",
				params: { ...params },
			}),
			providesTags: ["AdminCart"],
		}),

		getAllAdminOrders: builder.query({
			query: (params) => ({
				url: "orders/admin",
				params: { ...params },
			}),
			providesTags: ["Order"],
		}),

		getSingleAdminOrder: builder.query({
			query: (id) => ({
				url: `orders/admin/${id}`,
			}),
			providesTags: (result, error, id) => [{ type: "Order", id }],
		}),

		updateOrderStatus: builder.mutation({
			query: ({ id, ...statusData }) => ({
				url: `orders/admin/${id}/status`,
				method: "PATCH",
				body: statusData,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: "Order", id },
				"Order",
				"OrderStats",
			],
		}),
	}),
});

export const {
	useGetAdminDashboardStatsQuery,
	useGetAdminAllCartsQuery,
	useGetAllAdminOrdersQuery,
	useGetSingleAdminOrderQuery,
	useUpdateOrderStatusMutation,
} = ordersApiSlice;
