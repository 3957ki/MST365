"use client";

import React from 'react'; // Removed useState, useEffect
import Link from 'next/link'; // Added Link import
import { UserPostItem } from '../../api/auth'; // Corrected UserPostItem import path
import './UserPostsList.css';

// Define the structure for component props
interface UserPostsListProps {
  posts: UserPostItem[] | null; // Prop for posts array (can be null)
  // Loading and error states will be handled by the parent component
}

// Define the structure of a post object (adjust based on your actual data structure)
// This internal 'Post' interface is no longer needed as we use UserPostItem from props
/*
interface Post {
  id: number;
  title: string;
  createdAt: string; // Or Date object
  view: number; // 조회수 추가
}
*/

// Mock function removed as data comes from props
// async function fetchUserPosts(): Promise<Post[]> { ... }

// Component signature changed to accept props
export default function UserPostsList({ posts }: UserPostsListProps) {
  // Internal state and useEffect removed
  // const [posts, setPosts] = useState<Post[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // useEffect(() => { ... }, []);

  // Loading and error display are handled by the parent component

  return (
    <div className="posts-list-container">
      <h3 className="posts-list-title">내가 쓴 글</h3>
      {/* Display message if posts is null or empty */}
      {(!posts || posts.length === 0) && (
        <p className="no-posts-text">작성한 게시글이 없습니다.</p>
      )}
      {/* Render list if posts array exists and is not empty */}
      {posts && posts.length > 0 && (
        <ul className="posts-list">
          {posts.map((post: UserPostItem) => ( // Added type annotation for post
            <li key={post.id} className="post-item">
              {/* Link to the post detail page */}
              <Link href={`/board/${post.id}`} className="post-link">
                <p className="post-title">{post.title}</p>
                {/* Use created_at field and format date safely */}
                <p className="post-meta">
                  작성일: {(() => {
                    // Removed debugging console.log
                    try {
                      // Use post.createdAt (camelCase)
                      const datePart = post.createdAt.split('T')[0];
                      const [year, month, day] = datePart.split('-').map(Number);

                      // Create Date object using year, month (0-indexed), day
                      // Validate parts before creating Date
                      if (!year || !month || !day) {
                        throw new Error("Invalid date parts");
                      }
                      // Month is 0-indexed (0 = January, 11 = December)
                      const date = new Date(year, month - 1, day);

                      // Check if the date object is valid
                      if (isNaN(date.getTime())) {
                         throw new Error("Invalid Date object");
                      }
                      // Format date as YYYY. MM. DD
                      return `${year}. ${month}. ${day}`;
                    } catch (e) {
                      // Use post.createdAt in error log
                      console.error("Error parsing date:", post.createdAt, e);
                      return "날짜 형식 오류"; // Return error message if parsing fails
                    }
                  })()}
                </p>
              </Link>
              <p className="post-views">조회수: {post.view}</p> {/* Display view count */}
            </li>
          ))}
        </ul>
      )}
      {/* Add pagination if needed */}
    </div>
  );
}
