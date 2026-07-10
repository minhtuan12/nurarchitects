import Loading from "@/components/Loading";
import { Box } from "@mui/material";

export default function () {
	return <Box sx={{ minHeight: '70vh', width: '98vw' }}>
		<Loading size="large" className="min-h-[70vh] flex items-center justify-center"/>
	</Box>
}
