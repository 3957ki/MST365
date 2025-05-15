"use client";

import React from "react";
import Link from "next/link";
import { UserPostItem } from "../../api/auth";

// 사용자 게시글 목록 컴포넌트의 props 타입 정의
interface UserPostsListProps {
  posts: UserPostItem[] | null; // 게시글 배열 또는 null
}

export default function UserPostsList({ posts }: UserPostsListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-black">내가 쓴 글</h3>

      {/* 게시글이 없는 경우 */}
      {(!posts || posts.length === 0) && (
        <p className="text-gray-600">작성한 게시글이 없습니다.</p>
      )}

      {/* 게시글이 있는 경우 목록 렌더링 */}
      {posts && posts.length > 0 && (
        <ul className="space-y-2">
          {posts.map((post: UserPostItem) => (
            <li
              key={post.id}
              className="border-b pb-2 text-black flex justify-between items-center"
            >
              {/* 게시글 상세 페이지 링크 */}
              <Link
                href={`/board/${post.id}`}
                className="flex-grow mr-4 hover:text-blue-600"
              >
                {/* 게시글 제목 */}
                <p className="font-medium">{post.title}</p>
                {/* 작성일 포맷 */}
                <p className="text-sm text-gray-500">
                  작성일: {(() => {
                    try {
                      const datePart = post.createdAt.split("T")[0];
                      const [year, month, day] = datePart
                        .split("-")
                        .map(Number);
                      if (!year || !month || !day)
                        throw new Error("Invalid date parts");
                      const date = new Date(year, month - 1, day);
                      if (isNaN(date.getTime()))
                        throw new Error("Invalid Date object");
                      return `${year}. ${month}. ${day}`;
                    } catch (e) {
                      console.error("Error parsing date:", post.createdAt, e);
                      return "날짜 형식 오류";
                    }
                  })()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
