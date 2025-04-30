"use client";

import React, { useState, useEffect } from 'react';

// Define the structure of a comment object (adjust based on your actual data structure)
interface Comment {
  id: number;
  content: string;
  postId: number; // ID of the post the comment belongs to
  postTitle: string; // Title of the post for context
  createdAt: string; // Or Date object
}

// Mock function to fetch user comments - replace with your actual API call
async function fetchUserComments(): Promise<Comment[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1200)); // Slightly different delay
  // Return mock data
  return [
    { id: 101, content: "이 게시글 정말 유익하네요!", postId: 1, postTitle: "첫 번째 게시글 제목", createdAt: "2024-04-30" },
    { id: 102, content: "저도 동의합니다.", postId: 1, postTitle: "첫 번째 게시글 제목", createdAt: "2024-04-30" },
    { id: 103, content: "좋은 정보 감사합니다.", postId: 2, postTitle: "두 번째 게시글 제목", createdAt: "2024-04-29" },
  ];
}

export default function UserCommentsList() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const userComments = await fetchUserComments(); // Replace with actual API call
        setComments(userComments);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch user comments:", err);
        setError("댓글을 불러오는 데 실패했습니다.");
        setComments([]); // Clear comments on error
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-black">내가 쓴 댓글</h3>
      {loading && <p className="text-gray-600">댓글을 불러오는 중...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && comments.length === 0 && (
        <p className="text-gray-600">작성한 댓글이 없습니다.</p>
      )}
      {!loading && !error && comments.length > 0 && (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="border-b pb-3 text-black">
              <p className="mb-1">"{comment.content}"</p>
              <p className="text-sm text-gray-600">
                작성일: {comment.createdAt} | 원본 게시글: <span className="italic">{comment.postTitle}</span>
                {/* Add Link to the post if needed */}
                {/* <Link href={`/board/${comment.postId}`}><a> (게시글로 이동)</a></Link> */}
              </p>
            </li>
          ))}
        </ul>
      )}
      {/* Add pagination if needed */}
    </div>
  );
}
