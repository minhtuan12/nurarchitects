"use client";

import React from "react";
import {
	Typography as MuiTypography,
	TypographyProps,
	useTheme,
} from "@mui/material";

const ContrastTypography = React.forwardRef<
	HTMLDivElement,
	TypographyProps & { basecolor?: string }
>((props, ref) => {
	const theme = useTheme();
	const color = { color: theme.palette.getContrastText(props.basecolor || theme.palette.primary.main) }
	return (
		<MuiTypography
			{...props}
			{...color}
			ref={ref}
		/>
	);
});

export default ContrastTypography;
