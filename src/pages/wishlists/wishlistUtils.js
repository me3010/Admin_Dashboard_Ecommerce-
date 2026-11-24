import { formatMoney } from "../orders/orderUtils";

export { formatMoney };
export const PAGE_SIZE = 8;

export const extractWishlists = (res) => {
	if (Array.isArray(res)) return res;
	const list =
		res?.wishlists ?? res?.data?.wishlists ?? res?.data ?? res?.results ?? [];
	return Array.isArray(list) ? list : [];
};

const imageOf = (p) => {
	const img = p?.image ?? p?.images?.[0] ?? p?.thumbnail ?? p?.photo ?? null;
	if (!img) return null;
	return typeof img === "string" ? img : (img.url ?? img.secure_url ?? null);
};

export const normalizeProduct = (entry) => {
	const p =
		entry?.product && typeof entry.product === "object" ? entry.product : entry;
	const price = p?.price ?? p?.salePrice ?? entry?.price;
	return {
		id: String(p?._id ?? p?.id ?? entry?._id ?? entry ?? ""),
		name: p?.name ?? p?.title ?? "Unnamed product",
		image: imageOf(p),
		price: price == null || Number.isNaN(Number(price)) ? null : Number(price),
		category:
			typeof p?.category === "object"
				? (p.category?.name ?? "")
				: (p?.category ?? ""),
	};
};

export const normalizeWishlist = (w) => {
	const rawId = String(w?._id ?? w?.id ?? "");
	const u = w?.user ?? w?.userId ?? w?.customer;
	const user = u && typeof u === "object" ? u : {};
	const rawItems = w?.products ?? w?.items ?? w?.wishlist ?? [];
	const products = (Array.isArray(rawItems) ? rawItems : [])
		.map(normalizeProduct)
		.filter((p) => p.id || p.name);

	return {
		id: rawId || String(user._id ?? Math.random()),
		userName: user.username ?? user.name ?? user.fullName ?? "",
		userEmail: user.email ?? "",
		products,
		count: products.length,
		value: products.reduce((sum, p) => sum + (p.price ?? 0), 0),
		updatedAt: w?.updatedAt ?? w?.createdAt ?? null,
	};
};

export const buildStats = (stats, wishlists) => {
	const s = stats?.data ?? stats ?? {};
	const num = (...vals) => {
		for (const v of vals)
			if (v != null && !Number.isNaN(Number(v))) return Number(v);
		return null;
	};
	const savedItems = wishlists.reduce((n, w) => n + w.count, 0);
	const withItems = wishlists.filter((w) => w.count > 0).length;

	let top = s.topProducts ?? s.mostWishlisted ?? s.popularProducts ?? null;
	if (Array.isArray(top)) {
		top = top
			.map((e) => ({
				...normalizeProduct(e),
				count: Number(e?.count ?? e?.wishlistCount ?? e?.total ?? 0),
			}))
			.filter((e) => e.count > 0);
	} else {
		const map = new Map();
		for (const w of wishlists)
			for (const p of w.products) {
				const key = p.id || p.name;
				const cur = map.get(key) ?? { ...p, count: 0 };
				cur.count += 1;
				map.set(key, cur);
			}
		top = [...map.values()];
	}
	top = top.sort((a, b) => b.count - a.count).slice(0, 5);

	return {
		totalWishlists: num(s.totalWishlists, s.total, s.count) ?? wishlists.length,
		totalItems: num(s.totalItems, s.totalProducts, s.totalSaved) ?? savedItems,
		activeUsers: num(s.activeUsers, s.totalUsers) ?? withItems,
		top,
	};
};

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sept",
	"Oct",
	"Nov",
	"Dec",
];
export const formatDate = (value) => {
	if (!value) return "—";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "—";
	return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
