/**
 * @file types.ts
 * @description 프로젝트 전역 TypeScript 타입 정의
 *
 * 데이터베이스 스키마와 일치하는 타입 정의
 * Supabase에서 반환되는 데이터 구조를 타입 안전하게 처리
 */

/**
 * 사용자 기본 정보
 */
export interface User {
  id: string;
  clerk_id: string;
  name: string;
  created_at: string;
}

/**
 * 게시물 기본 정보
 */
export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 사용자 정보가 포함된 게시물
 */
export interface PostWithUser extends Post {
  user: User;
}

/**
 * 통계 정보가 포함된 게시물
 */
export interface PostWithStats extends PostWithUser {
  likes_count: number;
  comments_count: number;
}

/**
 * 댓글 기본 정보
 */
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * 사용자 정보가 포함된 댓글
 */
export interface CommentWithUser extends Comment {
  user: Pick<User, "id" | "name">;
}

/**
 * API 응답 타입
 */
export interface PostsResponse {
  posts: PostWithComments[];
  hasMore: boolean;
  page: number;
}

/**
 * 게시물 상세 정보 (댓글 미리보기 포함)
 */
export interface PostWithComments extends PostWithStats {
  comments?: CommentWithUser[];
}

