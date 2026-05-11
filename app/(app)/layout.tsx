import { requireAuth } from "@/lib/auth/guards";
import { fetchUserData } from "@/app/actions/data";
import { ClientLayout } from "./client-layout";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await requireAuth();
  const data = await fetchUserData(userId);
  return <ClientLayout initialData={data}>{children}</ClientLayout>;
}
