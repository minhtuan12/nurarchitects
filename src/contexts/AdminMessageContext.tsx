"use client";

import { message } from "antd";
import { createContext, useContext, type ReactNode } from "react";
import type { MessageInstance } from "antd/es/message/interface";

const AntdMessageContext = createContext<MessageInstance | null>(null);

export function AntdMessageProvider({ children }: { children: ReactNode }) {
	const [messageApi, contextHolder] = message.useMessage();

	return (
		<AntdMessageContext.Provider value={messageApi}>
			{contextHolder}
			{children}
		</AntdMessageContext.Provider>
	);
}

export function useMessage(): MessageInstance {
	const ctx = useContext(AntdMessageContext);
	if (!ctx) throw new Error("useMessage phải được dùng trong AntdMessageProvider");
	return ctx;
}
