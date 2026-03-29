# 로그인이 자꾸 풀리는 원인 분석 보고서

## 1. 결론

**`bot 세션`의 로그인이 풀리는 원인은 크게 두 가지로 좁혀진다.**

1. **서버 재시작/배포 시 DB 파일(`output/web-admin-data.json`)이 소실되면서 bot 세션이 전부 날아감** → 가장 유력 (휘발성 환경)
2. **DB 파일은 살아 있지만 bot 세션 TTL 30일 초과** → 30일 동안 접속하지 않을 경우 발생

`쿠키가 발급 안 됨`, `브라우저가 저장 거부`, `SameSite 차단`, `Secure 플래그 문제`는 코드 상 발생하지 않는 것으로 판정되었습니다. 또한, `admin 12시간 만료`는 bot 세션과 완전히 별개로 동작합니다.

---

## 2. 주요 원인 순위 (확률순)

1. **1위 (확실): `output/web-admin-data.json` DB 파일 소실**
2. **2위 (유력): bot 세션 DB TTL 30일 초과 (장기 비접속)**
3. **3위 (오인): admin 12시간 만료를 bot 로그인 풀림으로 착각**

---

## 3. 상세 분석 및 근거

### A. DB 파일 소실 (파일 기반 퍼시스턴스의 한계)
`server.js` 코드 확인 결과:
```js
var DEFAULT_DB_FILE = path.resolve(process.cwd(), "output", "web-admin-data.json");
// Postgres가 아닐 경우 이 JSON 파일에 전체 세션 데이터를 저장함
```
세션 데이터(`botSessions` 배열)가 JSON 파일 기반으로 관리될 경우, **컨테이너 재시작, 배포, 또는 볼륨 마운트가 없는 환경**에서 파일이 초기화되면 모든 세션 정보가 사라집니다. 이 경우 클라이언트가 유효한 쿠키를 보내도 서버는 이를 인식하지 못해 `authenticated: false`를 반환합니다.

### B. bot 세션 TTL 30일 만료
코드 내 정의된 상수 및 로직:
- `BOT_SESSION_TTL_MS`: 30일
- `BOT_SESSION_TOUCH_INTERVAL_MS`: 12시간 (세션 갱신 주기)
- `BOT_SESSION_COOKIE_MAX_AGE_SECONDS`: 30일

```js
function touchExpiredSessions(data) {
  for (const session of data.botSessions) {
    if (session.status === "active" && isExpired(session.expiresAt, now)) {
      session.status = "expired";
    }
  }
}
```
12시간마다 한 번 이상 접속하면 자동으로 만기가 연장되지만, **30일 동안 한 번도 접속하지 않으면** 상태가 `expired`로 고정되어 로그인이 풀리게 됩니다.

### C. Admin 세션 만료 (Bot 세션과 무관)
- **경로 제한**: Admin 세션 쿠키는 `Path=/api/admin`으로 제한되어 있어 Bot 관련 API에는 영향을 주지 않습니다.
- **유효 기간**: 12시간 고정이며, Bot 세션과 독립적으로 동작합니다.
- **증상**: `/api/admin/*` 접근 시에만 재로그인을 요구합니다. `/scrapbook` 로그인 유지와는 무관합니다.

---

## 4. 인프라 및 네트워크 검증 (정상 판정 근거)

- **Secure & SameSite**: `https://ss-threads.dahanda.dev` 도메인 매칭 시 `secureCookie = true`가 보장되며, SameSite는 항상 `Lax`로 발급됩니다.
- **Nginx 프록시**: Nginx가 `Host` 헤더를 올바르게 전달한다면 코드 수준에서의 쿠키 문제는 발생하지 않습니다.

---

## 5. 실운영 환경 확인 체크리스트

운영 서버에서 다음 사항을 즉시 확인해야 합니다:

1. **DB 파일 상태**: `ls -la output/web-admin-data.json` 확인. 파일이 배포 시마다 초기화되는지 검증.
2. **DB 백엔드**: `THREADS_WEB_DB_POSTGRES_URL` 환경변수 유무 확인. Postgres 사용 시 세션 유실 가능성은 현격히 낮아짐.
3. **Nginx 설정**: `proxy_set_header Host $host;` 설정 포함 여부 확인.
4. **배포 방식**: Docker 사용 시 `output/` 디렉토리가 Volume/Bind mount되어 있는지 확인.

---

## 6. 재현 및 테스트 시나리오

1. **DB 소실 패턴**: 서버 재시작 직후 로그인이 풀리는지 확인.
2. **브라우저 헤더**: `GET /api/public/bot/oauth/callback` 응답에서 `Set-Cookie`의 속성(`Secure`, `HttpOnly`, `SameSite=Lax`, `Max-Age=2592000`)이 정상인지 확인.
3. **Admin/Bot 구분**: 로그인이 풀리는 지점이 `/api/admin`인지 `/scrapbook`인지 명확히 구분하여 대응.

---
*작성일: 2026-03-29*
*상태: 분석 완료 및 원인 좁히기 완료*
