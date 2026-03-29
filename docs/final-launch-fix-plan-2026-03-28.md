# 출시 전 마지막 수정 계획

기준일: `2026-03-28`

관련 문서:

- `docs/final-launch-panel-review-2026-03-28.md`
- `docs/final-launch-panel-review-round-2-2026-03-28.md`

## 1. 현재 판단

현재 상태는 `soft launch 가능`, `정식 공개 유료 launch 보류`가 맞다.

이유는 다음 네 가지가 아직 구조적으로 닫히지 않았기 때문이다.

1. public landing/checkout와 persisted storefront의 source of truth가 어긋나 있다.
2. `/scrapbook` 공개 셸이 landing/checkout과 같은 보안 헤더를 받지 않는다.
3. 비 `ko/en` 로케일은 아직 새 positioning과 맞지 않는다.
4. mention save `completed`는 request-scoped 완료 신호로 과하게 읽힐 수 있다.

## 2. 출시 전 우선순위

### P0. Source of truth 정리

대상:

- `packages/web-client/src/landing/main.ts`
- `packages/web-client/src/checkout/main.ts`
- `README.md`
- `docs/launch-checklist.md`

해야 할 일:

1. landing이 `/api/public/storefront` 응답을 실제 렌더에 사용하게 만든다.
2. checkout도 payment methods뿐 아니라 public settings를 소비하는 구조로 맞춘다.
3. 만약 launch 직전 범위에서 multilingual persisted settings까지 못 간다면, 최소한 `ko/en` 기준 public commercial copy는 API를 우선 사용하고 나머지는 `en` fallback으로 제한한다.
4. 그 정책에 맞게 README와 launch checklist 문구를 다시 맞춘다.

출시 통과 기준:

- `/api/public/storefront` 값을 바꾸면 landing/checkout의 실제 판매 문구가 함께 바뀐다.
- “persisted storefront sync”가 더 이상 문서상 경고가 아니라 실제 동작 설명과 일치한다.

### P1. `/scrapbook` 보안 헤더 맞추기

대상:

- `packages/web-server/src/server.ts`

해야 할 일:

1. `/scrapbook`와 handle/archive path도 `buildPublicMarketingPageHeaders()`를 타게 바꾼다.
2. 최소 확인 헤더:
   - `Content-Security-Policy`
   - `Permissions-Policy`
   - `Referrer-Policy`
   - `X-Frame-Options`
   - `Cross-Origin-Opener-Policy`
   - `Cross-Origin-Resource-Policy`

출시 통과 기준:

- `/scrapbook` 응답 헤더가 `/checkout`과 같은 수준으로 나온다.

### P1. 비 `ko/en` 로케일 정리

대상:

- `packages/web-client/src/lib/web-i18n-locales.ts`
- 필요 시 language switch UI

해야 할 일:

1. `두 제품` 계열 메시지를 모두 `한 제품, 두 진입 경로`로 바꾼다.
2. launch 직전까지 전체 번역을 못 맞추면 공개 language switch를 `ko/en`으로 제한한다.
3. CTA는 모든 locale에서 동일하게:
   - PC: extension 다운로드
   - Mobile: `/scrapbook`

출시 통과 기준:

- 어떤 locale에서도 “two products” positioning이 남아 있지 않다.
- locale 전환 시 CTA 매핑이 다시 깨지지 않는다.

### P1. save-status 의미 축소 또는 판정 강화

대상:

- `packages/web-server/src/server.ts`
- `packages/web-client/src/scrapbook/main.ts`

해야 할 일:

1. 서버에 `completionSource: "job" | "archive_inferred"` 같은 신호를 추가한다.
2. `job` 완료일 때만 “최근 요청이 반영됨” 문구를 쓴다.
3. `archive_inferred`이면 더 보수적으로:
   - “최근 활동 기준으로 반영된 것으로 보입니다”
   - 또는 “최근 반영 기록 확인” 정도로 낮춘다.
4. 가능하면 최신 mention job id/createdAt와 latest archive 연결 근거를 UI에 더 노출한다.

출시 통과 기준:

- `completed`가 “방금 그 요청이 저장됐다”로 과장되지 않는다.
- 연속 저장 상황에서도 사용자가 오해할 가능성이 줄어든다.

## 3. 같이 닫을 것

### checkout 초기 로드 일관성

대상:

- `packages/web-client/src/checkout/main.ts`

해야 할 일:

1. 초기 부트에서도 `applyLocale(currentLocale)`를 타게 정리한다.
2. `applyTranslations()`만 먼저 호출하는 경로를 제거해 feature copy 혼합 가능성을 없앤다.

### trust proxy 운영 검증 강화

대상:

- `README.md`
- `docs/launch-checklist.md`

해야 할 일:

1. `/ready`에서 `trustProxy.ready=true`만 보지 말고:
   - `forwardedHeadersSeen=true`
   - `trustedPeer=true`
   - `warning=null`
   도 같이 보도록 체크리스트를 강화한다.

## 4. 실행 순서

1. `landing/checkout` source of truth 정리
2. `/scrapbook` 헤더 적용
3. `checkout` 초기 locale 부트 수정
4. 비 `ko/en` locale 정리 또는 `ko/en` 한정
5. save-status 완료 의미 조정
6. smoke test와 배포 문서 갱신

## 5. 최종 출고 조건

아래가 모두 만족되면 정식 공개 유료 launch 재판정이 가능하다.

- landing/checkout가 persisted storefront 정책과 실제로 일치
- `/scrapbook` 공개 헤더 강화 완료
- 공개 locale 전략 정리 완료
- save-status `completed` 의미가 request-scoped로 과장되지 않음
- `/ready` trust proxy 진단이 실제 reverse proxy 조건까지 확인됨
