# 로그인 세션 부트스트랩 분리 작업 계획

기준일: `2026-03-30`

## 목표

`/api/public/bot/session`을 가볍게 만들어 로그인 확인 지연을 줄이고, 아카이브/저장상태/repair 비용은 별도 경로로 분리한다.

## 최적 조합

1. `session`
   - 쿠키 검증
   - 세션 유효성 확인
   - 사용자 최소 정보 반환
   - 고비용 archive repair 금지

2. `bootstrap`
   - archive 목록
   - save status
   - 최초 렌더에 필요한 scrapbook 데이터
   - 필요 시만 호출

3. `repair`
   - 요청 경로에서 분리
   - 비동기 백그라운드 실행
   - 중복 실행은 최소화

## 왜 이 조합이 최적인가

- 로그인 확인과 화면 데이터 로딩을 분리하면, 세션 응답이 빨라진다.
- repair를 요청 경로에서 제거하면 p95/p99 지연이 크게 줄어든다.
- bootstrap은 여전히 무거울 수 있지만, 세션이 그 비용을 더 이상 떠안지 않는다.
- 실패 원인도 분리된다. 세션 실패는 인증 문제, bootstrap 실패는 데이터 로딩 문제로 좁힐 수 있다.

## 트레이드오프

- 장점
  - `session` 응답이 짧아진다.
  - 로그인 상태 확인이 느려서 화면이 멈추는 현상이 줄어든다.
  - repair 실패가 로그인 실패로 전파되지 않는다.
  - auth 경로와 데이터 경로를 따로 모니터링할 수 있다.

- 단점
  - API와 클라이언트 상태 관리가 조금 복잡해진다.
  - 초기 진입 시 `session`과 `bootstrap`을 둘 다 처리해야 한다.
  - repair를 안전하게 백그라운드화하려면 중복 방지와 로그가 필요하다.

## 작업 순서

1. `session` 응답을 auth-only로 축소한다.
2. `bootstrap` 응답을 새로 추가해 archive/saveStatus를 제공한다.
3. `buildPublicMentionSaveStatus`는 bootstrap state를 재사용하도록 바꿔 불필요한 archive 재조회 비용을 없앤다.
4. `repair`를 요청 경로에서 제거하고 비동기 스케줄러로 옮긴다.
5. scrapbook 클라이언트는 `session`과 `bootstrap`을 분리 호출하도록 바꾼다.
6. mutation 이후에 필요한 refresh는 `bootstrap` 재조회로 바꾼다.

## 수용 기준

- `/api/public/bot/session`이 빠르게 응답한다.
- bootstrap은 로그인 확인과 분리되어 호출된다.
- repair는 응답 지연을 만들지 않는다.
- archive 변경 후 UI가 최신 상태를 유지한다.
- 세션/부트스트랩/repair의 실패 원인을 개별적으로 추적할 수 있다.

## 우선순위

1. 세션 응답 경량화
2. bootstrap 분리
3. repair 비동기화
4. 클라이언트 호출 분리
5. 테스트 보강
