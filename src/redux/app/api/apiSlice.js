import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

import environment from "../../../config/environment";

const dynamicBaseUrl = "/api";

const baseQuery = fetchBaseQuery({
	baseUrl: dynamicBaseUrl,
	credentials: "include",
	prepareHeaders: (headers) => {
		const token = Cookies.get("token");
		if (token) {
			headers.set("authorization", `Bearer ${token}`);
		}
		return headers;
	},
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
	const result = await baseQuery(args, api, extraOptions);

	if (result.error && result.error.status === 401) {
		Cookies.remove("token");
		window.location.href = "/";
	}

	return result;
};

export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: baseQueryWithReauth,
	endpoints: () => ({}),
});
