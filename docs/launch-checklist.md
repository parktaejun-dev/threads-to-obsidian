# 출시 준비 체크리스트

## 0. 운영 기준

- [ ] 운영 토폴로지가 `Node + PM2 split-role + reverse proxy + postgres` 기준인지 확인
- [ ] public origin이 `https://ss-threads.dahanda.dev`인지 확인
- [ ] 운영 PM2 프로세스가 아래 4개인지 확인
  - `threads-obsidian-public`
  - `threads-obsidian-public-2`
  - `threads-obsidian-public-3`
  - `threads-obsidian-worker`

## 1. 환경변수와 비밀

- [ ] `THREADS_WEB_ADMIN_TOKEN` 설정
- [ ] `SS_THREADS_PRO_PRIVATE_JWK_FILE` 또는 `SS_THREADS_PRO_PRIVATE_JWK` 설정
- [ ] `THREADS_WEB_STORE_BACKEND=postgres` 확인
- [ ] `THREADS_WEB_POSTGRES_URL` 또는 `THREADS_WEB_DATABASE_URL` 확인
- [ ] `THREADS_WEB_TRUST_PROXY_ALLOWLIST`가 실제 reverse proxy peer IP를 포함하는지 확인
- [ ] `THREADS_BOT_HANDLE`, `THREADS_BOT_INGEST_TOKEN`, OAuth/App secret 계열 설정 확인
- [ ] `THREADS_BOT_ENCRYPTION_SECRET`, `THREADS_NOTION_ENCRYPTION_SECRET` 별도 랜덤값 확인
- [ ] 레거시 `THREADS_TO_OBSIDIAN_PRO_PRIVATE_JWK(_FILE)`는 하위 호환만 남기고 신규 설정은 `SS_THREADS_PRO_PRIVATE_JWK(_FILE)` 기준으로 사용

## 2. 판매 문구와 다국어 정책

- [ ] 월간 가격 `US$2.99` 고정 정책이 현재 운영 정책과 일치하는지 확인
- [ ] 가격, 플랜 이름, FAQ, hero note, included updates를 바꿨다면 `/api/admin/storefront-settings` 동기화 절차를 배포 단계에 포함
- [ ] 비한국어 랜딩/설치/스크랩북 문구는 직접 번역으로 관리한다는 점을 팀 내부 기준으로 확인
- [ ] 한국어 persisted storefront를 수정했다면 비한국어 카피도 코드에서 별도 갱신했는지 확인
- [ ] `/install`, `/scrapbook` 신규 UI의 직접 번역 누락이 없는지 확인

## 3. 기능 안정성

- [ ] 주문 생성, 결제 webhook, 키 발급, 전달 흐름 점검
- [ ] scrapbook 로그인, mention 저장, 저장 상태 재확인 흐름 점검
- [ ] 폴더 생성/이동/삭제, 묶음 내보내기, 선택 삭제 점검
- [ ] `/`, `/install`, `/checkout`, `/scrapbook`, `/admin` 렌더 점검
- [ ] 공개 페이지 보안 헤더와 주문 rate limit 점검

## 4. 배포 직전 게이트

- [ ] 로컬에서 `npm run typecheck` 통과
- [ ] 로컬에서 `npm test` 통과
- [ ] 로컬에서 `npm run build` 통과
- [ ] 운영 런타임 데이터와 설정 백업
  - 예: `/home/ubuntu/projects/threads/backups/deploy-YYYYMMDD-HHMMSS`
- [ ] `rsync`로 운영 경로 `/home/ubuntu/projects/threads`에 반영
- [ ] 서버에서 `npm run build` 실행
- [ ] storefront 판매 문구 변경이 있었다면 persisted storefront 동기화 선반영
- [ ] 아래 명령으로 split-role PM2 재시작

```bash
pm2 restart threads-obsidian-public threads-obsidian-public-2 threads-obsidian-public-3 threads-obsidian-worker --update-env && pm2 save
```

## 5. 배포 후 검증

- [ ] `https://ss-threads.dahanda.dev/health` 응답 `200`
- [ ] `https://ss-threads.dahanda.dev/ready` 응답 `200`
- [ ] `/ready`에서 `status=ready`
- [ ] `/ready`에서 `trustProxy.ready=true`
- [ ] `/ready`에서 `security.publicOrderRateLimit` 존재
- [ ] `https://ss-threads.dahanda.dev/api/public/storefront`가 intended persisted storefront와 일치
- [ ] `https://ss-threads.dahanda.dev/checkout` 렌더 및 가격/플랜 문구 확인
- [ ] `https://ss-threads.dahanda.dev/install` 렌더 및 직접 번역 CTA 확인
- [ ] `https://ss-threads.dahanda.dev/scrapbook` 렌더 및 다국어 폴더/상태 UI 확인
