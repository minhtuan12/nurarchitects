import { IMedia } from "@/types/media";
import Image from "next/image";

interface MediaRendererProps {
	media: IMedia;
	// Image props
	fill?: boolean;
	sizes?: string;
	priority?: boolean;
	className?: string;
	// Video props
	autoPlay?: boolean;
	muted?: boolean;
	loop?: boolean;
	controls?: boolean;
	playsInline?: boolean;
	// SEO / accessibility
	title?: string;        // <video title="..."> giúp screen reader + SEO
	decorative?: boolean;  // true → alt="" (ảnh trang trí, bỏ qua bởi screen reader)
}

export default function MediaRenderer({
	media,
	fill = false,
	sizes,
	priority = false,
	className,
	autoPlay = false,
	muted = true,
	loop = false,
	controls = true,
	playsInline = true,
	title,
	decorative = false,
}: MediaRendererProps) {
	const src = media.secureUrl || media.url;

	// Ảnh trang trí → alt rỗng (screen reader bỏ qua)
	// Ảnh nội dung  → ưu tiên media.alt, fallback originalName
	const alt = decorative ? "" : (media.alt?.trim() || media.originalName);

	// ── Video ────────────────────────────────────────────────────────────────
	if (media.resourceType === "video") {
		return (
			/**
			 * Bọc trong <figure> để:
			 * - Thêm structured data VideoObject (JSON-LD) bên ngoài nếu cần
			 * - Cho phép đặt <figcaption> phục vụ SEO/accessibility
			 * - aria-label giúp screen reader mô tả video
			 */
			<figure
				className={className}
				style={
					fill
						? { position: "relative", width: "100%", height: "100%", margin: 0 }
						: { margin: 0 }
				}
				aria-label={title || media.alt || media.originalName}
			>
				<video
					src={src}
					autoPlay={autoPlay}
					muted={muted}
					loop={loop}
					controls={controls}
					playsInline={playsInline}
					title={title || media.alt || media.originalName}
					width={!fill ? (media.width ?? 1920) : undefined}
					height={!fill ? (media.height ?? 1080) : undefined}
					style={
						fill
							? { width: "100%", height: "100%", objectFit: "cover", display: "block" }
							: { display: "block" }
					}
					/**
					 * preload="none" → không tải video cho đến khi user tương tác
					 * Tốt cho LCP/CLS nếu video không phải hero
					 * Đổi thành "metadata" nếu cần biết duration sớm
					 * Đổi thành "auto" nếu là hero autoplay banner
					 */
					preload={autoPlay ? "auto" : "none"}
				>
					{/* Fallback text cho crawler không đọc được video */}
					{media.caption || media.originalName}
				</video>

				{/* Caption hiển thị ra ngoài giúp SEO hiểu context của video */}
				{media.caption && (
					<figcaption
						style={{
							fontSize: "0.85rem",
							color: "#666",
							marginTop: 4,
							textAlign: "center",
						}}
					>
						{media.caption}
					</figcaption>
				)}
			</figure>
		);
	}

	// ── Image ────────────────────────────────────────────────────────────────
	/**
	 * next/image tự động:
	 * - lazy load (loading="lazy") trừ khi priority=true
	 * - srcSet + WebP/AVIF conversion
	 * - tránh CLS bằng width/height hoặc fill
	 *
	 * priority=true → preload, dùng cho ảnh LCP (hero, above-the-fold)
	 */
	const imageEl = fill ? (
		<Image
			src={src}
			alt={alt}
			fill
			sizes={sizes ?? "100vw"}
			priority={priority}
			className={className}
			style={{ objectFit: "cover" }}
			/**
			 * fetchPriority="high" kết hợp priority giúp browser
			 * fetch ảnh LCP sớm nhất có thể
			 */
			fetchPriority={priority ? "high" : "auto"}
		/>
	) : (
		<Image
			src={src}
			alt={alt}
			width={media.width ?? 1920}
			height={media.height ?? 1080}
			sizes={sizes}
			priority={priority}
			className={className}
			fetchPriority={priority ? "high" : "auto"}
		/>
	);

	// Ảnh trang trí không cần figure/figcaption
	if (decorative) return imageEl;

	return (
		<figure style={{ margin: 0 }} className={fill ? className : undefined}>
			{imageEl}
			{media.caption && (
				<figcaption
					style={{
						fontSize: "0.85rem",
						color: "#666",
						marginTop: 4,
						textAlign: "center",
					}}
				>
					{media.caption}
				</figcaption>
			)}
		</figure>
	);
}
