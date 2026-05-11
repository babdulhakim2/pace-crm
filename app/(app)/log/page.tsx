"use client";
import dynamic from "next/dynamic";

const LogVisitScreen = dynamic(
  () => import("@/components/screens/log-visit").then((m) => ({ default: m.LogVisitScreen })),
  { ssr: false },
);

export default function LogPage() {
  return <LogVisitScreen />;
}
