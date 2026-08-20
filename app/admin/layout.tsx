import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AdminShell } from "./_components/AdminShell";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <AdminShell session={user}>{children}</AdminShell>;
}
