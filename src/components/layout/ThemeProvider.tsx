'use client'

import { buildTheme } from "@/lib/theme";
import { SiteSettings } from "@/types/shared";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

export default function ThemeProvider({
	settings,
	children,
}: {
	settings: SiteSettings;
	children: React.ReactNode;
}) {
	const activeTheme = buildTheme(settings);

	return <MuiThemeProvider theme={activeTheme}>{children}</MuiThemeProvider>;
}