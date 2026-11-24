import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import {
	ArrowRight,
	CheckCircle2,
	Eye,
	EyeOff,
	Lock,
	Mail,
	ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import Loader from "../../components/common/Loader";
import { useLoginMutation } from "../../redux/features/auth/authApiSlice";
import "@lottiefiles/lottie-player";

const loginSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

export default function Login() {
	const navigate = useNavigate();
	const [login, { isLoading: isLoginLoading }] = useLoginMutation();
	const [showPassword, setShowPassword] = useState(false);

	const [pageLoading, setPageLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setPageLoading(false);
		}, 700);
		return () => clearTimeout(timer);
	}, []);

	const [theme] = useState(() => Cookies.get("login-theme") || "dark");

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		Cookies.set("login-theme", theme, { expires: 365 });
	}, [theme]);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (formData) => {
		try {
			const result = await login({
				email: formData.email.trim(),
				password: formData.password,
			}).unwrap();

			const user = result?.user;
			const token = result?.token;

			if (user && user.role !== "admin") {
				toast.error("Access denied. Admin account required.");
				return;
			}

			if (token) {
				Cookies.set("token", token, { expires: 7 });
				Cookies.set("name", user.username);
				Cookies.set("role", user.role);
			}

			toast.success("Welcome back!");
			navigate("/dashboard", { replace: true });
		} catch (error) {
			toast.error(
				error?.data?.message ||
					error?.message ||
					"Unable to login. Please try again.",
			);
		}
	};

	return (
		<div
			className={`relative min-h-screen w-full flex items-center justify-center p-4 lg:p-6 overflow-hidden ${theme === "dark" ? "bg-neutral-950 text-white" : "bg-slate-100 text-slate-800"}`}
		>
			{pageLoading && <Loader />}

			<div
				className="absolute inset-0 bg-cover bg-center z-0 transition-opacity duration-500"
				style={{ backgroundImage: `url('/img1.jpg')` }}
			/>

			<div
				className={`absolute inset-0 z-0 transition-colors duration-300 ${theme === "dark" ? "bg-black/70 backdrop-blur-sm" : "bg-black/40 backdrop-blur-[2px]"}`}
			/>

			<motion.main
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, ease: "easeOut" }}
				className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-cyan-300 bg-white/10 dark:bg-black/30 backdrop-blur-2xl shadow-sm shadow-amber-50"
			>
				<section className="p-8 lg:p-12 hidden lg:flex lg:flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 text-white">
					<div className="space-y-6">
						<div className="flex items-center gap-3">
							<div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
								<ShieldCheck
									size={28}
									strokeWidth={1.8}
									className="text-cyan-300"
								/>
							</div>
							<h2 className="text-xl font-bold tracking-wide">Veyora Store</h2>
						</div>

						<span className="inline-block text-xs font-semibold tracking-widest text-cyan-300 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/30">
							ADMINISTRATION
						</span>

						<h1 className="text-3xl lg:text-4xl font-extrabold leading-tight">
							Manage Your Store <br />
							<span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-blue-400">
								Like a Pro
							</span>
						</h1>

						<p className="text-sm lg:text-base text-gray-200/90 leading-relaxed">
							Your Veyora Store Admin Dashboard is ready. Manage your users,
							products, and orders effortlessly.
						</p>
					</div>

					<div className="space-y-3 my-6 z-10">
						<div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-sm font-medium">
							<CheckCircle2 size={18} className="text-cyan-300 shrink-0" />
							<span>Product Management</span>
						</div>
						<div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-sm font-medium">
							<CheckCircle2 size={18} className="text-cyan-300 shrink-0" />
							<span>Order Tracking</span>
						</div>
						<div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-sm font-medium">
							<CheckCircle2 size={18} className="text-cyan-300 shrink-0" />
							<span>Customer Insights</span>
						</div>
					</div>
				</section>

				<section className="p-8 lg:p-12 flex flex-col justify-center bg-white/5 dark:bg-black/20 backdrop-blur-md">
					<div className="mb-6 text-center">
						<div className="w-16 h-16 rounded-full mx-auto overflow-hidden shadow-md border-2 border-cyan-500 flex items-center justify-center">
							<img
								src="https://i.pinimg.com/736x/4c/94/0d/4c940d51cc08a9007d20b690aaeafbb9.jpg"
								alt="Veyora Store Logo"
								className="w-full h-full object-cover"
							/>
						</div>
						<h2 className="text-2xl font-bold text-cyan-300 mt-1">Sign In</h2>
						<p className="text-xs text-gray-300 mt-1">
							Enter your credentials to access your dashboard.
						</p>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-4"
						noValidate
					>
						<div className="space-y-1">
							<label
								htmlFor="login-email"
								className="text-xs font-medium text-gray-200"
							>
								Email address
							</label>
							<div
								className={`relative flex items-center rounded-xl bg-white/10 border ${errors.email ? "border-red-400" : "border-white/20"} focus-within:border-cyan-400 transition-all`}
							>
								<Mail size={18} className="absolute left-3.5 text-gray-400" />
								<input
									id="login-email"
									type="email"
									placeholder="admin@example.com"
									autoComplete="email"
									{...register("email")}
									className="w-full bg-transparent py-3 pl-11 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none [--autofill-text:#ffffff] rounded-xl"
								/>
							</div>
							{errors.email && (
								<span className="text-xs text-red-300">
									{errors.email.message}
								</span>
							)}
						</div>

						<div className="space-y-1">
							<label
								htmlFor="login-password"
								className="text-xs font-medium text-gray-200"
							>
								Password
							</label>
							<div
								className={`relative flex items-center rounded-xl bg-white/10 border ${errors.password ? "border-red-400" : "border-white/20"} focus-within:border-cyan-400 transition-all`}
							>
								<Lock size={18} className="absolute left-3.5 text-gray-400" />
								<input
									id="login-password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									autoComplete="current-password"
									{...register("password")}
									className="w-full bg-transparent py-3 pl-11 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none [--autofill-text:#ffffff] rounded-xl"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute right-3 text-gray-300 hover:text-white transition-colors cursor-pointer"
								>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
							{errors.password && (
								<span className="text-xs text-red-300">
									{errors.password.message}
								</span>
							)}
						</div>

						<button
							type="submit"
							disabled={isLoginLoading}
							className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 text-white font-semibold text-sm shadow-lg hover:from-blue-500 hover:to-cyan-500 focus:ring-2 focus:ring-cyan-400 transition-all disabled:opacity-50 cursor-pointer"
						>
							<span>{isLoginLoading ? "Signing in..." : "Sign In"}</span>
							{!isLoginLoading && <ArrowRight size={18} />}
						</button>
					</form>

					<div className="relative flex py-4 items-center">
						<div className="grow border-t border-cyan-300" />
						<span className="shrink mx-4 text-xs text-white uppercase tracking-wider">
							OR
						</span>
						<div className="grow border-t border-cyan-300" />
					</div>

					<button
						type="button"
						onClick={() => {
							toast.info("Google sign-in coming soon!");
							window.location.href =
								"https://e-commerce-api-3wara.vercel.app/auth/google";
						}}
						className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-cyan-300 transition-all shadow-sm cursor-pointer"
					>
						<svg className="w-4 h-4" viewBox="0 0 24 24">
							<title>Google</title>
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
							/>
						</svg>
						<span>Continue with Google</span>
					</button>

					<div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-300 pt-4 border-t border-white/10">
						<ShieldCheck size={16} className="text-cyan-300" />
						<span>Authorized personnel only</span>
					</div>
				</section>
			</motion.main>
		</div>
	);
}
