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
- [x] `components/layout/Sidebar.tsx` 컴포넌트
  - [x] Desktop: 244px 너비, 아이콘 + 텍스트
  - [x] Tablet: 72px 너비, 아이콘만
  - [x] Mobile: 숨김
  - [x] 메뉴 항목: 홈, 검색, 만들기, 프로필
  - [x] Hover 효과 및 Active 상태 스타일
  - [x] Clerk 인증 상태 연동 (useUser, SignedIn/SignedOut)
  - [x] 경로별 Active 상태 표시 (usePathname)
- [x] `components/layout/Header.tsx` 컴포넌트 (Mobile)
  - [x] 높이 60px
  - [x] 로고 + 알림/DM/프로필 아이콘
  - [x] 고정 위치 (상단)
  - [x] Clerk UserButton 통합
- [x] `components/layout/BottomNav.tsx` 컴포넌트 (Mobile)
  - [x] 높이 50px
  - [x] 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
  - [x] 고정 위치 (하단)
  - [x] Active 상태 표시
  - [x] 인증 필요 메뉴 처리 (SignedIn/SignedOut)
- [x] `app/(main)/layout.tsx` 생성
  - [x] Sidebar 통합 (Desktop/Tablet)
  - [x] Header/BottomNav 통합 (Mobile)
  - [x] 반응형 레이아웃 처리
  - [x] Main Content 영역 마진/패딩 설정
- [x] RootLayout 수정
  - [x] Navbar 제거
  - [x] (main) 그룹 구조로 변경
- [x] 기존 페이지 구조 정리
  - [x] `app/page.tsx` 삭제 (중복 제거)
  - [x] `app/(main)/page.tsx` 생성 (기존 페이지 이동)

### 1-3. 홈 피드 - 게시물 목록
- [x] TypeScript 타입 정의 (`lib/types.ts`)
  - [x] Post, PostWithUser, PostWithStats, PostWithComments 타입
  - [x] Comment, CommentWithUser 타입
  - [x] PostsResponse API 응답 타입
- [x] 상대 시간 표시 유틸리티 (`lib/utils/time.ts`)
  - [x] formatRelativeTime() 함수 구현
  - [x] "방금 전", "N분 전", "N시간 전", "N일 전" 형식
  - [x] 7일 이상은 "YYYY-MM-DD" 형식
- [x] `components/post/PostCard.tsx` 컴포넌트
  - [x] 헤더 영역 (60px)
    - [x] 프로필 이미지 (32px 원형, 기본 아바타)
    - [x] 사용자명 (Bold, 프로필 링크)
    - [x] 시간 표시 (상대 시간, 작고 회색)
    - [x] ⋯ 메뉴 버튼 (우측, UI만)
  - [x] 이미지 영역
    - [x] 1:1 정사각형 비율 (aspect-square)
    - [x] Next.js Image 컴포넌트 최적화
    - [x] 더블탭 좋아요 기능 (모바일) - 1-4 단계에서 기능 구현 예정
  - [x] 액션 버튼 영역 (48px)
    - [x] ❤️ 좋아요 버튼 (UI만, 1-4 단계에서 기능 구현)
    - [x] 💬 댓글 버튼 (UI만, 2-3 단계에서 기능 구현)
    - [x] ✈️ 공유 버튼 (UI만, 기능 제외)
    - [x] 🔖 북마크 버튼 (UI만, 기능 제외)
  - [x] 컨텐츠 영역
    - [x] 좋아요 수 표시 (Bold, "좋아요 N개" 형식)
    - [x] 캡션 표시 (사용자명 Bold + 내용)
    - [x] 2줄 초과 시 "... 더 보기" 토글
    - [x] 댓글 미리보기 (최신 2개)
    - [x] "댓글 N개 모두 보기" 링크
- [x] `components/post/PostCardSkeleton.tsx` 로딩 UI
  - [x] Skeleton UI 구현 (PostCard와 동일한 레이아웃)
  - [x] Shimmer 애니메이션 효과 (Tailwind animate-pulse)
- [x] `components/post/PostFeed.tsx` 컴포넌트
  - [x] 게시물 목록 렌더링
  - [x] 로딩 상태 처리 (PostCardSkeleton 표시)
  - [x] 에러 상태 처리 (에러 메시지 + 재시도 버튼)
  - [x] 빈 상태 처리 (게시물 없음 메시지)
  - [x] 데이터 fetching (useEffect)
- [x] `app/(main)/page.tsx` 홈 피드 페이지
  - [x] PostFeed 컴포넌트 통합
  - [x] 배경색 #FAFAFA 적용
  - [x] 최대 너비 630px 중앙 정렬
  - [x] 반응형 패딩 설정
- [x] `app/api/posts/route.ts` GET API
  - [x] 페이지네이션 구현 (10개씩, page 쿼리 파라미터)
  - [x] 시간 역순 정렬 (created_at DESC)
  - [x] 사용자 정보 JOIN (users 테이블)
  - [x] 통계 정보 포함 (post_stats 뷰 활용)
  - [x] 댓글 미리보기 (최신 2개)
  - [x] hasMore 플래그 반환
- [x] Next.js 이미지 설정
  - [x] Supabase Storage 도메인 추가 (next.config.ts)
  - [x] 이미지 최적화 설정

### 1-4. 홈 피드 - 좋아요 기능
- [x] `likes` 테이블 확인
  - [x] `supabase/migrations/sns.sql`에 이미 정의되어 있음
  - [x] `user_id` (UUID, FK to users)
  - [x] `post_id` (UUID, FK to posts)
  - [x] `created_at` (TIMESTAMPTZ)
  - [x] UNIQUE 제약조건 (user_id, post_id)
  - [x] 추가 마이그레이션 불필요 (이미 완료)
- [x] 타입 정의 업데이트 (`lib/types.ts`)
  - [x] `PostWithComments`에 `isLiked?: boolean` 필드 추가
- [x] `app/api/likes/route.ts` API
  - [x] POST: 좋아요 추가 (중복 방지, UNIQUE 제약조건 처리)
  - [x] DELETE: 좋아요 제거
  - [x] Clerk 인증 확인
  - [x] users 테이블에서 clerk_id로 user_id 조회
  - [x] 에러 핸들링 (401, 404, 500)
  - [x] 로깅 추가
- [x] 게시물 목록 API 수정 (`app/api/posts/route.ts`)
  - [x] 현재 사용자 좋아요 상태 조회 (isLiked)
  - [x] 각 게시물에 isLiked 필드 포함
- [x] 좋아요 상태 관리 Hook (`hooks/use-like.ts`)
  - [x] useLike Hook 생성
  - [x] Optimistic update (즉시 UI 업데이트)
  - [x] API 실패 시 롤백 처리
  - [x] 로딩 및 에러 상태 관리
- [x] 좋아요 버튼 기능 구현 (`components/post/PostCard.tsx`)
  - [x] 클릭 시 좋아요 토글 (useLike Hook 사용)
  - [x] 빈 하트 ↔ 빨간 하트 전환 (fill 속성)
  - [x] 애니메이션: scale(1.3) → scale(1) (0.15초)
  - [x] 좋아요 수 실시간 업데이트 (optimistic update)
  - [x] 클릭 애니메이션 상태 관리
- [x] 더블탭 좋아요 기능 (모바일)
  - [x] 이미지 더블탭 감지 (onTouchEnd, onDoubleClick)
  - [x] 300ms 이내 탭 간격으로 더블탭 판단
  - [x] 큰 하트 등장 (fade in, 80-100px 크기)
  - [x] 1초 후 사라짐 (fade out)
  - [x] 좋아요 상태 업데이트 (좋아요 안 한 경우만)
  - [x] CSS 애니메이션 추가 (fadeInOut 키프레임)

---

## 2️⃣ 2단계: 게시물 작성 & 댓글 기능

### 2-1. 게시물 작성 모달
- [x] `components/post/CreatePostModal.tsx` 컴포넌트
  - [x] Dialog 기반 모달 (shadcn/ui Dialog 사용)
  - [x] 모달 크기: 최대 너비 600px (Instagram 스타일)
  - [x] 반응형 레이아웃 (Desktop: 좌우 분할, Mobile: 세로 스택)
  - [x] 헤더: "새 게시물 만들기" + 닫기 버튼
  - [x] 이미지 업로드 영역
    - [x] 파일 선택 버튼 ("컴퓨터에서 선택")
    - [x] hidden input (accept="image/*")
    - [x] 드래그 앤 드롭 안내 텍스트 (UI만)
  - [x] 이미지 미리보기 UI
    - [x] Object URL 사용 (메모리 효율적)
    - [x] 1:1 정사각형 비율 유지 (aspect-square)
    - [x] Next.js Image 컴포넌트 최적화
    - [x] 이미지 교체 버튼 (X 아이콘)
  - [x] 캡션 입력 필드
    - [x] Textarea 컴포넌트 사용
    - [x] 최대 2,200자 제한
    - [x] 글자 수 카운터 (N/2,200)
    - [x] 색상 변화 (2,000자 이상: 주황색, 2,200자: 빨간색)
    - [x] 플레이스홀더: "문구 입력..."
  - [x] 파일 검증 로직
    - [x] 파일 크기 검증 (최대 5MB)
    - [x] 이미지 형식 검증 (JPG, PNG, WebP)
    - [x] 사용자 친화적 에러 메시지
    - [x] 검증 실패 시 파일 입력 초기화
  - [x] 상태 관리
    - [x] selectedFile, previewUrl, caption, isUploading, error 상태
    - [x] 모달 닫을 때 상태 초기화
    - [x] Object URL 메모리 정리 (useEffect cleanup)
  - [x] 유효성 검사
    - [x] 이미지 필수 (없으면 "공유" 버튼 비활성화)
    - [x] 업로드 중 버튼 비활성화 ("공유 중..." 텍스트)
  - [x] 에러 처리
    - [x] 에러 메시지 표시 영역
    - [x] 파일 크기 초과, 형식 오류, 업로드 실패 처리
  - [x] 접근성
    - [x] ARIA 레이블 추가
    - [x] aria-live="polite" 에러 메시지
    - [x] 키보드 네비게이션 지원
- [x] Sidebar/BottomNav와 모달 연동
  - [x] `app/(main)/layout.tsx`에서 모달 상태 관리
  - [x] Sidebar "만들기" 버튼에 onClick 핸들러 추가
  - [x] BottomNav "만들기" 버튼에 onClick 핸들러 추가
  - [x] 모달 열기/닫기 기능 연결
  - [x] onSuccess 콜백 추가 (게시물 작성 성공 시)

### 2-2. 게시물 작성 - 이미지 업로드
- [x] Supabase Storage 버킷 확인 (`uploads`)
  - [x] setup_storage.sql 마이그레이션 파일 확인
  - [x] Service Role 클라이언트로 RLS 우회 업로드 구현
- [x] `app/api/posts/route.ts` POST API
  - [x] Clerk 인증 확인 (auth() 사용)
  - [x] FormData에서 파일 및 캡션 추출
  - [x] 파일 업로드 처리
  - [x] 이미지 경로 저장 (Public URL)
  - [x] 캡션 저장 (최대 2,200자)
  - [x] 사용자 ID 연결 (clerk_id로 users 테이블 조회)
  - [x] 에러 처리 및 롤백 로직 (업로드 실패 시 Storage 파일 삭제)
- [x] 파일 업로드 로직
  - [x] 파일 검증 (크기 5MB, 형식 JPG/PNG/WebP)
  - [x] 파일명 생성: `{clerk_user_id}/{timestamp}-{random}.{ext}`
  - [x] Storage 업로드 (Service Role 클라이언트 사용)
  - [x] Public URL 생성 (getPublicUrl)
  - [x] 데이터베이스 저장 (posts 테이블)
- [x] CreatePostModal API 연결
  - [x] handleSubmit 함수에서 FormData 생성 및 API 호출
  - [x] 성공/실패 처리 및 에러 메시지 표시
  - [x] 로딩 상태 관리
  - [x] 상세 로깅 추가

### 2-3. 댓글 기능 - UI & 작성
- [x] `comments` 테이블 마이그레이션 생성
  - [x] `id` (UUID, PK)
  - [x] `post_id` (UUID, FK to posts)
  - [x] `user_id` (UUID, FK to users)
  - [x] `content` (TEXT)
  - [x] `created_at` (TIMESTAMPTZ)
  - [x] 이미 sns.sql에 정의되어 있음 (추가 마이그레이션 불필요)
- [x] `components/comment/CommentList.tsx` 컴포넌트
  - [x] 댓글 목록 렌더링
  - [x] 사용자명 (Bold) + 내용 표시
  - [x] 상대 시간 표시 (formatRelativeTime)
  - [x] 프로필 링크 연결
  - [x] showAll prop (전체 댓글 / 최신 2개)
  - [x] 빈 상태 처리
- [x] `components/comment/CommentForm.tsx` 컴포넌트
  - [x] "댓글 달기..." 입력창 (Instagram 스타일)
  - [x] Enter 키 또는 "게시" 버튼으로 제출
  - [x] 빈 댓글 방지
  - [x] 최대 2,200자 제한
  - [x] 로딩 상태 표시 ("게시 중...")
  - [x] 에러 메시지 표시
  - [x] 인증 확인 (로그인하지 않은 경우 비활성화)
  - [x] 성공 시 입력창 초기화 및 부모 컴포넌트에 알림
- [x] `app/api/comments/route.ts` POST API
  - [x] 댓글 작성
  - [x] Clerk 인증 확인 (auth())
  - [x] users 테이블에서 clerk_id로 user_id 조회
  - [x] 게시물 존재 여부 확인
  - [x] 입력 검증 (빈 문자열, 2,200자 제한)
  - [x] comments 테이블에 저장
  - [x] 사용자 정보를 포함한 댓글 반환
  - [x] 에러 처리 (401, 404, 500)
  - [x] 상세 로깅 추가
- [x] PostCard에 댓글 기능 통합
  - [x] 댓글 로컬 상태 관리 (localComments, localCommentsCount)
  - [x] CommentList 컴포넌트 통합 (최신 2개 표시)
  - [x] CommentForm 컴포넌트 통합 (하단)
  - [x] handleCommentAdded 핸들러 (Optimistic update)
  - [x] 새 댓글 추가 시 로컬 상태 업데이트
  - [x] 댓글 수 업데이트
  - [x] "댓글 N개 모두 보기" 링크 (2개 초과 시)

### 2-4. 댓글 기능 - 삭제 & 무한스크롤
- [x] `app/api/comments/[commentId]/route.ts` DELETE API
  - [x] 댓글 삭제
  - [x] 본인만 삭제 가능 (권한 확인)
  - [x] Clerk 인증 확인
  - [x] users 테이블에서 clerk_id로 user_id 조회
  - [x] 댓글 소유자 확인 (403 에러)
  - [x] 에러 처리 (401, 403, 404, 500)
  - [x] 상세 로깅 추가
- [x] 댓글 삭제 버튼 UI (`CommentList.tsx`)
  - [x] Trash2 아이콘 사용 (lucide-react)
  - [x] 본인 댓글에만 표시 (Clerk ID 비교)
  - [x] hover 시에만 표시 (opacity-0 → opacity-100)
  - [x] 삭제 확인 다이얼로그 (confirm)
  - [x] 삭제 중 로딩 상태 (버튼 비활성화)
  - [x] onCommentDeleted 콜백으로 부모에 알림
- [x] PostCard에 댓글 삭제 처리
  - [x] handleCommentDeleted 핸들러 추가
  - [x] Optimistic update (로컬 상태에서 즉시 제거)
  - [x] 댓글 수 업데이트
- [x] CommentWithUser 타입에 clerk_id 추가
  - [x] lib/types.ts 수정
  - [x] app/api/posts/route.ts에서 clerk_id 포함
  - [x] app/api/comments/route.ts에서 clerk_id 포함
- [x] PostFeed 무한 스크롤 구현
  - [x] Intersection Observer 사용
  - [x] observerTarget ref로 하단 감지
  - [x] rootMargin: 100px (하단 100px 전에 트리거)
  - [x] 하단 도달 시 다음 페이지 로드 (page + 1)
  - [x] isLoadingMore 상태로 중복 로딩 방지
  - [x] 로딩 스켈레톤 표시 (2개)
  - [x] "스크롤하여 더 보기..." 메시지
  - [x] "모든 게시물을 불러왔습니다." 메시지
  - [x] useCallback으로 함수 최적화
  - [x] 상세 로깅 추가

---

## 3️⃣ 3단계: 프로필 페이지 & 팔로우 기능

### 3-1. 프로필 페이지 - 기본 정보
- [x] `app/(main)/profile/[userId]/page.tsx` 동적 라우트
- [x] `components/profile/ProfileHeader.tsx` 컴포넌트
  - [x] 프로필 이미지 (150px Desktop / 90px Mobile, 원형)
  - [x] 사용자명 표시
  - [x] 통계: 게시물 수, 팔로워 수, 팔로잉 수
  - [x] "팔로우" 또는 "팔로잉" 버튼 (다른 사용자 프로필일 때)
  - [x] 본인 프로필일 때: "프로필 편집" 버튼 (1차 제외)
  - [x] Fullname 표시 (Clerk에서 가져오기)
  - [x] Bio 표시 (향후 확장)
- [x] `app/api/users/[userId]/route.ts` GET API
  - [x] 사용자 정보 조회
  - [x] 게시물 수, 팔로워 수, 팔로잉 수 계산 (user_stats 뷰 사용)
  - [x] 팔로우 상태 확인

### 3-2. 프로필 페이지 - 게시물 그리드
- [x] `components/profile/PostGrid.tsx` 컴포넌트
  - [x] 3열 그리드 레이아웃 (반응형)
  - [x] 1:1 정사각형 이미지 썸네일
  - [x] Hover 시 좋아요/댓글 수 표시
  - [x] 클릭 시 게시물 상세 페이지로 이동 (링크 준비, 3-4 단계에서 구현)
- [x] `app/api/posts/route.ts` GET API 수정
  - [x] `userId` 쿼리 파라미터 추가 (Clerk ID)
  - [x] 특정 사용자 게시물 필터링
  - [x] 사용자 필터링 시 페이지네이션도 정확히 동작

### 3-3. 팔로우 기능
- [x] `follows` 테이블 마이그레이션 생성
  - [x] `follower_id` (UUID, FK to users)
  - [x] `following_id` (UUID, FK to users)
  - [x] `created_at` (TIMESTAMPTZ)
  - [x] UNIQUE 제약조건 (follower_id, following_id)
  - [x] 자기 자신 팔로우 방지 체크 (이미 sns.sql에 정의되어 있음)
- [x] `app/api/follows/route.ts` API
  - [x] POST: 팔로우 추가
  - [x] DELETE: 언팔로우
  - [x] Clerk 인증 확인
  - [x] Clerk ID → Supabase user_id 변환
  - [x] 중복 팔로우 방지 (409 에러)
  - [x] 자기 자신 팔로우 방지 (400 에러)
  - [x] 상세 로깅 추가
- [x] `hooks/use-follow.ts` Hook 생성
  - [x] Optimistic update (즉시 UI 업데이트)
  - [x] API 실패 시 롤백 처리
  - [x] 팔로워 수 업데이트
  - [x] 로딩 및 에러 상태 관리
  - [x] 성공 콜백 지원
- [x] 팔로우/언팔로우 버튼 구현
  - [x] 미팔로우: "팔로우" 버튼 (파란색 #0095f6)
  - [x] 팔로우 중: "팔로잉" 버튼 (회색)
  - [x] Hover 시: "언팔로우" 표시 (빨간 테두리)
  - [x] 클릭 시 즉시 API 호출 → UI 업데이트
  - [x] 로딩 중 버튼 비활성화
  - [x] ProfileHeader에 통합
  - [x] 프로필 업데이트 콜백 (팔로워 수 실시간 업데이트)

### 3-4. 게시물 상세 모달/페이지
- [x] `components/post/PostModal.tsx` 컴포넌트 (Desktop)
  - [x] 모달 형태 (shadcn Dialog 사용)
  - [x] 좌측: 이미지 (50%)
  - [x] 우측: 댓글 영역 (50%)
    - [x] 헤더 (사용자명, ⋯ 메뉴)
    - [x] 댓글 목록 (스크롤 가능, 전체 댓글 표시)
    - [x] 액션 버튼 (좋아요, 댓글, 공유, 북마크)
    - [x] 좋아요 수
    - [x] 댓글 입력창
    - [x] 게시물 삭제 기능 (본인 게시물만)
- [x] `app/(main)/post/[postId]/page.tsx` (Mobile)
  - [x] 전체 페이지 형태
  - [x] 게시물 상세 정보 표시 (PostCard 재사용)
  - [x] 로딩 및 에러 처리
- [x] `app/api/posts/[postId]/route.ts` GET API
  - [x] 게시물 상세 정보 조회
  - [x] 전체 댓글 목록 포함 (최신 순)
  - [x] 좋아요 상태 확인
  - [x] 사용자 정보 포함
- [x] `app/api/posts/[postId]/route.ts` DELETE API
  - [x] 게시물 삭제
  - [x] 본인 게시물만 삭제 가능 (권한 확인)
  - [x] Storage 파일 삭제 (롤백)
  - [x] 상세 로깅 추가
- [x] PostGrid와 PostCard에 링크 연결
  - [x] PostGrid: `/post/[postId]` 링크 (이미 구현됨)
  - [x] PostCard: 이미지 클릭 시 `/post/[postId]` 이동
  - [x] 프로필 링크 수정 (clerk_id 사용)

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

**마지막 업데이트**: 2025-11-04  
**기반 문서**: [PRD.md](./prd.md)

---

## 완료된 작업 요약

### 2025-11-04
- ✅ 1-2 레이아웃 구조 완료 (Sidebar, Header, BottomNav, MainLayout)
- ✅ 1-3 홈 피드 - 게시물 목록 완료
  - TypeScript 타입 정의 및 유틸리티 함수
  - PostCard, PostCardSkeleton, PostFeed 컴포넌트
  - 게시물 목록 API 구현
  - 홈 피드 페이지 통합
- ✅ 1-4 홈 피드 - 좋아요 기능 완료
  - 좋아요 API (POST/DELETE) 구현
  - useLike Hook 생성 (Optimistic update)
  - 좋아요 버튼 기능 및 클릭 애니메이션
  - 더블탭 좋아요 기능 (모바일)
  - 게시물 목록 API에 좋아요 상태 포함
- ✅ 2-1 게시물 작성 모달 완료
  - CreatePostModal 컴포넌트 생성
  - 이미지 업로드 및 미리보기 UI
  - 파일 검증 (크기, 형식)
  - 캡션 입력 필드 (2,200자 제한)
  - Sidebar/BottomNav와 모달 연동
  - 상태 관리 및 메모리 정리
- ✅ 2-2 게시물 작성 - 이미지 업로드 완료
  - POST /api/posts API 구현
  - Supabase Storage 업로드 (Service Role 클라이언트)
  - Public URL 생성 및 posts 테이블 저장
  - CreatePostModal API 연결
  - 파일 검증 (서버 측 재검증)
  - 에러 처리 및 롤백 로직
  - 상세 로깅 추가
- ✅ 2-3 댓글 기능 - UI & 작성 완료
  - POST /api/comments API 구현
  - CommentForm 컴포넌트 생성 (Instagram 스타일 입력창)
  - CommentList 컴포넌트 생성 (사용자명 + 내용 + 시간)
  - PostCard에 댓글 기능 통합
  - Optimistic update (로컬 상태 관리)
  - 댓글 작성 성공 시 즉시 UI 업데이트
  - 상세 로깅 추가
- ✅ 2-4 댓글 기능 - 삭제 & 무한스크롤 완료
  - DELETE /api/comments/[commentId] API 구현
  - CommentList에 삭제 버튼 추가 (본인 댓글만, hover 시 표시)
  - PostCard에서 댓글 삭제 처리 (Optimistic update)
  - CommentWithUser 타입에 clerk_id 추가
  - PostFeed 무한 스크롤 구현 (Intersection Observer)
  - 하단 100px 전에 자동 로딩
  - 로딩 스켈레톤 및 완료 메시지 표시
  - 상세 로깅 추가
- ✅ 3-1 프로필 페이지 - 기본 정보 완료
  - GET /api/users/[userId] API 구현
  - user_stats 뷰를 사용한 통계 정보 조회
  - 팔로우 상태 및 본인 프로필 여부 확인
  - ProfileHeader 컴포넌트 생성 (Instagram 스타일)
  - 프로필 이미지 (Clerk 이미지 또는 기본 아바타)
  - 통계 정보 표시 (게시물, 팔로워, 팔로잉)
  - 팔로우/팔로잉 버튼 (다른 사용자 프로필)
  - 프로필 편집 버튼 (본인 프로필, 1차 제외로 비활성화)
  - Fullname 표시 (Clerk에서 가져오기)
  - 동적 라우트 페이지 구현 (/profile/[userId])
  - 로딩 스켈레톤 및 에러 처리
  - 상세 로깅 추가
- ✅ 3-2 프로필 페이지 - 게시물 그리드 완료
  - PostGrid 컴포넌트 생성 (3열 그리드 레이아웃)
  - 1:1 정사각형 이미지 썸네일 (반응형)
  - Hover 시 좋아요/댓글 수 표시 (오버레이)
  - 클릭 시 게시물 상세 페이지 링크 (3-4 단계에서 구현 예정)
  - GET /api/posts API에 userId 파라미터 추가
  - 특정 사용자 게시물 필터링 (Clerk ID → Supabase user_id 변환)
  - 사용자 필터링 시 페이지네이션 정확히 동작
  - 로딩 스켈레톤 및 빈 상태 처리
  - "더 보기" 버튼 (무한 스크롤 대안)
  - 상세 로깅 추가
- ✅ 3-3 팔로우 기능 완료
  - POST /api/follows API 구현 (팔로우 추가)
  - DELETE /api/follows API 구현 (언팔로우)
  - Clerk 인증 및 사용자 ID 변환
  - 중복 팔로우 방지 (UNIQUE 제약조건)
  - 자기 자신 팔로우 방지
  - useFollow Hook 생성 (optimistic update)
  - ProfileHeader에 팔로우 버튼 통합
  - 미팔로우: "팔로우" 버튼 (파란색 #0095f6)
  - 팔로우 중: "팔로잉" 버튼 (회색)
  - Hover 시 "언팔로우" 표시 (빨간 테두리)
  - 팔로워 수 실시간 업데이트
  - 로딩 상태 및 에러 처리
  - 상세 로깅 추가
