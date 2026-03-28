# Admin Monitoring Phase 1

기준일: `2026-03-28`

## 범위

이번 단계는 운영자가 관리자 화면에서 바로 확인할 수 있는 `내부 상태 모니터링` 1차 구현이다.

포함한 범위:

- 관리자 화면에 `Monitoring` 섹션 추가
- 서버 내부 체크 기반 `overview / incidents / manual run` API 추가
- 내부 체크 결과를 DB에 `runs / incidents` 형태로 저장
- incident `acknowledge / resolve` 흐름 추가
- bot handle 설정과 collector 상태를 monitoring에 연결

이번 단계에서 의도적으로 제외한 범위:

- 외부 Threads permalink synthetic canary
- Lightpanda 기반 browser capture 모니터링
- Chromium fallback ratio 측정
- Meta/Threads 정책 문서 diff 감시
- Slack/webhook 알림

즉, 이번 구현은 `Monitoring Phase 1 = internal health monitor`다.

## 구현 결과

### 1. 관리자 UI

관리자 화면 하단에 `Monitoring` 패널을 추가했다.

표시 항목:

- overall health
- open incidents
- critical incidents
- current bot handle
- channel health
- recent runs
- incidents

운영 액션:

- `Refresh`
- `Run checks now`
- incident `Acknowledge`
- incident `Resolve`

구현 파일:

- `packages/web-client/src/admin/index.html`
- `packages/web-client/src/admin/styles.css`
- `packages/web-client/src/admin/monitoring.ts`
- `scripts/build.mjs`

### 2. 서버 측 monitoring 서비스

서버에 monitoring 전용 서비스 모듈을 추가했다.

핵심 동작:

- collector status reader 등록
- 주기 실행 타이머 등록 (`10분`)
- 현재 상태를 기반으로 run 생성
- failing check를 incident로 upsert
- 문제가 사라지면 incident를 자동 `resolved`

구현 파일:

- `packages/web-server/src/server/monitoring-service.ts`
- `packages/web-server/src/server.ts`
- `packages/web-server/src/server/store.ts`
- `packages/web-schema/src/index.ts`

### 3. 저장 모델

기존 DB에 아래 배열을 추가했다.

- `monitorRuns`
- `monitorIncidents`

현재는 canary catalog나 policy event 저장소는 아직 없다.

## 현재 health check 항목

Phase 1에서는 다음 4개 채널만 내부 점검한다.

### `public_api`

점검 기준:

- public storefront에 활성화된 결제 수단이 최소 1개 이상 있는지

실패 조건:

- 활성 결제 수단이 0개

### `admin_api`

점검 기준:

- dashboard 데이터를 로드할 수 있는지

현재 판정:

- DB 로드가 가능하면 `healthy`

### `bot_account`

점검 기준:

- runtime config에 collector bot handle이 설정되어 있는지
- collector status와 runtime config의 handle이 일치하는지

실패 조건:

- bot handle 미설정 -> `critical`
- runtime config와 collector status 불일치 -> `degraded`

### `collector`

점검 기준:

- collector enabled 상태
- last error
- last successful sync
- stale window 초과 여부

실패 조건:

- enabled 아님 -> `degraded`
- 성공 이력 없이 error -> `critical`
- 최근 sync가 stale threshold 초과 -> `degraded`

## API

### 조회

- `GET /api/admin/monitoring/overview`
- `GET /api/admin/monitoring/incidents`

### 실행

- `POST /api/admin/monitoring/run-now`

### incident 상태 전이

- `POST /api/admin/monitoring/incidents/:id/ack`
- `POST /api/admin/monitoring/incidents/:id/resolve`

## Incident lifecycle

상태:

- `new`
- `acknowledged`
- `resolved`
- `muted` (`Phase 1 UI 미노출`)

동작:

- 같은 check가 다시 실패하면 dedupe key 기준으로 incident를 갱신한다.
- 이전에 `resolved`였던 incident가 다시 실패하면 `new`로 다시 열린다.
- check가 정상화되면 해당 incident는 자동으로 `resolved`된다.

## 현재 한계

### 1. 외부 Threads 변화는 아직 직접 감지하지 않는다

지금 구현은 서버 내부 상태와 collector health만 본다.

아직 없는 것:

- 실제 permalink extraction canary
- browser capture 결과 비교
- structured extraction vs capture diff

### 2. policy watch는 아직 없다

Meta 정책 변화는 아직 monitoring에 포함되지 않았다.

### 3. 알림 전송은 아직 없다

SMTP 설정은 이미 있으나 이번 단계에서는 메일 알림까지 연결하지 않았다.
운영자는 관리자 화면에서 상태를 보는 방식이다.

## 다음 단계 권장

### Phase 2

- external canary runner 추가
- Lightpanda 우선 browser capture
- Chromium fallback 사유 기록
- Threads permalink sample set 운영
- structured vs capture diff score 추가

### Phase 3

- policy watch queue
- email / Slack / webhook alert
- mute workflow UI
- incident note / assignment
- bot handle 변경 직후 post-check 자동 실행

## 테스트

추가 테스트 파일:

- `tests/admin-monitoring.test.ts`

검증 시나리오:

- bot handle 미설정 상태에서 monitoring run이 incident를 생성하는지
- incident acknowledge가 되는지
- runtime config로 bot handle을 저장한 뒤 rerun 시 incident가 resolve 되는지

이번 작업에서는 코드 추가까지만 했고, 별도 실행 결과는 아직 기록하지 않았다.
