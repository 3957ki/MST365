// "use client"; // Removed "use client" directive

import { useState, useEffect, FormEvent } from "react";
// import { useRouter, useParams } from "next/navigation"; // Removed next/navigation imports
// import Image from "next/image"; // Removed next/image import
// import Link from "next/link"; // Will use Link from react-router-dom
import { useNavigate, useParams, Link } from "react-router-dom"; // Import hooks and Link
import { getToken } from "../api-temp/auth"; // Corrected API path
import { getBoardById, updateBoard, BoardDetail } from "../api-temp/board"; // Corrected API path

export default function BoardEditPage() {
  const navigate = useNavigate(); // Use useNavigate
  const { board_id } = useParams<{ board_id: string }>(); // Use useParams directly
  // const router = useRouter(); // Removed
  // const params = useParams(); // Removed intermediate variable
  // const board_id = params.board_id as string; // Removed intermediate variable

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
        navigate("/login"); // navigate 사용
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
          // 필요하다면 여기서 사용자 ID 검증 로직 추가 가능 (프론트엔드 레벨)
          // const userInfo = getUserInfoFromToken(token); // 예시: 토큰에서 사용자 정보 추출
          // if (userInfo?.id !== boardData.userId) {
          //   setErrorLoading("이 게시물을 수정할 권한이 없습니다.");
          //   // 또는 접근 불가 페이지로 리다이렉션
          // }
        }
      } catch (error) {
        // getBoardById에서 throw된 에러 처리 (401, 403, 500 등)
        setErrorLoading(
          error instanceof Error
            ? error.message
            : "게시물 정보를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();
  }, [board_id, navigate]); // 의존성 배열에 navigate 추가

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
      // updateBoard 호출 시 업데이트할 데이터만 포함하는 객체 생성
      // 백엔드 API는 title, content 필드를 소문자로 받음
      const updateData = {
        title: title, // 현재 폼의 title 상태 값
        content: content, // 현재 폼의 content 상태 값
      };

      // API 호출 (board_id, 업데이트 데이터, 토큰 전달)
      // Add non-null assertion for board_id
      const updatedBoard = await updateBoard(board_id!, updateData, token);

      // 성공 시
      alert("게시물이 성공적으로 수정되었습니다.");
      navigate(`/board/${updatedBoard.id}`); // navigate 사용
    } catch (error) {
      // updateBoard에서 throw된 에러 처리 (400, 401, 403, 404, 500 등)
      setErrorUpdating(
        error instanceof Error
          ? error.message
          : "게시물 수정 중 오류가 발생했습니다."
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
        <Link to="/board" className="text-blue-600 hover:underline">
          {" "}
          {/* href -> to */}
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
        <Link to="/board" className="text-blue-600 hover:underline">
          {" "}
          {/* href -> to */}
          게시판 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 기본 수정 폼 UI
  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center mb-6">
        <Link to="/board">
          {" "}
          {/* href -> to */}
          {/* Replaced Image with img */}
          <img
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
          <label
            htmlFor="title"
            className="block text-black font-semibold mb-2"
          >
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
          <label
            htmlFor="content"
            className="block text-black font-semibold mb-2"
          >
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
            onClick={() => navigate(-1)} // navigate 사용 (뒤로 가기)
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
