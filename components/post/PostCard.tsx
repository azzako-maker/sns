"use client";

/**
 * @file PostCard.tsx
 * @description 게시물 카드 컴포넌트
 *
 * Instagram 스타일의 게시물 카드 UI:
 * - 헤더 (프로필, 사용자명, 시간, 메뉴)
 * - 이미지 (1:1 정사각형)
 * - 액션 버튼 (좋아요, 댓글, 공유, 북마크)
 * - 컨텐츠 (좋아요 수, 캡션, 댓글 미리보기)
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - lucide-react: 아이콘
 * - lib/types: 타입 정의
 * - lib/utils/time: 상대 시간 표시
 */

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  User,
} from "lucide-react";
import { PostWithComments, CommentWithUser } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils/time";
import { useLike } from "@/hooks/use-like";
import CommentForm from "@/components/comment/CommentForm";
import CommentList from "@/components/comment/CommentList";

interface PostCardProps {
  post: PostWithComments;
}

export default function PostCard({ post }: PostCardProps) {
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const lastTapRef = useRef(0);

  // 댓글 로컬 상태 관리 (Optimistic update)
  const [localComments, setLocalComments] = useState<CommentWithUser[]>(
    post.comments || []
  );
  const [localCommentsCount, setLocalCommentsCount] = useState(
    post.comments_count
  );

  // 좋아요 Hook 사용
  const { isLiked, likesCount, toggleLike, isLoading } = useLike({
    postId: post.id,
    initialLiked: post.isLiked || false,
    initialCount: post.likes_count,
  });

  console.group("PostCard 렌더링");
  console.log("게시물 ID:", post.id);
  console.log("사용자:", post.user.name);
  console.log("좋아요 수:", likesCount);
  console.log("좋아요 상태:", isLiked);
  console.log("댓글 수:", localCommentsCount);
  console.log("로컬 댓글 배열 길이:", localComments.length);
  console.groupEnd();

  // 캡션이 2줄 초과인지 확인 (대략적인 계산)
  const captionLines = post.caption ? post.caption.length / 30 : 0;
  const showExpandButton = captionLines > 2;

  // 좋아요 버튼 클릭 핸들러
  const handleLikeClick = async () => {
    // 클릭 애니메이션 트리거
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);

    // 좋아요 토글
    await toggleLike();
  };

  // 더블탭 감지 (모바일)
  const handleDoubleTap = (e: React.TouchEvent | React.MouseEvent) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;

    if (tapLength < 300 && tapLength > 0) {
      // 더블탭 감지
      e.preventDefault();
      if (!isLiked) {
        toggleLike();
        // 큰 하트 애니메이션 표시
        setShowDoubleTapHeart(true);
        setTimeout(() => setShowDoubleTapHeart(false), 1000);
      }
    }

    lastTapRef.current = currentTime;
  };

  // 댓글 추가 핸들러 (Optimistic update)
  const handleCommentAdded = (newComment: CommentWithUser) => {
    console.group("💬 새 댓글 추가");
    console.log("새 댓글:", newComment);

    // 로컬 상태 업데이트 (최신 댓글이 맨 위로)
    setLocalComments((prev) => [newComment, ...prev]);
    setLocalCommentsCount((prev) => prev + 1);

    console.log("✅ 로컬 상태 업데이트 완료");
    console.groupEnd();
  };

  // 댓글 삭제 핸들러 (Optimistic update)
  const handleCommentDeleted = (commentId: string) => {
    console.group("🗑️ 댓글 삭제 처리");
    console.log("삭제할 commentId:", commentId);

    // 로컬 상태에서 댓글 제거
    setLocalComments((prev) => prev.filter((c) => c.id !== commentId));
    setLocalCommentsCount((prev) => Math.max(0, prev - 1));

    console.log("✅ 로컬 상태 업데이트 완료");
    console.groupEnd();
  };

  return (
    <article className="bg-white border border-[#DBDBDB] rounded-lg mb-4">
      {/* 헤더 영역 (60px) */}
      <header className="flex items-center justify-between px-4 py-3 h-[60px] border-b border-[#DBDBDB]">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 - Clerk 프로필 이미지 또는 기본 아바타 */}
          <Link href={`/profile/${post.user.id}`} className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <User className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
          {/* 사용자명 */}
          <Link
            href={`/profile/${post.user.id}`}
            className="font-instagram-bold text-[#262626] hover:opacity-70 transition-opacity"
          >
            {post.user.name}
          </Link>
          {/* 시간 표시 */}
          <span className="text-instagram-xs text-[#8E8E8E]">
            {formatRelativeTime(post.created_at)}
          </span>
        </div>
        {/* 메뉴 버튼 */}
        <button
          type="button"
          className="text-[#262626] hover:opacity-70 transition-opacity"
          aria-label="더보기"
        >
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </header>

      {/* 이미지 영역 */}
      <div
        className="relative aspect-square w-full bg-gray-100 cursor-pointer select-none"
        onTouchEnd={handleDoubleTap}
        onDoubleClick={handleDoubleTap}
        onClick={() => {
          // 게시물 상세 페이지로 이동
          window.location.href = `/post/${post.id}`;
        }}
      >
        <Image
          src={post.image_url}
          alt={post.caption || `${post.user.name}의 게시물`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 630px"
          loading="lazy"
        />
        {/* 더블탭 큰 하트 애니메이션 */}
        {showDoubleTapHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Heart
              className="w-20 h-20 text-[#ED4956] fill-[#ED4956]"
              style={{
                animation: "fadeInOut 1s ease-in-out",
              }}
            />
          </div>
        )}
      </div>

      {/* 액션 버튼 영역 (48px) */}
      <div className="flex items-center justify-between px-4 py-3 h-[48px]">
        <div className="flex items-center gap-4">
          {/* 좋아요 버튼 */}
          <button
            type="button"
            onClick={handleLikeClick}
            disabled={isLoading}
            className={`transition-all duration-150 ${
              isLiked
                ? "text-[#ED4956]"
                : "text-[#262626] hover:opacity-70"
            } ${isAnimating ? "scale-125" : "scale-100"}`}
            aria-label={isLiked ? "좋아요 취소" : "좋아요"}
          >
            <Heart
              className={`w-6 h-6 ${isLiked ? "fill-[#ED4956]" : ""}`}
            />
          </button>
          {/* 댓글 버튼 */}
          <button
            type="button"
            className="text-[#262626] hover:opacity-70 transition-opacity"
            aria-label="댓글"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          {/* 공유 버튼 (UI만) */}
          <button
            type="button"
            className="text-[#262626] hover:opacity-70 transition-opacity"
            aria-label="공유"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
        {/* 북마크 버튼 */}
        <button
          type="button"
          className="text-[#262626] hover:opacity-70 transition-opacity"
          aria-label="저장"
        >
          <Bookmark className="w-6 h-6" />
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-4 pb-4 space-y-2">
        {/* 좋아요 수 */}
        {likesCount > 0 && (
          <div className="font-instagram-bold text-[#262626] text-instagram-sm">
            좋아요 {likesCount.toLocaleString()}개
          </div>
        )}

        {/* 캡션 */}
        {post.caption && (
          <div className="text-instagram-sm text-[#262626]">
              <Link
                href={`/profile/${post.user.clerk_id}`}
                className="font-instagram-bold hover:opacity-70 inline-block mr-1"
              >
                {post.user.name}
              </Link>
            <span className={isCaptionExpanded ? "" : "line-clamp-2"}>
              {post.caption}
            </span>
            {showExpandButton && (
              <button
                type="button"
                onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                className="text-[#8E8E8E] hover:opacity-70 ml-1"
              >
                {isCaptionExpanded ? "접기" : "... 더 보기"}
              </button>
            )}
          </div>
        )}

        {/* 댓글 미리보기 */}
        {localComments.length > 0 && (
          <div className="space-y-1">
            {/* 댓글 전체 보기 링크 */}
            {localCommentsCount > 2 && (
              <Link
                href={`/post/${post.id}`}
                className="text-instagram-sm text-[#8E8E8E] hover:opacity-70 block"
              >
                댓글 {localCommentsCount}개 모두 보기
              </Link>
            )}
            {/* 댓글 목록 (최신 2개만 표시) */}
            <CommentList
              comments={localComments}
              showAll={false}
              onCommentDeleted={handleCommentDeleted}
            />
          </div>
        )}
      </div>

      {/* 댓글 입력 폼 */}
      <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
    </article>
  );
}

