"use client";

/**
 * @file PostFeed.tsx
 * @description 게시물 피드 컴포넌트
 *
 * 게시물 목록을 표시하고 관리하는 컴포넌트:
 * - 데이터 fetching
 * - 로딩 상태 처리
 * - 에러 상태 처리
 * - 빈 상태 처리
 *
 * @dependencies
 * - components/post/PostCard: 게시물 카드
 * - components/post/PostCardSkeleton: 로딩 UI
 * - app/api/posts: 게시물 목록 API
 */

import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import { PostWithComments, PostsResponse } from "@/lib/types";

export default function PostFeed() {
  const [posts, setPosts] = useState<PostWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  console.group("PostFeed 렌더링");
  console.log("로딩 상태:", loading);
  console.log("게시물 수:", posts.length);
  console.log("페이지:", page);
  console.log("더 불러올 게시물:", hasMore);
  console.groupEnd();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("게시물 목록 API 호출 시작 - 페이지:", page);

        const response = await fetch(`/api/posts?page=${page}`);
        if (!response.ok) {
          throw new Error("게시물을 불러오는데 실패했습니다.");
        }

        const data: PostsResponse = await response.json();
        console.log("API 응답:", data);

        if (page === 1) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }

        setHasMore(data.hasMore);
      } catch (err) {
        console.error("게시물 목록 로딩 에러:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  // 로딩 상태
  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // 에러 상태
  if (error && posts.length === 0) {
    return (
      <div className="bg-white border border-[#DBDBDB] rounded-lg p-8 text-center">
        <p className="text-[#262626] mb-4">{error}</p>
        <button
          type="button"
          onClick={() => {
            setPage(1);
            setError(null);
          }}
          className="px-4 py-2 bg-[#0095f6] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 빈 상태
  if (!loading && posts.length === 0) {
    return (
      <div className="bg-white border border-[#DBDBDB] rounded-lg p-8 text-center">
        <p className="text-[#262626] text-instagram-base">
          아직 게시물이 없습니다.
        </p>
        <p className="text-[#8E8E8E] text-instagram-sm mt-2">
          첫 번째 게시물을 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {loading && posts.length > 0 && (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

