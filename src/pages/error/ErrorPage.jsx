import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
	const error = useRouteError();

	return (
		<div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white">
			<h1 className="text-4xl font-bold">Oops! Something went wrong.</h1>
			<p className="mt-2 text-slate-400">
				{error?.statusText || error?.message || "An unexpected error occurred."}
			</p>
			<button
				type="button"
				onClick={() => {
					window.location.href = "/";
				}}
				className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 transition-all"
			>
				Back to Safety
			</button>
		</div>
	);
}
