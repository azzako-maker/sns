"use client";

/**
 * @file CreatePostModal.tsx
 * @description 게시물 작성 모달 컴포넌트
 *
 * Instagram 스타일의 게시물 작성 모달:
 * - 이미지 업로드 및 미리보기
 * - 캡션 입력 (최대 2,200자)
 * - 파일 검증 (크기, 형식)
 * - 게시물 작성 (2-2 단계에서 API 연결)
 *
 * @dependencies
 * - components/ui/dialog: 모달 UI
 * - components/ui/button: 버튼
 * - components/ui/textarea: 텍스트 입력
 * - next/image: 이미지 최적화
 * - lucide-react: 아이콘
 */

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CAPTION_LENGTH = 2200;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export default function CreatePostModal({
  open,
  onOpenChange,
  onSuccess,
}: CreatePostModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.group("CreatePostModal 렌더링");
  console.log("모달 열림:", open);
  console.log("선택된 파일:", selectedFile?.name);
  console.log("캡션 길이:", caption.length);
  console.log("업로드 중:", isUploading);
  console.groupEnd();

  // Object URL 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 모달 닫을 때 상태 초기화
  useEffect(() => {
    if (!open) {
      // 모달이 닫힐 때 상태 초기화
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setCaption("");
      setError(null);
      setIsUploading(false);
    }
  }, [open, previewUrl]);

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      setError("파일 크기는 5MB를 초과할 수 없습니다.");
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // 이미지 형식 검증
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("JPG, PNG, WebP 형식만 업로드할 수 있습니다.");
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // 기존 previewUrl 정리
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // 미리보기 URL 생성
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);

    console.log("파일 선택 완료:", file.name, file.size, file.type);
  };

  // 파일 선택 버튼 클릭
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 이미지 교체
  const handleImageReplace = () => {
    // 기존 previewUrl 정리
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 게시물 작성
  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("이미지를 선택해주세요.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.group("게시물 작성 시작");
      console.log("파일:", selectedFile.name);
      console.log("파일 크기:", selectedFile.size);
      console.log("파일 타입:", selectedFile.type);
      console.log("캡션:", caption);
      console.log("캡션 길이:", caption.length);

      // FormData 생성
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("caption", caption);

      console.log("API 요청 시작: POST /api/posts");

      // API 호출
      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      console.log("API 응답 상태:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `게시물 작성에 실패했습니다. (${response.status})`;
        console.error("API 에러:", errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("게시물 작성 성공:", result);
      console.groupEnd();

      // 성공 시 모달 닫기 및 콜백 실행
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("게시물 작성 에러:", err);
      setError(
        err instanceof Error
          ? err.message
          : "게시물 작성에 실패했습니다."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // 글자 수 카운터 색상
  const getCounterColor = () => {
    if (caption.length >= MAX_CAPTION_LENGTH) {
      return "text-red-500";
    }
    if (caption.length >= 2000) {
      return "text-orange-500";
    }
    return "text-[#8E8E8E]";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-0 overflow-hidden">
        {/* 헤더 */}
        <DialogHeader className="px-6 py-4 border-b border-[#DBDBDB]">
          <DialogTitle className="text-instagram-base font-instagram-semibold text-[#262626]">
            새 게시물 만들기
          </DialogTitle>
        </DialogHeader>

        {/* 메인 컨텐츠 */}
        <div className="flex flex-col md:flex-row min-h-[400px]">
          {/* 이미지 영역 */}
          <div className="md:w-1/2 flex items-center justify-center bg-gray-50 border-b md:border-b-0 md:border-r border-[#DBDBDB]">
            {previewUrl ? (
              <div className="relative w-full h-full min-h-[400px] md:min-h-0 aspect-square">
                <Image
                  src={previewUrl}
                  alt="미리보기"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
                {/* 이미지 교체 버튼 */}
                <button
                  type="button"
                  onClick={handleImageReplace}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  aria-label="이미지 교체"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 w-full">
                <Upload className="w-16 h-16 text-[#8E8E8E] mb-4" />
                <p className="text-instagram-base font-instagram-semibold text-[#262626] mb-2">
                  사진을 여기에 끌어다 놓으세요
                </p>
                <Button
                  type="button"
                  onClick={handleFileButtonClick}
                  className="bg-[#0095f6] text-white hover:bg-[#0095f6]/90"
                >
                  컴퓨터에서 선택
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="이미지 파일 선택"
                />
              </div>
            )}
          </div>

          {/* 캡션 영역 */}
          <div className="md:w-1/2 flex flex-col p-4">
            <div className="flex items-center gap-3 mb-4">
              {/* 프로필 이미지 (기본 아바타) */}
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-gray-400">👤</span>
              </div>
              <span className="font-instagram-semibold text-[#262626]">
                사용자
              </span>
            </div>

            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={MAX_CAPTION_LENGTH}
              placeholder="문구 입력..."
              className="flex-1 min-h-[200px] resize-none border-[#DBDBDB] focus:border-[#0095f6] focus:ring-[#0095f6] text-[#262626] placeholder:text-[#8E8E8E]"
            />

            {/* 글자 수 카운터 */}
            <div className={`text-right text-instagram-xs mt-2 ${getCounterColor()}`}>
              {caption.length}/{MAX_CAPTION_LENGTH}
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="px-6 py-2 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-600" role="alert" aria-live="polite">
              {error}
            </p>
          </div>
        )}

        {/* 푸터 */}
        <DialogFooter className="px-6 py-4 border-t border-[#DBDBDB]">
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            className="bg-[#0095f6] text-white hover:bg-[#0095f6]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "공유 중..." : "공유"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

