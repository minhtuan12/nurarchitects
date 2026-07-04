import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { buildMetadata } from "@/lib/seo";
import "../globals.css";
import ConcreteBg from "@/assets/images/concrete-bg.jpg";
import { Box } from "@mui/material";

export const metadata: Metadata = buildMetadata();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<SiteShell>
			<Box sx={{
				// backgroundImage: `url(${ConcreteBg.src})`,
				// backgroundSize: "contain",
			}}>
				{children}
			</Box>
		</SiteShell>
	);
}
