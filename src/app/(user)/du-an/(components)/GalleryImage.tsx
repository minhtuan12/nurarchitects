"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Box, Modal, Backdrop, IconButton, Fade } from "@mui/material";
import { X, ZoomIn } from "lucide-react";

interface GalleryImageProps {
	src: string;
	alt: string;
	/** aspectRatio của ô thumbnail, mặc định 4/3 */
	aspectRatio?: string;
	sizes?: string;
}

export default function GalleryImage({
	src,
	alt,
	aspectRatio = "4 / 3",
	sizes = "(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw",
}: GalleryImageProps) {
	const [open, setOpen] = useState(false);

	const handleOpen = useCallback(() => setOpen(true), []);
	const handleClose = useCallback(() => setOpen(false), []);

	return (
		<>
			<Box
				onClick={handleOpen}
				sx={{
					position: "relative",
					width: "100%",
					aspectRatio,
					overflow: "hidden",
					borderRadius: 0.5,
					cursor: "pointer",
					"&:hover img": {
						transform: "scale(1.06)",
						filter: "blur(2px) brightness(0.7)",
					},
					"&:hover .zoom-overlay": {
						opacity: 1,
					},
				}}
			>
				<Image
					src={src}
					alt={alt}
					fill
					sizes={sizes}
					style={{
						objectFit: "cover",
						transition: "transform 0.35s ease, filter 0.35s ease",
					}}
				/>

				<Box
					className="zoom-overlay"
					sx={{
						position: "absolute",
						inset: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						opacity: 0,
						transition: "opacity 0.3s ease",
						pointerEvents: "none",
					}}
				>
					<Box
						sx={{
							width: 48,
							height: 48,
							borderRadius: "50%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<ZoomIn size={24} color="white" />
					</Box>
				</Box>
			</Box>

			<Modal
				open={open}
				onClose={handleClose}
				closeAfterTransition
				slots={{ backdrop: Backdrop }}
				slotProps={{
					backdrop: {
						timeout: 300,
						sx: {
							backgroundColor: "rgba(0, 0, 0, 0.6)",
							backdropFilter: "blur(8px)",
							WebkitBackdropFilter: "blur(8px)",
						},
					},
				}}
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Fade in={open}>
					<Box
						sx={{
							position: "relative",
							outline: "none",
							width: { xs: "92vw", md: "80vw" },
							height: { xs: "70vh", md: "85vh" },
						}}
					>
						<IconButton
							onClick={handleClose}
							aria-label="Đóng preview"
							sx={{
								position: "absolute",
								top: -48,
								right: 0,
								color: "white",
								zIndex: 2,
								"&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
							}}
						>
							<X size={28} />
						</IconButton>

						<Image
							src={src}
							alt={alt}
							fill
							sizes="90vw"
							style={{ objectFit: "contain" }}
							priority
						/>
					</Box>
				</Fade>
			</Modal>
		</>
	);
}
