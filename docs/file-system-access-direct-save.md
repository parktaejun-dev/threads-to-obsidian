# File System Access API Direct Save 설계서

## 1. 목적

현재 제품은 `Threads 개별 글 -> ZIP 다운로드 -> 사용자가 압축 해제 후 Obsidian vault에 이동` 흐름이다.
이 설계의 목표는 이를 `Threads 개별 글 -> Obsidian vault 폴더에 직접 저장` 흐름으로 바꾸는 것이다.

핵심 결과는 다음과 같다.

- ZIP 다운로드 제거
- 수동 압축 해제 제거
- Obsidian 플러그인/로컬 에이전트 제거
- 확장 하나만으로 `.md + assets/`를 vault 안 지정 폴더에 직접 생성

## 2. 목표 / 비목표

### 목표

- 사용자가 vault 내 저장 폴더를 1회만 연결하면 이후에는 `저장` 버튼 한 번으로 노트가 들어가게 한다.
- 현재 추출 품질과 Markdown 구조를 최대한 유지한다.
- `최근 저장`, `다시 저장`, `스레드 열기`, `삭제` UX를 그대로 가져간다.
- File System Access API 권한이 사라졌을 때도 사용자가 복구 가능한 흐름을 제공한다.

### 비목표

- 모바일 지원
- Firefox / Safari 지원
- Obsidian 플러그인 추가
- OS 수준 백그라운드 파일 감시
- Vault 전체 인덱싱 또는 기존 노트 스캔

## 3. 현재 구조 요약

현재 구현은 다음과 같다.

- [background.ts](/Users/parktaejun/Desktop/threads/src/extension/background.ts)
  - active tab 조회
  - content script 주입/메시지
  - Threads 글 추출
  - ZIP 생성
  - `chrome.downloads.download()` 호출
  - 최근 저장 기록 갱신
- [popup.ts](/Users/parktaejun/Desktop/threads/src/extension/popup.ts)
  - 저장 버튼
  - 최근 저장 목록
  - 다시 다운로드 / 삭제 / 전체 삭제 / 스레드 열기
- [options.ts](/Users/parktaejun/Desktop/threads/src/extension/options.ts)
  - 파일명 패턴
  - 이미지 포함 여부
- [package.ts](/Users/parktaejun/Desktop/threads/src/extension/lib/package.ts)
  - ZIP 구조 생성
- [markdown.ts](/Users/parktaejun/Desktop/threads/src/extension/lib/markdown.ts)
  - Obsidian용 Markdown 생성

현재 구조의 병목은 `다운로드` 단계다. 사용자가 직접 vault로 옮겨야 하므로 제품 경험이 끊긴다.

## 4. 플랫폼 제약

이 설계는 File System Access API 제약을 전제로 한다.

- `showDirectoryPicker()`는 `Window` 컨텍스트와 사용자 제스처가 필요하다.
- 저장된 디렉터리 핸들은 `IndexedDB`에 저장할 수 있다.
- 저장된 핸들의 권한은 세션 간 항상 유지되지 않으므로, 저장 시마다 `queryPermission()` / `requestPermission()`을 확인해야 한다.
- `requestPermission()`은 사용자 제스처가 필요하며, `worker` 같은 non-Window 컨텍스트에서는 `SecurityError`가 날 수 있다.

공식 근거:

- Chrome File System Access API: `showOpenFilePicker`와 유사 picker는 user gesture가 필요하고, 핸들은 IndexedDB에 저장 가능하며, 세션 간 권한을 다시 확인해야 한다. [Chrome 문서](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access)
- MDN `showDirectoryPicker()`: transient user activation 필요. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker)
- MDN `requestPermission()`: user activation이 필요하고, worker 같은 non-Window 컨텍스트에서는 막힐 수 있다. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/requestPermission)

## 5. 제안 아키텍처

핵심 원칙은 다음 두 가지다.

1. `폴더 선택`과 `권한 요청`은 `options page` 또는 `popup` 같은 Window 컨텍스트에서 처리한다.
2. `Threads 추출`은 현재처럼 background가 맡고, `파일 쓰기`는 Window 컨텍스트가 맡는다.

### 5.1 권장 구성

- `background`
  - Threads 추출 전담
  - 최근 저장 기록 CRUD 전담
  - ZIP 다운로드는 fallback 경로로만 유지
- `popup`
  - 저장 버튼
  - direct save 실행
  - 권한 재확인
  - 성공/실패 상태 표시
  - 최근 저장 목록
- `options`
  - Obsidian 폴더 연결/해제
  - 파일명 패턴
  - 이미지 포함 여부
- `IndexedDB`
  - `FileSystemDirectoryHandle` 저장
- `chrome.storage.local`
  - 일반 옵션과 최근 저장 메타데이터 저장

### 5.2 저장 흐름

#### 최초 1회 연결

1. 사용자가 옵션 페이지에서 `Obsidian 폴더 연결` 클릭
2. `showDirectoryPicker({ mode: "readwrite", id: "obsidian-vault-target" })`
3. 사용자가 vault 안의 `Sources/Threads` 같은 목적지 폴더를 선택
4. 확장이 핸들을 IndexedDB에 저장
5. 옵션 페이지에 연결된 폴더명과 권한 상태 표시

#### 이후 저장

1. 사용자가 Threads permalink에서 `저장` 버튼 클릭
2. popup이 IndexedDB에서 디렉터리 핸들 조회
3. popup이 `queryPermission({ mode: "readwrite" })` 확인
4. `prompt` 또는 `denied`면 popup에서 `requestPermission({ mode: "readwrite" })`
5. 권한 확보 후 background에 `extract-current-post` 요청
6. background가 현재 tab에서 글 추출 후 `ExtractedPost` 반환
7. popup이 Markdown 문자열과 asset 파일 목록 생성
8. popup이 선택된 디렉터리 아래에 `archive-name/`
   - `archive-name.md`
   - `assets/...`
   를 직접 씀
9. 성공 시 최근 저장 기록 업데이트
10. Obsidian이 vault 변화를 자동 인식

#### 폴더 연결이 없는 경우

- popup이 `Obsidian 폴더를 먼저 연결해 주세요.` 상태를 띄움
- `설정 열기` CTA 제공
- 선택적으로 `ZIP으로 저장` fallback 제공

## 6. 컨텍스트별 책임

### background

유지할 책임:

- 현재 탭 확인
- permalink 지원 여부 판단
- content script 주입 및 추출 요청
- 최근 저장 메타데이터 관리

제거/축소할 책임:

- 기본 저장 경로로서의 ZIP 생성/다운로드

추가 메시지 예시:

- `extract-current-post`
- `record-save-result`
- `delete-recent-save`
- `clear-recent-saves`

### popup

추가될 책임:

- direct-save 진입점
- 권한 검증
- direct-save용 파일 쓰기
- direct-save 실패 시 fallback 제안

주의:

- popup은 포커스를 잃으면 닫힐 수 있다.
- 따라서 저장 로직은 `한 번의 클릭 후 2~5초 내 완료`를 목표로 해야 한다.
- 실측에서 popup lifecycle이 불안정하면 2단계로 `side panel` 전환을 고려한다.

### options

추가될 책임:

- `Obsidian 폴더 연결`
- `연결 해제`
- 현재 연결 상태 표시
- 권한 상태 재검사

옵션 페이지는 사용자 제스처가 확보된 Window 컨텍스트이므로 picker 호출에 가장 적합하다.

## 7. 데이터 모델 변경안

### 7.1 ExtensionOptions 확장

현재 [types.ts](/Users/parktaejun/Desktop/threads/src/extension/lib/types.ts)의 `ExtensionOptions`:

```ts
export interface ExtensionOptions {
  filenamePattern: string;
  includeImages: boolean;
}
```

제안:

```ts
export interface ExtensionOptions {
  filenamePattern: string;
  includeImages: boolean;
  obsidianFolderLabel: string | null;
}
```

설명:

- `obsidianFolderLabel`
  - 사용자가 선택한 마지막 폴더 이름

연결 여부는 `chrome.storage.local`에 중복 캐시하지 않는다.
항상 `hasObsidianDirectoryHandle()` 또는 `getObsidianDirectoryHandle()`로 IndexedDB를 직접 읽어 판정한다.

이유:

- `obsidianFolderConnected` 같은 파생 boolean을 따로 저장하면 UI와 실제 핸들 상태가 어긋날 수 있다.
- direct save 가능 여부는 `handle 존재 + 권한 유효` 두 조건으로 결정되므로, 저장된 boolean 하나로 표현하는 편이 오히려 취약하다.

실제 `FileSystemDirectoryHandle` 자체는 `chrome.storage.local`에 넣지 않고 IndexedDB에 저장한다.

`deviceId`는 Notion 제거 이후 사용처가 없으므로 이번 direct save 전환에서 같이 제거한다.

### 7.2 IndexedDB 저장 구조

새 파일 예시:

- `src/extension/lib/fs-handle-store.ts`

저장소 설계:

- DB 이름(레거시 호환 유지용): `threads-to-obsidian`
- object store: `handles`
- key: `"obsidian-target-directory"`
- value:
  - `handle: FileSystemDirectoryHandle`
  - `savedAt: string`
  - `label: string`

필수 함수:

- `getObsidianDirectoryHandle()`
- `setObsidianDirectoryHandle(handle)`
- `clearObsidianDirectoryHandle()`
- `hasObsidianDirectoryHandle()`

### 7.3 RecentSave 확장

direct save 이후에는 최근 저장 메타에도 저장 방식을 남겨야 한다.

제안:

```ts
export interface RecentSave {
  id: string;
  canonicalUrl: string;
  shortcode: string;
  author: string;
  title: string;
  downloadedAt: string;
  archiveName: string;
  contentHash: string;
  status: "complete" | "error";
  savedVia: "direct" | "zip";
  savedRelativePath: string | null;
  warning: string | null;
  post: ExtractedPost;
}
```

설명:

- `archiveName`
  - direct save와 ZIP 양쪽에서 공통으로 쓰는 아카이브 이름
- `savedVia`
  - 최근 저장의 재시도 동작 기준
- `savedRelativePath`
  - 예: `Sources/Threads/writer_첫문장예시/01. writer_첫문장예시.md`
  - 향후 `vault에서 열기` 또는 경로 노출 UI의 기반
- `warning`
  - 일부 이미지 원격 URL fallback 등 상태 기록

## 8. 파일 쓰기 설계

### 8.1 디렉터리 구조

현재 ZIP 내부 구조를 그대로 유지한다.

```text
Sources/Threads/
  writer_첫문장예시/
    01. writer_첫문장예시.md
    02. image-01.jpg
    03. reply-01-image-01.jpg
```

이 구조를 유지해야 하는 이유:

- 현재 Markdown 상대경로가 그대로 동작한다.
- ZIP 방식과 direct save 방식이 동일한 산출물 구조를 공유한다.
- 재다운로드와 direct save를 공통 코드로 유지할 수 있다.

### 8.2 파일 생성 알고리즘

1. `archiveBaseName = buildArchiveBaseName(filenamePattern, post)`
2. 루트 디렉터리 아래 `archiveBaseName` 하위 폴더 확보
3. 이미지/영상 fetch 및 바이너리 준비
5. Markdown 생성
6. `01. <archiveName>.md` 쓰기
7. 첨부 파일 쓰기

### 8.3 충돌 정책

기본 정책:

- 동일 `canonical_url + content_hash`이면 같은 글로 간주
- direct save 시에도 최근 저장 중복 판단은 유지

파일시스템 충돌 시 정책:

- 같은 이름의 폴더가 이미 있으면 덮어쓰기 대신 suffix 부여
- 예:
  - `2026-03-08_writer_ABC123`
  - `2026-03-08_writer_ABC123 (2)`

이유:

- 사용자가 vault 안에서 수동 편집한 노트를 덮어쓰지 않기 위해
- 동일 글을 나중에 다시 저장할 수 있게 하기 위해

옵션:

- 향후 고급 설정으로 `동일 파일명 덮어쓰기` 제공 가능
- MVP에서는 안전하게 `suffix 생성`이 기본

## 9. ZIP fallback 전략

direct save가 실패해도 저장 자체가 완전히 막히면 안 된다.

fallback 규칙:

- 폴더 미연결: `설정 열기`와 함께 ZIP 저장 가능
- 권한 거부: `권한 다시 요청` 또는 ZIP 저장
- 파일 쓰기 실패: ZIP 저장 fallback
- 이미지 일부 실패: Markdown은 저장하고 경고 표시

저장 방식은 사용자 옵션으로 따로 두지 않는다.
항상 아래 순서로 자동 파생한다.

1. 폴더 핸들이 있고 권한이 유효하면 direct save
2. 그렇지 않으면 ZIP fallback

이유:

- 신규 사용자가 별도 `saveMode`를 이해할 필요가 없다.
- direct save 가능 여부는 사용자의 선택보다 현재 권한/핸들 상태에 의해 결정된다.
- 폴더 연결 전 첫 저장도 막히지 않고 ZIP으로 이어질 수 있다.

사용자 메시지 예시:

- `Obsidian 폴더에 바로 저장했습니다.`
- `폴더 권한이 없어 ZIP으로 대신 저장했습니다.`
- `본문은 저장했고, 일부 이미지는 원격 URL로 남겼습니다.`

### 9.1 Redownload 동작 정의

현재 popup에는 `다시 다운로드` 버튼이 있다. direct save 전환 후에는 이 버튼의 의미를 명확히 바꿔야 한다.

권장 정책:

- 최근 저장의 `savedVia`가 `direct`이면
  - 기본 동작은 `같은 폴더에 다시 저장`
- 최근 저장의 `savedVia`가 `zip`이면
  - 기본 동작은 `ZIP 다시 생성`

이유:

- 사용자는 `내가 방금 썼던 방식 그대로 다시 받기`를 기대한다.
- direct save 사용자에게 갑자기 ZIP이 뜨면 UX가 깨진다.

파일 충돌이 걱정되므로 direct save 재시도 시에도 덮어쓰기 대신 suffix 정책을 유지한다.

버튼 문구는 이후 이렇게 정리할 수 있다.

- 공통 1차 문구: `다시 저장`
- 상세 상태:
  - `직접 저장으로 다시 저장했습니다.`
  - `ZIP을 다시 생성했습니다.`

## 10. UX 설계

### 10.1 Popup

현재 popup의 핵심 버튼은 유지하되 문구를 바꾼다.

기본 상태:

- 폴더 연결됨:
  - 버튼: `현재 글 저장`
  - 보조 문구: `연결된 Obsidian 폴더에 바로 저장합니다.`
- 폴더 미연결:
  - 버튼: `현재 글 저장`
  - 보조 문구: `폴더를 연결하지 않으면 ZIP으로 저장합니다.`

폴더 미연결 상태:

- 상태: `Obsidian 폴더를 먼저 연결해 주세요.`
- CTA:
  - `폴더 연결`
  - `ZIP으로 저장`

저장 성공 상태:

- `저장 완료. Obsidian vault에서 바로 확인할 수 있습니다.`

최근 저장 목록:

- 현재 구조 유지
- 추가 권장 항목:
  - `직접 저장`
  - `ZIP 저장`
  - `일부 이미지 원격 참조`
  - 저장 상대 경로 표시 가능

### 10.2 Options

새 UI 섹션:

- `Obsidian 폴더 연결`
  - 현재 연결 폴더명
  - 권한 상태
  - `폴더 연결`
  - `권한 다시 확인`
  - `연결 해제`

기존 유지:

- 파일명 패턴
- 이미지 포함 여부

### 10.3 단축키

현재 `Alt+Shift+S` 단축키는 direct save와 충돌 가능성이 있다.

이유:

- direct save는 권한 재요청이 필요할 수 있고, 그 권한 요청은 Window 컨텍스트 사용자 제스처가 필요하다.
- background command만으로 끝내면 API 제약에 걸릴 수 있다.

권장 정책:

- 폴더 연결과 권한이 이미 유효할 때만 direct save 실행
- 그 외에는 popup을 열어 사용자 클릭으로 이어가게 함

즉 단축키는 완전 무조건 저장이 아니라 `빠른 저장 시도` 역할로 본다.

## 11. 구현 단계

### 1단계: 기반 정리

- `deviceId` 제거
- options/storage/types에서 Notion 잔재 정리

### 2단계: 기반 추가

- IndexedDB 핸들 저장 모듈 추가
- `ExtensionOptions`에서 파생 상태 제거
- options UI에 폴더 연결/해제 추가

### 3단계: direct write 모듈 추가

- 새 파일 예시:
  - `src/extension/lib/direct-save.ts`
- 역할:
  - 권한 검증
  - 디렉터리 생성
  - 파일 생성
  - 이미지 바이너리 쓰기

### 4단계: popup 저장 흐름 전환

- `save-current-post` 기본 경로를 ZIP에서 direct save로 전환
- background는 `ExtractedPost` 반환 중심으로 단순화
- 실패 시 ZIP fallback 유지

### 5단계: 최근 저장 메타 확장

- 저장 방식 기록:
  - `direct`
  - `zip-fallback`
- 경고 상태 기록:
  - 일부 이미지 실패
  - 원격 URL fallback
- direct save 재시도 기준 저장
- 상대 경로 기록

### 6단계: polish

- 저장 후 폴더 연결 상태 개선
- 사용자 메시지 정리
- README 업데이트

## 12. 테스트 계획

### 단위 테스트

- 핸들 저장/조회/삭제
- 파일명 충돌 처리
- direct save용 Markdown/asset 경로 매핑
- 권한 상태 분기 로직

### 수동 테스트

1. 폴더 첫 연결
2. 연결 후 첫 저장
3. 브라우저 재시작 후 권한 재확인
4. 이미지 포함 글 저장
5. 답글 포함 글 저장
6. 이미지 CDN 일부 실패
7. 폴더 연결 해제 후 저장
8. permalink가 아닌 페이지 저장 시도

### 회귀 테스트

- 최근 저장 목록 표시
- `스레드 열기`
- `삭제`, `전체 삭제`
- ZIP fallback 경로

## 13. 리스크와 대응

### 리스크 1: popup 수명

설명:

- popup이 닫히면 direct save 작업이 중단될 수 있다.

대응:

- 1차는 popup에서 구현
- 저장 시간이 길어지는 경우 `side panel` 전환

`chrome.sidePanel`은 extension page로서 Chrome APIs 접근이 가능하므로, popup보다 긴 작업에 더 적합하다. 이건 direct save 2차 개선 카드로 둔다. [Chrome sidePanel 문서](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)

### 리스크 2: 권한 소실

설명:

- 세션 간 permission이 항상 유지되지 않는다.

대응:

- 매 저장 시 `queryPermission()`
- 필요 시 `requestPermission()`
- 실패 시 ZIP fallback

### 리스크 3: 민감한 폴더 제한

설명:

- 브라우저는 일부 민감한 폴더를 막을 수 있다.

대응:

- 사용자가 직접 vault 하위 폴더를 선택하게 함
- 루트 시스템 폴더 선택은 권장하지 않음

### 리스크 4: 이미지 다운로드 실패

설명:

- Threads CDN 정책으로 일부 이미지는 fetch가 실패할 수 있다.

대응:

- Markdown은 저장
- 실패 이미지는 원격 URL fallback
- 최근 저장과 상태 메시지에 경고 표기

## 14. 운영자 / 사용자 영향

### 사용자

해야 할 일:

- 최초 1회 폴더 연결

하지 않아도 되는 일:

- ZIP 다운로드
- 압축 해제
- vault 수동 이동
- Obsidian 플러그인 설치

### 운영자

추가 서버 필요 없음

즉 이 설계는 현재 extension-only 구조를 유지하면서 UX만 개선한다.

## 15. 결정 사항

이 문서 기준 권장 결정은 다음과 같다.

1. direct save를 기본 저장 방식으로 채택한다.
2. ZIP은 fallback으로만 남긴다.
3. 저장 방식은 `saveMode` 사용자 옵션이 아니라 `핸들 존재 여부 + 권한 상태`에서 자동 파생한다.
4. 연결 여부는 `obsidianFolderConnected` 같은 캐시 boolean 없이 IndexedDB에서 직접 판정한다.
5. 디렉터리 핸들은 IndexedDB에 저장한다.
6. picker는 options page에서 실행한다.
7. 권한 재요청과 실제 파일 쓰기는 popup Window 컨텍스트에서 실행한다.
8. recent save의 재시도는 `savedVia`를 기준으로 직전 저장 방식을 그대로 따른다.
9. popup lifecycle이 실사용에서 불안정하면 side panel로 이관한다.

## 16. 구현 체크리스트

- [ ] `deviceId` 제거
- [ ] IndexedDB 기반 directory handle store 추가
- [ ] options page에 `Obsidian 폴더 연결/해제` 추가
- [ ] direct save writer 모듈 추가
- [ ] popup 저장 기본 경로를 direct save로 전환
- [ ] ZIP fallback 경로 유지
- [ ] 기존 `zipFilename` recent save를 `archiveName`으로 마이그레이션
- [ ] 최근 저장 메타에 `savedVia`, `savedRelativePath`, `warning` 추가
- [ ] README를 direct save 기준으로 갱신
- [ ] 수동 테스트 시나리오 점검
