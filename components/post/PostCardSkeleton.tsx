/**
 * @file PostCardSkeleton.tsx
 * @description 게시물 카드 로딩 UI (Skeleton)
 *
 * PostCard와 동일한 레이아웃 구조를 가진 스켈레톤 UI
 * Shimmer 애니메이션 효과로 로딩 상태를 표시
 *
 * @dependencies
 * - Tailwind CSS: animate-pulse 클래스
 */

export default function PostCardSkeleton() {
  return (
    <div className="bg-white border border-[#DBDBDB] rounded-lg mb-4">
      {/* 헤더 영역 (60px) */}
      <div className="flex items-center justify-between px-4 py-3 h-[60px] border-b border-[#DBDBDB]">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 */}
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          {/* 사용자명 */}
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        {/* 메뉴 버튼 */}
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* 이미지 영역 */}
      <div className="aspect-square w-full bg-gray-200 animate-pulse" />

      {/* 액션 버튼 영역 (48px) */}
      <div className="flex items-center justify-between px-4 py-3 h-[48px]">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-4 pb-4 space-y-2">
        {/* 좋아요 수 */}
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        {/* 캡션 */}
        <div className="space-y-1">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
        </div>
        {/* 댓글 미리보기 */}
        <div className="space-y-1 pt-1">
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

