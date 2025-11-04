# 📋 SNS 프로젝트 TODO

Instagram UI 기반 SNS 프로젝트 개발 체크리스트

---

## 🎯 프로젝트 기본 설정

### 환경 설정
- [x] Next.js 프로젝트 초기화 (Next.js 15.5.6)
- [x] TypeScript 설정 확인
- [x] Tailwind CSS 설정 (인스타 컬러 스키마 적용)
- [x] Clerk 인증 연동 (한국어 설정)
- [x] Supabase 프로젝트 생성 및 연동
- [ ] 환경 변수 설정 (.env 파일)

### 디자인 시스템
- [x] Tailwind CSS 컬러 변수 설정 (`globals.css`)
  - [x] Instagram Blue (#0095f6)
  - [x] 배경색 (#FAFAFA, #FFFFFF)
  - [x] 테두리색 (#DBDBDB)
  - [x] 텍스트 색상 (#262626, #8E8E8E)
  - [x] 좋아요 색상 (#ED4956)
- [x] 타이포그래피 설정 (font-family, 크기, 굵기)

### 데이터베이스 스키마
- [x] `users` 테이블 생성 (Clerk 동기화)
- [x] `posts` 테이블 생성
- [x] `likes` 테이블 생성
- [x] `comments` 테이블 생성
- [x] `follows` 테이블 생성

### Storage 설정
- [ ] Supabase Storage 버킷 생성 (`uploads`)
- [ ] Storage RLS 정책 설정 (개발 중 비활성화)

---

## 1️⃣ 1단계: 홈 피드 페이지

### 1-1. 기본 세팅
- [x] Next.js + TypeScript 프로젝트 생성
- [x] Clerk 인증 연동
- [x] Supabase 연동
- [x] Tailwind CSS 인스타 컬러 스키마 적용
- [x] 기본 데이터베이스 테이블 생성 (users, posts, likes, comments, follows)

### 1-2. 레이아웃 구조
- [ ] `components/layout/Sidebar.tsx` 컴포넌트
  - [ ] Desktop: 244px 너비, 아이콘 + 텍스트
  - [ ] Tablet: 72px 너비, 아이콘만
  - [ ] Mobile: 숨김
  - [ ] 메뉴 항목: 홈, 검색, 만들기, 프로필
  - [ ] Hover 효과 및 Active 상태 스타일
- [ ] `components/layout/Header.tsx` 컴포넌트 (Mobile)
  - [ ] 높이 60px
  - [ ] 로고 + 알림/DM/프로필 아이콘
- [ ] `components/layout/BottomNav.tsx` 컴포넌트 (Mobile)
  - [ ] 높이 50px
  - [ ] 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
- [ ] `app/(main)/layout.tsx` 생성
  - [ ] Sidebar 통합 (Desktop/Tablet)
  - [ ] Header/BottomNav 통합 (Mobile)
  - [ ] 반응형 레이아웃 처리

### 1-3. 홈 피드 - 게시물 목록
- [ ] `components/post/PostCard.tsx` 컴포넌트
  - [ ] 헤더 영역 (60px)
    - [ ] 프로필 이미지 (32px 원형)
    - [ ] 사용자명 (Bold)
    - [ ] 시간 표시 (작고 회색)
    - [ ] ⋯ 메뉴 버튼 (우측)
  - [ ] 이미지 영역
    - [ ] 1:1 정사각형 비율
    - [ ] 더블탭 좋아요 기능 (모바일)
  - [ ] 액션 버튼 영역 (48px)
    - [ ] ❤️ 좋아요 버튼
    - [ ] 💬 댓글 버튼
    - [ ] ✈️ 공유 버튼 (UI만, 기능 제외)
    - [ ] 🔖 북마크 버튼 (UI만, 기능 제외)
  - [ ] 컨텐츠 영역
    - [ ] 좋아요 수 표시 (Bold)
    - [ ] 캡션 표시 (사용자명 Bold + 내용)
    - [ ] 2줄 초과 시 "... 더 보기" 토글
    - [ ] 댓글 미리보기 (최신 2개)
- [ ] `components/post/PostCardSkeleton.tsx` 로딩 UI
  - [ ] Skeleton UI 구현
  - [ ] Shimmer 애니메이션 효과
- [ ] `components/post/PostFeed.tsx` 컴포넌트
  - [ ] 게시물 목록 렌더링
  - [ ] 로딩 상태 처리
  - [ ] 에러 상태 처리
- [ ] `app/(main)/page.tsx` 홈 피드 페이지
  - [ ] PostFeed 컴포넌트 통합
  - [ ] 배경색 #FAFAFA 적용
  - [ ] 최대 너비 630px 중앙 정렬
- [ ] `app/api/posts/route.ts` GET API
  - [ ] 페이지네이션 구현 (10개씩)
  - [ ] 시간 역순 정렬
  - [ ] 사용자 정보 JOIN

### 1-4. 홈 피드 - 좋아요 기능
- [ ] `likes` 테이블 마이그레이션 생성
  - [ ] `user_id` (UUID, FK to users)
  - [ ] `post_id` (UUID, FK to posts)
  - [ ] `created_at` (TIMESTAMPTZ)
  - [ ] UNIQUE 제약조건 (user_id, post_id)
- [ ] `app/api/likes/route.ts` API
  - [ ] POST: 좋아요 추가
  - [ ] DELETE: 좋아요 제거
- [ ] 좋아요 버튼 기능 구현
  - [ ] 클릭 시 좋아요 토글
  - [ ] 빈 하트 ↔ 빨간 하트 전환
  - [ ] 애니메이션: scale(1.3) → scale(1) (0.15초)
- [ ] 더블탭 좋아요 기능 (모바일)
  - [ ] 이미지 더블탭 감지
  - [ ] 큰 하트 등장 (fade in)
  - [ ] 1초 후 사라짐 (fade out)
  - [ ] 좋아요 상태 업데이트

---

## 2️⃣ 2단계: 게시물 작성 & 댓글 기능

### 2-1. 게시물 작성 모달
- [ ] `components/post/CreatePostModal.tsx` 컴포넌트
  - [ ] Dialog 기반 모달
  - [ ] 이미지 업로드 영역
  - [ ] 이미지 미리보기 UI
  - [ ] 캡션 입력 필드 (최대 2,200자)
  - [ ] 파일 크기 검증 (최대 5MB)
  - [ ] 이미지 형식 검증 (JPG, PNG, WebP)

### 2-2. 게시물 작성 - 이미지 업로드
- [ ] Supabase Storage 버킷 확인 (`uploads`)
- [ ] `app/api/posts/route.ts` POST API
  - [ ] 파일 업로드 처리
  - [ ] 이미지 경로 저장
  - [ ] 캡션 저장
  - [ ] 사용자 ID 연결
- [ ] 파일 업로드 로직
  - [ ] 파일 검증 (크기, 형식)
  - [ ] Storage 업로드
  - [ ] Public URL 생성
  - [ ] 데이터베이스 저장

### 2-3. 댓글 기능 - UI & 작성
- [ ] `comments` 테이블 마이그레이션 생성
  - [ ] `id` (UUID, PK)
  - [ ] `post_id` (UUID, FK to posts)
  - [ ] `user_id` (UUID, FK to users)
  - [ ] `content` (TEXT)
  - [ ] `created_at` (TIMESTAMPTZ)
- [ ] `components/comment/CommentList.tsx` 컴포넌트
  - [ ] 댓글 목록 렌더링
  - [ ] 사용자명 + 내용 표시
  - [ ] 시간 표시
- [ ] `components/comment/CommentForm.tsx` 컴포넌트
  - [ ] "댓글 달기..." 입력창
  - [ ] Enter 키 또는 "게시" 버튼으로 제출
- [ ] `app/api/comments/route.ts` POST API
  - [ ] 댓글 작성
  - [ ] 사용자 인증 확인
- [ ] PostCard에 댓글 기능 통합
  - [ ] 댓글 미리보기 (최신 2개)
  - [ ] "댓글 N개 모두 보기" 링크

### 2-4. 댓글 기능 - 삭제 & 무한스크롤
- [ ] `app/api/comments/[commentId]/route.ts` DELETE API
  - [ ] 댓글 삭제
  - [ ] 본인만 삭제 가능 (권한 확인)
- [ ] 댓글 삭제 버튼 UI
  - [ ] ⋯ 메뉴에 삭제 옵션 추가
  - [ ] 본인 댓글에만 표시
- [ ] PostFeed 무한 스크롤 구현
  - [ ] Intersection Observer 사용
  - [ ] 하단 도달 시 다음 10개 로드
  - [ ] 로딩 상태 표시

---

## 3️⃣ 3단계: 프로필 페이지 & 팔로우 기능

### 3-1. 프로필 페이지 - 기본 정보
- [ ] `app/(main)/profile/[userId]/page.tsx` 동적 라우트
- [ ] `components/profile/ProfileHeader.tsx` 컴포넌트
  - [ ] 프로필 이미지 (150px Desktop / 90px Mobile, 원형)
  - [ ] 사용자명 표시
  - [ ] 통계: 게시물 수, 팔로워 수, 팔로잉 수
  - [ ] "팔로우" 또는 "팔로잉" 버튼 (다른 사용자 프로필일 때)
  - [ ] 본인 프로필일 때: "프로필 편집" 버튼 (1차 제외)
  - [ ] Fullname 표시
  - [ ] Bio 표시
- [ ] `app/api/users/[userId]/route.ts` GET API
  - [ ] 사용자 정보 조회
  - [ ] 게시물 수, 팔로워 수, 팔로잉 수 계산
  - [ ] 팔로우 상태 확인

### 3-2. 프로필 페이지 - 게시물 그리드
- [ ] `components/profile/PostGrid.tsx` 컴포넌트
  - [ ] 3열 그리드 레이아웃 (반응형)
  - [ ] 1:1 정사각형 이미지 썸네일
  - [ ] Hover 시 좋아요/댓글 수 표시
  - [ ] 클릭 시 게시물 상세 모달/페이지로 이동
- [ ] `app/api/posts/route.ts` GET API 수정
  - [ ] `userId` 쿼리 파라미터 추가
  - [ ] 특정 사용자 게시물 필터링

### 3-3. 팔로우 기능
- [ ] `follows` 테이블 마이그레이션 생성
  - [ ] `follower_id` (UUID, FK to users)
  - [ ] `following_id` (UUID, FK to users)
  - [ ] `created_at` (TIMESTAMPTZ)
  - [ ] UNIQUE 제약조건 (follower_id, following_id)
  - [ ] 자기 자신 팔로우 방지 체크
- [ ] `app/api/follows/route.ts` API
  - [ ] POST: 팔로우 추가
  - [ ] DELETE: 언팔로우
- [ ] 팔로우/언팔로우 버튼 구현
  - [ ] 미팔로우: "팔로우" 버튼 (파란색 #0095f6)
  - [ ] 팔로우 중: "팔로잉" 버튼 (회색)
  - [ ] Hover 시: "언팔로우" 표시 (빨간 테두리)
  - [ ] 클릭 시 즉시 API 호출 → UI 업데이트

### 3-4. 게시물 상세 모달/페이지
- [ ] `components/post/PostModal.tsx` 컴포넌트 (Desktop)
  - [ ] 모달 형태
  - [ ] 좌측: 이미지 (50%)
  - [ ] 우측: 댓글 영역 (50%)
    - [ ] 헤더 (사용자명, ⋯ 메뉴)
    - [ ] 댓글 목록 (스크롤 가능)
    - [ ] 액션 버튼 (좋아요, 댓글, 공유, 북마크)
    - [ ] 좋아요 수
    - [ ] 댓글 입력창
- [ ] `app/(main)/post/[postId]/page.tsx` (Mobile)
  - [ ] 전체 페이지 형태
  - [ ] 게시물 상세 정보 표시
- [ ] `app/api/posts/[postId]/route.ts` GET API
  - [ ] 게시물 상세 정보 조회
  - [ ] 댓글 목록 포함
- [ ] 게시물 삭제 기능
  - [ ] ⋯ 메뉴에 삭제 옵션 추가
  - [ ] 본인 게시물만 삭제 가능
  - [ ] `app/api/posts/[postId]/route.ts` DELETE API

---

## 4️⃣ 최종 마무리 & 배포

### 반응형 테스트
- [ ] Desktop (1024px+) 테스트
  - [ ] Sidebar (244px) 표시
  - [ ] PostCard 최대 너비 630px
  - [ ] 게시물 상세 모달
- [ ] Tablet (768px ~ 1023px) 테스트
  - [ ] Icon-only Sidebar (72px)
  - [ ] PostCard 반응형
- [ ] Mobile (< 768px) 테스트
  - [ ] Header/BottomNav 표시
  - [ ] Sidebar 숨김
  - [ ] 전체 너비 PostCard
  - [ ] 게시물 상세 페이지

### 에러 핸들링 & UI 개선
- [ ] 에러 바운더리 추가
- [ ] 로딩 상태 개선 (Skeleton UI)
- [ ] 에러 메시지 표시
- [ ] 빈 상태 처리 (게시물 없음, 댓글 없음 등)

### 성능 최적화
- [ ] 이미지 최적화 (Next.js Image 컴포넌트)
- [ ] 무한 스크롤 성능 개선
- [ ] API 응답 캐싱 고려

### 배포 준비
- [ ] 환경 변수 확인 (프로덕션)
- [ ] Vercel 배포 설정
- [ ] Supabase 프로덕션 환경 확인
- [ ] RLS 정책 검토 (프로덕션용)

---

## 📝 참고사항

### 1차 MVP 제외 기능
다음 기능들은 2차 확장에서 구현:
- ❌ 검색 (사용자, 해시태그)
- ❌ 탐색 페이지
- ❌ 릴스
- ❌ 메시지 (DM)
- ❌ 알림
- ❌ 스토리
- ❌ 동영상
- ❌ 이미지 여러 장
- ❌ 공유 버튼 (UI만 있음)
- ❌ 북마크 (UI만 있음)
- ❌ 프로필 편집 (Clerk 기본 사용)
- ❌ 팔로워/팔로잉 목록 모달

---

**마지막 업데이트**: 2025-01-27  
**기반 문서**: [PRD.md](./prd.md)
