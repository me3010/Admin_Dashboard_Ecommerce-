import { apiSlice } from "../../app/api/apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getAllUsers: builder.query({
			query: () => ({
				url: "users/all",
			}),
			providesTags: ["User"],
		}),

		addUser: builder.mutation({
			query: (userData) => ({
				url: "users/add",
				method: "POST",
				body: { ...userData },
			}),
			invalidatesTags: ["User"],
		}),

		getSingleUser: builder.query({
			query: (id) => ({
				url: `users/${id}`,
			}),
			providesTags: (result, error, id) => [{ type: "User", id }],
		}),

		updateUser: builder.mutation({
			query: ({ id, ...patchData }) => ({
				url: `users/${id}`,
				method: "PATCH",
				body: { ...patchData },
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: "User", id },
				"User",
			],
		}),

		deleteUser: builder.mutation({
			query: (id) => ({
				url: `users/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["User"],
		}),
	}),
});

export const {
	useGetAllUsersQuery,
	useAddUserMutation,
	useGetSingleUserQuery,
	useUpdateUserMutation,
	useDeleteUserMutation,
} = usersApiSlice;
