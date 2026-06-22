import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Upload } from 'antd';
import { useMessage } from '@/contexts/AdminMessageContext';

const { Dragger } = Upload;

const UploadSection = ({ action, multiple }: { action?: any; multiple?: boolean }) => {
	const noti = useMessage();

	const props: UploadProps = {
		name: 'file',
		multiple,
		action,
		onChange(info) {
			const { status } = info.file;
			if (status !== 'uploading') {
				console.log(info.file, info.fileList);
			}
			if (status === 'done') {
				noti.success(`File ${info.file.name} tải lên thành công.`);
			} else if (status === 'error') {
				noti.error(`File ${info.file.name} tải lên thất bại.`);
			}
		},
		onDrop(e) {
			console.log('Dropped files', e.dataTransfer.files);
		},
	};

	return (
		<>
			<Dragger {...props}>
				<p className="ant-upload-drag-icon">
					<InboxOutlined />
				</p>
				<p className="ant-upload-text">Nhấn vào hoặc thả file để tải lên</p>
				<p className="ant-upload-hint">
					Hỗ trợ ảnh/video
				</p>
			</Dragger>
		</>
	);
};

export default UploadSection;
