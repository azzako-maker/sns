/**
 * @file route.ts
 * @description 게시물 상세 정보 조회 및 삭제 API
 *
 * GET /api/posts/[postId]
 * - 게시물 상세 정보 조회
 * - 사용자 정보 포함
 * - 통계 정보 포함 (좋아요 수, 댓글 수)
 * - 전체 댓글 목록 포함 (최신 순)
 * - 좋아요 상태 확인
 *
 * DELETE /api/posts/[postId]
 * - 게시물 삭제
 * - 본인 게시물만 삭제 가능
 * - Storage 파일 삭제 (롤백)
 *
 * @dependencies
 * - lib/supabase/server: Supabase 클라이언트 (Clerk 인증)
 * - lib/supabase/service-role: Supabase Service Role 클라이언트 (Storage 삭제)
 * - lib/types: 타입 정의
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { PostWithComments } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    console.group("🔵 GET /api/posts/[postId] - 게시물 상세 정보 조회 API 호출");
    
    const { postId } = await params;
    console.log("게시물 ID:", postId);

    const supabase = createClerkSupabaseClient();

    // 현재 사용자 ID 가져오기 (Clerk)
    const { userId: clerkUserId } = await auth();
    let currentUserId: string | null = null;

    if (clerkUserId) {
      // users 테이블에서 clerk_id로 user_id 조회
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .single();

      if (user) {
        currentUserId = user.id;
        console.log("현재 사용자 ID (Supabase):", currentUserId);
      }
    }

    // 게시물 정보 조회
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select(
        `
        id,
        user_id,
        image_url,
        caption,
        created_at,
        updated_at,
        user:users!posts_user_id_fkey (
          id,
          clerk_id,
          name
        )
      `
      )
      .eq("id", postId)
      .single();

    if (postError) {
      console.error("❌ 게시물 조회 에러:", postError);
      console.groupEnd();
      
      if (postError.code === "PGRST116") {
        return NextResponse.json(
          { error: "게시물을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: "게시물 정보를 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    if (!postData) {
      console.error("게시물 데이터 없음");
      console.groupEnd();
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("게시물 데이터 조회 성공:", postData.id);

    // 좋아요 수 조회
    const { count: likesCount } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    // 댓글 수 조회
    const { count: commentsCount } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    // 전체 댓글 목록 조회 (최신 순)
    const { data: commentsData, error: commentsError } = await supabase
      .from("comments")
      .select(
        `
        id,
        post_id,
        user_id,
        content,
        created_at,
        updated_at,
        user:users!comments_user_id_fkey (
          id,
          name,
          clerk_id
        )
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true }); // 오래된 순 (인스타 스타일)

    if (commentsError) {
      console.error("댓글 조회 에러:", commentsError);
    }

    const comments = (commentsData || []).map((comment) => ({
      id: comment.id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user: comment.user as { id: string; name: string; clerk_id: string },
    }));

    // 현재 사용자가 이 게시물을 좋아요했는지 확인
    let isLiked = false;
    if (currentUserId) {
      const { data: likeData } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", currentUserId)
        .single();

      isLiked = !!likeData;
    }

    const post: PostWithComments = {
      id: postData.id,
      user_id: postData.user_id,
      image_url: postData.image_url,
      caption: postData.caption,
      created_at: postData.created_at,
      updated_at: postData.updated_at,
      user: postData.user as { id: string; clerk_id: string; name: string },
      likes_count: likesCount || 0,
      comments_count: commentsCount || 0,
      comments: comments,
      isLiked,
    };

    console.log("게시물 상세 정보 반환:", {
      id: post.id,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      comments_length: post.comments?.length || 0,
      isLiked: post.isLiked,
    });
    console.groupEnd();

    return NextResponse.json<PostWithComments>(post, { status: 200 });
  } catch (error) {
    console.error("❌ 게시물 상세 정보 조회 API 에러:", error);
    
    if (error instanceof Error) {
      console.error("에러 이름:", error.name);
      console.error("에러 메시지:", error.message);
      console.error("에러 스택:", error.stack);
    }
    
    console.groupEnd();
    
    return NextResponse.json(
      {
        error: "게시물 정보를 불러오는 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    console.group("🔴 DELETE /api/posts/[postId] - 게시물 삭제 API 호출");

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

    const { postId } = await params;
    console.log("게시물 ID:", postId);

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

    // 게시물 정보 조회 (본인 확인 및 이미지 URL 추출용)
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id, user_id, image_url")
      .eq("id", postId)
      .single();

    if (postError || !postData) {
      console.error("게시물 조회 에러:", postError);
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 본인 게시물 확인
    if (postData.user_id !== currentUser.id) {
      console.error("권한 없음 - 본인 게시물 아님");
      return NextResponse.json(
        { error: "본인의 게시물만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    console.log("게시물 소유자 확인 완료");

    // Storage 파일 경로 추출 (image_url에서)
    const imageUrl = postData.image_url;
    let filePath: string | null = null;
    
    // Supabase Storage URL에서 경로 추출
    // 예: https://xxx.supabase.co/storage/v1/object/public/uploads/user_id/filename.jpg
    // → uploads/user_id/filename.jpg
    if (imageUrl) {
      const match = imageUrl.match(/\/storage\/v1\/object\/public\/(.+)$/);
      if (match) {
        filePath = match[1];
        console.log("Storage 파일 경로:", filePath);
      }
    }

    // 게시물 삭제 (CASCADE로 관련 댓글, 좋아요도 자동 삭제)
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", currentUser.id); // 이중 확인

    if (deleteError) {
      console.error("게시물 삭제 에러:", deleteError);
      return NextResponse.json(
        { error: "게시물 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("게시물 삭제 성공");

    // Storage 파일 삭제 (선택적 - 실패해도 에러 반환하지 않음)
    if (filePath) {
      const serviceRoleClient = getServiceRoleClient();
      const bucket = "uploads";
      const pathParts = filePath.split("/");
      const fileName = pathParts.slice(1).join("/"); // user_id/filename.jpg

      const { error: storageError } = await serviceRoleClient.storage
        .from(bucket)
        .remove([fileName]);

      if (storageError) {
        console.error("Storage 파일 삭제 에러 (무시):", storageError);
        // Storage 삭제 실패해도 게시물은 이미 삭제되었으므로 에러 반환하지 않음
      } else {
        console.log("Storage 파일 삭제 성공:", fileName);
      }
    }

    console.groupEnd();

    return NextResponse.json(
      {
        success: true,
        message: "게시물이 삭제되었습니다.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ 게시물 삭제 API 에러:", error);

    if (error instanceof Error) {
      console.error("에러 이름:", error.name);
      console.error("에러 메시지:", error.message);
      console.error("에러 스택:", error.stack);
    }

    console.groupEnd();

    return NextResponse.json(
      {
        error: "게시물 삭제 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

