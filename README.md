# Threads to Obsidian

> Save Threads posts directly to your Obsidian vault as Markdown.

[한국어](#한국어) | [English](#english)

---

## 한국어

### 소개

Threads 글을 Obsidian vault에 마크다운으로 바로 저장하는 Chrome 확장 프로그램입니다.

### 주요 기능

- **Obsidian 직접 저장** — 연결된 폴더에 마크다운 + 이미지를 바로 기록
- **ZIP 다운로드 폴백** — 폴더 연결 없이도 ZIP 파일로 저장 가능
- **작성자 연속 답글** — 셀프 스레드(작성자 후속 답글)를 하나의 노트에 함께 저장
- **이미지 저장** — 포스트 및 답글의 이미지를 로컬에 다운로드
- **중복 저장 방지** — 같은 URL의 글을 중복 저장하지 않음
- **한국어/영어 전환** — 브라우저 언어 자동 감지, 수동 전환 가능

### 설치 방법 (GitHub)

> Chrome 웹 스토어 출시 전까지는 아래 방법으로 직접 설치할 수 있습니다.

1. 이 저장소를 클론합니다:
   ```bash
   git clone https://github.com/parktaejun-dev/threads-to-obsidian.git
   cd threads-to-obsidian
   ```

2. 빌드합니다:
   ```bash
   npm install
   npm run build
   ```

3. Chrome에서 `chrome://extensions` 접속

4. 우측 상단 **개발자 모드** 활성화

5. **압축해제된 확장 프로그램을 로드합니다** 클릭

6. `dist/extension` 폴더 선택

7. Threads 개별 포스트 페이지에서 확장 아이콘을 클릭하면 바로 사용 가능합니다.

### 사용법

1. (선택) 설정에서 Obsidian vault 폴더 연결
2. Threads에서 저장하고 싶은 글의 개별 페이지로 이동
3. 확장 아이콘 클릭 → **현재 글 저장**

### 마크다운 출력 형식

```markdown
---
title: "첫 문장 기반 제목"
author: "작성자"
tags: [threads]
canonical_url: "https://www.threads.com/..."
---

# 제목

원문: URL
작성자: @username

본문 내용...
```

### 빌드

```bash
npm install
npm run build      # dist/extension 에 빌드
npm run typecheck  # 타입 체크
npm run test       # 테스트 실행
```

### 기술 스택

- TypeScript + esbuild
- Chrome Extension Manifest V3
- File System Access API (직접 저장)
- JSZip (폴백 다운로드)

### 버그 리포트 / 기능 요청

[GitHub Issues](https://github.com/parktaejun-dev/threads-to-obsidian/issues)에 남겨주세요.

---

## English

### Introduction

A Chrome extension that saves Threads posts to your Obsidian vault as Markdown files.

### Features

- **Direct Obsidian Save** — Write Markdown + images directly to a connected vault folder
- **ZIP Download Fallback** — Save as ZIP when no folder is connected
- **Author Reply Chains** — Capture self-thread replies in a single note
- **Image Download** — Download post and reply images locally
- **Duplicate Prevention** — Prevents saving the same post URL twice
- **Korean / English** — Auto-detects browser language with manual toggle

### Installation (GitHub)

> Until the Chrome Web Store release, you can install directly from source.

1. Clone this repository:
   ```bash
   git clone https://github.com/parktaejun-dev/threads-to-obsidian.git
   cd threads-to-obsidian
   ```

2. Build the extension:
   ```bash
   npm install
   npm run build
   ```

3. Open `chrome://extensions` in Chrome

4. Enable **Developer mode** (top-right toggle)

5. Click **Load unpacked**

6. Select the `dist/extension` folder

7. Navigate to any Threads post and click the extension icon to start saving.

### Usage

1. (Optional) Connect your Obsidian vault folder in Settings
2. Navigate to an individual Threads post page
3. Click the extension icon → **Save Current Post**

### Markdown Output

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

### Build

```bash
npm install
npm run build      # Build to dist/extension
npm run typecheck   # Type check
npm run test        # Run tests
```

### Tech Stack

- TypeScript + esbuild
- Chrome Extension Manifest V3
- File System Access API (direct save)
- JSZip (fallback download)

### Bug Reports / Feature Requests

Please open an issue on [GitHub Issues](https://github.com/parktaejun-dev/threads-to-obsidian/issues).

---

## License

MIT
