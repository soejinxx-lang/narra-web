# NARRA Web - 독자용 프론트엔드

> ⚠️ **규칙은 최상위 [narra/README.md](../README.md) 참고**

---

## 프로젝트 개요

웹소설 다국어 읽기 플랫폼입니다.

**핵심 역할**:
- 작품/에피소드 열람
- 9개 언어 지원 (ko, en, ja, zh, es, fr, de, pt, id)
- 댓글, 조회수, 읽기 진행률

---

## 프로젝트 구조

```
narra-web/
├── app/
│   ├── novel/[id]/         # 작품 상세 페이지
│   ├── novel/[id]/[ep]/    # 에피소드 읽기 페이지
│   ├── search/             # 검색 페이지
│   ├── mypage/             # 마이페이지
│   └── layout.tsx          # 공통 레이아웃
│
├── components/
│   ├── Header.tsx          # 헤더
│   ├── Footer.tsx          # 푸터
│   ├── NovelCard.tsx       # 작품 카드
│   └── LanguageSelector.tsx # 언어 선택
│
├── lib/
│   └── api.ts              # Storage API 호출
│
└── public/                 # 정적 파일
```

---

## 개발

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

---

## 환경변수

```bash
NEXT_PUBLIC_API_URL=https://narra-storage.railway.app
```

---

## 배포

- **Vercel**: 자동 배포 (git push → 자동 감지)
- **도메인**: Vercel에서 설정

---

## 최근 변경 사항

### 2026-01-27
- 조회수 API 프록시 추가

### 2026-01-28
- 인도네시아어 언어 선택 UI 수정