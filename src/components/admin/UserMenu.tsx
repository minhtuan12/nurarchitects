'use client'

import { Avatar, Dropdown, MenuProps } from "antd";
import { ChevronDown, Lock, LogOut } from "lucide-react";
import {
	UserOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminMenu() {
	const [loggingOut, setLoggingOut] = useState(false);
	const router = useRouter();

	const handleLogout = async () => {
		if (loggingOut) return;

		setLoggingOut(true);

		try {
			const response = await fetch("/api/admin/auth/logout", {
				method: "POST",
				credentials: "same-origin",
			});

			if (!response.ok) {
				toast.error("Đăng xuất không thành công, vui lòng thử lại");
				return;
			}

			router.replace("/admin/login");
		} catch (error) {
			toast.error("Đã có lỗi xảy ra, vui lòng thử lại");
		} finally {
			setLoggingOut(false);
		}
	};

	const items: MenuProps['items'] = [
		{
			label: (
				<a href="/admin/change-password" rel="noopener noreferrer" className="flex items-center gap-2">
					<Lock size={14} /> Đổi mật khẩu
				</a>
			),
			key: '0',
		},
		{
			label: (
				<div className="flex items-center gap-2">
					<LogOut size={14} /> {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
				</div>
			),
			key: '1',
			onClick: handleLogout,
			disabled: loggingOut,
		},
	];

	return <Dropdown menu={{ items }} trigger={['click']}>
		<a onClick={(e) => e.preventDefault()} className="flex items-center gap-1">
			<Avatar size={32} icon={<UserOutlined />} />
			<ChevronDown size={16} />
		</a>
	</Dropdown>
}
