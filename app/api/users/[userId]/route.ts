/**
 * @file route.ts
 * @description 사용자 프로필 정보 조회 API
 *
 * GET /api/users/[userId]
 * - 사용자 기본 정보 조회
 * - 게시물 수, 팔로워 수, 팔로잉 수 계산 (user_stats 뷰 사용)
 * - 팔로우 상태 확인 (현재 사용자가 이 사용자를 팔로우하는지)
 * - 본인 프로필 여부 확인
 *
 * @dependencies
 * - lib/supabase/server: Supabase 클라이언트 (Clerk 인증)
 * - lib/types: 타입 정의
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { UserProfile } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    console.group("🔵 GET /api/users/[userId] - 프로필 정보 조회 API 호출");
    
    const { userId: targetClerkId } = await params;
    console.log("조회할 사용자 Clerk ID:", targetClerkId);

    const supabase = createClerkSupabaseClient();

    // 현재 사용자 ID 가져오기 (Clerk)
    const { userId: currentClerkId } = await auth();
    console.log("현재 사용자 Clerk ID:", currentClerkId || "로그인 안 됨");

    // users 테이블에서 대상 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, clerk_id, name, created_at")
      .eq("clerk_id", targetClerkId)
      .single();

    if (userError) {
      console.error("❌ 사용자 조회 에러:", userError);
      console.groupEnd();
      
      if (userError.code === "PGRST116") {
        // 사용자를 찾을 수 없음
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: "사용자 정보를 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    if (!userData) {
      console.error("사용자 데이터 없음");
      console.groupEnd();
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("사용자 데이터 조회 성공:", userData.id);

    // user_stats 뷰에서 통계 정보 조회
    const { data: statsData, error: statsError } = await supabase
      .from("user_stats")
      .select("posts_count, followers_count, following_count")
      .eq("user_id", userData.id)
      .single();

    if (statsError) {
      console.error("❌ 통계 조회 에러:", statsError);
      // 통계 조회 실패해도 기본값으로 계속 진행
    }

    const stats = statsData || {
      posts_count: 0,
      followers_count: 0,
      following_count: 0,
    };

    console.log("통계 정보:", stats);

    // 본인 프로필 여부 확인
    const isOwnProfile = currentClerkId === targetClerkId;

    // 팔로우 상태 확인 (본인이 아니고 로그인한 경우만)
    let isFollowing = false;
    if (!isOwnProfile && currentClerkId) {
      // 현재 사용자의 Supabase user_id 조회
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", currentClerkId)
        .single();

      if (currentUser) {
        // follows 테이블에서 팔로우 관계 확인
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUser.id)
          .eq("following_id", userData.id)
          .single();

        isFollowing = !!followData;
        console.log("팔로우 상태:", isFollowing);
      }
    }

    const profile: UserProfile = {
      id: userData.id,
      clerk_id: userData.clerk_id,
      name: userData.name,
      created_at: userData.created_at,
      posts_count: stats.posts_count || 0,
      followers_count: stats.followers_count || 0,
      following_count: stats.following_count || 0,
      isFollowing,
      isOwnProfile,
    };

    console.log("프로필 정보 반환:", {
      id: profile.id,
      name: profile.name,
      posts_count: profile.posts_count,
      followers_count: profile.followers_count,
      following_count: profile.following_count,
      isFollowing: profile.isFollowing,
      isOwnProfile: profile.isOwnProfile,
    });
    console.groupEnd();

    return NextResponse.json<UserProfile>(profile, { status: 200 });
  } catch (error) {
    console.error("❌ 프로필 정보 조회 API 에러:", error);
    
    if (error instanceof Error) {
      console.error("에러 이름:", error.name);
      console.error("에러 메시지:", error.message);
      console.error("에러 스택:", error.stack);
    }
    
    console.groupEnd();
    
    return NextResponse.json(
      {
        error: "프로필 정보를 불러오는 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

