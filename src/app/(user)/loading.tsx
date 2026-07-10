import Loading from "@/components/Loading";
import { Box } from "@mui/material";

export default function () {
	return <Box sx={{ minHeight: '70vh', width: '90vw' }}>
		<Loading size="large" />
	</Box>
}
