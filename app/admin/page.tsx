import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/admin";
import { PainelAdminExclusivo } from "@/components/admin/painel-admin";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminPage() {
  const admin = await exigirAdmin();
  if (!admin) redirect("/login");
  return <PainelAdminExclusivo />;
}