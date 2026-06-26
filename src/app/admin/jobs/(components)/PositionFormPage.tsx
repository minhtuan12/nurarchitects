"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	Button,
	Col,
	DatePicker,
	Form,
	Input,
	Row,
	Select,
	Tabs,
	Typography,
} from "antd";
import dayjs from "dayjs";
import Block from "@/components/Block";
import { adminFetch } from "@/components/admin/AdminShell";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useMessage } from "@/contexts/AdminMessageContext";
import { toSlug } from "@/helpers";

const { Title } = Typography;

// --- Enums (mirrors backend constants) ---
const workingTypes = [
	"part-time",
	"full-time",
	"remote",
	"collaborator",
] as const;
const jobStatuses = ["recruiting", "closed", "expired"] as const;

const WORKING_TYPE_OPTIONS = [
	{ label: "Bán thời gian", value: "part-time" },
	{ label: "Toàn thời gian", value: "full-time" },
	{ label: "Remote", value: "remote" },
	{ label: "Cộng tác viên", value: "collaborator" },
] as const;

const STATUS_OPTIONS = [
	{ label: "Đang tuyển", value: "recruiting" },
	{ label: "Đã đóng", value: "closed" },
	{ label: "Hết hạn", value: "expired" },
] as const;

type WorkingType = (typeof workingTypes)[number];
type JobStatus = (typeof jobStatuses)[number];

interface JobFormValues {
	title: string;
	slug: string;
	departmentId?: string | null;
	description?: string;
	requirements?: string;
	benefits?: string;
	workingTime?: string;
	workingType: WorkingType;
	workingAddress?: string;
	contacts?: string;
	salary?: string;
	deadline?: dayjs.Dayjs | null;
	status: JobStatus;
}

interface JobResponse {
	_id: string;
	title: string;
	slug: string;
	departmentId?: string | { _id?: string };
	description?: string;
	requirements?: string;
	benefits?: string;
	workingTime?: string;
	workingType: WorkingType;
	workingAddress?: string;
	contacts?: string;
	salary?: string;
	deadline?: string;
	status: JobStatus;
}

interface JobDetailResponse {
	item?: JobResponse;
	error?: string;
}

interface DepartmentOption {
	_id: string;
	name: string;
}

const defaultValues: JobFormValues = {
	title: "",
	slug: "",
	departmentId: null,
	description: "",
	requirements: "",
	benefits: "",
	workingTime: "",
	workingType: "full-time",
	workingAddress: "",
	contacts: "",
	salary: "",
	deadline: null,
	status: "recruiting",
};

const idToString = (value: unknown) => {
	if (!value) return undefined;
	if (typeof value === "string") return value;
	if (typeof value === "object" && "_id" in value) {
		return String((value as { _id?: unknown })._id);
	}
	return String(value);
};

function toJobFormValues(job: JobResponse) {
	return {
		...defaultValues,
		title: job.title ?? "",
		slug: job.slug ?? "",
		departmentId: idToString(job.departmentId) ?? null,
		description: job.description ?? "",
		requirements: job.requirements ?? "",
		benefits: job.benefits ?? "",
		workingTime: job.workingTime ?? "",
		workingType: job.workingType ?? "full-time",
		workingAddress: job.workingAddress ?? "",
		contacts: job.contacts ?? "",
		salary: job.salary ?? "",
		deadline: job.deadline ? dayjs(job.deadline) : null,
		status: job.status ?? "recruiting",
	} satisfies JobFormValues;
}

export default function PositionFormPage({
	mode,
}: {
	mode: "create" | "edit";
}) {
	const router = useRouter();
	const params = useParams<{ id?: string }>();
	const messageApi = useMessage();
	const [form] = Form.useForm<JobFormValues>();
	const [loading, setLoading] = useState(mode === "edit");
	const [saving, setSaving] = useState(false);
	const [departments, setDepartments] = useState<DepartmentOption[]>([]);
	const jobId = params?.id;

	useEffect(() => {
		const controller = new AbortController();

		adminFetch("/api/admin/departments?limit=100", {
			cache: "no-store",
			signal: controller.signal,
		})
			.then((response) => response.json())
			.then((payload) => {
				setDepartments(payload.items ?? []);
			})
			.catch((error) => {
				if (!controller.signal.aborted) {
					messageApi.error(
						error instanceof Error
							? error.message
							: "Không thể tải danh sách phòng ban",
					);
				}
			});

		return () => controller.abort();
	}, [messageApi]);

	useEffect(() => {
		if (mode !== "edit" || !jobId) {
			form.setFieldsValue(defaultValues);
			setLoading(false);
			return;
		}

		let cancelled = false;
		setLoading(true);
		adminFetch(`/api/admin/jobs/${jobId}`, { cache: "no-store" })
			.then((response) => response.json())
			.then((data: JobDetailResponse) => {
				if (cancelled) return;
				if (data.error || !data.item) {
					throw new Error(data.error ?? "Cannot load job");
				}
				form.setFieldsValue(toJobFormValues(data.item));
			})
			.catch(() =>
				messageApi.error("Không thể lấy thông tin vị trí tuyển dụng"),
			)
			.finally(() => !cancelled && setLoading(false));

		return () => {
			cancelled = true;
		};
	}, [form, jobId, messageApi, mode]);

	const handleValuesChange = useCallback(
		(changedValues: Partial<JobFormValues>) => {
			if (changedValues.title) {
				form.setFieldsValue({ slug: toSlug(changedValues.title) });
			}
		},
		[form],
	);

	const handleSubmit = async (values: JobFormValues) => {
		setSaving(true);
		try {
			const payload = {
				title: values.title,
				slug: toSlug(values.title),
				departmentId: values.departmentId || null,
				description: values.description ?? "",
				requirements: values.requirements ?? "",
				benefits: values.benefits ?? "",
				workingTime: values.workingTime ?? "",
				workingType: values.workingType,
				workingAddress: values.workingAddress ?? "",
				contacts: values.contacts ?? "",
				salary: values.salary ?? "",
				deadline: values.deadline ? values.deadline.toISOString() : null,
				status: values.status,
			};

			const response = await adminFetch(
				mode === "edit" ? `/api/admin/jobs/${jobId}` : "/api/admin/jobs",
				{
					method: mode === "edit" ? "PATCH" : "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(payload),
				},
			);
			const data = await response.json();
			if (!response.ok || data.error) {
				throw new Error(data.error ?? "Cannot save job");
			}

			messageApi.success(
				mode === "edit"
					? "Cập nhật vị trí tuyển dụng thành công"
					: "Tạo vị trí tuyển dụng thành công",
			);
			router.push("/admin/jobs/positions");
		} catch (error) {
			messageApi.error(
				error instanceof Error ? error.message : "Đã có lỗi xảy ra",
			);
		} finally {
			setSaving(false);
		}
	};

	// ── Tab items ─────────────────────────────────────────────────────────────

	const tabItems = [
		{
			key: "basic",
			label: "Thông tin cơ bản",
			children: (
				<Block>
					<Row gutter={70}>
						<Col xs={24} lg={12}>
							<Form.Item
								label="Tiêu đề vị trí"
								name="title"
								rules={[
									{
										required: true,
										message: "Nhập tiêu đề vị trí tuyển dụng",
									},
								]}
							>
								<Input placeholder="Ví dụ: Nhân viên kinh doanh" />
							</Form.Item>

							<Form.Item label="Phòng ban" name="departmentId">
								<Select
									allowClear
									placeholder="Chọn phòng ban"
									options={departments.map((department) => ({
										label: department.name,
										value: department._id,
									}))}
								/>
							</Form.Item>

							<Form.Item
								label="Loại hình làm việc"
								name="workingType"
								rules={[
									{
										required: true,
										message: "Chọn loại hình làm việc",
									},
								]}
							>
								<Select options={[...WORKING_TYPE_OPTIONS]} />
							</Form.Item>

							<Form.Item label="Thời gian làm việc" name="workingTime">
								<Input placeholder="Ví dụ: Thứ 2 - Thứ 6, 8h00 - 17h30" />
							</Form.Item>
						</Col>

						<Col xs={24} lg={12}>
							<Form.Item label="Mức lương" name="salary">
								<Input placeholder="Ví dụ: 10 - 15 triệu / tháng" />
							</Form.Item>

							<Form.Item label="Hạn nộp hồ sơ" name="deadline">
								<DatePicker
									className="w-full"
									format="DD/MM/YYYY"
									placeholder="Chọn hạn nộp hồ sơ"
								/>
							</Form.Item>

							<Form.Item
								label="Trạng thái"
								name="status"
								rules={[
									{
										required: true,
										message: "Chọn trạng thái",
									},
								]}
							>
								<Select options={[...STATUS_OPTIONS]} />
							</Form.Item>

							<Form.Item label="Địa điểm làm việc" name="workingAddress">
								<Input placeholder="Địa chỉ làm việc" />
							</Form.Item>
						</Col>
					</Row>

					<Row>
						<Col span={24}>
							<Form.Item label="Thông tin liên hệ" name="contacts">
								<SimpleEditor className="min-h-[400px]" />
							</Form.Item>
						</Col>
					</Row>

					<Form.Item name="slug" hidden>
						<Input />
					</Form.Item>
				</Block>
			),
		},
		{
			key: "description",
			label: "Mô tả công việc",
			children: (
				<Block>
					<Form.Item label="Mô tả công việc" name="description">
						<SimpleEditor className="min-h-[400px]" />
					</Form.Item>
				</Block>
			),
		},
		{
			key: "requirements",
			label: "Yêu cầu",
			children: (
				<Block>
					<Form.Item label="Yêu cầu" name="requirements">
						<SimpleEditor className="min-h-[400px]" />
					</Form.Item>
				</Block>
			),
		},
		{
			key: "benefits",
			label: "Quyền lợi",
			children: (
				<Block>
					<Form.Item label="Quyền lợi" name="benefits">
						<SimpleEditor className="min-h-[400px]" />
					</Form.Item>
				</Block>
			),
		},
	];

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className="flex flex-col gap-5">
			{/* Header */}
			<div className="flex items-center justify-between gap-3 px-1">
				<Title level={4} className="!mb-0">
					{mode === "edit"
						? `Cập nhật vị trí ${form.getFieldValue("title") ?? ""}`
						: "Tạo vị trí tuyển dụng mới"}
				</Title>
				<div className="flex justify-end gap-3">
					<Button onClick={() => router.push("/admin/jobs/positions")} className="h-[38px]">
						Quay lại
					</Button>
					<Button
						type="primary"
						loading={saving}
						onClick={() => form.submit()}
						className="h-[38px]"
					>
						{mode === "edit" ? "Lưu" : "Tạo vị trí"}
					</Button>
				</div>
			</div>

			<Form<JobFormValues>
				form={form}
				layout="vertical"
				initialValues={defaultValues}
				disabled={loading || saving}
				onValuesChange={handleValuesChange}
				onFinish={handleSubmit}
				className="[&_.ant-form-item-label>label]:font-semibold"
			>
				<Tabs
					type="card"
					items={tabItems}
					className="[&_.ant-tabs-content-holder]:pt-4 custom-tabs"
				/>
			</Form>
		</div>
	);
}
