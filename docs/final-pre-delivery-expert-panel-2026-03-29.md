# 납품 전 최종 전문가 패널 점검 결과

기준일: `2026-03-29`

대상 저장소: `threads`

## 1. 점검 방식

이번 점검은 다음 다섯 축으로 병행했다.

- 백엔드/보안 패널: Codex 하위 리뷰어
- 프런트엔드/UX 패널: Codex 하위 리뷰어
- 익스텐션/통합 패널: Codex 하위 리뷰어
- 릴리스/운영 패널: Codex 하위 리뷰어
- 직접 검증: 로컬 빌드, 테스트, 브라우저 스모크, 문서/설정 대조

실행한 검증:

- `npm run typecheck` 통과
- `npm test` 통과: `111/111`
- `npm run build` 통과
- 로컬 서버 구동 후 공개 화면 스모크 확인
- Lightpanda MCP는 기존 세션 점유로 제어가 막혀, 브라우저 확인은 일반 Playwright/Chromium으로 폴백
- 생성 산출물:
  - `output/playwright/landing-desktop.png`
  - `output/playwright/landing-mobile.png`
  - `output/playwright/install-desktop.png`
  - `output/playwright/checkout-desktop.png`
  - `output/playwright/checkout-mobile.png`
  - `output/playwright/scrapbook-desktop.png`
  - `output/playwright/admin-desktop.png`

## 2. 패널 합의 요약

패널 합의 결론은 `출고 보류(HOLD)`다.

이유는 다음 세 가지가 blocker로 합의됐기 때문이다.

1. `landing/install` 언어 선택 회귀와 비 `ko/en` 화면의 부분 영어 노출
2. public storefront 캐시가 프로세스 로컬이라 split-role 운영에서 즉시 일관성이 깨지는 문제
3. `postgres` 운영에서 mention save-status 계산이 잘못된 데이터 소스를 읽고 public read마다 쓰기 잠금을 거는 문제

빌드와 테스트는 모두 통과했지만, 이번 결함들은 컴파일 단계가 아니라 실제 납품/운영/전환면에서 드러나는 종류라서 더 위험하다고 판단했다.

## 3. 최종 합의 이슈

### Critical

#### C1. `landing/install`이 저장된 언어 선택을 무시하고, 비 `ko/en` 카피가 영어로 섞여 나온다

- 근거:
  - `packages/web-client/src/landing/main.ts:151`
  - `packages/web-client/src/landing/main.ts:234-308`
  - `packages/web-client/src/landing/main.ts:676-712`
  - `packages/web-client/src/checkout/main.ts:105-149`
- 직접 재현:
  - `ja`를 `localStorage`/cookie에 강제한 뒤 `/landing`, `/install`, `/checkout` 확인
  - 결과:
    - `/landing`: `lang="en"`, 영문 헤드라인 유지
    - `/install`: `lang="en"`, 영문 설치 카피 유지
    - `/checkout`: `lang="ja"`로 바뀌지만 `Choose the payment path first`, `Support email`, `Submit order`는 영어 유지
- 판단:
  - `landing/install`은 `initialLocaleHint ?? getLocale("en")`를 사용해 서버 초기값이 있으면 사용자 저장값을 덮어쓴다.
  - `checkout`은 저장 로케일을 읽지만, 신규 보조 카피는 `ko`, `en`만 직접 정의돼 있어 나머지 5개 로케일에서 영어 폴백이 남는다.
  - 언어 선택기를 7개 언어로 노출하는 제품 계약과 충돌하므로 blocker로 합의했다.

#### C2. admin 저장 직후 public storefront가 public 인스턴스마다 다른 값을 반환할 수 있다

- 근거:
  - `packages/web-server/src/server.ts:163-166`
  - `packages/web-server/src/server.ts:175-183`
  - `packages/web-server/src/server.ts:2654-2708`
  - `packages/web-server/src/server.ts:5348-5394`
  - `AGENTS.md:8`
  - `ecosystem.scale.config.cjs:109-115`
- 판단:
  - storefront 캐시는 프로세스 메모리에만 존재한다.
  - admin 저장 후 `setPublicStorefrontSnapshotCache(...)`로 현재 프로세스 캐시만 즉시 갱신된다.
  - 운영 전제는 `threads-obsidian-public`, `threads-obsidian-public-2`, `threads-obsidian-public-3`, `threads-obsidian-worker` 구조다.
  - 따라서 settings/paymentMethods 변경 직후 최대 TTL 동안 public 인스턴스별 응답이 달라질 수 있다.
  - 프런트엔드 패널, 보안 패널, 운영 패널이 모두 같은 위험을 지적했고, 배포 후 검증 자체를 흔드는 문제라 blocker로 올렸다.

#### C3. `postgres` 운영에서 mention save-status가 틀릴 가능성이 높고, public read가 쓰기 잠금을 건다

- 근거:
  - `packages/web-server/src/server.ts:2187-2299`
  - `packages/web-server/src/server/store.ts:2610-2637`
  - `packages/web-server/src/server/store.ts:2967-2999`
  - `packages/web-server/src/server/bot-mention-service.ts:346-348`
- 판단:
  - `buildPublicMentionSaveStatus()`는 `withDatabaseTransaction()` 안에서 `data.botMentionJobs`를 순회한다.
  - 하지만 `postgres` 경로에서는 mention jobs가 externalized 되고, `hydratePostgresDatabase()`는 `botMentionJobs`를 다시 로드하지 않는다.
  - 동시에 `withPostgresDatabaseTransaction()`은 `SELECT ... FOR UPDATE`와 payload `UPDATE`를 수행한다.
  - 결과적으로 public scrapbook session/read 경로가 오래된 job 상태를 바탕으로 잘못된 `queued/processing/completed/failed`를 만들 수 있고, 읽기 요청이 메인 store row를 직렬화한다.
  - 운영 backend가 `postgres`라는 프로젝트 전제상 blocker로 유지했다.

### Medium

#### M1. 로그인 직후 scrapbook이 자동 동기화되지 않아 “저장 후 바로 확인” 흐름이 약해졌다

- 근거:
  - `packages/web-client/src/scrapbook/main.ts:2635-2655`
  - `packages/web-client/src/scrapbook/main.ts:2732-2755`
  - `packages/web-client/src/scrapbook/main.ts:3112`
- 판단:
  - 초기 bootstrap은 `/api/public/bot/session`과 `/api/public/bot/plus`까지만 수행한다.
  - 실제 `/api/public/bot/sync`는 수동 `새 댓글 확인` 액션에서만 호출된다.
  - 익스텐션/통합 패널과 프런트엔드 패널이 동시에 회귀로 판정했다.
  - 즉시 blocker까지는 아니지만, 사용자가 저장 성공을 바로 확인하려는 핵심 플로우를 약하게 만든다.

#### M2. 운영 문서, 체크리스트, `.env.example`가 현재 토폴로지와 서로 충돌한다

- 근거:
  - `.env.example:14`
  - `.env.example:33`
  - `.env.example:54-55`
  - `README.md:103-104`
  - `README.md:192`
  - `docs/launch-checklist.md:78-79`
  - `docs/deployment-architecture.md:352-356`
  - `AGENTS.md:8`
  - `AGENTS.md:24`
  - `ecosystem.scale.config.cjs:99-115`
  - `packages/web-server/src/server/license-service.ts:21-39`
- 판단:
  - `.env.example`는 아직 `threads-archive.dahanda.dev`와 레거시 `THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE` 예시를 전면에 둔다.
  - README와 deployment architecture는 여전히 단일 PM2 앱 `threads-obsidian` 재시작 예시를 현재 운영처럼 적고 있다.
  - 그러나 현재 운영 전제는 split-role 4개 프로세스다.
  - 운영자가 문서를 그대로 따라가면 잘못된 프로세스를 재시작하거나 일부 프로세스를 놓칠 수 있다.

#### M3. checkout과 scrapbook의 신규 보조 UI는 `ja/pt-BR/es/zh-TW/vi`에서 부분 영어로 남는다

- 근거:
  - `packages/web-client/src/checkout/main.ts:105-149`
  - `packages/web-client/src/scrapbook/main.ts:394`
  - `packages/web-client/src/scrapbook/main.ts:922-943`
  - `packages/web-client/src/scrapbook/main.ts:1085-1107`
  - `packages/web-client/src/scrapbook/main.ts:1387-1391`
- 판단:
  - checkout 신규 섹션은 `CheckoutUiCopy`가 `ko`, `en`만 직접 제공한다.
  - scrapbook 신규 save-status/tag/filter 메시지는 locale table이 아니라 `ko` 대 `en` 이중 분기를 쓴다.
  - C1과 별개로, 이 항목은 “언어 선택이 적용된 후에도 남는 부분 영어”라 중간 우선순위 debt로 분리했다.

### Low

#### L1. install 페이지에서 CSP inline-style 오류가 콘솔에 남는다

- 근거:
  - 로컬 브라우저 스모크에서 `/install` 접속 시 `style-src 'self' https://cdn.jsdelivr.net` 위반 2건 재현
  - `packages/web-server/src/server.ts:167-172`
- 판단:
  - 이번 점검에서는 시각적 붕괴까지는 재현되지 않았다.
  - 다만 납품 직전 기준으로는 콘솔 무오류 상태가 아니라서 원인 추적이 필요하다.

#### L2. 인증 전 admin 진입 시 초기 401 콘솔 오류가 보인다

- 근거:
  - 로컬 브라우저 스모크에서 `/admin` 최초 진입 시 401 두 건 재현
- 판단:
  - 로그인 전 fetch 실패로 보이며 기능 차단 수준은 아니었다.
  - 다만 운영자가 “콘솔 오류 없는 관리화면”을 기대하면 거슬릴 수 있다.

## 4. 토론 메모

패널 간 합의가 강했던 항목:

- storefront cache split:
  - 프런트엔드/UX, 백엔드/보안, 운영 패널이 모두 별도로 지적
  - 따라서 critical로 상향
- scrapbook bootstrap sync 회귀:
  - 프런트엔드/UX, 익스텐션/통합 패널이 동일 지적
  - 사용자 체감이 크지만 치명적 데이터 손상은 아니라 medium 유지
- i18n 회귀:
  - 프런트엔드/UX 패널 지적을 직접 브라우저 재현으로 확인
  - `landing/install` 저장 로케일 무시와 `checkout/scrapbook` 부분 영어 노출을 분리해 정리

패널 단독 지적이라 이번에 보수적으로 낮춘 항목:

- admin 초기 빈값 저장 가능성
- `/ready` 정보 노출 과다
- per-archive ZIP export UI 소실

위 항목들은 후속 점검에는 포함하되, 이번 합의문에서는 blocker로 올리지 않았다.

## 5. 출고 판정

현재 판정: `보류`

출고 전 최소 수정 권고:

1. `landing/install` 로케일 초기화 로직을 `checkout`과 같은 우선순위로 맞추고, 신규 카피의 7개 로케일 정합성을 맞출 것
2. storefront cache를 multi-process 기준으로 무효화하거나, admin 저장 직후 프로세스 간 일관성을 보장할 것
3. `postgres` 경로의 mention save-status 계산을 externalized jobs 기준으로 다시 연결하고, public read에서 불필요한 `FOR UPDATE`/payload rewrite를 제거할 것
4. 문서와 `.env.example`를 현재 운영 토폴로지와 동일한 기준으로 정리할 것

재검증 게이트:

- `npm run typecheck`
- `npm test`
- `npm run build`
- `/landing`, `/install`, `/checkout`, `/scrapbook`, `/admin` 브라우저 재검증
- 비 `ko/en` 최소 1개 로케일(`ja` 권장) 직접 확인
- split-role 환경 또는 동등한 조건에서 storefront 저장 직후 public 응답 일관성 확인

