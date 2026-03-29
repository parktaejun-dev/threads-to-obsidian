# 즉시 결제 · 즉시 활성화 전환 계획

기준일: `2026-03-29`

## 1. 목적

현재 checkout은 `주문 접수 -> 결제 확인 -> Plus 키 이메일 발송` 기대치를 전제로 안내되고 있다.

이 문서의 목적은 다음 두 가지를 분리해서 정리하는 것이다.

1. 어떤 결제수단이 `진짜 즉시 활성화`에 적합한가
2. 현재 코드베이스를 어떤 순서로 바꿔야 `즉시 결제 -> 즉시 키 발급` UX가 성립하는가

## 2. 현재 상태 요약

현재 구조는 `자동 발급 엔진은 이미 존재하지만, checkout 세션 연동은 아직 약한 상태`에 가깝다.

- checkout 문구는 아직 수동 확인 전제다.
- 기본 결제수단은 provider별 일반 외부 링크로 연결된다.
- `POST /api/public/orders`는 provider checkout session을 만들지 않고 내부 주문만 생성한다.
- 반면 provider webhook이 들어오면 주문을 `payment_confirmed`로 바꾸고 Plus 키를 자동 발급하는 로직은 이미 존재한다.

즉, 병목은 `발급 엔진`이 아니라 `주문과 실제 결제를 강하게 연결하는 checkout integration`이다.

## 3. 핵심 판단

### 3-1. 즉시 활성화는 결제수단별로 다르게 다뤄야 한다

모든 결제수단을 같은 정책으로 묶으면 안 된다.

- `Stripe 카드 결제`: 즉시 활성화에 적합
- `PayPal`: `capture completed` 기준이면 즉시 활성화 가능
- `KRW 카드/실시간 계좌이체`: 즉시 활성화 가능
- `무통장입금/가상계좌/수동 송금 확인`: 즉시 활성화 대상에서 제외

즉, 정책은 `정상적인 실시간 확정 결제는 자동 발급`, `비동기 입금성 결제는 보수적 처리`가 맞다.

### 3-2. 현재 Stableorder는 capability 확인 전까지 즉시 활성화를 전제로 설계하면 안 된다

현재 코드에는 Stableorder webhook 수신 경로가 있지만, 공개 문서 조사만으로는 아래 세 가지를 확정할 근거가 부족했다.

- 주문별 checkout/session 생성 지원 여부
- 내부 `orderId` 또는 `paymentReference`를 provider 쪽 reference로 안정적으로 전달 가능한지
- `paid` 확정 webhook을 실운영에서 안정적으로 받을 수 있는지

따라서 Stableorder는 아래 둘 중 하나로 다룬다.

1. capability 확인 전까지는 `수동/준수동 결제수단`
2. capability가 충분하지 않으면 `Toss Payments` 또는 `PortOne`으로 대체

## 4. 결제수단별 권장 정책

### 4-1. Stripe

최우선으로 즉시 활성화 전환 대상이다.

정책:

- 서버가 Stripe Checkout Session을 직접 만든다.
- session metadata에 `threads_order_id`와 내부 `paymentReference`를 넣는다.
- 성공 리다이렉트는 내부 success page로 보낸다.
- 발급 기준은 `checkout.session.completed` 또는 필요한 경우 `checkout.session.async_payment_succeeded` webhook이다.
- 성공 페이지는 결제 성공 자체를 신뢰하지 않고, 서버가 확정한 주문 상태를 조회해 키를 보여준다.

결론:

- `즉시 결제`, `즉시 키 표시`, `이메일은 백업 채널` 구조로 전환 가능

### 4-2. PayPal

구현은 가능하지만 `승인`과 `최종 확정`을 구분해야 한다.

정책:

- PayPal Orders API 기준으로 order를 생성한다.
- 가능하면 auto-complete 흐름을 사용한다.
- 발급 기준은 buyer return이 아니라 `PAYMENT.CAPTURE.COMPLETED` 또는 동등한 최종 capture 완료 신호다.
- `CHECKOUT.ORDER.APPROVED`만으로는 즉시 발급하지 않는다.

결론:

- `capture completed` 기준이면 즉시 활성화 가능
- Stripe보다 구현과 예외 처리가 조금 더 까다롭다

### 4-3. KRW-friendly 결제

한국 사용자에게는 `카드 + 실시간 계좌이체` 조합이 중요하다.

권장 정책:

- Stableorder capability가 충분하면 유지
- 충분하지 않으면 `Toss Payments` 또는 `PortOne` 도입
- `카드`, `실시간 계좌이체`는 즉시 활성화 대상
- `가상계좌`, `무통장입금`은 즉시 활성화 대상에서 제외

결론:

- KRW-friendly는 유지하되, `즉시 활성화`와 `입금 대기형 결제`를 같은 문구로 팔면 안 된다

## 5. 목표 UX

목표는 `결제 완료 메일을 기다리는 판매 페이지`가 아니라 `결제 직후 키를 받는 소프트웨어 checkout`이다.

### 5-1. 사용자 흐름

1. 사용자가 checkout form을 제출한다.
2. 서버가 내부 주문을 생성한다.
3. 서버가 provider checkout session 또는 order를 생성한다.
4. 사용자를 provider 결제창으로 이동시킨다.
5. provider는 내부 success page 또는 return URL로 복귀시킨다.
6. success page는 서버에 결제 확정 상태를 조회한다.
7. webhook 또는 capture 완료가 확인되면 서버가 Plus 키를 발급한다.
8. success page는 발급된 키를 즉시 표시하고 복사/활성화 안내를 보여준다.
9. 이메일은 보조 전달 수단으로만 사용한다.

### 5-2. success page 상태 모델

성공 페이지는 최소 아래 세 상태를 가져야 한다.

- `결제 확인 중`
- `Plus 키 발급 완료`
- `문제가 있어 확인이 필요함`

이 페이지가 있으면 webhook이 수 초 늦게 와도 사용자는 `30분 대기` 대신 `잠시만 기다리세요` 경험을 받는다.

## 6. 필요한 백엔드 변경

### 6-1. 주문 생성 API를 session 생성 API로 확장

현재 `POST /api/public/orders`는 주문만 만든다. 이 엔드포인트 또는 별도 endpoint가 아래를 함께 반환해야 한다.

- 내부 주문 정보
- provider redirect URL 또는 session 정보
- success page 조회용 short-lived claim token

핵심은 `일반 provider 홈페이지 링크`를 여는 방식에서 `이 주문을 위한 checkout session`을 여는 방식으로 바꾸는 것이다.

### 6-2. 주문 상태 조회 endpoint 추가

현재 public checkout에는 안전한 주문 상태 조회용 endpoint가 없다.

필요한 형태:

- `GET /api/public/order-claims/:token`
- 또는 토큰 기반 polling endpoint

반환 정보 예시:

- 주문 상태
- 결제 확정 여부
- 키 발급 여부
- 발급된 키 또는 마스킹 정보
- 사용자에게 보여줄 다음 행동

중요:

- raw `order.id`만으로 키를 읽게 하면 안 된다
- claim token은 짧은 수명과 최소 권한을 가져야 한다

### 6-3. webhook 기반 발급 로직은 유지하고 재사용

현재 webhook 수신 후 주문을 `payment_confirmed`로 만들고 키를 발급하는 구조는 유지한다.

이 영역은 이미 핵심 구조가 있다.

- provider event dedupe
- 결제 완료 시 order 업데이트
- 키 발급
- 이메일 자동 전송

변경 포인트는 `발급 엔진 교체`가 아니라 `어떤 provider event를 최종 확정으로 볼지`와 `성공 페이지가 그 결과를 읽는 방식`이다.

### 6-4. 위험 거래만 수동 심사 예외로 분기

모든 거래를 수동 확인하지 않는다.

수동 예외 후보:

- 짧은 시간 내 같은 이메일/기기 반복 구매
- provider email과 주문 email의 큰 불일치
- chargeback/high-risk 규칙에 걸린 거래
- provider 쪽 상태가 `pending`, `review`, `manual capture required`인 경우

기본 원칙은 `정상 거래는 즉시`, `이상 거래만 수동 검토`다.

## 7. 필요한 프론트엔드 변경

### 7-1. checkout 문구 수정

현재의 `즉시 활성화 아님`, `보통 30분 안에 이메일 발송` 문구는 즉시 checkout 목표와 충돌한다.

변경 원칙:

- Stripe / 즉시 확정형 KRW 수단: `결제 완료 후 바로 Plus 키 표시`
- PayPal: `결제 확정 후 바로 Plus 키 표시`
- 입금 대기형 수단: `입금 확인 후 키 발급`

즉, 결제수단별 fulfillment 문구를 분리해야 한다.

### 7-2. 결과 페이지 추가

필수 화면:

- `/checkout/success`
- 필요하면 `/checkout/pending`
- 필요하면 `/checkout/error`

이 페이지는 결제사 return 이후 사용자 불안을 줄이는 핵심 UI다.

### 7-3. 이메일을 주 전달 수단에서 보조 수단으로 내림

이메일은 여전히 보내되, 메인 CTA는 아래 순서가 맞다.

1. 화면에서 Plus 키 즉시 표시
2. 같은 키를 이메일로도 발송

## 8. 구현 우선순위

### Phase 1. Stripe 즉시 활성화

범위:

- Stripe Checkout Session 생성
- success page
- claim token 기반 상태 조회
- webhook 완료 후 화면 즉시 표시

목표:

- 국제 카드 결제를 먼저 `실제 즉시 활성화`로 전환

### Phase 2. PayPal capture-complete 즉시화

범위:

- PayPal Orders API 정식 연동
- capture completed 기준 발급
- PayPal 전용 return/success 상태 처리

목표:

- 국제 구매자용 두 번째 즉시 결제 경로 확보

### Phase 3. KRW 결제 정리

범위:

- Stableorder capability 검증
- 가능하면 session/reference/webhook 기반 즉시화
- 아니면 Toss Payments 또는 PortOne 도입

목표:

- 한국 사용자용 `카드 + 실시간 이체` 즉시 활성화 경로 확보

## 9. 운영 반영 항목

### 9-1. storefront copy 동기화

가격, 플랜 이름, FAQ, hero note, included updates처럼 persisted storefront가 우선인 항목과 마찬가지로, checkout fulfillment 문구도 운영 persisted 설정과 드리프트가 나지 않게 함께 관리해야 한다.

즉시 활성화 관련 카피를 바꿀 때는 코드 배포만으로 끝내지 않고 운영 storefront 설정 동기화 절차를 같이 밟아야 한다.

### 9-2. 모니터링

추가로 봐야 할 운영 지표:

- provider별 결제 성공 -> 키 발급까지 걸린 시간
- success page에서 `pending`에 머무는 비율
- webhook 수신 실패율
- 중복 webhook 비율
- 발급 실패 후 수동 개입 비율

### 9-3. 롤백 기준

아래 상황이면 해당 결제수단만 즉시 활성화 대상에서 잠시 제외할 수 있어야 한다.

- webhook 지연 또는 누락이 반복될 때
- provider reference 매핑 오류가 발견될 때
- 잘못된 주문에 키가 발급될 위험이 생길 때

롤백은 `전체 checkout 중단`이 아니라 `문제 수단만 수동 처리 모드로 전환`이 기본이다.

## 10. 최종 권고안

가장 현실적인 실행 순서는 아래와 같다.

1. `Stripe`를 먼저 즉시 활성화로 전환한다.
2. `PayPal`은 `capture completed` 기준으로 뒤따라 붙인다.
3. `Stableorder`는 capability를 확인한 뒤 유지 여부를 결정한다.
4. KRW 즉시 결제 품질이 부족하면 `Toss Payments` 또는 `PortOne`으로 교체한다.
5. `가상계좌/무통장입금`은 즉시 활성화 대상에서 분리한다.

핵심 판단은 단순하다.

- 지금은 `자동 발급`은 이미 가능하다.
- 부족한 것은 `주문별 결제 세션`, `성공 페이지`, `안전한 상태 조회`, `결제수단별 확정 시점 분리`다.
- 따라서 이 전환은 완전 신규 판매 시스템 구축이 아니라 `현재 구조를 즉시 checkout에 맞게 재배선하는 작업`으로 보는 것이 맞다.

## 11. 참고 자료

- Stripe Checkout success/return page: [https://docs.stripe.com/payments/checkout/custom-success-page](https://docs.stripe.com/payments/checkout/custom-success-page)
- Stripe Checkout overview: [https://docs.stripe.com/payments/checkout](https://docs.stripe.com/payments/checkout)
- PayPal webhook verification: [https://developer.paypal.com/docs/api/webhooks/v1/](https://developer.paypal.com/docs/api/webhooks/v1/)
- PayPal payment lifecycle: [https://developer.paypal.com/beta/apm-beta/additional-information/lifecycle/](https://developer.paypal.com/beta/apm-beta/additional-information/lifecycle/)
- Toss Payments widget integration: [https://docs.tosspayments.com/en/integration-widget](https://docs.tosspayments.com/en/integration-widget)
- Toss Payments webhooks: [https://docs.tosspayments.com/en/webhooks](https://docs.tosspayments.com/en/webhooks)
- PortOne checkout integration entrypoint: [https://developers.portone.io/opi/ko/integration/start/v2/checkout](https://developers.portone.io/opi/ko/integration/start/v2/checkout)
