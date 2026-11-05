import type { Metadata } from "next";
import { LogsView } from "@/components/logs/LogsView";

export const metadata: Metadata = { title: "성장 기록" };

export default function LogsPage() {
  return <LogsView />;
}
