"use client";

import React from "react";
import Link from "next/link";
import { UserCommentItem } from "../../api/auth";

// 컴포넌트 props 타입 정의
interface UserCommentsListProps {
  comments: UserCommentItem[] | null; // 댓글 배열 (null 가능)
}

export default function UserCommentsList({ comments }: UserCommentsListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-black">내가 쓴 댓글</h3>

      {/* 댓글이 없을 경우 메시지 표시 */}
      {(!comments || comments.length === 0) && <p className="text-gray-600">작성한 댓글이 없습니다.</p>}

      {/* 댓글 목록 렌더링 */}
      {comments && comments.length > 0 && (
        <ul className="space-y-3">
          {comments
            .filter((comment) => !comment.deleted) // 삭제되지 않은 댓글만 표시
            .map((comment: UserCommentItem) => (
              <li key={comment.id} className="border-b pb-3 text-black">
                {/* 댓글 내용 */}
                <p className="mb-1">"{comment.content}"</p>
                <p className="text-sm text-gray-600">
                  {/* 작성일 형식 변환 */}
                  작성일:{" "}
                  {(() => {
                    try {
                      const datePart = comment.createdAt.split("T")[0];
                      const [year, month, day] = datePart.split("-").map(Number);
                      if (!year || !month || !day) throw new Error("Invalid date parts");
                      const date = new Date(year, month - 1, day);
                      if (isNaN(date.getTime())) throw new Error("Invalid Date object");
                      return `${year}. ${month}. ${day}`;
                    } catch (e) {
                      console.error("날짜 파싱 중 오류:", comment.createdAt, e);
                      return "날짜 형식 오류";
                    }
                  })()}{" "}
                  {/* 원본 게시글 링크 */}
                  <Link href={`/board/${comment.boardId}`} className="text-blue-600 hover:underline">
                    원본 게시글 보기
                  </Link>
                </p>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
