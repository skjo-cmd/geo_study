/**
 * 사이트 체크: HTML 문자열에서 검색 기본 설정을 추출하고 점수를 매긴다.
 * 네트워크와 무관한 순수 함수만 두어 테스트 가능하게 한다.
 * 모든 사용자 노출 문구는 한국어(원본 사이트 결함 7번).
 */

export type CheckStatus = "ok" | "missing" | "warn";

export type CheckResult = {
  id: string;
  label: string;
  status: CheckStatus;
  value?: string;
  hint?: string;
  href?: string;
};

export type SiteCheckReport = {
  requestedUrl: string;
  finalUrl: string;
  hostname: string;
  score: number;
  total: number;
  checks: CheckResult[];
  checkedAt: string;
};

export type SiteCheckError = {
  code:
    | "invalid_url"
    | "unsupported_protocol"
    | "private_address"
    | "timeout"
    | "unreachable"
    | "http_error"
    | "not_html"
    | "too_large";
  message: string;
};

export const ERROR_MESSAGES: Record<SiteCheckError["code"], string> = {
  invalid_url: "주소 형식이 올바르지 않아요. https://example.com 처럼 입력해 주세요.",
  unsupported_protocol: "http 또는 https 주소만 확인할 수 있어요.",
  private_address: "내부망 주소나 로컬 주소는 확인할 수 없어요.",
  timeout: "사이트 응답이 너무 느려 확인을 중단했어요. 잠시 후 다시 시도해 주세요.",
  unreachable: "사이트에 연결하지 못했어요. 주소가 맞는지, 사이트가 열려 있는지 확인해 주세요.",
  http_error: "사이트가 오류 응답을 보냈어요. 로그인 없이 열리는 페이지인지 확인해 주세요.",
  not_html: "HTML 페이지가 아니에요. 홈페이지나 글 페이지 주소를 입력해 주세요.",
  too_large: "페이지가 너무 커서 일부만 확인했어요.",
};

/** 사용자가 입력한 문자열을 정규화된 URL 로. 실패 시 null */
export function normalizeUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname || !url.hostname.includes(".")) {
      // "localhost" 등은 허용하지 않음(내부 주소). 단일 라벨 호스트는 공개 사이트가 아님
      return null;
    }
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

/** 사설/루프백 대역 판정 (IPv4, 일부 IPv6) */
export function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const lower = ip.toLowerCase();
    return (
      lower === "::1" ||
      lower === "::" ||
      lower.startsWith("fc") ||
      lower.startsWith("fd") ||
      lower.startsWith("fe80") ||
      lower.startsWith("::ffff:") && isPrivateIp(lower.replace("::ffff:", ""))
    );
  }
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

/* ---------- HTML 파싱 (의존성 없이 head 영역만 정규식으로) ---------- */

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function attr(tag: string, name: string): string | undefined {
  const re = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i");
  const m = tag.match(re);
  if (!m) return undefined;
  return decodeEntities(m[1] ?? m[2] ?? m[3] ?? "");
}

export type ParsedHead = {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  viewport?: string;
  robots?: string;
  lang?: string;
  hasJsonLd: boolean;
  h1Count: number;
};

export function parseHtml(html: string): ParsedHead {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const head = headMatch ? headMatch[1] : html.slice(0, 200_000);

  const titleMatch = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const metas = head.match(/<meta\b[^>]*>/gi) ?? [];
  const links = head.match(/<link\b[^>]*>/gi) ?? [];

  const meta = (key: "name" | "property", value: string) => {
    for (const tag of metas) {
      const k = attr(tag, key);
      if (k && k.toLowerCase() === value) return attr(tag, "content");
    }
    return undefined;
  };

  let canonical: string | undefined;
  for (const tag of links) {
    const rel = attr(tag, "rel");
    if (rel && rel.toLowerCase().split(/\s+/).includes("canonical")) {
      canonical = attr(tag, "href");
      break;
    }
  }

  const langMatch = html.match(/<html\b[^>]*\blang\s*=\s*["']?([a-zA-Z-]+)/i);
  const hasJsonLd = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>/i.test(html);
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;

  return {
    title: titleMatch ? decodeEntities(titleMatch[1]) || undefined : undefined,
    description: meta("name", "description"),
    canonical,
    ogTitle: meta("property", "og:title"),
    ogDescription: meta("property", "og:description"),
    ogImage: meta("property", "og:image"),
    viewport: meta("name", "viewport"),
    robots: meta("name", "robots"),
    lang: langMatch?.[1],
    hasJsonLd,
    h1Count,
  };
}

/* ---------- 점수 ---------- */

export type ExternalFiles = {
  sitemap: { ok: boolean; url: string };
  robots: { ok: boolean; url: string; blocksAll?: boolean };
};

export function buildChecks(parsed: ParsedHead, files: ExternalFiles, finalUrl: string): CheckResult[] {
  const checks: CheckResult[] = [];
  const push = (c: CheckResult) => checks.push(c);

  push({
    id: "title",
    label: "페이지 제목(title)",
    status: parsed.title ? (parsed.title.length > 60 ? "warn" : "ok") : "missing",
    value: parsed.title,
    hint: parsed.title
      ? parsed.title.length > 60
        ? "60자를 넘으면 검색 결과에서 잘릴 수 있어요."
        : undefined
      : "검색 결과의 첫 줄이 돼요. 페이지마다 고유한 제목을 넣어 주세요.",
  });
  push({
    id: "description",
    label: "메타 설명(description)",
    status: parsed.description ? (parsed.description.length > 160 ? "warn" : "ok") : "missing",
    value: parsed.description,
    hint: parsed.description
      ? parsed.description.length > 160
        ? "160자 안팎으로 줄이면 검색 결과에 온전히 보여요."
        : undefined
      : "검색 결과와 AI 요약에 쓰이는 한두 문장이에요.",
  });
  push({
    id: "canonical",
    label: "대표 주소(canonical)",
    status: parsed.canonical ? "ok" : "missing",
    value: parsed.canonical,
    hint: parsed.canonical ? undefined : "같은 내용이 여러 주소로 열릴 때 어느 것이 대표인지 알려줘요.",
  });
  push({
    id: "og-title",
    label: "OG 제목(og:title)",
    status: parsed.ogTitle ? "ok" : "missing",
    value: parsed.ogTitle,
  });
  push({
    id: "og-description",
    label: "OG 설명(og:description)",
    status: parsed.ogDescription ? "ok" : "missing",
    value: parsed.ogDescription,
  });
  push({
    id: "og-image",
    label: "OG 이미지(og:image)",
    status: parsed.ogImage ? "ok" : "missing",
    value: parsed.ogImage,
    hint: parsed.ogImage ? undefined : "링크를 공유할 때 미리보기 이미지가 비어 보여요.",
  });
  push({
    id: "viewport",
    label: "모바일 viewport",
    status: parsed.viewport ? "ok" : "missing",
    value: parsed.viewport,
    hint: parsed.viewport ? undefined : "모바일 친화성 판정의 첫 조건이에요.",
  });
  const robotsMeta = parsed.robots?.toLowerCase() ?? "";
  const blocksIndex = /noindex/.test(robotsMeta);
  push({
    id: "robots-meta",
    label: "검색로봇 메타태그",
    status: blocksIndex ? "warn" : "ok",
    value: parsed.robots ?? "없음 (기본값: 색인 허용)",
    hint: blocksIndex ? "noindex가 설정되어 검색 결과에서 제외돼요. 의도한 것인지 확인하세요." : undefined,
  });
  push({
    id: "sitemap",
    label: "사이트맵(sitemap.xml)",
    status: files.sitemap.ok ? "ok" : "missing",
    value: files.sitemap.ok ? files.sitemap.url : undefined,
    href: files.sitemap.ok ? files.sitemap.url : undefined,
    hint: files.sitemap.ok ? undefined : "서치콘솔에 제출할 사이트맵이 없어요.",
  });
  push({
    id: "robots-txt",
    label: "robots.txt",
    status: files.robots.ok ? (files.robots.blocksAll ? "warn" : "ok") : "missing",
    value: files.robots.ok
      ? files.robots.blocksAll
        ? "전체 차단(Disallow: /) 규칙이 있어요"
        : "파일에 접근할 수 있어요"
      : undefined,
    href: files.robots.ok ? files.robots.url : undefined,
    hint: files.robots.blocksAll ? "모든 봇을 차단하고 있어요. 공개 사이트라면 규칙을 확인하세요." : undefined,
  });
  // 보너스 항목(점수 미포함): 구조화 데이터, h1, lang
  push({
    id: "json-ld",
    label: "구조화 데이터(JSON-LD)",
    status: parsed.hasJsonLd ? "ok" : "warn",
    value: parsed.hasJsonLd ? "감지됨" : "없음",
    hint: parsed.hasJsonLd ? undefined : "점수에는 포함되지 않지만, 회사·상품 정보를 봇에게 설명하는 데 유용해요.",
  });
  void finalUrl;
  return checks;
}

export const SCORED_IDS = [
  "title",
  "description",
  "canonical",
  "og-title",
  "og-description",
  "og-image",
  "viewport",
  "robots-meta",
  "sitemap",
  "robots-txt",
] as const;

export function scoreChecks(checks: CheckResult[]): { score: number; total: number } {
  const scored = checks.filter((c) => (SCORED_IDS as readonly string[]).includes(c.id));
  const score = scored.filter((c) => c.status === "ok").length;
  return { score, total: scored.length };
}

export function robotsBlocksAll(robotsTxt: string): boolean {
  // User-agent: * 블록 안에 "Disallow: /" (정확히 루트) 가 있으면 전체 차단으로 본다
  const lines = robotsTxt.split(/\r?\n/).map((l) => l.replace(/#.*$/, "").trim());
  let inStar = false;
  for (const line of lines) {
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === "user-agent") {
      inStar = value === "*";
    } else if (key === "disallow" && inStar && value === "/") {
      return true;
    }
  }
  return false;
}
