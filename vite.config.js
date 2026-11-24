import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => {
	return {
		plugins: [react(), tailwindcss()],

		server: {
			proxy: {
				"/api": {
					target: "https://e-commerce-api-3wara.vercel.app",
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ""),
				},
			},
			port: 5000,
		},
	};
});
