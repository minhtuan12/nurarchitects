import { EArea, EContactFormStatus } from "@/types/contact";
import { ECooperationFormStatus, ECooperationService } from "@/types/cooperation";
import { EBuildPlan } from "@/types/project";
import {
    Blocks,
    BookOpenText,
    BriefcaseBusiness,
    Building2,
    Columns3,
    FileUser,
    Handshake,
    Home,
    Info,
    Layers,
    ListCollapse,
    ListOrdered,
    Newspaper,
    NotebookTabs,
    ScanSearch,
    Settings,
    UserSearch,
} from "lucide-react";

export const ADMIN_ROUTES = [
    // { label: "Overview", href: "/admin", icon: LayoutDashboard },
    {
        key: "homepage",
        label: "Quản lý Trang chủ",
        href: "/admin/homepage",
        icon: Home,
    },
    {
        key: "projects",
        label: "Quản lý Công trình/Dự án",
        href: "/admin/projects",
        icon: Building2,
    },
    {
        key: "activities",
        label: "Lĩnh vực hoạt động",
        href: "/admin/activities",
        icon: Layers,
        children: [
            {
                key: "activity-content",
                label: "Nội dung",
                href: "/admin/activities/content",
                icon: Info,
            },
            {
                key: "activity-list",
                label: "Danh sách Lĩnh vực",
                href: "/admin/activities/list",
                icon: ListOrdered,
            },
        ],
    },
    {
        key: "introduction",
        label: "Quản lý Giới thiệu",
        href: "/admin/introduction",
        icon: BookOpenText,
        children: [
            {
                key: "content",
                label: "Quản lý Nội dung",
                href: "/admin/introduction/content",
                icon: Columns3,
            },
            {
                key: "history",
                label: "Lịch sử, Tầm nhìn, ...",
                href: "/admin/introduction/history",
                icon: BookOpenText,
            },
            {
                key: "members",
                label: "Quản lý nhân sự",
                href: "/admin/introduction/members",
                icon: FileUser,
            },
            {
                key: "introduction-seo",
                label: "Quản lý SEO",
                href: "/admin/introduction/seo",
                icon: ScanSearch,
            },
        ],
    },
    {
        key: "news",
        label: "Quản lý Tin tức",
        href: "/admin/news",
        icon: Newspaper,
        children: [
            {
                key: "categories",
                label: "Quản lý Danh mục",
                href: "/admin/news/categories",
                icon: Columns3,
            },
            {
                key: "list",
                label: "Danh sách tin tức",
                href: "/admin/news/list",
                icon: ListOrdered,
            },
        ],
    },
    {
        key: "contact",
        label: "Liên hệ",
        href: "/admin/contact",
        icon: NotebookTabs,
        children: [
            {
                key: "info",
                label: "Thông tin liên hệ",
                href: "/admin/contact/info",
                icon: Info,
            },
            {
                key: "consultings",
                label: "Danh sách yêu cầu tư vấn",
                href: "/admin/contact/consultings",
                icon: ListOrdered,
            },
        ],
    },
    {
        key: "cooperations",
        label: "Quản lý Hợp tác",
        href: "/admin/cooperations",
        icon: Handshake,
        children: [
            {
                key: "cooperation-content",
                label: "Nội dung",
                href: "/admin/cooperations/content",
                icon: Info,
            },
            {
                key: "partners",
                label: "Danh sách đăng ký hợp tác",
                href: "/admin/cooperations/partners",
                icon: ListOrdered,
            },
        ],
    },
    {
        key: "jobs",
        label: "Quản lý Tuyển dụng",
        href: "/admin/jobs",
        icon: BriefcaseBusiness,
        children: [
            {
                key: "departments",
                label: "Quản lý phòng ban",
                href: "/admin/jobs/departments",
                icon: Blocks,
            },
            {
                key: "positions",
                label: "Vị trí tuyển dụng",
                href: "/admin/jobs/positions",
                icon: UserSearch,
            },
            {
                key: "applicants",
                label: "Danh sách ứng viên",
                href: "/admin/jobs/applicants",
                icon: FileUser,
            },
        ],
    },
    { key: "global-settings", label: "Cài đặt chung", href: "/admin/settings", icon: Settings },
    // { key: "seo", label: "Quản lý SEO", href: "/admin/seo", icon: ScanSearch },
];

export const DEFAULT_PAGE_SIZE = 20;
export const SEARCH_DEBOUNCE_MS = 400;

export const STATUS_OPTIONS = [
    { value: "published", label: "Công khai" },
    { value: "draft", label: "Nháp" },
];

export const BUILD_PLAN_OPTIONS = Object.entries(EBuildPlan).map(([value, meta]) => ({
    value,
    label: meta.label,
}));

export const BUILD_AREA_OPTIONS = Object.entries(EArea).map(([value, meta]) => ({
    value,
    label: meta.label,
}));

export const CONTACT_FORM_STATUS_OPTIONS = Object.entries(EContactFormStatus).map(([value, meta]) => ({
    value,
    label: meta.label,
}));

export const COOPERATION_FORM_STATUS_OPTIONS = Object.values(ECooperationFormStatus).map(
    ({ value, label }) => ({ value, label }),
);

export const COOPERATION_SERVICE_OPTIONS = Object.values(ECooperationService).map(
    ({ value, label }) => ({ value, label }),
);
