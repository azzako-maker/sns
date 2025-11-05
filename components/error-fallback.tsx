"use client";

/**
 * @file error-fallback.tsx
 * @description 에러 폴백 UI 컴포넌트
 *
 * 간단한 에러 메시지를 표시하는 폴백 컴포넌트입니다.
 * 페이지별로 다른 에러 메시지를 표시할 수 있습니다.
 */

import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  title?: string;
  message?: string;
}

export default function ErrorFallback({
  error,
  resetErrorBoundary,
  title = "오류가 발생했습니다",
  message = "예상치 못한 오류가 발생했습니다. 다시 시도해주세요.",
}: ErrorFallbackProps) {
  console.error("❌ Error Fallback 렌더링:", error);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="bg-white border border-[#DBDBDB] rounded-lg p-8 max-w-md w-full text-center">
        <AlertCircle className="w-16 h-16 text-[#ED4956] mx-auto mb-4" />
        <h2 className="text-xl font-instagram-semibold text-[#262626] mb-2">
          {title}
        </h2>
        <p className="text-[#8E8E8E] text-instagram-sm mb-6">{message}</p>

        {/* 개발 환경에서만 에러 상세 정보 표시 */}
        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 text-left">
            <summary className="text-[#8E8E8E] text-instagram-xs cursor-pointer mb-2">
              에러 상세 정보 (개발 모드)
            </summary>
            <pre className="bg-[#FAFAFA] p-4 rounded text-xs overflow-auto max-h-40">
              {error.toString()}
              {error.stack && (
                <>
                  {"\n\n"}
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={resetErrorBoundary}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0095f6] text-white text-sm font-semibold rounded-lg hover:bg-[#0095f6]/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white text-[#0095f6] text-sm font-semibold rounded-lg border border-[#0095f6] hover:bg-[#FAFAFA] transition-colors"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    </div>
  );
}

