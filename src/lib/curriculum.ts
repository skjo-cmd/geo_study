/**
 * 프로그램 커리큘럼 정의.
 * 주차 수, 각 주차의 제목·목표·체크리스트는 전부 여기서만 정의한다.
 * 주차 계산(lib/week.ts)은 이 데이터의 길이를 상한으로 사용하므로
 * 커리큘럼 밖의 주차는 어디에서도 만들어지지 않는다.
 */

export type ChecklistItem = {
  id: string;
  title: string;
  /** 선택 항목은 진행률 분모에서 제외하지 않는다. 표시만 다르게 한다. */
  optional?: boolean;
  /** 예상 소요 시간(분) */
  minutes?: number;
  /** 관련 가이드 slug (lib/docs.ts) */
  doc?: string;
};

export type ChecklistGroup = {
  id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
};

export type Week = {
  /** 1부터 시작 */
  number: number;
  /** 영문 소제목 (eyebrow) */
  eyebrow: string;
  title: string;
  /** 이번 주 한 줄 목표 */
  goal: string;
  /** 대시보드 인사말 아래 설명 */
  intro: string;
  groups: ChecklistGroup[];
};

export type Program = {
  id: string;
  name: string;
  /** 1주차가 시작되는 날짜(월요일 권장), YYYY-MM-DD */
  startDate: string;
  weeks: Week[];
};

export const PROGRAM: Program = {
  id: "startup-geo-01",
  name: "창업기업 GEO/SEO 스터디 1기",
  startDate: process.env.NEXT_PUBLIC_PROGRAM_START ?? "2026-11-02",
  weeks: [
    {
      number: 1,
      eyebrow: "BASELINE",
      title: "기준선 만들기",
      goal: "우리 사이트가 지금 검색과 AI에 어떻게 보이는지 숫자로 남기기",
      intro:
        "개선 전 상태를 기록해 두지 않으면 4주 뒤 무엇이 바뀌었는지 증명할 수 없어요. 이번 주는 측정 도구를 연결하고 현재 점수를 적어두는 주간이에요.",
      groups: [
        {
          id: "w1-setup",
          title: "측정 준비",
          items: [
            {
              id: "w1-pick-site",
              title: "스터디 기간 동안 직접 수정할 수 있는 사이트 1개를 정했다",
              minutes: 15,
              doc: "choose-site",
            },
            {
              id: "w1-site-check",
              title: "사이트 체크 도구로 현재 점수를 확인하고 기록에 남겼다",
              minutes: 10,
            },
            {
              id: "w1-gsc",
              title: "Google Search Console에 사이트 소유권을 확인했다",
              minutes: 30,
              doc: "register-search-engines",
            },
            {
              id: "w1-naver",
              title: "네이버 서치어드바이저에 사이트를 등록했다",
              minutes: 20,
              doc: "register-search-engines",
            },
            {
              id: "w1-ga4",
              title: "GA4(또는 사용 중인 분석 도구)가 데이터를 수집하는지 확인했다",
              minutes: 20,
              optional: true,
              doc: "measure-baseline",
            },
          ],
        },
        {
          id: "w1-keywords",
          title: "리서치 키워드",
          description: "의미를 찾아보고 우리 사이트에 해당하는지 한 줄로 적어보세요.",
          items: [
            { id: "w1-k-seo-geo", title: "SEO · GEO · AEO의 차이" },
            { id: "w1-k-index", title: "크롤링 · 색인 · 노출의 차이" },
          ],
        },
      ],
    },
    {
      number: 2,
      eyebrow: "TECHNICAL FOUNDATION",
      title: "봇이 읽을 수 있는 사이트",
      goal: "검색엔진과 AI 크롤러가 막힘 없이 읽고 이해할 수 있게 기술 기반 정리하기",
      intro:
        "좋은 콘텐츠도 봇이 접근하지 못하면 존재하지 않는 것과 같아요. 이번 주는 접근 경로와 페이지 설명을 정리해요.",
      groups: [
        {
          id: "w2-tech",
          title: "기술 설정",
          items: [
            {
              id: "w2-sitemap",
              title: "sitemap.xml을 만들고 서치콘솔·서치어드바이저에 제출했다",
              minutes: 30,
              doc: "sitemap-robots",
            },
            {
              id: "w2-robots",
              title: "robots.txt가 핵심 페이지와 AI 크롤러를 차단하지 않는지 확인했다",
              minutes: 15,
              doc: "sitemap-robots",
            },
            {
              id: "w2-meta",
              title: "핵심 페이지 5개의 title · description · canonical을 점검했다",
              minutes: 40,
              doc: "page-metadata",
            },
            {
              id: "w2-og",
              title: "대표 페이지에 OG 제목·설명·이미지를 설정했다",
              minutes: 20,
              doc: "page-metadata",
            },
            {
              id: "w2-schema",
              title: "Organization 또는 LocalBusiness 구조화 데이터를 추가했다",
              minutes: 40,
              optional: true,
              doc: "structured-data",
            },
          ],
        },
        {
          id: "w2-keywords",
          title: "리서치 키워드",
          items: [
            { id: "w2-k-canonical", title: "canonical 태그" },
            { id: "w2-k-og", title: "오픈 그래프(Open Graph)" },
            { id: "w2-k-llms", title: "llms.txt" },
          ],
        },
      ],
    },
    {
      number: 3,
      eyebrow: "CONTENT",
      title: "고객 질문에 답하는 페이지",
      goal: "고객이 실제로 검색하고 AI에게 묻는 질문 하나에 정확히 답하는 페이지 만들기",
      intro:
        "AI는 브랜드 소개보다 '질문에 답하는 페이지'를 인용해요. 이번 주는 고객 질문을 모으고 그중 하나를 독립된 페이지로 만들어요.",
      groups: [
        {
          id: "w3-content",
          title: "콘텐츠",
          items: [
            {
              id: "w3-questions",
              title: "고객이 자주 묻는 질문 10개를 모았다",
              minutes: 40,
              doc: "customer-questions",
            },
            {
              id: "w3-page",
              title: "질문 1개에 답하는 정보성 페이지를 발행했다",
              minutes: 90,
              doc: "customer-questions",
            },
            {
              id: "w3-internal-link",
              title: "새 페이지와 서비스 페이지를 내부 링크로 연결했다",
              minutes: 15,
            },
            {
              id: "w3-author",
              title: "작성자·회사 정보(누가, 어떤 근거로)를 페이지에 표시했다",
              minutes: 20,
              optional: true,
            },
          ],
        },
        {
          id: "w3-keywords",
          title: "리서치 키워드",
          items: [
            { id: "w3-k-intent", title: "검색 인텐트(Search Intent)" },
            { id: "w3-k-eeat", title: "E-E-A-T" },
            { id: "w3-k-internal", title: "내부 링크 구조" },
          ],
        },
      ],
    },
    {
      number: 4,
      eyebrow: "GEO MEASUREMENT",
      title: "AI 답변 속 우리 브랜드",
      goal: "질문 세트로 AI 답변을 측정하고 4주의 변화를 회고로 남기기",
      intro:
        "노출 횟수보다 '어떤 맥락으로 추천되는가'가 중요해요. 같은 질문을 같은 기준으로 기록하면 다음 실험의 출발점이 생겨요.",
      groups: [
        {
          id: "w4-geo",
          title: "GEO 측정",
          items: [
            {
              id: "w4-question-set",
              title: "브랜드명을 넣지 않은 고객 질문 세트 5~10개를 만들었다",
              minutes: 30,
              doc: "geo-question-set",
            },
            {
              id: "w4-run",
              title: "AI 서비스 2곳 이상에서 질문 세트를 실행하고 결과를 표로 기록했다",
              minutes: 40,
              doc: "geo-question-set",
            },
            {
              id: "w4-compare",
              title: "1주차 사이트 체크 점수와 현재 점수를 비교했다",
              minutes: 10,
            },
            {
              id: "w4-retro",
              title: "성장 회고를 작성했다",
              minutes: 40,
            },
          ],
        },
        {
          id: "w4-keywords",
          title: "리서치 키워드",
          items: [
            { id: "w4-k-visibility", title: "AI Visibility" },
            { id: "w4-k-citation", title: "인용 가능성(Citability)" },
          ],
        },
      ],
    },
  ],
};

export function getWeek(program: Program, weekNumber: number): Week | undefined {
  return program.weeks.find((w) => w.number === weekNumber);
}

export function allItems(week: Week): ChecklistItem[] {
  return week.groups.flatMap((g) => g.items);
}

export function findItem(
  program: Program,
  itemId: string,
): { week: Week; item: ChecklistItem } | undefined {
  for (const week of program.weeks) {
    const item = allItems(week).find((i) => i.id === itemId);
    if (item) return { week, item };
  }
  return undefined;
}
