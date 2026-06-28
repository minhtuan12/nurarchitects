import { Button as MuiButton, ButtonProps } from "@mui/material";

type Props = ButtonProps & {
	fillHovered?: boolean;
	fillHoveredBgColor?: string;
};

export default function Button({
	children,
	fillHovered,
	fillHoveredBgColor,
	sx,
	...props
}: Props) {
	return <MuiButton
		{...props}
		sx={{
			...(fillHovered && {
				"&:hover": {
					backgroundColor: fillHoveredBgColor || "primary.main",
					color: 'white',
				},
			}),
			...sx, // giữ lại sx từ ngoài truyền vào
		}}
	>
		{children}
	</MuiButton>
}
