"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, getUserId } from "../../api/auth"; // auth API 임포트
import { getBoardById, BoardDetail } from "../../api/board"; // board API 임포트

interface BoardDetailPageProps {
  params: {
    board_id: string; // 경로 파라미터
  };
}

// 날짜 포맷 함수 (BoardTable과 유사하게)
const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "유효하지 않은 날짜";
    }
    // 날짜와 시간 모두 표시
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // 24시간 형식
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "날짜 형식 오류";
  }
};

const BoardDetailPage: React.FC<BoardDetailPageProps> = ({ params }) => {
  const { board_id } = params;
  const router = useRouter();

  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchBoardDetail = async () => {
      setIsLoading(true);
      setError(null);
      setIsNotFound(false);
      setBoard(null); // 이전 데이터 초기화

      const token = getToken();
      const loggedInUserId = getUserId();
      setCurrentUserId(loggedInUserId); // 현재 로그인 사용자 ID 저장

      if (!token) {
        setError("게시물 상세 정보를 보려면 로그인이 필요합니다.");
        setIsLoading(false);
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      if (!board_id) {
        setError("게시물 ID가 유효하지 않습니다.");
        setIsLoading(false);
        return;
      }

      try {
        const fetchedBoard = await getBoardById(board_id, token);

        if (fetchedBoard === null) {
          setIsNotFound(true); // 404 Not Found
        } else {
          setBoard(fetchedBoard); // 성공
        }
      } catch (err: any) {
        // getBoardById에서 throw된 에러 처리
        setError(err.message || "게시물 정보를 불러오는 중 오류가 발생했습니다.");
        if (err.message === "인증되지 않았습니다.") {
          // 401 에러 시 로그인 페이지로 리다이렉션 고려
          // setTimeout(() => router.push("/login"), 1500);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardDetail();
  }, [board_id, router]); // board_id가 변경될 때마다 실행

  // 로딩 중 UI
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 text-center">
        게시물 정보를 불러오는 중...
      </div>
    );
  }

  // 에러 발생 UI
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">오류 발생:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <Link href="/board">
          <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
            목록으로 돌아가기
          </button>
        </Link>
      </div>
    );
  }

  // 게시물 없음 (404) UI
  if (isNotFound) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="mb-4">요청하신 게시물을 찾을 수 없습니다.</p>
        <Link href="/board">
          <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
            목록으로 돌아가기
          </button>
        </Link>
      </div>
    );
  }

  // 게시물 상세 정보 표시 UI (성공 시)
  return (
    <div className="container mx-auto p-8">
      {/* 헤더 (로고 등) */}
      <div className="flex items-center mb-6">
        <Link href="/board">
          <Image
            src="/microsoft.png"
            alt="Microsoft Logo"
            width={50}
            height={50}
            className="mr-5 cursor-pointer"
          />
        </Link>
      </div>

      {/* 게시물 내용 */}
      {board && ( // board 데이터가 있을 때만 렌더링
        <>
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            {/* 제목 */}
            <h1 className="text-2xl font-bold text-black mb-4 border-b pb-2">
              {board.title}
            </h1>

            {/* 메타 정보 (작성자, 조회수, 등록일, 수정일) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-2 mb-4 text-sm text-gray-600">
              <div>
                <span className="font-semibold">작성자 ID:</span> {board.userId}
                {/* TODO: 사용자 이름 표시 기능 추가 */}
              </div>
              <div>
                <span className="font-semibold">조회수:</span> {board.view}
              </div>
              <div className="md:col-span-1 md:text-right">
                <span className="font-semibold">등록일:</span>{" "}
                 {formatDateTime(board.createdAt)}
               </div>
               {/* 수정일 표시 제거 */}
             </div>

            {/* 본문 내용 */}
            {/* dangerouslySetInnerHTML은 XSS 공격에 취약할 수 있으므로,
                내용이 안전하다고 보장되거나 sanitizer 라이브러리를 사용할 때만 고려.
                일반 텍스트는 <p> 또는 <pre> 태그 사용 권장 */}
            <div
              className="prose max-w-none mb-6 text-black"
              style={{ whiteSpace: "pre-wrap" }} // 줄바꿈 유지
            >
              {board.content}
            </div>
          </div>

          {/* 버튼 영역 (수정/삭제/목록) */}
          <div className="flex justify-end space-x-2 mt-5">
            {currentUserId === board.userId && ( // 현재 사용자가 작성자인 경우 수정/삭제 버튼 표시
              <>
                <Link href={`/board/${board.id}/edit`}>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    수정
                  </button>
                </Link>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                  // TODO: 삭제 기능 구현 (별도 API 호출 필요)
                  onClick={() => alert("삭제 기능은 아직 구현되지 않았습니다.")}
                >
                  삭제
                </button>
              </>
            )}
            <Link href="/board">
              <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
                목록
              </button>
            </Link>
          </div>
        </>
      )}

      {/* 댓글 영역 (기존 하드코딩 유지 - 별도 작업) */}
      {board && ( // 게시물이 로드된 후에만 댓글 영역 표시
        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            댓글 (기능 구현 예정)
          </h3>
          {/* 댓글 목록 및 작성 폼 (하드코딩) */}
          <div className="space-y-4 mb-6">
            {/* Dummy Comment 1 */}
            <div className="border rounded-md p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-blue-600">댓글러1</span>
                <span className="text-sm text-gray-500">10분 전</span>
              </div>
              <p className="text-gray-800">첫 번째 더미 댓글입니다.</p>
            </div>
            {/* ... 다른 더미 댓글들 ... */}
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">댓글 작성</h4>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 h-24 text-black mb-2"
              placeholder="댓글을 입력하세요 (기능 구현 예정)"
              disabled // 기능 구현 전까지 비활성화
            />
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
              disabled // 기능 구현 전까지 비활성화
            >
              댓글 등록
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDetailPage;
