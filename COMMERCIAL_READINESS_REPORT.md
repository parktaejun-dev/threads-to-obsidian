# SS Threads 상업 서비스 준비도 보고서

**작성일:** 2026-03-28
**분석 방법:** 소스 코드 직접 정독 (서브에이전트 위임 없음)
**대상:** `packages/web-server/src/server.ts`, `store.ts`, `bot-service.ts`, `http-client.ts`, `monitoring-service.ts`, `.env.example`

---

## 결론 요약

이전에 작성된 보고서는 잘못된 라인 번호와 코드를 읽지 않은 주장이 다수 포함되어 있었다. 직접 확인한 결과, **이 코드베이스는 상당히 잘 만들어진 프로덕션급 서버**로, 대부분의 보안 핵심 항목이 이미 올바르게 구현되어 있다. 실제 문제는 3개 중간 등급 이슈와 2개 낮은 등급 이슈로 제한된다.

---

## 이전 보고서 오류 정오표

이전 보고서에서 P0 Critical로 분류된 항목들의 실제 코드 상태:

| 이전 주장 | 실제 코드 | 판정 |
|-----------|-----------|------|
| "웹훅 서명 검증 없음" | `verifyStripeWebhookSignature` (line 2286), `verifyStableorderWebhookSignature` (line 2249), `verifyPaypalWebhookSignature` — 각 provider별 HMAC-SHA256 또는 API 검증 구현됨 | **허위** |
| "Graceful Shutdown 없음" | SIGTERM/SIGINT 핸들러 (`startWebServer:5106-5107`), `server.close()`, `closeRuntime()` → `closeDatabaseConnections()` 순서대로 구현됨. 강제 종료 타임아웃 15초 | **허위** |
| "Rate limit 맵 크기 상한 없음" | `enforceRateLimitBucketCap()` (line 1991): 기본 50,000 상한, 초과 시 오래된 버킷부터 LRU 방식 제거 | **허위** |
| "DB pool 옵션 없음" | `connectionTimeoutMillis`, `idleTimeoutMillis`, `max`, `query_timeout`, `statement_timeout`, `allowExitOnIdle`, 에러 핸들러 모두 설정됨 (`store.ts:306-316`) | **허위** |
| "외부 fetch timeout 없음" | `http-client.ts:20` `fetchWithTimeout` — 기본 15초 AbortSignal 기반 타임아웃. 모든 외부 요청에 적용 | **허위** |
| "Server request timeout 없음" | `server.requestTimeout = 30s`, `headersTimeout = 35s`, `keepAliveTimeout = 5s` (`startWebServer:5045-5047`) | **허위** |
| "관리자 API 인증 미적용" | `isAdminAuthorized()` — Bearer 토큰 또는 서명된 세션 쿠키 검사 (`server.ts:4101`). 로그인 경로 이후 전체 admin 라우트에 적용 | **허위** |
| "Admin token 교체 후 기존 세션 유효" | 세션 서명 = `HMAC-SHA256(adminToken, payload)`. 토큰 변경 시 기존 서명 검증 실패로 자동 무효화 (`server.ts:548-580`) | **허위** |
| "요청 핸들러 예외 무시" | `handleRequest` 내부 최상위 try/catch (`server.ts:4702-4714`) — `RequestError`와 일반 예외 모두 처리 후 JSON 응답 | **허위** |

---

## 실제 확인된 이슈

### 🟡 MEDIUM-1 — `POST /api/public/orders` Rate Limit 없음

**위치:** `getRateLimitRule()` (`server.ts:2031-2064`) — `/api/public/orders` 경로 누락

**상황:**
- 이 엔드포인트는 Origin 검사(`getMutationOriginPolicy`)는 받지만 rate limit 규칙이 없음
- 인증 없이 호출 가능
- 호출 시 DB에 `pending` 상태 주문 레코드 생성

**실제 위험 수준:**
- 결제 웹훅 없이는 라이선스가 발급되지 않으므로 금전적 피해 없음
- 단기간 대량 호출 시 DB 레코드 과부하, 관리자 대시보드 오염 가능
- paymentMethod의 `enabled` 검사로 유효하지 않은 결제 수단 차단됨

**권고:** IP 기반 rate limit 추가 (예: 10분간 10회)

---

### 🟡 MEDIUM-2 — 공개 페이지 보안 헤더 미적용

**위치:** `serveStaticFile()` (`server.ts:2680, 2698, 2720-2724`)

**상황:**
- `/admin/index.html`: CSP + X-Frame-Options + X-Content-Type-Options + Referrer-Policy 모두 적용됨 ✅
- `landing/index.html`, `checkout/index.html`, `scrapbook/index.html`, 기타 정적 파일: `content-type` 헤더만 존재

**누락된 헤더:**
- `X-Frame-Options: DENY` 또는 `frame-ancestors 'none'` — checkout 페이지 클릭재킹 방어
- `X-Content-Type-Options: nosniff` — MIME 스니핑 방어
- `Strict-Transport-Security` — 코드베이스 전체에 HSTS 헤더 없음

**HSTS 관련:** 리버스 프록시(Nginx/Caddy)에서 설정하거나 서버 코드에 추가 가능. 현재 어느 쪽에도 없음.

**참고:** Landing/checkout 페이지 HTML 템플릿 주입 시 `escapeHtml()` 일관 적용 확인 — SSR XSS는 방어됨

---

### 🟡 MEDIUM-3 — 구조적 요청 로그 없음

**위치:** `logUnexpectedError()` (`server.ts:2854-2856`)

```typescript
function logUnexpectedError(context: string, error: unknown): void {
  console.error(`[threads-web] ${context}:`, error);
}
```

**상황:**
- 예외 발생 시 `console.error`만 존재
- HTTP 요청별 access log 없음 (method, path, status, latency)
- 관리자 액션 감사 로그 없음
- 웹훅 처리 성공/실패 로그 있음 (`appendWebhookHistory` → DB 기록) — 웹훅은 예외

**실제 영향:** 프로덕션 장애 시 원인 추적이 어려움. PM2 logs 또는 CloudWatch 등 외부 집계를 쓰더라도 요청 수준 정보가 없으면 디버깅에 한계

---

### 🟢 LOW-1 — 웹훅 이벤트 전역 dedupe 저장소 없음

**위치:** `processWebhookForOrder()` (`server.ts:3770`)

**상황:**
```typescript
// 현재: 주문에 eventId를 저장하고 같은 조합 재진입 차단
if (hints.eventId && order.paymentProviderEventId === hints.eventId && order.status === "key_issued") {
  return { reason: "already_processed", ... };
}
```

주문 레코드 자체에 `paymentProviderEventId`를 기록해 같은 주문-이벤트 조합의 재처리를 막는 방어는 있음.

**실제 한계:** 동일 eventId가 다른 주문과 매칭될 경우(극히 드문 엣지케이스) 방어 안 됨. 이벤트 전용 ledger가 있으면 provider + eventId 단위로 완전한 멱등성 보장 가능.

---

### 🟢 LOW-2 — 리버스 프록시 미설정 시 Rate Limit IP 판별 오동작

**위치:** `readClientIp()` (`server.ts:1910-1922`)

**상황:**
```typescript
function readClientIp(request: IncomingMessage): string {
  const peerIp = readPeerIp(request);
  if (!readTrustedProxyAllowlist().has(peerIp)) {
    return peerIp;  // proxy allowlist 없으면 X-Forwarded-For 무시 (안전)
  }
  return normalizeIpAddress(readForwardedValue(...));
}
```

`THREADS_WEB_TRUST_PROXY_ALLOWLIST` 미설정 시 X-Forwarded-For를 무시하고 소켓 IP 사용 — IP 스푸핑은 방어되나, Nginx 뒤에 배포할 경우 모든 요청이 `127.0.0.1`로 집계되어 rate limit이 의도대로 동작하지 않음.

`.env.example`에 문서화되어 있으나 배포 체크리스트에 명시 필요.

---

## 이미 잘 구현된 항목 (검수 확인)

| 항목 | 구현 위치 | 상태 |
|------|-----------|------|
| Stripe HMAC-SHA256 서명 + timestamp tolerance | `server.ts:2286-2314` | ✅ |
| Stableorder HMAC-SHA256 (plain 및 `sha256=` 포맷 모두 지원) | `server.ts:2249-2265` | ✅ |
| PayPal API 기반 서명 검증 | `server.ts:2358-2394` | ✅ |
| SIGTERM/SIGINT graceful shutdown + force exit timer | `server.ts:5070-5107` | ✅ |
| DB pool 종료 (`closeDatabaseConnections`) | `store.ts:322-329` | ✅ |
| DB pool 옵션 (max, timeout, statement_timeout, error handler) | `store.ts:306-316` | ✅ |
| Rate limit 버킷 50,000 상한 + LRU 제거 | `server.ts:1991-2007` | ✅ |
| Server requestTimeout 30s / headersTimeout 35s | `server.ts:5045-5047` | ✅ |
| 외부 fetch 15초 AbortSignal timeout (환경변수 조정 가능) | `http-client.ts:20-54` | ✅ |
| 관리자 Bearer 토큰 + 서명된 세션 쿠키 인증 | `server.ts:328-329, 4101` | ✅ |
| Admin token 변경 시 기존 세션 자동 무효화 | `server.ts:548-549` | ✅ |
| Admin IP allowlist (기본: loopback only) | `server.ts:1924-1947` | ✅ |
| CSRF: 모든 mutation에 Origin 검사 | `server.ts:1843-1869` | ✅ |
| SQL injection: 파라미터화 쿼리 일관 사용 | `store.ts` 전반 | ✅ |
| SSRF: DNS 검증 + Private IP 차단 | `bot-service.ts:310-353` | ✅ |
| XSS: SSR HTML에 `escapeHtml` 일관 적용 | `server.ts:659, 2675-2678` | ✅ |
| Admin 페이지 강한 CSP + X-Frame-Options | `server.ts:2705-2717` | ✅ |
| 요청 본문 크기 제한 (기본 1MB) | `server.ts:118` | ✅ |
| 내부 모니터링 서비스 (자동 체크, incident 기록) | `monitoring-service.ts:300` | ✅ |
| 웹훅 처리 이력 DB 기록 | `server.ts:2889-2909` | ✅ |
| 주문 레벨 웹훅 재처리 차단 | `server.ts:2947-2953, 3770-3793` | ✅ |
| `X-Forwarded-For` 신뢰 프록시 허용목록 방어 | `server.ts:1892-1922` | ✅ |

---

## 배포 전 최종 체크리스트

```
필수 환경변수
[ ] THREADS_WEB_ADMIN_TOKEN — 64자 이상 랜덤 문자열
[ ] THREADS_WEB_STORE_BACKEND=postgres
[ ] THREADS_WEB_POSTGRES_URL — Supabase 연결 문자열
[ ] THREADS_BOT_INGEST_TOKEN — 봇 ingest 전용 시크릿
[ ] THREADS_BOT_ENCRYPTION_SECRET — OAuth 토큰 암호화 키
[ ] THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE — 라이선스 서명 키
[ ] THREADS_WEBHOOK_SECRET_STRIPE, THREADS_WEBHOOK_SECRET_STABLEORDER
[ ] PayPal 사용 시: CLIENT_ID, CLIENT_SECRET, WEBHOOK_ID

리버스 프록시 설정
[ ] HTTPS 종단 (Nginx/Caddy에서 TLS 처리)
[ ] THREADS_WEB_TRUST_PROXY_ALLOWLIST=127.0.0.1,::1 (Nginx 뒤 배포 시)
[ ] Nginx에서 HSTS 헤더 설정: Strict-Transport-Security: max-age=31536000; includeSubDomains

보안 강화 (권고)
[ ] POST /api/public/orders에 IP rate limit 추가 (MEDIUM-1)
[ ] checkout/landing 페이지 X-Frame-Options: DENY 추가 (MEDIUM-2)
[ ] 요청 access log 추가 또는 외부 APM 연동 (MEDIUM-3)

운영
[ ] /ready 엔드포인트로 DB 연결 확인
[ ] PM2 또는 systemd로 프로세스 관리 (SIGTERM 정상 수신 보장)
[ ] DB 백업 스케줄 설정 (Supabase 자동 백업 or pg_dump cron)
[ ] npm audit 실행 — 의존성 CVE 확인
```

---

## 최종 판정

**배포 가능: 즉시 가능 (리버스 프록시 + 필수 환경변수 설정 후)**

코드베이스 자체의 보안, 안정성, 서버 가용성은 상업 서비스 수준에 도달해 있다. 확인된 세 개의 중간 등급 이슈는 서비스 중단이나 금전 피해를 유발하지 않으며, 운영 시작 후 단계적으로 보강 가능하다.
