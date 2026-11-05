import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 대시보드는 브라우저 저장소 기반의 클라이언트 중심 앱이므로
  // Cache Components(정적 셸 프리렌더 제약)를 사용하지 않는다.
  cacheComponents: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
