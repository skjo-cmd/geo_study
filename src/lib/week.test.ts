import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { clampWeek, computeStreak, daysBetween, resolveWeek, todayISO } from "./week.ts";

const START = "2026-11-02"; // 월요일

describe("resolveWeek", () => {
  test("시작일 당일은 1주차", () => {
    const r = resolveWeek(START, 4, new Date(2026, 10, 2, 9));
    assert.equal(r.number, 1);
    assert.equal(r.phase, "during");
  });

  test("시작 6일 뒤까지 1주차, 7일 뒤부터 2주차", () => {
    assert.equal(resolveWeek(START, 4, new Date(2026, 10, 8, 23, 59)).number, 1);
    assert.equal(resolveWeek(START, 4, new Date(2026, 10, 9, 0, 0)).number, 2);
  });

  test("시작 전에는 1주차로 클램프되고 phase=before", () => {
    const r = resolveWeek(START, 4, new Date(2026, 9, 20));
    assert.equal(r.number, 1);
    assert.equal(r.phase, "before");
    assert.ok(r.raw < 1);
  });

  test("커리큘럼이 끝난 뒤에는 마지막 주차로 클램프되고 phase=after", () => {
    // 16주 뒤 — 원본 사이트에서 'WEEK 16' 빈 화면이 나오던 상황
    const r = resolveWeek(START, 4, new Date(2027, 1, 22));
    assert.equal(r.number, 4);
    assert.equal(r.phase, "after");
    assert.equal(r.raw, 17);
  });

  test("totalWeeks가 0이면 예외", () => {
    assert.throws(() => resolveWeek(START, 0));
  });

  test("시간대 경계: 자정 직전/직후에도 일 단위로 계산", () => {
    assert.equal(daysBetween(new Date(2026, 10, 2, 23, 59), new Date(2026, 10, 3, 0, 1)), 1);
  });
});

describe("clampWeek", () => {
  test("범위 밖 값은 경계로", () => {
    assert.equal(clampWeek(0, 4), 1);
    assert.equal(clampWeek(31, 4), 4);
    assert.equal(clampWeek(3, 4), 3);
    assert.equal(clampWeek(Number.NaN, 4), 1);
  });
});

describe("computeStreak", () => {
  const now = new Date(2026, 10, 5, 12);
  test("기록 없음 → 0", () => {
    assert.equal(computeStreak([], now), 0);
  });
  test("오늘만 → 1", () => {
    assert.equal(computeStreak(["2026-11-05"], now), 1);
  });
  test("어제까지 연속이면 오늘 기록 전이라도 유지", () => {
    assert.equal(computeStreak(["2026-11-03", "2026-11-04"], now), 2);
  });
  test("이틀 전에서 끊기면 0", () => {
    assert.equal(computeStreak(["2026-11-03"], now), 0);
  });
  test("중복 날짜는 한 번으로", () => {
    assert.equal(computeStreak(["2026-11-05", "2026-11-05", "2026-11-04"], now), 2);
  });
  test("todayISO 포맷", () => {
    assert.equal(todayISO(new Date(2026, 0, 9)), "2026-01-09");
  });
});
