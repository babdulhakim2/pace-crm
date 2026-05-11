"use client";
import dynamic from "next/dynamic";
import { useUI } from "../client-layout";

const MapScreen = dynamic(
  () => import("@/components/screens/map").then((m) => ({ default: m.MapScreen })),
  { ssr: false },
);

export default function MapPage() {
  const { openBiz } = useUI();
  return <MapScreen openBiz={openBiz} />;
}
