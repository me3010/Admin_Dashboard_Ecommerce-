import { Suspense, lazy } from "react";
import {
	Navigate,
	Route,
	RouterProvider,
	createBrowserRouter,
	createRoutesFromElements,
} from "react-router-dom";

import Cookies from "js-cookie";
import { ToastContainer } from "react-toastify";
import Loader from "./components/common/Loader";
import ErrorPage from "./pages/error/ErrorPage";
import RootLayout from "./routes/RootLayout";

const EditProduct = lazy(() => import("./pages/products/UpdateProduct"));
const Login = lazy(() => import("./pages/auth/Login"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const AddProduct = lazy(() => import("./pages/addProduct/AddProduct"));
const Cart = lazy(() => import("./pages/carts/Cart"));
const Orders = lazy(() => import("./pages/orders/Order"));
const Users = lazy(() => import("./pages/users/Users"));
const Wishlists = lazy(() => import("./pages/wishlists/wishlists"));
const Products = lazy(() => import("./pages/products/Products"));
const ProductDetails = lazy(() => import("./pages/products/ProductDetails"));
const Setting = lazy(() => import("./pages/setting/Setting"));

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" errorElement={<ErrorPage />}>
			<Route
				index
				element={
					Cookies.get("token") ? (
						<Navigate to="/dashboard" replace />
					) : (
						<Login />
					)
				}
			/>

			<Route
				path="auth/login"
				element={
					Cookies.get("token") ? (
						<Navigate to="/dashboard" replace />
					) : (
						<Login />
					)
				}
			/>

			<Route path="/gogo" element={<RootLayout />} />

			<Route path="/dashboard" element={<RootLayout />}>
				<Route index element={<Dashboard />} />
				<Route path="products" element={<Products />} />
				<Route path="products/view/:id" element={<ProductDetails />} />
				<Route path="products/edit/:id" element={<EditProduct />} />
				<Route path="add_products" element={<AddProduct />} />
				<Route path="orders" element={<Orders />} />
				<Route path="users" element={<Users />} />
				<Route path="carts" element={<Cart />} />
				<Route path="settings" element={<Setting />} />
				<Route path="wishlists" element={<Wishlists />} />
			</Route>

			<Route path="*" element={<Navigate to="/" replace />} />
		</Route>,
	),
);

export default function App() {
	const currentTheme = Cookies.get("login-theme") || "dark";

	return (
		<Suspense fallback={<Loader />}>
			<RouterProvider router={router} />
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={true}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme={currentTheme === "dark" ? "dark" : "light"}
			/>
		</Suspense>
	);
}
