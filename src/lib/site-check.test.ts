import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  buildChecks,
  isPrivateIp,
  normalizeUrl,
  parseHtml,
  robotsBlocksAll,
  scoreChecks,
} from "./site-check.ts";

describe("normalizeUrl", () => {
  test("스킴 없는 입력에 https를 붙인다", () => {
    assert.equal(normalizeUrl("example.com/path")?.href, "https://example.com/path");
  });
  test("공백과 해시를 정리한다", () => {
    assert.equal(normalizeUrl("  https://example.com/#top ")?.href, "https://example.com/");
  });
  test("잘못된 입력은 null", () => {
    assert.equal(normalizeUrl("not a url"), null);
    assert.equal(normalizeUrl(""), null);
    assert.equal(normalizeUrl("ftp://example.com"), null);
    assert.equal(normalizeUrl("localhost:3000"), null);
  });
});

describe("isPrivateIp", () => {
  test("사설/루프백 대역", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "192.168.0.1", "172.16.5.5", "169.254.1.1", "::1", "fd00::1"]) {
      assert.equal(isPrivateIp(ip), true, ip);
    }
  });
  test("공인 주소", () => {
    for (const ip of ["8.8.8.8", "1.1.1.1", "172.32.0.1", "2606:4700::1111"]) {
      assert.equal(isPrivateIp(ip), false, ip);
    }
  });
});

const SAMPLE = `<!doctype html><html lang="ko"><head>
<title>테스트 &amp; 회사</title>
<meta name="description" content="우리 회사 소개">
<meta property="og:title" content="OG 제목">
<meta property='og:image' content='https://example.com/og.png'>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="https://example.com/">
<script type="application/ld+json">{"@type":"Organization"}</script>
</head><body><h1>안녕</h1></body></html>`;

describe("parseHtml", () => {
  test("head의 주요 태그를 추출한다", () => {
    const p = parseHtml(SAMPLE);
    assert.equal(p.title, "테스트 & 회사");
    assert.equal(p.description, "우리 회사 소개");
    assert.equal(p.ogTitle, "OG 제목");
    assert.equal(p.ogImage, "https://example.com/og.png");
    assert.equal(p.canonical, "https://example.com/");
    assert.equal(p.viewport, "width=device-width, initial-scale=1");
    assert.equal(p.lang, "ko");
    assert.equal(p.hasJsonLd, true);
    assert.equal(p.h1Count, 1);
    assert.equal(p.ogDescription, undefined);
  });
  test("head가 없어도 동작한다", () => {
    const p = parseHtml("<title>x</title>");
    assert.equal(p.title, "x");
  });
});

describe("buildChecks / scoreChecks", () => {
  test("샘플은 10점 중 8점 (og:description, robots.txt 없음)", () => {
    const checks = buildChecks(
      parseHtml(SAMPLE),
      { sitemap: { ok: true, url: "https://example.com/sitemap.xml" }, robots: { ok: false, url: "https://example.com/robots.txt" } },
      "https://example.com/",
    );
    const { score, total } = scoreChecks(checks);
    assert.equal(total, 10);
    assert.equal(score, 8);
  });
  test("noindex 는 경고로 점수에서 빠진다", () => {
    const checks = buildChecks(
      parseHtml(`<head><meta name="robots" content="noindex,nofollow"></head>`),
      { sitemap: { ok: false, url: "" }, robots: { ok: false, url: "" } },
      "https://example.com/",
    );
    const robots = checks.find((c) => c.id === "robots-meta");
    assert.equal(robots?.status, "warn");
    assert.equal(scoreChecks(checks).score, 0);
  });
  test("모든 힌트 문구는 한국어", () => {
    const checks = buildChecks(
      parseHtml("<head></head>"),
      { sitemap: { ok: false, url: "" }, robots: { ok: false, url: "" } },
      "https://example.com/",
    );
    for (const c of checks) {
      if (c.hint) assert.match(c.hint, /[가-힣]/, c.id);
    }
  });
});

describe("robotsBlocksAll", () => {
  test("User-agent: * 아래 Disallow: / 는 전체 차단", () => {
    assert.equal(robotsBlocksAll("User-agent: *\nDisallow: /"), true);
  });
  test("특정 경로만 차단하면 전체 차단 아님", () => {
    assert.equal(robotsBlocksAll("User-agent: *\nDisallow: /admin/\nAllow: /"), false);
  });
  test("특정 봇만 전체 차단이면 전체 차단 아님", () => {
    assert.equal(robotsBlocksAll("User-agent: BadBot\nDisallow: /\n\nUser-agent: *\nDisallow:"), false);
  });
});
