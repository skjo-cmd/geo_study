import type { Metadata } from "next";
import { SiteCheckView } from "@/components/site-check/SiteCheckView";

export const metadata: Metadata = { title: "사이트 체크" };

export default function SiteCheckPage() {
  return <SiteCheckView />;
}
