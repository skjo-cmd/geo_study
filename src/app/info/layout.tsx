import { DocsSidebar } from "@/components/docs/DocsSidebar";

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs-layout">
      <DocsSidebar />
      <div>{children}</div>
    </div>
  );
}
