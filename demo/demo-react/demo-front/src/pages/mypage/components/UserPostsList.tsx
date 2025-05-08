// "use client"; // Removed "use client" directive

import React from "react"; // Removed useState, useEffect
// import Link from "next/link"; // Removed next/link import
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { UserPostItem } from "../../../api-temp/auth"; // Corrected UserPostItem import path

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
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-black">내가 쓴 글</h3>
      {/* Display message if posts is null or empty */}
      {(!posts || posts.length === 0) && (
        <p className="text-gray-600">작성한 게시글이 없습니다.</p>
      )}
      {/* Render list if posts array exists and is not empty */}
      {posts && posts.length > 0 && (
        <ul className="space-y-2">
          {posts.map(
            (
              post: UserPostItem // Added type annotation for post
            ) => (
              <li
                key={post.id}
                className="border-b pb-2 text-black flex justify-between items-center"
              >
                {/* Link to the post detail page */}
                <Link
                  to={`/board/${post.id}`} // href -> to
                  className="flex-grow mr-4 hover:text-blue-600"
                >
                  <p className="font-medium">{post.title}</p>
                  {/* Use created_at field and format date safely */}
                  <p className="text-sm text-gray-500">
                    작성일:{" "}
                    {(() => {
                      // Removed debugging console.log
                      try {
                        // Use post.createdAt (camelCase)
                        const datePart = post.createdAt.split("T")[0];
                        const [year, month, day] = datePart
                          .split("-")
                          .map(Number);

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
                <p className="text-sm text-gray-500">조회수: {post.view}</p>{" "}
                {/* Display view count */}
              </li>
            )
          )}
        </ul>
      )}
      {/* Add pagination if needed */}
    </div>
  );
}
