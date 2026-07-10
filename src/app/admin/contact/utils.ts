/**
 * Parse một URL Google Maps (đầy đủ hoặc link rút gọn dạng maps.app.goo.gl)
 * và trả về { lat, lng } nếu tìm được, ngược lại trả về null.
 *
 * Hỗ trợ các pattern phổ biến:
 *  - https://www.google.com/maps/place/Ten+Dia+Diem/@21.0285,105.8542,17z
 *  - https://www.google.com/maps?q=21.0285,105.8542
 *  - https://www.google.com/maps/@21.0285,105.8542,15z
 *  - https://www.google.com/maps/dir//21.0285,105.8542/
 *  - https://maps.app.goo.gl/xxxx (link rút gọn -> cần resolve redirect trước)
 */

export type LatLng = { lat: number; lng: number };

function isShortenedGoogleMapsUrl(url: string): boolean {
	return /maps\.app\.goo\.gl|goo\.gl\/maps/.test(url);
}

/**
 * Parse trực tiếp từ một URL đầy đủ (không cần network).
 * Dùng khi URL đã ở dạng đầy đủ www.google.com/maps/...
 */
export function parseGoogleMapsUrl(url: string): LatLng | null {
	// 1. Ưu tiên marker
	let match = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);

	if (match) {
		return {
			lat: Number(match[1]),
			lng: Number(match[2]),
		};
	}

	// 2. Fallback về camera
	match = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);

	if (match) {
		return {
			lat: Number(match[1]),
			lng: Number(match[2]),
		};
	}

	return null;
}

/**
 * Parse link Google Maps, tự động resolve link rút gọn (maps.app.goo.gl)
 * bằng cách gọi API backend (vì browser fetch sẽ bị chặn CORS khi gọi
 * trực tiếp Google). Cần một endpoint backend dạng:
 *   GET /admin/utils/resolve-url?url=<encoded>
 * trả về { url: "<redirected full url>" }
 *
 * Nếu không muốn dùng backend resolve, có thể yêu cầu người dùng dán
 * link đầy đủ (sau khi mở link rút gọn trên trình duyệt và copy URL thật).
 */
export async function parseGoogleMapsUrlAsync(
	url: string,
	resolveShortUrl?: (shortUrl: string) => Promise<string>,
): Promise<LatLng | null> {
	if (!url) return null;

	if (isShortenedGoogleMapsUrl(url) && resolveShortUrl) {
		try {
			const resolved = await resolveShortUrl(url);
			return parseGoogleMapsUrl(resolved);
		} catch {
			return null;
		}
	}

	return parseGoogleMapsUrl(url);
}
