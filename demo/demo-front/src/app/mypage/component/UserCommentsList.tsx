"use client";

import React from "react"; // Removed useState, useEffect
import Link from "next/link"; // Added Link import
import { UserCommentItem } from "../../api/auth"; // Added UserCommentItem import

// Define the structure for component props
interface UserCommentsListProps {
  comments: UserCommentItem[] | null; // Prop for comments array (can be null)
}

// Define the structure of a comment object (adjust based on your actual data structure)
// This internal 'Comment' interface is no longer needed as we use UserCommentItem from props
/*
interface Comment {
  id: number;
  content: string;
  postId: number; // ID of the post the comment belongs to
  postTitle: string; // Title of the post for context
  createdAt: string; // Or Date object
}
*/

// Mock function removed as data comes from props
// async function fetchUserComments(): Promise<Comment[]> { ... }

// Component signature changed to accept props
export default function UserCommentsList({ comments }: UserCommentsListProps) {
  // Internal state removed
  // const [comments, setComments] = useState<Comment[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // useEffect hook removed

  // Loading and error display are handled by the parent component

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-black">내가 쓴 댓글</h3>
      {/* Display message if comments is null or empty */}
      {(!comments || comments.length === 0) && <p className="text-gray-600">작성한 댓글이 없습니다.</p>}
      {/* Render list if comments array exists and is not empty */}
      {comments && comments.length > 0 && (
        <ul className="space-y-3">
          {comments
            .filter((comment) => !comment.deleted) // 삭제되지 않은 댓글만 필터링
            .map(
              (
                comment: UserCommentItem // Added type annotation
              ) => (
                <li key={comment.id} className="border-b pb-3 text-black">
                  <p className="mb-1">"{comment.content}"</p>
                  <p className="text-sm text-gray-600">
                    {/* Format createdAt date safely */}
                    작성일:{" "}
                    {(() => {
                      try {
                        const datePart = comment.createdAt.split("T")[0];
                        const [year, month, day] = datePart.split("-").map(Number);
                        if (!year || !month || !day) throw new Error("Invalid date parts");
                        const date = new Date(year, month - 1, day);
                        if (isNaN(date.getTime())) throw new Error("Invalid Date object");
                        return date.toLocaleDateString();
                      } catch (e) {
                        console.error("Error parsing comment date:", comment.createdAt, e);
                        return "날짜 형식 오류";
                      }
                    })()}
                    {/* Link to the original post using boardId */}|{" "}
                    <Link href={`/board/${comment.boardId}`} className="text-blue-600 hover:underline">
                      원본 게시글 보기
                    </Link>
                  </p>
                  {/* Optionally display deleted status */}
                  {/* {comment.deleted && <p className="text-xs text-red-500">(삭제된 댓글)</p>} */}
                </li>
              )
            )}
        </ul>
      )}
      {/* Add pagination if needed */}
    </div>
  );
}
