import { NextResponse } from "next/server";
import dns from "node:dns/promises";
import net from "node:net";

export const runtime = "nodejs";

type Check = { id: string; label: string; ok: boolean; value?: string; link?: string };

const UA = "Mozilla/5.0 (compatible; GEOStudySiteCheck/1.0)";
const TIMEOUT_MS = 8000;
const MAX_BYTES = 1_000_000;

function isPrivateIp(ip: string) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  const v6 = ip.toLowerCase();
  return v6 === "::1" || v6 === "::" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80") || v6.startsWith("::ffff:");
}

async function assertPublicHost(hostname: string) {
  if (hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal")) throw new Error("사설 주소는 검사할 수 없어요.");
  if (net.isIP(hostname) && isPrivateIp(hostname)) throw new Error("사설 주소는 검사할 수 없어요.");
  const addrs = await dns.lookup(hostname, { all: true }).catch(() => []);
  if (addrs.length === 0) throw new Error("도메인을 찾을 수 없어요.");
  if (addrs.some((a) => isPrivateIp(a.address))) throw new Error("사설 주소는 검사할 수 없어요.");
}

async function fetchText(url: string, method: "GET" | "HEAD" = "GET") {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { method, redirect: "follow", signal: ctrl.signal, headers: { "user-agent": UA, accept: "text/html,*/*" } });
    const len = Number(res.headers.get("content-length") || 0);
    if (len > MAX_BYTES) return { res, text: "" };
    const text = method === "HEAD" ? "" : (await res.text()).slice(0, MAX_BYTES);
    return { res, text };
  } finally {
    clearTimeout(t);
  }
}

/** 태그 문자열에서 속성값을 읽는다. 따옴표(" ')가 있든 없든, 속성 순서가 어떻든 동작. */
const attr = (tag: string, name: string) => {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i"));
  return m ? (m[1] ?? m[2] ?? m[3])?.trim() : undefined;
};

const meta = (html: string, attrName: "name" | "property", key: string) => {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if ((attr(tag, attrName) || "").toLowerCase() === key.toLowerCase()) return attr(tag, "content");
  }
  return undefined;
};

const linkHref = (html: string, rel: string) => {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const rels = (attr(tag, "rel") || "").toLowerCase().split(/\s+/);
    if (rels.includes(rel)) return attr(tag, "href");
  }
  return undefined;
};

async function probe(url: string, expectXml = false): Promise<{ ok: boolean; value?: string }> {
  try {
    const { res, text } = await fetchText(url);
    if (!res.ok) return { ok: false, value: `HTTP ${res.status}` };
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("text/html") && !expectXml) return { ok: false, value: "HTML 페이지로 응답 (파일 없음)" };
    if (expectXml && !/xml/.test(ct) && !text.trimStart().startsWith("<?xml") && !text.includes("<urlset") && !text.includes("<sitemapindex")) return { ok: false, value: "XML 형식 아님" };
    return { ok: true, value: `HTTP ${res.status}` };
  } catch {
    return { ok: false, value: "응답 없음" };
  }
}

export async function POST(req: Request) {
  let input: string;
  try {
    input = String((await req.json()).url || "").trim();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  if (!/^https?:\/\//i.test(input)) input = "https://" + input;

  let u: URL;
  try {
    u = new URL(input);
  } catch {
    return NextResponse.json({ error: "올바른 URL을 입력해 주세요." }, { status: 400 });
  }

  try {
    await assertPublicHost(u.hostname);
    const { res, text: html } = await fetchText(u.toString());
    const finalUrl = new URL(res.url || u.toString());
    if (finalUrl.hostname !== u.hostname) await assertPublicHost(finalUrl.hostname);
    const origin = finalUrl.origin;

    const [robots, sitemap, llms] = await Promise.all([
      probe(origin + "/robots.txt"),
      probe(origin + "/sitemap.xml", true),
      probe(origin + "/llms.txt"),
    ]);

    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
    const canonical = linkHref(html, "canonical");
    const jsonLd = (html.match(/<script[^>]+type=["']application\/ld\+json["']/gi) || []).length;

    const checks: Check[] = [
      { id: "title", label: "페이지 제목(title)", ok: !!title, value: title },
      { id: "description", label: "메타 설명(description)", ok: !!meta(html, "name", "description"), value: meta(html, "name", "description") },
      { id: "canonical", label: "대표 주소(canonical)", ok: !!canonical, value: canonical },
      { id: "og:title", label: "OG 제목(og:title)", ok: !!meta(html, "property", "og:title"), value: meta(html, "property", "og:title") },
      { id: "og:description", label: "OG 설명(og:description)", ok: !!meta(html, "property", "og:description"), value: meta(html, "property", "og:description") },
      { id: "og:image", label: "OG 이미지(og:image)", ok: !!meta(html, "property", "og:image"), value: meta(html, "property", "og:image") },
      { id: "viewport", label: "모바일 viewport", ok: !!meta(html, "name", "viewport"), value: meta(html, "name", "viewport") },
      { id: "robots-meta", label: "검색로봇 메타태그", ok: !!meta(html, "name", "robots"), value: meta(html, "name", "robots") },
      { id: "sitemap", label: "사이트맵(sitemap.xml)", ok: sitemap.ok, value: sitemap.value, link: origin + "/sitemap.xml" },
      { id: "robots-txt", label: "robots.txt", ok: robots.ok, value: robots.value, link: origin + "/robots.txt" },
      { id: "json-ld", label: "구조화된 데이터(JSON-LD)", ok: jsonLd > 0, value: jsonLd ? `${jsonLd}개 블록` : undefined },
      { id: "llms-txt", label: "llms.txt (AI 크롤러 안내)", ok: llms.ok, value: llms.value, link: origin + "/llms.txt" },
    ];

    const host = finalUrl.hostname;
    const enc = encodeURIComponent;
    return NextResponse.json({
      url: u.toString(),
      finalUrl: finalUrl.toString(),
      hostname: host,
      httpStatus: res.status,
      score: checks.filter((c) => c.ok).length,
      total: checks.length,
      checks,
      external: [
        { id: "google", label: "Google 색인 결과", desc: `site:${host} 검색`, url: `https://www.google.com/search?q=${enc("site:" + host)}` },
        { id: "naver", label: "Naver 색인 결과", desc: `site:${host} 검색`, url: `https://search.naver.com/search.naver?query=${enc("site:" + host)}` },
        { id: "daum", label: "Daum 색인 결과", desc: `site:${host} 검색`, url: `https://search.daum.net/search?q=${enc("site:" + host)}` },
        { id: "bing", label: "Bing 색인 결과", desc: `site:${host} 검색`, url: `https://www.bing.com/search?q=${enc("site:" + host)}` },
        { id: "brave", label: "Brave 색인 결과", desc: `site:${host} 검색`, url: `https://search.brave.com/search?q=${enc("site:" + host)}` },
        { id: "psi", label: "PageSpeed Insights", desc: "사이트 속도와 Core Web Vitals 검사", url: `https://pagespeed.web.dev/analysis?url=${enc(finalUrl.toString())}` },
        { id: "schema", label: "Schema.org Validator", desc: "구조화된 데이터와 Schema.org 마크업 검사", url: `https://validator.schema.org/#url=${enc(finalUrl.toString())}` },
      ],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "검사에 실패했어요.";
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
