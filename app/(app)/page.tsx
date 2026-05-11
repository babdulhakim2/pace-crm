"use client";
import { TodayScreen } from "@/components/screens/today";
import { useUI } from "./client-layout";

export default function TodayPage() {
  const { openBiz } = useUI();
  return <TodayScreen openBiz={openBiz} freshVisitIds={new Set()} />;
}
