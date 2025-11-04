"use client";

/**
 * @file CommentForm.tsx
 * @description 댓글 작성 폼 컴포넌트
 *
 * Instagram 스타일의 댓글 입력 UI:
 * - "댓글 달기..." 입력창
 * - Enter 키 또는 "게시" 버튼으로 제출
 * - 빈 댓글 방지
 * - 로딩 상태 표시
 *
 * @dependencies
 * - react: useState, FormEvent
 * - @clerk/nextjs: 인증 상태 확인
 * - lib/types: CommentWithUser 타입
 */

import { useState, FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { CommentWithUser } from "@/lib/types";

interface CommentFormProps {
  postId: string;
  onCommentAdded: (comment: CommentWithUser) => void;
}

export default function CommentForm({
  postId,
  onCommentAdded,
}: CommentFormProps) {
  const { isSignedIn } = useUser();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("🔄 CommentForm 렌더링 - postId:", postId);

  // 댓글 제출 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    console.group("💬 댓글 작성 시도");
    console.log("- postId:", postId);
    console.log("- content:", content);
    console.log("- isSignedIn:", isSignedIn);

    // 인증 확인
    if (!isSignedIn) {
      console.error("❌ 로그인 필요");
      console.groupEnd();
      setError("로그인이 필요합니다.");
      return;
    }

    // 빈 댓글 방지
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      console.error("❌ 빈 댓글");
      console.groupEnd();
      setError("댓글 내용을 입력해주세요.");
      return;
    }

    // 길이 검증
    if (trimmedContent.length > 2200) {
      console.error("❌ 댓글 길이 초과");
      console.groupEnd();
      setError("댓글은 최대 2,200자까지 입력할 수 있습니다.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log("📤 API 요청 전송 중...");

      // API 호출
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: trimmedContent,
        }),
      });

      console.log("📥 API 응답 상태:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "댓글 작성에 실패했습니다.");
      }

      const { comment } = await response.json();
      console.log("✅ 댓글 작성 성공:", comment);

      // 성공: 입력창 초기화 및 부모 컴포넌트에 알림
      setContent("");
      onCommentAdded(comment);

      console.groupEnd();
    } catch (err) {
      console.error("❌ 댓글 작성 실패:", err);
      console.groupEnd();
      setError(
        err instanceof Error ? err.message : "댓글 작성에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enter 키 처리 (Shift+Enter는 줄바꿈, Enter는 제출)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  // 로그인하지 않은 경우 비활성화된 입력창 표시
  if (!isSignedIn) {
    return (
      <div className="border-t border-[#DBDBDB] px-4 py-3">
        <input
          type="text"
          placeholder="로그인 후 댓글을 작성할 수 있습니다."
          disabled
          className="w-full text-instagram-sm text-[#8E8E8E] bg-transparent outline-none cursor-not-allowed"
        />
      </div>
    );
  }

  return (
    <div className="border-t border-[#DBDBDB]">
      <form onSubmit={handleSubmit} className="flex items-center px-4 py-3 gap-3">
        {/* 댓글 입력창 */}
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="댓글 달기..."
          disabled={isSubmitting}
          className="flex-1 text-instagram-sm text-[#262626] bg-transparent outline-none placeholder:text-[#8E8E8E] disabled:opacity-50"
          maxLength={2200}
        />

        {/* 게시 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className={`text-instagram-sm font-instagram-bold transition-opacity ${
            isSubmitting || !content.trim()
              ? "text-[#B8DAFF] cursor-not-allowed"
              : "text-[#0095f6] hover:opacity-70"
          }`}
        >
          {isSubmitting ? "게시 중..." : "게시"}
        </button>
      </form>

      {/* 에러 메시지 */}
      {error && (
        <div className="px-4 pb-3">
          <p className="text-instagram-xs text-[#ED4956]" role="alert">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

