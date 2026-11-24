import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { Moon, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const profileSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters"),
	email: z.string().email("Invalid email address"),
	role: z.string().min(2, "Role is required"),
});

const inputCls =
	"w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

const primaryBtn =
	"rounded-xl bg-brand px-5 py-2.5 font-semibold text-white transition hover:opacity-90 dark:text-app";

function Card({ title, children }) {
	return (
		<section className="rounded-2xl border border-line bg-surface p-6 shadow-card">
			<h2 className="mb-5 text-lg font-bold text-ink">{title}</h2>
			{children}
		</section>
	);
}

function Field({ label, error, children }) {
	return (
		<div className="mb-4 block">
			<span className="mb-1.5 block text-sm font-medium text-ink-2">
				{label}
			</span>
			{children}
			{error && (
				<span className="mt-1 block text-sm text-red-500">{error}</span>
			)}
		</div>
	);
}

export default function Setting() {
	const [theme, setTheme] = useState(Cookies.get("login-theme") || "dark");
	const [avatar, setAvatar] = useState(Cookies.get("adminAvatar") || "");

	const saved = Cookies.get("adminProfile");
	const defaults = saved
		? JSON.parse(saved)
		: { name: "Admin", email: "admin@example.com", role: "Admin" };

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(profileSchema),
		defaultValues: defaults,
	});

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		Cookies.set("login-theme", theme, { expires: 365 });
	}, [theme]);

	const onSave = (data) => {
		Cookies.set("adminProfile", JSON.stringify(data), { expires: 365 });
		toast.success("Saved successfully");
	};

	const onAvatar = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			setAvatar(reader.result);
			try {
				Cookies.set("adminAvatar", reader.result, { expires: 365 });
			} catch (error) {
				console.error("Failed to save avatar:", error);
				toast.error("Failed to save avatar");
			}
		};
		reader.readAsDataURL(file);
	};

	return (
		<div className="mx-auto max-w-3xl space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-extrabold text-ink">Settings</h1>
				<p className="text-sm text-ink-3">Manage your personal information</p>
			</div>

			<Card title="Personal Information">
				<div className="mb-6 flex items-center gap-4">
					{avatar ? (
						<img
							src={avatar}
							alt="avatar"
							className="h-20 w-20 rounded-full border border-line object-cover"
						/>
					) : (
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
							<User size={36} />
						</div>
					)}
					<input
						type="file"
						accept="image/*"
						onChange={onAvatar}
						className="block text-sm text-ink-2 file:mr-3 file:rounded-lg file:border-0 file:bg-surface-3 file:px-3 file:py-1.5 file:text-ink"
					/>
				</div>

				<form onSubmit={handleSubmit(onSave)}>
					<Field label="Full name" error={errors.name?.message}>
						<input className={inputCls} {...register("name")} />
					</Field>
					<Field label="Email" error={errors.email?.message}>
						<input type="email" className={inputCls} {...register("email")} />
					</Field>
					<Field label="Role" error={errors.role?.message}>
						<input className={inputCls} {...register("role")} />
					</Field>
					<button type="submit" className={primaryBtn}>
						Save changes
					</button>
				</form>
			</Card>

			<Card title="Appearance">
				<span className="mb-2 block text-sm font-medium text-ink-2">Theme</span>
				<div className="flex gap-3">
					{[
						{ key: "light", label: "Light", Icon: Sun },
						{ key: "dark", label: "Dark", Icon: Moon },
					].map(({ key, label, Icon }) => (
						<button
							key={key}
							type="button"
							onClick={() => setTheme(key)}
							className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 font-medium transition ${
								theme === key
									? "border-brand bg-brand-soft text-brand-ink"
									: "border-line bg-surface-2 text-ink-2 hover:bg-surface-3"
							}`}
						>
							<Icon size={18} /> {label}
						</button>
					))}
				</div>
			</Card>
		</div>
	);
}
