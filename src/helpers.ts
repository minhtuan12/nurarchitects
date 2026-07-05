import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const toSlug = (value: string) =>
	slugify(value, { lower: true, strict: true, locale: "vi" });

/**
 * Kiểm tra một chuỗi có phải là URL hợp lệ không (không quan tâm domain).
 * Chấp nhận chuỗi rỗng là hợp lệ (vì các field social url là optional).
 */
export function isValidUrl(value: string): boolean {
	if (!value.trim()) return true; // rỗng -> coi như hợp lệ (chưa nhập)

	try {
		const url = new URL(value);
		// Chỉ chấp nhận http/https, tránh các scheme lạ như javascript:, ftp:...
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

type ApiListResponse<T> = {
	items?: T[];
	item?: T;
};

const SITE_ORIGIN =
	process.env.NEXT_PUBLIC_SITE_URL ||
	(process.env.VERCEL_URL ? process.env.BASE_URL : "http://localhost:3000");

export async function fetchApi<T>(path: string): Promise<ApiListResponse<T> | null> {
	try {
		const response = await fetch(new URL(path, SITE_ORIGIN), { cache: "no-store" });
		if (!response.ok) return null;
		return (await response.json()) as ApiListResponse<T>;
	} catch {
		return null;
	}
}

export function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function capitalizeFirstEachWord(str: string) {
	return str
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

export function buildQueryString(
	params: Record<string, string | undefined>,
): string | undefined {
	const searchParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value) searchParams.set(key, value);
	});
	const qs = searchParams.toString();
	return qs || undefined;
}

export function withQueryString(path: string, queryString?: string) {
	return queryString ? `${path}?${queryString}` : path;
}
