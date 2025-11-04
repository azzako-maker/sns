/**
 * @file PostGrid.tsx
 * @description 프로필 페이지 게시물 그리드 컴포넌트
 *
 * Instagram 스타일 3열 그리드 레이아웃:
 * - 3열 고정 (반응형)
 * - 1:1 정사각형 이미지 썸네일
 * - Hover 시 좋아요/댓글 수 표시
 * - 클릭 시 게시물 상세 페이지로 이동 (3-4 단계에서 구현)
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - next/link: 게시물 상세 링크
 * - lucide-react: 아이콘 (Heart, MessageCircle)
 * - lib/types: 타입 정의
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { PostWithStats } from "@/lib/types";

interface PostGridProps {
  userId: string; // Clerk ID (clerk_id)
}

// PostGridItem은 PostWithStats를 사용 (id, image_url 등 이미 포함됨)
type PostGridItem = PostWithStats;

export default function PostGrid({ userId }: PostGridProps) {
  const [posts, setPosts] = useState<PostGridItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  console.group("PostGrid 렌더링");
  console.log("userId (Clerk ID):", userId);
  console.log("로딩 상태:", loading);
  console.log("게시물 수:", posts.length);
  console.log("페이지:", page);
  console.log("더 불러올 게시물:", hasMore);
  console.groupEnd();

  useEffect(() => {
    async function fetchPosts() {
      if (!userId) {
        setError("사용자 ID가 없습니다.");
        setLoading(false);
        return;
      }

      try {
        console.log("게시물 목록 조회 시작:", { userId, page });
        setLoading(page === 1);
        setError(null);

        const params = new URLSearchParams({
          userId,
          page: page.toString(),
        });

        const response = await fetch(`/api/posts?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "게시물을 불러올 수 없습니다.");
        }

        const data = await response.json();
        console.log("게시물 목록 조회 성공:", {
          posts: data.posts.length,
          hasMore: data.hasMore,
          page: data.page,
        });

        if (page === 1) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }

        setHasMore(data.hasMore);
      } catch (err) {
        console.error("게시물 목록 조회 에러:", err);
        setError(
          err instanceof Error ? err.message : "게시물을 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [userId, page]);

  // 로딩 스켈레톤
  if (loading && page === 1) {
    return (
      <div className="w-full max-w-[935px] mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {[...Array(9)].map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="aspect-square bg-[#DBDBDB] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="w-full max-w-[935px] mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-[#8E8E8E] text-center">{error}</p>
          <button
            type="button"
            onClick={() => {
              setPage(1);
              setError(null);
            }}
            className="px-4 py-2 text-sm font-semibold text-[#0095f6] hover:opacity-70 transition-opacity"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 빈 상태
  if (!loading && posts.length === 0) {
    return (
      <div className="w-full max-w-[935px] mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="w-16 h-16 rounded-full border-2 border-[#262626] flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-[#262626]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-xl font-light text-[#262626]">게시물 없음</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[935px] mx-auto px-4 py-6">
      {/* 3열 그리드 */}
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {posts.map((post) => (
          <PostGridItem key={post.id} post={post} />
        ))}
      </div>

      {/* 무한 스크롤 (향후 구현 가능) */}
      {hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            className="text-sm text-[#0095f6] hover:opacity-70 transition-opacity"
          >
            더 보기
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 개별 게시물 그리드 아이템
 */
function PostGridItem({ post }: { post: PostGridItem }) {
  const [isHovered, setIsHovered] = useState(false);

  console.log("PostGridItem 렌더링:", {
    id: post.id,
    likes_count: post.likes_count,
    comments_count: post.comments_count,
  });

  // 게시물 상세 링크 (3-4 단계에서 구현 예정)
  // 일단 클릭 시 홈으로 이동 (임시)
  const postDetailUrl = `/post/${post.id}`;

  return (
    <Link
      href={postDetailUrl}
      className="relative aspect-square bg-gray-100 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 이미지 */}
      <Image
        src={post.image_url}
        alt={post.caption || `${post.user.name}의 게시물`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 33vw, 300px"
        loading="lazy"
      />

      {/* Hover 오버레이 */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-6 transition-opacity">
          <div className="flex items-center gap-2 text-white">
            <Heart className="w-6 h-6 fill-white" />
            <span className="font-semibold">{post.likes_count}</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <MessageCircle className="w-6 h-6 fill-white" />
            <span className="font-semibold">{post.comments_count}</span>
          </div>
        </div>
      )}
    </Link>
  );
}

