import Cookies from "js-cookie";
import { Bell, LogOut, Menu, Moon, Sun } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import useIsDark, { applyTheme } from "../../hooks/useIsDark";
import { useLogoutMutation } from "../../redux/features/auth/authApiSlice";

const iconBtn =
	"relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-surface-2 text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand cursor-pointer";

const Navbar = ({ onMenu }) => {
	const navigate = useNavigate();
	const [logoutApi] = useLogoutMutation();
	const isDark = useIsDark();

	const name = Cookies.get("name") || "Admin";
	const role = Cookies.get("role") || "Administrator";

	const handleLogout = async () => {
		try {
			await logoutApi().unwrap();
		} catch (err) {
			console.error(err);
		} finally {
			Cookies.remove("token");
			Cookies.remove("name");
			Cookies.remove("role");
			navigate("/auth/login", { replace: true });
			window.location.reload();
		}
	};

	return (
		<header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 lg:pl-0 lg:pr-5 lg:pt-5">
			<div className="flex h-16 items-center justify-between gap-3 rounded-2xl border border-line bg-surface/85 px-3 shadow-card backdrop-blur-xl sm:h-18 sm:px-5">
				<div className="flex min-w-0 items-center gap-3">
					<button
						type="button"
						onClick={onMenu}
						aria-label="Open menu"
						className={`${iconBtn} lg:hidden`}
					>
						<Menu size={18} />
					</button>

					<div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-brand">
						<img
							src="https://i.pinimg.com/736x/4c/94/0d/4c940d51cc08a9007d20b690aaeafbb9.jpg"
							alt="Veyora Store logo"
							className="h-full w-full object-cover"
						/>
					</div>
					<div className="hidden min-w-0 sm:block">
						<h1 className="truncate text-sm font-extrabold text-ink">
							Veyora Dashboard
						</h1>
						<p className="truncate text-[11px] font-semibold text-brand-ink">
							E-Commerce Admin Panel
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 sm:gap-3">
					<button type="button" aria-label="Notifications" className={iconBtn}>
						<Bell size={18} />
						<span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand ring-2 ring-surface" />
					</button>

					<button
						type="button"
						onClick={() => applyTheme(!isDark)}
						aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
						className={iconBtn}
					>
						{isDark ? (
							<Sun size={18} className="text-amber-400" />
						) : (
							<Moon size={18} />
						)}
					</button>

					<div className="flex items-center gap-2.5 border-l border-line pl-2.5 sm:pl-4">
						<div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-slate-700 to-cyan-700 text-sm font-bold text-white">
							{name.charAt(0).toUpperCase()}
						</div>
						<div className="hidden min-w-0 text-left md:block">
							<span className="block max-w-32 truncate text-xs font-bold leading-tight text-ink">
								{name}
							</span>
							<span className="block max-w-32 truncate text-[11px] font-medium text-ink-3">
								{role}
							</span>
						</div>
					</div>

					<button
						type="button"
						onClick={handleLogout}
						aria-label="Logout"
						className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-cyan-400/40 bg-linear-to-r from-slate-800 to-cyan-800 px-3 text-xs font-semibold text-white shadow-sm transition hover:from-slate-700 hover:to-cyan-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand cursor-pointer sm:px-4"
					>
						<LogOut size={16} />
						<span className="hidden sm:inline">Logout</span>
					</button>
				</div>
			</div>
		</header>
	);
};

export default React.memo(Navbar);
