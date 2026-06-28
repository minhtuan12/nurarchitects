import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { buildMetadata } from "@/lib/seo";
import "../globals.css";
import Developing from "@/components/admin/Developing";
import { Box } from "@mui/material";

export const metadata: Metadata = buildMetadata();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<SiteShell>
			<Box sx={{ py: 20 }}>
				<Developing />
			</Box>
		</SiteShell>
	);
}
