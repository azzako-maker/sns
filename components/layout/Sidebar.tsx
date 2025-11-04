"use client";

/**
 * @file Sidebar.tsx
 * @description Instagram 스타일 사이드바 컴포넌트
 *
 * 반응형 사이드바:
 * - Desktop (1024px+): 244px 너비, 아이콘 + 텍스트
 * - Tablet (768px-1023px): 72px 너비, 아이콘만
 * - Mobile (< 768px): 숨김
 *
 * @dependencies
 * - @clerk/nextjs: 사용자 인증 정보
 * - lucide-react: 아이콘
 * - next/navigation: 경로 네비게이션
 */

import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, Plus, User } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  isActive?: (pathname: string) => boolean;
}

const menuItems: MenuItem[] = [
  {
    icon: Home,
    label: "홈",
    href: "/",
    isActive: (pathname) => pathname === "/",
  },
  {
    icon: Search,
    label: "검색",
    href: "/search",
    isActive: (pathname) => pathname.startsWith("/search"),
  },
  {
    icon: Plus,
    label: "만들기",
    href: "#", // TODO: 모달 연결 예정
    isActive: () => false,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  console.group("Sidebar 렌더링");
  console.log("현재 경로:", pathname);
  console.log("사용자 정보:", user ? { id: user.id, name: user.fullName } : "로그인 안 됨");
  console.groupEnd();

  // 프로필 링크는 동적으로 생성 (사용자 ID 필요)
  const profileHref = user ? `/profile/${user.id}` : "/sign-in";

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:bg-white md:border-r md:border-[#DBDBDB] md:z-40">
      {/* Desktop: 244px, Tablet: 72px */}
      <div className="w-[72px] lg:w-[244px] flex flex-col h-full">
        {/* 로고 영역 (Desktop만) */}
        <div className="hidden lg:block px-6 py-5 border-b border-[#DBDBDB]">
          <h1 className="text-2xl font-bold text-[#262626]">Instagram</h1>
        </div>

        {/* 메뉴 영역 */}
        <nav className="flex-1 px-3 py-4 lg:px-6">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive?.(pathname) ?? false;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-4 px-4 py-3 rounded-lg
                      transition-colors duration-200
                      ${
                        isActive
                          ? "font-bold text-[#262626]"
                          : "text-[#262626] hover:bg-[#FAFAFA]"
                      }
                    `}
                    aria-label={item.label}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        isActive ? "text-[#0095f6]" : "text-[#262626]"
                      }`}
                    />
                    <span className="hidden lg:inline text-base">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}

            {/* 프로필 메뉴 */}
            <SignedIn>
              <li>
                <Link
                  href={profileHref}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${
                      pathname.startsWith("/profile")
                        ? "font-bold text-[#262626]"
                        : "text-[#262626] hover:bg-[#FAFAFA]"
                    }
                  `}
                  aria-label="프로필"
                >
                  <User
                    className={`w-6 h-6 ${
                      pathname.startsWith("/profile")
                        ? "text-[#0095f6]"
                        : "text-[#262626]"
                    }`}
                  />
                  <span className="hidden lg:inline text-base">프로필</span>
                </Link>
              </li>
            </SignedIn>

            <SignedOut>
              <li>
                <Link
                  href="/sign-in"
                  className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#262626] hover:bg-[#FAFAFA] transition-colors duration-200"
                  aria-label="로그인"
                >
                  <User className="w-6 h-6" />
                  <span className="hidden lg:inline text-base">로그인</span>
                </Link>
              </li>
            </SignedOut>
          </ul>
        </nav>
      </div>
    </aside>
  );
}

