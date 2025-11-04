/**
 * @file time.ts
 * @description 시간 관련 유틸리티 함수
 *
 * 상대 시간 표시 (예: "3시간 전", "2일 전")
 * Instagram 스타일의 시간 표시 형식
 */

/**
 * 날짜 문자열을 상대 시간으로 변환
 *
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns 상대 시간 문자열 (예: "방금 전", "3시간 전", "2024-01-15")
 *
 * @example
 * ```ts
 * formatRelativeTime("2024-01-15T10:00:00Z") // "3시간 전"
 * formatRelativeTime("2024-01-10T10:00:00Z") // "2024-01-10"
 * ```
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // 1분 미만: "방금 전"
  if (diffSeconds < 60) {
    return "방금 전";
  }

  // 1시간 미만: "N분 전"
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  // 24시간 미만: "N시간 전"
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  // 7일 미만: "N일 전"
  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }

  // 7일 이상: "YYYY-MM-DD" 형식
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

