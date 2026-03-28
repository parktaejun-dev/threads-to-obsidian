# Cloud Save 상업용 하드닝 계획

기준일: `2026-03-28 (Supabase Postgres 마이그레이션 완료)`

## 최근 업데이트 (2026-03-28)

- **운영용 DB 전환 완료**: 단일 JSON 파일 기반 저장소에서 Supabase Postgres(Session Pooler, IPv4)로 마이그레이션을 완료했습니다. 이로써 `Phase 3`의 핵심 목표가 달성되었으며, 파일 손상에 따른 데이터 유실 위험과 다중 프로세스/스케일아웃 제약이 해소되었습니다.

## 문서 목적

이 문서는 `Threads Archive Cloud Save`와 `scrapbook SaaS`를 상업용으로 운영하기 위해 필요한 보안, 데이터, 운영 구조 개선 계획을 정리한다.

대상 코드 기준점:

- cloud save / scrapbook API: `packages/web-server/src/server.ts`
- scrapbook 도메인 로직: `packages/web-server/src/server/bot-service.ts`
- 저장소 계층: `packages/web-server/src/server/store.ts`
- extension cloud save 경로: `packages/extension/src/background.ts`
- extension cloud API 클라이언트: `packages/extension/src/lib/cloud-server.ts`
- scrapbook UI: `packages/web-client/src/scrapbook/main.ts`

## 현재 판단

현재 구현은 `기능 데모 가능` 상태다.

현재 구현은 아직 `상업용 운영 가능` 상태가 아니다.

출시 차단급 이슈:

- `CSRF / 세션 경계`
- ~~`파일 기반 JSON 저장소`~~ (해결됨: Supabase Postgres 전환 완료)
- ~~`데이터 파일 손상 시 전체 초기화 가능성`~~ (해결됨)
- `서버측 임의 URL fetch 가능성`

운영 보강 필요 이슈:

- cloud save 세션 확인 UX
- 로컬 캐시 기반 중복 판단
- archive 삭제 부재
- read 요청의 과도한 write 유발

## 출시 정책

### 즉시 결정

- `Cloud Save`는 아래 `Phase 1` 완료 전까지 `GA 출시 금지`
- `Obsidian local-only` 경로는 별도 출시 가능
- `scrapbook SaaS`는 내부 테스트 또는 제한 베타만 허용

### 출시 허용 조건

- `Phase 1` 전부 완료
- `Phase 2` 핵심 항목 완료
- ~~`Phase 3` 중 `Postgres 전환` 완료~~ (완료)
- 운영 모니터링 및 백업 절차 문서화 완료

## 핵심 문제 요약

### 1. 세션 / CSRF 경계가 약함

현재 HTTPS 환경에서는 scrapbook 세션 쿠키가 `SameSite=None`으로 내려가고, mutating route는 대부분 쿠키만 보고 인증한다.

이 상태에서는 외부 사이트에서 사용자의 의도 없이 상태 변경 요청을 유발할 수 있다.

대표 영향 경로:

- watchlist 생성 / 삭제
- search monitor 생성 / 삭제
- sync
- logout
- cloud save

### ~~2. 백엔드 저장소가 운영용 DB가 아님~~ (해결 완료)

~~현재 저장소는 단일 JSON 파일을 통째로 읽고, 메모리에서 수정한 뒤, 다시 통째로 쓰는 구조다.~~
**(26.03.28 업데이트: Supabase Postgres로 전환하여 해결)**

### ~~3. 파일 손상 시 fail-safe가 아니라 fail-open~~ (해결 완료)

~~DB 파일 parse 실패나 일시적 read 오류가 나면, 현재 로직은 새 기본 DB를 만들어 덮어쓴다.~~
**(26.03.28 업데이트: Postgres 도입으로 파일 덮어쓰기 위험 제거)**

### 4. 서버가 사용자 제공 media URL을 그대로 fetch함

cloud save payload는 사용자가 보낸 post / media URL을 저장하고, ZIP export 때 서버가 해당 URL을 다시 fetch한다.

URL allowlist가 없으면 SSRF 성격의 내부망 접근 경로가 열린다.

### 5. product correctness가 아직 덜 닫힘

- popup에서 cloud save 준비 상태를 실제 세션 기준으로 확인하지 않음
- local cache 기준으로 이미 저장됨 판단
- cloud archive 삭제 불가
- cloud resave 시 정렬 시각이 즉시 갱신되지 않음
- extension에서 저장 후 cloud deep link를 적극적으로 노출하지 않음

## 권장 목표 아키텍처

### 인증 / 세션

권장 방향은 `웹 세션 쿠키`와 `익스텐션 cloud save 인증`을 분리하는 것이다.

#### 웹 앱

- `threads_bot_session`은 `SameSite=Lax` 유지
- 웹에서 발생하는 상태 변경 요청은 `Origin` 검증 적용
- 필요 시 CSRF token 추가

#### 익스텐션

- cookie 기반 cross-site POST를 사용하지 않음
- `extension link session` 또는 `short-lived extension token` 방식으로 전환
- scrapbook 웹에서 `Connect Extension`을 실행하면 서버가 짧은 수명의 extension token 발급
- extension은 이 token으로 `/api/extension/cloud/save`만 호출
- 서버는 이 token을 scrapbook user와 직접 매핑

이 구조로 바꾸면:

- `SameSite=None` 제거 가능
- CSRF 공격면 대폭 축소
- extension-only 세션 상태 확인 가능
- popup UX 개선 가능

### 데이터 저장소 (✅ 전환 완료)

권장 방향이었던 `Postgres` 전환이 2026-03-28부로 완료되었다. 현재 Supabase Postgres를 백엔드로 사용 중이다.

권장 구성 (진행 상태):

- ✅ `Postgres` (Supabase 사용 중)
- ⏳ migration 도구: `Drizzle` 또는 `Prisma` 중 하나로 통일 필요 (현재는 `pg` 드라이버로 원시 쿼리 사용 중)
- ⏳ 아카이브 본문 / raw payload / 세션 / 라이선스 / monitor 전부 정규화된 테이블화 (현재는 `JSONB` 컬럼 하나에 통째로 저장 중)
- ⏳ idempotent upsert 기준은 `user_id + content_hash` 또는 `user_id + canonical_url` 적용 필요

### 미디어 처리

권장 방향:

- 서버가 임의 URL을 자유롭게 fetch하지 않음
- 허용 origin allowlist 적용
- private IP / loopback / link-local / RFC1918 차단
- export 시에도 allowlisted host만 접근

장기적으로는 두 가지 중 하나를 선택한다.

1. `metadata only`
- media는 원격 URL만 보관
- ZIP export 시 원격 URL 링크만 남김

2. `controlled media import`
- 허용된 Threads/CDN origin만 object storage로 복제
- export는 object storage 기준으로 생성

초기 상업 운영은 `1`이 더 안전하다.

## 단계별 실행 계획

## Phase 1. 출시 차단 이슈 제거

목표: `Cloud Save를 외부에 열기 전에 반드시 해결해야 하는 항목`

### 1-1. cookie 기반 extension 인증 제거

작업:

- `cloud save` 전용 서버 엔드포인트를 별도 namespace로 분리
- scrapbook 로그인 상태에서 extension 연결용 short-lived token 발급
- extension은 이후 cookie 없이 bearer token만 사용
- `threads_bot_session`은 다시 `SameSite=Lax`로 회귀

산출물:

- `POST /api/extension/cloud/save`
- `POST /api/public/bot/extension/link/start`
- `POST /api/public/bot/extension/link/complete`
- extension 내 linked session 저장 구조

수용 기준:

- 외부 웹사이트에서 scrapbook 상태 변경 POST를 보내도 성공하지 않음
- cloud save가 cookie 없이 정상 동작
- 로그인 브라우저와 extension 연결 해제/재연결 가능

### 1-2. JSON parse 실패 시 초기화 금지

작업:

- `loadDatabaseUnsafe()`에서 `ENOENT`만 신규 DB 생성 허용
- parse 실패 / read 실패는 서버 시작 실패 또는 request 실패로 처리
- 손상 파일은 `*.corrupt-<timestamp>.json`으로 보존
- 장애 로그를 남기고 자동 초기화 금지

수용 기준:

- 손상된 DB 파일이 있어도 기존 파일이 덮어써지지 않음
- 운영자가 복구할 수 있도록 원본 파일이 보존됨

### 1-3. SSRF 방어

작업:

- export 시 fetch 가능한 host allowlist 도입
- `threads.com`, `threads.net`, `cdninstagram.com`, `fbcdn.net` 등만 허용
- private IP, loopback, localhost, raw IP literal 차단
- URL scheme는 `https`만 허용

수용 기준:

- `http://127.0.0.1`, `http://169.254.*`, `http://10.*`, `http://192.168.*` 등 차단
- allowlist 외 URL은 export에서 remote link 유지 또는 생략

### 1-4. read path에서 write 제거

작업:

- `GET /api/public/bot/session`은 pure read로 변경
- `lastSeenAt`은 별도 비동기 touch endpoint 또는 write-behind buffer로 이동
- session polling이 DB 전체 rewrite를 발생시키지 않게 변경

수용 기준:

- scrapbook 첫 진입 / refresh / polling이 DB write를 만들지 않음

## Phase 2. 제품 정확성 보강

목표: `상업용 사용성 / 지원 비용 / 데이터 일관성 문제 해결`

### 2-1. popup / options에서 실제 cloud 연결 상태 반영

작업:

- extension용 `cloud session status` endpoint 추가
- popup에서 `ready / linked / expired / login required` 구분
- options에도 `Cloud connected` 상태 표시

수용 기준:

- 로그인 안 된 상태에서 cloud target 선택 시 저장 버튼이 비활성화되거나 명확한 안내 표시
- expired 상태를 사전에 감지 가능

### 2-2. 서버 기준 duplicate 판단 추가

작업:

- `saveCurrentPost()`의 local-only duplicate short-circuit 제거
- 서버가 `created: false`를 반환하도록 authoritative duplicate 판단 수행
- local recent save는 표시용 캐시로만 사용

수용 기준:

- 로컬 recent save가 지워졌거나 stale해도 서버 archive 기준으로 일관되게 동작
- 서버에서 삭제한 archive는 다시 저장 가능

### 2-3. archive 삭제 기능 추가

작업:

- `DELETE /api/public/bot/archive/:id`
- scrapbook UI 상세 패널에 `삭제`
- extension 최근 저장에서도 cloud target일 때 remote delete 선택 가능 여부 검토

수용 기준:

- 사용자가 저장한 cloud archive를 self-service로 삭제 가능
- 삭제 후 inbox / ZIP export / detail view에서 즉시 반영

### 2-4. cloud resave 시 정렬 기준 수정

작업:

- `savedAt`과 `updatedAt` 역할을 분리
- UI 정렬 기준을 `updatedAt DESC` 또는 `lastTouchedAt DESC`로 변경

수용 기준:

- 방금 resave한 항목이 기대한 위치로 즉시 이동

### 2-5. extension에서 deep link 노출

작업:

- recent save UI에 `Cloud 열기`
- 저장 직후 상태 메시지에 scrapbook 열기 액션 제공

수용 기준:

- 사용자가 저장 직후 cloud archive 상세로 바로 이동 가능

## Phase 3. 운영용 DB 전환 (✅ 1차 완료)

목표: `단일 JSON 파일 저장소 제거` -> **2026-03-28 달성 완료**

### 3-1. Postgres 스키마 정규화 (진행 예정)

*현재 1차 마이그레이션은 기존 구조를 유지한 채 JSONB 컬럼에 데이터를 넣는 방식으로 완료되었습니다. 향후 성능 및 관리 용이성을 위해 테이블 정규화가 필요합니다.*

우선 정규화 전환 대상:

- `bot_users`
- `bot_sessions`
- `bot_archives`
- `cloud_archives`
- `watchlists`
- `search_monitors`
- `search_results`
- `tracked_posts`
- `insights_snapshots`
- `licenses`
- `license_activations`
- `notion_connections`

핵심 인덱스:

- `cloud_archives (user_id, content_hash)`
- `cloud_archives (user_id, canonical_url)`
- `bot_sessions (session_hash)`
- `bot_users (threads_user_id)`
- `search_results (user_id, monitor_id, external_post_id)`

### 3-2. migration 전략 (✅ 완료)

작업 내역:

- ✅ JSON snapshot -> Postgres one-time import script 작성 (`migrate-web-db-to-postgres.mjs`)
- ✅ Supabase Postgres 세팅 및 연결 (Session Pooler IPv4 사용)
- ✅ cutover 완료 및 PM2 재시작

### 3-3. 저장소 추상화 (⏳ 진행 중)

작업:

- ✅ `store.ts` 환경 변수에 따른 Backend Switchable 구조 적용 (File vs Postgres)
- ⏳ 비즈니스 로직에서 JSON 전용 타입 의존 완전 제거
- ⏳ transaction boundary를 DB transaction으로 옮김

수용 기준:

- `bot-service.ts`, `notion-service.ts`, `scrapbook-plus-service.ts`가 파일 저장 구현을 직접 모르도록 정리

## Phase 4. 운영 하드닝

목표: `장애 복구, 관측성, 지원 대응 가능 상태`

### 4-1. 로그 / 메트릭 / 알림

도입 항목:

- request id
- auth failure reason
- cloud save success/failure ratio
- ZIP export latency
- DB query latency
- queue / job failure count

### 4-2. 백업 / 복구

도입 항목:

- Postgres daily backup
- point-in-time recovery 전략
- archive 삭제 audit log
- 운영자 복구 runbook

### 4-3. rate limit

도입 항목:

- cloud save per user / per minute
- ZIP export per user / per hour
- watchlist/search sync burst limit

### 4-4. 개인정보 / 데이터 정책

정리 항목:

- archive retention 정책
- user delete request 처리 절차
- support/admin access 원칙
- privacy policy 반영

## 추천 작업 순서

### 1주차

- Phase 1-2 전부 착수
- cookie 기반 extension 인증 제거 설계 확정
- JSON parse failure 초기화 제거
- SSRF 차단
- read path write 제거

### 2주차

- popup/options cloud session 상태 반영
- server-authoritative duplicate 처리
- archive 삭제 기능
- deep link 액션 추가

### 3주차

- Postgres schema / migration code
- repository 계층 분리
- import rehearsal

### 4주차

- cutover
- backup / metrics / alerts
- limited beta

## 수용 기준

다음이 만족되면 `Cloud Save beta`는 허용 가능하다.

- CSRF 경로 제거
- cookie 기반 extension auth 제거
- JSON 손상 시 데이터 초기화 제거
- SSRF 차단
- 서버 authoritative duplicate 처리
- archive 삭제 가능
- cloud session 상태가 popup에 반영

다음이 만족되면 `Cloud Save GA`를 검토할 수 있다.

- ~~Postgres 전환 완료~~ (해결됨)
- backup / restore 점검 완료
- rate limit 적용
- 운영 모니터링 대시보드 준비
- 장애 대응 runbook 준비

## 비목표

이 문서는 다음을 다루지 않는다.

- object storage full media pinning의 최종 설계
- multi-region 배포
- 팀 협업용 workspace 모델
- 모바일 앱 전략

## 최종 권고

지금 바로 해야 할 일은 기능 추가가 아니라 `경계 재설계`다.

정리하면:

1. `cloud save 인증을 web session cookie에서 분리`
2. ~~`파일 기반 JSON 저장소를 운영 DB로 전환`~~ (완료)
3. `SSRF / CSRF / 데이터 유실 경로를 먼저 닫기`
4. `그 다음에 UX와 운영 도구를 보강`

현재 구조에서 local save는 출시 가능하지만, cloud save는 이 문서의 `Phase 1` 완료 전까지 상업용으로 열면 안 된다.
