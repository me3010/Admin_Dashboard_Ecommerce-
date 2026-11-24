import { apiSlice } from "../../app/api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		login: builder.mutation({
			query: (credentials) => ({
				url: "auth/login",
				method: "POST",
				body: { ...credentials },
			}),
		}),

		logout: builder.mutation({
			query: () => ({
				url: "auth/logout",
				method: "POST",
			}),
		}),

		me: builder.query({
			query: () => ({
				url: "auth/me",
				method: "GET",
			}),
		}),

		adminTest: builder.query({
			query: () => ({
				url: "auth/admin-test",
				method: "GET",
			}),
		}),

		changeRole: builder.mutation({
			query: (credentials) => ({
				url: "auth/change-role",
				method: "PATCH",
				body: { ...credentials },
			}),
		}),
	}),
});

export const {
	useLoginMutation,
	useLogoutMutation,
	useMeQuery,
	useLazyMeQuery,
	useAdminTestQuery,
	useChangeRoleMutation,
} = authApiSlice;
