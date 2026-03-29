# 최종 출시 전 전문가 패널 토론 기록 3차

기준일: `2026-03-28`

프로젝트: `Threads Archive / ss-threads`

관련 문서:

- `docs/final-launch-panel-review-2026-03-28.md`
- `docs/final-launch-panel-review-round-2-2026-03-28.md`

## 1. 문서 목적

이 문서는 2차 패널 토론 이후 실제 코드 수정과 운영 배포까지 완료된 상태에서 다시 수행한 3차 출시 판정 기록이다.

3차의 핵심 목적은 다음과 같다.

- 2차 잔존 이슈였던 `persisted storefront 반영`, `비 ko/en 포지셔닝 불일치`, `/scrapbook` 공개 헤더, `save completion 정합성`이 실제로 닫혔는지 검증
- 코드 수준이 아니라 `배포된 라이브 상태`까지 포함해 최종 출시 판정
- 남은 항목이 launch blocker인지, 아니면 launch debt인지 분리

## 2. 이번 라운드에서 반영된 내용

이번 라운드에서 실제로 반영되었다고 확인한 주요 변경은 다음과 같다.

- checkout이 서버 주입 초기 locale을 사용하고, 언어 전환 시 payment methods까지 다시 렌더
- checkout이 persisted storefront의 `priceLabel` / `priceValue`를 실제 렌더에 사용
- landing이 persisted storefront의 가격값을 실제로 반영
- landing / checkout / scrapbook 상단 락업이 `Save, Sync, ss-threads`로 통일
- scrapbook save-status가 `job 완료`와 `archive 추정`을 분리해 표시
- `/scrapbook` 공개 셸도 landing/checkout과 동일한 public marketing 보안 헤더를 받도록 정리
- `ja / pt-BR / es / zh-TW / vi`에 one-product positioning override 반영

## 3. 배포 및 운영 확인

사용자 보고 기준의 배포 백업 경로:

- `/home/ubuntu/backups/threads-deploy-2026-03-28_142021`

운영 검증 결과:

- `/ready`: `status=ready`, `trustProxy.ready=true`
- `/api/public/storefront`: one-product storefront 문구 및 `priceValue=US$19.99`
- `/scrapbook` 응답 헤더: `Content-Security-Policy`, `Permissions-Policy`, `X-Frame-Options`, `Referrer-Policy`, `Cross-Origin-*`
- 라이브 `/checkout` HTML: 언어 선택기 및 `Save, Sync, ss-threads` 락업 확인
- 라이브 `/scrapbook` HTML: 상단 호스트 텍스트 제거 확인

추가 교차 확인:

- `curl https://ss-threads.dahanda.dev/ready`에서 `forwardedHeadersSeen=true`, `trustedPeer=true`, `publicOrderRateLimit` 확인
- `curl -I https://ss-threads.dahanda.dev/scrapbook`에서 강화 헤더 확인

## 4. 3차 패널 총평

3차 패널 기준으로는 2차까지 남아 있던 핵심 blocker 대부분이 실제로 닫혔다.

특히 다음 네 가지는 이번 라운드에서 실질적으로 해소된 것으로 봤다.

- persisted storefront의 가격 정보가 landing/checkout 렌더에 실제 반영됨
- `/scrapbook`이 public marketing 보안 헤더를 받음
- `completionSource`를 통해 save-status가 `반영 완료`와 `반영 추정`을 분리함
- 비 `ko/en` 로케일도 one-product positioning으로 정리됨

즉, 1차와 2차에서 문제였던 큰 축은 이번 라운드에서 실제 코드와 운영 응답 기준으로 상당 부분 정리됐다.

## 5. 역할별 3차 토론

### 5-1. 웹서비스 기획 전문가

평가:

- 제품 구조는 이제 충분히 정리되었다고 판단
- `한 제품, 두 진입 경로`와 `Save, Sync, ss-threads` 락업이 기획적으로 일관됨
- 실제 운영 storefront와 랜딩/체크아웃 가격 정보도 더 이상 따로 놀지 않음

근거:

- `packages/web-client/src/landing/index.html:29`
- `packages/web-client/src/landing/main.ts:211`
- `packages/web-client/src/landing/main.ts:236`
- `packages/web-client/src/checkout/main.ts:375`
- `packages/web-client/src/checkout/main.ts:491`

판정:

- `출시 가능`

### 5-2. 마케팅 전문가

평가:

- 2차까지의 “메시지 분산” 문제는 대부분 해소됐다고 판단
- persisted storefront 가격이 실제 노출되고, 비 `ko/en`도 one-product 포지셔닝으로 맞춰진 점을 긍정적으로 평가

남은 주의점:

- 비 `ko/en` 유입은 이제 구조적으로 정리됐지만, 최초 HTML에는 여전히 일부 기본 문구가 남아 있어 JS 적용 전 짧은 혼합 인상이 생길 수 있음

근거:

- `packages/web-client/src/checkout/index.html:18`
- `packages/web-client/src/checkout/main.ts:551`
- `packages/web-client/src/lib/web-i18n.ts:738`
- `packages/web-client/src/lib/web-i18n.ts:778`
- `packages/web-client/src/lib/web-i18n.ts:818`
- `packages/web-client/src/lib/web-i18n.ts:858`
- `packages/web-client/src/lib/web-i18n.ts:898`

판정:

- `출시 가능`

### 5-3. 보안 전문가

평가:

- 2차까지 남아 있던 `/scrapbook` 공개 셸 헤더 문제가 실제로 해소됨
- 라이브 `/ready`에서 trust proxy와 public order rate limit이 정상적으로 노출됨
- 운영 배포 검증 결과까지 포함하면 보안/운영 게이트는 출시 전 수준에 도달했다고 판단

근거:

- `packages/web-server/src/server.ts:2891`
- `packages/web-server/src/server.ts:2961`
- `packages/web-server/src/server.ts:2046`
- `docs/launch-checklist.md`
- 라이브 `/ready` 응답 및 `/scrapbook` 헤더 확인

판정:

- `출시 가능`

### 5-4. 개발 전문가

평가:

- 2차의 가장 강한 blocker였던 persisted storefront drift가 가격 정보 기준으로는 정리됨
- checkout 초기 locale / language switch / payment method 재렌더도 정리됨

남은 주의점:

- folders는 여전히 `localStorage` 기반이라, UI/카피가 암시하는 “계정 기준 50 folders”와 완전히 같은 의미는 아님

근거:

- `packages/web-client/src/checkout/main.ts:351`
- `packages/web-client/src/checkout/main.ts:375`
- `packages/web-client/src/checkout/main.ts:551`
- `packages/web-client/src/scrapbook/main.ts:253`
- `packages/web-client/src/scrapbook/main.ts:527`

판정:

- `조건부 출시`

### 5-5. 스레드 헤비유저 그룹 대표

평가:

- save-status 패널이 이제 실제 신뢰 도구로 작동할 수준까지 올라왔다고 판단
- `반영 완료`와 `반영 추정`을 나눈 점은 2차에서 가장 크게 지적됐던 문제를 정확히 건드린 수정

남은 주의점:

- 여전히 최신 1건 중심 UI이므로 연속 저장이 많은 사용자에게는 더 자세한 큐 가시성이 있으면 좋다

근거:

- `packages/web-client/src/scrapbook/main.ts:894`
- `packages/web-client/src/scrapbook/main.ts:915`
- `packages/web-server/src/server.ts:2076`
- `packages/web-server/src/server.ts:2089`
- `packages/web-server/src/server.ts:2097`

판정:

- `출시 가능`

## 6. 3차 패널 합의

3차 패널은 다음에 합의했다.

- 2차까지 남아 있던 핵심 blocker는 이번 라운드에서 대부분 해소됐다.
- 라이브 `/ready`, `/api/public/storefront`, `/scrapbook` 헤더, `/checkout` / `/scrapbook` HTML 확인 결과까지 포함하면 정식 출시를 막을 이유는 크게 줄었다.
- 남은 이슈는 주로 `launch blocker`가 아니라 `launch debt` 성격이다.

## 7. 남은 launch debt

3차 기준으로 남은 항목은 다음 정도로 압축된다.

1. folders가 여전히 `localStorage` 기반이라 “계정 기준 50 folders” 기대와 완전히 일치하지 않음
2. 비 `ko/en` 유입 시 최초 HTML과 JS 적용 사이에 짧은 혼합 인상이 생길 수 있음
3. save-status는 최신 1건 중심이라 헤비유저용 상세 큐 가시성은 더 좋아질 여지가 있음

이 셋은 모두 추적 가치가 있지만, 3차 패널은 launch blocker로 보지는 않았다.

## 8. 3차 최종 판정

3차 패널의 최종 판정은 다음과 같다.

- `정식 공개 유료 launch`: 가능
- `출시 후 추적해야 할 launch debt`: 존재

한 줄 결론:

`3차에서는 더 이상 출시를 막는 구조적 blocker보다, 출시 후 바로 추적할 품질 debt가 남아 있는 상태로 판단했다. 즉 지금은 “한 번 더 막는다”보다 “나가고 추적한다”가 맞다.`

