"use client";

import { Box, Container, Grid, Typography, useTheme } from "@mui/material";
import { INewsPopulated } from "@/types/news";
import Link from "next/link";
import { RichContent } from "@/components/PageSections";
import SocialShare from "@/components/SocialShare";

export default function NewsDetail({ news }: { news: INewsPopulated }) {
	const theme = useTheme();
	return (
		<>
			<Box
				sx={{
					height: 275,
					bgcolor: "primary.main",
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					px: { xs: 2, sm: 10, md: 20, lg: 30 },
				}}
			>
				{(!!news.categoryId?.name && !!news.categoryId?.slug) && (
					<Typography
						variant="h6"
						fontWeight={500}
						fontSize={12}
						sx={{ mb: 2.5, textTransform: 'uppercase' }}
						textAlign='center'
						color={theme.palette.getContrastText(
							theme.palette.primary.main,
						)}
					>
						<Link href={`/tin-tuc/${news.categoryId.slug}`} className="w-fit text-center opacity-80 hover:opacity-100">
							{news.categoryId?.name}
						</Link>
					</Typography>
				)}
				<Typography
					variant="h4"
					fontWeight={700}
					fontSize={{ xs: 26, md: 30, lg: 33 }}
					textAlign='center'
					color={theme.palette.getContrastText(
						theme.palette.primary.main,
					)}
					lineHeight={1.4}
				>
					{news.title}
				</Typography>
			</Box>

			<Box sx={{ pt: { xs: 4, md: 6 }, pb: 20, bgcolor: "white" }}>
				<Container maxWidth="md">
					<RichContent html={news.description} />

					<Box sx={{ mt: 4, pt: 3, display: 'flex', justifyContent: 'center' }}>
						<SocialShare
							url={`${process.env.NEXT_PUBLIC_SITE_URL}/tin-tuc/chi-tiet/${news.slug}`}
							title={news.title}
						/>
					</Box>
				</Container>
			</Box>
		</>
	);
}
