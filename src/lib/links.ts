export type ResourceCategory = "docs" | "console" | "measure" | "trend" | "tools";

export const RESOURCE_CATEGORIES: { id: ResourceCategory; label: string }[] = [
  { id: "docs", label: "검색 문서" },
  { id: "console", label: "웹마스터 도구" },
  { id: "measure", label: "측정" },
  { id: "trend", label: "트렌드" },
  { id: "tools", label: "검사 도구" },
];

export type Resource = {
  id: string;
  category: ResourceCategory;
  title: string;
  description: string;
  url: string;
  keywords?: string[];
};

export const RESOURCES: Resource[] = [
  {
    id: "google-search-central",
    category: "docs",
    title: "Google Search Central",
    description: "Google 검색의 크롤링·색인·순위 원칙과 공식 권장사항.",
    url: "https://developers.google.com/search/docs?hl=ko",
    keywords: ["google", "seo", "문서"],
  },
  {
    id: "google-essentials",
    category: "docs",
    title: "Google 검색 Essentials",
    description: "검색에 노출되기 위한 기술·스팸·콘텐츠 최소 요건.",
    url: "https://developers.google.com/search/docs/essentials?hl=ko",
  },
  {
    id: "google-structured-data",
    category: "docs",
    title: "Google 구조화 데이터 가이드",
    description: "지원되는 구조화 데이터 유형과 리치 결과 조건.",
    url: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?hl=ko",
    keywords: ["schema", "json-ld"],
  },
  {
    id: "naver-seo-guide",
    category: "docs",
    title: "네이버 검색 가이드",
    description: "네이버 검색 노출과 사이트 최적화 기본 원칙.",
    url: "https://searchadvisor.naver.com/guide",
    keywords: ["naver", "네이버"],
  },
  {
    id: "bing-docs",
    category: "docs",
    title: "Bing Webmaster 문서",
    description: "Bing 검색 등록, URL 제출, API 문서.",
    url: "https://learn.microsoft.com/ko-kr/bingwebmaster/",
  },
  {
    id: "gsc",
    category: "console",
    title: "Google Search Console",
    description: "검색 실적, 색인 상태, 사이트맵 제출.",
    url: "https://search.google.com/search-console",
    keywords: ["서치콘솔", "gsc"],
  },
  {
    id: "naver-advisor",
    category: "console",
    title: "네이버 서치어드바이저",
    description: "네이버 수집·색인 현황과 사이트 진단.",
    url: "https://searchadvisor.naver.com/console/board",
  },
  {
    id: "bing-webmaster",
    category: "console",
    title: "Bing Webmaster Tools",
    description: "Bing(및 이를 쓰는 AI 검색)의 색인과 사이트맵 관리.",
    url: "https://www.bing.com/webmasters/",
  },
  {
    id: "daum-register",
    category: "console",
    title: "Daum 검색등록",
    description: "Daum 검색에 사이트 등록 요청.",
    url: "https://register.search.daum.net/index.daum",
  },
  {
    id: "ga4",
    category: "measure",
    title: "Google Analytics",
    description: "유입 경로와 전환 측정. AI 서비스 유입은 참조 도메인으로 분리해 보세요.",
    url: "https://analytics.google.com/",
    keywords: ["ga4", "분석"],
  },
  {
    id: "pagespeed",
    category: "measure",
    title: "PageSpeed Insights",
    description: "Core Web Vitals와 성능 개선 항목.",
    url: "https://pagespeed.web.dev/",
    keywords: ["성능", "속도"],
  },
  {
    id: "google-trends",
    category: "trend",
    title: "Google Trends",
    description: "주제별 검색 관심도 추이 비교.",
    url: "https://trends.google.com/trends/explore?geo=KR",
  },
  {
    id: "naver-datalab",
    category: "trend",
    title: "네이버 데이터랩",
    description: "네이버 검색어·쇼핑 트렌드.",
    url: "https://datalab.naver.com/",
  },
  {
    id: "rich-results",
    category: "tools",
    title: "Google 리치 결과 테스트",
    description: "구조화 데이터 오류와 리치 결과 적용 가능성 검사.",
    url: "https://search.google.com/test/rich-results?hl=ko",
  },
  {
    id: "schema-validator",
    category: "tools",
    title: "Schema.org Validator",
    description: "JSON-LD 등 Schema.org 마크업 문법 검사.",
    url: "https://validator.schema.org/",
  },
  {
    id: "og-debugger",
    category: "tools",
    title: "카카오 공유 디버거",
    description: "카카오톡 링크 미리보기(OG) 캐시 갱신과 확인.",
    url: "https://developers.kakao.com/tool/debugger/sharing",
    keywords: ["og", "오픈그래프", "카카오"],
  },
];

export const RESOURCE_MAP: Record<string, Resource> = Object.fromEntries(RESOURCES.map((r) => [r.id, r]));
