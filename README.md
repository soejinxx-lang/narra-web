# 📱 NARRA Web — 독자용 프론트엔드

> [narra.kr](https://narra.kr) — 다국어 웹소설 읽기·커뮤니티·구독 플랫폼

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19, TypeScript 5 |
| Styling | Vanilla CSS (CSS Modules + inline) |
| i18n | 커스텀 클라이언트 사이드 (9개 언어) |
| 결제 | Gumroad (팝업 윈도우) |
| 테스트 | Playwright (E2E) |
| 배포 | Vercel (자동 배포) |

---

## 페이지 구조

```
app/
├── page.tsx                    # 홈 (캐러셀, 인기 랭킹, 읽고 있는 작품)
├── layout.tsx                  # 공통 레이아웃 (Header, BottomBar, Meta)
│
├── novels/[id]/                # 작품 상세 (소개, 에피소드 목록, 댓글)
│   └── [ep]/                   #   에피소드 읽기 (리더)
│
├── browse/                     # 작품 탐색 (장르, 언어 필터)
├── search/                     # 검색
├── authors/                    # 작가 프로필
│
├── login/                      # 로그인
├── signup/                     # 회원가입
├── mypage/                     # 마이페이지 (프로필, 설정)
├── settings/                   # 계정 설정
│
├── pricing/                    # 구독 플랜 + 결제 (Gumroad 팝업)
├── premium/                    # 프리미엄 소개
│
├── community/                  # 커뮤니티 (전체 댓글)
├── daily-checkin/              # 일일 출석
├── library/                    # 내 서재 (북마크, 즐겨찾기)
├── notes/                      # 노트
├── fanart/                     # 팬아트
├── music/                      # 음악 플레이어
│
├── dashboard/                  # 작가 대시보드
│   └── novels/                 #   작품 관리
│       ├── create/             #     작품 생성
│       └── [id]/               #     작품 편집
│
├── guide/                      # 이용 가이드
├── support/                    # 고객 지원
├── privacy/                    # 개인정보 처리방침
├── terms/                      # 이용약관
│
└── api/                        # API Routes
    └── ls/checkout/            #   결제 API (Gumroad redirect)
```

---

## 컴포넌트 (37개)

### 네비게이션
| 컴포넌트 | 역할 |
|----------|------|
| `Header.tsx` | 상단 GNB (로고, 검색, 언어 선택, 로그인) |
| `BottomBar.tsx` | 모바일 하단 네비게이션 |
| `MobileMenu.tsx` | 모바일 햄버거 메뉴 |
| `NavMenu.tsx` | 네비게이션 메뉴 |

### 작품 / 읽기
| 컴포넌트 | 역할 |
|----------|------|
| `NovelCard.tsx` | 작품 카드 (표지, 제목, 장르) |
| `NovelCarousel.tsx` | 작품 캐러셀 슬라이더 |
| `NovelCardWithTracking.tsx` | 조회수 트래킹 카드 |
| `EpisodeReader.tsx` | 에피소드 본문 리더 (25KB, 핵심 컴포넌트) |
| `EpisodeListItem.tsx` | 에피소드 목록 아이템 |
| `EpisodeProgress.tsx` | 에피소드 읽기 진행률 |
| `ReadingSettings.tsx` | 읽기 설정 (폰트, 크기, 배경) |
| `ReadingProgressBar.tsx` | 스크롤 기반 읽기 진행바 |
| `LanguageLearningMode.tsx` | 언어 학습 모드 (원문/번역 동시 표시) |

### 커뮤니티
| 컴포넌트 | 역할 |
|----------|------|
| `CommentSection.tsx` | 댓글 섹션 (작성, 대댓글, 좋아요) |
| `StarRating.tsx` | 별점 컴포넌트 |
| `ShareButton.tsx` | 공유 버튼 (URL 복사, SNS) |

### 홈 / 탐색
| 컴포넌트 | 역할 |
|----------|------|
| `PopularRankings.tsx` | 인기 랭킹 |
| `ReadingNovels.tsx` | 읽고 있는 작품 |
| `FeatureGrid.tsx` | 기능 소개 그리드 |
| `BrowseClient.tsx` | 작품 탐색 클라이언트 |
| `BrowseFilters.tsx` | 장르/언어 필터 |
| `BrowseButton.tsx` | 탐색 버튼 |
| `SearchBar.tsx` | 검색바 |

### 미디어 / 유틸
| 컴포넌트 | 역할 |
|----------|------|
| `AudioPlayer.tsx` | 오디오 플레이어 (TTS) |
| `MusicPlayer.tsx` | 음악 플레이어 |
| `AdBanner.tsx` | 광고 배너 |
| `AccordionItem.tsx` | 아코디언 UI |
| `AuthorCard.tsx` | 작가 카드 |
| `BookmarkButton.tsx` | 북마크 버튼 |
| `FavoriteButton.tsx` | 즐겨찾기 버튼 |
| `ContinueReadingButton.tsx` | 이어읽기 버튼 |
| `StartReadingButton.tsx` | 읽기 시작 버튼 |
| `Providers.tsx` | Context Providers |

---

## 국제화 (i18n)

### 지원 언어 (9개)
```
lib/i18n/
├── index.tsx    # useLocale() 훅 + 언어 감지
├── ko.ts        # 한국어
├── en.ts        # English
├── ja.ts        # 日本語
├── zh.ts        # 中文
├── es.ts        # Español
├── fr.ts        # Français
├── de.ts        # Deutsch
├── pt.ts        # Português
└── id.ts        # Indonesia
```

### 사용법
```tsx
const { t, locale } = useLocale();
return <h1>{t("pricing.title")}</h1>;
```

- 클라이언트 사이드 감지 (브라우저 언어 → 쿠키 → fallback)
- 각 파일에 500+ 번역 키

---

## 결제 시스템 (Gumroad)

### 구독 플랜
| 플랜 | Monthly | Annual |
|------|---------|--------|
| Reader Plus | $4.99/mo | $49.99/yr |
| Author Starter | $7.99/mo | $79.99/yr |
| Author Pro | $12.99/mo | $129.99/yr |

### 결제 흐름
```
1. Pricing 페이지에서 플랜 선택
2. 팝업 윈도우로 Gumroad 결제 페이지 오픈
   - user_id + email 자동 전달 (custom_fields)
3. 결제 완료 후 팝업 닫힘
4. 팝업 닫힘 감지 → 5초 간격 polling 시작 (최대 60초)
5. user_plans 반영 확인 → 즉시 UI 업데이트
```

---

## E2E 테스트 (Playwright)

```bash
npm run test:e2e
```

- GitHub Actions CI/CD 연동
- 테스트 결과 → Storage API로 전송 → Admin 대시보드에서 확인

---

## 보안 (CSP)

`next.config.ts`에서 Content-Security-Policy 관리:

```
script-src: self, googletagmanager.com, gumroad.com
frame-src: self, gumroad.com
connect-src: self, google-analytics.com, *.railway.app, gumroad.com
```

---

## 환경변수

| 변수 | 설명 | 예시 |
|------|------|------|
| `NEXT_PUBLIC_STORAGE_BASE_URL` | Storage API 주소 | `https://narra-storage.railway.app/api` |
| `NEXT_PUBLIC_API_URL` | API URL | `https://narra-storage.railway.app` |

---

## 개발

```bash
npm install
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run test:e2e     # E2E 테스트
```

---

## 배포

- **플랫폼**: Vercel
- **도메인**: narra.kr
- **방식**: `git push` → 자동 배포
- **환경변수**: Vercel UI에서 관리