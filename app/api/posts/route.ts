/**
 * @file route.ts
 * @description 게시물 목록 API
 *
 * GET /api/posts
 * - 페이지네이션 지원 (page 쿼리 파라미터)
 * - 시간 역순 정렬
 * - 사용자 정보 및 통계 포함
 * - 댓글 미리보기 (최신 2개)
 *
 * @dependencies
 * - lib/supabase/server: Supabase 클라이언트
 * - lib/types: 타입 정의
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { PostsResponse, PostWithComments } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

const POSTS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  try {
    console.group("게시물 목록 API 호출");
    const supabase = createClerkSupabaseClient();

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

    // 각 게시물의 최신 댓글 2개 가져오기
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

