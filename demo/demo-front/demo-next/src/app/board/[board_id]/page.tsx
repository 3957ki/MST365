"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, getUserId, getUserInfo, UserInfoData } from "../../api/auth";
import { getBoardById, BoardDetail, deleteBoard } from "../../api/board";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "@/app/api/comment";

interface CommentData {
  id: number;
  boardId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  deleted: boolean;
  userName?: string; // userName 속성 추가
}

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

  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState<CommentData[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const fetchComments = async () => {
    try {
      const data = await getComments(Number(board_id));
      const commentsWithUserNames = await Promise.all(
        data
          .filter((comment) => !comment.deleted)
          .map(async (comment) => {
            const token = getToken();
            if (token) {
              try {
                const userInfo = await getUserInfo(comment.userId, token);
                return {
                  ...comment,
                  userName: userInfo ? userInfo.userName : `ID: ${comment.userId}`,
                };
              } catch (error) {
                console.error("사용자 이름 조회 중 오류 발생:", error);
                return {
                  ...comment,
                  userName: `ID: ${comment.userId}`,
                };
              }
            } else {
              return {
                ...comment,
                userName: `ID: ${comment.userId}`,
              };
            }
          })
      );
      setComments(commentsWithUserNames);
    } catch (err: any) {
      console.error("댓글 불러오기 실패:", err.message);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [board_id]);

  const handleCommentSubmit = async () => {
    const token = getToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!commentContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      await createComment(Number(board_id), commentContent, token);
      alert("댓글이 작성되었습니다.");
      setCommentContent("");
      fetchComments();
    } catch (err: any) {
      alert(`댓글 작성 실패: ${err.message}`);
    }
  };

  const handleDelete = async (commentId: number) => {
    const token = getToken();
    if (!token) return alert("로그인이 필요합니다.");
    if (!confirm("정말로 삭제하시겠습니까?")) return;

    try {
      await deleteComment(Number(board_id), commentId, token);
      alert("댓글이 삭제되었습니다.");
      fetchComments();
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false); // 삭제 로딩 상태 추가
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserName = async () => {
      if (board && board.userId) {
        const token = getToken();
        if (token) {
          try {
            const userInfo = await getUserInfo(board.userId, token);
            if (userInfo && userInfo.userName) {
              setUserName(userInfo.userName);
            } else {
              setUserName(`ID: ${board.userId}`); // 사용자 이름이 없을 경우 ID 표시
            }
          } catch (error) {
            console.error("사용자 이름 조회 중 오류 발생:", error);
            setUserName(`ID: ${board.userId}`); // 오류 발생 시 ID 표시
          }
        }
      }
    };

    fetchUserName();
  }, [board]);

  // 게시물 삭제 처리 함수
  const handleDeleteBoard = async () => {
    if (!board) return; // 게시물 정보가 없으면 중단

    const confirmDelete = window.confirm(
      "정말로 이 게시물을 삭제하시겠습니까?"
    );
    if (!confirmDelete) {
      return; // 사용자가 취소하면 중단
    }

    setIsDeleting(true); // 삭제 시작
    setError(null); // 이전 에러 메시지 초기화

    try {
      const token = getToken();
      if (!token) {
        throw new Error("삭제 권한이 없습니다. 로그인이 필요합니다.");
      }

      await deleteBoard(board.id, token); // board.id 사용

      alert("게시물이 성공적으로 삭제되었습니다.");
      router.push("/board"); // 목록 페이지로 리다이렉션
    } catch (err: any) {
      console.error("게시물 삭제 오류:", err);
      setError(err.message || "게시물 삭제 중 오류가 발생했습니다.");
      alert(`삭제 실패: ${err.message || "알 수 없는 오류"}`); // 사용자에게 에러 알림
    } finally {
      setIsDeleting(false); // 삭제 종료 (성공/실패 무관)
    }
  };

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
        setError(
          err.message || "게시물 정보를 불러오는 중 오류가 발생했습니다."
        );
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
                <span className="font-semibold">작성자:</span> {userName ? userName : "로딩 중..."}
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
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDeleteBoard} // 삭제 핸들러 연결
                  disabled={isDeleting} // 삭제 중 비활성화
                >
                  {isDeleting ? "삭제 중..." : "삭제"}
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

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-black text-xl font-semibold mb-4 border-b pb-2">
          댓글
        </h3>
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border rounded-md p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-blue-600">
                  {comment.userName}
                </span>
                <span className="text-sm text-gray-500">
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt
                    ? `수정됨 · ${new Date(comment.updatedAt).toLocaleString()}`
                    : new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>

              {editingCommentId === comment.id ? (
                <>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-2 text-black mb-2"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={async () => {
                        const token = getToken();
                        if (!token) return alert("로그인이 필요합니다.");
                        try {
                          await updateComment(
                            Number(board_id),
                            comment.id,
                            editingContent,
                            token
                          );
                          alert("댓글이 수정되었습니다.");
                          setEditingCommentId(null);
                          setEditingContent("");
                          await fetchComments();
                        } catch (err: any) {
                          alert(`수정 실패: ${err.message}`);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg text-sm"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditingContent("");
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded-lg text-sm"
                    >
                      취소
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-800">{comment.content}</p>
                  {currentUserId === comment.userId && (
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg text-sm"
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditingContent(comment.content);
                        }}
                      >
                        수정
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm"
                        onClick={() => handleDelete(comment.id)}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <div>
          <h4 className="text-black text-lg font-semibold mb-2">댓글 작성</h4>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2 h-24 text-black mb-2"
            placeholder="댓글을 입력하세요"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <button
            onClick={handleCommentSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            댓글 등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardDetailPage;
