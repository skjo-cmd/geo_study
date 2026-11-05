import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card" style={{ maxWidth: 560, margin: "40px auto", textAlign: "center" }}>
      <p className="eyebrow">404</p>
      <h1 className="page-title">페이지를 찾지 못했어요</h1>
      <p className="page-lead" style={{ margin: "10px auto 20px" }}>
        주소가 바뀌었거나 삭제된 페이지예요.
      </p>
      <Link href="/dashboard" className="btn btn-primary">
        대시보드로 돌아가기
      </Link>
    </div>
  );
}
