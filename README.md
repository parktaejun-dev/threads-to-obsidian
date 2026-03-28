# SS Threads

> Save Threads posts from Chrome, and collect mention-triggered archives on the web.

[한국어](#한국어) | [English](#english)

---

## 한국어

### 소개

Threads 글을 PC Chrome에서 Obsidian 또는 Notion으로 저장하는 Chrome 확장 프로그램이며, `@parktaejun` 멘션으로 모으는 web scrapbook 백엔드도 함께 포함합니다. 공개 웹 진입점은 `https://ss-threads.dahanda.dev` 단일 도메인으로 통합합니다.

### 주요 기능

- **Obsidian 직접 저장** — 연결된 폴더에 마크다운 + 이미지를 바로 기록
- **Notion 저장** — Free는 parent page에 저장하고, 고급 Notion 저장은 동일한 Plus 키로 확장 가능
- **ZIP 다운로드 폴백** — 폴더 연결 없이도 ZIP 파일로 저장 가능
- **Mention scrapbook** — `@parktaejun` 멘션을 서버가 받아 사용자별 private scrapbook에 적재
- **Threads OAuth 로그인** — Threads 계정 로그인으로 scrapbook 계정을 연결
- **Free 한도** — scrapbook 저장글 100개, 폴더 5개
- **Plus 한도** — scrapbook 저장글 1,000개, 폴더 50개
- **Plus 키 공용 사용** — 같은 Plus 키를 scrapbook과 extension 양쪽에 연결 가능
- **Plus 3대 활성화** — extension 쪽 키 활성화는 최대 3개 PC까지 허용
- **작성자 연속 답글** — 셀프 스레드(작성자 후속 답글)를 하나의 노트에 함께 저장
- **이미지 저장** — 포스트 및 답글의 이미지를 로컬에 다운로드
- **중복 저장 방지** — 같은 URL의 글을 중복 저장하지 않음
- **한국어/영어 전환** — 브라우저 언어 자동 감지, 수동 전환 가능

고급 기능 도입 계획은 [docs/advanced-features-roadmap.md](docs/advanced-features-roadmap.md) 에 정리했습니다.

### 설치 방법

1. 확장 프로그램 ZIP을 다운로드합니다:
   - **[ZIP 다운로드](https://github.com/parktaejun-dev/threads-to-obsidian/releases/latest/download/ss-threads-extension.zip)** 후 압축 해제
   - 또는 `git clone https://github.com/parktaejun-dev/threads-to-obsidian.git`

2. Chrome에서 `chrome://extensions` 접속

3. 우측 상단 **개발자 모드** 활성화

4. **압축해제된 확장 프로그램을 로드합니다** 클릭

5. ZIP으로 설치했다면 압축 해제한 **`ss-threads-extension`** 폴더를 선택
   - 저장소를 직접 clone 했다면 **`dist/extension`** 폴더를 선택

6. 완료! Threads 개별 포스트 페이지에서 확장 아이콘을 클릭하면 바로 사용할 수 있습니다.

### 사용법

1. 설정에서 기본 저장 대상을 `Obsidian` 또는 `Notion`으로 선택
2. Obsidian이면 vault 폴더를 연결하고, Notion이면 OAuth로 워크스페이스를 연결한 뒤 기본 저장 위치를 고릅니다
2. Threads에서 저장하고 싶은 글의 개별 페이지로 이동
3. 확장 아이콘 클릭 → **현재 글 저장**

### Obsidian 출력 형식

```markdown
---
title: "첫 문장 기반 제목"
author: "작성자"
tags:
  - "threads"
summary: "선택적으로 AI가 생성한 요약"
canonical_url: "https://www.threads.com/..."
topic: "선택적으로 AI가 생성한 추가 frontmatter"
---

# 제목

원문: URL
작성자: @username

본문 내용...
```

### Notion 출력 형식

- parent page 저장: 지정한 Notion 페이지 아래에 새 하위 페이지 생성
- Plus 키가 연결된 경우 data source 저장: 제목, URL, 작성자, 날짜, 태그, 답글 수 같은 필드를 가능한 범위에서 자동 매핑
- Plus 키가 연결된 경우 이미지/동영상을 원격 링크 대신 Notion 파일로 업로드 가능
- 본문은 frontmatter 없이 Notion용 markdown으로 전송

### 개발자용 빌드

```bash
npm install
npm run build      # dist/extension 에 빌드
npm run typecheck  # 타입 체크
npm run test       # 테스트 실행
cp .env.example .env  # 운영용 변수 입력 후 서버 실행에 사용
```

### 웹 운영 배포 실행

상세 배포 구조와 운영 토폴로지는 `docs/deployment-architecture.md`를 본다.

환경변수 예시:

```bash
cp .env.example .env
```

`.env`에 반드시 설정:

- `THREADS_WEB_ADMIN_TOKEN` (서버 시작 시 필수, 기본값 없음)
- `SS_THREADS_PRO_PRIVATE_JWK_FILE` 또는 `SS_THREADS_PRO_PRIVATE_JWK`
- `THREADS_WEBHOOK_SECRET_STABLEORDER`
- `THREADS_WEBHOOK_SECRET_STRIPE`
- `THREADS_PAYPAL_CLIENT_ID`, `THREADS_PAYPAL_CLIENT_SECRET`, `THREADS_PAYPAL_WEBHOOK_ID`
- `THREADS_WEB_DB_FILE` (선택: 기본값 `output/web-admin-data.json`)
- `THREADS_WEB_PORT` (선택: 기본값 `4173`)
- `THREADS_WEB_MAX_BODY_BYTES` (선택: 기본값 `1_000_000`, 최대 `2_000_000`)
- `THREADS_WEB_PUBLIC_ORIGIN` (선택: 예시 `https://ss-threads.dahanda.dev`, 랜딩 canonical/공개 URL 고정)
- `THREADS_BOT_HANDLE` (scrapbook 봇 handle, 예: `parktaejun`)
- `THREADS_BOT_APP_ID` (scrapbook Threads OAuth 사용 시 필수)
- `THREADS_BOT_APP_SECRET` (scrapbook Threads OAuth 사용 시 필수)
- `THREADS_BOT_GRAPH_API_VERSION` (선택: Threads Graph API 버전 prefix)
- `THREADS_BOT_ENCRYPTION_SECRET` (권장: scrapbook OAuth 토큰 암호화 전용 시크릿)
- `THREADS_BOT_MENTION_ACCESS_TOKEN` (선택: background mention collector 전용 토큰 override)
- `THREADS_BOT_MENTION_POLL_INTERVAL_MS` (선택: background mention collector 주기, 기본 `60000`)
- `THREADS_BOT_MENTION_FETCH_LIMIT` (선택: 한 번에 가져올 mention 수, 기본 `25`)
- `THREADS_BOT_MENTION_MAX_PAGES` (선택: 한 번의 sync에서 따라갈 페이지 수, 기본 `5`)
- `THREADS_BOT_INGEST_TOKEN` (mention ingest API 보호용 Bearer 토큰)
- `THREADS_NOTION_CLIENT_ID` (Notion OAuth 사용 시 필수)
- `THREADS_NOTION_CLIENT_SECRET` (Notion OAuth 사용 시 필수)
- `THREADS_NOTION_ENCRYPTION_SECRET` (권장: Notion OAuth 토큰 암호화 전용 시크릿)

기존 `THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK(_FILE)` 이름도 하위 호환용으로 계속 읽습니다.

### 익스텐션 ZIP 릴리스

웹 서버 PM2 재배포와 익스텐션 배포는 별도 절차다.

1. `npm run build`
2. `node scripts/package-extension-zip.mjs`
3. 생성된 `output/release-assets/ss-threads-extension.zip`를 GitHub Release 자산에 업로드
4. 최신 다운로드 링크 `https://github.com/parktaejun-dev/threads-to-obsidian/releases/latest/download/ss-threads-extension.zip` 확인

실행:

```bash
npm run build
THREADS_WEB_ADMIN_TOKEN=<랜덤토큰> \
SS_THREADS_PRO_PRIVATE_JWK_FILE=output/pro-license-private.jwk \
npm run web:start
```

PM2 운영 예시:

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

### Supabase 멀티유저 전환

공개 멀티유저 운영은 file backend 대신 Supabase Postgres 기준으로 맞춘다.

1. 서버 환경변수를 Postgres로 고정:

```bash
export THREADS_WEB_STORE_BACKEND=postgres
export THREADS_WEB_POSTGRES_URL='<supabase-postgres-url>'
export THREADS_WEB_POSTGRES_TABLE=threads_web_store
export THREADS_WEB_POSTGRES_STORE_KEY=default
```

2. Supabase migration 적용:

```bash
supabase db push
```

기본 migration은 `threads_web_store` prefix 기준이다. `THREADS_WEB_POSTGRES_TABLE`를 따로 바꿔 쓰고 있다면 migration SQL도 같은 prefix로 맞춰야 한다.

3. 기존 데이터 백필:

```bash
npm run db:backfill:relational -- --url="$THREADS_WEB_POSTGRES_URL" --from=output/web-admin-data.json
```

기존 데이터가 이미 Postgres의 legacy blob row(`threads_web_store.payload`) 안에 있다면 `--from` 없이 실행하면 된다. 스크립트가 `store_key=default` row를 읽어 relational table로 채운다.

운영 서버에서 `THREADS_WEB_STORE_BACKEND=postgres`가 잡혀 있으면 backfill script의 `auto`도 Postgres source를 우선한다. 오래된 `output/web-admin-data.json` 파일을 강제로 쓰고 싶을 때만 `--source=file` 또는 `--from=...`를 명시한다.

4. 프로덕션 서버 재시작:

프로덕션에서는 file backend 기동을 차단한다. `NODE_ENV=production`에서 `THREADS_WEB_STORE_BACKEND=file` 상태면 서버가 시작되지 않는다.

Notion OAuth 추가 설정:

- Notion public integration redirect URI를 `https://ss-threads.dahanda.dev/api/public/notion/oauth/callback` 로 등록
- 운영 서버 `.env`에 `THREADS_NOTION_CLIENT_ID`, `THREADS_NOTION_CLIENT_SECRET` 입력
- `THREADS_NOTION_ENCRYPTION_SECRET`을 별도 랜덤값으로 설정
- 운영 `THREADS_WEB_PUBLIC_ORIGIN`과 실제 Notion redirect URI를 모두 `https://ss-threads.dahanda.dev` 로 맞춤

운영 점검:

- `GET /health` 응답 `200` 확인
- `GET /ready` 응답 `200` 확인
- `GET /api/public/storefront` 응답 `200` 확인
- `GET /scrapbook` 정적 페이지 로드 확인
- `GET /api/public/bot/config` 응답 `200` 확인
- `GET /admin`, `GET /landing` 정적 페이지 로드 확인

Mention scrapbook 흐름:

1. `/scrapbook` 에서 `Threads로 로그인` 버튼으로 계정을 연결
2. Threads OAuth 승인 후 내 계정 세션이 scrapbook에 생성
3. Threads에서 저장할 글에 `@parktaejun` 멘션 댓글 작성
4. 백그라운드 mention collector가 Threads API에서 새 멘션을 읽어 사용자 기준 scrapbook에 반영
5. 웹에서 Markdown 복사 또는 `.md` 다운로드

백업:

```bash
cp "$THREADS_WEB_DB_FILE" "$THREADS_WEB_DB_FILE.backup-$(date +%F_%H%M%S)"
```

### 기술 스택

- TypeScript + esbuild
- Chrome Extension Manifest V3
- File System Access API (직접 저장)
- JSZip (폴백 다운로드)

### 버그 리포트 / 기능 요청

[GitHub Issues](https://github.com/parktaejun-dev/threads-to-obsidian/issues)에 남겨주세요.

### 판매 페이지 및 Plus 키 운영

구매는 외부 판매 페이지(`src/web/landing`)에서 주문을 접수하고, 결제 완료 웹훅 수신 후 주문 상태를 `payment_confirmed`로 변경해 자동으로 키를 발급합니다.

- 플랜: Free `100 saved / 5 folders`, Plus `1000 saved / 50 folders`
- 가격: 월 `US$2.99`, 연 `US$19.99` (`연간` 기본 선택)
- 주문 접수: 구매자 이름, 이메일, 과금 주기(monthly/yearly), 결제수단 선택, 메모
- 결제 수단 기본 구성: Stableorder, Stripe Checkout, PayPal Checkout
- 결제 링크: `Stableorder`, `Stripe`, `PayPal` 결제 페이지로 이동하는 링크 제공
- 자동 처리: `/api/public/webhooks/{stableorder|stripe|paypal}` 에서 결제 알림 수신 시 자동 발급
- Plus 키 활성화 정책: 키 1개당 최대 3개 PC에서 extension 활성화 가능
- scrapbook 계정에서는 같은 Plus 키를 붙여넣어 저장글/폴더 한도를 확장
- seat 반환: 새 PC에서 제한에 걸리면 기존 PC의 확장 설정에서 `제거`를 눌러 seat를 반납
- 관리자 페이지: 수동으로 `Mark paid`/`Issue key` 보조 기능 유지
- 관리자 `History`에서 웹훅 수신 성공/실패/중복(재시도) 이벤트를 함께 확인 가능
- 운영 추적성 강화:
  - 대시보드에 웹훅 처리/무시/거부/중복(재시도) 집계 수치 표시
  - 최근 webhook event ledger와 최근 API 요청 로그, request latency/error 메트릭 표시
  - 히스토리에서 이벤트 종류/결제사/provider/사유(reason) 필터로 빠르게 추적

웹훅 검증 방식:

- `stableorder`: `x-stableorder-signature` 헤더를 검증합니다. 운영에서는 provider가 안내한 서명 포맷이 있으면 그 값을 그대로 전달하세요.
- `stripe`: `stripe-signature` 헤더의 `t=...,v1=...` 서명을 raw body 기준으로 검증합니다.
- `paypal`: `paypal-transmission-*` 헤더와 `THREADS_PAYPAL_CLIENT_ID`, `THREADS_PAYPAL_CLIENT_SECRET`, `THREADS_PAYPAL_WEBHOOK_ID`를 사용해 PayPal `verify-webhook-signature` API로 검증합니다.

Stripe 로컬 테스트 예시:

```bash
PAYLOAD='{"id":"evt_test","type":"checkout.session.completed","data":{"object":{"id":"cs_test","customer_email":"buyer@example.com","metadata":{"threads_order_id":"ORDER_ID"}}}}'
STRIPE_SIGNATURE=$(node -e 'const crypto = require("node:crypto"); const secret = process.env.THREADS_WEBHOOK_SECRET_STRIPE || "whsec_test"; const payload = process.argv[1]; const ts = Math.floor(Date.now() / 1000); const v1 = crypto.createHmac("sha256", secret).update(`${ts}.${payload}`).digest("hex"); process.stdout.write(`t=${ts},v1=${v1}`);' "$PAYLOAD")
curl -X POST "http://127.0.0.1:4173/api/public/webhooks/stripe" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: ${STRIPE_SIGNATURE}" \
  -d "$PAYLOAD"
```

PayPal은 단순 `curl` 헤더 비교로는 검증되지 않습니다. PayPal webhook simulator 또는 실제 sandbox/live webhook을 사용해 테스트하세요.

Stableorder 테스트 예시:

```bash
curl -X POST "http://127.0.0.1:4173/api/public/webhooks/stableorder" \
  -H "Content-Type: application/json" \
  -H "x-stableorder-signature: test" \
  -d '{"id":"so_100","order_id":"ORDER_ID","status":"paid","buyer_email":"buyer@example.com"}'
```

`ORDER_ID`는 주문 ID 또는 결제 완료 알림에서 추정 가능한 주문 레퍼런스로 바꿔서 사용합니다.

### 출시 운영 시작 가이드

```bash
cp .env.example .env
node --env-file=.env scripts/generate-pro-license.mjs --audience pro --email test@example.com --output output
npm run build
THREADS_WEB_ADMIN_TOKEN=... SS_THREADS_PRO_PRIVATE_JWK_FILE=... npm run web:start
```

1. `THREADS_WEB_ADMIN_TOKEN`은 충분히 긴 랜덤 문자열로 설정
2. `SS_THREADS_PRO_PRIVATE_JWK_FILE` 또는 `SS_THREADS_PRO_PRIVATE_JWK`에 운영 비밀키 등록
3. `THREADS_WEBHOOK_SECRET_STABLEORDER`, `THREADS_WEBHOOK_SECRET_STRIPE`를 설정하고, PayPal 사용 시 `THREADS_PAYPAL_CLIENT_ID`, `THREADS_PAYPAL_CLIENT_SECRET`, `THREADS_PAYPAL_WEBHOOK_ID`까지 함께 등록
4. Notion OAuth를 쓸 경우 `THREADS_NOTION_CLIENT_ID`, `THREADS_NOTION_CLIENT_SECRET`, `THREADS_NOTION_ENCRYPTION_SECRET` 설정
5. Notion public integration redirect URI를 `/api/public/notion/oauth/callback` 으로 정확히 등록
6. 주문 DB(`THREADS_WEB_DB_FILE`)는 주기 백업 (`cp $PATH $PATH.backup-$(date +%F)`)
7. 배포 후 `/`(랜딩), `/admin`(운영), `/api/public/storefront`, `/api/admin/dashboard`, `/ready` 헬스 체크
8. 웹훅 엔드포인트 등록:
   - `/api/public/webhooks/stableorder`
   - `/api/public/webhooks/stripe`
   - `/api/public/webhooks/paypal`
   - 검증 헤더: `x-stableorder-signature`, `stripe-signature`, `paypal-transmission-*`
9. 필요하면 `THREADS_WEB_STRUCTURED_REQUEST_LOGS=true` 로 JSON request 로그를 stdout에 출력
10. 키 전달 SLA(예: 30분 이내)와 환불 규칙을 정책 문서에 고정

---

## English

### Introduction

A Chrome extension that saves Threads posts to Obsidian or Notion from desktop Chrome, plus a mention-triggered web scrapbook backend. The public web entry point is consolidated on `https://ss-threads.dahanda.dev`.

### Features

- **Direct Obsidian Save** — Write Markdown + images directly to a connected vault folder
- **Notion Save** — Free saves under a parent page, and advanced Notion save can be unlocked with the same Plus key
- **ZIP Download Fallback** — Save as ZIP when no folder is connected
- **Mention Scrapbook** — Collect posts into a per-user private scrapbook through `@parktaejun` mentions
- **Threads OAuth Sign-in** — Link a Threads account to the scrapbook experience
- **Free limits** — 100 saved scrapbook posts and 5 folders
- **Plus limits** — 1,000 saved scrapbook posts and 50 folders
- **Shared Plus key** — The same Plus key can be used in both scrapbook and the extension
- **Plus on 3 PCs** — Extension activation allows up to 3 PCs
- **Author Reply Chains** — Capture self-thread replies in a single note
- **Image Download** — Download post and reply images locally
- **Duplicate Prevention** — Prevents saving the same post URL twice
- **Korean / English** — Auto-detects browser language with manual toggle

The advanced feature roadmap lives in [docs/advanced-features-roadmap.md](docs/advanced-features-roadmap.md).

### Installation

1. Download the extension ZIP:
   - **[Download ZIP](https://github.com/parktaejun-dev/threads-to-obsidian/releases/latest/download/ss-threads-extension.zip)** and unzip
   - Or `git clone https://github.com/parktaejun-dev/threads-to-obsidian.git`

2. Open `chrome://extensions` in Chrome

3. Enable **Developer mode** (top-right toggle)

4. Click **Load unpacked**

5. If you used the ZIP, select the extracted **`ss-threads-extension`** folder
   - If you cloned the repository, select **`dist/extension`**

6. Done! Navigate to any Threads post and click the extension icon to start saving.

### Usage

1. Choose `Obsidian` or `Notion` as the default save target in Settings
2. For Obsidian, connect your vault folder. For Notion, connect your workspace with OAuth and choose a default page or data source.
2. Navigate to an individual Threads post page
3. Click the extension icon → **Save Current Post**

### Obsidian Output

```markdown
---
title: "Title from first sentence"
author: "username"
tags: [threads]
canonical_url: "https://www.threads.com/..."
---

# Title

Source: URL
Author: @username

Post body text...
```

### Notion Output

- Parent-page mode creates a new child page under the configured Notion page
- When a Plus key is connected, data-source mode creates a new entry/page and auto-maps fields such as title, source URL, author, dates, tags, and reply count when supported
- When a Plus key is connected, images and videos can be uploaded into Notion-managed files instead of leaving them as remote links
- The body is sent as Notion markdown without YAML frontmatter

### Developer Build

```bash
npm install
npm run build      # Build to dist/extension
npm run typecheck   # Type check
npm run test        # Run tests
```

### Production Run

```bash
cp .env.example .env
```

Required `.env` values:

- `THREADS_WEB_ADMIN_TOKEN` (required, no fallback)
- `SS_THREADS_PRO_PRIVATE_JWK_FILE` or `SS_THREADS_PRO_PRIVATE_JWK`
- `THREADS_WEBHOOK_SECRET_STABLEORDER` (required for Stableorder webhook acceptance)
- `THREADS_WEBHOOK_SECRET_STRIPE` (required for Stripe webhook acceptance)
- `THREADS_PAYPAL_CLIENT_ID`, `THREADS_PAYPAL_CLIENT_SECRET`, `THREADS_PAYPAL_WEBHOOK_ID` (required for PayPal webhook verification)
- `THREADS_WEB_DB_FILE` (optional, default: `output/web-admin-data.json`)
- `THREADS_WEB_PORT` (optional, default: `4173`)
- `THREADS_WEB_MAX_BODY_BYTES` (optional, default: `1_000_000`, max `2_000_000`)
- `THREADS_WEB_PUBLIC_ORIGIN` (optional, example: `https://ss-threads.dahanda.dev`, pins the public landing origin/canonical URL)
- `THREADS_NOTION_CLIENT_ID` (required for Notion OAuth)
- `THREADS_NOTION_CLIENT_SECRET` (required for Notion OAuth)
- `THREADS_NOTION_ENCRYPTION_SECRET` (recommended dedicated secret for encrypting Notion OAuth tokens)

The legacy `THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK(_FILE)` names are still accepted for backward compatibility.

For testing, use these payload examples in the Sales and Plus key operations section (replace ORDER_ID with an existing order id).

Run:

```bash
npm run build
THREADS_WEB_ADMIN_TOKEN=<strong-random-token> \
SS_THREADS_PRO_PRIVATE_JWK_FILE=output/pro-license-private.jwk \
npm run web:start
```

PM2 example:

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

Use `https://ss-threads.dahanda.dev` for both `THREADS_WEB_PUBLIC_ORIGIN` and the registered Notion redirect URI.

Smoke checks:

- `GET /health` => `200`
- `GET /ready` => `200`
- `GET /api/public/storefront` => `200`
- `GET /admin`, `GET /landing` page render

### Tech Stack

- TypeScript + esbuild
- Chrome Extension Manifest V3
- File System Access API (direct save)
- JSZip (fallback download)

### Bug Reports / Feature Requests

Please open an issue on [GitHub Issues](https://github.com/parktaejun-dev/threads-to-obsidian/issues).

### Sales and Plus key operations

Orders are created on the public storefront and automatically move to key issuance when payment webhook events are received from Stripe, PayPal, or Stableorder.

- Plans: Free `100 saved / 5 folders`, Plus `1000 saved / 50 folders`
- Pricing: `US$2.99 monthly`, `US$19.99 yearly` (`yearly` is the default selection)
- Payment providers: Stableorder, Stripe Checkout, PayPal Checkout
- Plus activation policy: one Plus key can be activated on up to 3 PCs in the extension
- The same Plus key can also be pasted into scrapbook to raise limits for that scrapbook account
- Releasing a seat: if a new PC hits the limit, remove the key from an older PC in the extension settings to free that seat
- Webhook endpoints:
- `POST /api/public/webhooks/stableorder`
- `POST /api/public/webhooks/stripe`
- `POST /api/public/webhooks/paypal`
- Admin pages remain as manual fallback for edge cases.
- Admin history shows webhook success/failure/duplicate events for troubleshooting.
  - Dashboard exposes webhook processed/ignored/rejected/retry counters.
  - Dashboard also exposes recent webhook ledger entries plus recent request logs and request metrics.
  - Event filtering is available by kind/provider/reason in the history table.
- Stripe webhooks are verified against the raw request body using `stripe-signature`.
- PayPal webhooks are verified through PayPal's `verify-webhook-signature` API.

---

## License

MIT
