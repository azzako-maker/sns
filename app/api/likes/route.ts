/**
 * @file route.ts
 * @description 좋아요 API
 *
 * POST /api/likes: 좋아요 추가
 * DELETE /api/likes: 좋아요 제거
 *
 * @dependencies
 * - lib/supabase/server: Supabase 클라이언트
 * - @clerk/nextjs/server: Clerk 인증
 */

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.group("좋아요 추가 API 호출");

    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.error("인증되지 않은 사용자");
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "postId가 필요합니다." },
        { status: 400 }
      );
    }

    console.log("게시물 ID:", postId);
    console.log("사용자 ID (Clerk):", userId);

    const supabase = createClerkSupabaseClient();

    // users 테이블에서 clerk_id로 user_id 조회
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !user) {
      console.error("사용자 조회 에러:", userError);
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("사용자 ID (Supabase):", user.id);

    // 게시물 존재 확인
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      console.error("게시물 조회 에러:", postError);
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // likes 테이블에 INSERT
    const { error: likeError } = await supabase.from("likes").insert({
      post_id: postId,
      user_id: user.id,
    });

    // UNIQUE 제약조건 위반 (중복 좋아요) - 이미 좋아요한 경우 성공으로 처리
    if (likeError?.code === "23505") {
      console.log("이미 좋아요한 게시물 - 성공으로 처리");
      console.groupEnd();
      return NextResponse.json({ success: true, liked: true });
    }

    if (likeError) {
      console.error("좋아요 추가 에러:", likeError);
      return NextResponse.json(
        { error: "좋아요 추가에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("좋아요 추가 성공");
    console.groupEnd();

    return NextResponse.json({ success: true, liked: true });
  } catch (error) {
    console.error("좋아요 추가 API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.group("좋아요 제거 API 호출");

    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.error("인증되지 않은 사용자");
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "postId가 필요합니다." },
        { status: 400 }
      );
    }

    console.log("게시물 ID:", postId);
    console.log("사용자 ID (Clerk):", userId);

    const supabase = createClerkSupabaseClient();

    // users 테이블에서 clerk_id로 user_id 조회
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !user) {
      console.error("사용자 조회 에러:", userError);
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("사용자 ID (Supabase):", user.id);

    // likes 테이블에서 해당 레코드 DELETE
    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("좋아요 제거 에러:", deleteError);
      return NextResponse.json(
        { error: "좋아요 제거에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("좋아요 제거 성공");
    console.groupEnd();

    return NextResponse.json({ success: true, liked: false });
  } catch (error) {
    console.error("좋아요 제거 API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

