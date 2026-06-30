"use client";

import { useState } from "react";
import {
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";

export default function QueryProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	// useState để đảm bảo mỗi client chỉ tạo 1 QueryClient,
	// tránh bị tạo lại mỗi lần re-render
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000 * 5, // 5 phút
						refetchOnWindowFocus: false,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
}
