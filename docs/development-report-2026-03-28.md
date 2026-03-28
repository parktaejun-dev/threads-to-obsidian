# 개발 보고서

기준일: `2026-03-28`

프로젝트: `Threads Archive`

## 1. 보고서 목적

이 문서는 현재까지 수행한 개발 작업, 분야별 검수 결과, 상업 운영 관점의 보안/운영 점검 결과를 한 번에 정리한 납품용 보고서다.

대상 범위:

- Chrome extension
- Threads Archive web client
- Threads Archive web server
- cloud save / scrapbook SaaS
- admin console
- 공통 shared / workspace 구조

## 2. 총평

현재 코드베이스는 `기능 구현`, `타입 경계`, `빌드 분리`, `cloud save`, `admin console`, `보안 하드닝`, `다국어 지원`까지 포함해 `출시 가능한 수준`으로 정리되었다.

다만 최종 운영 품질은 코드만으로 완성되지 않는다.

특히 다음 두 항목은 운영팀이 실제 배포에서 반드시 지켜야 한다.

- `proxy / trusted IP / admin origin` 설정
- `DB 설정 변경 시 restart + maintenance 절차`

즉, 현재 상태 평가는 다음과 같다.

- 제품 개발 상태: `출시 가능`
- 상업 운영 준비 상태: `조건부 가능`
- 운영 전제 조건 미충족 시: `보안/운영 사고 가능`

## 3. 주요 개발 완료 항목

### 3-1. 아키텍처 / 코드베이스 구조 정리

완료 내용:

- 단일 패키지 구조에서 workspace 기반 패키지 구조로 분리
- `shared / extension / web-client / web-server / web-schema` 패키지 분리
- 공통 타입과 공용 로직을 별도 패키지로 이동
- package export 경계 기준 smoke test 추가

효과:

- 브라우저/서버 런타임 혼합 감소
- 책임 경계 명확화
- 빌드 및 타입체크 범위 분리
- 향후 CI/CD 분리 용이

판정:

- `완료`

### 3-2. 타입 환경 및 빌드 분리

완료 내용:

- solution `tsconfig` 구조 도입
- extension / web client / web server / tests 타깃별 `tsconfig` 분리
- 루트 빌드 스크립트를 타깃별 빌드로 재구성

효과:

- `chrome`/`node` 전역 혼입 방지
- 타깃별 빌드 실패 감지 명확화
- 회귀 범위 축소

판정:

- `완료`

### 3-3. Cloud Save Pro 기능 구현

완료 내용:

- extension에서 local save 외에 `cloud` 저장 타깃 추가
- web server에 cloud archive 저장 API 연결
- scrapbook에 cloud archive를 mention archive와 함께 표시
- cloud deep link, export, archive read 흐름 연결

효과:

- SaaS형 저장 경로 확보
- Pro 가치 제안 강화
- 디바이스 간 동기화 기반 마련

판정:

- `완료`

### 3-4. Admin Console 확장

완료 내용:

- payment method 전체 관리
- storefront settings 편집
- collector 상태 조회 및 수동 sync
- runtime config 조회/저장
- database / SMTP test
- order 처리, key 발급, 재발급, email preview, send email
- license revoke

효과:

- 운영 콘솔 수준의 관리 기능 확보
- 수집기/스토어프론트/결제 운영을 브라우저에서 직접 수행 가능

판정:

- `완료`

### 3-5. 다국어 지원 확대

완료 내용:

- 지원 언어: `ko`, `en`, `ja`, `pt-BR`, `es`, `zh-TW`, `vi`
- locale 정규화와 공통 locale 집합 통일
- extension / web client / server 전반 로케일 처리 일원화
- scrapbook 동적 UI 문구까지 현지화 반영

효과:

- 해외 시장 대응 기반 확보
- 국가별 확장 우선순위에 맞춘 제품 준비 완료

판정:

- `완료`

## 4. 분야별 검수 보고

## 4-1. 아키텍처 검수

### 검수 대상

- workspace 구조
- shared 경계
- 패키지 export 경계
- 빌드/타입 분리

### 초기 문제

- extension / server / web 코드가 단일 패키지와 단일 타입 환경에 혼재
- `chrome`, `node` 전역 타입 혼합
- shared 로직이 extension 내부에 섞여 있음

### 적용 내용

- workspace 구조 전환
- shared 모듈 추출
- `web-schema` 별도 패키지 분리
- 패키지별 `package.json` / `tsconfig` / build target 분리

### 검수 결과

- 런타임 경계는 이전 대비 크게 개선됨
- 코드 검색/유지보수성 향상
- 단일 레포 유지와 패키지 분리의 균형이 잘 맞춰짐

### 판정

- `통과`

### 비고

- `shared`는 완전한 pure-core라기보다 런타임 중립 공용층에 가까움
- 구조상 문제는 정리되었으나, 장기적으로는 도메인 패키지 세분화 여지는 남아 있음

## 4-2. 프론트엔드 / 제품 UX 검수

### 검수 대상

- extension popup/options
- landing
- scrapbook
- admin UI
- 다국어 및 상태 표시

### 적용 내용

- cloud save 타깃 추가 및 최근 저장 흐름 정리
- scrapbook mixed archive 대응
- archive 삭제 UI 연결
- admin 콘솔 화면 확장
- 7개 언어 로케일 선택 및 반영

### 검수 결과

- 기능 흐름은 전반적으로 연결 완료
- 저장/조회/삭제/재저장/수출 흐름이 일관됨
- admin UI도 실제 운영 사용이 가능한 수준으로 확장됨

### 남은 운영성 메모

- 신규 언어 카피는 시스템상 적용 완료지만, 상업용 품질 기준에선 native proofread가 있으면 더 좋음
- admin은 같은 public origin 운영보다 별도 admin origin 운영이 더 안전함

### 판정

- `통과`

## 4-3. 백엔드 / 저장소 검수

### 검수 대상

- web server API
- scrapbook / cloud save 도메인 로직
- 저장소 계층
- runtime config

### 초기 문제

- 단일 JSON 파일 전체 rewrite 저장 구조
- parse 실패 시 빈 DB로 덮어쓸 위험
- DB 전환과 운영 전환 절차 부재

### 적용 내용

- `ENOENT`일 때만 신규 DB 생성
- corrupt 파일 보존 방향으로 수정
- Postgres backend 지원 추가
- runtime config와 active config 분리
- DB 설정 저장 후 restart-required 모델로 변경

### 검수 결과

- 파일 손상 시 데이터 유실 위험은 크게 완화됨
- Postgres 전환 경로는 코드상 준비 완료
- runtime config hot switch의 위험은 낮아짐

### 한계

- 현재 Postgres 구조는 `JSONB single-row store` 기반
- 파일 DB보다 훨씬 낫지만, 최종 대규모 운영형 정규화 스키마는 아님
- 다중 인스턴스에서 DB 전환은 여전히 운영 절차 의존

### 판정

- `조건부 통과`

## 4-4. 보안 검수

### 검수 대상

- admin 경로
- cloud save / scrapbook 경로
- 세션 / CSRF / SSRF / error leak / 운영 비밀값

### 초기 주요 문제

- `SameSite=None` 기반 cookie 경계와 CSRF 면적
- admin bearer token을 browser storage에 저장
- `X-Forwarded-For` 무조건 신뢰 가능성
- raw `error.message` 노출
- secret 값 브라우저 노출 가능성
- 파일 DB 초기화와 저장소 안정성 부족

### 적용 내용

- mutating route `Origin` 검증
- JSON endpoint `Content-Type` 강제
- admin bearer token 제거
- `HttpOnly` admin session cookie 도입
- `trusted proxy allowlist` 도입
- admin 정적 페이지에 `CSP`, `no-store`, `X-Frame-Options`
- runtime secret redaction
- operational state error sanitization
- admin API rate limit / bucket GC

### 검수 결과

- 차단급 이슈 대부분 해소
- admin 인증 구조는 이전보다 훨씬 안전해짐
- 브라우저 저장소 기반 admin token 탈취면 제거
- proxy trust 경계가 명시적으로 바뀜

### 남은 비코드성 리스크

- `THREADS_WEB_TRUST_PROXY_ALLOWLIST` 설정 누락 시 proxy 환경에서 admin IP 판단이 달라질 수 있음
- `THREADS_WEB_ADMIN_ORIGIN` 분리 없이 같은 origin 운영 시 XSS blast radius는 더 큼
- runtime DB 전환은 결국 restart 절차가 필요함

### 판정

- `코드 기준 통과`
- `운영 설정 포함 시 최종 통과`

## 4-5. Admin Console 검수

### 검수 대상

- admin 기능 범위
- admin 인증
- runtime config 관리
- collector 운영
- payment/order/license 운영

### 적용 내용

- 기능 확장: collector, storefront, runtime config, DB/SMTP test, payment method full edit
- 인증 구조 변경: session cookie 기반
- 보안 보강: CSP, no-store, origin/IP 경계
- runtime secret clear UX 추가
- active database 표시 및 restart-required 메시지 추가

### 검수 결과

- 기능적으로는 운영 콘솔 수준
- 보안적으로는 기존 대비 큰 폭 개선
- 납품 후 운영자가 실제로 쓸 수 있는 상태

### 주의

- admin은 고권한 API이므로 reverse proxy, VPN, access log, audit log까지 같이 맞추는 것이 좋음

### 판정

- `통과`

## 4-6. 상업 운영성 검수

### 검수 대상

- Cloud Save 상업 운영 적합성
- 운영 전환 절차
- 관리자 보안
- 배포 설정

### 검수 결과 요약

현재 구조는 `기능 데모`가 아니라 `상업 운영 가능한 방향`까지는 들어왔다.

다만 다음 두 항목은 코드 외 운영 절차가 필요하다.

- admin 보안 설정
- DB 전환 절차

상세 운영 주의사항은 아래 문서를 참조한다.

- `docs/deployment-architecture.md`
- `docs/cloud-save-commercial-hardening-plan.md`
- `docs/admin-security-operational-notes.md`

### 판정

- `조건부 통과`

## 5. 검증 결과

최신 기준 검증 통과 항목:

- `npm run typecheck`
- `npm test` -> `84/84` 통과
- `npm run build:extension`
- `npm run build:web`
- `npm run build:server`

현재 기준으로:

- 타입체크 통과
- 테스트 통과
- extension/web/server 빌드 통과

## 6. 현재 남은 리스크

### 6-1. 운영 설정 리스크

- proxy 환경에서 `THREADS_WEB_TRUST_PROXY_ALLOWLIST` 누락 가능성
- admin origin 분리 없이 같은 host로 운영할 가능성
- HTTPS 없이 remote admin 접근을 시도할 가능성

### 6-2. 운영 절차 리스크

- DB 설정 변경 후 restart 없이 사용하려는 오해
- 다중 인스턴스 환경에서 일부 인스턴스만 재시작하는 실수
- maintenance window 없이 DB 전환을 시도하는 실수

### 6-3. 장기 확장 리스크

- Postgres backend가 아직 정규화 스키마가 아니라 JSONB 저장소 형태
- 대규모 다중 인스턴스 최종형 데이터 모델은 향후 추가 설계가 필요

## 7. 권장 후속 조치

### 출시 전 반드시 할 것

- production env에 admin 보안 설정값 반영
- admin을 가능하면 별도 origin으로 분리
- 운영팀 대상 DB 전환 절차 공유
- 실제 production-like 환경에서 admin session / runtime config / restart 절차 smoke test

### 출시 후 권장

- admin audit log 추가
- Postgres 정규화 스키마 전환 검토
- access log / security event log 가시성 강화
- 다국어 카피 native review

## 8. 결론

현재 개발 결과물은 기능 구현과 구조 정리를 넘어서, 상업 운영을 위한 보안/운영 하드닝까지 상당 부분 반영된 상태다.

코드 품질 기준으로는 `출시 가능` 판정을 줄 수 있다.

단, 최종 품질은 아래 두 조건이 만족될 때 완성된다.

- 운영 설정이 문서대로 적용될 것
- DB 전환과 admin 운영 절차를 실제로 지킬 것

따라서 본 프로젝트의 현재 최종 평가는 다음과 같다.

- 개발 완성도: `높음`
- 출시 준비도: `높음`
- 운영 준비도: `중상`
- 최종 상업 운영 적합성: `운영 설정 및 절차 준수 조건부 적합`
