# 최종 출시 전 전문가 패널 토론 기록 2차

기준일: `2026-03-28`

프로젝트: `Threads Archive / ss-threads`

관련 1차 문서:

- `docs/final-launch-panel-review-2026-03-28.md`

## 1. 문서 목적

이 문서는 1차 패널 토론 이후 실제 반영된 개선사항을 기준으로 다시 수행한 2차 출시 판정 기록이다.

2차 토론의 목적은 다음 네 가지였다.

- 1차에서 지적된 `CTA 오연결`, `구매 기대 불일치`, `저장 신뢰 UX 부족`, `보안/운영 게이트 누락`이 실제로 해소됐는지 검증
- 정식 공개 유료 출시를 바로 진행해도 되는지 재판정
- 남은 쟁점이 `카피`인지 `구조/운영`인지 분리
- 출시 직전 마지막 수정 범위를 압축

## 2. 패널 구성

2차 토론은 다음 다섯 역할 기준으로 다시 진행했다.

- 웹서비스 기획 전문가
- 마케팅 전문가
- 보안 전문가
- 개발 전문가
- 스레드 헤비유저 그룹 대표

## 3. 2차 검토 대상

주요 검토 범위:

- `packages/web-client/src/lib/web-i18n.ts`
- `packages/web-client/src/lib/web-i18n-locales.ts`
- `packages/web-client/src/landing/index.html`
- `packages/web-client/src/landing/main.ts`
- `packages/web-client/src/checkout/index.html`
- `packages/web-client/src/checkout/main.ts`
- `packages/web-client/src/scrapbook/index.html`
- `packages/web-client/src/scrapbook/main.ts`
- `packages/web-server/src/server.ts`
- `README.md`
- `docs/launch-checklist.md`

## 4. 전제: 2차에서 확인된 실제 개선

패널은 1차 지적사항 중 다음 항목이 실제로 개선됐다는 데에는 대체로 동의했다.

- 랜딩이 `한 제품, 두 진입 경로` 기준으로 재정리됨
- `PC extension / 모바일 mention scrapbook` CTA 및 링크 매핑이 정리됨
- 체크아웃에 `즉시 활성화 아님`, `보통 30분 내 키 메일 발송` 기대치가 명시됨
- `POST /api/public/orders` rate limit, `/ready` trust proxy/security 진단, landing/checkout 공개 헤더 강화가 코드에 반영됨
- scrapbook에 save-status 패널이 추가되어 상태, 마지막 수집, 예상 반영, 실패 이유, 자동 재시도, 수동 재확인이 노출됨
- 배포 체크리스트에 persisted storefront sync 및 `/ready` 확인 게이트가 들어감

즉, 1차의 가장 큰 `오연결`과 `기대 불일치`는 상당 부분 해소됐다.

## 5. 표결 결과

2차 패널 표결은 다음과 같았다.

- `조건부 출시`: 3
- `보류`: 1
- `No-go`: 1

패널 만장일치 `Go`는 아니었다.

## 6. 역할별 토론 요약

### 6-1. 웹서비스 기획 전문가

평가:

- 랜딩 구조 혼선과 CTA 오연결은 대부분 해소됐다고 판단
- 제품 설명이 이제 `한 제품, 두 진입 경로`로 읽힘

남은 우려:

- 공개 UI가 persisted storefront를 실제 source of truth로 쓰지 않음
- 랜딩은 `/api/public/storefront`를 fetch하지만 응답을 버리고 로컬 copy만 다시 렌더함

근거:

- `packages/web-client/src/landing/main.ts:270`
- `packages/web-client/src/landing/main.ts:276`
- `packages/web-client/src/landing/main.ts:277`

판정:

- `조건부 출시`

### 6-2. 마케팅 전문가

평가:

- ko/en 기준 퍼널은 1차보다 좋아졌음
- 체크아웃 기대치도 더 명확해졌음

남은 우려:

- 비 `ko/en` 로케일에는 아직 예전 `"두 제품"` positioning이 남아 있음
- 실제 랜딩 템플릿은 히어로와 두 진입 경로 소개 중심이라 유료 오퍼 가시성이 약해짐
- 체크아웃은 초기 부트에서 `applyCheckoutFeatureCopy()`가 적용되지 않아 비한국어 유입 시 혼합 문구 가능성 존재

근거:

- `packages/web-client/src/lib/web-i18n-locales.ts:631`
- `packages/web-client/src/lib/web-i18n-locales.ts:743`
- `packages/web-client/src/checkout/main.ts:479`
- `packages/web-client/src/checkout/main.ts:489`
- `packages/web-client/src/checkout/main.ts:492`

판정:

- `조건부 출시`

### 6-3. 보안 전문가

평가:

- 1차에서 필수로 본 rate limit, `/ready` 진단, landing/checkout 헤더 강화는 실제 코드에 들어감

남은 우려:

- `/scrapbook` 공개 셸은 `landing/checkout`과 달리 marketing page headers가 아니라 기본 static headers를 받음
- `trustProxy.ready=true`는 forwarded header가 아예 없을 때도 true가 될 수 있어, 실운영 reverse proxy 보호를 완전히 증명하는 신호는 아님

근거:

- `packages/web-server/src/server.ts:2836`
- `packages/web-server/src/server.ts:2883`
- `packages/web-server/src/server.ts:2958`
- `packages/web-server/src/server.ts:2019`
- `packages/web-server/src/server.ts:2028`

판정:

- `조건부 출시`

### 6-4. 개발 전문가

평가:

- 배포 체크리스트가 실제 게이트로 올라간 점은 긍정적으로 평가

남은 우려:

- `persisted storefront drift`가 실제 동작 기준으로는 아직 닫히지 않았다고 판단
- landing은 storefront를 fetch만 하고 버림
- checkout도 사실상 payment methods만 반영

근거:

- `packages/web-client/src/landing/main.ts:270`
- `packages/web-client/src/landing/main.ts:276`
- `packages/web-client/src/landing/main.ts:277`
- `packages/web-client/src/checkout/main.ts:422`
- `packages/web-client/src/checkout/main.ts:429`
- `README.md:197`
- `README.md:198`

판정:

- `No-go`

### 6-5. 스레드 헤비유저 그룹 대표

평가:

- save-status 패널 자체는 체감상 큰 개선으로 평가
- 이전의 “저장됐는지 모르겠다”는 불안을 줄이는 방향은 맞음

남은 우려:

- `completed` 상태가 “방금 그 요청이 저장됐다”와 완전히 동일한 신호는 아님
- 서버는 최신 mention job 완료뿐 아니라 최신 archive 시각 비교로도 완료를 추론
- 연속 저장 시 최신 1건만 보여주므로 request-scoped 신뢰로는 여전히 부족할 수 있음

근거:

- `packages/web-server/src/server.ts:2055`
- `packages/web-server/src/server.ts:2086`
- `packages/web-server/src/server.ts:2088`
- `packages/web-client/src/scrapbook/main.ts:998`
- `packages/web-client/src/scrapbook/main.ts:1052`
- `packages/web-client/src/scrapbook/main.ts:1094`

판정:

- `보류`

## 7. 2차 패널 공통 합의

2차 패널은 다음 세 줄에 합의했다.

- 1차 blocker였던 `CTA 오연결`, `구매 기대 불일치`, `save-status 부재`, `주요 운영 게이트 누락`은 대부분 해소됐다.
- 그러나 정식 공개 유료 출시를 만장일치 `Go`로 찍기에는 아직 `구조/운영 완결성` 이슈가 남아 있다.
- 따라서 현재 단계 평가는 `제한 공개 또는 soft launch 가능`, `정식 공개 유료 launch는 마지막 폴리싱 후 재판정`이다.

## 8. 남은 핵심 쟁점

패널이 공통으로 중요하다고 본 잔존 이슈는 다음 네 가지다.

1. `persisted storefront`가 public landing/checkout copy의 실제 source of truth가 아님
2. `/scrapbook` public shell이 landing/checkout 수준의 공개 페이지 보안 헤더를 받지 않음
3. 비 `ko/en` 로케일이 새 positioning과 아직 불일치함
4. mention save의 `completed`가 request-scoped 완료 신호로는 아직 약함

## 9. 출시 전 마지막 권고

패널 합의 기준의 마지막 권고는 다음과 같다.

1. landing은 `/api/public/storefront`를 실제로 렌더에 쓰게 하거나, 반대로 fetch를 제거하고 현재 구조에 맞게 문서와 운영 게이트를 다시 정리한다.
2. checkout 초기 로드에서도 `applyCheckoutFeatureCopy()`가 적용되게 해 비한국어 혼합 문구 가능성을 제거한다.
3. `/scrapbook`에도 landing/checkout과 같은 수준의 public page 보안 헤더를 적용한다.
4. `/ready` 검증은 `trustProxy.ready=true`만 볼 것이 아니라, 실제 forwarded/trusted peer 조건까지 운영 점검 항목에 포함한다.
5. save-status는 가능하면 request-scoped 완료 판정으로 더 보수적으로 바꾸거나, 현재 의미를 더 좁게 표현한다.
6. 비 `ko/en` 로케일의 landing/storefront copy를 현재 positioning에 맞게 정리한다.

## 10. 2차 최종 판정

2차 패널의 최종 판정은 다음과 같다.

- `soft launch / 제한 공개`: 가능
- `정식 공개 유료 launch`: 보류 권고

한 줄 결론:

`방향은 맞고 1차 blocker는 대부분 잡혔다. 하지만 지금은 “출시 가능”보다 “출시 직전 마지막 한 번 더 닫고 간다”가 더 정확한 판정이다.`

