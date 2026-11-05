import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/", destination: "/dashboard", permanent: false }];
  },
  async headers() {
    // 멤버 전용 도구: 벤치마크와 동일하게 검색 색인을 막는다.
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
};

export default nextConfig;
