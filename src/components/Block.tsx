"use client";

import { theme } from "antd";

export default function Block({ children, className, style }: any) {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <div
            style={{
                backgroundColor: colorBgContainer,
                borderRadius: borderRadiusLG * 1.5,
                ...style,
            }}
            className={`w-full px-6 pt-5 pb-6 shadow-md flex flex-col ${className}`}
        >
            {children}
        </div>
    );
}
