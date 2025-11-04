/**
 * @file page.tsx
 * @description 홈 피드 페이지
 *
 * Instagram 스타일의 홈 피드 페이지:
 * - PostFeed 컴포넌트 통합
 * - 최대 너비 630px 중앙 정렬
 * - 배경색 #FAFAFA
 *
 * @dependencies
 * - components/post/PostFeed: 게시물 피드 컴포넌트
 */

import PostFeed from "@/components/post/PostFeed";

export default function HomePage() {
  console.log("홈 피드 페이지 렌더링");

  return (
    <div className="w-full max-w-[630px] mx-auto py-8 px-4">
      <PostFeed />
    </div>
  );
}

