"use client"; // 클라이언트 컴포넌트로 선언

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation"; // next/navigation 사용
import Image from "next/image";
import Link from "next/link";
import { getToken } from "@/app/api/auth"; // 경로 수정 (@ 사용)
import { getBoardById, updateBoard, BoardDetail } from "@/app/api/board"; // 경로 수정 (@ 사용) 및 BoardDetail 임포트
import "./page.css";

export default function BoardEditPage() {
  const router = useRouter();
  const params = useParams(); // useParams 훅 사용
  const board_id = params.board_id as string; // board_id 추출 및 타입 단언

  // 폼 입력 상태
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  // 데이터 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  // 게시물 수정 상태
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [errorUpdating, setErrorUpdating] = useState<string | null>(null);

  // 초기 데이터 로딩 useEffect
  useEffect(() => {
    if (!board_id) {
      // board_id가 없는 경우 (이론상 발생하기 어려움)
      setErrorLoading("게시물 ID를 찾을 수 없습니다.");
      setIsLoading(false);
      return;
    }

    const fetchBoardData = async () => {
      const token = getToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        router.push("/login"); // 로그인 페이지로 리다이렉션
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
  }, [board_id, router]); // 의존성 배열에 board_id와 router 추가

  // 폼 제출 핸들러
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); // 기본 폼 제출 방지

    // 클라이언트 측 유효성 검사: 제목 또는 내용이 비어있는지 확인
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
      const updateData = {
        title: title, // 현재 폼의 title 상태 값
        content: content, // 현재 폼의 content 상태 값
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
      <div className="loading-text-container">
        <p className="loading-text">게시물 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 게시물 없음 (404) UI
  if (notFound) {
    return (
      <div className="not-found-container">
        <h1 className="not-found-title">
          게시물을 찾을 수 없습니다.
        </h1>
        <p className="not-found-message">
          요청하신 게시물이 존재하지 않거나 삭제되었을 수 있습니다.
        </p>
        <Link href="/board" className="link-to-board">
          게시판 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 로딩 에러 UI
  if (errorLoading) {
    return (
      <div className="error-container">
        <h1 className="error-title">오류 발생</h1>
        <p className="error-message">{errorLoading}</p>
        <Link href="/board" className="link-to-board">
          게시판 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 기본 수정 폼 UI
  return (
    <div className="edit-page-container">
      <div className="header-container">
        <Link href="/board">
          <Image
            src="/microsoft.png" // 이미지 경로는 public 폴더 기준
            alt="Microsoft Logo"
            width={50}
            height={50}
            className="logo-image"
          />
        </Link>
        <h1 className="page-title">게시물 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        <div>
          <label htmlFor="title" className="form-label">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
            placeholder="제목을 입력하세요"
            disabled={isUpdating} // 수정 중 비활성화
          />
        </div>

        <div>
          <label htmlFor="content" className="form-label">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="content-textarea"
            placeholder="내용을 입력하세요"
            disabled={isUpdating} // 수정 중 비활성화
          />
        </div>

        {/* 수정 에러 메시지 표시 */}
        {errorUpdating && (
          <p className="update-error-message">{errorUpdating}</p>
        )}

        <div className="button-group">
          <button
            type="submit"
            className={`submit-button ${
              isUpdating
                ? "submit-button-disabled"
                : "submit-button-enabled"
            }`}
            disabled={isUpdating} // 수정 중 버튼 비활성화
          >
            {isUpdating ? "수정 중..." : "수정하기"}
          </button>
          <button
            type="button"
            onClick={() => router.back()} // 이전 페이지로 이동
            className="cancel-button"
            disabled={isUpdating} // 수정 중 취소 버튼도 비활성화 (선택적)
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
