"use client";
import { PipelineScreen } from "@/components/screens/pipeline";
import { useUI } from "../client-layout";

export default function PipelinePage() {
  const { openBiz } = useUI();
  return <PipelineScreen openBiz={openBiz} />;
}
