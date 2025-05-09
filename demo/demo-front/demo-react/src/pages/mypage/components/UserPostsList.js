import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// import Link from "next/link"; // Removed next/link import
import { Link } from "react-router-dom"; // Import Link from react-router-dom
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
export default function UserPostsList(_a) {
    // Internal state and useEffect removed
    // const [posts, setPosts] = useState<Post[]>([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);
    // useEffect(() => { ... }, []);
    var posts = _a.posts;
    // Loading and error display are handled by the parent component
    return (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md mb-6", children: [_jsx("h3", { className: "text-xl font-semibold mb-4 text-black", children: "\uB0B4\uAC00 \uC4F4 \uAE00" }), (!posts || posts.length === 0) && (_jsx("p", { className: "text-gray-600", children: "\uC791\uC131\uD55C \uAC8C\uC2DC\uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })), posts && posts.length > 0 && (_jsx("ul", { className: "space-y-2", children: posts.map(function (post // Added type annotation for post
                ) { return (_jsxs("li", { className: "border-b pb-2 text-black flex justify-between items-center", children: [_jsxs(Link, { to: "/board/".concat(post.id), className: "flex-grow mr-4 hover:text-blue-600", children: [_jsx("p", { className: "font-medium", children: post.title }), _jsxs("p", { className: "text-sm text-gray-500", children: ["\uC791\uC131\uC77C:", " ", (function () {
                                            // Removed debugging console.log
                                            try {
                                                // Use post.createdAt (camelCase)
                                                var datePart = post.createdAt.split("T")[0];
                                                var _a = datePart
                                                    .split("-")
                                                    .map(Number), year = _a[0], month = _a[1], day = _a[2];
                                                // Create Date object using year, month (0-indexed), day
                                                // Validate parts before creating Date
                                                if (!year || !month || !day) {
                                                    throw new Error("Invalid date parts");
                                                }
                                                // Month is 0-indexed (0 = January, 11 = December)
                                                var date = new Date(year, month - 1, day);
                                                // Check if the date object is valid
                                                if (isNaN(date.getTime())) {
                                                    throw new Error("Invalid Date object");
                                                }
                                                // Format date as YYYY. MM. DD
                                                return "".concat(year, ". ").concat(month, ". ").concat(day);
                                            }
                                            catch (e) {
                                                // Use post.createdAt in error log
                                                console.error("Error parsing date:", post.createdAt, e);
                                                return "날짜 형식 오류"; // Return error message if parsing fails
                                            }
                                        })()] })] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["\uC870\uD68C\uC218: ", post.view] }), " "] }, post.id)); }) }))] }));
}
