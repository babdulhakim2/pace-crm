"use client";
import { useSearchParams } from "next/navigation";
import { AuditScreen } from "@/components/screens/audit";
import { useUI } from "../client-layout";

export default function TrailPage() {
  const { openBiz } = useUI();
  const searchParams = useSearchParams();
  const areaFilter = searchParams.get("area");
  return <AuditScreen openBiz={openBiz} areaFilter={areaFilter} />;
}
