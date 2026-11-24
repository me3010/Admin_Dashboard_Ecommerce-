import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function useLoginTheme() {
	const [isDarkMode, setIsDarkMode] = useState(
		() => Cookies.get("login-theme") === "dark",
	);

	useEffect(() => {
		const syncTheme = () => {
			setIsDarkMode(Cookies.get("login-theme") === "dark");
		};

		syncTheme();

		const intervalId = setInterval(syncTheme, 500);

		return () => clearInterval(intervalId);
	}, []);

	return isDarkMode;
}
