# Advanced Features Roadmap

기준일: `2026-03-25`

## 문서 목적

이 문서는 현재 mention scrapbook 중심 구조 위에 다음 고급 기능을 단계적으로 도입하기 위한 목표와 구현 계획을 정리한다.

- `threads_profile_discovery`
- `threads_keyword_search`
- `threads_manage_insights`

대상 코드 기준점:

- 인증 / scrapbook 도메인: `src/web/server/bot-service.ts`
- 멘션 수집기: `src/web/server/bot-mention-service.ts`
- 데이터 스키마: `src/web/lib/schema.ts`
- scrapbook UI: `src/web/scrapbook/main.ts`

## 제품 목표

- mention-triggered scrapbook을 `수동 수집 도구`에서 `지속 수집 + 모니터링 + 분석 도구`로 확장한다.
- 기존 mention scrapbook 흐름을 깨지 않고 고급 기능을 계정 단위로 점진 도입한다.
- 사용자에게 `Inbox / Watchlists / Searches / Insights` 네 가지 워크플로를 제공한다.

## 비목표

- 타인 계정의 비공개 데이터 분석
- DM inbox 자동 수집
- 기존 mention scrapbook 데이터를 파기하거나 포맷을 바꾸는 파괴적 전환

## 현재 구조 요약

- 저장소는 `output/web-admin-data.json` 기반 JSON 파일이다.
- 사용자 상태는 `botUsers`, `botSessions`, `botArchives` 중심으로 관리된다.
- 수집 작업은 mention collector 하나에 집중되어 있다.
- 웹 UI는 scrapbook 화면 한 종류로 구성되어 있고, 아카이브 조회와 export에 초점이 맞춰져 있다.

이 구조는 mention scrapbook 프로토타입으로는 충분하지만, 검색 결과 적재, 공개 프로필 동기화, 인사이트 시계열 저장을 감당하기에는 부족하다.

## 공통 선행 작업

### 1. OAuth scope 확장

- 추가 scope:
  - `threads_profile_discovery`
  - `threads_keyword_search`
  - `threads_manage_insights`
- 기존 사용자에 대해서는 재동의 플로우를 제공한다.
- scope 부족 시 기능별로 UI에서 명확히 차단하고 재연결을 유도한다.

### 2. 권한 상태 저장

`BotUserRecord` 확장안:

- `grantedScopes: string[]`
- `scopeVersion: number`
- `lastScopeUpgradeAt: string | null`

목적:

- 사용자별 사용 가능 기능 판별
- 재동의 필요 여부 판단
- 점진 배포 중 스키마 마이그레이션 추적

### 3. Threads API 클라이언트 분리

신규 모듈 제안: `src/web/server/threads-client.ts`

책임:

- 프로필 탐색 API 호출
- 키워드 검색 API 호출
- 인사이트 API 호출
- 장기 토큰 갱신
- 공통 에러 파싱
- rate limit / retry 정책
- API 응답 정규화

### 4. 저장소 재설계

운영 단계에서는 JSON 파일 저장소를 유지하지 않는다. 최소 `SQLite`로 이동한다.

이유:

- 검색 결과량 증가
- 인사이트 시계열 적재 필요
- 다중 잡 동시성 증가
- watchlist / search monitor / snapshot 단위 조회 필요

### 5. 백그라운드 잡 러너 도입

mention collector와 별도로 다음 잡을 둔다.

- `discovery sync`
- `search monitor sync`
- `insights snapshot sync`

운영 원칙:

- 잡은 모두 idempotent 해야 한다.
- 마지막 커서와 마지막 성공 시각을 저장한다.
- quota 초과와 인증 오류를 분리해서 기록한다.

## 데이터 모델 초안

기존 mention scrapbook 모델 외에 다음 엔티티를 추가한다.

### `watchlists`

- 사용자별 감시 계정 목록
- 대상 공개 계정 식별자
- 필터 규칙
- 자동 저장 여부
- digest 주기
- 마지막 동기화 커서 / 시각

### `search_monitors`

- 사용자별 저장 검색어
- 실행 주기
- 작성자 필터
- 결과 점수 기준
- 노이즈 제외 규칙
- 마지막 실행 시각

### `search_results`

- 검색 결과 원문
- dedupe 키
- 상태: `new | seen | archived | dismissed`
- 어떤 monitor에서 생성됐는지
- matched terms

### `tracked_posts`

- 인사이트 추적 대상 포스트
- 작성자 식별자
- 공개 URL / Threads post id
- 추적 시작 시각

### `insights_snapshots`

- 포스트 또는 프로필 단위 metric snapshot
- 수집 시각
- view / like / reply / repost 등 정규화 metric 컬럼
- 이전 스냅샷 대비 delta 계산용 원본 값

### `saved_views`

- UI에서 저장해 둔 필터 조합
- watchlist / search / insights 뷰 프리셋

## 기능별 구현 계획

## 1. Profile Discovery

### 목표

공개 계정 감시와 공개 글 수집을 scrapbook의 수동 저장에서 계정 기반 수집으로 확장한다.

### 사용자 기능

- Watchlist 추가 / 제거
- 계정별 새 글 자동 적재
- 주제별 컬렉션
- 텍스트 / 태그 / 링크 포함 조건
- 미디어 유형별 필터
- 계정별 digest

### 서버 구현

- 공개 프로필 조회 API 연결
- 공개 포스트 목록 동기화
- 마지막 수집 커서 저장
- 신규 포스트 diff 계산
- 필터 규칙을 통과한 결과만 archive 후보로 생성

### UI 구현

- scrapbook UI를 `Inbox / Watchlists / Searches / Insights` 4개 섹션으로 재편
- Watchlists 탭에서 계정 추가, 최근 포스트 미리보기, 자동 저장 규칙 편집 지원

### 리스크

- 공개 계정만 대상
- 대량 감시는 quota 비용이 큼
- watchlist 수 상한과 sync 빈도 정책이 필요

## 2. Keyword Search

### 목표

저장 도구를 모니터링 도구로 확장한다.

### 사용자 기능

- 저장 검색어
- 주기적 수집
- 작성자 필터
- 결과 점수화
- 결과 일괄 archive
- 주간 digest
- 반복 노이즈 계정 제외

### 서버 구현

- monitor 정의 저장
- 주기 실행
- dedupe 키 계산
- 결과 상태 저장: `new`, `seen`, `archived`, `dismissed`
- export 메타데이터 확장:
  - `query`
  - `matched_terms`
  - `discovered_at`
  - `author_handle`

### UI 구현

- 검색어 생성기
- 결과 스트림
- 필터 바
- `전부 저장`
- `조건 저장`
- `관심 없음`

### 리스크

- 결과량이 많아 JSON 저장소는 병목
- 검색 응답 노이즈가 크므로 클러스터링 / 점수화 로직이 중요

## 3. Insights

### 목표

연결된 사용자의 자기 계정 성과 분석을 붙여 scrapbook을 creator 운영 도구로 확장한다.

### 범위 원칙

- 공개 타인 계정 분석이 아니라 `인증한 사용자 자신의 profile/posts insights`에 집중한다.
- 단발 조회보다 시계열 snapshot을 우선한다.

### 사용자 기능

- 내 포스트 성과 대시보드
- 시간대별 snapshot
- 성과 급등 알림
- 상위 포스트 묶음
- archive export에 성과 메타데이터 첨부
- 참고 포스트와 내 포스트의 비교 화면

### 서버 구현

- 추적 대상 포스트 등록
- 주기 snapshot 수집
- 시계열 저장
- 24시간 / 7일 delta 계산
- 프로필 단위와 포스트 단위 metric 분리

### UI 구현

- Insights 탭
- sparkline
- velocity badge
- 기간 비교
- top posts
- export with metrics

### 리스크

- snapshot 잡이 멈추면 기능 가치가 급감
- quota와 freshness 사이 균형이 중요

## 단계별 실행 순서

### 1단계. 공통 기반

- scope 확장
- 재동의 플로우
- Threads API client 도입
- SQLite 마이그레이션
- 잡 러너 기반 추가

### 2단계. Profile Discovery

- watchlist 모델
- 공개 프로필 / 공개 포스트 정규화
- watchlist UI

### 3단계. Keyword Search

- monitor 모델
- 검색 결과 적재
- 결과 상태 머신
- 검색 결과 보드 UI

### 4단계. Insights

- tracked post 모델
- snapshot 적재
- dashboard / 비교 화면

순서를 이렇게 두는 이유는 1단계에서 공개 포스트 정규화 기반을 만들고, 2단계와 3단계가 이를 재사용하며, 4단계는 별도 시계열 저장이 필요하기 때문이다.

## 권장 일정

- 1주차: scope 확장, re-consent, Threads API client, DB 마이그레이션
- 2-3주차: Profile Discovery
- 4-5주차: Keyword Search
- 6-7주차: Insights
- 8주차: quota 튜닝, app review 문서, 운영 대시보드

## 백엔드 엔드포인트 초안

현재 구현에 바로 추가하기 쉬운 공개 API 초안:

- `GET /api/public/bot/scopes`
- `POST /api/public/bot/oauth/upgrade`
- `GET /api/public/watchlists`
- `POST /api/public/watchlists`
- `PATCH /api/public/watchlists/:id`
- `DELETE /api/public/watchlists/:id`
- `GET /api/public/search-monitors`
- `POST /api/public/search-monitors`
- `PATCH /api/public/search-monitors/:id`
- `DELETE /api/public/search-monitors/:id`
- `GET /api/public/search-results`
- `POST /api/public/search-results/archive`
- `POST /api/public/search-results/dismiss`
- `GET /api/public/insights/overview`
- `GET /api/public/insights/posts`
- `GET /api/public/insights/posts/:id/snapshots`

## UI 개편 방향

현재 scrapbook 화면은 아카이브 목록 중심이다. 고급 기능 도입 후에는 다음처럼 재구성한다.

- `Inbox`: mention 기반 저장과 자동 적재된 신규 항목
- `Watchlists`: 공개 계정 추적과 규칙 편집
- `Searches`: 저장 검색어, 결과 큐, 일괄 처리
- `Insights`: 자기 계정 성과와 비교 뷰

기존 `archives` 테이블은 Inbox의 한 뷰로 흡수한다.

## 출시 기준

- 사용자별 scope 상태가 UI에서 보인다.
- scope 부족 시 기능별로 명확한 안내가 나온다.
- 기존 mention scrapbook은 그대로 동작한다.
- 모든 수집 작업은 idempotent 하다.
- 수집 실패, quota 초과, scope 부족이 분리 기록된다.
- export 결과에 새 메타데이터가 일관되게 포함된다.

## 운영 리스크와 대응

- API quota 초과:
  - 사용자별 watchlist 수 상한
  - monitor 실행 주기 상한
  - retry backoff
- 저장소 증가:
  - snapshot 보존 기간 정책
  - 오래된 검색 결과 archive / purge 정책
- 재동의 누락:
  - 기능 접근 시 blocking banner
  - scope version 비교로 재인증 유도

## 후속 구현 단위

이 문서 다음 단계에서 바로 세분화할 항목:

- SQLite 스키마 설계서
- JSON -> SQLite 마이그레이션 계획
- 엔드포인트 상세 계약서
- 잡 실행 주기 / quota 계산표
- scrapbook UI IA 와 화면 상태도
