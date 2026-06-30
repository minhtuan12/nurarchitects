import Developing from "@/components/admin/Developing";
import { buildMetadata } from "@/lib/seo";
import { Box } from "@mui/material";

export default async function () {
	return (
		<>
			<Box sx={{ py: 20 }}>
				<Developing />
			</Box>
		</>
	);
}
