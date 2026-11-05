/**
 * 현재 주차 계산 (벤치마크 사이트의 버그를 수정한 버전)
 *
 * 벤치마크(geo-study-member)는 다음 식으로 주차를 구했다:
 *   Math.max(1, Math.floor((now - start) / 6048e5) + 1)
 * 하한(1)만 있고 상한이 없어, 4주 과정이 끝난 뒤에도 경과 주 수(예: 16)가
 * 그대로 노출되고 해당 주차의 체크리스트가 없어 "준비 중"으로 보이는 문제가 있었다.
 *
 * 이 함수는 결과를 [1, totalWeeks]로 clamp 하고, 과정 종료 여부를 함께 돌려준다.
 */

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * @param {Object} opts
 * @param {string|Date} opts.startDate  과정 시작일 (예: "2026-07-17T00:00:00+09:00")
 * @param {number}      opts.totalWeeks 과정 총 주차 수 (예: 4)
 * @param {Date}        [opts.now]      기준 시각 (기본: 현재)
 * @returns {{ week: number, elapsedWeeks: number, status: 'before'|'active'|'finished' }}
 */
function getCurrentWeek({ startDate, totalWeeks, now = new Date() }) {
  if (!Number.isInteger(totalWeeks) || totalWeeks < 1) {
    throw new Error('totalWeeks must be a positive integer');
  }
  const start = new Date(startDate).getTime();
  const elapsedWeeks = Math.floor((now.getTime() - start) / MS_PER_WEEK) + 1;

  let status = 'active';
  if (elapsedWeeks < 1) status = 'before';
  else if (elapsedWeeks > totalWeeks) status = 'finished';

  const week = Math.min(totalWeeks, Math.max(1, elapsedWeeks));
  return { week, elapsedWeeks, status };
}

module.exports = { getCurrentWeek, MS_PER_WEEK };
