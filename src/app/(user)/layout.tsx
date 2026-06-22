import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { buildMetadata } from "@/lib/seo";
import "../globals.css";

export const metadata: Metadata = buildMetadata();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<SiteShell>{children}</SiteShell>
	);
}
