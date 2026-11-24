import Cookies from "js-cookie";
import { useEffect, useState } from "react";

const readTheme = () =>
	typeof document !== "undefined" &&
	document.documentElement.classList.contains("dark");

export function applyTheme(dark) {
	document.documentElement.classList.toggle("dark", dark);
	Cookies.set("login-theme", dark ? "dark" : "light", { expires: 365 });
}

export default function useIsDark() {
	const [isDark, setIsDark] = useState(readTheme);

	useEffect(() => {
		const observer = new MutationObserver(() => setIsDark(readTheme()));
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => observer.disconnect();
	}, []);

	return isDark;
}
