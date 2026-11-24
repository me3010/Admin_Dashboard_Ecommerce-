import {
	Check,
	Pencil,
	Phone,
	RotateCcw,
	Search,
	Shield,
	ShieldCheck,
	Trash2,
	UserCheck,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import useIsDark from "../../hooks/useIsDark";
import {
	useAddUserMutation,
	useDeleteUserMutation,
	useGetAllUsersQuery,
	useUpdateUserMutation,
} from "../../redux/features/users/usersApiSlice";

const EMPTY_FORM = {
	username: "",
	email: "",
	password: "",
	phone: "",
	role: "customer",
};

const EMPTY_EDIT_FORM = {
	username: "",
	phone: "",
	avatar: "",
};

const ROLE_STYLES = {
	admin: "bg-purple-100 text-purple-700",
	moderator: "bg-amber-100 text-amber-700",
	customer: "bg-cyan-100 text-cyan-700",
	user: "bg-cyan-100 text-cyan-700",
};

function normalizeRole(role) {
	const value = String(role || "customer").toLowerCase();
	if (value === "user") return "customer";
	return value;
}

function getTheme(isDark) {
	return {
		card: isDark
			? "rounded-2xl border border-gray-700 bg-gray-800 text-white shadow-sm"
			: "rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm",
		headerCard: isDark
			? "border-gray-700 bg-gray-800 text-white"
			: "border-slate-200 bg-white text-slate-900",
		input: isDark
			? "w-full min-w-0 rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-sm text-white placeholder-gray-400 outline-none transition focus:border-cyan-400 focus:bg-gray-800"
			: "w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100",
		searchBox: isDark
			? "flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-600 bg-gray-700 px-3 text-white"
			: "flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-800",
		formHeader: isDark
			? "flex items-center justify-between gap-3 border-b border-gray-700 bg-gray-700/60 p-4 sm:p-5"
			: "flex items-center justify-between gap-3 border-b border-cyan-100 bg-cyan-50 p-4 sm:p-5",
		avatar: isDark
			? "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-700 text-gray-300"
			: "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-500",
		thead: isDark
			? "bg-gray-700/50 text-sm text-gray-300"
			: "bg-slate-100 text-sm text-slate-600",
		tbody: isDark ? "divide-y divide-gray-700" : "divide-y divide-slate-100",
		rowHover: isDark
			? "transition hover:bg-gray-700/40"
			: "transition hover:bg-slate-50",
		modal: isDark
			? "fixed left-1/2 top-1/2 z-10 m-0 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-700 bg-gray-800 text-white shadow-2xl"
			: "fixed left-1/2 top-1/2 z-10 m-0 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white text-slate-800 shadow-2xl",
		ghostBtn: isDark
			? "border border-gray-600 text-gray-200 hover:bg-gray-700"
			: "border border-slate-200 text-slate-700 hover:bg-slate-50",
		closeBtn: isDark
			? "text-gray-300 hover:bg-gray-700"
			: "text-slate-500 hover:bg-slate-100",
		option: isDark ? "bg-gray-800" : "bg-white",
		titleText: isDark ? "text-white" : "text-slate-900",
		bodyText: isDark ? "text-white" : "text-slate-800",
		subText: isDark ? "text-gray-300" : "text-slate-500",
		mutedText: isDark ? "text-gray-400" : "text-slate-500",
		verifiedText: isDark ? "text-emerald-400" : "text-emerald-700",
		unverifiedText: isDark ? "text-gray-400" : "text-slate-500",
		dividerBorder: isDark ? "border-gray-700" : "border-slate-100",
		skeletonBox: isDark ? "bg-gray-700" : "bg-slate-200",
		skeletonCard: isDark
			? "rounded-2xl border border-gray-700 bg-gray-800"
			: "rounded-2xl border border-slate-200 bg-white",
	};
}

function UsersSkeleton({ t }) {
	return (
		<div className="animate-pulse space-y-6">
			<div className={`${t.skeletonCard} p-6`}>
				<div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
					<div className="space-y-2">
						<div className={`h-3 w-24 rounded ${t.skeletonBox}`} />
						<div className={`h-8 w-48 rounded ${t.skeletonBox}`} />
					</div>
					<div className={`h-11 w-full rounded-xl lg:w-96 ${t.skeletonBox}`} />
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
				{[0, 1, 2, 3].map((item) => (
					<div key={item} className={`${t.skeletonCard} p-5`}>
						<div className="flex items-center justify-between">
							<div className="space-y-2">
								<div className={`h-3 w-16 rounded ${t.skeletonBox}`} />
								<div className={`h-7 w-10 rounded ${t.skeletonBox}`} />
							</div>
							<div className={`h-10 w-10 rounded-xl ${t.skeletonBox}`} />
						</div>
					</div>
				))}
			</div>

			<div className={`${t.skeletonCard} p-5`}>
				<div className="space-y-4">
					{[0, 1, 2, 3, 4].map((row) => (
						<div
							key={row}
							className="flex items-center justify-between border-b border-gray-700/50 py-3 last:border-none"
						>
							<div className="flex items-center gap-3">
								<div className={`h-12 w-12 rounded-full ${t.skeletonBox}`} />
								<div className="space-y-2">
									<div className={`h-4 w-32 rounded ${t.skeletonBox}`} />
									<div className={`h-3 w-48 rounded ${t.skeletonBox}`} />
								</div>
							</div>
							<div className={`h-6 w-20 rounded-full ${t.skeletonBox}`} />
							<div className={`h-6 w-16 rounded ${t.skeletonBox}`} />
							<div className="flex gap-2">
								<div className={`h-9 w-9 rounded-xl ${t.skeletonBox}`} />
								<div className={`h-9 w-9 rounded-xl ${t.skeletonBox}`} />
								<div className={`h-9 w-9 rounded-xl ${t.skeletonBox}`} />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function UserAvatar({ user, t }) {
	const avatarSrc = user.avatar && user.avatar !== "string" ? user.avatar : "";
	return (
		<div className={t.avatar}>
			{avatarSrc ? (
				<img
					src={avatarSrc}
					alt={user.username}
					className="h-full w-full object-cover"
				/>
			) : (
				<Users size={23} />
			)}
		</div>
	);
}

function RoleBadge({ role }) {
	const normalized = normalizeRole(role);
	return (
		<span
			className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
				ROLE_STYLES[normalized] || ROLE_STYLES.customer
			}`}
		>
			{normalized}
		</span>
	);
}

function StatusBadge({ verified, t }) {
	return verified ? (
		<span
			className={`inline-flex items-center gap-1 text-sm ${t.verifiedText}`}
		>
			<Check size={16} />
			Verified
		</span>
	) : (
		<span
			className={`inline-flex items-center gap-1 text-sm ${t.unverifiedText}`}
		>
			<X size={17} className="text-red-600" />
			No
		</span>
	);
}

function StatCard({ title, count, Icon, t }) {
	return (
		<div
			className={`${t.card} group min-w-0 p-4 transition-all duration-300 ease-out hover:-translate-y-2 hover:border-cyan-300 hover:shadow-xl active:scale-[0.98] sm:p-5`}
		>
			<div className="flex items-center justify-between gap-2">
				<div className="min-w-0">
					<p className={`text-xs sm:text-sm ${t.mutedText}`}>{title}</p>
					<p className={`mt-2 text-2xl font-bold sm:text-3xl ${t.titleText}`}>
						{count}
					</p>
				</div>
				<div className="shrink-0 rounded-xl bg-cyan-500 p-2.5 text-white transition-transform duration-300 group-hover:rotate-6 sm:p-3">
					<Icon size={23} />
				</div>
			</div>
		</div>
	);
}

function UserActions({ user, disabled, onEdit, onToggleRole, onDelete }) {
	return (
		<div className="flex items-center justify-end gap-2">
			<button
				type="button"
				disabled={disabled}
				onClick={() => onEdit(user)}
				title="Edit user"
				aria-label={`Edit ${user.username}`}
				className="cursor-pointer rounded-xl bg-blue-500 p-2.5 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
			>
				<Pencil size={17} />
			</button>

			<button
				type="button"
				disabled={disabled}
				onClick={() => onToggleRole(user)}
				title="Force toggle role between Admin and Customer"
				aria-label={`Toggle role for ${user.username}`}
				className="cursor-pointer rounded-xl bg-emerald-500 p-2.5 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
			>
				<ShieldCheck size={17} />
			</button>

			<button
				type="button"
				disabled={disabled}
				onClick={() => onDelete(user)}
				title="Delete user"
				aria-label={`Delete ${user.username}`}
				className="cursor-pointer rounded-xl bg-red-500 p-2.5 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
			>
				<Trash2 size={17} />
			</button>
		</div>
	);
}

function notifyAction(id, type, text) {
	toast.dismiss(id);
	toast[type](text, { toastId: id });
}

function getApiErrorMessage(error, fallback) {
	return error?.data?.message || error?.error || fallback;
}

export default function UsersPage() {
	const isDark = useIsDark();
	const t = useMemo(() => getTheme(isDark), [isDark]);

	const { data, isLoading, isError, error, refetch } = useGetAllUsersQuery();
	const [addUser, { isLoading: isAdding }] = useAddUserMutation();
	const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
	const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

	const [search, setSearch] = useState("");
	const [roleOverrides, setRoleOverrides] = useState({});
	const [showForm, setShowForm] = useState(false);
	const [form, setForm] = useState(EMPTY_FORM);

	const [showEditModal, setShowEditModal] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [userToDelete, setUserToDelete] = useState(null);

	const [message, setMessage] = useState("");
	const [editMessage, setEditMessage] = useState("");

	const users = useMemo(() => {
		const list = Array.isArray(data?.users) ? data.users : [];
		return list.map((item) => {
			const id = item._id || item.id;
			const effectiveRole = roleOverrides[id] ?? item.role;
			return {
				id,
				username: item.username || "",
				email: item.email || "",
				phone: item.phone || "",
				avatar: item.avatar || "",
				role: normalizeRole(effectiveRole),
				verified: Boolean(item.isVerified ?? item.verified),
			};
		});
	}, [data, roleOverrides]);

	const filteredUsers = useMemo(() => {
		const value = search.trim().toLowerCase();
		if (!value) return users;
		return users.filter((user) =>
			[user.username, user.email, user.role].some((field) =>
				String(field).toLowerCase().includes(value),
			),
		);
	}, [users, search]);

	const stats = useMemo(() => {
		let admins = 0;
		let customers = 0;
		let verified = 0;

		for (const user of users) {
			if (user.role === "admin") admins += 1;
			else customers += 1;
			if (user.verified) verified += 1;
		}

		return {
			total: Number(data?.count ?? users.length),
			admins,
			customers,
			verified,
		};
	}, [users, data?.count]);

	const isMutating = isAdding || isUpdating || isDeleting;

	function openAddForm() {
		setForm(EMPTY_FORM);
		setMessage("");
		setShowForm(true);
	}

	function closeAddForm() {
		setShowForm(false);
		setForm(EMPTY_FORM);
		setMessage("");
	}

	function handleClearForm() {
		setForm(EMPTY_FORM);
		setMessage("");
		notifyAction("user-form-toast", "info", "Form fields cleared");
	}

	function openEditForm(user) {
		setEditingId(user.id);
		setEditForm({
			username: user.username,
			phone: user.phone || "",
			avatar: user.avatar && user.avatar !== "string" ? user.avatar : "",
		});
		setEditMessage("");
		setShowEditModal(true);
	}

	function closeEditModal() {
		setShowEditModal(false);
		setEditingId(null);
		setEditMessage("");
	}

	async function handleAddSubmit(e) {
		e.preventDefault();

		const username = form.username.trim();
		const email = form.email.trim();
		const password = form.password.trim();

		const missingFields = [];
		if (!username) missingFields.push("username");
		if (!email) missingFields.push("email");
		if (!password) missingFields.push("password");

		if (missingFields.length > 0) {
			const requiredMsg = `Please fill in the required fields: ${missingFields.join(", ")}.`;
			setMessage(requiredMsg);
			notifyAction("user-validation-toast", "error", requiredMsg);
			return;
		}

		if (password.length < 6) {
			const passMsg = "Password must contain at least 6 characters.";
			setMessage(passMsg);
			notifyAction("user-validation-toast", "error", passMsg);
			return;
		}

		try {
			const payload = {
				username,
				email,
				password,
				phone: form.phone.trim(),
				role: form.role,
			};
			await addUser(payload).unwrap();
			notifyAction("user-action-toast", "success", `Added user "${username}"`);
			closeAddForm();
		} catch (err) {
			const msg = getApiErrorMessage(err, "Failed to add user.");
			setMessage(msg);
			notifyAction("user-action-toast", "error", msg);
		}
	}

	async function handleEditSubmit(e) {
		e.preventDefault();

		const trimmedUsername = editForm.username.trim();
		if (!trimmedUsername) {
			setEditMessage("Username is required.");
			return;
		}

		try {
			await updateUser({
				id: editingId,
				username: trimmedUsername,
				phone: editForm.phone.trim(),
				avatar: editForm.avatar.trim(),
			}).unwrap();
			notifyAction(
				"user-action-toast",
				"success",
				`Updated "${trimmedUsername}"`,
			);
			closeEditModal();
		} catch (err) {
			const msg = getApiErrorMessage(err, "Failed to update user.");
			setEditMessage(msg);
			notifyAction("user-action-toast", "error", msg);
		}
	}

	function promptDeleteUser(user) {
		setUserToDelete(user);
		setShowDeleteModal(true);
	}

	function closeDeleteModal() {
		setShowDeleteModal(false);
		setUserToDelete(null);
	}

	async function confirmDelete() {
		if (!userToDelete) return;
		const deletedName = userToDelete.username;

		try {
			await deleteUser(userToDelete.id).unwrap();
			setRoleOverrides((prev) => {
				const next = { ...prev };
				delete next[userToDelete.id];
				return next;
			});
			notifyAction("user-action-toast", "success", `Deleted "${deletedName}"`);
			closeDeleteModal();
		} catch (err) {
			notifyAction(
				"user-action-toast",
				"error",
				getApiErrorMessage(err, "Failed to delete user."),
			);
		}
	}

	async function toggleUserRole(user) {
		const nextRole = user.role === "admin" ? "customer" : "admin";

		setRoleOverrides((prev) => ({
			...prev,
			[user.id]: nextRole,
		}));

		try {
			await updateUser({
				id: user.id,
				username: user.username,
				role: nextRole,
			}).unwrap();
			notifyAction("role-toast", "success", `Role set to ${nextRole}`);
		} catch {
			notifyAction(
				"role-toast",
				"info",
				`Role set to ${nextRole} locally (API skipped/restricted)`,
			);
		}
	}

	function updateForm(field, value) {
		setForm((previous) => ({ ...previous, [field]: value }));
	}

	function updateEditForm(field, value) {
		setEditForm((previous) => ({ ...previous, [field]: value }));
	}

	return (
		<main className="min-h-screen overflow-x-hidden rounded-2xl p-3 transition-colors duration-300 sm:p-5 lg:p-8">
			{isLoading ? (
				<UsersSkeleton t={t} />
			) : isError ? (
				<div className={`${t.card} mx-auto max-w-xl p-8 text-center`}>
					<p className="text-base font-semibold text-red-500">
						{getApiErrorMessage(error, "Failed to load users.")}
					</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-4 cursor-pointer rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
					>
						Retry
					</button>
				</div>
			) : (
				<div className="mx-auto w-full max-w-7xl rounded-2xl">
					<div
						className={`mb-6 w-full rounded-2xl border p-4 shadow-sm transition-colors duration-300 sm:p-6 ${t.headerCard}`}
					>
						<div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
							<div className="shrink-0">
								<p className="text-xs font-semibold uppercase text-sky-400">
									User Management
								</p>
								<h2
									className={`mt-1 text-2xl font-bold sm:text-3xl ${t.titleText}`}
								>
									Manage Users
								</h2>
							</div>

							<div className="flex w-full min-w-0 flex-nowrap items-center gap-2 lg:max-w-xl">
								<div className={t.searchBox}>
									<Search size={18} className="shrink-0 text-slate-400" />
									<input
										type="search"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										placeholder="Search users..."
										className="w-full min-w-0 bg-transparent text-sm outline-none"
									/>
									{search && (
										<button
											type="button"
											onClick={() => setSearch("")}
											aria-label="Clear search"
											className="shrink-0 cursor-pointer text-slate-400"
										>
											<X size={15} />
										</button>
									)}
								</div>

								<button
									type="button"
									onClick={showForm ? closeAddForm : openAddForm}
									className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-cyan-500 px-3 text-sm font-semibold text-white transition hover:bg-cyan-600 sm:px-4"
								>
									{showForm ? <X size={16} /> : <UserPlus size={17} />}
									<span>{showForm ? "Close" : "Add User"}</span>
								</button>
							</div>
						</div>
					</div>

					{showForm && (
						<section className={`${t.card} mb-5 overflow-hidden sm:mb-7`}>
							<div className={t.formHeader}>
								<div className="flex min-w-0 items-center gap-3">
									<div className="rounded-xl bg-cyan-500 p-2.5 text-white">
										<UserPlus size={22} />
									</div>
									<div>
										<h2 className={`font-bold sm:text-lg ${t.titleText}`}>
											Create New User
										</h2>
										<p className={`text-xs sm:text-sm ${t.subText}`}>
											Fill in the details below to add a new user.
										</p>
									</div>
								</div>

								<button
									type="button"
									onClick={closeAddForm}
									aria-label="Close form"
									className={`shrink-0 cursor-pointer rounded-lg p-2 ${t.closeBtn}`}
								>
									<X size={21} />
								</button>
							</div>

							<form
								onSubmit={handleAddSubmit}
								noValidate
								className="p-4 sm:p-6"
							>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div>
										<label
											htmlFor="add-user-username"
											className="mb-2 block text-sm font-semibold"
										>
											USERNAME <span className="text-red-500">*</span>
										</label>
										<input
											id="add-user-username"
											className={t.input}
											value={form.username}
											onChange={(e) => updateForm("username", e.target.value)}
											placeholder="e.g. john_doe"
											required
										/>
									</div>

									<div>
										<label
											htmlFor="add-user-email"
											className="mb-2 block text-sm font-semibold"
										>
											EMAIL <span className="text-red-500">*</span>
										</label>
										<input
											id="add-user-email"
											type="email"
											className={t.input}
											value={form.email}
											onChange={(e) => updateForm("email", e.target.value)}
											placeholder="e.g. john@email.com"
											required
										/>
									</div>

									<div>
										<label
											htmlFor="add-user-password"
											className="mb-2 block text-sm font-semibold"
										>
											PASSWORD <span className="text-red-500">*</span>
										</label>
										<input
											id="add-user-password"
											type="password"
											minLength={6}
											className={t.input}
											value={form.password}
											onChange={(e) => updateForm("password", e.target.value)}
											placeholder="Min. 6 characters"
											required
										/>
									</div>

									<div>
										<label
											htmlFor="add-user-phone"
											className="mb-2 block text-sm font-semibold"
										>
											PHONE
										</label>
										<input
											id="add-user-phone"
											type="tel"
											className={t.input}
											value={form.phone}
											onChange={(e) => updateForm("phone", e.target.value)}
											placeholder="e.g. +20 123 456 789"
										/>
									</div>

									<div className="sm:col-span-2">
										<label
											htmlFor="add-user-role"
											className="mb-2 block text-sm font-semibold"
										>
											ROLE
										</label>
										<select
											id="add-user-role"
											className={t.input}
											value={form.role}
											onChange={(e) => updateForm("role", e.target.value)}
										>
											<option value="customer" className={t.option}>
												Customer
											</option>
											<option value="admin" className={t.option}>
												Admin
											</option>
											<option value="moderator" className={t.option}>
												Moderator
											</option>
										</select>
									</div>
								</div>

								{message && (
									<p
										role="alert"
										className="mt-4 text-sm font-medium text-red-500"
									>
										{message}
									</p>
								)}

								<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
									<button
										type="button"
										disabled={isAdding}
										onClick={handleClearForm}
										className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${t.ghostBtn}`}
									>
										<RotateCcw size={17} />
										Clear
									</button>

									<button
										type="button"
										disabled={isAdding}
										onClick={closeAddForm}
										className={`cursor-pointer rounded-xl px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${t.ghostBtn}`}
									>
										Cancel
									</button>

									<button
										type="submit"
										disabled={isAdding}
										className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
									>
										<UserPlus size={18} />
										{isAdding ? "Creating..." : "Create User"}
									</button>
								</div>
							</form>
						</section>
					)}

					<section className="mb-5 grid grid-cols-2 gap-3 sm:mb-7 sm:gap-4 lg:grid-cols-4">
						<StatCard
							title="Total Users"
							count={stats.total}
							Icon={Users}
							t={t}
						/>
						<StatCard title="Admins" count={stats.admins} Icon={Shield} t={t} />
						<StatCard
							title="Customers"
							count={stats.customers}
							Icon={Users}
							t={t}
						/>
						<StatCard
							title="Verified"
							count={stats.verified}
							Icon={UserCheck}
							t={t}
						/>
					</section>

					<section className={`${t.card} hidden overflow-hidden md:block`}>
						<div className="w-full overflow-x-auto">
							<table className="w-full min-w-162 text-left">
								<thead className={t.thead}>
									<tr>
										<th className="px-5 py-4 font-semibold">User</th>
										<th className="px-5 py-4 font-semibold">Role</th>
										<th className="px-5 py-4 font-semibold">Verified</th>
										<th className="px-5 py-4 text-right font-semibold">
											Actions
										</th>
									</tr>
								</thead>

								<tbody className={t.tbody}>
									{filteredUsers.map((user) => (
										<tr key={user.id} className={t.rowHover}>
											<td className="px-5 py-4">
												<div className="flex min-w-0 items-center gap-3">
													<UserAvatar user={user} t={t} />
													<div className="min-w-0">
														<p
															className={`wrap-break-word  font-semibold ${t.bodyText}`}
														>
															{user.username}
														</p>
														<p className={`break-all text-sm ${t.mutedText}`}>
															{user.email}
														</p>
													</div>
												</div>
											</td>

											<td className="px-5 py-4">
												<RoleBadge role={user.role} />
											</td>

											<td className="px-5 py-4">
												<StatusBadge verified={user.verified} t={t} />
											</td>

											<td className="px-5 py-4">
												<UserActions
													user={user}
													disabled={isMutating}
													onEdit={openEditForm}
													onToggleRole={toggleUserRole}
													onDelete={promptDeleteUser}
												/>
											</td>
										</tr>
									))}

									{filteredUsers.length === 0 && (
										<tr>
											<td
												colSpan={4}
												className={`px-5 py-12 text-center text-sm ${t.mutedText}`}
											>
												No users found.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</section>

					<section className="space-y-3 md:hidden">
						<div className="flex items-center justify-between gap-2 px-1">
							<h2 className={`font-bold ${t.titleText}`}>All Users</h2>
							<span className={`text-xs ${t.mutedText}`}>
								{filteredUsers.length} users found
							</span>
						</div>

						{filteredUsers.map((user) => (
							<article key={user.id} className={`${t.card} min-w-0 p-4`}>
								<div className="flex min-w-0 items-center gap-3">
									<UserAvatar user={user} t={t} />
									<div className="min-w-0 flex-1">
										<p
											className={`wrap-break-word font-semibold ${t.titleText}`}
										>
											{user.username}
										</p>
										<p className={`break-all text-sm ${t.mutedText}`}>
											{user.email}
										</p>
									</div>
								</div>

								{user.phone && (
									<p
										className={`mt-3 flex items-center gap-2 break-all text-xs ${t.mutedText}`}
									>
										<Phone size={14} className="shrink-0" />
										{user.phone}
									</p>
								)}

								<div
									className={`my-4 flex flex-wrap items-center gap-2 border-y py-3 ${t.dividerBorder}`}
								>
									<RoleBadge role={user.role} />
									<StatusBadge verified={user.verified} t={t} />
								</div>

								<div className="flex items-center justify-between gap-2">
									<span className={`text-xs font-medium ${t.mutedText}`}>
										Actions
									</span>
									<UserActions
										user={user}
										disabled={isMutating}
										onEdit={openEditForm}
										onToggleRole={toggleUserRole}
										onDelete={promptDeleteUser}
									/>
								</div>
							</article>
						))}

						{filteredUsers.length === 0 && (
							<div
								className={`${t.card} py-10 text-center text-sm ${t.mutedText}`}
							>
								No users found.
							</div>
						)}
					</section>
				</div>
			)}

			{showEditModal &&
				createPortal(
					<div
						className="fixed inset-0 z-9999 bg-black/50"
						onMouseDown={(e) => {
							if (e.target === e.currentTarget) closeEditModal();
						}}
					>
						<dialog
							open
							aria-modal="true"
							aria-labelledby="edit-user-title"
							className={`${t.modal} max-w-lg p-5 sm:p-7`}
						>
							<div className="mb-6 flex items-center justify-between gap-3">
								<div>
									<h2
										id="edit-user-title"
										className={`text-xl font-bold ${t.titleText}`}
									>
										Edit User
									</h2>
									<p className={`mt-1 text-sm ${t.mutedText}`}>
										Update the user's information.
									</p>
								</div>

								<button
									type="button"
									onClick={closeEditModal}
									aria-label="Close edit modal"
									className={`cursor-pointer rounded-lg p-2 ${t.closeBtn}`}
								>
									<X size={22} />
								</button>
							</div>

							<form onSubmit={handleEditSubmit} className="space-y-4">
								<div>
									<label
										htmlFor="edit-user-username"
										className="mb-2 block text-sm font-semibold"
									>
										USERNAME
									</label>
									<input
										id="edit-user-username"
										className={t.input}
										value={editForm.username}
										onChange={(e) => updateEditForm("username", e.target.value)}
										placeholder="Enter username"
										required
									/>
								</div>

								<div>
									<label
										htmlFor="edit-user-phone"
										className="mb-2 block text-sm font-semibold"
									>
										PHONE
									</label>
									<input
										id="edit-user-phone"
										type="tel"
										className={t.input}
										value={editForm.phone}
										onChange={(e) => updateEditForm("phone", e.target.value)}
										placeholder="Enter phone number"
									/>
								</div>

								<div>
									<label
										htmlFor="edit-user-avatar"
										className="mb-2 block text-sm font-semibold"
									>
										AVATAR URL
									</label>
									<input
										id="edit-user-avatar"
										type="url"
										className={t.input}
										value={editForm.avatar}
										onChange={(e) => updateEditForm("avatar", e.target.value)}
										placeholder="https://example.com/avatar.png"
									/>
								</div>

								{editMessage && (
									<p role="alert" className="text-sm font-medium text-red-500">
										{editMessage}
									</p>
								)}

								<button
									type="submit"
									disabled={isUpdating}
									className="w-full cursor-pointer rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{isUpdating ? "Saving..." : "Save Changes"}
								</button>
							</form>
						</dialog>
					</div>,
					document.body,
				)}

			{showDeleteModal &&
				createPortal(
					<div
						className="fixed inset-0 z-9999 bg-black/50"
						onMouseDown={(e) => {
							if (e.target === e.currentTarget) closeDeleteModal();
						}}
					>
						<dialog
							open
							aria-modal="true"
							aria-labelledby="delete-user-title"
							className={`${t.modal} max-w-md p-6`}
						>
							<h3
								id="delete-user-title"
								className={`mb-6 text-lg font-semibold ${t.titleText}`}
							>
								Delete this user?
							</h3>

							<div className="flex items-center justify-end gap-3">
								<button
									type="button"
									disabled={isDeleting}
									onClick={closeDeleteModal}
									className={`cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${t.ghostBtn}`}
								>
									Cancel
								</button>
								<button
									type="button"
									disabled={isDeleting}
									onClick={confirmDelete}
									className="cursor-pointer rounded-xl bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{isDeleting ? "Deleting..." : "Delete"}
								</button>
							</div>
						</dialog>
					</div>,
					document.body,
				)}
		</main>
	);
}
