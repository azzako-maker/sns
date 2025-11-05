"use client";

/**
 * @file error-boundary.tsx
 * @description 에러 바운더리 컴포넌트
 *
 * React Error Boundary를 사용하여 에러를 처리하고 사용자 친화적인 UI를 표시합니다.
 * - 전역 에러 처리
 * - 에러 상세 정보 표시 (개발 환경)
 * - 재시도 기능
 *
 * @dependencies
 * - React Error Boundary 패턴
 */

import { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error("❌ Error Boundary에서 에러 감지:", error);
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("❌ Error Boundary 상세 정보:");
    console.error("- 에러:", error);
    console.error("- 에러 정보:", errorInfo);
  }

  handleReset = () => {
    console.log("🔄 에러 상태 초기화");
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="bg-white border border-[#DBDBDB] rounded-lg p-8 max-w-md w-full text-center">
            <AlertCircle className="w-16 h-16 text-[#ED4956] mx-auto mb-4" />
            <h2 className="text-xl font-instagram-semibold text-[#262626] mb-2">
              오류가 발생했습니다
            </h2>
            <p className="text-[#8E8E8E] text-instagram-sm mb-6">
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시 시도해주세요.
            </p>

            {/* 개발 환경에서만 에러 상세 정보 표시 */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-[#8E8E8E] text-instagram-xs cursor-pointer mb-2">
                  에러 상세 정보 (개발 모드)
                </summary>
                <pre className="bg-[#FAFAFA] p-4 rounded text-xs overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.error.stack && (
                    <>
                      {"\n\n"}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={this.handleReset}
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

    return this.props.children;
  }
}

