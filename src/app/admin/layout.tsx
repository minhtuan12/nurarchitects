import { AdminShell } from "@/components/admin/AdminShell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'NUR Architects Admin',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
