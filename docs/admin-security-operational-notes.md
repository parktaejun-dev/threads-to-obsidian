# Admin Security 운영 주의사항

기준일: `2026-03-28`

## 문서 목적

이 문서는 최근 반영된 `admin 보안 하드닝` 이후, 실제 배포와 운영에서 반드시 지켜야 하는 조건을 짧고 명확하게 정리한다.

대상 코드:

- `packages/web-server/src/server.ts`
- `packages/web-server/src/server/runtime-config.ts`
- `packages/web-server/src/server/store.ts`
- `packages/web-client/src/admin/main.ts`
- `packages/web-client/src/admin/index.html`

## 변경 요약

현재 admin 접근 방식은 다음과 같이 바뀌었다.

- 브라우저 `sessionStorage` bearer token 방식 제거
- 서버 발급 `HttpOnly` admin session cookie 방식으로 전환
- `X-Forwarded-For`는 trusted proxy 뒤에서만 신뢰
- admin 정적 페이지에 `CSP`, `no-store`, `X-Frame-Options` 적용
- runtime config의 DB 설정은 저장과 활성 적용을 분리
- SMTP 비밀번호 / Postgres URL은 마스킹되며, 명시적 clear 없이는 유지

## 반드시 알아야 할 주의사항

### 1. 프록시 뒤 운영이면 `THREADS_WEB_TRUST_PROXY_ALLOWLIST`를 반드시 설정

현재 admin IP allowlist는 `X-Forwarded-For`를 무조건 신뢰하지 않는다.

직접 접속 IP가 `THREADS_WEB_TRUST_PROXY_ALLOWLIST`에 있을 때만 forwarded IP를 사용한다.

즉:

- 로컬 단독 실행이면 설정이 없어도 됨
- `Nginx`, `Cloudflare Tunnel`, `Load Balancer`, `Reverse Proxy` 뒤 운영이면 프록시의 실제 peer IP를 allowlist에 넣어야 함

예시:

```env
THREADS_WEB_TRUST_PROXY_ALLOWLIST=127.0.0.1,::1
```

이 값이 없으면 admin IP 판정은 `request.socket.remoteAddress`만 사용한다.

### 2. 가능하면 admin은 별도 origin으로 분리

지원 설정:

```env
THREADS_WEB_ADMIN_ORIGIN=https://admin.ss-threads.dahanda.dev
```

이 값을 넣으면 `/admin`과 `/api/admin/*`는 해당 origin에서만 서비스된다.

권장 이유:

- public 앱과 admin을 같은 origin에 두지 않기 위함
- same-origin XSS 영향 반경 축소
- 브라우저 보안 경계 명확화

주의:

- 이 값만 넣는다고 분리가 끝나는 것은 아님
- 실제 DNS, reverse proxy, TLS, 배포 라우팅도 함께 맞춰야 함

### 3. admin session cookie는 HTTPS 전제를 깔고 운영하는 게 맞음

현재 admin 인증은 서버가 발급하는 `HttpOnly` cookie 기반이다.

운영 권장 조건:

- production에서는 반드시 HTTPS
- admin origin에도 TLS 적용
- reverse proxy에서 http -> https redirect 강제

이유:

- 쿠키 기반 인증은 전송 계층 보호가 핵심
- 특히 원격 admin 접근 시 평문 HTTP 운영은 금지 수준으로 봐야 함

### 4. DB 설정 변경은 저장 후 즉시 전환되지 않음

현재 runtime config에서 database 설정을 바꾸면:

- 새 설정은 디스크에 저장됨
- 필요한 경우 기존 데이터는 새 저장소로 복사됨
- 하지만 현재 프로세스의 활성 DB는 그대로 유지될 수 있음
- admin UI에는 `restart required` 상태가 표시됨

이 동작은 의도된 것이다.

이유:

- 단일 프로세스에서도 hot switch 중 운영 사고가 날 수 있음
- 다중 인스턴스에서는 더 위험함

운영 절차:

1. admin에서 DB 설정 저장
2. DB 연결 테스트 확인
3. maintenance window 확보
4. 모든 웹 서버 인스턴스 재시작
5. 재시작 후 admin에서 active database 확인

### 5. 다중 인스턴스 운영에서는 모든 인스턴스를 함께 재시작

현재 활성 runtime config는 프로세스 메모리 안에도 유지된다.

따라서:

- 단일 인스턴스면 재시작 1회로 충분
- `PM2 cluster`, `Docker replicas`, `multiple VM` 구조면 전 인스턴스를 함께 재기동해야 함

주의:

- 일부 인스턴스만 재시작하면 old DB / new DB가 동시에 살아 있을 수 있음
- 이 상태는 write 분산과 데이터 불일치로 이어질 수 있음

### 6. DB 전환은 maintenance window에서 처리하는 것이 안전

코드상으로는 기존 데이터 복사까지 지원하지만, 운영 관점에서는 여전히 maintenance 절차가 맞다.

권장 이유:

- 설정 저장 직후부터 재시작 전까지 old/new 저장소가 병행될 수 있음
- background collector, admin write, webhook write가 동시에 일어나면 운영 해석이 어려워짐

실무 권장:

- 전환 직전 write-heavy 작업 일시 중지
- collector 수동 중지 또는 maintenance mode
- 재시작 이후 health/readiness 확인

### 7. secret 필드는 blank 저장이 아니라 `유지`로 동작

현재 admin runtime config에서:

- Postgres URL 입력칸을 비워도 기존 secret은 유지됨
- SMTP password 입력칸을 비워도 기존 secret은 유지됨

실제로 제거하려면:

- `Clear saved Postgres URL on save`
- `Clear saved SMTP password on save`

를 체크한 뒤 저장해야 한다.

즉:

- 빈칸 저장 = 유지
- clear 체크 후 저장 = 삭제

### 8. admin 세션은 서버 재시작이나 배포 시 재로그인이 필요할 수 있음

현재 admin session은 서버의 `THREADS_WEB_ADMIN_TOKEN`을 기준으로 서명 검증된다.

다음 경우 기존 세션이 무효화될 수 있다.

- 서버 재배포
- `THREADS_WEB_ADMIN_TOKEN` 교체
- session max age 만료

이건 정상 동작이다.

운영자는 토큰 rotation 시 admin 재로그인이 필요하다는 점을 인지해야 한다.

### 9. admin API는 여전히 서버측 강권한 경로다

현재 보호 수단은 다음 조합이다.

- admin origin 제한
- admin IP allowlist
- admin session cookie
- rate limit

하지만 이 경로는 여전히 고권한 운영 API다.

따라서 추가 권장:

- reverse proxy 레벨에서 `/admin`, `/api/admin/*` 별도 접근 제어
- WAF 또는 VPN 뒤 노출
- access log / audit log 수집
- 운영자 계정 공유 금지

## 운영 체크리스트

배포 전에 아래를 확인한다.

- `THREADS_WEB_ADMIN_TOKEN`이 충분히 긴 랜덤 값인가
- `THREADS_WEB_ADMIN_ALLOWLIST`가 올바른가
- 프록시 운영 시 `THREADS_WEB_TRUST_PROXY_ALLOWLIST`가 설정돼 있는가
- 가능하면 `THREADS_WEB_ADMIN_ORIGIN`이 분리돼 있는가
- admin 경로가 HTTPS로만 열리는가
- DB 전환 전에는 maintenance window를 잡았는가
- DB 전환 후 전 인스턴스를 재시작했는가
- active database가 admin 화면에서 기대값과 일치하는가

## 권장 배포 설정 예시

```env
THREADS_WEB_ADMIN_TOKEN=replace-with-long-random-secret
THREADS_WEB_ADMIN_ALLOWLIST=10.0.0.5,10.0.0.6
THREADS_WEB_TRUST_PROXY_ALLOWLIST=127.0.0.1,::1
THREADS_WEB_ADMIN_ORIGIN=https://admin.ss-threads.dahanda.dev
THREADS_WEB_PUBLIC_ORIGIN=https://ss-threads.dahanda.dev
```

## 현재 결론

현재 구조는 이전보다 훨씬 안전하다.

하지만 아래 두 조건은 운영자가 직접 지켜야 한다.

- proxy / IP 신뢰 경계 설정
- DB 변경 시 restart + maintenance 절차

즉, 코드만 바뀌었다고 끝난 것이 아니라 배포 설정과 운영 절차까지 같이 맞춰야 한다.
