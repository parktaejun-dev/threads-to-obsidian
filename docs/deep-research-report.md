# 3페이지 카피·구성 실증 진단 보고서

## 요약
세 페이지를 크롤링해 확인한 결과, 기능 자체는 풍부하지만 **첫 화면 가치제안(무엇/어떻게/왜)과 용어·언어 일관성, 결제 흐름·신뢰 신호**가 약해 “처음 보는 사용자”와 “결제 직전 사용자” 모두에서 혼란과 이탈 가능성이 높다. citeturn6view0turn6view3turn6view5

## 조사 방법과 수집 결과
본 보고서는 아래 원문을 **직접 크롤링(open)로 수집한 텍스트/HTML 렌더 결과**에 근거해 작성했다. citeturn6view0turn6view3turn6view5  
또한 결제/설정 일부가 동적으로 구성될 가능성이 있어, 페이지와 함께 **공개 API로 노출된 storefront 설정(JSON)**도 교차 검증했다. citeturn11view0turn6view6

수집한 1차 자료(사이트 자체):
- `/` 제품 페이지(총 73 lines) citeturn0view0  
- `/install` 설치 안내(총 51 lines) citeturn0view1  
- `/checkout` 플러스 구매(총 55 lines) citeturn0view2  
- `/api/public/storefront` 공개 storefront 설정(JSON) citeturn11view0

보조 자료(공식 공개 문서):
- entity["company","GitHub","code hosting platform"] 저장소 README(서비스 정의/기능/가격·정책 단서) citeturn9view0  
- 개인정보 처리/권한/네트워크 요청 정책(특히 Pro 키 활성화·Notion/AI 기능 관련) citeturn8view0

동적 로딩/누락 가능성(명시):
- `/checkout` 본문 텍스트에는 “결제수단 선택”만 보이고 결제수단(Stableorder/Stripe/PayPal) 구체 항목이 직접 노출되지 않았다. citeturn6view6turn13view4  
- 반면 `/api/public/storefront`에는 결제수단 목록과 라벨/가이드가 JSON으로 존재한다. 이로 보아 결제수단 UI는 **클라이언트 렌더링(또는 조건부 표시)**일 수 있다. citeturn11view0  
- 따라서 “페이지에서 실제로 보이는 정적 텍스트”와 “사이트가 공개로 제공하는 설정값(의도된 카피)”을 **각각 구분**해 비평한다. citeturn11view0turn6view6

UX 카피/전환 원칙(근거):
- 홈페이지(또는 첫 진입 화면)는 “무엇을 제공하는지(가치제안)”를 히어로 영역에서 명확히 전달해야 한다. citeturn10search0  
- 버튼 라벨은 사용자가 “누르면 무엇이 일어나는지”를 명확히 설명해야 하며, 애매한 라벨을 피해야 한다. citeturn10search2turn10search14  
- 결제 단계에서는 폼 라벨·설명 부족이 혼란을 유발하며(특히 92%가 잘못한다는 Baymard 연구 요지), 결제 마찰(friction)이 전환에 직접적인 악영향을 준다. citeturn10search13turn10search5  

## 사용자 여정과 페이지 역할
서비스 정의(공식 문서 요약): Chrome에서 Threads 글을 저장하고, 모바일에서는 멘션 기반 scrapbook 수집을 제공하며, 공개 진입점은 단일 도메인으로 통합한다는 설명이 공개 README에 있다. citeturn9view0turn11view0

사용자 여정(현 구조가 의도하는 흐름, 2개 진입로 중심): citeturn11view0turn6view0  

```mermaid
flowchart TD
  A[유입: / 제품 페이지] --> B{사용 환경}
  B -->|PC| C[/install: 확장 설치 안내]
  C --> D[확장 설치 완료]
  D --> E[Threads 글 저장 시작]
  E --> F{한도/고급기능 필요?}
  F -->|예| G[/checkout: Plus 구매]
  G --> H[Plus 키 이메일 수령]
  H --> I[키 붙여넣기: extension + scrapbook]
  F -->|아니오| J[Free로 계속 사용]

  B -->|모바일| K[스크랩북(멘션 저장) 진입]
  K --> L[Threads 계정 연결]
  L --> M[@멘션으로 수집]
  M --> N{한도/Watchlists/Insights 필요?}
  N -->|예| G
  N -->|아니오| J
```

각 페이지의 “여정 내 역할”을 명확히 하면, 카피의 평가 기준도 선명해진다:
- `/` : 낯선 방문자가 5~10초 내 “이게 뭐고, PC/모바일에서 어떻게 쓰고, 무료로 어디까지 되는지”를 이해하고 다음 행동(설치/스크랩북/구매)으로 가도록 만드는 페이지. citeturn10search0turn6view0turn11view0  
- `/install` : 이미 “PC로 쓰겠다”가 결정된 사용자가 **막히지 않고 설치를 끝내는** 작업 페이지. citeturn6view3  
- `/checkout` : 결제 직전 사용자의 불안(결제 방식/환불/키 전달/개인정보)을 줄여 **전환을 마무리**하는 페이지. citeturn10search5turn6view5turn11view0turn8view0  

## 메인 페이지 비평
**페이지 한줄 결론(1–2문장)**  
현재 `/`는 기능 블록은 풍부하지만, 히어로 카피가 언어·문장 구조·줄바꿈 측면에서 깨져 보여 “이게 뭐냐”의 첫 관문에서 손해가 난다. citeturn6view0turn13view0  
공개 storefront(JSON)에 이미 더 명확한 히어로 문구가 존재하는데도, 화면에 일관되게 반영되지 않는 흔적이 보인다. citeturn11view0turn6view0  

**여정 내 역할**  
PC(확장)·모바일(멘션 스크랩북)이라는 2개 진입로를 제시하고, Free/Plus 가치 차이를 최소 비용으로 이해시키는 것이 핵심 역할이다. citeturn11view0turn6view0  

**DOM/텍스트 스냅샷(근거용 발췌)**  
- H1: “Save Threads the easy way.Extension on PC, @mention on mobile.Reply with @ss_threads_bot.” citeturn13view0  
- 섹션/카드 라벨: “Scrapbook tools”, “Searches Free”, “Watchlists Plus”, “Insights Plus”, “Save routes”, “Cloud”, “Mention”, “Tags” citeturn6view0turn6view1  
- CTA: “Plus 구매”, “익스텐션 설치”, “설치 안내”, “스크랩북 열기” citeturn6view0turn13view0  

**라인별 비평 및 교정안(헤드라인/서브헤드/버튼/핵심 문단 전수)**  
원문은 표 식별을 위해 짧게 “정확 발췌”로만 제시하고, 문제/개선은 원문 위치(히어로/섹션/카드/CTA)에 맞춰 설명한다. citeturn6view0turn6view1turn13view0  

| 요소 | 원문(정확 발췌) | 진단 | 제안 리라이트(우선순위) |
|---|---|---|---|
| 브랜드/상단 | “Save, Sync, ss-threads” | “Save/Sync”가 무엇을 의미하는지(Threads 저장? 동기화?) 맥락 없이 로고 슬로건처럼 보여 신규 유입엔 약하다. citeturn6view0 | A(High): “Threads 저장 도구 ss-threads” / B(Med): “Threads 저장·정리 ss-threads” |
| 언어 UI | “한국어 English …” | 다국어 자체는 장점이지만, 본문 용어가 혼합(영/한)이라 “언어 선택이 실제로 작동하나?”라는 의심을 유발할 수 있다. citeturn6view0turn6view1 | A(High): 본문 용어 100% 한국어로 정리 후 언어 토글 유지 / B(Med): 토글을 푸터로 이동 |
| CTA | “Plus 구매” | 상단 고정 CTA는 좋지만, “Free로 충분한가?” 판단 전에는 구매 CTA가 성급하게 느껴질 수 있다(특히 신제품/개인지향 툴). citeturn6view0 | A(High): “Plus로 한도 늘리기” / B(Med): “무료로 시작 → (업그레이드)” 구조로 2단 CTA |
| H1(히어로) | “Save Threads the easy way.” | 너무 일반적(어떤 방식으로/어디에 저장하는지 없음). 홈페이지는 히어로에서 가치제안을 명확히 하라는 NN/g 원칙과 어긋난다. citeturn10search0turn13view0 | A(High): “Threads 글을 Notion·Obsidian·스크랩북에 저장” / B(High): “Threads 저장을 편하게” |
| 히어로(연결문) | “Extension on PC,” | PC에서 “확장 설치”라는 사실만 있고, 결과(저장처/형식/1클릭)가 빠져 있다. citeturn13view0turn6view1 | A(High): “PC: 확장 아이콘 한 번으로 저장” / B(Med): “PC: Chrome 확장으로 즉시 저장” |
| 히어로(연결문) | “@mention on mobile.” | 모바일에서 “어디에 멘션하는지(댓글?)”가 빠져 있다. storefront 설정엔 “댓글로 @…만”이 명시돼 더 낫다. citeturn11view0turn13view0 | A(High): “모바일: 댓글에 @ss_threads_bot만 적기” / B(Med): “모바일: 멘션 댓글로 자동 수집” |
| 히어로(지시문) | “Reply with @ss_threads_bot.” | 핵심 행동이긴 하나, “Reply” 단어와 멘션 핸들이 한 줄에 무리하게 붙어 있어(줄바꿈/공백 없음) 가독성이 크게 떨어진다. citeturn13view0turn11view0 | A(High): “댓글에 @ss_threads_bot만 적으면 저장됩니다” / B(High): “멘션 댓글 → 자동 저장” |
| 섹션 라벨 | “Scrapbook tools” | 한국어 본문 속 영문 라벨은 시각적 위계가 “콘텐츠 덩어리”로 인식되지 않게 만든다(‘이게 메뉴인가?’). citeturn6view0 | A(High): “스크랩북 기능” / B(Low): 라벨 제거하고 H2만 유지 |
| H2 | “저장한 뒤에도 계속 쓰는 기능” | 방향성은 좋다. 다만 “계속 쓰는”이 무엇(재검색/추적/인사이트)인지 H2에서 한 번 더 압축하면 더 강해진다. citeturn6view0 | A(Med): “저장 후: 찾기·추적·인사이트” / B(Low): 현 문구 유지 |
| 핵심 문단 | “저장으로 끝나지 않습니다.” | 좋은 시작이지만, 뒤 문장이 ‘기능 나열’이라 “누가/언제/왜”가 약하다. citeturn13view0 | A(High): “저장한 글을 다시 찾고, 관심 계정 새 글을 모으고, 반응 추이를 봅니다.”(문장 분리) / B(Med): “저장→검색→추적→인사이트” |
| 카드 라벨 | “Searches Free” | Free/Plus 라벨링은 유용. 다만 “Searches”만 영어이고 “무엇을 검색?”이 불명확. citeturn6view0 | A(High): “검색(무료)” / B(Med): “저장글 검색(Free)” |
| H3 | “저장한 글 다시 찾기” | 명확. 다만 ‘검색’ 기능의 구체(키워드/작성자/태그/기간)가 있으면 신뢰가 오른다. citeturn6view0 | A(Med): “키워드로 저장글 검색” / B(Low): 현 문구 유지 |
| 카드 설명 | “키워드로 빠르게 찾습니다.” | 짧고 좋지만 차별점(예: 태그/폴더/필터)이 빠져 있다. citeturn13view0 | A(Med): “키워드·태그로 즉시 필터링” / B(Low): “키워드 검색 지원” |
| 카드 라벨 | “Watchlists Plus” | “Watchlist”가 일반 사용자에겐 낯설다(관심 계정 구독/모니터링). citeturn6view0 | A(High): “관심 계정 추적(Plus)” / B(Med): “새 글 모아보기(Plus)” |
| H3 | “관심 계정 새 글 따라가기” | 의미는 전달된다. 다만 “공개 계정” 제약이 카드 제목에 포함되면 오해를 줄인다. citeturn6view0 | A(Med): “공개 계정 새 글 모아보기” / B(Low): 현 문구 유지 |
| 카드 라벨 | “Insights Plus” | “인사이트”는 좋지만, “무엇에 대한 인사이트(내 계정?)”를 전면에. citeturn6view0 | A(High): “내 계정 인사이트(Plus)” / B(Med): “성과 추적(Plus)” |
| H3 | “내 계정 반응 흐름 보기” | 명확. “스냅샷”이 생소할 수 있으므로 부제에서 자연어로 풀기 권장. citeturn6view0 | A(Med): “반응을 시간순으로 저장” / B(Low): 현 유지 |
| 섹션 라벨 | “PC” / “Mobile” | 정보 구획엔 좋지만, 언어 혼재가 계속된다. citeturn6view0 | A(High): “PC(확장)” / “모바일(멘션)” |
| H3 | “PC는 extension” | 한국어 페이지에서 영문 “extension”은 장벽. citeturn6view0 | A(High): “PC는 확장 프로그램” / B(Med): “PC: Chrome 확장” |
| CTA | “익스텐션 설치” | ‘익스텐션/확장 프로그램’ 표기 통일 필요. 또한 ‘설치’와 ‘설치 안내’가 동시에 있어 클릭 기대가 갈린다(다운로드? 문서?). 버튼 라벨은 동작을 명확히 하라는 NN/g 원칙에 맞춰 정리해야 한다. citeturn10search2turn6view0 | A(High): 버튼 1개로 통합 “Chrome 확장 설치(5분)” / B(Med): 2개 유지 시 “ZIP 다운로드” + “설치 가이드” |
| CTA | “스크랩북 열기” | 의도는 좋다. 다만 “로그인이 필요하다/멘션으로 저장된다” 같은 전제조건이 버튼 주변에 짧게 붙으면 이탈이 줄어든다. citeturn6view0turn12view0 | A(High): “스크랩북 열기(Threads 로그인)” / B(Med): “멘션 저장함 열기” |
| 섹션 라벨 | “Save routes” | 무슨 뜻인지 불명확(저장 경로/라우팅). 또한 한국어 핵심 문장이 바로 아래에 있어 라벨이 불필요하게 보인다. citeturn6view1 | A(High): “저장 경로” / B(Low): 라벨 삭제 |
| H2 | “저장한 뒤 옮기고…” | 방향은 좋지만, ‘Cloud’가 무엇인지 정의 없이 나오면 불신(내 데이터가 서버로 가나?)이 생긴다. 공식 개인정보 정책은 기능에 따라 서버 통신이 있을 수 있음을 언급하므로(특히 Pro/Notion) 더더욱 용어 정의가 필요하다. citeturn6view1turn8view0 | A(High): “저장 → 태그 → 내보내기(내 데이터 통제)” / B(Med): “Cloud(웹 보관함)·ZIP 내보내기”처럼 괄호 정의 |
| 기능 문단 | “Cloud에 모아둔 뒤 ZIP” | ‘Cloud’ 정의 없이 “모아둔다”는 표현은 개인정보 오해를 부른다(로컬? 서버?). citeturn6view1turn8view0 | A(High): “웹 보관함에 모아 ZIP로 내보내기” 또는 “로컬/내보내기 중심”으로 명확화 / B(Med): “Cloud(웹 스크랩북)” 표기 |
| H3 | “읽고 있는 글을 원하는 곳으로 저장” | 강점이 큰 문장. 다만 “어디(Notion/Obsidian/Cloud)”를 제목에 직접 넣으면 스캔 속도가 올라간다. citeturn6view1 | A(High): “Notion·Obsidian·Cloud로 바로 저장” / B(Med): “저장처 선택: Notion/Obsidian/Cloud” |
| 기능 문단 | “Notion, Obsidian, Cloud” | 저장처 3개는 매력인데, “Cloud”의 정체가 애매하고 “Notion/Obsidian” 표기·링크(무엇이 필요한지)가 없다. citeturn6view1 | A(Med): 저장처별 한줄 예시 추가(“Notion: 페이지 생성 / Obsidian: .md+이미지 / Cloud: 웹 보관함”) / B(Low): 현재 유지 |
| H3 | “@mention 저장 때…” | 모바일 행동을 잘 설명한다. 다만 “어디에 #태그를 적는지(댓글?)”만 보강하면 즉시 이해된다. citeturn13view2 | A(Med): “댓글에 @멘션 + #태그” / B(Low): 현 유지 |
| H3 | “내가 쓴 태그만 눌러…” | 기능 설명은 명확. “태그를 어디서 관리?”가 잠깐 궁금해질 수 있으나, 세부는 스크랩북에서 해결 가능. citeturn13view2turn12view0 | A(Low): 현 유지 / B(Low): “태그로 저장글 필터” |

**UX 이슈(위계·CTA·신뢰)**  
- 히어로 문구가 한 줄로 붙어 보여(공백/줄바꿈 문제) “첫 화면 3초 이해”를 크게 방해한다. citeturn13view0turn11view0  
- 용어가 **한국어 문장 + 영문 라벨(Cloud/Watchlists/Save routes 등)**로 섞여 정보 위계가 흐려진다. citeturn6view1  
- Free/Plus 정보가 카드 라벨로만 흩어져 있어, “무료로 어디까지?”를 한눈에 판단하기 어렵다(스토어프론트 설정에는 Free 100/5 + Plus 1000/50이 명시됨). citeturn11view0turn6view1  
- 제품 신뢰 신호(지원 이메일, 개인정보/권한 요약, 환불 정책 링크)가 `/`에서 거의 드러나지 않는다(스토어프론트 JSON엔 supportEmail/FAQ가 존재). citeturn11view0turn8view0  
- 홈페이지 원칙상 히어로에서 “명확한 가치제안(무엇/차별점)”이 핵심인데, 현재는 일반적 메시지(“easy way”) 중심이다. citeturn10search0turn13view0  

**정량 가설 및 A/B 테스트 아이디어(측정 가능 형태로 제시)**  
분석 도구/전환율 데이터는 공개되지 않아 수치는 “가설”로만 제시한다(미정). citeturn6view0  
- 가설: 히어로를 “Threads 저장을 편하게…(PC 확장/모바일 멘션)”처럼 **행동+결과 중심 한국어 2–3줄**로 정리하면, 첫 CTA(설치/스크랩북) 클릭률이 유의미하게 상승할 가능성이 높다. citeturn11view0turn10search0turn10search2  
  - A/B: (A) 현 히어로 vs (B) storefront headline 그대로 반영 vs (C) 저장처(Notion/Obsidian)까지 포함한 히어로  
- 가설: 버튼 텍스트를 “설치 안내/익스텐션 설치” 이중 구조에서 “Chrome 확장 설치(5분)” 단일로 하면, 설치 페이지 진입률이 상승할 가능성이 있다(버튼 라벨 명확성). citeturn10search2turn6view0  
  - A/B: (A) 2버튼 vs (B) 1버튼 통합  
- 가설: “Cloud(웹 스크랩북)” 식의 괄호 정의를 추가하면 개인정보/저장 위치 오해로 인한 이탈이 감소할 가능성이 있다(특히 Pro/Notion/AI는 서버 통신이 있을 수 있음을 정책이 명시). citeturn8view0turn6view1  

**구현 체크리스트(5–8개)**  
1) 히어로 문장을 2–3줄로 분리(줄바꿈·공백·문장부호 정리). citeturn13view0turn11view0  
2) 영문 라벨을 한국어로 통일(특히 Watchlists/Insights/Cloud/Save routes). citeturn6view1  
3) CTA를 “PC: 확장 설치 / 모바일: 스크랩북 열기(로그인)” 2갈래로 명확히 배치. citeturn6view0turn12view0  
4) Free vs Plus 핵심 차이(100/5 vs 1000/50 + watchlists/insights)를 히어로 아래 1줄로 고정. citeturn11view0  
5) “Cloud” 저장 위치 정의(로컬/웹 보관함/내보내기) 명시. citeturn6view1  
6) supportEmail(스토어프론트의 hello@…)과 FAQ 1–2개를 푸터에 노출. citeturn11view0  
7) 개인정보/권한 한 줄 요약(“저장은 기본 로컬, Pro/Notion 사용 시 서버 연동”)과 정책 링크 추가. citeturn8view0  

## 설치 안내 페이지 비평
**페이지 한줄 결론(1–2문장)**  
`/install`은 단계 자체는 상식적이지만, “extension” 용어 혼용과 **번호 렌더링 깨짐(‘1. 1’)**이 신뢰를 깎고, 개발자 모드 설치에 대한 안전 안내가 부족하다. citeturn6view3turn13view3  

**여정 내 역할**  
PC 사용자가 “지금 막히는 구간 없이 설치 완료”가 목표인 작업 페이지이며, 설명은 짧고 정확하고 불안을 줄여야 한다. 결제/가치 설득보다 **완주율**이 KPI다. citeturn6view3turn10search5  

**DOM/텍스트 스냅샷(근거용 발췌)**  
- H1: “PC용 extension 설치” citeturn6view3  
- 안내문: “Chrome 개발자 모드에서…” citeturn6view3  
- H2: “Chrome 개발자 모드로 extension 설치” citeturn6view3  
- 번호 깨짐: “1. 1”, “2. 2”… citeturn13view3  
- 핵심 단계: `chrome://extensions`, “개발자 모드”, “압축해제된 확장 프로그램을 로드합니다” citeturn6view3turn13view3  

**라인별 비평 및 교정안** citeturn6view3turn13view3  

| 요소 | 원문(정확 발췌) | 진단 | 제안 리라이트(우선순위) |
|---|---|---|---|
| H1 | “PC용 extension 설치” | 한국어 페이지에서 “extension”은 일관성에 악영향(메인도 같은 문제). citeturn6view3 | A(High): “PC용 확장 프로그램 설치” / B(Med): “Chrome 확장 설치” |
| 리드 문장 | “Chrome 개발자 모드에서…” | 행동 지시는 명확하지만, 개발자 모드가 주는 불안(보안/업데이트)을 잠깐 달래야 완주율이 올라간다. citeturn6view3 | A(High): “(안내) 현재는 ZIP 설치라 개발자 모드가 필요합니다. 설치 후에도 일반 사용은 안전합니다.” / B(Med): “ZIP 설치(개발자 모드 필요)” |
| H2 | “Chrome 개발자 모드로…” | 좋다. 다만 제목이 길면 스캔이 느리다. citeturn6view3 | A(Med): “개발자 모드로 설치하기” / B(Low): 현 유지 |
| 설명 | “현재는 ZIP 배포입니다.” | 핵심 정보. 다만 “왜 ZIP인가/업데이트는?” 질문을 즉시 유발한다. citeturn6view3 | A(High): “현재는 ZIP 배포(자동 업데이트 없음)” + “업데이트 방법” 링크 / B(Med): “ZIP 설치(1회 등록)” |
| 번호 UI | “1. 1” | 렌더링/마크다운 버그로 보이고 신뢰를 즉시 깎는다(“정리 안 된 서비스” 인상). citeturn13view3 | A(High): 숫자 중복 제거 / B(High): 진행바(1/6)로 시각화 |
| Step 제목 | “ZIP을 내려받고…” | 좋다. 다만 “다운로드 버튼”이 페이지 내에서 보이는지 불명확(상단 링크는 GitHub로 직행). citeturn6view3turn12view2 | A(High): “ZIP 다운로드” 버튼을 Step 1에 배치 / B(Med): GitHub 링크 + 미러 링크 |
| 주의 문장 | “ZIP 파일 자체는…” | 매우 유용한 주의. 다만 문장을 더 짧게 하면 좋다. citeturn6view3 | A(Med): “ZIP을 먼저 풀고, ‘폴더’를 선택하세요.” / B(Low): 현 유지 |
| Step 제목 | “Chrome에서 extensions…” | 좋다. ‘extensions’도 한글로 병기하면 더 친절. citeturn13view3 | A(Low): “확장 프로그램(extensions) 페이지 열기” |
| 코드 | “chrome://extensions” | 정확. 복사 버튼/클릭 링크 제공이 있으면 더 좋지만 텍스트만으로도 충분하다. citeturn6view3 | A(Low): 현 유지(링크화만 추가) |
| Step 제목 | “개발자 모드를 켭니다” | 좋다. 다만 “왜 필요한가”가 바로 옆에 있으면 불안이 줄어든다. citeturn13view3 | A(Med): “개발자 모드 켜기(Load unpacked 버튼 표시)” |
| 안내 | “토글을 켜면 … 버튼” | 정확. 괄호로 버튼명을 짧게. citeturn6view3 | A(Low): “개발자 모드 ON → ‘압축해제…로드’ 버튼 표시” |
| Step 제목 | “로드합니다를 클릭합니다” | 버튼 라벨을 인용부호로 감싸 UI 인지가 쉬워진다. citeturn13view3 | A(Low): “‘압축해제…로드’ 클릭” |
| Step 제목 | “폴더를 선택해…” | 좋다. 다만 ZIP/clone 케이스 분기(어떤 폴더?)가 없어서, 나중에 사용자 질문이 생길 수 있다. 공식 README는 분기를 제공한다. citeturn9view0turn13view3 | A(Med): “ZIP이면 ss-threads-extension 폴더 / 저장소면 dist/extension” / B(Low): 현 유지 |
| Step 제목 | “Threads에서 바로 확인합니다” | 좋다. “테스트 체크리스트” 형태로 더 짧게. citeturn13view3 | A(Med): “설치 테스트: Threads 글 열고 저장 1회” |

**UX 이슈(위계·CTA·신뢰)**  
- 단계 번호가 중복 표시되는 시각적 오류는 설치 성공률에 직접적 악영향이 날 수 있다(사용자는 ‘가이드도 못 쓰는 서비스’로 판단). citeturn13view3  
- “자동 업데이트 없음/업데이트 방법”이 빠져 있어 ZIP 배포의 대표 불안을 해소하지 못한다. citeturn6view3turn9view0  
- 다운로드 링크가 GitHub 자산으로 직행하는 구조는 브라우저/보안 정책에 따라 차단·경고가 뜰 수 있다(본 조사 환경에서도 직접 다운로드가 안전 이슈로 중단됨). citeturn2view0turn12view2  

**정량 가설 및 A/B 테스트 아이디어**  
- 가설: Step 1에 “ZIP 다운로드” 1차 버튼을 두면 설치 페이지에서 외부 이탈이 줄고, 설치 완료율이 상승할 가능성이 있다. citeturn6view3turn10search2  
  - A/B: (A) 상단 GitHub 링크 vs (B) Step 1 내부 다운로드 버튼  
- 가설: “자동 업데이트 없음/업데이트 방법” 안내 추가는 설치 후 불만/문의(지원 비용)를 줄일 가능성이 있다. citeturn9view0turn11view0  

**구현 체크리스트(5–8개)**  
1) “extension” → “확장 프로그램”으로 전면 통일. citeturn6view3turn6view0  
2) 번호 중복(‘1. 1’) 마크다운/컴포넌트 렌더 버그 수정. citeturn13view3  
3) ZIP 설치의 보안/업데이트 안내 배너(2문장) 추가. citeturn6view3turn9view0  
4) Step 1에 다운로드 버튼 + 해시/버전 표기(가능한 경우) 추가. citeturn9view0turn12view2  
5) 폴더 선택 분기(“ZIP vs 저장소 clone”)를 Step 5에 삽입. citeturn9view0turn13view3  
6) 설치 완료 체크(“확장 고정→Threads 글 열기→저장 1회”)를 체크박스로 제공. citeturn12view2  

## 결제 페이지 비평
**페이지 한줄 결론(1–2문장)**  
`/checkout`은 가격·기능표를 제공하지만, 결제수단/키 전달/환불/개인정보(특히 Pro 키 활성화·Notion/AI 연동) 관련 신뢰 신호가 화면에서 충분히 구조화되지 않아 결제 마찰이 커질 위험이 있다. citeturn6view5turn11view0turn8view0turn10search5  

**여정 내 역할**  
결제 직전 사용자의 “마지막 질문(얼마/무엇/어떻게 결제/언제 키/환불/내 데이터 안전?)”을 제거해 전환을 마무리해야 한다. 결제 마찰은 전환을 깎는 핵심 요인이다. citeturn10search5turn6view6  

**DOM/텍스트 스냅샷(근거용 발췌)**  
- H1: “Plus 구매” citeturn6view5  
- 가격 설명: “연 US$19.99 또는 월 US$2.99…” citeturn6view5  
- 포함 항목: “Scrapbook 저장글 1,000개… 7일 환불” citeturn6view5  
- 기능 비교: “기능 Free Plus … AI 요약/태그/frontmatter” citeturn6view5turn6view6  
- 활성화 안내: “즉시 활성화 아님 … 보통 30분” citeturn6view6  
- 폼/CTA: “이름 이메일 결제수단 … 구매 요청 보내기” citeturn6view6  
- storefront(JSON)에는 supportEmail/FAQ/결제수단 목록이 존재 citeturn11view0  

**라인별 비평 및 교정안(전수)** citeturn6view5turn6view6turn11view0  

| 요소 | 원문(정확 발췌) | 진단 | 제안 리라이트(우선순위) |
|---|---|---|---|
| H1 | “Plus 구매” | 기능은 알겠지만 “무엇의 Plus인지(스크랩북? 확장? 둘 다?)”가 제목에서 불명확. citeturn6view5 | A(High): “Plus로 한도·고급 저장 열기” / B(Med): “ss-threads Plus 구매” |
| 가격 문장 | “연 US$19.99 또는…” | 가격 제시는 명확. 다만 “세금/환율/결제수단” 등 결제 불안 포인트를 바로 아래에 구조화할 필요가 있다. citeturn6view5turn10search5 | A(High): “월/연 가격 + 결제수단 + 환불 1줄 요약” / B(Med): 가격 문장을 2줄로 분리 |
| 토글 | “연간 … 월간 …” | 토글 UI는 좋은데, “연간 기본”이 왜 기본인지(할인/권장) 설명이 없으면 의심이 생긴다. citeturn6view5 | A(Med): “연간(권장, 19.99)” “월간(2.99)” + 차이(절감) 표기 / B(Low): 현 유지 |
| 플랜 라벨 | “US$19.99 연간 기본” | “기본”이라는 단어는 ‘다른 플랜 존재?’라는 혼란 유발. citeturn6view5 | A(High): “Plus(연간)” / B(Med): “Plus 연간(기본 선택)” |
| 불릿 | “Scrapbook 저장글 1,000개” | 핵심이지만 “Free는 100” 대비가 이 블록엔 없다(아래 표에만 있음). 구매 결정을 돕기 위해 대비를 즉시 보여주는 게 좋다. citeturn6view5turn11view0 | A(High): “저장글 100→1,000” / B(Med): “저장글 1,000(Free 100)” |
| 불릿 | “Watchlists · Insights” | 무엇인지 설명이 부족(특히 구매 화면에서). FAQ에 “누가 Plus를 쓰면 좋나”가 있으나 페이지에 노출되지 않는다. citeturn6view5turn11view0 | A(High): “관심 계정 추적 + 내 계정 인사이트” / B(Med): 각 1줄 설명 추가 |
| 불릿 | “Notion · AI 정리” | 가장 민감한 항목(개인정보/콘텐츠 전송). 개인정보 정책상 기능에 따라 서버/AI엔드포인트로 전송이 있을 수 있어 구매 화면에서 요약 고지가 필요하다. citeturn6view5turn8view0 | A(High): “Notion 저장(연동 시 서버 처리) / AI 정리(사용자 설정 엔드포인트)” 요약 / B(Med): “데이터 처리 안내 보기” 링크 |
| 불릿 | “같은 Plus 키로 scrapbook + extension 연결” | 좋은 가치. 다만 “어디에 붙여넣나?”가 즉시 궁금해진다. citeturn6view5turn6view6 | A(Med): “스크랩북/확장 설정에 동일 키 입력” / B(Low): 현 유지 |
| 불릿 | “7일 환불” | 핵심 신뢰 신호. 그런데 “어디로/어떻게 요청?”이 없다. storefront FAQ엔 “요청 보내면 처리”가 있으니 그 링크/메일을 노출해야 한다. citeturn6view5turn11view0 | A(High): “7일 환불(hello@…로 이메일)” / B(Med): FAQ 섹션에 환불 절차 추가 |
| 표 제목 | “기능 Free Plus” | 비교 표 자체는 좋다. 다만 표 위에 “Free로 충분한가?”를 판단하는 1줄 가이드가 있으면 이해가 빠르다. citeturn6view6turn11view0 | A(Med): “Free: 저장·검색 / Plus: 한도·추적·인사이트” |
| 표 항목 | “mention inbox” | 고유 기능인데 영어/소문자 표기가 어색(언어 통일 필요). citeturn6view6 | A(High): “멘션 인박스” / B(Med): “멘션 저장함” |
| 표 항목 | “Searches” | 메인도 동일하게 영어 혼재. citeturn6view6turn6view0 | A(High): “검색” / B(Med): “저장글 검색” |
| 표 항목 | “AI frontmatter” | 대상 사용자(Obsidian 사용자)에겐 의미가 있지만 일반 사용자에겐 낯설다. 툴팁/설명이 필요. citeturn6view6 | A(Med): “AI 메타데이터(frontmatter)” + 설명 / B(Low): 현 유지 |
| 요약 문장 | “Plus expands limits…” | 결제 페이지 한복판의 영어 문장은 가독성/신뢰를 깎는다. citeturn6view6 | A(High): “Plus: 한도·추적·인사이트·고급 저장 확장” / B(Med): 해당 문장 제거 |
| 안내 문단 | “같은 Plus 키를…” | 좋은 안내. 다만 “키는 어디서 받나/언제 오나”와 붙여서 한 블록으로 만드는 게 낫다. citeturn6view6 | A(Med): “결제 확인→이메일 발송→스크랩북/확장에 입력” 3단계 |
| 주의 문단 | “searches는 Free에서도…” | Free/Plus 경계 설명은 유용. 다만 “Threads 로그인/권한 재연결”은 결제 직전 불안 포인트이므로 구체적으로 “왜 필요한지/무슨 권한인지”가 필요하다. citeturn6view6 | A(High): “Watchlists/Insights 사용 시 Threads 로그인 권한이 필요(새 글/인사이트 조회용)” / B(Med): “권한 안내 보기” 링크 |
| H2 | “즉시 활성화 아님” | 솔직하지만, 부정형만 크게 보이면 전환에 손해. “보통 30분”을 제목으로 승격시키는 게 낫다. citeturn6view6 | A(High): “보통 30분 내 이메일로 키 발송” / B(Med): “결제 확인 후 키 발송(대개 30분)” |
| 설명 | “주문 접수 후…” | 운영 방식 설명은 좋다. 다만 “30분”은 SLA처럼 보이므로 “최대/예외”를 짧게 정리하는 편이 신뢰에 유리. citeturn6view6 | A(Med): “보통 30분(업무시간 외 최대 X시간)” / B(Low): 현 유지 |
| 폼 라벨 | “이름 이메일 결제수단 …” | 텍스트 추출 결과로는 폼이 한 줄로 뭉개져 보여 구조화가 약한 인상을 준다(실 UI가 괜찮더라도 스캔 가능성이 낮음). 체크아웃 폼 라벨/설명 부족은 혼란을 유발한다는 Baymard 근거와도 맞물린다. citeturn10search13turn6view6turn11view0 | A(High): 항목별 라벨+설명(“결제 이메일 = 키 수신 이메일”) / B(Med): 최소한 결제수단 영역에 방법별 카드(Stableorder/Stripe/PayPal) |
| CTA | “구매 요청 보내기” | “요청”은 ‘결제 완료가 아닌가?’ 혼란을 만든다. 실제로 “결제 확인 후 발송” 구조라면 더더욱 “다음이 무엇인지”를 버튼이 말해줘야 한다. citeturn6view6turn10search2turn10search5 | A(High): “주문서 제출 → 결제 링크 받기” 또는 “주문 접수하기” / B(Med): 결제수단 선택 시 버튼을 “Stableorder로 결제하기”처럼 동적 변경(스토어프론트엔 actionLabel 존재) citeturn11view0 |
| 보조 문장 | “주문 요청 후…” | 투명성은 좋지만, 같은 의미 문장이 반복되고 있다(위에 이미 설명). 중복은 불안을 키운다. citeturn6view6 | A(Med): 하단에 “처리 흐름” 1회만 요약 / B(Low): 반복 문장 제거 |
| 네비 | “← 제품 페이지로…” | 복귀 링크 존재는 좋다. 다만 결제 이탈을 촉진할 수 있으니 시각적 우선순위는 낮게(secondary) 처리 권장. citeturn6view6 | A(Low): 현 유지(스타일만 약화) |

**UX 이슈(위계·CTA·신뢰)**  
- 결제수단이 실제 화면에 어떻게 노출되는지 불명확하다. 정적 텍스트엔 결제수단 이름이 없고, 대신 storefront JSON에만 “Stableorder/Stripe/PayPal”과 actionLabel/actionUrl이 있다. 이 간극은 사용자가 “어떻게 결제하지?”에서 멈추게 만든다. citeturn6view6turn11view0  
- 결제 단계 신뢰요소(지원 이메일, 환불 요청 경로, 개인정보/권한 요약)가 페이지 구조상 분리되어 있지 않다. 반면 JSON FAQ에는 해당 문구들이 이미 존재한다. citeturn11view0turn6view6  
- “Notion/AI”는 고급 가치이면서 동시에 개인정보 우려 지점이다. 공개 개인정보 정책은 Pro 키 활성화/Notion 저장 시 개발자 백엔드와 통신 및 토큰 저장이 있을 수 있음을 명시한다. 따라서 결제 페이지에 요약 고지가 없으면 불신이 커진다. citeturn8view0turn6view6  
- 체크아웃 UX 연구는 폼 라벨/설명 부족이 혼란을 유발한다고 반복적으로 지적한다. 현재 텍스트 구조만 보면 라벨이 뭉개져 보이는 문제가 있다. citeturn10search13turn6view6  

**정량 가설 및 A/B 테스트 아이디어**  
- 가설: 결제수단을 “선택→설명→버튼(actionLabel)”로 카드화해 노출하면, 결제 마찰이 감소하고 제출(구매 요청) 완료율이 상승할 가능성이 있다. citeturn10search5turn11view0turn10search2  
  - A/B: (A) 현 “결제수단 선택” vs (B) Stableorder/Stripe/PayPal 카드+설명+버튼  
- 가설: 버튼명을 “구매 요청 보내기”에서 “주문 접수하기(결제 링크 안내)”로 바꾸면, 단계 오해(‘결제가 끝난 줄 착각’ 또는 ‘아직 뭔지 모름’)가 줄어든다. citeturn10search2turn6view6  
- 가설: “7일 환불(요청 경로 명시)” + “supportEmail 노출”은 신규 사용자 신뢰를 높여 전환에 긍정적 영향을 줄 가능성이 있다. citeturn11view0turn10search5  

**구현 체크리스트(5–8개)**  
1) 결제수단 UI를 JSON(paymentMethods) 기반으로 화면에 명확히 렌더(이름/요약/버튼). citeturn11view0turn6view6  
2) CTA 문구를 “요청”에서 “주문 접수/결제 진행” 중심으로 개편(단계 기대치 정렬). citeturn10search2turn6view6  
3) “키 전달: 결제 확인 후 이메일”을 H2로 승격하고, 처리 흐름(3단계)을 시각화. citeturn6view6  
4) 환불 안내에 “요청 채널(이메일/폼)”을 명시하고, FAQ를 페이지 내 삽입. citeturn11view0turn6view5  
5) Notion/AI/Pro 활성화 관련 데이터 처리 요약(1~2문장) + 정책 링크 제공. citeturn8view0turn6view6  
6) 용어/언어 통일(mention inbox/Searches 등). citeturn6view6turn6view0  
7) 폼 라벨에 보조설명 추가(특히 “이메일=키 수신”, “결제 이메일 일치 필요”는 storefront에도 유사 안내가 있음). citeturn11view0turn10search13  

## 공통 개선 우선순위와 롤아웃 계획
**전제(미정 항목 명시)**  
- 타깃(개발자/일반 사용자/지식관리 사용자), 유입 채널, 트래픽 규모, 전환율/이탈률, 국가별 결제 선호, 고객지원 처리시간 등은 페이지에 명시되거나 분석 도구로 확인할 수 없어 **미정**으로 둔다. citeturn6view0turn6view5turn11view0  

### 사용자 의도 기준 비교표
요구사항에 따라 “현재 vs 제안 카피 / 의도 / 우선순위”를 한 표로 묶었다(각 페이지 상세표의 High/Med 중 핵심만 추림). citeturn6view0turn6view3turn6view5turn11view0  

| 페이지 | 현재 카피(정확 발췌) | 제안 카피(요약) | 의도 | 우선순위 |
|---|---|---|---|---|
| / | “Save Threads the easy way.” citeturn13view0 | “Threads 글을 Notion·Obsidian·스크랩북에 저장” | 즉시 이해(무엇) | High |
| / | “Extension on PC,” citeturn13view0 | “PC: 확장 아이콘 한 번으로 저장” | 즉시 이해(어떻게) | High |
| / | “@mention on mobile.” citeturn13view0 | “모바일: 댓글에 @…만 적기” | 즉시 이해(어떻게) | High |
| / | “Cloud” citeturn6view1 | “Cloud(웹 보관함)” 또는 용어 재정의 | 개인정보 오해 방지 | High |
| /install | “PC용 extension 설치” citeturn6view3 | “PC용 확장 프로그램 설치” | 용어 통일/신뢰 | High |
| /install | “1. 1” citeturn13view3 | 번호 중복 제거 | 신뢰/완주율 | High |
| /checkout | “Plus 구매” citeturn6view5 | “Plus로 한도·고급 저장 열기” | 구매 이유 강화 | High |
| /checkout | “구매 요청 보내기” citeturn6view6 | “주문 접수하기(결제 진행)” | 단계 기대치 정렬 | High |
| /checkout | “즉시 활성화 아님” citeturn6view6 | “보통 30분 내 키 발송” | 불안 감소 | High |
| /checkout | 결제수단 이름 미노출 citeturn6view6turn11view0 | 결제수단 카드(Stableorder/Stripe/PayPal) | 결제 마찰 감소 | High |
| 공통 | 영문 라벨 혼재 citeturn6view1turn6view6 | 한국어 1언어로 통일(또는 완전한 i18n) | 스캔/신뢰 | High |
| 공통 | FAQ·supportEmail은 JSON에만 존재 citeturn11view0 | 페이지 하단에 FAQ/지원 이메일 노출 | 신뢰 신호 | Med |

### 롤아웃 우선순위
전환 흐름 기준 추천 순서는 아래가 가장 합리적이다(‘상단 이해’ → ‘결제 마찰’ → ‘설치 완주’). citeturn10search0turn10search5turn6view0turn6view5  
- 먼저: `/` 히어로·CTA·용어 통일(유입자의 “이해” 해결) citeturn6view0turn11view0  
- 다음: `/checkout` 결제수단 노출·버튼 라벨·신뢰요약(결제 마찰 제거) citeturn6view6turn11view0turn10search5  
- 그다음: `/install` 렌더 버그/업데이트·안전 안내(설치 완주율 향상) citeturn13view3turn6view3  

### 빠른 실행용 공통 체크(중복 제거 버전)
- 히어로/버튼/라벨의 언어를 “한국어(또는 완전 다국어)”로 일관화. citeturn6view0turn6view1turn6view6  
- “Cloud/스크랩북/멘션 저장”의 의미를 한 문장 정의로 고정. citeturn6view1turn11view0  
- Free vs Plus 핵심 차이(100/5 vs 1000/50 + watchlists/insights)를 모든 페이지(최소 /와 /checkout)에 동일한 문장으로 노출. citeturn11view0turn6view6  
- 결제 페이지에 “지원 이메일/환불/키 전달/데이터 처리” 4종 신뢰 블록 추가(스토어프론트 JSON과 개인정보 정책을 화면에 반영). citeturn11view0turn8view0