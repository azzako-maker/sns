"use client";

/**
 * @file PostFeed.tsx
 * @description 게시물 피드 컴포넌트
 *
 * 게시물 목록을 표시하고 관리하는 컴포넌트:
 * - 데이터 fetching
 * - 무한 스크롤 (Intersection Observer)
 * - 로딩 상태 처리
 * - 에러 상태 처리
 * - 빈 상태 처리
 *
 * @dependencies
 * - components/post/PostCard: 게시물 카드
 * - components/post/PostCardSkeleton: 로딩 UI
 * - app/api/posts: 게시물 목록 API
 */

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import { PostWithComments, PostsResponse } from "@/lib/types";

export default function PostFeed() {
  const [posts, setPosts] = useState<PostWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Intersection Observer를 위한 ref
  const observerTarget = useRef<HTMLDivElement>(null);

  console.group("PostFeed 렌더링");
  console.log("로딩 상태:", loading);
  console.log("게시물 수:", posts.length);
  console.log("페이지:", page);
  console.log("더 불러올 게시물:", hasMore);
  console.log("추가 로딩 중:", isLoadingMore);
  console.groupEnd();

  // 게시물 목록 불러오기 함수
  const fetchPosts = useCallback(async (pageNum: number) => {
    try {
      console.group("📤 게시물 목록 API 호출");
      console.log("- 페이지:", pageNum);

      // API 응답 캐싱 (브라우저 캐시 활용)
      const response = await fetch(`/api/posts?page=${pageNum}`, {
        next: { revalidate: 60 }, // 60초마다 재검증
      });
      
      console.log("📥 API 응답 상태:", response.status);

      if (!response.ok) {
        throw new Error("게시물을 불러오는데 실패했습니다.");
      }

      const data: PostsResponse = await response.json();
      console.log("✅ API 응답 데이터:", data);
      console.log("- 받은 게시물 수:", data.posts.length);
      console.log("- 더 불러올 게시물:", data.hasMore);

      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }

      setHasMore(data.hasMore);
      console.groupEnd();

      return data;
    } catch (err) {
      console.error("❌ 게시물 목록 로딩 에러:", err);
      console.groupEnd();
      throw err;
    }
  }, []);

  // 초기 로딩
  useEffect(() => {
    const loadInitialPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchPosts(1);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialPosts();
  }, [fetchPosts]);

  // 다음 페이지 불러오기
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) {
      console.log("⏸️ 추가 로딩 중단:", { isLoadingMore, hasMore });
      return;
    }

    console.log("📄 다음 페이지 로딩 시작...");
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      await fetchPosts(nextPage);
      setPage(nextPage);
    } catch (err) {
      console.error("❌ 다음 페이지 로딩 에러:", err);
      // 에러 시에도 계속 스크롤 가능하도록 에러를 표시하지 않음
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, fetchPosts]);

  // Intersection Observer 설정
  useEffect(() => {
    const currentTarget = observerTarget.current;
    
    if (!currentTarget || !hasMore || loading) {
      return;
    }

    console.log("👀 Intersection Observer 설정 중...");

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        console.log("🔍 Intersection Observer 콜백:");
        console.log("- isIntersecting:", entry.isIntersecting);
        console.log("- hasMore:", hasMore);
        console.log("- isLoadingMore:", isLoadingMore);

        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          console.log("✅ 하단 도달! 다음 페이지 로딩 트리거");
          loadMore();
        }
      },
      {
        root: null, // viewport
        rootMargin: "100px", // 하단 100px 전에 트리거
        threshold: 0,
      }
    );

    observer.observe(currentTarget);

    return () => {
      console.log("🔌 Intersection Observer 정리");
      observer.unobserve(currentTarget);
    };
  }, [hasMore, loading, isLoadingMore, loadMore]);

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

  // 게시물 목록 메모이제이션 (성능 최적화)
  const postCards = useMemo(
    () => posts.map((post) => <PostCard key={post.id} post={post} />),
    [posts]
  );

  return (
    <div className="space-y-4">
      {/* 게시물 목록 */}
      {postCards}

      {/* 추가 로딩 스켈레톤 */}
      {isLoadingMore && (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <PostCardSkeleton key={`loading-${i}`} />
          ))}
        </div>
      )}

      {/* Intersection Observer 타겟 */}
      {hasMore && !isLoadingMore && (
        <div
          ref={observerTarget}
          className="h-20 flex items-center justify-center"
        >
          <div className="animate-pulse text-[#8E8E8E] text-instagram-sm">
            스크롤하여 더 보기...
          </div>
        </div>
      )}

      {/* 모든 게시물 로드 완료 메시지 */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-[#8E8E8E] text-instagram-sm">
          모든 게시물을 불러왔습니다.
        </div>
      )}
    </div>
  );
}

