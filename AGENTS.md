# Agent Instructions

## Deployment

- 이 저장소의 웹 배포 타깃은 `Vercel`이 아니다.
- 현재 운영 웹 배포는 `Node + PM2 + reverse proxy` 구조다.
- 현재 운영 서버 SSH alias는 `openclaw-oracle`이고, 앱 경로는 `/home/ubuntu/projects/threads`다.
- PM2 앱 이름은 `threads-obsidian`이다.

## Web Deploy Procedure

1. 로컬에서 변경사항을 검증한다.
2. 운영 서버의 런타임 데이터와 설정을 먼저 백업한다.
3. `rsync`로 로컬 작업본을 `/home/ubuntu/projects/threads`에 반영한다.
4. 서버에서 `npm run build`를 실행한다.
5. 서버에서 `pm2 restart threads-obsidian --update-env && pm2 save`를 실행한다.
6. `https://ss-threads.dahanda.dev/health`, `/ready`, `/api/public/storefront`, `/checkout`을 확인한다.

## Storefront Sync

- 현재 운영 backend는 `postgres`다.
- storefront 판매 문구는 코드 기본값만으로 덮어써지지 않을 수 있다.
- 가격, 플랜 이름, FAQ, hero note, included updates를 바꾸는 배포에서는 `/api/admin/storefront-settings`로 persisted storefront 설정도 함께 갱신해야 한다.
- 운영 storefront 응답이 코드 정책과 다르면, 배포 실패가 아니라 persisted settings 미동기화 가능성을 먼저 확인한다.
