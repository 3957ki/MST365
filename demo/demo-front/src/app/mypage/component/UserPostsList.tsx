"use client";

import React, { useState, useEffect } from 'react';

// Define the structure of a post object (adjust based on your actual data structure)
interface Post {
  id: number;
  title: string;
  createdAt: string; // Or Date object
}

// Mock function to fetch user posts - replace with your actual API call
async function fetchUserPosts(): Promise<Post[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Return mock data
  return [
    { id: 1, title: "첫 번째 게시글 제목", createdAt: "2024-04-30" },
    { id: 2, title: "두 번째 게시글 제목", createdAt: "2024-04-29" },
    { id: 3, title: "세 번째 게시글 제목", createdAt: "2024-04-28" },
  ];
}

export default function UserPostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const userPosts = await fetchUserPosts(); // Replace with actual API call
        setPosts(userPosts);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch user posts:", err);
        setError("게시글을 불러오는 데 실패했습니다.");
        setPosts([]); // Clear posts on error
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-black">내가 쓴 글</h3>
      {loading && <p className="text-gray-600">게시글을 불러오는 중...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p className="text-gray-600">작성한 게시글이 없습니다.</p>
      )}
      {!loading && !error && posts.length > 0 && (
        <ul className="space-y-2">
          {posts.map((post) => (
            <li key={post.id} className="border-b pb-2 text-black">
              <p className="font-medium">{post.title}</p>
              <p className="text-sm text-gray-500">작성일: {post.createdAt}</p>
              {/* Add Link to post details page if needed */}
              {/* <Link href={`/board/${post.id}`}><a>자세히 보기</a></Link> */}
            </li>
          ))}
        </ul>
      )}
      {/* Add pagination if needed */}
    </div>
  );
}
