'use client'

import { Avatar, Dropdown, MenuProps } from "antd";
import { ChevronDown, Lock, LogOut } from "lucide-react";
import {
	UserOutlined,
} from "@ant-design/icons";

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
			<a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
				<LogOut size={14} /> Đăng xuất
			</a>
		),
		key: '1',
	},
];

export default function AdminMenu() {
	return <Dropdown menu={{ items }} trigger={['click']}>
		<a onClick={(e) => e.preventDefault()} className="flex items-center gap-1">
			<Avatar size={32} icon={<UserOutlined />} />
			<ChevronDown size={16} />
		</a>
	</Dropdown>
}