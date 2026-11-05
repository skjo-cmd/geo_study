import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import {
  ERROR_MESSAGES,
  buildChecks,
  isPrivateIp,
  normalizeUrl,
  parseHtml,
  robotsBlocksAll,
  scoreChecks,
  type SiteCheckError,
  type SiteCheckReport,
} from "@/lib/site-check";

const FETCH_TIMEOUT_MS = 8_000;
const MAX_HTML_BYTES = 1_000_000;
const USER_AGENT = "GEO-Lab-SiteCheck/1.0 (+https://github.com/skjo-cmd/geo_study)";

function fail(code: SiteCheckError["code"], status = 400) {
  const body: { error: SiteCheckError } = { error: { code, message: ERROR_MESSAGES[code] } };
  return NextResponse.json(body, { status });
}

async function assertPublicHost(hostname: string): Promise<boolean> {
  if (isPrivateIp(hostname)) return false;
  try {
    const results = await lookup(hostname, { all: true });
    if (results.length === 0) return false;
    return results.every((r) => !isPrivateIp(r.address));
  } catch {
    return false;
  }
}

async function fetchWithTimeout(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml,*/*;q=0.8", ...(init.headers ?? {}) },
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

async function readLimited(res: Response, limit: number): Promise<{ text: string; truncated: boolean }> {
  const reader = res.body?.getReader();
  if (!reader) return { text: await res.text(), truncated: false };
  const chunks: Uint8Array[] = [];
  let received = 0;
  let truncated = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.byteLength;
      if (received > limit) {
        truncated = true;
        await reader.cancel();
        break;
      }
    }
  }
  const merged = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }
  return { text: new TextDecoder("utf-8", { fatal: false }).decode(merged), truncated };
}

async function probeFile(url: string): Promise<{ ok: boolean; body?: string }> {
  try {
    const res = await fetchWithTimeout(url, { headers: { accept: "*/*" } });
    if (!res.ok) return { ok: false };
    const type = res.headers.get("content-type") ?? "";
    if (/text\/html/i.test(type)) {
      // 많은 호스팅이 없는 파일에 대해 200 + HTML 404 페이지를 돌려준다
      return { ok: false };
    }
    const { text } = await readLimited(res, 200_000);
    return { ok: text.trim().length > 0, body: text };
  } catch {
    return { ok: false };
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("invalid_url");
  }
  const input = typeof body === "object" && body && "url" in body ? String((body as { url: unknown }).url ?? "") : "";
  const url = normalizeUrl(input);
  if (!url) return fail("invalid_url");

  if (!(await assertPublicHost(url.hostname))) return fail("private_address");

  let res: Response;
  try {
    res = await fetchWithTimeout(url.href);
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return fail(aborted ? "timeout" : "unreachable", 502);
  }

  if (!res.ok) return fail("http_error", 502);
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType && !/text\/html|application\/xhtml/i.test(contentType)) return fail("not_html", 422);

  const finalUrl = new URL(res.url || url.href);
  // 리다이렉트 결과도 공개 주소여야 한다
  if (finalUrl.hostname !== url.hostname && !(await assertPublicHost(finalUrl.hostname))) {
    return fail("private_address");
  }

  const { text: html } = await readLimited(res, MAX_HTML_BYTES);
  const parsed = parseHtml(html);

  const origin = finalUrl.origin;
  const sitemapUrl = `${origin}/sitemap.xml`;
  const robotsUrl = `${origin}/robots.txt`;
  const [sitemap, robots] = await Promise.all([probeFile(sitemapUrl), probeFile(robotsUrl)]);

  const checks = buildChecks(
    parsed,
    {
      sitemap: { ok: sitemap.ok, url: sitemapUrl },
      robots: { ok: robots.ok, url: robotsUrl, blocksAll: robots.ok && robots.body ? robotsBlocksAll(robots.body) : false },
    },
    finalUrl.href,
  );
  const { score, total } = scoreChecks(checks);

  const report: SiteCheckReport = {
    requestedUrl: url.href,
    finalUrl: finalUrl.href,
    hostname: finalUrl.hostname,
    score,
    total,
    checks,
    checkedAt: new Date().toISOString(),
  };
  return NextResponse.json(report);
}
