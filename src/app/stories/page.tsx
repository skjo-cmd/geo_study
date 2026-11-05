import type { Metadata } from "next";
import { StoriesView } from "@/components/stories/StoriesView";

export const metadata: Metadata = { title: "성장 회고" };

export default function StoriesPage() {
  return <StoriesView />;
}
