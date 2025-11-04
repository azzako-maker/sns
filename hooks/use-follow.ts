/**
 * @file use-follow.ts
 * @description 팔로우 상태 관리 Hook
 *
 * 팔로우/언팔로우 토글 기능을 제공하는 커스텀 Hook:
 * - Optimistic update (즉시 UI 업데이트)
 * - API 호출 실패 시 롤백
 * - 로딩 및 에러 상태 관리
 * - 팔로워 수 업데이트
 *
 * @dependencies
 * - app/api/follows: 팔로우 API
 */

"use client";

import { useState, useCallback } from "react";

interface UseFollowOptions {
  followingId: string; // Clerk ID (clerk_id)
  initialFollowing: boolean;
  initialFollowersCount: number;
  onSuccess?: (isFollowing: boolean) => void; // 성공 시 콜백
}

interface UseFollowReturn {
  isFollowing: boolean;
  followersCount: number;
  toggleFollow: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useFollow({
  followingId,
  initialFollowing,
  initialFollowersCount,
  onSuccess,
}: UseFollowOptions): UseFollowReturn {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFollow = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const wasFollowing = isFollowing;
    const previousCount = followersCount;

    console.group("팔로우 토글");
    console.log("대상 사용자 Clerk ID:", followingId);
    console.log("이전 상태:", wasFollowing ? "팔로우 중" : "미팔로우");
    console.log("이전 팔로워 수:", previousCount);

    // Optimistic update: 즉시 UI 업데이트
    setIsFollowing(!wasFollowing);
    setFollowersCount((prev) => (wasFollowing ? prev - 1 : prev + 1));

    try {
      const response = await fetch("/api/follows", {
        method: wasFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ followingId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "팔로우 처리에 실패했습니다.");
      }

      const data = await response.json();
      console.log("API 응답:", data);
      console.log("새 상태:", !wasFollowing ? "팔로우 중" : "미팔로우");
      console.groupEnd();

      // 성공 시 콜백 호출
      if (onSuccess) {
        onSuccess(!wasFollowing);
      }
    } catch (err) {
      console.error("팔로우 토글 에러:", err);
      // Rollback: 이전 상태로 복원
      setIsFollowing(wasFollowing);
      setFollowersCount(previousCount);
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      console.groupEnd();
    } finally {
      setIsLoading(false);
    }
  }, [followingId, isFollowing, followersCount, onSuccess]);

  return {
    isFollowing,
    followersCount,
    toggleFollow,
    isLoading,
    error,
  };
}

