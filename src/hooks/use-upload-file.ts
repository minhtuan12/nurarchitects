import { useMessage } from '@/contexts/AdminMessageContext';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

type UploadResponse = {
    url: string;
    [key: string]: any;
};

export async function uploadFileApi(formData: FormData): Promise<UploadResponse> {
    const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });

    if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || 'Đã có lỗi xảy ra');
    }

    return response.json();
}

export const useUploadFile = () => {
    const [progress, setProgress] = useState(0);
    const noti = useMessage();

    const {
        mutate: uploadFile,
        data,
        isPending: loading,
        isSuccess,
        error,
    } = useMutation({
        mutationFn: uploadFileApi,
        onError: (error) => {
            noti.error(error?.message || 'Đã có lỗi xảy ra');
        }
    });

    return {
        uploadFile,
        loading,
        progress,
        url: data?.url ?? null,
        isSuccess,
        error: (error as Error)?.message ?? null,
    };
};
