"use client";

import { Empty, EmptyProps } from "antd";

export default function NoData({ children, ...props }: EmptyProps) {
	return (
		<Empty
			image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
			className="flex items-center justify-center flex-col"
			{...props}
		>
			{children}
		</Empty>
	);
}
