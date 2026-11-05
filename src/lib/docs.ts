/**
 * 가이드 문서. 창업기업이 스터디 4주 동안 따라 할 수 있는 수준으로 쓴다.
 * 원본 사이트의 문서를 복제하지 않고 구조만 참고했다.
 */

export type DocSection = {
  heading: string;
  body?: string;
  bullets?: string[];
  links?: { label: string; href: string }[];
  callout?: string;
};

export type Doc = {
  slug: string;
  group: string;
  title: string;
  summary: string;
  /** 관련 주차 */
  week?: number;
  sections: DocSection[];
};

export const DOC_GROUPS = ["시작하기", "기술 기반", "콘텐츠", "GEO 측정"] as const;

export const DOCS: Doc[] = [
  {
    slug: "choose-site",
    group: "시작하기",
    title: "스터디 대상 사이트 고르기",
    summary: "4주 안에 변화를 만들고 증명하려면 어떤 사이트를 골라야 하는지.",
    week: 1,
    sections: [
      {
        heading: "이런 사이트가 좋아요",
        body: "직접 고칠 수 있고, 이미 공개돼 있으며, 스터디가 끝난 뒤에도 운영할 사이트여야 변화 전후를 비교할 수 있어요.",
        bullets: [
          "내가 소유하거나 관리자 권한이 있어서 HTML·메타태그·파일을 직접 수정할 수 있다",
          "로그인 없이 주요 페이지가 열리는 공개 사이트다",
          "대상 고객과 주제가 한 문장으로 설명된다",
          "독립 도메인이고 공개 페이지가 5개 이상이면 더 좋다",
        ],
      },
      {
        heading: "피하는 것이 좋은 사이트",
        bullets: [
          "네이버 블로그·브런치처럼 핵심 HTML을 수정할 수 없는 타사 플랫폼",
          "외주 제작사에 매번 요청해야 하는 사이트",
          "고객 정보가 들어 있는 비공개 사이트",
          "운영 종료나 대규모 개편이 예정된 사이트",
        ],
      },
      {
        heading: "사이트가 아직 없다면",
        body: "완벽할 필요는 없어요. 하나의 주제로 소개·정보·문의 페이지 세 개를 먼저 공개하고 스터디 중에 개선하면 충분해요. 주제를 정할 때는 트렌드 도구로 최근 12개월 관심도가 꾸준한 키워드를 고르세요.",
        links: [
          { label: "Google Trends", href: "https://trends.google.com/trends/explore?geo=KR" },
          { label: "네이버 데이터랩", href: "https://datalab.naver.com/" },
        ],
      },
    ],
  },
  {
    slug: "register-search-engines",
    group: "시작하기",
    title: "검색엔진에 사이트 등록하기",
    summary: "Google Search Console과 네이버 서치어드바이저 소유권 확인, 그리고 왜 Bing도 등록해야 하는지.",
    week: 1,
    sections: [
      {
        heading: "왜 등록이 먼저인가",
        body: "등록하지 않아도 언젠가 크롤링되지만, 등록해야만 '어떤 검색어로 노출되고 몇 번 클릭됐는지'를 볼 수 있어요. 이 숫자가 4주 뒤 성장을 증명하는 기준선이에요.",
      },
      {
        heading: "Google Search Console",
        bullets: [
          "속성 추가에서 'URL 접두어' 방식으로 사이트 주소를 입력한다",
          "HTML 태그 방식이 가장 간단하다. <head>에 메타태그를 넣고 배포한 뒤 확인을 누른다",
          "확인 후 Sitemaps 메뉴에 sitemap.xml 주소를 제출한다",
          "데이터는 등록 후 2~3일 뒤부터 쌓인다. 첫 주에 등록하는 이유다",
        ],
        links: [{ label: "Search Console 열기", href: "https://search.google.com/search-console" }],
      },
      {
        heading: "네이버 서치어드바이저",
        bullets: [
          "웹마스터 도구 → 사이트 등록 → HTML 태그로 소유 확인",
          "요청 → 사이트맵 제출, robots.txt 검증 도구로 수집 가능 여부 확인",
          "네이버는 '사이트 간단 체크'에서 알려주는 항목(제목, 설명, OG, robots)을 그대로 평가 기준으로 쓴다",
        ],
        links: [{ label: "서치어드바이저 열기", href: "https://searchadvisor.naver.com/console/board" }],
      },
      {
        heading: "Bing도 등록하는 이유",
        body: "ChatGPT 검색, Copilot 등 여러 AI 검색이 Bing 색인을 사용해요. Bing Webmaster Tools는 Search Console 계정으로 사이트를 가져올 수 있어 1분이면 끝나요.",
        links: [{ label: "Bing Webmaster Tools", href: "https://www.bing.com/webmasters/" }],
        callout: "등록 직후 '사이트 체크'로 현재 점수를 기록해 두세요. 4주차에 비교합니다.",
      },
    ],
  },
  {
    slug: "measure-baseline",
    group: "시작하기",
    title: "기준선 숫자 5개 정하기",
    summary: "개선 전에 적어둘 숫자와 어디서 보는지.",
    week: 1,
    sections: [
      {
        heading: "4주 뒤 비교할 숫자",
        bullets: [
          "사이트 체크 점수 (이 사이트의 사이트 체크)",
          "Search Console 노출수·클릭수 (최근 28일)",
          "색인된 페이지 수 (Search Console → 페이지)",
          "GA4 세션 수와 참조 도메인별 유입 (chatgpt.com, perplexity.ai 등)",
          "AI 답변 속 브랜드 언급 여부 (4주차 질문 세트로 측정)",
        ],
      },
      {
        heading: "GA4에서 AI 유입만 따로 보기",
        body: "보고서 → 획득 → 트래픽 획득에서 '세션 소스'로 분류하고 chatgpt, perplexity, claude, gemini, copilot 을 포함하는 필터를 저장하세요. 숫자가 0이어도 괜찮아요. 0에서 출발했다는 기록이 중요해요.",
      },
      {
        heading: "기록 방법",
        body: "숫자 5개를 '성장 기록'에 날짜와 함께 남기세요. 스크린샷 1장을 함께 첨부하면 나중에 회고 쓸 때 근거가 돼요.",
      },
    ],
  },
  {
    slug: "sitemap-robots",
    group: "기술 기반",
    title: "sitemap.xml과 robots.txt",
    summary: "봇에게 '무엇을 읽어도 되는지'와 '무엇이 있는지'를 알려주는 두 파일.",
    week: 2,
    sections: [
      {
        heading: "역할 구분",
        bullets: [
          "robots.txt: 읽어도 되는 곳과 안 되는 곳. 사이트 루트에 하나",
          "sitemap.xml: 색인해 주길 바라는 페이지 목록. robots.txt에 위치를 적어두면 더 좋다",
        ],
      },
      {
        heading: "robots.txt 점검 포인트",
        bullets: [
          "User-agent: * 아래에 Disallow: / 가 있으면 전부 차단이다. 개발용 설정이 배포에 남아 있는 흔한 실수",
          "AI 크롤러(GPTBot, ClaudeBot, PerplexityBot 등)를 차단하고 있다면 GEO 목적과 충돌한다. 의도적인지 확인",
          "관리자·검색결과·장바구니 같은 페이지만 Disallow 하는 것이 일반적",
          "마지막 줄에 Sitemap: https://도메인/sitemap.xml 추가",
        ],
      },
      {
        heading: "sitemap.xml 만들기",
        body: "대부분의 CMS·프레임워크가 자동 생성 기능을 제공해요. 직접 만들 때는 공개 페이지의 정식 주소(canonical)만 넣고, 삭제된 페이지는 빼세요. 만든 뒤 서치콘솔과 서치어드바이저 양쪽에 제출합니다.",
        links: [
          { label: "Google 사이트맵 가이드", href: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ko" },
          { label: "robots.txt 만들기", href: "https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt?hl=ko" },
        ],
      },
    ],
  },
  {
    slug: "page-metadata",
    group: "기술 기반",
    title: "title · description · canonical · OG",
    summary: "검색 결과와 링크 미리보기에 보이는 네 가지 메타 정보 작성 기준.",
    week: 2,
    sections: [
      {
        heading: "title",
        bullets: [
          "페이지마다 다르게. '회사명'만 반복하지 않는다",
          "핵심 키워드를 앞에, 회사명은 뒤에 (예: 소상공인 세무기장 비용 안내 | 회사명)",
          "60자 안팎. 넘으면 검색 결과에서 잘린다",
        ],
      },
      {
        heading: "description",
        bullets: [
          "페이지가 답하는 질문과 누구를 위한 것인지 한두 문장",
          "160자 안팎. AI 요약이 그대로 가져다 쓰는 경우가 많다",
        ],
      },
      {
        heading: "canonical",
        body: "같은 내용이 http/https, www 유무, 쿼리 파라미터로 여러 주소에서 열리면 검색엔진이 중복으로 봐요. 대표 주소 하나를 canonical로 선언하세요. 자기 자신을 가리키는 것이 기본이에요.",
      },
      {
        heading: "OG(Open Graph)",
        bullets: [
          "og:title, og:description, og:image 세 개는 꼭",
          "이미지는 1200×630 권장, 텍스트가 있다면 가운데에 크게",
          "카카오톡은 OG를 캐시하므로 바꾼 뒤에는 공유 디버거에서 갱신",
        ],
        links: [{ label: "카카오 공유 디버거", href: "https://developers.kakao.com/tool/debugger/sharing" }],
      },
    ],
  },
  {
    slug: "structured-data",
    group: "기술 기반",
    title: "구조화 데이터 첫걸음",
    summary: "회사·서비스 정보를 봇이 오해 없이 읽게 하는 JSON-LD.",
    week: 2,
    sections: [
      {
        heading: "창업기업이 먼저 넣을 유형",
        bullets: [
          "Organization: 회사명, 로고, 공식 URL, SNS 링크(sameAs)",
          "LocalBusiness: 매장·사무실이 있고 지역 고객이 중요하면",
          "FAQPage: 3주차에 만드는 질문 답변 페이지에",
          "Article: 작성자·발행일이 있는 정보성 글",
        ],
      },
      {
        heading: "넣는 방법",
        body: "<head> 안에 <script type=\"application/ld+json\">로 JSON을 넣어요. 페이지에 실제로 보이는 정보만 넣어야 해요. 보이지 않는 정보를 넣는 것은 정책 위반이에요.",
        links: [
          { label: "리치 결과 테스트", href: "https://search.google.com/test/rich-results?hl=ko" },
          { label: "Schema.org Validator", href: "https://validator.schema.org/" },
        ],
      },
    ],
  },
  {
    slug: "customer-questions",
    group: "콘텐츠",
    title: "고객 질문 10개 모으고 1개에 답하기",
    summary: "AI가 인용하는 페이지는 '질문에 답하는 페이지'. 어디서 질문을 모으고 어떻게 쓰는지.",
    week: 3,
    sections: [
      {
        heading: "질문을 모으는 곳",
        bullets: [
          "상담·문의 채널에서 반복되는 질문",
          "Search Console의 검색어 보고서 (이미 들어오는 질문형 검색어)",
          "AI 서비스에 '우리 서비스를 고려하는 사람이 물을 만한 질문 20개'를 생성시킨 뒤 실제 고객 언어로 다듬기",
          "경쟁사 FAQ와 커뮤니티 질문",
        ],
      },
      {
        heading: "한 페이지 = 한 질문",
        bullets: [
          "제목을 질문 그대로 쓴다 (예: 법인 설립 후 세무기장은 언제부터 해야 하나요?)",
          "첫 문단에서 바로 답한다. 배경 설명은 그 뒤에",
          "숫자·조건·예외를 표나 목록으로. AI는 구조화된 답을 더 잘 인용한다",
          "누가 썼고 어떤 경험·근거로 쓰는지 표시한다",
          "관련 서비스 페이지와 다른 질문 페이지로 내부 링크",
        ],
      },
      {
        heading: "피할 것",
        bullets: [
          "비슷한 질문으로 얇은 페이지를 한꺼번에 많이 만드는 것",
          "답 없이 '문의하세요'로 끝나는 페이지",
          "이미지 안에만 정보가 있는 페이지 (봇은 읽지 못한다)",
        ],
      },
    ],
  },
  {
    slug: "geo-question-set",
    group: "GEO 측정",
    title: "GEO 질문 세트 만들고 측정하기",
    summary: "브랜드명 없이 고객 상황으로 질문을 만들고, AI 답변을 같은 기준으로 기록하는 방법.",
    week: 4,
    sections: [
      {
        heading: "질문 공식",
        body: "[카테고리] + [고객 상황] + [핵심 속성] + [조건]. 브랜드명을 넣지 않아요. 고객은 우리를 모르는 상태에서 질문하니까요.",
        bullets: [
          "❌ OO세무법인 괜찮아? → ✅ 스타트업 초기 세무기장 저렴하게 맡길 곳 추천",
          "❌ 서울 카페 추천 (너무 넓음) → ✅ 성수동에서 노트북 작업하기 좋은 조용한 카페",
          "긍정 질문만 만들지 않는다: 단점은? 대안은? 비교하면?",
        ],
      },
      {
        heading: "기록 표",
        body: "질문마다 다섯 칸을 채워요: 브랜드 등장 여부 / 추천 순서 / 어떤 속성으로 언급됐는지 / 함께 언급된 경쟁사 / AI가 참고한 출처. 2주 뒤 같은 질문을 다시 돌려 비교합니다.",
        bullets: [
          "AI 서비스 2곳 이상 (예: ChatGPT, Perplexity, Gemini, Claude)에서 같은 질문",
          "출처에 우리 사이트가 있는지가 노출 여부보다 중요한 신호",
          "'카페 추천'에는 나오는데 '작업하기 좋은 카페'에는 안 나온다면, 그 속성의 콘텐츠가 부족하다는 뜻",
        ],
        callout: "GEO 측정은 횟수보다 '어떤 맥락으로 추천되는가'를 보는 일이에요.",
      },
    ],
  },
];

export const DOC_MAP: Record<string, Doc> = Object.fromEntries(DOCS.map((d) => [d.slug, d]));

export function docsByGroup(): { group: string; docs: Doc[] }[] {
  return DOC_GROUPS.map((group) => ({ group, docs: DOCS.filter((d) => d.group === group) }));
}
