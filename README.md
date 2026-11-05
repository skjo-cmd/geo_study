# GEO Study Lab

GEO/SEO 스터디 멤버 워크스페이스. [geo-study-member.vercel.app](https://geo-study-member.vercel.app)을 벤치마킹해 다시 만든 **게스트 전용 MVP**(백엔드·로그인 없음). 분석 내용은 `docs/benchmark-geo-study-member.md`.

## 기능

| 경로 | 내용 |
|---|---|
| `/dashboard` | 주차 미션, 진행률, 4주 체크리스트(주차 이동), 개인 목표, 최근 기록 |
| `/logs` | 성장 기록 작성·히스토리, 이번 주 미완료 체크리스트 인용 |
| `/site-check` | 공개 URL 12항목 진단(`POST /api/site-check`): 기본 SEO 10개 + JSON-LD + llms.txt, 검색엔진 5종 색인 링크 |
| `/info`, `/info/[slug]` | 단계별 가이드 (`data/guides.json`) |
| `/links` | 큐레이션 링크 21개, 즐겨찾기 (`data/links.json`) |

게스트 상태는 `localStorage`(`geo-study-guest-state`)에만 저장된다.

## 실행

```bash
npm install
npm run dev
```

```bash
npm run build && npm start
```

## 설정

- **과정 시작일·총 주차**: `data/curriculum.json` → `program.startDate`, `program.totalWeeks`.
  현재 주차는 `lib/currentWeek.js`가 `[1, totalWeeks]`로 clamp 해서 계산한다. 과정이 끝나면 마지막 주차에 머물고 대시보드에 "완료" 상태를 표시한다.
- **체크리스트 항목**: `data/curriculum.json` → `weeks[N].items`. `{ id, title, time?, category?: "research", isNew? }`.
- 검색 색인은 `next.config.ts`의 `X-Robots-Tag`와 `metadata.robots`로 전면 차단한다(멤버 전용 도구).

## 배포

Vercel에 저장소를 연결하면 추가 설정 없이 배포된다. `/api/site-check`는 Node.js 런타임을 사용한다.

## 다음 단계 (벤치마크 문서 §7)

1. Google 로그인 + 게스트 상태 → 계정 병합
2. 내 사이트 등록, 성장 리포트, 업적 랭킹
3. GEO 진단 고도화 (AI 답변 내 브랜드 노출 측정)
