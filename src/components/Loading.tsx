'use client'

import { Flex, Spin, SpinProps } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useMemo } from "react";

export default function Loading(props: SpinProps) {
	const size = useMemo(() => {
		switch (props.size) {
			case "large":
				return 40;
			case "medium":
				return 26;
			case "small":
				return 16;
			default:
				return 12;
		}
	}, [props.size]);

	return <Flex align="center" gap="medium" justify="center" className="h-full w-full [&_.anticon-spin]:h-full">
		<Spin
			indicator={<LoadingOutlined spin size={size} />}
			styles={{
				indicator: {
					color: "black",
				},
				root: { display: "flex" }
			}}  {...props}
		/>
	</Flex>
}
