import type { Metadata } from "next";
import { LinksView } from "@/components/links/LinksView";

export const metadata: Metadata = { title: "링크 모음" };

export default function LinksPage() {
  return <LinksView />;
}
