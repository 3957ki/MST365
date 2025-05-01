"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken } from "@/app/api/auth";
import { createComment, getComments, updateComment, deleteComment, CommentData } from "@/app/api/comment";

interface BoardDetailPageProps {
  params: {
    board_id: string;
  };
}

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
      setComments(data.filter((comment) => !comment.deleted)); // 🔥 삭제되지 않은 것만 표시
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

  return (
    <div className="container mx-auto p-8">
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

      <>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-black mb-4 border-b pb-2">
            더미 게시물 제목입니다.
          </h1>

          <div className="grid grid-cols-4 gap-4 border-b pb-2 mb-4 text-sm text-gray-600">
            <div>
              <span className="font-semibold">작성자:</span> 테스트 사용자
            </div>
            <div>
              <span className="font-semibold">조회수:</span> 123
            </div>
            <div className="col-span-2 text-right">
              <span className="font-semibold">등록일:</span> 2025-04-29
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <p>
              이것은 더미 게시물 내용입니다. 상세 페이지 확인을 위해 작성되었습니다.
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-5">
          <Link href={`/board/${board_id}/edit`}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
              수정
            </button>
          </Link>
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
            삭제
          </button>
          <Link href="/board">
            <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
              목록
            </button>
          </Link>
        </div>
      </>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">댓글</h3>
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border rounded-md p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-blue-600">user {comment.userId}</span>
                <span className="text-sm text-gray-500">
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt ? (
                    <>수정됨 · {new Date(comment.updatedAt).toLocaleString()}</>
                  ) : (
                    new Date(comment.createdAt).toLocaleString()
                  )}
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
                          await updateComment(Number(board_id), comment.id, editingContent, token);
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
                </>
              )}
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-2">댓글 작성</h4>
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
