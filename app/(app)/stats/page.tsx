"use client";
import dynamic from "next/dynamic";

const StatsScreen = dynamic(
  () => import("@/components/screens/stats").then((m) => ({ default: m.StatsScreen })),
  { ssr: false },
);

export default function StatsPage() {
  return <StatsScreen />;
}
