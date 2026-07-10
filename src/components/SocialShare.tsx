"use client";

import { TwitterOutlined } from "@ant-design/icons";
import { Stack, IconButton, Tooltip } from "@mui/material";
import FacebookIcon from "./icons/Facebook";

interface SocialShareProps {
	url: string; // URL tuyệt đối của bài viết
	title?: string;
}

export default function SocialShare({ url, title }: SocialShareProps) {
	const openSharePopup = (shareUrl: string) => {
		const width = 600;
		const height = 500;
		const left = window.screenX + (window.outerWidth - width) / 2;
		const top = window.screenY + (window.outerHeight - height) / 2;

		window.open(
			shareUrl,
			"share-popup",
			`width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,location=0`
		);
	};

	const handleFacebookShare = () => {
		const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
			url
		)}`;
		openSharePopup(shareUrl);
	};

	const handleTwitterShare = () => {
		const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
			url
		)}${title ? `&text=${encodeURIComponent(title)}` : ""}`;
		openSharePopup(shareUrl);
	};

	return (
		<Stack direction="row" spacing={1}>
			<Tooltip title="Chia sẻ trên Facebook">
				<IconButton
					onClick={handleFacebookShare}
					size="small"
					sx={{ bgcolor: "transparent", "&:hover": { color: "#e0e0e0" } }}
					aria-label="Chia sẻ lên Facebook"
				>
					<FacebookIcon style={{ fontSize: 16, fill: "#8a8a8a" }} className="hover:fill-black" />
				</IconButton>
			</Tooltip>
			<Tooltip title="Chia sẻ trên Twitter">
				<IconButton
					onClick={handleTwitterShare}
					size="small"
					sx={{ bgcolor: "transparent", "&:hover": { color: "#e0e0e0" } }}
					aria-label="Chia sẻ lên Twitter"
				>
					<TwitterOutlined style={{ fontSize: 16, color: "#8a8a8a" }} className="hover:text-black" />
				</IconButton>
			</Tooltip>
		</Stack>
	);
}
