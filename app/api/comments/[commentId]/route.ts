/**
 * @file app/api/comments/[commentId]/route.ts
 * @description 댓글 삭제 API
 *
 * DELETE /api/comments/[commentId] - 댓글 삭제
 *
 * 주요 기능:
 * - Clerk 인증 확인
 * - 댓글 소유자 확인 (본인만 삭제 가능)
 * - comments 테이블에서 댓글 삭제
 *
 * @dependencies
 * - @clerk/nextjs: 인증
 * - @/lib/supabase/server: Supabase 서버 클라이언트
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ commentId: string }>;
}

/**
 * DELETE /api/comments/[commentId]
 * 댓글 삭제
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  console.group("🔴 DELETE /api/comments/[commentId] - 댓글 삭제 요청");

  try {
    // 1. Clerk 인증 확인
    console.log("1️⃣ Clerk 인증 확인 중...");
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      console.error("❌ 인증되지 않은 사용자");
      console.groupEnd();
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    console.log("✅ 인증된 Clerk User ID:", clerkUserId);

    // 2. commentId 파라미터 추출
    const params = await context.params;
    const { commentId } = params;

    console.log("2️⃣ commentId:", commentId);

    if (!commentId) {
      console.error("❌ commentId 누락");
      console.groupEnd();
      return NextResponse.json(
        { error: "댓글 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 3. Supabase 클라이언트 생성
    console.log("3️⃣ Supabase 클라이언트 생성 중...");
    const supabase = createClerkSupabaseClient();

    // 4. users 테이블에서 clerk_id로 user_id 조회
    console.log("4️⃣ users 테이블에서 user_id 조회 중...");
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      console.error("❌ 사용자 조회 실패:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const userId = userData.id;
    console.log("✅ 사용자 조회 성공:", userId);

    // 5. 댓글 조회 및 소유자 확인
    console.log("5️⃣ 댓글 소유자 확인 중...");
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .select("id, user_id, post_id")
      .eq("id", commentId)
      .single();

    if (commentError || !commentData) {
      console.error("❌ 댓글 조회 실패:", commentError);
      console.groupEnd();
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("✅ 댓글 조회 성공:", commentData);

    // 6. 소유자 확인 (본인만 삭제 가능)
    if (commentData.user_id !== userId) {
      console.error("❌ 권한 없음: 본인의 댓글이 아님");
      console.log("- 댓글 소유자:", commentData.user_id);
      console.log("- 현재 사용자:", userId);
      console.groupEnd();
      return NextResponse.json(
        { error: "본인의 댓글만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    console.log("✅ 소유자 확인 완료");

    // 7. 댓글 삭제
    console.log("7️⃣ 댓글 삭제 중...");
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      console.error("❌ 댓글 삭제 실패:", deleteError);
      console.groupEnd();
      return NextResponse.json(
        { error: "댓글 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("✅ 댓글 삭제 성공:", commentId);
    console.groupEnd();

    return NextResponse.json(
      {
        success: true,
        commentId,
        postId: commentData.post_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ 서버 에러:", error);
    console.groupEnd();
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

