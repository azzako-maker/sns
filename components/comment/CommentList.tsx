"use client";

/**
 * @file CommentList.tsx
 * @description 댓글 목록 컴포넌트
 *
 * 댓글 목록을 Instagram 스타일로 표시:
 * - 사용자명 (Bold) + 내용
 * - 상대 시간 표시
 * - 프로필 링크 연결
 * - 빈 상태 처리
 *
 * @dependencies
 * - next/link: 프로필 링크
 * - lib/types: CommentWithUser 타입
 * - lib/utils/time: 상대 시간 표시
 */

import Link from "next/link";
import { CommentWithUser } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils/time";

interface CommentListProps {
  comments: CommentWithUser[];
  showAll?: boolean; // true면 모든 댓글, false면 최신 2개만
}

export default function CommentList({
  comments,
  showAll = false,
}: CommentListProps) {
  console.log("💬 CommentList 렌더링");
  console.log("- 댓글 수:", comments.length);
  console.log("- showAll:", showAll);

  // 표시할 댓글 결정
  const displayComments = showAll ? comments : comments.slice(0, 2);

  console.log("- 표시할 댓글 수:", displayComments.length);

  // 댓글이 없는 경우
  if (comments.length === 0) {
    return null; // 빈 상태는 표시하지 않음 (PostCard에서 처리)
  }

  return (
    <div className="space-y-1">
      {displayComments.map((comment) => (
        <div
          key={comment.id}
          className="flex items-start gap-2 text-instagram-sm text-[#262626]"
        >
          {/* 사용자명 (Bold) */}
          <Link
            href={`/profile/${comment.user.id}`}
            className="font-instagram-bold hover:opacity-70 flex-shrink-0"
          >
            {comment.user.name}
          </Link>

          {/* 댓글 내용 */}
          <div className="flex-1 min-w-0">
            <span className="break-words">{comment.content}</span>

            {/* 시간 표시 */}
            <div className="text-instagram-xs text-[#8E8E8E] mt-1">
              {formatRelativeTime(comment.created_at)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

