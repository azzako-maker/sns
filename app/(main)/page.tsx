/**
 * @file page.tsx
 * @description 홈 피드 페이지
 *
 * Instagram 스타일의 홈 피드 페이지:
 * - PostFeed 컴포넌트 통합
 * - 최대 너비 630px 중앙 정렬
 * - 배경색 #FAFAFA
 * - 로그인 안내 (로그아웃 상태일 때)
 *
 * @dependencies
 * - components/post/PostFeed: 게시물 피드 컴포넌트
 * - @clerk/nextjs: 인증 상태 확인
 */

import PostFeed from "@/components/post/PostFeed";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  console.log("홈 피드 페이지 렌더링");

  return (
    <div className="w-full max-w-[630px] mx-auto py-8 px-4">
      <SignedIn>
        <PostFeed />
      </SignedIn>

      <SignedOut>
        {/* 로그인 안내 */}
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="bg-white border border-[#DBDBDB] rounded-lg p-8 w-full">
            <h2 className="text-2xl font-instagram-semibold text-[#262626] mb-4">
              Instagram에 오신 것을 환영합니다
            </h2>
            <p className="text-[#8E8E8E] mb-6">
              게시물을 보려면 로그인해주세요.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/sign-in"
                className="px-4 py-2 bg-[#0095f6] text-white text-sm font-semibold rounded-lg hover:bg-[#0095f6]/90 transition-colors text-center"
              >
                로그인
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 bg-white text-[#0095f6] text-sm font-semibold rounded-lg border border-[#0095f6] hover:bg-[#FAFAFA] transition-colors text-center"
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </SignedOut>
    </div>
  );
}

