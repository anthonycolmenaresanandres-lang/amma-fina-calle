import type { ReactNode } from "react";
import { requireInternalAdmin } from "@/lib/auth/internal-admin";

export const dynamic = "force-dynamic";

export default async function CustomersLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireInternalAdmin();

  return children;
}
