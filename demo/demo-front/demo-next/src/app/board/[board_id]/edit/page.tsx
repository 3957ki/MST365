"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getToken } from "@/app/api/auth";
import { getBoardById, updateBoard, BoardDetail } from "@/app/api/board";

export default function BoardEditPage() {
  const router = useRouter();
  const params = useParams();
  const board_id = params.board_id as string; // board_id 추출 및 타입 단언

  // 게시물 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  
  // 게시물 수정 상태
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [errorUpdating, setErrorUpdating] = useState<string | null>(null);

  // 입력 상태
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  // 초기 데이터 로딩 useEffect
  useEffect(() => {
    // board_id가 없는 경우 (이론상 발생하기 어려움)
    if (!board_id) {
      setErrorLoading("게시물 ID를 찾을 수 없습니다.");
      setIsLoading(false);
      return;
    }

    // 게시물 데이터 로딩 함수
    const fetchBoardData = async () => {
      const token = getToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      try {
        setIsLoading(true);
        setErrorLoading(null);
        setNotFound(false);

        const boardData = await getBoardById(board_id, token);

        if (boardData === null) {
          // 404 Not Found 처리
          setNotFound(true);
        } else {
          // 데이터 로딩 성공 시 폼 상태 업데이트
          setTitle(boardData.title);
          setContent(boardData.content);
        }
      } catch (error) {
        // getBoardById에서 throw된 에러 처리 (401, 403, 500 등)
        setErrorLoading(
          error instanceof Error ? error.message : "게시물 정보를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();
  }, [board_id, router]);

  // 폼 제출 핸들러
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // 제목 또는 내용이 모두 비어 있을 경우 경고
    if (!title.trim() && !content.trim()) {
      setErrorUpdating("수정할 제목이나 내용을 입력해주세요.");
      return;
    }

    setIsUpdating(true);
    setErrorUpdating(null);

    const token = getToken();
    if (!token) {
      setErrorUpdating("인증 토큰이 없습니다. 다시 로그인해주세요.");
      setIsUpdating(false);
      // 필요시 로그인 페이지로 리다이렉션
      // router.push('/login');
      return;
    }

    try {
      // updateBoard 호출 시 업데이트할 데이터만 포함하는 객체 생성
      const updateData = {
        title: title,
        content: content,
      };

      // API 호출 (board_id, 업데이트 데이터, 토큰 전달)
      const updatedBoard = await updateBoard(board_id, updateData, token);

      // 성공 시
      alert("게시물이 성공적으로 수정되었습니다.");
      router.push(`/board/${updatedBoard.id}`); // 수정된 게시물 상세 페이지로 이동
    } catch (error) {
      // updateBoard에서 throw된 에러 처리 (400, 401, 403, 404, 500 등)
      setErrorUpdating(
        error instanceof Error ? error.message : "게시물 수정 중 오류가 발생했습니다."
      );
    } finally {
      setIsUpdating(false); // 수정 상태 종료
    }
  };

  // 로딩 중 UI
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-black">게시물 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 게시물 없음 (404) UI
  if (notFound) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          게시물을 찾을 수 없습니다.
        </h1>
        <p className="text-black mb-4">
          요청하신 게시물이 존재하지 않거나 삭제되었을 수 있습니다.
        </p>
        <Link href="/board" className="text-blue-600 hover:underline">
          게시판 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 로딩 에러 UI
  if (errorLoading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
        <p className="text-red-500 mb-4">{errorLoading}</p>
        <Link href="/board" className="text-blue-600 hover:underline">
          게시판 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 기본 수정 폼 UI
  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center mb-6">
        <Link href="/board">
          <Image
            src="/microsoft.png" // 이미지 경로는 public 폴더 기준
            alt="Microsoft Logo"
            width={50}
            height={50}
            className="mr-5 cursor-pointer"
          />
        </Link>
        <h1 className="text-3xl font-bold text-black">게시물 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-black font-semibold mb-2">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-[80%] border border-gray-300 rounded-lg p-2 text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="제목을 입력하세요"
            disabled={isUpdating} // 수정 중 비활성화
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-black font-semibold mb-2">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-[80%] border border-gray-300 rounded-lg p-2 h-40 text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="내용을 입력하세요"
            disabled={isUpdating} // 수정 중 비활성화
          />
        </div>

        {/* 수정 에러 메시지 표시 */}
        {errorUpdating && (
          <p className="text-red-500 text-sm">{errorUpdating}</p>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            className={`py-2 px-4 rounded-lg text-white ${
              isUpdating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isUpdating} // 수정 중 버튼 비활성화
          >
            {isUpdating ? "수정 중..." : "수정하기"}
          </button>
          <button
            type="button"
            onClick={() => router.back()} // 이전 페이지로 이동
            className="py-2 px-4 rounded-lg bg-gray-300 text-black hover:bg-gray-400"
            disabled={isUpdating} // 수정 중 취소 버튼도 비활성화 (선택적)
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
