/**
 * @file page.tsx
 * @description 게시물 상세 페이지 (Mobile)
 *
 * 동적 라우트: /post/[postId]
 * - Mobile 환경에서 전체 페이지 형태로 게시물 상세 표시
 * - Desktop에서는 모달로 표시 (PostModal)
 *
 * @dependencies
 * - components/post/PostCard: 게시물 카드 컴포넌트 재사용
 * - lib/types: 타입 정의
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PostWithComments } from "@/lib/types";
import PostCard from "@/components/post/PostCard";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;

  const [post, setPost] = useState<PostWithComments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.group("PostDetailPage 렌더링");
  console.log("postId:", postId);
  console.log("로딩 상태:", loading);
  console.log("게시물 데이터:", post);
  console.log("에러:", error);
  console.groupEnd();

  useEffect(() => {
    async function fetchPost() {
      if (!postId) {
        setError("게시물 ID가 없습니다.");
        setLoading(false);
        return;
      }

      try {
        console.log("게시물 상세 정보 조회 시작:", postId);
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/posts/${postId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "게시물을 불러올 수 없습니다.");
        }

        const postData: PostWithComments = await response.json();
        console.log("게시물 상세 정보 조회 성공:", postData);
        setPost(postData);
      } catch (err) {
        console.error("게시물 상세 정보 조회 에러:", err);
        setError(
          err instanceof Error ? err.message : "게시물을 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="w-full max-w-[630px] mx-auto bg-white">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-[#8E8E8E]">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="w-full max-w-[630px] mx-auto bg-white">
        <div className="flex flex-col items-center justify-center gap-4 py-12 px-4">
          <p className="text-[#8E8E8E] text-center">
            {error || "게시물을 불러올 수 없습니다."}
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-semibold text-[#262626] bg-white border border-[#DBDBDB] rounded-md hover:bg-[#FAFAFA] transition-colors"
            >
              뒤로 가기
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-semibold text-[#0095f6] hover:opacity-70 transition-opacity"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen">
      <div className="max-w-[630px] mx-auto">
        <PostCard post={post} />
      </div>
    </div>
  );
}

