'use client'

import { Box, Button } from "@mui/material";
import { useState } from "react";
import PartnerRegistrationDialog from "./PartnerRegistrationDialog";

export default function PartnerRegisterCTA({ ctaContent }: { ctaContent?: string }) {
	const [openForm, setOpenForm] = useState(false);

	return <>
		<Box sx={{ textAlign: "center" }}>
			<Button
				variant="contained"
				onClick={() => setOpenForm(true)}
				sx={{
					bgcolor: "#C0392B",
					color: "#fff",
					fontWeight: 700,
					px: 4,
					py: 1.25,
					borderRadius: 0.2,
					fontSize: { xs: 12, lg: 14 },
					textTransform: 'uppercase',
					"&:hover": { bgcolor: "#A93226" },
				}}
			>
				{ctaContent || 'Trở thành đối tác NUR Architects!'}
			</Button>
		</Box>

		<PartnerRegistrationDialog
			open={openForm}
			setOpen={setOpenForm}
			onClose={() => setOpenForm(false)}
		/>
	</>
}
