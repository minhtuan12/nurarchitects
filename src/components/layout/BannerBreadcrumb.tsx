import { Typography } from "@mui/material";
import { GridFadeIn } from "../base/Grid";

interface BannerBreadcrumbProps {
	centered?: boolean;
	breadcrumbString?: string;
	pageTitle?: string;
	pageSubTitle?: string;
}

export default function BannerBreadcrumb({
	centered = false,
	breadcrumbString,
	pageTitle,
	pageSubTitle,
}: BannerBreadcrumbProps) {
	return (
		<GridFadeIn
			fadeInDirection="left"
			sx={{
				display: 'flex',
				flexDirection: 'column',
				...(centered && { alignItems: 'center' }),
				gap: 3.5,
				position: 'absolute',
				...(centered ? {
					left: '50%',
					top: '80%',
				} : {
					left: { xs: 20, sm: 50, md: "20%" },
					bottom: { xs: '10%', md: "15%" },
				}),
				zIndex: 11,
			}}
			className={centered ? '-translate-x-1/2 -translate-y-1/2' : ''}
		>
			<Typography
				sx={{ textTransform: "uppercase" }}
				color="#ffffffbe"
				fontSize={12}
				fontWeight={700}
				{...(centered && { textAlign: 'center' })}
			>
				{breadcrumbString}
			</Typography>
			<Typography
				variant="h1"
				sx={{ textTransform: "uppercase" }}
				fontSize={{ xs: 27, md: 40 }}
				color="white"
				{...(centered && { textAlign: 'center' })}
			>
				{pageTitle}
			</Typography>
			{!!pageSubTitle && <Typography
				variant="h6"
				fontSize={{ xs: 12, md: 16 }}
				color="rgba(255, 255, 255, 0.8)"
			>
				{pageSubTitle}
			</Typography>
			}
		</GridFadeIn>
	);
}
