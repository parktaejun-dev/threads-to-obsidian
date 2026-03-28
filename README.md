# Threads Saver

> Save Threads posts from Chrome, and collect mention-triggered archives on the web.

[한국어](#한국어) | [English](#english)

---

## 한국어

### 소개

Threads 글을 PC Chrome에서 Obsidian 또는 Notion으로 저장하는 Chrome 확장 프로그램이며, `@parktaejun` 멘션으로 모으는 web scrapbook 백엔드도 함께 포함합니다. 공개 웹 진입점은 `https://threads-archive.dahanda.dev` 단일 도메인으로 통합합니다.

### 주요 기능

- **Obsidian 직접 저장** — 연결된 폴더에 마크다운 + 이미지를 바로 기록
- **Notion 저장** — Free는 parent page에, Pro는 data source까지 저장
- **Pro Notion 고급 저장** — data source 매핑과 Notion 내부 미디어 업로드 지원
- **ZIP 다운로드 폴백** — 폴더 연결 없이도 ZIP 파일로 저장 가능
- **Mention scrapbook** — `@parktaejun` 멘션을 서버가 받아 사용자별 private scrapbook에 적재
- **Threads OAuth 로그인** — Threads 계정 로그인으로 scrapbook 계정을 연결
- **Pro 규칙 기반 정리** — 파일명 패턴과 저장 경로 패턴을 내 규칙대로 적용
- **Pro AI 정리** — 사용자 LLM 키로 요약, 태그, 추가 frontmatter 생성
- **Pro 3대 활성화** — Pro 키는 최대 3개 PC에서 활성화 가능
- **작성자 연속 답글** — 셀프 스레드(작성자 후속 답글)를 하나의 노트에 함께 저장
- **이미지 저장** — 포스트 및 답글의 이미지를 로컬에 다운로드
- **중복 저장 방지** — 같은 URL의 글을 중복 저장하지 않음
- **한국어/영어 전환** — 브라우저 언어 자동 감지, 수동 전환 가능

고급 기능 도입 계획은 [docs/advanced-features-roadmap.md](docs/advanced-features-roadmap.md) 에 정리했습니다.

### 설치 방법

1. 이 저장소를 다운로드합니다:
   - **[ZIP 다운로드](https://github.com/parktaejun-dev/threads-to-obsidian/archive/refs/heads/main.zip)** 후 압축 해제
   - 또는 `git clone https://github.com/parktaejun-dev/threads-to-obsidian.git`

2. Chrome에서 `chrome://extensions` 접속

3. 우측 상단 **개발자 모드** 활성화

4. **압축해제된 확장 프로그램을 로드합니다** 클릭

5. 다운받은 폴더 안의 **`dist/extension`** 폴더 선택

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
- Pro data source 저장: 제목, URL, 작성자, 날짜, 태그, 답글 수 같은 필드를 가능한 범위에서 자동 매핑
- Pro에서는 이미지/동영상을 원격 링크 대신 Notion 파일로 업로드 가능
- 본문은 frontmatter 없이 Notion용 markdown으로 전송

### 개발자용 빌드

```bash
npm install
npm run build      # dist/extension 에 빌드
npm run typecheck  # 타입 체크
npm run test       # 테스트 실행
cp .env.example .env  # 운영용 변수 입력 후 서버 실행에 사용
```

### 운영 배포 실행

상세 배포 구조와 운영 토폴로지는 `docs/deployment-architecture.md`를 본다.

환경변수 예시:

```bash
cp .env.example .env
```

`.env`에 반드시 설정:

- `THREADS_WEB_ADMIN_TOKEN` (서버 시작 시 필수, 기본값 없음)
- `THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE` 또는 `THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK`
- `THREADS_WEBHOOK_SECRET_STABLEORDER`
- `THREADS_WEBHOOK_SECRET_STRIPE`
- `THREADS_WEBHOOK_SECRET_PAYPAL`
- `THREADS_WEB_DB_FILE` (선택: 기본값 `output/web-admin-data.json`)
- `THREADS_WEB_PORT` (선택: 기본값 `4173`)
- `THREADS_WEB_MAX_BODY_BYTES` (선택: 기본값 `1_000_000`, 최대 `2_000_000`)
- `THREADS_WEB_PUBLIC_ORIGIN` (선택: 예시 `https://threads-archive.dahanda.dev`, 랜딩 canonical/공개 URL 고정)
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

실행:

```bash
npm run build
THREADS_WEB_ADMIN_TOKEN=<랜덤토큰> \
THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE=output/pro-license-private.jwk \
npm run web:start
```

PM2 운영 예시:

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

Notion OAuth 추가 설정:

- Notion public integration redirect URI를 `https://threads-archive.dahanda.dev/api/public/notion/oauth/callback` 로 등록
- 운영 서버 `.env`에 `THREADS_NOTION_CLIENT_ID`, `THREADS_NOTION_CLIENT_SECRET` 입력
- `THREADS_NOTION_ENCRYPTION_SECRET`을 별도 랜덤값으로 설정
- 운영 `THREADS_WEB_PUBLIC_ORIGIN`과 실제 Notion redirect URI를 모두 `https://threads-archive.dahanda.dev` 로 맞춤

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

### 판매 페이지 및 Pro 키 운영

구매는 외부 판매 페이지(`src/web/landing`)에서 주문을 접수하고, 결제 완료 웹훅 수신 후 주문 상태를 `payment_confirmed`로 변경해 자동으로 키를 발급합니다.

- 주문 접수: 구매자 이름, 이메일, 결제수단 선택, 메모
- 결제 수단 기본 구성: Stableorder, Stripe Checkout, PayPal Checkout
- 결제 링크: `Stableorder`, `Stripe`, `PayPal` 결제 페이지로 이동하는 링크 제공
- 자동 처리: `/api/public/webhooks/{stableorder|stripe|paypal}` 에서 결제 알림 수신 시 자동 발급
- Pro 키 활성화 정책: 키 1개당 최대 3개 PC에서 활성화 가능
- seat 반환: 새 PC에서 제한에 걸리면 기존 PC의 확장 설정에서 `제거`를 눌러 seat를 반납
- 관리자 페이지: 수동으로 `Mark paid`/`Issue key` 보조 기능 유지
- 관리자 `History`에서 웹훅 수신 성공/실패/중복(재시도) 이벤트를 함께 확인 가능
- 운영 추적성 강화:
  - 대시보드에 웹훅 처리/무시/거부/중복(재시도) 집계 수치 표시
  - 히스토리에서 이벤트 종류/결제사/provider/사유(reason) 필터로 빠르게 추적

⚠️ 현재 웹훅 엔드포인트는 각 `THREADS_WEBHOOK_SECRET_*` 값과 요청 헤더가 정확히 일치할 때만 수락합니다.  
프로덕션 안정화를 위해 Stripe/PayPal/Stableorder의 정식 서명 검증으로 대체하는 것을 권장합니다.

로컬 테스트 시에는 해당 provider의 `THREADS_WEBHOOK_SECRET_*` 값을 예시 헤더와 동일하게 `test`로 맞추면 됩니다.

웹훅 테스트 예시:

```bash
curl -X POST "http://127.0.0.1:4173/api/public/webhooks/stripe" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test" \
  -d '{"id":"evt_test","type":"checkout.session.completed","data":{"object":{"id":"cs_test","customer_email":"buyer@example.com","metadata":{"threads_order_id":"ORDER_ID"}}}}'
```

```bash
curl -X POST "http://127.0.0.1:4173/api/public/webhooks/paypal" \
  -H "Content-Type: application/json" \
  -H "paypal-transmission-sig: test" \
  -d '{"id":"WH-000","event_type":"PAYMENT.CAPTURE.COMPLETED","resource":{"id":"capture-1","invoice_id":"ORDER_ID","payer":{"email_address":"buyer@example.com"}}}'
```

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
THREADS_WEB_ADMIN_TOKEN=... THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE=... npm run web:start
```

1. `THREADS_WEB_ADMIN_TOKEN`은 충분히 긴 랜덤 문자열로 설정
2. `THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE` 또는 `THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK`에 운영 비밀키 등록
3. `THREADS_WEBHOOK_SECRET_STABLEORDER`, `THREADS_WEBHOOK_SECRET_STRIPE`, `THREADS_WEBHOOK_SECRET_PAYPAL`를 각 결제사 웹훅 시크릿으로 등록
4. Notion OAuth를 쓸 경우 `THREADS_NOTION_CLIENT_ID`, `THREADS_NOTION_CLIENT_SECRET`, `THREADS_NOTION_ENCRYPTION_SECRET` 설정
5. Notion public integration redirect URI를 `/api/public/notion/oauth/callback` 으로 정확히 등록
6. 주문 DB(`THREADS_WEB_DB_FILE`)는 주기 백업 (`cp $PATH $PATH.backup-$(date +%F)`)
7. 배포 후 `/`(랜딩), `/admin`(운영), `/api/public/storefront`, `/api/admin/dashboard`, `/ready` 헬스 체크
8. 웹훅 엔드포인트 등록:
   - `/api/public/webhooks/stableorder`
   - `/api/public/webhooks/stripe`
   - `/api/public/webhooks/paypal`
   - 권장 검증 헤더(시크릿 설정 시): `x-stableorder-signature`, `stripe-signature`, `paypal-transmission-sig`
9. 키 전달 SLA(예: 30분 이내)와 환불 규칙을 정책 문서에 고정

---

## English

### Introduction

A Chrome extension that saves Threads posts to Obsidian or Notion from desktop Chrome, plus a mention-triggered web scrapbook backend. The public web entry point is consolidated on `https://threads-archive.dahanda.dev`.

### Features

- **Direct Obsidian Save** — Write Markdown + images directly to a connected vault folder
- **Notion Save** — Free saves under a parent page, and Pro adds data-source saves
- **Pro Notion Advanced Save** — Enable data source mapping and Notion-managed media uploads
- **ZIP Download Fallback** — Save as ZIP when no folder is connected
- **Mention Scrapbook** — Collect posts into a per-user private scrapbook through `@parktaejun` mentions
- **Threads OAuth Sign-in** — Link a Threads account to the scrapbook experience
- **Pro Rule-based Organization** — Apply your own file-name and save-path patterns
- **Pro AI Organization** — Generate summaries, tags, and extra frontmatter using your own LLM key
- **Pro on 3 PCs** — A Pro key can be activated on up to 3 PCs
- **Author Reply Chains** — Capture self-thread replies in a single note
- **Image Download** — Download post and reply images locally
- **Duplicate Prevention** — Prevents saving the same post URL twice
- **Korean / English** — Auto-detects browser language with manual toggle

The advanced feature roadmap lives in [docs/advanced-features-roadmap.md](docs/advanced-features-roadmap.md).

### Installation

1. Download this repository:
   - **[Download ZIP](https://github.com/parktaejun-dev/threads-to-obsidian/archive/refs/heads/main.zip)** and unzip
   - Or `git clone https://github.com/parktaejun-dev/threads-to-obsidian.git`

2. Open `chrome://extensions` in Chrome

3. Enable **Developer mode** (top-right toggle)

4. Click **Load unpacked**

5. Select the **`dist/extension`** folder inside the downloaded folder

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
- Pro data-source mode creates a new entry/page and auto-maps fields such as title, source URL, author, dates, tags, and reply count when supported
- Pro can upload images and videos into Notion-managed files instead of leaving them as remote links
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
- `THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE` or `THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK`
- `THREADS_WEBHOOK_SECRET_STABLEORDER` (required for Stableorder webhook acceptance)
- `THREADS_WEBHOOK_SECRET_STRIPE` (required for Stripe webhook acceptance)
- `THREADS_WEBHOOK_SECRET_PAYPAL` (required for PayPal webhook acceptance)
- `THREADS_WEB_DB_FILE` (optional, default: `output/web-admin-data.json`)
- `THREADS_WEB_PORT` (optional, default: `4173`)
- `THREADS_WEB_MAX_BODY_BYTES` (optional, default: `1_000_000`, max `2_000_000`)
- `THREADS_WEB_PUBLIC_ORIGIN` (optional, example: `https://threads-archive.dahanda.dev`, pins the public landing origin/canonical URL)
- `THREADS_NOTION_CLIENT_ID` (required for Notion OAuth)
- `THREADS_NOTION_CLIENT_SECRET` (required for Notion OAuth)
- `THREADS_NOTION_ENCRYPTION_SECRET` (recommended dedicated secret for encrypting Notion OAuth tokens)

For testing, use these payload examples in the Sales and Pro key operations section (replace ORDER_ID with an existing order id).

Run:

```bash
npm run build
THREADS_WEB_ADMIN_TOKEN=<strong-random-token> \
THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK_FILE=output/pro-license-private.jwk \
npm run web:start
```

PM2 example:

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

Use `https://threads-archive.dahanda.dev` for both `THREADS_WEB_PUBLIC_ORIGIN` and the registered Notion redirect URI.

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

### Sales and Pro key operations

Orders are created on the public storefront and automatically move to key issuance when payment webhook events are received from Stripe, PayPal, or Stableorder.

- Payment providers: Stableorder, Stripe Checkout, PayPal Checkout
- Pro activation policy: one Pro key can be activated on up to 3 PCs
- Releasing a seat: if a new PC hits the limit, remove the key from an older PC in the extension settings to free that seat
- Webhook endpoints:
- `POST /api/public/webhooks/stableorder`
- `POST /api/public/webhooks/stripe`
- `POST /api/public/webhooks/paypal`
- Admin pages remain as manual fallback for edge cases.
- Admin history shows webhook success/failure/duplicate events for troubleshooting.
  - Dashboard exposes webhook processed/ignored/rejected/retry counters.
  - Event filtering is available by kind/provider/reason in the history table.
- Webhook acceptance currently requires an exact header match against the corresponding `THREADS_WEBHOOK_SECRET_*` value.
- Replace the current token-style check with official provider signature verification for production hardening.

---

## License

MIT
