/**
 * @file PostModal.tsx
 * @description 게시물 상세 모달 컴포넌트 (Desktop)
 *
 * Instagram 스타일 게시물 상세 모달:
 * - 좌측: 이미지 (50%)
 * - 우측: 댓글 영역 (50%)
 *   - 헤더 (사용자명, ⋯ 메뉴)
 *   - 댓글 목록 (스크롤 가능)
 *   - 액션 버튼 (좋아요, 댓글, 공유, 북마크)
 *   - 좋아요 수
 *   - 댓글 입력창
 *
 * @dependencies
 * - components/ui/dialog: shadcn Dialog 컴포넌트
 * - components/comment/CommentList: 댓글 목록
 * - components/comment/CommentForm: 댓글 입력
 * - hooks/use-like: 좋아요 기능
 * - lib/types: 타입 정의
 */

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { PostWithComments, CommentWithUser } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils/time";
import { useLike } from "@/hooks/use-like";
import CommentForm from "@/components/comment/CommentForm";
import CommentList from "@/components/comment/CommentList";

interface PostModalProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PostModal({
  postId,
  open,
  onOpenChange,
}: PostModalProps) {
  const { user } = useUser();
  const [post, setPost] = useState<PostWithComments | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<CommentWithUser[]>([]);

  console.group("PostModal 렌더링");
  console.log("postId:", postId);
  console.log("open:", open);
  console.log("로딩 상태:", loading);
  console.log("게시물 데이터:", post);
  console.groupEnd();

  // 게시물 상세 정보 조회
  useEffect(() => {
    async function fetchPost() {
      if (!postId || !open) return;

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
        setLocalComments(postData.comments || []);
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
  }, [postId, open]);

  // 좋아요 Hook
  const { isLiked, likesCount, toggleLike, isLoading: isLikeLoading } = useLike({
    postId: post?.id || "",
    initialLiked: post?.isLiked || false,
    initialCount: post?.likes_count || 0,
  });

  // 댓글 추가 핸들러
  const handleCommentAdded = (newComment: CommentWithUser) => {
    console.log("새 댓글 추가:", newComment);
    setLocalComments((prev) => [...prev, newComment]);
    // 게시물 댓글 수 업데이트
    if (post) {
      setPost({
        ...post,
        comments_count: post.comments_count + 1,
      });
    }
  };

  // 댓글 삭제 핸들러
  const handleCommentDeleted = (commentId: string) => {
    console.log("댓글 삭제:", commentId);
    setLocalComments((prev) => prev.filter((c) => c.id !== commentId));
    // 게시물 댓글 수 업데이트
    if (post) {
      setPost({
        ...post,
        comments_count: Math.max(0, post.comments_count - 1),
      });
    }
  };

  // 게시물 삭제 핸들러
  const handleDeletePost = async () => {
    if (!post || !user) return;

    const isOwnPost = post.user.clerk_id === user.id;
    if (!isOwnPost) return;

    const confirmed = window.confirm("정말 이 게시물을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      console.log("게시물 삭제 시작:", post.id);
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "게시물 삭제에 실패했습니다.");
      }

      console.log("게시물 삭제 성공");
      onOpenChange(false);
      // TODO: 홈 피드에서도 제거 (부모 컴포넌트에 콜백 전달)
      window.location.reload(); // 임시: 페이지 새로고침
    } catch (err) {
      console.error("게시물 삭제 에러:", err);
      alert(err instanceof Error ? err.message : "게시물 삭제에 실패했습니다.");
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-[#8E8E8E]">로딩 중...</div>
          </div>
        ) : error || !post ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-[#8E8E8E] mb-4">
                {error || "게시물을 불러올 수 없습니다."}
              </p>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-semibold text-[#0095f6] hover:opacity-70 transition-opacity"
              >
                닫기
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0">
            {/* 좌측: 이미지 영역 (50%) */}
            <div className="w-1/2 bg-black flex items-center justify-center min-w-0">
              <div className="relative w-full h-full min-h-[400px]">
                <Image
                  src={post.image_url}
                  alt={post.caption || `${post.user.name}의 게시물`}
                  fill
                  className="object-contain"
                  sizes="50vw"
                  priority
                />
              </div>
            </div>

            {/* 우측: 댓글 영역 (50%) */}
            <div className="w-1/2 flex flex-col bg-white min-w-0">
              {/* 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#DBDBDB]">
                <div className="flex items-center gap-3">
                  <Link href={`/profile/${post.user.clerk_id}`}>
                    {post.user.name ? (
                      <div className="w-8 h-8 rounded-full bg-[#DBDBDB] flex items-center justify-center">
                        <User className="w-5 h-5 text-[#8E8E8E]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#DBDBDB] flex items-center justify-center">
                        <User className="w-5 h-5 text-[#8E8E8E]" />
                      </div>
                    )}
                  </Link>
                  <Link
                    href={`/profile/${post.user.clerk_id}`}
                    className="font-semibold text-[#262626] hover:opacity-70 transition-opacity"
                  >
                    {post.user.name}
                  </Link>
                </div>
                {user && post.user.clerk_id === user.id && (
                  <button
                    type="button"
                    onClick={handleDeletePost}
                    className="text-[#262626] hover:opacity-70 transition-opacity"
                    aria-label="게시물 삭제"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* 댓글 목록 (스크롤 가능) */}
              <div className="flex-1 overflow-y-auto px-4 py-2">
                {/* 캡션 */}
                {post.caption && (
                  <div className="mb-4">
                    <div className="flex items-start gap-2">
                      <Link
                        href={`/profile/${post.user.clerk_id}`}
                        className="font-semibold text-[#262626] hover:opacity-70 transition-opacity"
                      >
                        {post.user.name}
                      </Link>
                      <span className="text-[#262626]">{post.caption}</span>
                    </div>
                    <p className="text-xs text-[#8E8E8E] mt-1">
                      {formatRelativeTime(post.created_at)}
                    </p>
                  </div>
                )}

                {/* 댓글 목록 */}
                <CommentList
                  comments={localComments}
                  showAll={true}
                  onCommentDeleted={handleCommentDeleted}
                />
              </div>

              {/* 액션 버튼 및 좋아요 수 */}
              <div className="border-t border-[#DBDBDB]">
                {/* 액션 버튼 */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={toggleLike}
                      disabled={isLikeLoading}
                      className="transition-transform active:scale-110"
                      aria-label={isLiked ? "좋아요 취소" : "좋아요"}
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          isLiked
                            ? "text-[#ED4956] fill-[#ED4956]"
                            : "text-[#262626]"
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      className="text-[#262626]"
                      aria-label="댓글"
                    >
                      <MessageCircle className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      className="text-[#262626]"
                      aria-label="공유"
                    >
                      <Send className="w-6 h-6" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-[#262626]"
                    aria-label="북마크"
                  >
                    <Bookmark className="w-6 h-6" />
                  </button>
                </div>

                {/* 좋아요 수 */}
                <div className="px-4 pb-2">
                  <p className="font-semibold text-[#262626]">
                    좋아요 {likesCount}개
                  </p>
                </div>

                {/* 시간 */}
                <div className="px-4 pb-2">
                  <p className="text-xs text-[#8E8E8E] uppercase">
                    {formatRelativeTime(post.created_at)}
                  </p>
                </div>
              </div>

              {/* 댓글 입력창 */}
              <div className="border-t border-[#DBDBDB] px-4 py-3">
                <CommentForm
                  postId={post.id}
                  onCommentAdded={handleCommentAdded}
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

