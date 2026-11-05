# GEO Lab · 창업기업 성장 대시보드

창업기업이 4주 동안 자기 사이트의 검색(SEO)·AI 검색(GEO) 기반을 다지는 스터디용 대시보드입니다.
주차별 체크리스트, 성장 기록, 사이트 체크, 실행 가이드, 링크 모음, 회고 초안 생성을 한곳에서 제공합니다.

기존 스터디 대시보드를 게스트로 사용하며 분석한 결과를 바탕으로, 구조는 벤치마킹하되 아래 결함은 설계 단계에서 제거했습니다.

## 설계에서 제거한 결함 7가지

| # | 원본에서 관찰된 문제 | 이 프로젝트의 처리 |
|---|---|---|
| 1 | 주차가 커리큘럼(4주)을 넘어 WEEK 31까지 증가, 빈 체크리스트 노출 | `lib/week.ts` `resolveWeek()`가 항상 `[1, 총 주차]`로 클램프. 이동 버튼은 경계에서 비활성. 종료 후 접속 시 마지막 주차 + 안내 문구 |
| 2 | 대시보드(WEEK 16)와 기록 페이지(WEEK 04)의 "현재 주차"가 다름 | 모든 화면이 `StoreProvider`의 `selectedWeek` 하나를 공유. 기록 페이지의 체크리스트 인용도 같은 주차 |
| 3 | 완료 항목 재클릭 시 확인 없이 즉시 해제, 기록과 진행률 불일치 | 해제도 다이얼로그를 거침. "완료만 취소" / "기록도 삭제" 선택 |
| 4 | 목표 카드는 숨겨져 있는데 통계 타일은 `0/1` 표시 | 목표 카드를 실제로 제공. 목표가 없으면 분모를 만들지 않고 "목표를 추가해 보세요" 표시 |
| 5 | 모바일 하단 내비에 '사이트 체크' 탭 누락 | 내비 항목을 `NAV_ITEMS` 배열 하나에서 데스크톱·모바일 양쪽에 렌더 |
| 6 | 주차를 넘기기만 해도 localStorage에 빈 배열 기록 | 읽기 경로는 저장소를 쓰지 않음(`lib/persistent-store.ts`). 빈 주차 키는 저장하지 않음. 초기화는 확인 후 실제로 삭제 |
| 7 | 영문 오류("Invalid URL"), 토스트가 다른 페이지까지 잔존 | 오류 문구 전부 한국어(`lib/site-check.ts` `ERROR_MESSAGES`). 토스트는 3.5초 후 자동 소멸, 경로 변경 시 즉시 제거 |

그 밖에 "랭킹" 버튼이 랭킹이 아닌 회고 목록으로 가던 라벨 불일치, 모바일에서 문서 트리가 본문 위에 통째로 펼쳐지던 문제도 함께 정리했습니다(모바일은 select로 대체).

## 기능

- **대시보드**: 주차 인사말, 진행률, 체크리스트(완료 시 메모 다이얼로그), 목표, 최근 기록, 연속 기록
- **성장 기록**: 날짜·주차·체크리스트 인용과 함께 기록. 수정·삭제·복사
- **사이트 체크**: `/api/site-check`가 공개 페이지를 읽어 title, description, canonical, OG 3종, viewport, robots 메타, sitemap.xml, robots.txt 10개 항목을 점수화. 내부망 주소 차단, 8초 타임아웃, 1MB 제한
- **가이드**: 4주 커리큘럼에 맞춘 실행 가이드 8편 (`lib/docs.ts`)
- **링크 모음**: 검색 문서·웹마스터 도구·측정·검사 도구. 즐겨찾기와 사용자 정의 바로가기
- **회고**: 이 브라우저의 기록으로 회고 초안을 생성해 복사
- 다크 모드, 키보드 포커스 트랩이 있는 다이얼로그, 본문 건너뛰기 링크, 44px 터치 타깃

## 데이터와 인증

현재는 **로그인 없이** 모든 데이터를 브라우저 `localStorage`에 저장합니다(스키마 버전 포함).
계정·동기화가 필요해지면 `lib/persistent-store.ts`의 스토어를 서버 저장소로 교체하면 됩니다. 화면 코드는 바뀌지 않습니다.

## 설정

| 환경 변수 | 설명 | 기본값 |
|---|---|---|
| `NEXT_PUBLIC_PROGRAM_START` | 1주차 시작일 (YYYY-MM-DD) | `2026-11-02` |

커리큘럼(주차 제목, 체크리스트)은 `src/lib/curriculum.ts`에서 수정합니다. 주차 수는 이 파일의 길이로 결정됩니다.

## 개발

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm test           # Node 내장 테스트 러너 (주차 계산, 사이트 체크 파서)
npm run lint
npm run typecheck
npm run build
```

Node 22.18 이상이 필요합니다(테스트가 TypeScript를 직접 실행).

## 구조

```
src/
  app/              라우트 (dashboard, logs, site-check, info, links, stories, api/site-check)
  components/       화면 컴포넌트 (AppShell, Dialog, Toast, dashboard/, logs/, ...)
  lib/
    curriculum.ts   커리큘럼 데이터 (단일 출처)
    week.ts         주차 계산 · 클램프 · 연속 기록
    store.tsx       워크스페이스 상태 (React Context)
    persistent-store.ts  localStorage 외부 스토어 (useSyncExternalStore)
    site-check.ts   HTML 파서 · 점수 · 오류 메시지
    docs.ts / links.ts   가이드 · 링크 데이터
```
