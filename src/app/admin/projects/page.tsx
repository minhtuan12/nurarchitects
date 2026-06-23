"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Button,
    Input,
    Modal,
    Space,
    Switch,
    Table,
    Tag,
    Typography,
} from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Block from "@/components/Block";
import { adminFetch } from "@/components/admin/AdminShell";
import { useMessage } from "@/contexts/AdminMessageContext";
import { EBuildPlan, type BuildPlan, type IProject } from "@/types/project";
import NoData from "@/components/NoData";
import { SquarePen, Trash } from "lucide-react";
import { SortOrder } from "@/types/shared";
import { SorterResult } from "antd/es/table/interface";
import { BUILD_PLAN_OPTIONS, DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS, STATUS_OPTIONS } from "@/lib/constants";

const { Text } = Typography;

type ProjectRow = Omit<IProject, "createdAt" | "updatedAt"> & {
    _id: string;
    createdAt?: string;
    updatedAt?: string;
};

interface ProjectsResponse {
    items: ProjectRow[];
    page: number;
    limit: number;
    total: number;
}

interface ProjectFilters {
    status?: string;
    category?: BuildPlan;
    isFeatured?: boolean;
    implementationYear?: number;
}

const FEATURED_OPTIONS = [
    { value: "true", label: "Nổi bật" },
    { value: "false", label: "Không nổi bật" },
];

const shortId = (value: unknown) => {
    if (!value) return "-";
    const id = String(value);
    return id.length > 12 ? `${id.slice(0, 8)}...` : id;
};

export default function ProjectsAdminPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const messageApi = useMessage();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: DEFAULT_PAGE_SIZE,
    });

    // --- Search (debounced) ---
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            // reset về trang 1 mỗi khi search thay đổi
            setPagination((current) => ({ ...current, current: 1 }));
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // --- Filters ---
    const [filters, setFilters] = useState<ProjectFilters>({});

    const handleFilterChange = useCallback(
        <K extends keyof ProjectFilters>(key: K, value: ProjectFilters[K]) => {
            setFilters((current) => ({ ...current, [key]: value }));
            setPagination((current) => ({ ...current, current: 1 }));
        },
        [],
    );

    // --- Sort (chỉ áp dụng cho cột Diện tích) ---
    const [sortState, setSortState] = useState<{
        sortBy?: string;
        sortOrder?: SortOrder;
    }>({});

    const currentPage = pagination.current;
    const pageSize = pagination.pageSize;

    const queryKey = useMemo(
        () => [
            "admin-projects",
            currentPage,
            pageSize,
            search,
            filters,
            sortState,
        ],
        [currentPage, pageSize, search, filters, sortState],
    );

    const { data, isFetching } = useQuery({
        queryKey,
        queryFn: async (): Promise<ProjectsResponse> => {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(pageSize),
            });

            if (search) params.set("search", search);
            if (filters.status) params.set("status", filters.status);
            if (filters.category) params.set("category", filters.category);
            if (filters.isFeatured !== undefined) {
                params.set("isFeatured", String(filters.isFeatured));
            }
            if (filters.implementationYear !== undefined) {
                params.set(
                    "implementationYear",
                    String(filters.implementationYear),
                );
            }
            if (sortState.sortBy && sortState.sortOrder) {
                params.set("sortBy", sortState.sortBy);
                params.set(
                    "sortOrder",
                    sortState.sortOrder === "ascend" ? "asc" : "desc",
                );
            }

            const response = await adminFetch(
                `/api/admin/projects?${params.toString()}`,
                { cache: "no-store" },
            );
            const payload = await response.json();
            if (!response.ok || payload.error) {
                throw new Error(payload.error ?? "Cannot load projects");
            }
            return {
                items: payload.items ?? [],
                page: payload.page ?? currentPage,
                limit: payload.limit ?? pageSize,
                total: payload.total ?? 0,
            };
        },
    });

    const projects = data?.items ?? [];
    const total = data?.total ?? 0;

    // Danh sách năm thực hiện để hiển thị trong Select, lấy từ dữ liệu hiện có
    // (tránh hardcode năm cố định, tự cập nhật khi có năm mới trong dữ liệu)
    const yearOptions = useMemo(() => {
        const years = new Set<number>();
        projects.forEach((project) => {
            if (typeof project.implementationYear === "number") {
                years.add(project.implementationYear);
            }
        });
        if (filters.implementationYear !== undefined) {
            years.add(filters.implementationYear);
        }
        return Array.from(years)
            .sort((a, b) => b - a)
            .map((year) => ({ value: year, label: String(year) }));
    }, [projects, filters.implementationYear]);

    const confirmDelete = useCallback(
        (record: ProjectRow) => {
            Modal.confirm({
                title: "Xóa dự án?",
                content: `Bạn có chắc chắn muốn xóa ${record.name}?`,
                okText: "Xóa",
                okButtonProps: {
                    danger: true,
                    loading: deletingId === record._id,
                },
                cancelText: "Hủy",
                onOk: async () => {
                    setDeletingId(record._id);
                    try {
                        const response = await adminFetch(
                            `/api/admin/projects/${record._id}`,
                            {
                                method: "DELETE",
                            },
                        );
                        const data = await response.json();
                        if (!response.ok || data.error) {
                            throw new Error(
                                data.error ?? "Cannot delete project",
                            );
                        }
                        messageApi.success("Đã xóa dự án");
                        const nextPage =
                            projects.length === 1 && currentPage > 1
                                ? currentPage - 1
                                : currentPage;
                        if (nextPage !== currentPage) {
                            setPagination((current) => ({
                                ...current,
                                current: nextPage,
                            }));
                        } else {
                            await queryClient.invalidateQueries({
                                queryKey: ["admin-projects"],
                            });
                        }
                    } catch {
                        messageApi.error("Không thể xóa dự án");
                        throw new Error("Delete project failed");
                    } finally {
                        setDeletingId(null);
                    }
                },
            });
        },
        [currentPage, deletingId, messageApi, projects.length, queryClient],
    );

    const [togglingId, setTogglingId] = useState<string | null>(null);
    const handleToggleFeatured = useCallback(
        async (record: ProjectRow, checked: boolean) => {
            setTogglingId(record._id);

            // optimistic update: cập nhật cache ngay, rollback nếu lỗi
            const previousData = queryClient.getQueryData<ProjectsResponse>([
                "admin-projects",
                currentPage,
                pageSize,
            ]);

            queryClient.setQueryData<ProjectsResponse | undefined>(
                ["admin-projects", currentPage, pageSize],
                (current) =>
                    current
                        ? {
                            ...current,
                            items: current.items.map((item) =>
                                item._id === record._id
                                    ? { ...item, isFeatured: checked }
                                    : item,
                            ),
                        }
                        : current,
            );

            try {
                const response = await adminFetch(
                    `/api/admin/projects/${record._id}`,
                    {
                        method: "PATCH",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ isFeatured: checked }),
                    },
                );
                const data = await response.json();
                if (!response.ok || data.error) {
                    throw new Error(data.error ?? "Cannot update project");
                }
                messageApi.success(
                    checked
                        ? "Đã cập nhật dự án nổi bật"
                        : "Đã bỏ dự án nổi bật",
                );
            } catch {
                // rollback nếu lỗi
                queryClient.setQueryData(
                    ["admin-projects", currentPage, pageSize],
                    previousData,
                );
                messageApi.error("Không thể cập nhật trạng thái nổi bật");
            } finally {
                setTogglingId(null);
            }
        },
        [currentPage, messageApi, pageSize, queryClient],
    );

    const columns = useMemo<ColumnsType<ProjectRow>>(
        () => [
            {
                title: "Tên công trình/dự án",
                dataIndex: "name",
                key: "name",
                width: 220,
                minWidth: 220,
                fixed: "left",
                render: (value: string, record) => (
                    <div className="flex flex-col gap-1">
                        <Text strong>{value}</Text>
                        <Text type="secondary" className="text-xs">
                            {record.slug}
                        </Text>
                    </div>
                ),
            },
            {
                title: "Địa chỉ",
                dataIndex: "address",
                key: "address",
                width: 160,
                minWidth: 160,
                ellipsis: true,
                render: (value?: string) => value || "-",
            },
            {
                title: "Diện tích",
                dataIndex: "area",
                key: "area",
                width: 110,
                minWidth: 110,
                align: "center",
                sorter: true,
                sortOrder:
                    sortState.sortBy === "area"
                        ? sortState.sortOrder
                        : undefined,
                render: (value?: number) =>
                    typeof value === "number" ? `${value} m²` : "-",
            },
            {
                title: "Năm thực hiện",
                dataIndex: "implementationYear",
                key: "implementationYear",
                width: 140,
                minWidth: 140,
                align: "center",
                filterMultiple: false,
                filters: yearOptions.map((option) => ({
                    text: option.label,
                    value: option.value,
                })),
                filteredValue: filters.implementationYear
                    ? [filters.implementationYear]
                    : null,
                render: (value?: number) => value ?? "-",
            },
            {
                title: "Trạng thái",
                dataIndex: "status",
                key: "status",
                width: 120,
                minWidth: 120,
                align: "center",
                filterMultiple: false,
                filters: STATUS_OPTIONS.map((option) => ({
                    text: option.label,
                    value: option.value,
                })),
                filteredValue: filters.status ? [filters.status] : null,
                render: (value: string) => (
                    <Tag
                        color={value === "published" ? "green" : "default"}
                        variant="outlined"
                    >
                        {value === "published" ? "Công khai" : "Nháp"}
                    </Tag>
                ),
            },
            {
                title: "Loại công trình",
                dataIndex: "category",
                key: "category",
                align: "center",
                width: 180,
                minWidth: 180,
                filterMultiple: false,
                filters: BUILD_PLAN_OPTIONS.map((option) => ({
                    text: option.label,
                    value: option.value,
                })),
                filteredValue: filters.category ? [filters.category] : null,
                render: (value: BuildPlan) => (
                    <Tag
                        color={EBuildPlan[value].color}
                        variant="outlined"
                        className="!whitespace-normal !break-words !leading-snug text-center"
                        style={{ maxWidth: "100%" }}
                    >
                        {EBuildPlan[value].label}
                    </Tag>
                ),
            },
            {
                title: "Nổi bật",
                dataIndex: "isFeatured",
                key: "isFeatured",
                align: "center",
                width: 100,
                minWidth: 100,
                filterMultiple: false,
                filters: FEATURED_OPTIONS.map((option) => ({
                    text: option.label,
                    value: option.value,
                })),
                filteredValue:
                    filters.isFeatured !== undefined
                        ? [String(filters.isFeatured)]
                        : null,
                render: (value: boolean, record) => (
                    <Switch
                        checked={value}
                        loading={togglingId === record._id}
                        onChange={(checked) =>
                            handleToggleFeatured(record, checked)
                        }
                    />
                ),
            },
            {
                title: "Thao tác",
                key: "actions",
                width: 100,
                minWidth: 100,
                fixed: "right",
                align: "center",
                render: (_, record) => (
                    <Space className="gap-4">
                        <SquarePen
                            onClick={() =>
                                router.push(`/admin/projects/${record._id}`)
                            }
                            className="cursor-pointer"
                            color="#2b7fff"
                            width={18}
                        />
                        <Trash
                            onClick={() => confirmDelete(record)}
                            className="cursor-pointer"
                            color="red"
                            width={18}
                        />
                    </Space>
                ),
            },
        ],
        [
            confirmDelete,
            filters,
            handleToggleFeatured,
            router,
            sortState,
            togglingId,
            yearOptions,
        ],
    );

    const handleTableChange = (
        nextPagination: TablePaginationConfig,
        tableFilters: Record<string, (string | number | boolean)[] | null>,
        sorter: SorterResult<ProjectRow> | SorterResult<ProjectRow>[],
    ) => {
        setPagination({
            current: nextPagination.current ?? 1,
            pageSize: nextPagination.pageSize ?? DEFAULT_PAGE_SIZE,
        });

        const statusValue = tableFilters.status?.[0];
        const categoryValue = tableFilters.category?.[0];
        const featuredValue = tableFilters.isFeatured?.[0];
        const yearValue = tableFilters.implementationYear?.[0];

        setFilters({
            status: statusValue !== undefined ? String(statusValue) : undefined,
            category:
                categoryValue !== undefined
                    ? (String(categoryValue) as BuildPlan)
                    : undefined,
            isFeatured:
                featuredValue !== undefined
                    ? String(featuredValue) === "true"
                    : undefined,
            implementationYear:
                yearValue !== undefined ? Number(yearValue) : undefined,
        });

        const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
        if (activeSorter?.field === "area" && activeSorter.order) {
            setSortState({
                sortBy: "area",
                sortOrder: activeSorter.order,
            });
        } else {
            setSortState({});
        }
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between px-1">
                <Input
                    placeholder="Tìm kiếm theo tên dự án"
                    prefix={<SearchOutlined className="text-gray-400 mr-1" />}
                    allowClear
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="max-w-xs h-10 [&_.ant-input]:h-full"
                />
                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => router.push("/admin/projects/create")}
                >
                    Thêm
                </Button>
            </div>
            <Block>
                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={projects}
                    loading={isFetching}
                    scroll={{ x: 1680, y: 100 }}
                    pagination={{
                        current: currentPage,
                        pageSize,
                        total,
                        showSizeChanger: false,
                        showTotal: (total) => `${total} dự án`,
                    }}
                    locale={{
                        emptyText: (
                            <NoData description="Chưa có công trình/dự án nào" />
                        ),
                    }}
                    onChange={handleTableChange as any}
                    className="[&_.ant-pagination]:mb-0 [&_.ant-pagination]:mt-6 [&_.ant-table-body]:min-h-[calc(100vh-330px)] [&_.ant-table-body]:max-h-[calc(100vh-330px)]"
                />
            </Block>
        </div>
    );
}
