const environment = {
	baseUrl:
		import.meta.env.VITE_BASE_URL || "https://e-commerce-api-3wara.vercel.app",
	isProduction: import.meta.env.PROD,
	isDevelopment: import.meta.env.DEV,
};

export default Object.freeze(environment);
