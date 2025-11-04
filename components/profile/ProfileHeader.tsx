/**
 * @file ProfileHeader.tsx
 * @description 프로필 헤더 컴포넌트
 *
 * Instagram 스타일 프로필 헤더:
 * - 프로필 이미지 (원형, Desktop 150px / Mobile 90px)
 * - 사용자명
 * - 통계: 게시물 수, 팔로워 수, 팔로잉 수
 * - 팔로우/팔로잉 버튼 (다른 사용자 프로필일 때)
 * - Fullname 및 Bio 표시 (향후 확장)
 *
 * @dependencies
 * - @clerk/nextjs: 사용자 인증 정보 (프로필 이미지)
 * - lucide-react: 아이콘
 * - lib/types: 타입 정의
 */

"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { UserProfile } from "@/lib/types";
import { User } from "lucide-react";
import { useFollow } from "@/hooks/use-follow";
import { useState } from "react";

interface ProfileHeaderProps {
  profile: UserProfile;
  onProfileUpdate?: (updatedProfile: UserProfile) => void; // 프로필 업데이트 콜백
}

export default function ProfileHeader({ profile, onProfileUpdate }: ProfileHeaderProps) {
  const { user: clerkUser } = useUser();
  const [isHoveringFollow, setIsHoveringFollow] = useState(false);

  // 팔로우 Hook (Hook 규칙 때문에 항상 호출)
  // 본인 프로필일 때는 버튼이 렌더링되지 않으므로 실제로 사용되지 않음
  const { isFollowing, followersCount, toggleFollow, isLoading } = useFollow({
    followingId: profile.clerk_id,
    initialFollowing: profile.isFollowing || false,
    initialFollowersCount: profile.followers_count,
    onSuccess: (newFollowingState) => {
      console.log("팔로우 상태 변경 성공:", newFollowingState);
      // 프로필 업데이트 콜백 호출
      if (onProfileUpdate && !profile.isOwnProfile) {
        onProfileUpdate({
          ...profile,
          isFollowing: newFollowingState,
          followers_count: followersCount,
        });
      }
    },
  });

  console.group("ProfileHeader 렌더링");
  console.log("프로필 정보:", {
    id: profile.id,
    name: profile.name,
    posts_count: profile.posts_count,
    followers_count: profile.followers_count,
    following_count: profile.following_count,
    isFollowing: profile.isFollowing,
    isOwnProfile: profile.isOwnProfile,
  });
  console.log("팔로우 Hook 상태:", {
    isFollowing,
    followersCount,
    isLoading,
  });
  console.log("Clerk 사용자:", clerkUser ? { id: clerkUser.id } : "없음");
  console.groupEnd();

  // 프로필 이미지 URL (Clerk에서 가져오거나 기본 아바타)
  const profileImageUrl =
    profile.isOwnProfile && clerkUser?.imageUrl
      ? clerkUser.imageUrl
      : null;

  // Fullname과 Bio는 Clerk에서 가져오거나 기본값 사용
  const fullName = profile.isOwnProfile
    ? clerkUser?.fullName || profile.name
    : null; // 다른 사용자는 일단 name만 표시
  const bio = profile.isOwnProfile 
    ? (clerkUser?.publicMetadata?.bio as string | undefined) || null 
    : null; // 향후 확장

  return (
    <div className="w-full max-w-[935px] mx-auto px-4 py-6 md:py-8">
      <div className="flex flex-col md:flex-row gap-4 md:gap-12">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0 flex justify-center md:justify-start">
          <div className="relative">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={profile.name}
                width={150}
                height={150}
                className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] rounded-full object-cover border border-[#DBDBDB]"
                priority
              />
            ) : (
              <div className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] rounded-full bg-[#DBDBDB] flex items-center justify-center border border-[#DBDBDB]">
                <User className="w-[45px] h-[45px] md:w-[75px] md:h-[75px] text-[#8E8E8E]" />
              </div>
            )}
          </div>
        </div>

        {/* 프로필 정보 */}
        <div className="flex-1 flex flex-col gap-4">
          {/* 사용자명 및 액션 버튼 */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg md:text-2xl font-light text-[#262626]">
              {profile.name}
            </h1>

            {/* 본인 프로필: 프로필 편집 버튼 (1차 제외) */}
            {profile.isOwnProfile ? (
              <button
                type="button"
                className="px-4 py-1.5 text-sm font-semibold text-[#262626] bg-white border border-[#DBDBDB] rounded-md hover:bg-[#FAFAFA] transition-colors"
                disabled
                aria-label="프로필 편집"
              >
                프로필 편집
              </button>
            ) : (
              /* 다른 사용자 프로필: 팔로우/팔로잉 버튼 */
              <>
                <button
                  type="button"
                  className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                    isFollowing
                      ? "text-[#262626] bg-white border border-[#DBDBDB] hover:border-[#ED4956] hover:text-[#ED4956]"
                      : "text-white bg-[#0095f6] hover:bg-[#1877f2]"
                  }`}
                  aria-label={isFollowing ? "언팔로우" : "팔로우"}
                  disabled={isLoading}
                  onMouseEnter={() => setIsHoveringFollow(true)}
                  onMouseLeave={() => setIsHoveringFollow(false)}
                  onClick={toggleFollow}
                >
                  {isHoveringFollow && isFollowing ? "언팔로우" : isFollowing ? "팔로잉" : "팔로우"}
                </button>
                <button
                  type="button"
                  className="px-4 py-1.5 text-sm font-semibold text-[#262626] bg-white border border-[#DBDBDB] rounded-md hover:bg-[#FAFAFA] transition-colors"
                  aria-label="메시지"
                >
                  메시지
                </button>
              </>
            )}
          </div>

          {/* 통계 정보 */}
          <div className="flex items-center gap-6 md:gap-8">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-[#262626]">
                {profile.posts_count}
              </span>
              <span className="text-[#262626]">게시물</span>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              aria-label="팔로워"
              onClick={() => {
                console.log("팔로워 목록 클릭");
                // TODO: 팔로워 목록 모달 (1차 제외)
              }}
            >
              <span className="font-semibold text-[#262626]">
                {profile.isOwnProfile ? profile.followers_count : followersCount}
              </span>
              <span className="text-[#262626]">팔로워</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              aria-label="팔로잉"
              onClick={() => {
                console.log("팔로잉 목록 클릭");
                // TODO: 팔로잉 목록 모달 (1차 제외)
              }}
            >
              <span className="font-semibold text-[#262626]">
                {profile.following_count}
              </span>
              <span className="text-[#262626]">팔로잉</span>
            </button>
          </div>

          {/* Fullname 및 Bio */}
          {(fullName || bio) && (
            <div className="flex flex-col gap-1">
              {fullName && (
                <p className="font-semibold text-[#262626]">{fullName}</p>
              )}
              {bio && (
                <p className="text-[#262626] whitespace-pre-line">{bio}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

