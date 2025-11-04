/**
 * @file layout.tsx
 * @description (main) Route Group 레이아웃
 *
 * 반응형 레이아웃 구조:
 * - Desktop/Tablet: Sidebar + Main Content
 * - Mobile: Header + Main Content + BottomNav
 *
 * @dependencies
 * - components/layout/Sidebar: Desktop/Tablet 사이드바
 * - components/layout/Header: Mobile 헤더
 * - components/layout/BottomNav: Mobile 하단 네비게이션
 */

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("MainLayout 렌더링 - 반응형 레이아웃 구조 적용");

  return (
    <>
      {/* Desktop/Tablet: Sidebar 표시 */}
      <Sidebar />

      {/* Mobile: Header 표시 */}
      <Header />

      {/* Main Content 영역 */}
      <main className="md:ml-[72px] lg:ml-[244px] min-h-screen bg-[#FAFAFA]">
        {/* Mobile: Header 높이만큼 여백 추가 */}
        <div className="lg:pt-0 pt-[60px] pb-[50px] lg:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile: BottomNav 표시 */}
      <BottomNav />
    </>
  );
}

