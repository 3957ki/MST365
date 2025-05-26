import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// import Link from "next/link"; // Removed next/link import
import { Link } from "react-router-dom"; // Import Link from react-router-dom
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
export default function UserCommentsList(_a) {
    // Internal state removed
    // const [comments, setComments] = useState<Comment[]>([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);
    // useEffect hook removed
    var comments = _a.comments;
    // Loading and error display are handled by the parent component
    return (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h3", { className: "text-xl font-semibold mb-4 text-black", children: "\uB0B4\uAC00 \uC4F4 \uB313\uAE00" }), (!comments || comments.length === 0) && (_jsx("p", { className: "text-gray-600", children: "\uC791\uC131\uD55C \uB313\uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })), comments && comments.length > 0 && (_jsx("ul", { className: "space-y-3", children: comments.map(function (comment // Added type annotation
                ) { return (_jsxs("li", { className: "border-b pb-3 text-black", children: [_jsxs("p", { className: "mb-1", children: ["\"", comment.content, "\""] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["\uC791\uC131\uC77C:", " ", (function () {
                                    try {
                                        var datePart = comment.createdAt.split("T")[0];
                                        var _a = datePart
                                            .split("-")
                                            .map(Number), year = _a[0], month = _a[1], day = _a[2];
                                        if (!year || !month || !day)
                                            throw new Error("Invalid date parts");
                                        var date = new Date(year, month - 1, day);
                                        if (isNaN(date.getTime()))
                                            throw new Error("Invalid Date object");
                                        // Format date as YYYY. MM. DD
                                        return "".concat(year, ". ").concat(month, ". ").concat(day);
                                    }
                                    catch (e) {
                                        console.error("Error parsing comment date:", comment.createdAt, e);
                                        return "날짜 형식 오류";
                                    }
                                })(), " ", _jsx(Link, { to: "/board/".concat(comment.boardId), className: "text-blue-600 hover:underline", children: "\uC6D0\uBCF8 \uAC8C\uC2DC\uAE00 \uBCF4\uAE30" })] })] }, comment.id)); }) }))] }));
}
