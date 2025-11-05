/**
 * @file page.tsx
 * @description 회원가입 페이지
 *
 * Clerk SignUp 컴포넌트를 사용한 회원가입 페이지
 * Instagram 스타일의 디자인 적용
 *
 * @dependencies
 * - @clerk/nextjs: Clerk 인증 컴포넌트
 */

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
      <div className="w-full max-w-[400px] px-4">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white shadow-none border border-[#DBDBDB] rounded-lg",
              headerTitle: "text-[#262626] font-instagram-semibold text-2xl",
              headerSubtitle: "text-[#8E8E8E]",
              socialButtonsBlockButton:
                "bg-[#0095f6] text-white hover:bg-[#0095f6]/90 border-none",
              formButtonPrimary:
                "bg-[#0095f6] text-white hover:bg-[#0095f6]/90",
              formFieldInput:
                "border-[#DBDBDB] focus:border-[#0095f6] focus:ring-[#0095f6]",
              footerActionLink: "text-[#0095f6] hover:text-[#0095f6]/90",
            },
          }}
        />
      </div>
    </div>
  );
}



