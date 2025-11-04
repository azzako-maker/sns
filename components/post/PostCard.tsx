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

import { useState } from "react";
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
import { PostWithComments } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils/time";

interface PostCardProps {
  post: PostWithComments;
}

export default function PostCard({ post }: PostCardProps) {
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  console.group("PostCard 렌더링");
  console.log("게시물 ID:", post.id);
  console.log("사용자:", post.user.name);
  console.log("좋아요 수:", post.likes_count);
  console.log("댓글 수:", post.comments_count);
  console.groupEnd();

  // 캡션이 2줄 초과인지 확인 (대략적인 계산)
  const captionLines = post.caption ? post.caption.length / 30 : 0;
  const showExpandButton = captionLines > 2;

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
      <div className="relative aspect-square w-full bg-gray-100">
        <Image
          src={post.image_url}
          alt={post.caption || `${post.user.name}의 게시물`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 630px"
          loading="lazy"
        />
      </div>

      {/* 액션 버튼 영역 (48px) */}
      <div className="flex items-center justify-between px-4 py-3 h-[48px]">
        <div className="flex items-center gap-4">
          {/* 좋아요 버튼 */}
          <button
            type="button"
            className="text-[#262626] hover:opacity-70 transition-opacity"
            aria-label="좋아요"
          >
            <Heart className="w-6 h-6" />
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
        {post.likes_count > 0 && (
          <div className="font-instagram-bold text-[#262626] text-instagram-sm">
            좋아요 {post.likes_count.toLocaleString()}개
          </div>
        )}

        {/* 캡션 */}
        {post.caption && (
          <div className="text-instagram-sm text-[#262626]">
            <Link
              href={`/profile/${post.user.id}`}
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
        {post.comments && post.comments.length > 0 && (
          <div className="space-y-1">
            {/* 댓글 전체 보기 링크 */}
            {post.comments_count > 2 && (
              <Link
                href={`/post/${post.id}`}
                className="text-instagram-sm text-[#8E8E8E] hover:opacity-70 block"
              >
                댓글 {post.comments_count}개 모두 보기
              </Link>
            )}
            {/* 최신 댓글 2개 */}
            {post.comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="text-instagram-sm text-[#262626]">
                <Link
                  href={`/profile/${comment.user.id}`}
                  className="font-instagram-bold hover:opacity-70 inline-block mr-1"
                >
                  {comment.user.name}
                </Link>
                <span>{comment.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

