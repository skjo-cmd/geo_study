# 벤치마크 분해: geo-study-member.vercel.app

새 사이트 제작의 기준이 되는 분석 문서. 2026-11-05 게스트 모드로 전 페이지 순회·기능 실행·번들 분석한 결과.

## 1. 한 줄 정의

GEO/SEO 스터디 멤버 전용 워크스페이스. **4주 커리큘럼을 따라 자기 사이트의 검색·AI 노출을 개선하고, 그 과정을 기록**하는 도구. 주차별 체크리스트 + 성장 다이어리 + 간이 SEO 진단기의 결합.

## 2. 기술 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Next.js App Router (Turbopack) | 대시보드는 prerender된 로딩 셸 → 클라이언트에서 인증 판정 후 렌더 |
| 인증 | Firebase Auth (Google 로그인) | IndexedDB `firebaseLocalStorageDb` 확인 |
| 호스팅 | Vercel | `/` → `/dashboard` 307 리다이렉트 |
| 서버 API | `POST /api/site-check` | 유일한 자체 API. URL 받아 서버에서 fetch·파싱 |
| 게스트 저장소 | `localStorage` | 키: `geo-study-guest-dashboard`, `geo-study-recent-site-checks`, `geo-study-favorite-resources`, `geo-study-custom-pages` |
| 검색 노출 | 전면 차단 | `robots.txt: Disallow /` + 전 페이지 `noindex,nofollow` (멤버 전용 의도) |

## 3. 정보구조

| 라우트 | 역할 | 게스트 |
|---|---|---|
| `/dashboard` | 허브: 주차 미션, 진행률 링, 체크리스트, 최근 기록, 내 사이트 | 체험 가능 |
| `/site-check` | 공개 URL 10항목 SEO 진단 + 검색엔진별 색인 딥링크 | 완전 동작 |
| `/logs` | 성장 기록 (날짜, 이미지 최대 3장 WebP 변환, 체크리스트 인용, 사이트 연결) | 체험 가능 |
| `/my-sites` | 사이트 등록·목표·질문·운영 링크 | 로그인 필요 |
| `/info/*` | 단계별 가이드 10여 종 (사이트 선정, 검색엔진 등록, GA, 봇 뷰, 도메인, GEO 전략, 프롬프트 모음…) | 열람 |
| `/links` | 21개 큐레이션 링크, 5개 카테고리, 즐겨찾기·커스텀 페이지 | 열람 |
| `/growth-report` | 개인 성장 리포트 (GPTers 닉네임 매칭) | 게스트 불가 |
| `/growth-review` | 성장 업적 랭킹 | 게스트는 대시보드로 폴백 |

전역 요소: 상단 네비 7개 + 게스트 배지 + "둘러보기 종료", 파란 배너(랭킹/리포트 CTA), 모바일 하단 탭 5개.

## 4. 데이터 모델

### 커리큘럼 (번들 하드코딩, 주차 번호 키)
```
{ [weekNumber]: Array<{ id, title, time?, category?: "research", isNew?: boolean }> }
```
실데이터는 `data/curriculum.json`. **1~4주차만 존재.** 3주차 항목 id가 `week2-*`로 돼 있는 등 id 명명 불일치가 있어 새 사이트에서는 `week{N}-*`로 정규화했다.

### 게스트 대시보드 상태 (`geo-study-guest-dashboard`)
```json
{
  "profile": { "displayName", "email", "photoURL", "role": "member", "status": "active", "cohortId": "geo-study-01", "siteUrls": [] },
  "goals": [], "logs": [], "memberSites": [],
  "completedItemsByWeek": { "week-16": [] }
}
```

### 사이트 체크 결과 (10항목, N/10 점수)
title · description · canonical · og:title · og:description · og:image · viewport · robots meta · sitemap.xml · robots.txt. 각 항목 "확인됨/확인 안 됨" + 실제 값. 보조: Google/Naver/Daum/Bing/Brave `site:` 링크, PageSpeed, Schema.org Validator.

## 5. 발견한 결함과 새 사이트에서의 처리

| # | 결함 | 원인 | 새 사이트 처리 |
|---|---|---|---|
| 1 | 현재 주차가 16으로 표시, 체크리스트 "준비 중" (0/0) | `max(1, floor((now-start)/주)+1)` 에 **상한 없음**. 7월 중순 시작 기준 16주 경과 | `lib/currentWeek.js`: `[1, totalWeeks]`로 clamp + `status: finished` 반환 → 종료 후 상태 UI 제공 |
| 2 | 주차 라벨이 매주 동일 ("검색 기반 만들기 / 기준선 리포트 완성") | 주차별 데이터가 아니라 JSX 고정 문구 | 주차별 `title`을 데이터에 둠 (curriculum.json) |
| 3 | 진단기가 전통 SEO만 측정, GEO 항목 없음 | 체크리스트엔 llms.txt·AI 노출이 있으나 자동 진단엔 미반영 | 진단 항목에 `llms.txt` 존재, JSON-LD 파싱, OG 완성도 추가 |
| 4 | 네비 hover마다 전 라우트 RSC 프리페치 반복 (`_rsc` 요청 수십 건) | 기본 `<Link prefetch>` 과다 | 프리페치 `false` 또는 viewport 기준 |
| 5 | 게스트 데이터 브라우저 한정, 로그인 시 이관 경로 불명 | localStorage 전용 | 로그인 전환 시 게스트 상태 → 계정 병합 플로우 |
| 6 | 모바일에서 진행률 카드 문구와 하단 탭 겹침 의심 | sticky 탭 z-index/여백 | 하단 탭 높이만큼 본문 padding-bottom |
| 7 | 신규가입 중단 상태 고지만 있고 대기 신청 없음 | — | 대기 리스트/문의 CTA |

## 6. 그대로 가져올 가치가 있는 패턴

- **로그인 없이 둘러보기**: 가입 전 전체 가치를 체험시키고 "브라우저에만 저장" 한계를 명시. 전환 동선의 핵심.
- **진단 → 다음 행동 연결**: 점수만 주지 않고 검색엔진별 색인 확인·PageSpeed·Schema 검증으로 바로 보냄.
- **체크리스트 인용 기록**: 성장 기록 작성 시 이번 주 미완료 항목을 끌어와 "무엇을 했는지"를 구조화.
- **진행률 링 + 3 KPI 카드**(체크리스트 / 개인 목표 / 연속 기록): 동기 부여 핵심 지표만 노출.
- **격려형 카피 톤**: "게스트님, 오늘도 한 걸음." / "작은 기록이 4주 뒤 선명한 성장의 증거가 돼요."
- **비주얼**: 흰 배경, 라운드 카드, 블루(#2457ff 계열) 포인트 + 라임 하이라이트, Geist 폰트.

## 7. 재구축 권장 범위 (MVP → 확장)

1. **MVP (게스트 전용, 백엔드 없음)**: 대시보드 + 4주 체크리스트(clamp 적용) + 성장 기록 + 사이트 체크 API + 정보/링크. 상태는 localStorage.
2. **인증 추가**: Google 로그인, 게스트 상태 → 계정 병합.
3. **멤버 기능**: 내 사이트 등록, 성장 리포트, 업적 랭킹.
4. **GEO 진단 고도화**: llms.txt·JSON-LD·AI 답변 노출 측정.
