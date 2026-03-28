# SS Threads 사업계획서 요약

## 1. 제품 정의

- 제품명: `SS Threads`
- 제품 구성:
  - Chrome extension: Threads 글을 Obsidian 또는 Notion으로 저장
  - Web scrapbook: 설정된 scrapbook bot handle 멘션 기반으로 Threads 글을 개인별 scrapbook에 적재
- 핵심 가치: `Threads에서 발견한 글을 개인 라이브러리로 전환`

## 2. 현재 제품 범위

### 2.1 Free

- scrapbook 저장글 `100개`
- scrapbook 폴더 `5개`
- Threads OAuth 로그인
- mention 기반 scrapbook 저장
- Markdown export / ZIP export
- extension 기본 저장

### 2.2 Plus

- scrapbook 저장글 `1,000개`
- scrapbook 폴더 `50개`
- scrapbook Plus 기능: `watchlists / insights`
- 동일 Plus 키를 scrapbook과 extension 양쪽에 연결 가능
- extension의 기존 고급 저장 기능과 같은 키 체계 유지

### 2.3 Threads 연결 기능 정리

- `searches`는 Free
- `watchlists`는 Plus
- `insights`는 Plus
- `monitor`는 별도 고객용 기능명이 아니라 내부 `search monitor` 데이터명과 admin monitoring 화면에만 남아 있음

## 3. 과금 원칙

- `저장 한도 + watchlists/insights + extension 고급 저장`을 하나의 Plus 플랜으로 판매
- 무료 사용자는 충분히 써볼 수 있어야 하고, 헤비 유저가 한도에 닿는 순간 자연스럽게 결제해야 함
- 기존 저장 데이터는 잠그지 않음
- 한도 초과 시 `새 저장만 차단`, 열람/삭제/내보내기는 계속 허용

## 4. 상품 구조

### 4.1 Free

- 저장글 `100개`
- 폴더 `5개`
- 가격 `Free`

### 4.2 Plus

- 저장글 `1,000개`
- 폴더 `50개`
- watchlists / insights
- 가격 `US$2.99 / month`
- 가격 `US$19.99 / year`
- 체크아웃 기본 선택 `연간`

## 5. 왜 이 구조인가

- 현재 제품에서 무료와 유료를 명확히 나눌 수 있는 기준은 `저장글 수`, `폴더 수`, 그리고 `watchlists / insights`다
- 무료는 저장과 export, searches 중심으로 가볍게 시작하고, Plus에서 대용량 보관과 watchlists/insights를 여는 구조가 설명하기 쉽다
- `100 -> 1,000`, `5 -> 50`은 체감 차이가 크고, watchlists/insights까지 묶이면 결제 이유가 더 분명해진다
- 월/연 구독은 유지율과 현금흐름 측면에서 일회성 결제보다 유리하다

## 6. 전환 설계

- 저장글 `70개` 도달: 사용량 바 노출
- 저장글 `90개` 도달: Plus 배너 노출
- 저장글 `100개` 도달: 새 저장만 차단
- 폴더 `4개` 도달: 폴더 한도 경고
- 폴더 `5개` 도달: 새 폴더 생성만 차단
- watchlists / insights 진입 시: Plus 안내 노출
- searches 진입 시: Free 유지, Threads 로그인과 권한 재연결만 안내
- 한도 도달 후에도 기존 글 열람, 정리, 삭제, 내보내기는 허용
- Plus 해지 후 Free로 내려오면 기존 데이터는 유지하고, 한도 아래로 내려갈 때까지 새 저장만 막음

## 7. 메시지 전략

### 7.1 핵심 메시지

- `Free는 가볍게, 많이 쌓이면 Plus`
- `저장 공간을 넓히고 watchlists/insights를 여세요`
- `searches는 Free, watchlists와 insights는 Plus`
- `같은 Plus 키를 scrapbook과 extension에 함께 사용`

### 7.2 피해야 할 메시지

- `평생 사용`
- `무제한`을 첫 메시지로 강조
- `Pro 생산성` 같은 과장된 표현
- 무료 데이터를 잠그는 인상

## 8. 운영 정책

- 결제 확인 후 Plus 키 이메일 발송
- extension 쪽 키 활성화는 기존처럼 최대 `3개 PC` 유지
- scrapbook은 계정 단위로 Plus 키 연결
- 환불 기준은 `구매 후 7일`

## 9. 핵심 지표

### 9.1 제품 지표

- Free 사용자의 `100개 한도 도달률`
- 폴더 `5개 한도 도달률`
- 저장 성공률
- 저장 후 export 사용률

### 9.2 사업 지표

- 한도 도달 후 `7일 내` Plus 전환률
- 월간 대비 연간 결제 비중
- Plus 30일 유지율
- 환불률

### 9.3 판단 기준

- 한도 도달률이 낮으면 `100개`가 너무 넉넉함
- 도달률은 높은데 전환률이 낮으면 가격 또는 유료 가치 설명이 약함
- 한도 도달 직후 이탈이 높으면 차단 문구 또는 타이밍이 거칠 가능성이 큼

## 10. 채널 전략

- Chrome Web Store
- GitHub README / Release
- Threads, X
- Obsidian / Notion 생산성 커뮤니티
- 개인 지식관리 도구 디렉토리

## 11. 포지셔닝

- 1차: `Threads 저장을 개인 라이브러리로 바꾸는 도구`
- 2차: `extension과 mention scrapbook을 함께 제공하는 Threads 저장 도구`
- 유료 포지션: `계속 쌓아두고 watchlists와 insights까지 쓰는 사용자용 확장 플랜`

## 12. 로드맵 원칙

- 단기: 현재 기능의 저장 안정성과 결제/활성화 흐름 정리
- 중기: Free/Plus 전환 데이터 최적화
- 장기: 실제 사용 패턴을 보고 Plus 한도 또는 구조 조정

## 13. 이번 변경의 의미

- 기존 `일회성 Pro` 가설을 종료
- `Free 100/5 + searches`, `Plus 1000/50 + watchlists/insights`, `US$2.99 / month`, `US$19.99 / year`로 기준 통일
- 사업계획, 랜딩, 체크아웃, scrapbook 제한, 키 전달 흐름을 모두 같은 전제로 맞춤
