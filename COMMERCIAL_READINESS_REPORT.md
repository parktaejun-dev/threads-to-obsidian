# SS Threads 상업 서비스 준비도 분석 보고서

**분석일:** 2026-03-28
**대상 프로젝트:** SS Threads Plus (Web Server + Extension + Bot)
**분석 범위:** 보안성 / 서비스 안정성 / 코드 안전성 / 서버 가용성

---

## 개요 (Executive Summary)

SS Threads는 Node.js 기반의 웹 서버로, 라이선스 관리 / OAuth / 결제 웹훅 / 스크랩북 아카이브 기능을 포함한 상업용 SaaS입니다.
일부 영역(CSRF 방어, 입력 검증, 비밀 키 관리)에서는 견고한 보안 기반이 잡혀 있지만, **상업 운영 전에 반드시 해결해야 할 치명적 결함**이 존재합니다.

**종합 배포 준비도: 조건부 가능 (Critical 항목 수정 후)**

---

## 위험도 기준

| 등급 | 의미 |
|------|------|
| 🔴 CRITICAL | 서비스 중단 / 금전 사기 / 데이터 손실 직결 |
| 🟠 HIGH | 보안 취약점 / 안정성 저하 |
| 🟡 MEDIUM | 운영 불편 / 장기 리스크 |
| 🟢 LOW | 개선 권고 |

---

## 1. 기술 스택 요약

| 구성 요소 | 기술 |
|-----------|------|
| 런타임 | Node.js 22.x |
| 언어 | TypeScript 5.9.3 |
| HTTP | Node.js 내장 `http` 모듈 (Express 없음) |
| 데이터베이스 | PostgreSQL (Supabase) / JSON 파일 (개발용) |
| 암호화 | Node.js 내장 WebCrypto |
| 이메일 | nodemailer 8.0.3 |
| 번들러 | esbuild 0.25.12 |

**아키텍처:** npm workspace 모노레포 (web-server, web-client, extension, shared, web-schema)

---

## 2. 보안 취약점 분석

### 🔴 CRITICAL — 결제 웹훅 서명 검증 오류

**파일:** `packages/web-server/src/server.ts:2147-2168`

```typescript
// 현재 코드: 단순 문자열 비교
function secretsMatch(signature: string, secret: string): boolean {
  return timingSafeEqual(Buffer.from(signature), Buffer.from(secret));
}
```

**문제점:**
- Stripe, PayPal은 웹훅 헤더에 평문 시크릿이 아닌 **HMAC-SHA256 서명**을 전송
- 현재 코드는 서명 자체와 시크릿 원문을 직접 비교 → 정상 웹훅 전부 거절
- 공격자가 서명 구조를 알면 위조 가능

**올바른 구현 방향:**
```typescript
// Stripe 예시
import Stripe from 'stripe';
stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

// PayPal 예시: HMAC-SHA256(rawBody, secret) === signature 비교
const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
```

**영향:** 결제 위조, 라이선스 무단 발급, 금전 피해

---

### 🔴 CRITICAL — Graceful Shutdown 미구현

**파일:** `packages/web-server/src/server.ts:4746-4766`

**문제점:**
- SIGTERM / SIGINT 핸들러 없음
- 배포/재시작 시 처리 중인 요청이 강제 종료됨
- DB 연결 풀이 닫히지 않아 커넥션 누수
- 파일 DB 쓰기 중 강제 종료 시 데이터 손상 가능

**올바른 구현 방향:**
```typescript
process.on('SIGTERM', async () => {
  server.close(async () => {
    await postgresPool.end();
    collector.stop();
    process.exit(0);
  });
  // 30초 후 강제 종료 fallback
  setTimeout(() => process.exit(1), 30_000);
});
```

**영향:** 배포 시 데이터 손실, DB 커넥션 고갈

---

### 🔴 CRITICAL — 인메모리 Rate Limit 맵 무제한 증가

**파일:** `packages/web-server/src/server.ts:1928-1942`

```typescript
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
// GC가 5분마다 실행, 1분 내에 고유 IP 수십만 개 유입 시 메모리 폭발
```

**문제점:**
- GC 주기(5분) 동안 IP 기반 Rate Limit 버킷이 무제한 쌓임
- DDoS 공격 시 메모리 고갈로 서버 OOM 크래시 가능
- 맵 크기 상한 없음

**올바른 구현 방향:**
```typescript
// Option 1: Redis 기반 Rate Limiting (추천)
// Option 2: LRU 캐시로 상한 제한
const MAX_BUCKETS = 100_000;
// GC 10초 간격 + 맵 크기 초과 시 강제 clear
```

**영향:** OOM 크래시 → 서버 다운

---

### 🔴 CRITICAL — 결제 웹훅 멱등성(Idempotency) 미구현

**문제점:**
- 결제 제공사는 실패 시 웹훅을 재전송함
- 동일 결제 이벤트를 두 번 처리하면 라이선스 중복 발급 가능
- 이벤트 ID 중복 확인 로직 없음

**올바른 구현 방향:**
```typescript
const eventKey = `${provider}:${hints.eventId}`;
if (await isAlreadyProcessed(eventKey)) {
  json(response, 200, { status: 'already_processed' });
  return;
}
// 처리 후 eventKey 저장
await markAsProcessed(eventKey);
```

**영향:** 라이선스 무료 중복 발급

---

### 🟠 HIGH — 관리자 API 인증 미적용

**파일:** `packages/web-server/src/server.ts:4608-4614`

```typescript
// 현재: Origin 검사만 수행, 실제 인증 없음
if (pathname.startsWith("/api/admin/")) {
  assertAdminOriginAllowed(request, requestUrl);  // Origin만 확인
  // ← 인증 토큰 검사 없음
}
```

**문제점:**
- Origin 헤더는 XSS나 특정 상황에서 우회 가능
- 실제 Bearer 토큰 / 세션 쿠키 검증 없이 관리자 API 접근 가능

**올바른 구현 방향:**
```typescript
if (pathname.startsWith("/api/admin/")) {
  assertAdminAuthorized(request, config.adminToken);  // 토큰 검사 추가
  assertAdminOriginAllowed(request, requestUrl);
}
```

**영향:** 인증 우회 시 서버 설정 변경, 라이선스 조작

---

### 🟠 HIGH — 일부 공개 엔드포인트 Rate Limit 미적용

**누락된 엔드포인트:**
| 경로 | 위험 |
|------|------|
| `POST /api/public/webhooks/*` | 웹훅 스팸 |
| `POST /api/public/orders` | 주문 스팸 (인증 불필요) |
| `POST /api/public/notion/oauth/start` | Notion OAuth 남용 |
| `GET /api/public/bot/config` | 설정 정보 스크래핑 |

---

### 🟠 HIGH — 관리자 세션 취소 불가

**파일:** `packages/web-server/src/server.ts:560-586`

**문제점:**
- 로그아웃해도 세션 무효화 불가 (서버 사이드 세션 스토어 없음)
- Admin Token 교체 후에도 기존 서명 세션이 만료 전까지 유효
- 디바이스별/IP별 바인딩 없음

---

### 🟠 HIGH — 외부 API 요청 Timeout 미설정

**파일:** `packages/web-server/src/server/bot-service.ts:353-366`

```typescript
const response = await fetch(safeUrl, {
  cache: "no-store",
  redirect: "manual"
  // timeout 없음
});
```

**문제점:** 외부 서버(Threads CDN, Notion) 응답 지연 시 요청이 무한정 대기

**올바른 구현 방향:**
```typescript
const controller = new AbortController();
setTimeout(() => controller.abort(), 5_000);
const response = await fetch(safeUrl, { signal: controller.signal });
```

---

### 🟡 MEDIUM — HTTPS 강제 리다이렉트 없음

Reverse Proxy 없이 직접 노출 시 HTTP 요청이 허용됨. Admin 쿠키가 평문으로 전송될 수 있음.

```typescript
// 권고: HTTP → HTTPS 강제 리다이렉트
if (!isSecure && pathname !== '/health') {
  response.writeHead(301, { location: `https://${host}${url}` });
  return;
}
```

---

### 🟡 MEDIUM — JSON Body 런타임 스키마 검증 없음

```typescript
return JSON.parse(raw) as T;  // 타입 단언만, 실제 검증 없음
```

`zod` 또는 `joi` 등으로 입력 스키마를 런타임에 검증 권고.

---

### 🟡 MEDIUM — 랜딩 페이지 CSP 없음

Admin 페이지는 CSP 헤더가 적용되어 있으나, 랜딩 페이지(`/`)에는 미적용.

---

### 🟢 LOW — 이메일 유효성 검사 허술

```typescript
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)  // a@b.c 허용
```

실제 배포 환경에서는 더 엄격한 RFC 5322 검증 권고.

---

## 3. 서버 안정성 및 가용성 분석

### 🔴 CRITICAL — DB 연결 풀 설정 미구성

**파일:** `packages/web-server/src/server/store.ts:293-295`

```typescript
postgresPool = new Pool({ connectionString });  // 기본값 max=10
```

**문제점:**
- 연결 수 min/max 미설정 (기본 max=10)
- idleTimeout, statementTimeout 없음
- 풀 에러 이벤트 미수신
- 트래픽 급증 시 연결 고갈 → 전체 요청 타임아웃

**올바른 구현 방향:**
```typescript
postgresPool = new Pool({
  connectionString,
  min: 2,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
  statement_timeout: 30_000,
});
pool.on('error', (err) => console.error('Pool error:', err));
```

---

### 🔴 CRITICAL — DB 쿼리 Timeout 없음

모든 쿼리에 타임아웃 미설정. DB 슬로우 쿼리 발생 시 요청이 무한 대기하며 연결 풀 고갈.

---

### 🔴 CRITICAL — 모니터링/메트릭 없음

- 요청 레이턴시 추적 없음
- DB 쿼리 성능 추적 없음
- 에러율 추적 없음
- Prometheus/Datadog 등 연동 없음

운영 중 장애 발생 시 원인 파악 불가. 최소 구조적 로그(JSON) + 에러 알림 필수.

---

### 🟠 HIGH — 캐싱 전략 없음

공개 Storefront, 대시보드 등이 매 요청마다 전체 DB를 로드:

```typescript
const data = await loadDatabase();
json(response, 200, buildPublicStorefront(data));
```

변경 빈도가 낮은 데이터에 최소 1분 TTL 캐시 적용 권고.

---

### 🟠 HIGH — DB 재설정 잠금에 Timeout 없음

**파일:** `packages/web-server/src/server/store.ts:120-145`

설정 변경 작업과 일반 DB 접근이 동시에 발생하면 데드락 가능. Timeout 없음.

---

### 🟡 MEDIUM — Request Timeout 미설정

```typescript
const server = createServer(requestHandler);
// server.setTimeout() 미설정
```

느린 클라이언트 업로드가 서버 리소스를 무한정 점유 가능.

```typescript
server.setTimeout(30_000);
```

---

### 🟡 MEDIUM — 페이지네이션 없는 목록 API

주문, 라이선스, 아카이브 목록 API가 전체 데이터를 한 번에 반환. 데이터 증가 시 메모리/응답 시간 문제.

---

## 4. 코드 안정성 분석

### 🟠 HIGH — 요청 핸들러 예외 미처리

```typescript
const server = createServer((request, response) => {
  void requestHandler(request, response);  // 예외 무시
});
```

**올바른 구현 방향:**
```typescript
requestHandler(request, response).catch((err) => {
  logError(err);
  if (!response.headersSent) {
    response.writeHead(500);
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }
});
```

---

### 🟠 HIGH — 서비스 레이어 일관성 없는 에러 처리

일부 서비스 메서드에 try-catch 없음. 예외 발생 시 호출 스택 전체에 전파.

---

### 🟠 HIGH — 구조적 로그 없음

- 요청 로그(경로, 상태코드, 레이턴시) 없음
- 관리자 작업 감사 로그 없음
- 웹훅 처리 결과 로그 없음

최소한 아래 형태의 구조적 로그 필요:
```json
{ "method": "POST", "path": "/api/public/webhooks/stripe", "status": 200, "latency": 47, "ts": "2026-03-28T12:00:00Z" }
```

---

### 🟡 MEDIUM — `as string` 타입 강제 캐스팅

```typescript
// server.ts:2358
const emailMatch = candidates.filter(
  (order) => order.buyerEmail === normalizeEmail(hints.email as string)
);
```

`hints.email`이 null일 경우 런타임 오류. 명시적 null 체크 필요.

---

## 5. 데이터베이스 스키마 분석

### 🟠 HIGH — 핫 패스 인덱스 누락

다음 컬럼에 인덱스 미생성:

```sql
-- 권고 인덱스 추가
CREATE INDEX idx_bot_archives_user_id ON threads_web_store_bot_archives(user_id);
CREATE INDEX idx_bot_users_threads_handle ON threads_web_store_bot_users(threads_handle);
CREATE INDEX idx_orders_buyer_email ON orders(buyer_email);
CREATE INDEX idx_licenses_holder_email ON licenses(holder_email);
```

---

### 🟡 MEDIUM — 단일 JSONB 컬럼에 전체 DB 저장

```sql
SELECT payload FROM threads_web_store WHERE store_key = 'default';
-- 100MB+ JSONB를 매번 전체 로드 후 애플리케이션에서 필터링
```

현재 bot_users, bot_archives는 별도 테이블로 분리됨. 향후 주문/라이선스도 관계형으로 마이그레이션 권고.

---

## 6. 의존성 분석

```bash
npm audit  # CVE 확인 필수
```

| 패키지 | 현재 | 비고 |
|--------|------|------|
| nodemailer | 8.0.3 | 최신 패치 확인 |
| esbuild | 0.25.12 | 최신 0.27.x 마이너 업데이트 권고 |
| typescript | 5.9.3 | 6.x는 Breaking Change 있음, 신중히 검토 |
| @types/node | 22.19.15 | types only, 무관 |

---

## 7. 배포 환경 분석

### 현재 준비된 것

| 항목 | 상태 |
|------|------|
| `/health` 헬스체크 엔드포인트 | ✅ |
| `/ready` DB 연결 확인 엔드포인트 | ✅ |
| `.env.example` 설정 가이드 | ✅ |
| 빌드 스크립트 (`npm run build`) | ✅ |
| PM2 설정 (`ecosystem.config.cjs`) | ✅ (로컬용) |
| 입력 크기 제한 (1MB 기본) | ✅ |
| CSRF 방어 (Origin 검증) | ✅ |
| SQL 인젝션 방어 (파라미터화 쿼리) | ✅ |
| SSRF 방어 (DNS 검증 + Private IP 차단) | ✅ |
| Admin 페이지 CSP/X-Frame-Options | ✅ |

### 미흡한 것

| 항목 | 상태 |
|------|------|
| Graceful Shutdown | ❌ |
| 구조적 로그 | ❌ |
| 메트릭/모니터링 | ❌ |
| Dockerfile | ❌ |
| 결제 웹훅 HMAC 서명 검증 | ❌ |
| 관리자 API 실 인증 적용 | ❌ |
| 웹훅 멱등성 | ❌ |
| DB 풀 설정 | ❌ |
| Rate Limit 맵 크기 상한 | ❌ |

---

## 8. 종합 위험 요약표

| # | 분류 | 이슈 | 등급 | 수정 여부 |
|---|------|------|------|-----------|
| 1 | 보안 | 결제 웹훅 서명 단순 문자열 비교 | 🔴 CRITICAL | 미수정 |
| 2 | 보안 | 웹훅 멱등성 없음 (중복 라이선스 발급) | 🔴 CRITICAL | 미수정 |
| 3 | 보안 | 관리자 API 인증 미적용 | 🟠 HIGH | 미수정 |
| 4 | 보안 | 관리자 세션 취소 불가 | 🟠 HIGH | 미수정 |
| 5 | 보안 | 외부 API 요청 Timeout 없음 | 🟠 HIGH | 미수정 |
| 6 | 보안 | 일부 공개 API Rate Limit 없음 | 🟠 HIGH | 미수정 |
| 7 | 보안 | HTTPS 강제 리다이렉트 없음 | 🟡 MEDIUM | 미수정 |
| 8 | 안정성 | Graceful Shutdown 없음 | 🔴 CRITICAL | 미수정 |
| 9 | 안정성 | Rate Limit 맵 무제한 성장 (OOM 위험) | 🔴 CRITICAL | 미수정 |
| 10 | 안정성 | DB 연결 풀 설정 없음 | 🔴 CRITICAL | 미수정 |
| 11 | 안정성 | DB 쿼리 Timeout 없음 | 🔴 CRITICAL | 미수정 |
| 12 | 안정성 | 모니터링/메트릭 없음 | 🔴 CRITICAL | 미수정 |
| 13 | 안정성 | 캐싱 없음 | 🟠 HIGH | 미수정 |
| 14 | 안정성 | Request Timeout 없음 | 🟡 MEDIUM | 미수정 |
| 15 | 안정성 | 페이지네이션 없는 목록 API | 🟡 MEDIUM | 미수정 |
| 16 | 코드 | 요청 핸들러 예외 무시 | 🟠 HIGH | 미수정 |
| 17 | 코드 | 구조적 로그 없음 | 🟠 HIGH | 미수정 |
| 18 | DB | 핫 패스 인덱스 누락 | 🟠 HIGH | 미수정 |
| 19 | 배포 | Dockerfile 없음 | 🟡 MEDIUM | 미수정 |

---

## 9. 수정 우선순위 로드맵

### Phase 1 — 출시 전 필수 수정 (차단 항목)

| 작업 | 예상 시간 |
|------|-----------|
| 결제 웹훅 HMAC-SHA256 서명 검증 구현 | 2~3h |
| Graceful Shutdown (SIGTERM 핸들러) 추가 | 1h |
| 관리자 API Bearer 토큰 인증 적용 | 1h |
| DB 연결 풀 min/max/timeout 설정 | 1h |
| Rate Limit 맵 상한 + GC 주기 강화 | 1h |
| 웹훅 멱등성 (이벤트 ID 중복 체크) | 2h |

**소계: 약 8~9시간**

### Phase 2 — 출시 후 조기 수정 권고

| 작업 | 예상 시간 |
|------|-----------|
| 구조적 JSON 로그 + 에러 알림 | 2h |
| DB 쿼리 Timeout 설정 | 30m |
| 외부 API 요청 AbortSignal Timeout | 1h |
| 공개 API Rate Limit 추가 적용 | 1h |
| Request Timeout 설정 | 30m |
| DB 핫 패스 인덱스 추가 | 1h |
| Storefront 등 인메모리 캐시 | 2h |
| Prometheus 메트릭 연동 | 3h |

**소계: 약 11시간**

### Phase 3 — 성숙도 향상 (중장기)

- JSONB → 관계형 테이블 마이그레이션
- 테스트 커버리지 확보 (unit + integration)
- Redis 기반 Rate Limiting (멀티 인스턴스 대비)
- Dockerfile + Kubernetes manifests
- 관리자 세션 서버 사이드 스토어 구현

---

## 10. 배포 전 체크리스트

```
[ ] THREADS_WEB_ADMIN_TOKEN 64자 이상 랜덤 문자열 설정
[ ] THREADS_WEB_STORE_BACKEND=postgres 설정
[ ] Supabase PostgreSQL 연결 확인 (/ready 엔드포인트)
[ ] 모든 결제 제공사 웹훅 시크릿 설정
[ ] HTTPS Reverse Proxy (Nginx/Caddy) 구성
[ ] /health, /ready 응답 확인
[ ] 관리자 IP 화이트리스트 설정 (선택)
[ ] Pro 라이선스 JWK 키 생성
[ ] 이메일 SMTP 설정 확인
[ ] .env 파일 git 미포함 확인
[ ] npm audit 취약점 없음 확인
[ ] 결제 웹훅 HMAC 서명 검증 구현 확인
[ ] Graceful Shutdown 구현 확인
[ ] 관리자 API 인증 적용 확인
[ ] 로그 모니터링 수단 확보 (PM2 로그 / CloudWatch / Datadog)
```

---

## 최종 결론

이 코드베이스는 **보안 기초(CSRF 방어, SQL 인젝션 방지, SSRF 차단)가 잘 갖춰진** 성숙한 Node.js 서버입니다.
단, **Phase 1의 6개 Critical/High 항목을 수정하지 않으면 상업 운영은 위험합니다.**

특히:
1. **결제 웹훅 서명 오류** → 실제 결제가 처리 안 될 수 있음
2. **웹훅 멱등성 없음** → 라이선스 무료 중복 발급 가능
3. **Rate Limit 메모리 누수** → DDoS 시 서버 OOM 크래시

이 세 가지만 먼저 해결해도 서비스 가능 수준이 됩니다.
**전체 Phase 1 완료 후 안전하게 상업 운영 가능합니다.**
