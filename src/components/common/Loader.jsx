import Cookies from "js-cookie";
import { memo, useEffect, useState } from "react";
import "@lottiefiles/lottie-player";

const Loader = () => {
	const [isDarkMode, setIsDarkMode] = useState(() => {
		return Cookies.get("login-theme") !== "light";
	});

	useEffect(() => {
		const checkTheme = () => {
			const theme = Cookies.get("login-theme");
			setIsDarkMode(theme ? theme === "dark" : true);
		};
		checkTheme();
		const interval = setInterval(checkTheme, 200);
		return () => clearInterval(interval);
	}, []);

	return (
		<div
			className={`fixed inset-0 z-99999 flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
				isDarkMode ? "bg-black/20" : "bg-slate-900/10"
			}`}
		>
			<div
				className={`relative p-10 rounded-full w-72 h-72 flex flex-col items-center justify-center gap-3 border shadow-2xl animate-[slideUp_0.5s_cubic-bezier(0.16,1,0.3,1)] ${
					isDarkMode
						? "bg-neutral-900/90 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-white backdrop-blur-md"
						: "bg-white/95 border-slate-300 shadow-[0_0_50px_rgba(100,116,139,0.3)] text-slate-800 backdrop-blur-md"
				}`}
			>
				<div
					className={`absolute inset-0 rounded-full pointer-events-none bg-linear-to-br animate-pulse ${
						isDarkMode
							? "from-cyan-500/20 via-transparent to-neutral-700/20"
							: "from-cyan-400/20 via-transparent to-slate-400/20"
					}`}
				/>

				<div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40 animate-[spin_10s_linear_infinite]" />

				<div className="relative z-10 -mb-2">
					<lottie-player
						src="https://lottie.host/21cf2ecd-c891-457e-ab24-2c0eaee7be01/3g1XViM1C0.json"
						background="transparent"
						speed="1"
						style={{ width: "130px", height: "130px" }}
						loop
						autoplay
					/>
				</div>

				<div className="relative z-10 flex flex-col items-center gap-1.5">
					<span
						className={`text-[11px] font-bold tracking-[0.25em] uppercase ${
							isDarkMode ? "text-cyan-400" : "text-slate-700"
						}`}
					>
						Veyora Store
					</span>

					<div className="flex items-center gap-1.5">
						<span
							className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] ${isDarkMode ? "bg-cyan-300" : "bg-slate-600"}`}
						/>
						<span
							className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] ${isDarkMode ? "bg-cyan-400" : "bg-slate-500"}`}
						/>
						<span
							className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? "bg-cyan-500" : "bg-slate-400"}`}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default memo(Loader);
