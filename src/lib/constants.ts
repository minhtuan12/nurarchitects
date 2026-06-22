import { BookOpenText, BriefcaseBusiness, Building2, Handshake, Home, Layers, Newspaper, NotebookTabs, ScanSearch } from "lucide-react";

export const ADMIN_ROUTES = [
	// { label: "Overview", href: "/admin", icon: LayoutDashboard },
	{ key: 'homepage', label: "Quản lý Trang chủ", href: "/admin/homepage", icon: Home },
	{ key: 'projects', label: "Quản lý Công trình/Dự án", href: "/admin/projects", icon: Building2 },
	{ key: 'activities', label: "Quản lý Lĩnh vực hoạt động", href: "/admin/activities", icon: Layers },
	{ key: 'introduction', label: "Quản lý Giới thiệu", href: "/admin/introduction", icon: BookOpenText },
	{ key: 'news', label: "Quản lý Tin tức", href: "/admin/news", icon: Newspaper },
	{ key: 'contact', label: "Quản lý Liên hệ", href: "/admin/contact", icon: NotebookTabs },
	{ key: 'cooperations', label: "Quản lý Hợp tác", href: "/admin/cooperations", icon: Handshake },
	{ key: 'jobs', label: "Quản lý Tuyển dụng", href: "/admin/jobs", icon: BriefcaseBusiness },
	{ key: 'seo', label: "Quản lý SEO", href: "/admin/seo", icon: ScanSearch },
];

export const DEFAULT_PAGE_SIZE = 20;
export const SEARCH_DEBOUNCE_MS = 400;

export const STATUS_OPTIONS = [
	{ value: "published", label: "Công khai" },
	{ value: "draft", label: "Nháp" },
];
