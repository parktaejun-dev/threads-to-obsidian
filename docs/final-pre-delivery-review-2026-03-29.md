# 납품 전 최종 점검 보고서 및 수정계획

기준일: `2026-03-29`

## 1. 정책 전제

이번 수정계획은 아래 정책을 확정 전제로 둔다.

- 모든 다국어는 직접 번역한다.
- 월간 가격 `US$2.99` 고정은 정책상 의도된 동작이다.

따라서 아래 두 항목은 더 이상 결함으로 보지 않는다.

- 비한국어 랜딩이 한국어 persisted storefront 문구를 자동 반영하지 않는 점
- 체크아웃 월간 가격이 storefront 설정값으로 바뀌지 않는 점

대신 수정계획은 `운영 문서 정렬`, `직접 번역 누락 제거`, `정책을 문서와 체크리스트에 반영`하는 데 초점을 둔다.

## 2. 현재 판단

현재 판정은 `HOLD`다.

사유는 세 가지다.

1. 실운영 PM2 split-role 토폴로지와 배포 문서가 충돌한다.
2. 직접 번역 정책을 만족하지 못하는 UI 문자열이 남아 있다.
3. 초기 설정 문서와 예시값이 현재 운영 기준과 완전히 맞지 않는다.

반면 코드 상태 자체는 현재 기준으로 녹색이다.

- `npm run typecheck`: 통과
- `npm test`: `111/111` 통과
- `npm run build`: 통과
- 로컬 서버에서 `GET /health`, `GET /ready`, `GET /api/public/storefront` 확인
- 브라우저 점검: `/`, `/checkout`, `/scrapbook` 렌더링 확인
- `/install`: HTTP `200` 확인

브라우저 자동화는 Lightpanda 연결 Playwright MCP를 먼저 시도했으나 기존 브라우저 프로필 lock 때문에 세션을 확보하지 못해, 이번 점검에 한해 Playwright CLI + Chromium으로 폴백했다.

## 3. 정정된 판단

### 3.1 월간 가격 `US$2.99` 고정

이 항목은 수정 대상에서 제외한다.

근거:

- `packages/web-client/src/checkout/main.ts:47-48`
- `packages/web-client/src/checkout/main.ts:463-477`

판단:

- 현재 구현은 정책과 일치한다.
- 수정계획에는 포함하지 않는다.

### 3.2 비한국어 랜딩의 persisted storefront 미반영

이 항목은 `코드 결함`이 아니라 `정책/운영 프로세스 정리 대상`으로 재분류한다.

근거:

- `packages/web-server/src/server.ts:2575-2588`
- `packages/web-client/src/landing/main.ts:811-835`

판단:

- 비한국어 카피를 직접 번역으로 운영한다면, 한국어 persisted storefront를 비한국어 화면에 그대로 투영하지 않는 현재 동작은 정책 위반으로 볼 수 없다.
- 대신 운영자가 storefront를 수정할 때 비한국어 카피는 별도 번역 갱신이 필요하다는 점을 문서와 체크리스트에 명시해야 한다.

## 4. 실제 수정 대상

### P1. 운영 문서가 실제 PM2 split-role 토폴로지와 충돌한다

영향:

- 문서만 보고 배포하면 `threads-obsidian`만 재시작하고 실제 운영 중인 `threads-obsidian-public*`, `threads-obsidian-worker`는 그대로 둘 수 있다.
- 그 경우 일부 프로세스가 이전 코드를 계속 서빙하는 배포 사고가 날 수 있다.

근거:

- `AGENTS.md:7-15`
- `AGENTS.md:24-30`
- `README.md:99-104`
- `README.md:173-194`
- `docs/launch-checklist.md:71-79`
- `docs/deployment-architecture.md:41-64`
- `docs/deployment-architecture.md:66-74`
- `docs/deployment-architecture.md:107-135`
- `ecosystem.config.cjs:1-17`
- `ecosystem.scale.config.cjs:101-125`

판정:

- `P1 / HOLD`

### P1. 직접 번역 정책을 만족하지 못하는 install 페이지 문자열이 남아 있다

영향:

- 비한국어 install 화면에서 CTA 일부가 한국어로 그대로 노출된다.
- install 메타 카피도 현재 `ko/en`만 직접 정의되어 있고, 다른 로케일은 영어 fallback으로 처리된다.

근거:

- `packages/web-client/src/install/index.html:71-78`
- `packages/web-client/src/install/index.html:117-118`
- `packages/web-client/src/landing/main.ts:676-713`
- `packages/web-client/src/landing/main.ts:1009-1039`

핵심 포인트:

- `제품 페이지`, step 1의 `ZIP 다운로드`는 번역 바인딩이 없다.
- `installMetaCopyByLocale`는 현재 `ko`, `en`만 직접 정의한다.

판정:

- `P1 / HOLD`

### P1. scrapbook 신규 UI 문자열이 사실상 `ko/en`만 지원한다

영향:

- 지원 로케일이 `ja`, `pt-BR`, `es`, `zh-TW`, `vi`까지 열려 있지만, 신규 plan/save-status/Plus 연결 문구는 다수가 영어로 강등된다.
- 사용자에게는 “다국어 지원”보다 “부분 영어 fallback”으로 보인다.

근거:

- `packages/web-client/src/scrapbook/main.ts:394-396`
- `packages/web-client/src/scrapbook/main.ts:523-600`

핵심 포인트:

- `uiText(ko, en)` 헬퍼는 `ko` 아니면 모두 영어를 반환한다.
- 신규 문자열이 이 헬퍼에 대거 의존한다.

판정:

- `P1 / HOLD`

### P2. 초기 설정 예시값이 현재 운영 기준과 완전히 맞지 않는다

영향:

- 신규 환경 세팅 시 오래된 도메인이나 레거시 변수명을 따라갈 수 있다.
- 즉시 장애보다는 초기 설정 실수 가능성을 높인다.

근거:

- `.env.example:14`
- `.env.example:33`
- `.env.example:54-55`
- `README.md:114-137`

판정:

- `P2 / 문서 정리 권고`

### P3. 암호화 전용 시크릿 미설정 시 관리자 토큰으로 fallback 된다

영향:

- `THREADS_BOT_ENCRYPTION_SECRET` 또는 `THREADS_NOTION_ENCRYPTION_SECRET`를 빠뜨리면 관리자 토큰과 암호화 키의 blast radius가 합쳐진다.

근거:

- `packages/web-server/src/server/bot-service.ts:695-705`
- `packages/web-server/src/server/notion-service.ts:92-100`

판정:

- `P3 / 운영 설정 게이트`

### P3. 관측성 로그 저장은 여전히 fire-and-forget 구조다

영향:

- 현재 테스트는 통과했으므로 blocker는 아니다.
- 다만 향후 flaky 관측성 테스트나 타이밍성 지표 누락 여지는 남는다.

근거:

- `packages/web-server/src/server.ts:5857-5863`

판정:

- `P3 / 추적 권고`

## 5. 수정계획

### 트랙 A. 운영 문서 정렬

목표:

- 저장소 안 모든 배포 문서가 실제 운영 토폴로지와 같은 말을 하게 만든다.

대상 파일:

- `README.md`
- `docs/deployment-architecture.md`
- `docs/launch-checklist.md`
- 필요 시 `ecosystem.config.cjs` 주석/설명

작업:

1. 운영 기준 PM2 프로세스명을 `threads-obsidian-public`, `threads-obsidian-public-2`, `threads-obsidian-public-3`, `threads-obsidian-worker`로 통일한다.
2. 재배포 예시 명령에서 `threads-obsidian` 단일 재시작 예시를 제거하거나, `legacy/local example`로 명확히 분리한다.
3. 배포 아키텍처 문서의 `single process + file DB 중심` 서술을 현재 기준인 `split-role PM2 + postgres 운영` 기준으로 고친다.
4. 체크리스트에서 `persisted storefront 동기화`, `trustProxy.ready=true`, `split-role PM2 재시작`을 한 흐름으로 다시 쓴다.

완료 조건:

- 운영자가 README와 체크리스트만 읽고도 올바른 프로세스를 재시작할 수 있다.

### 트랙 B. install 페이지 직접 번역 보강

목표:

- install 화면이 모든 지원 로케일에서 직접 번역된 문자열만 보여주게 만든다.

대상 파일:

- `packages/web-client/src/install/index.html`
- `packages/web-client/src/landing/main.ts`
- 필요 시 `packages/web-client/src/lib/web-i18n.ts`

작업:

1. hero 보조 CTA `제품 페이지`, step 1 inline CTA `ZIP 다운로드`에 번역 바인딩을 추가한다.
2. `installMetaCopyByLocale`를 `ja`, `pt-BR`, `es`, `zh-TW`, `vi`까지 직접 번역으로 채운다.
3. install 화면에서 영어 fallback으로 보이는 문자열이 남지 않도록 DOM 선택자와 적용 경로를 전수 점검한다.
4. 직접 번역 원칙에 맞춰 기계 번역이 아닌 고정 번역 문구로 정리한다.

완료 조건:

- 언어 전환 시 install 화면 CTA, 메타 카드, 설치 확인 문구가 모두 해당 로케일의 직접 번역으로 표시된다.

### 트랙 C. scrapbook 신규 UI 다국어 정리

목표:

- 신규 save-status / plan / Plus 연결 UI에서 `ko/en` 이분화 로직을 제거한다.

대상 파일:

- `packages/web-client/src/scrapbook/main.ts`
- 필요 시 `packages/web-client/src/lib/web-i18n.ts`

작업:

1. `uiText(ko, en)` 사용 구간을 locale-aware 사전 구조로 치환한다.
2. 신규 문자열 전부를 `ko`, `en`, `ja`, `pt-BR`, `es`, `zh-TW`, `vi` 직접 번역으로 채운다.
3. `currentLocale === "ko" ? ... : en` 형태로 남아 있는 신규 문자열 경로를 추가 검색으로 정리한다.
4. 신규 문자열이 기존 `scrapbookMessages` 체계와 충돌하지 않도록 정리한다.

완료 조건:

- scrapbook의 신규 상태/플랜/액션 메시지가 모든 지원 로케일에서 직접 번역으로 표시된다.

### 트랙 D. 정책 문서화

목표:

- 이번에 확정된 정책을 코드 오해 없이 문서에 남긴다.

대상 파일:

- `README.md`
- `docs/launch-checklist.md`
- 필요 시 내부 운영 문서

작업:

1. `월간 가격은 US$2.99 고정 정책`임을 명시한다.
2. `비한국어 카피는 직접 번역으로 관리`하며, 한국어 persisted storefront 변경 시 비한국어는 별도 번역 갱신이 필요하다고 명시한다.
3. storefront 변경 배포 시 `ko 정책 문구 반영`과 `비한국어 번역 갱신`을 분리된 게이트로 적는다.
4. `.env.example`의 오래된 도메인 예시와 레거시 JWK 변수 예시를 현재 표준과 맞춘다.

완료 조건:

- 이후 같은 논점으로 다시 “이게 버그인지 정책인지” 논쟁하지 않게 된다.

### 트랙 E. 재검증

검증 순서:

1. `npm run typecheck`
2. `npm test`
3. `npm run build`
4. `/install`에서 `ko/en/ja/pt-BR/es/zh-TW/vi` 언어 전환 확인
5. `/scrapbook`에서 `ko/en/ja/pt-BR/es/zh-TW/vi` 신규 UI 문자열 확인
6. 문서만 보고 split-role PM2 재배포 dry-run 검토

완료 조건:

- 번역 누락 없이 렌더링되고, 배포 절차 문서가 실제 운영 절차와 일치한다.

## 6. 보류 해제 조건

아래 네 가지가 충족되면 `HOLD`를 `GO`로 낮출 수 있다.

1. 운영 문서가 split-role PM2 기준으로 통일됨
2. install 화면의 직접 번역 누락 제거
3. scrapbook 신규 UI의 직접 번역 누락 제거
4. 가격/다국어 운영 정책이 문서와 체크리스트에 명시됨
