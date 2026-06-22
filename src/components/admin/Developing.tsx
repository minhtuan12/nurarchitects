"use client";

import { useEffect, useState } from "react";
import { Button, Progress } from "antd";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Settings } from "lucide-react";

const TASKS = [
	{ label: "Thiết kế UI", done: true },
	{ label: "Backend API", done: true },
	{ label: "Testing", done: false },
];

const PROGRESS = 68;

export default function Developing() {
	const router = useRouter();

	return (
		<div className="h-full flex items-center justify-center bg-[#f7f5ef] px-4">
			<div className="text-center w-full max-w-md">

				{/* Animated icon */}
				<div className="flex justify-center mb-8">
					<div className="relative w-28 h-28 flex items-center justify-center">
						{/* Outer rotating ring */}
						<div
							className="absolute inset-0 rounded-full border border-dashed border-[#7F77DD]"
							style={{ animation: "spin 8s linear infinite" }}
						/>
						{/* Inner counter-rotating ring */}
						<div
							className="absolute inset-4 rounded-full border border-dashed border-[#AFA9EC]"
							style={{ animation: "spin 5s linear infinite reverse" }}
						/>
						{/* Center icon */}
						<div
							className="z-10 text-[#534AB7]"
							style={{ animation: "float 3s ease-in-out infinite" }}
						>
							<Settings size={36} strokeWidth={1.5} />
						</div>
					</div>
				</div>

				{/* Heading */}
				<h1 className="text-xl font-medium text-[#2C2C2A] mb-2">
					Tính năng đang được phát triển
				</h1>
				<p className="text-sm text-[#5F5E5A] leading-relaxed mb-8">
					Chúng tôi đang nỗ lực hoàn thiện tính năng này.
					<br />
					Vui lòng quay lại sau để trải nghiệm.
				</p>

				{/* Loading dots */}
				<div className="flex items-center justify-center gap-1.5 text-sm text-[#888780] mb-8">
					<span>Đang xử lý</span>
					{[0, 0.2, 0.4].map((delay, i) => (
						<span
							key={i}
							className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] inline-block"
							style={{ animation: `pulse-dot 1.4s ease-in-out ${delay}s infinite` }}
						/>
					))}
				</div>
			</div>

			<style>{`
		@keyframes spin {
		  from { transform: rotate(0deg); }
		  to { transform: rotate(360deg); }
		}
		@keyframes float {
		  0%, 100% { transform: translateY(0); }
		  50% { transform: translateY(-8px); }
		}
		@keyframes pulse-dot {
		  0%, 100% { opacity: 1; }
		  50% { opacity: 0.2; }
		}
	  `}</style>
		</div>
	);
}
