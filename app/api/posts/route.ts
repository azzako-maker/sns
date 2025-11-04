/**
 * @file route.ts
 * @description 게시물 목록 및 작성 API
 *
 * GET /api/posts
 * - 페이지네이션 지원 (page 쿼리 파라미터)
 * - 시간 역순 정렬
 * - 사용자 정보 및 통계 포함
 * - 댓글 미리보기 (최신 2개)
 *
 * POST /api/posts
 * - 이미지 파일 업로드 (Supabase Storage)
 * - 게시물 정보 저장 (posts 테이블)
 * - Clerk 인증 필수
 *
 * @dependencies
 * - lib/supabase/server: Supabase 클라이언트 (Clerk 인증)
 * - lib/supabase/service-role: Supabase Service Role 클라이언트 (Storage 업로드)
 * - lib/types: 타입 정의
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { PostsResponse, PostWithComments } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const POSTS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  try {
    console.group("게시물 목록 API 호출");
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

    // 페이지 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const offset = (page - 1) * POSTS_PER_PAGE;
    const limit = POSTS_PER_PAGE;

    console.log("페이지:", page, "오프셋:", offset, "리미트:", limit);

    // post_stats 뷰에서 게시물 목록 조회 (통계 포함)
    const { data: postsData, error: postsError } = await supabase
      .from("post_stats")
      .select(
        `
        post_id,
        user_id,
        image_url,
        caption,
        created_at,
        likes_count,
        comments_count,
        user:users!post_stats_user_id_fkey (
          id,
          clerk_id,
          name
        )
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      console.error("게시물 조회 에러:", postsError);
      throw postsError;
    }

    if (!postsData) {
      return NextResponse.json<PostsResponse>(
        {
          posts: [],
          hasMore: false,
          page,
        },
        { status: 200 }
      );
    }

    console.log("조회된 게시물 수:", postsData.length);

    // 각 게시물의 최신 댓글 2개 및 좋아요 상태 가져오기
    const postsWithComments: PostWithComments[] = await Promise.all(
      postsData.map(async (postStat) => {
        // 댓글이 있는 경우에만 조회
        let comments: any[] = [];
        if (postStat.comments_count > 0) {
          const { data: commentsData, error: commentsError } = await supabase
            .from("comments")
            .select(
              `
              id,
              post_id,
              user_id,
              content,
              created_at,
              user:users!comments_user_id_fkey (
                id,
                name
              )
            `
            )
            .eq("post_id", postStat.post_id)
            .order("created_at", { ascending: false })
            .limit(2);

          if (commentsError) {
            console.error("댓글 조회 에러:", commentsError);
          } else if (commentsData) {
            comments = commentsData.map((comment) => ({
              id: comment.id,
              post_id: comment.post_id,
              user_id: comment.user_id,
              content: comment.content,
              created_at: comment.created_at,
              updated_at: comment.created_at,
              user: comment.user as { id: string; name: string },
            }));
          }
        }

        // 현재 사용자가 이 게시물을 좋아요했는지 확인
        let isLiked = false;
        if (currentUserId) {
          const { data: likeData } = await supabase
            .from("likes")
            .select("id")
            .eq("post_id", postStat.post_id)
            .eq("user_id", currentUserId)
            .single();

          isLiked = !!likeData;
        }

        return {
          id: postStat.post_id,
          user_id: postStat.user_id,
          image_url: postStat.image_url,
          caption: postStat.caption,
          created_at: postStat.created_at,
          updated_at: postStat.created_at, // post_stats에는 updated_at이 없으므로 created_at 사용
          user: postStat.user as { id: string; clerk_id: string; name: string },
          likes_count: Number(postStat.likes_count) || 0,
          comments_count: Number(postStat.comments_count) || 0,
          comments: comments,
          isLiked,
        };
      })
    );

    // 다음 페이지 존재 여부 확인
    const { count } = await supabase
      .from("post_stats")
      .select("*", { count: "exact", head: true });

    const totalPosts = count || 0;
    const hasMore = offset + limit < totalPosts;

    console.log("전체 게시물 수:", totalPosts, "더 불러올 게시물:", hasMore);
    console.groupEnd();

    return NextResponse.json<PostsResponse>(
      {
        posts: postsWithComments,
        hasMore,
        page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("게시물 목록 API 에러:", error);
    return NextResponse.json(
      { error: "게시물을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const STORAGE_BUCKET = "uploads";

export async function POST(request: NextRequest) {
  try {
    console.group("게시물 작성 API 호출");

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

    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const caption = (formData.get("caption") as string) || "";

    // 파일 검증
    if (!file) {
      console.error("파일이 없음");
      return NextResponse.json(
        { error: "이미지를 선택해주세요." },
        { status: 400 }
      );
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      console.error("파일 크기 초과:", file.size);
      return NextResponse.json(
        { error: "파일 크기는 5MB를 초과할 수 없습니다." },
        { status: 400 }
      );
    }

    // 파일 형식 검증
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      console.error("잘못된 파일 형식:", file.type);
      return NextResponse.json(
        { error: "JPG, PNG, WebP 형식만 업로드할 수 있습니다." },
        { status: 400 }
      );
    }

    // 캡션 길이 검증 (최대 2,200자)
    if (caption.length > 2200) {
      console.error("캡션 길이 초과:", caption.length);
      return NextResponse.json(
        { error: "캡션은 2,200자를 초과할 수 없습니다." },
        { status: 400 }
      );
    }

    console.log("파일 정보:", {
      name: file.name,
      size: file.size,
      type: file.type,
      captionLength: caption.length,
    });

    // Clerk Supabase 클라이언트로 users 테이블에서 user_id 조회
    const supabase = createClerkSupabaseClient();
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !user) {
      console.error("사용자 조회 에러:", userError);
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const userId = user.id;
    console.log("Supabase User ID:", userId);

    // 파일명 생성: {clerk_user_id}/{timestamp}-{random}.{ext}
    const fileExt = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `${clerkUserId}/${fileName}`;

    console.log("파일 경로:", filePath);

    // File 객체를 ArrayBuffer로 변환 (서버 환경에서 필요)
    console.log("파일을 ArrayBuffer로 변환 중...");
    const fileBuffer = await file.arrayBuffer();
    console.log("ArrayBuffer 변환 완료, 크기:", fileBuffer.byteLength);

    // Service Role 클라이언트로 Storage 업로드 (RLS 우회)
    const serviceRoleClient = getServiceRoleClient();
    const { data: uploadData, error: uploadError } = await serviceRoleClient.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Storage 업로드 에러:", uploadError);
      return NextResponse.json(
        { error: "파일 업로드에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("Storage 업로드 성공:", uploadData.path);

    // Public URL 생성
    const {
      data: { publicUrl },
    } = serviceRoleClient.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    console.log("Public URL:", publicUrl);

    // posts 테이블에 게시물 저장
    const { data: postData, error: postError } = await serviceRoleClient
      .from("posts")
      .insert({
        user_id: userId,
        image_url: publicUrl,
        caption: caption || null,
      })
      .select()
      .single();

    if (postError) {
      console.error("게시물 저장 에러:", postError);
      // 업로드된 파일 삭제 (롤백)
      await serviceRoleClient.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);
      return NextResponse.json(
        { error: "게시물 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("게시물 저장 성공:", postData.id);
    console.groupEnd();

    return NextResponse.json(
      {
        success: true,
        post: postData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("게시물 작성 API 에러:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "게시물 작성 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

