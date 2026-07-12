"use client";

import { Box, CircularProgress, Container, Fade, Typography } from "@mui/material";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "@/components/Link";
import { AppImage } from "@/components/AppImage";
import { fetchApi } from "@/helpers";
import { INewsPopulated } from "@/types/news";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface Props {
	open: boolean;
	onClose: () => void;
}

const SEARCH_LIMIT = 20;

export default function SearchOverlay({ open, onClose }: Props) {
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);

	const [query, setQuery] = useState("");
	const [results, setResults] = useState<INewsPopulated[]>([]);
	const [loading, setLoading] = useState(false);

	const debouncedQuery = useDebouncedValue(query, 400);

	// Autofocus khi mở
	useEffect(() => {
		if (open) {
			// đợi 1 tick để element render xong
			const t = setTimeout(() => inputRef.current?.focus(), 50);
			return () => clearTimeout(t);
		} else {
			// reset state khi đóng
			setQuery("");
			setResults([]);
			setLoading(false);
		}
	}, [open]);

	// Đóng bằng phím Escape
	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [open, onClose]);

	// Gọi API tìm kiếm khi debouncedQuery đổi
	useEffect(() => {
		if (!debouncedQuery.trim()) {
			setResults([]);
			setLoading(false);
			return;
		}

		let active = true;
		setLoading(true);

		fetchApi<INewsPopulated>(
			`/api/news?search=${encodeURIComponent(debouncedQuery.trim())}&limit=${SEARCH_LIMIT}`
		)
			.then((res) => {
				if (active) setResults(res?.items ?? []);
			})
			.finally(() => {
				if (active) setLoading(false);
			});

		return () => {
			active = false;
		};
	}, [debouncedQuery]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && query.trim()) {
			onClose();
			router.push(`/?s=${encodeURIComponent(query.trim())}`);
		}
	};

	if (!open) return null;

	return (
		<Fade in={open}>
			<Box
				sx={{
					position: "fixed",
					inset: 0,
					zIndex: 99999,
					bgcolor: "rgba(0,0,0,0.8)",
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
				onClick={onClose}
			>
				{/* Thanh search - nền sáng, chặn click bubble để không đóng khi click vào input/kết quả */}
				<Box
					onClick={(e) => e.stopPropagation()}
					sx={{ bgcolor: "transparent", width: { xs: '80vw', lg: '50vw' } }}
				>
					<Container maxWidth="xl" sx={{ px: { xs: "15px", md: "30px" }, bgcolor: 'transparent' }}>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 2,
								borderBottom: "2px solid white",
								py: 1,
								px: 2,
							}}
						>
							<Box
								component="input"
								ref={inputRef}
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Tìm kiếm..."
								sx={{
									flex: 1,
									border: "none",
									outline: "none",
									background: "transparent",
									fontSize: { xs: 20, md: 24 },
									color: "white",
									fontFamily: "inherit",
									"&::placeholder": { color: "white" },
								}}
							/>
							{loading ? (
								<CircularProgress size={22} sx={{ color: "white" }} />
							) : (
								<Search size={26} color="white" style={{ cursor: "pointer" }} />
							)}
						</Box>
					</Container>

					{/* Kết quả tìm kiếm */}
					{query.trim() && (
						<Container
							maxWidth="xl"
							sx={{
								px: { xs: "15px", md: "30px" },
								maxHeight: "60vh",
								overflowY: "auto",
								mt: 1,
							}}
							onClick={(e) => e.stopPropagation()}
						>
							{!loading && results.length === 0 && (
								<Typography sx={{ py: 3, color: "#666" }}>
									Không tìm thấy kết quả phù hợp với &quot;{query}&quot;
								</Typography>
							)}

							{results.map((item) => (
								<Link
									key={String(item._id)}
									href={`/tin-tuc/chi-tiet/${item.slug}`}
									onClick={onClose}
								>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 2,
											py: 1.5,
											borderBottom: "1px solid rgba(0,0,0,0.08)",
											"&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
										}}
									>
										{item.thumbnailId && (
											<AppImage
												src={item.thumbnailId.secureUrl as any}
												alt={item.title as string}
												width={50}
												height={50}
												style={{ objectFit: "cover", height: 50, width: 50, borderRadius: 999 }}
											/>
										)}
										<Box sx={{ minWidth: 0 }}>
											<Typography
												sx={{
													fontWeight: 600,
													fontSize: 16,
													color: "white",
													overflow: "hidden",
													textOverflow: "ellipsis",
													display: "-webkit-box",
													WebkitLineClamp: 2,
													WebkitBoxOrient: "vertical",
												}}
											>
												{item.title as string}
											</Typography>
										</Box>
									</Box>
								</Link>
							))}
						</Container>
					)}
				</Box>
			</Box>
		</Fade>
	);
}
