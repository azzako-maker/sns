/**
 * @file app/api/comments/route.ts
 * @description 댓글 작성 API
 *
 * POST /api/comments - 댓글 작성
 *
 * 주요 기능:
 * - Clerk 인증 확인
 * - 댓글 내용 검증
 * - comments 테이블에 댓글 저장
 * - 생성된 댓글 정보 반환 (사용자 정보 포함)
 *
 * @dependencies
 * - @clerk/nextjs: 인증
 * - @/lib/supabase/server: Supabase 서버 클라이언트
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * POST /api/comments
 * 댓글 작성
 */
export async function POST(request: NextRequest) {
  console.group("🔵 POST /api/comments - 댓글 작성 요청");

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

    // 2. 요청 본문 파싱
    console.log("2️⃣ 요청 본문 파싱 중...");
    const body = await request.json();
    const { postId, content } = body;

    console.log("- postId:", postId);
    console.log("- content 길이:", content?.length);

    // 3. 입력 검증
    console.log("3️⃣ 입력 검증 중...");
    if (!postId || typeof postId !== "string") {
      console.error("❌ postId 누락 또는 잘못된 형식");
      console.groupEnd();
      return NextResponse.json(
        { error: "게시물 ID가 필요합니다." },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      console.error("❌ content 누락 또는 빈 문자열");
      console.groupEnd();
      return NextResponse.json(
        { error: "댓글 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    if (content.length > 2200) {
      console.error("❌ content 길이 초과 (2200자 제한)");
      console.groupEnd();
      return NextResponse.json(
        { error: "댓글은 최대 2,200자까지 입력할 수 있습니다." },
        { status: 400 }
      );
    }

    console.log("✅ 입력 검증 완료");

    // 4. Supabase 클라이언트 생성
    console.log("4️⃣ Supabase 클라이언트 생성 중...");
    const supabase = createClerkSupabaseClient();

    // 5. users 테이블에서 clerk_id로 user_id 조회
    console.log("5️⃣ users 테이블에서 user_id 조회 중...");
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, name")
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

    console.log("✅ 사용자 조회 성공:", userData);

    // 6. 게시물 존재 여부 확인
    console.log("6️⃣ 게시물 존재 여부 확인 중...");
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single();

    if (postError || !postData) {
      console.error("❌ 게시물 조회 실패:", postError);
      console.groupEnd();
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("✅ 게시물 확인 완료:", postData.id);

    // 7. 댓글 저장
    console.log("7️⃣ 댓글 저장 중...");
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userData.id,
        content: content.trim(),
      })
      .select("id, post_id, user_id, content, created_at")
      .single();

    if (commentError || !commentData) {
      console.error("❌ 댓글 저장 실패:", commentError);
      console.groupEnd();
      return NextResponse.json(
        { error: "댓글 작성에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("✅ 댓글 저장 성공:", commentData.id);

    // 8. 사용자 정보를 포함한 댓글 반환
    const commentWithUser = {
      ...commentData,
      user: {
        id: userData.id,
        name: userData.name,
      },
    };

    console.log("✅ 댓글 작성 완료:", commentWithUser);
    console.groupEnd();

    return NextResponse.json(
      { comment: commentWithUser },
      { status: 201 }
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

