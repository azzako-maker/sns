/**
 * @file page.tsx
 * @description 프로필 페이지
 *
 * 동적 라우트: /profile/[userId]
 * - userId는 Clerk User ID (clerk_id)
 * - 프로필 헤더 및 게시물 그리드 표시
 *
 * @dependencies
 * - components/profile/ProfileHeader: 프로필 헤더 컴포넌트
 * - lib/types: 타입 정의
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UserProfile } from "@/lib/types";
import ProfileHeader from "@/components/profile/ProfileHeader";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.group("ProfilePage 렌더링");
  console.log("userId (Clerk ID):", userId);
  console.log("로딩 상태:", loading);
  console.log("프로필 데이터:", profile);
  console.log("에러:", error);
  console.groupEnd();

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) {
        setError("사용자 ID가 없습니다.");
        setLoading(false);
        return;
      }

      try {
        console.log("프로필 정보 조회 시작:", userId);
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "프로필 정보를 불러올 수 없습니다.");
        }

        const profileData: UserProfile = await response.json();
        console.log("프로필 정보 조회 성공:", profileData);
        setProfile(profileData);
      } catch (err) {
        console.error("프로필 정보 조회 에러:", err);
        setError(
          err instanceof Error ? err.message : "프로필 정보를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full max-w-[935px] mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-4 md:gap-12">
          {/* 프로필 이미지 스켈레톤 */}
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <div className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] rounded-full bg-[#DBDBDB] animate-pulse" />
          </div>
          {/* 프로필 정보 스켈레톤 */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="h-8 w-32 bg-[#DBDBDB] rounded animate-pulse" />
            <div className="flex items-center gap-6 md:gap-8">
              <div className="h-6 w-20 bg-[#DBDBDB] rounded animate-pulse" />
              <div className="h-6 w-20 bg-[#DBDBDB] rounded animate-pulse" />
              <div className="h-6 w-20 bg-[#DBDBDB] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full max-w-[935px] mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-[#8E8E8E] text-center">
            {error || "프로필을 불러올 수 없습니다."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-semibold text-[#0095f6] hover:opacity-70 transition-opacity"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen">
      <ProfileHeader profile={profile} />
      
      {/* 게시물 그리드는 3-2 단계에서 구현 예정 */}
      <div className="w-full max-w-[935px] mx-auto px-4 py-6">
        <div className="text-center text-[#8E8E8E] py-12">
          <p>게시물 그리드는 다음 단계에서 구현됩니다.</p>
        </div>
      </div>
    </div>
  );
}

