# Threads OAuth 모바일 인증 개선: Polling 기반 플로우

## 배경 및 문제

### 기존 문제
모바일 환경에서 Threads OAuth 인증 시 다음과 같은 문제가 발생했다.

1. **앱 가로채기**: 사용자가 `https://www.threads.com/oauth/authorize/...`를 열면 iOS Universal Links / Android App Links가 URL을 가로채 Threads 앱을 강제로 실행한다.
2. **세션 격리**: Threads 앱이 OAuth 콜백 URL을 처리할 때, 앱 내부 WebView(SFSafariViewController 등)에서 열릴 수 있다. 이 WebView에 설정된 세션 쿠키는 실제 브라우저(Safari, Chrome 등)와 공유되지 않는다.
3. **로그인 실패**: 콜백이 내부 WebView에서 실행되면 실제 브라우저에는 세션이 없어 사용자는 로그인되지 않은 상태로 scrapbook에 접속하게 된다.

### 기존 우회책의 한계
이전 브릿지 페이지는 "링크 복사 → 새 탭 붙여넣기" 방식으로 우회했다. 이는 작동은 했지만 UX가 나쁘고, 클립보드 접근이 막힌 브라우저 환경에서는 수동 복사가 필요했다.

---

## 해결 방식: Polling 기반 세션 교환 레이어 추가

### 핵심 아이디어
**기존 콜백 경로는 그대로 유지**하되, 그 위에 polling 레이어를 추가한다. 콜백은 기존과 동일하게 세션을 생성하고 쿠키를 직접 설정한다. 추가로, 콜백이 실행될 때 `activationCode`도 함께 DB에 저장한다. 실제 브라우저가 폴링 중이었다면 이 코드를 통해 `/activate` 엔드포인트에서 동일한 세션 쿠키를 다시 획득할 수 있다.

즉, **콜백이 실제 브라우저에서 실행되면 기존처럼 그 자리에서 세션 획득**, **콜백이 앱 내부 WebView에서 실행되면 polling 중인 실제 브라우저가 activationCode로 세션 획득**이라는 이중 경로가 생긴다.

### 인증 플로우

```
실제 브라우저 (Safari/Chrome)              Threads 앱 / 내부 WebView
─────────────────────────────              ──────────────────────────────
① /api/public/bot/oauth/bridge 열기
   → startBotOauth: pollToken 발급
② "Threads로 로그인" 버튼 탭
   (target="_blank"로 authorizeUrl 열기) → Threads 앱 실행
③ 2초마다 /oauth/poll?token=XXX 폴링      앱: 이미 로그인 상태
   {status: "pending"}                     → 권한 허가 화면 표시
   {status: "pending"}                     → 사용자 "허가" 탭
                              ←──────────── /oauth/callback 실행
                                            completeBotOauth 호출:
                                              - 세션 생성 (createBotSession)
                                              - activationCode + linkedSessionToken DB 저장
                                              - 세션 쿠키를 이 응답에 직접 Set-Cookie
                                              → /scrapbook?connected=1 리다이렉트
                                            (WebView에서 열렸다면 쿠키는 앱 컨텍스트에 설정됨)
④ {status: "authorized",
   activationCode: "YYY"} 수신
⑤ /oauth/activate?code=YYY 이동
   → activateBotOauthSession:
       activationCode 소비, linkedSessionToken 소거
   → 세션 쿠키 실제 브라우저에 Set-Cookie
   → /scrapbook?connected=1 리다이렉트
⑥ 실제 브라우저: 로그인 완료
```

> **주의**: 브릿지 페이지의 버튼은 `target="_blank"`로 authorizeUrl을 연다. 데스크톱에서는 새 탭에서 직접 콜백을 받아 쿠키가 설정된다. 모바일에서는 앱이 실행되거나, Threads 앱이 없는 경우 브라우저에서 열린다. 어느 경우든 polling 경로가 세션 획득의 최종 보장 수단이 된다.

---

## 세션 쿠키가 설정되는 위치

콜백(`/oauth/callback`)과 활성화(`/oauth/activate`) 양쪽에서 모두 세션 쿠키를 설정한다.

| 경로 | 쿠키 설정 위치 | 유효한 경우 |
|------|---------------|-------------|
| `/oauth/callback` | 콜백 HTTP 응답의 `Set-Cookie` | 콜백이 실제 브라우저에서 직접 열린 경우 (데스크톱, 앱 없는 모바일) |
| `/oauth/activate` | activate HTTP 응답의 `Set-Cookie` | 콜백이 앱 내부 WebView에서 열려 쿠키가 실제 브라우저에 전달되지 않은 경우 |

두 경로 모두 `appendSetCookie(response, buildSessionCookie(session.sessionToken, secureCookie))`로 동일하게 처리된다.

---

## 보안 설계

`completeBotOauth`는 `createBotSession` 호출 직후 반환하기 전에 아래 값을 oauth session 레코드에 함께 저장한다.

| 토큰 | 유효기간 | 저장 방식 | 용도 |
|------|----------|-----------|------|
| `pollToken` | OAuth 세션과 동일 (10분) | Hash 저장, raw는 브릿지 페이지에만 전달 | 브라우저가 인증 완료 여부를 폴링할 때 세션 식별 |
| `activationCode` | 5분 | Raw 저장 (단기 1회용) | 폴링 완료 시 `/activate`에서 세션 쿠키 교환 |
| `linkedSessionToken` | activate 호출 즉시 소거 | Raw 저장 (임시) | activate 시 `buildSessionCookie`의 입력값 |

- `activationCode`는 `activateBotOauthSession` 호출 시 즉시 null로 소거된다.
- `linkedSessionToken`도 동시에 null로 소거된다.
- 두 필드 모두 5분 초과 시 유효하지 않다.

---

## 변경 내역

### `packages/web-schema/src/index.ts`

`BotOauthSessionRecord` 인터페이스에 필드 추가:

```typescript
export interface BotOauthSessionRecord {
  id: string;
  stateHash: string;
  pollTokenHash: string;        // 추가: 폴링 조회용 해시
  createdAt: string;
  expiresAt: string;
  completedAt: string | null;
  activationCode: string | null;        // 추가: 1회용 활성화 코드 (5분)
  activationExpiresAt: string | null;   // 추가: 활성화 코드 만료 시각
  linkedSessionToken: string | null;    // 추가: activate 시 쿠키 값 (소거됨)
  status: BotOauthSessionStatus;
}
```

### `packages/web-server/src/server/store.ts`

`botOauthSessions` 파서에 새 필드 매핑 추가. 기존 DB 레코드와 하위 호환 유지 (없는 필드는 null로 초기화).

### `packages/web-server/src/server/bot-service.ts`

**수정된 함수:**

- `startBotOauth`: pollToken 생성·반환 추가. `BotOauthStartResult`에 `pollToken: string` 필드 추가.
- `completeBotOauth`: 세션 생성 후 `activationCode`, `activationExpiresAt`, `linkedSessionToken`을 oauth session 레코드에 함께 저장. 반환 타입에 `activationCode: string` 추가.

**추가된 함수:**

- `pollBotOauthSession(data, rawPollToken)`: poll 토큰 hash로 세션을 찾아 상태 반환. `pending` / `authorized` (activationCode 포함) / `expired`.
- `activateBotOauthSession(data, rawActivationCode)`: activationCode 유효성 검증 후 `linkedSessionToken` 반환. 두 필드 즉시 소거.

**추가된 상수:**

- `BOT_OAUTH_ACTIVATION_TTL_MS = 5 * 60_000` (5분)

### `packages/web-server/src/server.ts`

**수정된 함수:**

- `renderOauthBridgePage`: 복사붙여넣기 UI 제거. `target="_blank"` 링크 버튼 + 클릭 시 polling 시작 JS로 교체.

**추가된 엔드포인트:**

- `GET /api/public/bot/oauth/poll?token=RAW_POLL_TOKEN`
  - 응답: `{status: "pending" | "authorized" | "expired", activationCode?: string}`
- `GET /api/public/bot/oauth/activate?code=RAW_ACTIVATION_CODE`
  - 성공: 세션 쿠키 설정 후 `/scrapbook?connected=1` 리다이렉트
  - 실패: `/scrapbook?authError=...` 리다이렉트

**수정된 i18n 문자열 (ko/en):**

기존 복사 관련 키 5개(`oauthStep1~3`, `oauthCopyButton`, `oauthCopied*`, `oauthHint`) 제거, 신규 키 5개 추가: `oauthAuthorizeButton`, `oauthWaitingStatus`, `oauthAuthorizedStatus`, `oauthExpiredStatus`, `oauthFallbackHint`.

---

## UX 변화

### 기존
1. 브릿지 페이지 진입
2. "로그인 링크 복사" 버튼 클릭
3. 새 탭 열기 → 주소창에 붙여넣기
4. Threads 로그인 (아이디/비밀번호 입력 필요)

### 개선 후
1. 브릿지 페이지 진입
2. "Threads로 로그인" 버튼 탭
3. Threads 앱이 설치된 경우: 앱에서 권한 허가 (비밀번호 불필요)
4. 브라우저가 polling으로 완료 감지 → activate 경유 → scrapbook 이동

복사붙여넣기 단계가 제거된다. 단, `target="_blank"` 방식의 우회책이라는 점은 동일하며, 환경(앱 설치 여부, 브라우저 종류, OS 버전)에 따라 경험에 차이가 있을 수 있다.

---

## 호환성

- 기존 `/oauth/callback`은 변경 없이 유지된다. 콜백이 실제 브라우저에서 열리면 기존처럼 그 자리에서 쿠키가 설정된다. polling은 콜백이 앱 WebView에서 실행됐을 때의 보완 경로다.
- `startBotOauth` API를 직접 호출하는 클라이언트(extension 등)는 응답에 `pollToken` 필드가 추가됐지만, 기존 필드(`authorizeUrl`, `botHandle`)는 그대로여서 하위 호환된다.
- 기존 DB의 `botOauthSessions` 레코드는 새 필드가 null로 초기화되므로 마이그레이션 없이 배포 가능하다.
