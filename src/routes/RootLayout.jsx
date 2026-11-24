import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

const RootLayout = () => {
	const { pathname } = useLocation();
	const [menuState, setMenuState] = useState({
		pathname,
		open: false,
	});

	const menuOpen = menuState.pathname === pathname && menuState.open;

	const closeMenu = () => {
		setMenuState({ pathname, open: false });
	};

	const openMenu = () => {
		setMenuState({ pathname, open: true });
	};

	useEffect(() => {
		document.body.style.overflow = menuOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [menuOpen]);

	return (
		<div className="min-h-screen bg-app text-ink">
			<Sidebar open={menuOpen} onClose={closeMenu} />

			<div className="flex min-h-screen min-w-0 flex-col lg:pl-[17rem]">
				<Navbar onMenu={openMenu} />
				<main className="min-w-0 flex-1 px-3 pb-8 pt-4 sm:px-4 lg:pl-0 lg:pr-5">
					<AnimatePresence mode="wait">
						<motion.div
							key={pathname}
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.22, ease: "easeOut" }}
						>
							<Outlet />
						</motion.div>
					</AnimatePresence>
				</main>
			</div>
		</div>
	);
};

export default RootLayout;
