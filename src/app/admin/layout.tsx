import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
