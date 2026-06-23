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
