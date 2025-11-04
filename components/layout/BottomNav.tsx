"use client";

/**
 * @file BottomNav.tsx
 * @description Mobile 전용 하단 네비게이션 컴포넌트
 *
 * Mobile (< 768px)에서만 표시되는 하단 네비게이션:
 * - 높이: 50px
 * - 고정 위치 (하단)
 * - 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
 * - Active 상태 표시
 *
 * @dependencies
 * - @clerk/nextjs: 사용자 인증 정보
 * - lucide-react: 아이콘
 * - next/navigation: 경로 네비게이션
 */

import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, Plus, Heart, User } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  isActive?: (pathname: string) => boolean;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
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
    requiresAuth: true,
  },
  {
    icon: Heart,
    label: "좋아요",
    href: "/activity",
    isActive: (pathname) => pathname.startsWith("/activity"),
    requiresAuth: true,
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  // 프로필 링크는 동적으로 생성
  const profileHref = user ? `/profile/${user.id}` : "/sign-in";

  console.group("BottomNav 렌더링");
  console.log("현재 경로:", pathname);
  console.log("프로필 링크:", profileHref);
  console.groupEnd();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-white border-t border-[#DBDBDB] z-50 flex items-center justify-around">
      {navItems.map((item) => {
        // 인증이 필요한 메뉴는 SignedIn으로 감싸기
        if (item.requiresAuth) {
          return (
            <SignedIn key={item.href}>
              <NavItemComponent item={item} pathname={pathname} />
            </SignedIn>
          );
        }

        return <NavItemComponent key={item.href} item={item} pathname={pathname} />;
      })}

      {/* 프로필 메뉴 */}
      <SignedIn>
        <Link
          href={profileHref}
          className="flex flex-col items-center justify-center h-full px-4"
          aria-label="프로필"
        >
          <User
            className={`w-6 h-6 ${
              pathname.startsWith("/profile")
                ? "text-[#0095f6] fill-[#0095f6]"
                : "text-[#262626]"
            }`}
          />
        </Link>
      </SignedIn>

      <SignedOut>
        <Link
          href="/sign-in"
          className="flex flex-col items-center justify-center h-full px-4"
          aria-label="로그인"
        >
          <User className="w-6 h-6 text-[#262626]" />
        </Link>
      </SignedOut>
    </nav>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  pathname: string;
}

function NavItemComponent({ item, pathname }: NavItemComponentProps) {
  const Icon = item.icon;
  const isActive = item.isActive?.(pathname) ?? false;

  return (
    <Link
      href={item.href}
      className="flex flex-col items-center justify-center h-full px-4"
      aria-label={item.label}
    >
      <Icon
        className={`w-6 h-6 ${
          isActive ? "text-[#0095f6] fill-[#0095f6]" : "text-[#262626]"
        }`}
      />
    </Link>
  );
}

