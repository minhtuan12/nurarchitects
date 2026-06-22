import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import DOMPurify from 'isomorphic-dompurify';
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDateVN(dateInput: Date | string) {
    const date = new Date(dateInput);

    const months = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return {day, month, year};
}

export function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        USE_PROFILES: {html: true},
    });
}

export function isDirectVideoLink(url: string): boolean {
    return /\.(mp4|webm|ogg)$/i.test(url);
}

export function getSlugFromTitle(title: string) {
    return slugify(title, {lower: true, strict: true});
}

export function getIdFromSlug(slug: string) {
    return slug.split("-").pop() ?? "";
}

export function buildDetailPath(title: string, id: string) {
    const slug = slugify(title, {lower: true, strict: true});
    return `${slug}-${id}`;
}

export function getSecureLink(url: string) {
    return !url?.includes('https') ? url.replace('http', 'https') : url;
}
