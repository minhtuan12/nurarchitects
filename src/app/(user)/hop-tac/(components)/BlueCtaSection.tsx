import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { GridFadeIn } from "@/components/base/Grid";
import BgPattern from "@/assets/images/bg-pattern.jpg";
import { RichContent } from "@/components/PageSections";
import PartnerRegisterCTA from "./PartnerRegisterCTA";

interface BlueSectionProps {
	bgImage?: string;
	content?: string;
	hasCta?: boolean;
	ctaContent?: string;
	leftSpacing?: number;
}

export default function BlueCtaSection({
	bgImage,
	content,
	ctaContent,
	leftSpacing = 3
}: BlueSectionProps) {
	return (
		<Box sx={{ py: 10, position: "relative" }}>
			<Image
				src={bgImage || BgPattern.src}
				fill
				className="w-full h-full absolute"
				alt={"Trở thành đối tác của Nurarchitects"}
			/>
			<Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
				<Grid
					container
					spacing={{ xs: 5, md: 0 }}
					sx={{
						display: "flex",
						flexDirection: { xs: "column", md: "row" },
						alignItems: { md: "center" },
					}}
				>
					{/* ── Left: Text ─────────────────────────────────────────────── */}
					<GridFadeIn
						size={{ xs: 12 }}
						fadeInDirection="left"
						sx={{
							maxWidth: { xs: '100%', lg: '50%' },
							margin: '0 auto',
						}}
					>
						<Stack spacing={leftSpacing}>
							{/* Description */}
							<RichContent
								className="text-white text-[18px] lg:text-[24px] font-semibold text-center"
								html={content}
							/>

							<PartnerRegisterCTA ctaContent={ctaContent} />
						</Stack>
					</GridFadeIn>
				</Grid>
			</Container>
		</Box>
	);
}
