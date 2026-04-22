import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/server-auth";

export default async function DashboardRootPage(): Promise<never> {
  const user = await requireUser();
  if (user.role === "super_admin") {
    redirect("/dashboard/super-admin");
  }
  if (user.role === "admin") {
    redirect("/dashboard/admin");
  }
  redirect("/dashboard/agent");
}
