import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const toSlug = (value: string) =>
	slugify(value, { lower: true, strict: true, locale: "vi" });
