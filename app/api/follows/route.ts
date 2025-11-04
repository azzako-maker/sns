/**
 * @file route.ts
 * @description 팔로우/언팔로우 API
 *
 * POST /api/follows
 * - 팔로우 추가
 * - 중복 방지 (UNIQUE 제약조건)
 * - 자기 자신 팔로우 방지 (CHECK 제약조건)
 *
 * DELETE /api/follows
 * - 언팔로우 (팔로우 관계 삭제)
 *
 * @dependencies
 * - lib/supabase/server: Supabase 클라이언트 (Clerk 인증)
 * - lib/types: 타입 정의
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    console.group("🔵 POST /api/follows - 팔로우 추가 API 호출");

    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.error("인증되지 않은 사용자");
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    console.log("Clerk User ID:", clerkUserId);

    // 요청 본문 파싱
    const body = await request.json();
    const { followingId } = body; // Clerk ID (clerk_id)

    if (!followingId) {
      console.error("followingId가 없음");
      return NextResponse.json(
        { error: "팔로우할 사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    console.log("팔로우할 사용자 Clerk ID:", followingId);

    const supabase = createClerkSupabaseClient();

    // 현재 사용자의 Supabase user_id 조회
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (currentUserError || !currentUser) {
      console.error("현재 사용자 조회 에러:", currentUserError);
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("현재 사용자 ID (Supabase):", currentUser.id);

    // 대상 사용자의 Supabase user_id 조회
    const { data: targetUser, error: targetUserError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", followingId)
      .single();

    if (targetUserError || !targetUser) {
      console.error("대상 사용자 조회 에러:", targetUserError);
      return NextResponse.json(
        { error: "팔로우할 사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("대상 사용자 ID (Supabase):", targetUser.id);

    // 자기 자신 팔로우 방지
    if (currentUser.id === targetUser.id) {
      console.error("자기 자신 팔로우 시도");
      return NextResponse.json(
        { error: "자기 자신을 팔로우할 수 없습니다." },
        { status: 400 }
      );
    }

    // 팔로우 관계 추가
    const { data: followData, error: followError } = await supabase
      .from("follows")
      .insert({
        follower_id: currentUser.id,
        following_id: targetUser.id,
      })
      .select()
      .single();

    if (followError) {
      console.error("팔로우 추가 에러:", followError);

      // 중복 팔로우 에러 (23505 = UNIQUE 제약조건 위반)
      if (followError.code === "23505") {
        return NextResponse.json(
          { error: "이미 팔로우 중입니다." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "팔로우에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("팔로우 추가 성공:", followData.id);
    console.groupEnd();

    return NextResponse.json(
      {
        success: true,
        follow: followData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ 팔로우 추가 API 에러:", error);

    if (error instanceof Error) {
      console.error("에러 이름:", error.name);
      console.error("에러 메시지:", error.message);
      console.error("에러 스택:", error.stack);
    }

    console.groupEnd();

    return NextResponse.json(
      {
        error: "팔로우 처리 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.group("🔴 DELETE /api/follows - 언팔로우 API 호출");

    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.error("인증되지 않은 사용자");
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    console.log("Clerk User ID:", clerkUserId);

    // 요청 본문 파싱
    const body = await request.json();
    const { followingId } = body; // Clerk ID (clerk_id)

    if (!followingId) {
      console.error("followingId가 없음");
      return NextResponse.json(
        { error: "언팔로우할 사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    console.log("언팔로우할 사용자 Clerk ID:", followingId);

    const supabase = createClerkSupabaseClient();

    // 현재 사용자의 Supabase user_id 조회
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (currentUserError || !currentUser) {
      console.error("현재 사용자 조회 에러:", currentUserError);
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("현재 사용자 ID (Supabase):", currentUser.id);

    // 대상 사용자의 Supabase user_id 조회
    const { data: targetUser, error: targetUserError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", followingId)
      .single();

    if (targetUserError || !targetUser) {
      console.error("대상 사용자 조회 에러:", targetUserError);
      return NextResponse.json(
        { error: "언팔로우할 사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("대상 사용자 ID (Supabase):", targetUser.id);

    // 팔로우 관계 삭제
    const { error: deleteError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", currentUser.id)
      .eq("following_id", targetUser.id);

    if (deleteError) {
      console.error("언팔로우 에러:", deleteError);
      return NextResponse.json(
        { error: "언팔로우에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("언팔로우 성공");
    console.groupEnd();

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ 언팔로우 API 에러:", error);

    if (error instanceof Error) {
      console.error("에러 이름:", error.name);
      console.error("에러 메시지:", error.message);
      console.error("에러 스택:", error.stack);
    }

    console.groupEnd();

    return NextResponse.json(
      {
        error: "언팔로우 처리 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

