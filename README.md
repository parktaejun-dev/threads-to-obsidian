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

### 사용법

1. Chrome에서 확장 프로그램 설치
2. 설정에서 Obsidian vault 폴더 연결 (선택)
3. Threads 개별 포스트 페이지에서 확장 아이콘 클릭
4. **현재 글 저장** 버튼 클릭

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

### Usage

1. Install the extension in Chrome
2. Optionally connect your Obsidian vault folder in Settings
3. Navigate to an individual Threads post page
4. Click the extension icon → **Save Current Post**

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

---

## License

MIT
