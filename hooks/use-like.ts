"use client";

/**
 * @file use-like.ts
 * @description 좋아요 상태 관리 Hook
 *
 * 좋아요 토글 기능을 제공하는 커스텀 Hook:
 * - Optimistic update (즉시 UI 업데이트)
 * - API 호출 실패 시 롤백
 * - 로딩 및 에러 상태 관리
 *
 * @dependencies
 * - app/api/likes: 좋아요 API
 */

import { useState, useCallback } from "react";

interface UseLikeOptions {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

interface UseLikeReturn {
  isLiked: boolean;
  likesCount: number;
  toggleLike: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useLike({
  postId,
  initialLiked,
  initialCount,
}: UseLikeOptions): UseLikeReturn {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const wasLiked = isLiked;
    const previousCount = likesCount;

    console.group("좋아요 토글");
    console.log("게시물 ID:", postId);
    console.log("이전 상태:", wasLiked ? "좋아요" : "좋아요 안 함");
    console.log("이전 좋아요 수:", previousCount);

    // Optimistic update: 즉시 UI 업데이트
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      const response = await fetch("/api/likes", {
        method: wasLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "좋아요 처리에 실패했습니다.");
      }

      const data = await response.json();
      console.log("API 응답:", data);
      console.log("새 상태:", data.liked ? "좋아요" : "좋아요 안 함");
      console.groupEnd();
    } catch (err) {
      console.error("좋아요 토글 에러:", err);
      // Rollback: 이전 상태로 복원
      setIsLiked(wasLiked);
      setLikesCount(previousCount);
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      console.groupEnd();
    } finally {
      setIsLoading(false);
    }
  }, [postId, isLiked, likesCount]);

  return {
    isLiked,
    likesCount,
    toggleLike,
    isLoading,
    error,
  };
}

