import { SiteSettings } from "@/types/shared";
import { createTheme, type Theme } from "@mui/material/styles";

/**
 * Override palette của theme gốc (@/theme) bằng màu lấy từ SettingsConfig.
 * Dùng đúng cơ chế merge có sẵn của MUI: createTheme(baseTheme, overrides)
 * sẽ deep-merge overrides vào baseTheme, giữ nguyên mọi thứ khác
 * (typography, breakpoints, component overrides,...) bạn đã cấu hình sẵn.
 */
export function buildTheme(settings: SiteSettings): Theme {
	const theme = createTheme({
		cssVariables: true,
		palette: {
			mode: "light",
			primary: { main: settings.primaryColor },
			// secondary: { main: settings.secondaryColor },
			background: {
				default: settings.backgroundColor,
				paper: settings.backgroundColor,
			},
			// text: { primary: settings.textColor },
			secondary: {
				main: "#8a6f43",
			},
			text: {
				primary: "#1d1c18",
				secondary: "#69645a",
			},
		},
		shape: {
			borderRadius: 8,
		},
		typography: {
			fontFamily:
				"var(--font-acherus), var(--font-arial), Arial, sans-serif",
			h1: { fontWeight: 700, letterSpacing: 0 },
			h2: { fontWeight: 700, letterSpacing: 0 },
			h3: { fontWeight: 700, letterSpacing: 0 },
			button: { textTransform: "none", fontWeight: 700 },
		},
		components: {
			MuiButton: {
				defaultProps: {
					disableElevation: true,
				},
				styleOverrides: {
					root: {
						borderRadius: 4,
					},
				},
			},
			MuiCard: {
				styleOverrides: {
					root: {
						borderRadius: 8,
					},
				},
			},
		},
	});

	return createTheme(theme, {});
}
