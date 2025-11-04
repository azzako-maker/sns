"use client";

/**
 * @file Header.tsx
 * @description Mobile 전용 헤더 컴포넌트
 *
 * Mobile (< 768px)에서만 표시되는 헤더:
 * - 높이: 60px
 * - 로고 + 알림/DM/프로필 아이콘
 * - 고정 위치 (상단)
 *
 * @dependencies
 * - @clerk/nextjs: UserButton 컴포넌트
 * - lucide-react: 아이콘
 */

import { UserButton } from "@clerk/nextjs";
import { SignedIn } from "@clerk/nextjs";
import { Bell, MessageCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-[#DBDBDB] z-50 flex items-center justify-between px-4">
      {/* 로고 */}
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-[#262626]">Instagram</h1>
      </div>

      {/* 우측 아이콘들 */}
      <div className="flex items-center gap-4">
        <SignedIn>
          {/* 알림 아이콘 (UI만, 기능 제외) */}
          <button
            type="button"
            className="text-[#262626] hover:opacity-70 transition-opacity"
            aria-label="알림"
          >
            <Bell className="w-6 h-6" />
          </button>

          {/* DM 아이콘 (UI만, 기능 제외) */}
          <button
            type="button"
            className="text-[#262626] hover:opacity-70 transition-opacity"
            aria-label="메시지"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          {/* 프로필 (Clerk UserButton) */}
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}

