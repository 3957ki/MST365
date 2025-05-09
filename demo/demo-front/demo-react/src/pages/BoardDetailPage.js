var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// "use client"; // Removed "use client" directive
import { useState, useEffect } from "react";
// import Image from "next/image"; // Removed next/image import
// import Link from "next/link"; // Will use Link from react-router-dom
// import { useRouter } from "next/navigation"; // Will use useNavigate from react-router-dom
import { useParams, useNavigate, Link } from "react-router-dom"; // Import hooks and Link
import { getToken, getUserId } from "../api-temp/auth"; // Corrected API path
import { getBoardById, deleteBoard } from "../api-temp/board"; // Corrected API path
import { createComment, getComments, updateComment, deleteComment, } from "../api-temp/comment"; // Corrected API path
// interface BoardDetailPageProps removed
// 날짜 포맷 함수 (BoardTable과 유사하게)
var formatDateTime = function (dateString) {
    if (!dateString)
        return "";
    try {
        var date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "유효하지 않은 날짜";
        }
        // 날짜와 시간 모두 표시
        return date.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // 24시간 형식
        });
    }
    catch (error) {
        console.error("Error formatting date:", error);
        return "날짜 형식 오류";
    }
};
// const BoardDetailPage: React.FC<BoardDetailPageProps> = ({ params }) => { // Signature changed
var BoardDetailPage = function () {
    // Signature changed
    var board_id = useParams().board_id; // Use useParams
    var navigate = useNavigate(); // Use useNavigate
    // const router = useRouter(); // Removed
    var _a = useState(""), commentContent = _a[0], setCommentContent = _a[1];
    var _b = useState([]), comments = _b[0], setComments = _b[1];
    var _c = useState(null), editingCommentId = _c[0], setEditingCommentId = _c[1];
    var _d = useState(""), editingContent = _d[0], setEditingContent = _d[1];
    var fetchComments = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getComments(Number(board_id))];
                case 1:
                    data = _a.sent();
                    setComments(data.filter(function (comment) { return !comment.deleted; })); // 🔥 삭제되지 않은 것만 표시
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.error("댓글 불러오기 실패:", err_1.message);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        fetchComments();
    }, [board_id]);
    var handleCommentSubmit = function () { return __awaiter(void 0, void 0, void 0, function () {
        var token, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = getToken();
                    if (!token) {
                        alert("로그인이 필요합니다.");
                        return [2 /*return*/];
                    }
                    if (!commentContent.trim()) {
                        alert("댓글 내용을 입력해주세요.");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, createComment(Number(board_id), commentContent, token)];
                case 2:
                    _a.sent();
                    alert("댓글이 작성되었습니다.");
                    setCommentContent("");
                    fetchComments();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    alert("\uB313\uAE00 \uC791\uC131 \uC2E4\uD328: ".concat(err_2.message));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (commentId) { return __awaiter(void 0, void 0, void 0, function () {
        var token, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = getToken();
                    if (!token)
                        return [2 /*return*/, alert("로그인이 필요합니다.")];
                    if (!confirm("정말로 삭제하시겠습니까?"))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteComment(Number(board_id), commentId, token)];
                case 2:
                    _a.sent();
                    alert("댓글이 삭제되었습니다.");
                    fetchComments();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    alert("\uC0AD\uC81C \uC2E4\uD328: ".concat(err_3.message));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var _e = useState(null), board = _e[0], setBoard = _e[1];
    var _f = useState(true), isLoading = _f[0], setIsLoading = _f[1];
    var _g = useState(null), error = _g[0], setError = _g[1];
    var _h = useState(false), isNotFound = _h[0], setIsNotFound = _h[1];
    var _j = useState(null), currentUserId = _j[0], setCurrentUserId = _j[1];
    var _k = useState(false), isDeleting = _k[0], setIsDeleting = _k[1]; // 삭제 로딩 상태 추가
    // 게시물 삭제 처리 함수
    var handleDeleteBoard = function () { return __awaiter(void 0, void 0, void 0, function () {
        var confirmDelete, token, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!board)
                        return [2 /*return*/]; // 게시물 정보가 없으면 중단
                    confirmDelete = window.confirm("정말로 이 게시물을 삭제하시겠습니까?");
                    if (!confirmDelete) {
                        return [2 /*return*/]; // 사용자가 취소하면 중단
                    }
                    setIsDeleting(true); // 삭제 시작
                    setError(null); // 이전 에러 메시지 초기화
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    token = getToken();
                    if (!token) {
                        throw new Error("삭제 권한이 없습니다. 로그인이 필요합니다.");
                    }
                    return [4 /*yield*/, deleteBoard(board.id, token)];
                case 2:
                    _a.sent(); // board.id 사용
                    alert("게시물이 성공적으로 삭제되었습니다.");
                    navigate("/board"); // navigate 사용
                    return [3 /*break*/, 5];
                case 3:
                    err_4 = _a.sent();
                    console.error("게시물 삭제 오류:", err_4);
                    setError(err_4.message || "게시물 삭제 중 오류가 발생했습니다.");
                    alert("\uC0AD\uC81C \uC2E4\uD328: ".concat(err_4.message || "알 수 없는 오류")); // 사용자에게 에러 알림
                    return [3 /*break*/, 5];
                case 4:
                    setIsDeleting(false); // 삭제 종료 (성공/실패 무관)
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        var fetchBoardDetail = function () { return __awaiter(void 0, void 0, void 0, function () {
            var token, loggedInUserId, fetchedBoard, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        setError(null);
                        setIsNotFound(false);
                        setBoard(null); // 이전 데이터 초기화
                        token = getToken();
                        loggedInUserId = getUserId();
                        setCurrentUserId(loggedInUserId); // 현재 로그인 사용자 ID 저장
                        if (!token) {
                            setError("게시물 상세 정보를 보려면 로그인이 필요합니다.");
                            setIsLoading(false);
                            setTimeout(function () { return navigate("/login"); }, 1500); // navigate 사용
                            return [2 /*return*/];
                        }
                        if (!board_id) {
                            setError("게시물 ID가 유효하지 않습니다.");
                            setIsLoading(false);
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, getBoardById(board_id, token)];
                    case 2:
                        fetchedBoard = _a.sent();
                        if (fetchedBoard === null) {
                            setIsNotFound(true); // 404 Not Found
                        }
                        else {
                            setBoard(fetchedBoard); // 성공
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        err_5 = _a.sent();
                        // getBoardById에서 throw된 에러 처리
                        setError(err_5.message || "게시물 정보를 불러오는 중 오류가 발생했습니다.");
                        if (err_5.message === "인증되지 않았습니다.") {
                            // 401 에러 시 로그인 페이지로 리다이렉션 고려
                            // setTimeout(() => navigate("/login"), 1500); // navigate 사용
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchBoardDetail();
    }, [board_id, navigate]); // 의존성 배열에 navigate 추가
    // 로딩 중 UI
    if (isLoading) {
        return (_jsx("div", { className: "container mx-auto p-8 text-center", children: "\uAC8C\uC2DC\uBB3C \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911..." }));
    }
    // 에러 발생 UI
    if (error) {
        return (_jsxs("div", { className: "container mx-auto p-8", children: [_jsxs("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4", role: "alert", children: [_jsx("strong", { className: "font-bold", children: "\uC624\uB958 \uBC1C\uC0DD:" }), _jsxs("span", { className: "block sm:inline", children: [" ", error] })] }), _jsxs(Link, { to: "/board", children: [" ", _jsx("button", { className: "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg", children: "\uBAA9\uB85D\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30" })] })] }));
    }
    // 게시물 없음 (404) UI
    if (isNotFound) {
        return (_jsxs("div", { className: "container mx-auto p-8 text-center", children: [_jsx("p", { className: "mb-4", children: "\uC694\uCCAD\uD558\uC2E0 \uAC8C\uC2DC\uBB3C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." }), _jsxs(Link, { to: "/board", children: [" ", _jsx("button", { className: "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg", children: "\uBAA9\uB85D\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30" })] })] }));
    }
    // 게시물 상세 정보 표시 UI (성공 시)
    return (_jsxs("div", { className: "container mx-auto p-8", children: [_jsx("div", { className: "flex items-center mb-6", children: _jsxs(Link, { to: "/board", children: [" ", _jsx("img", { src: "/microsoft.png", alt: "Microsoft Logo", width: 50, height: 50, className: "mr-5 cursor-pointer" })] }) }), board && ( // board 데이터가 있을 때만 렌더링
            _jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-white shadow-md rounded-lg p-6 mb-6", children: [_jsx("h1", { className: "text-2xl font-bold text-black mb-4 border-b pb-2", children: board.title }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-2 mb-4 text-sm text-gray-600", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "\uC791\uC131\uC790 ID:" }), " ", board.userId] }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold", children: "\uC870\uD68C\uC218:" }), " ", board.view] }), _jsxs("div", { className: "md:col-span-1 md:text-right", children: [_jsx("span", { className: "font-semibold", children: "\uB4F1\uB85D\uC77C:" }), " ", formatDateTime(board.createdAt)] })] }), _jsx("div", { className: "prose max-w-none mb-6 text-black", style: { whiteSpace: "pre-wrap" }, children: board.content })] }), _jsxs("div", { className: "flex justify-end space-x-2 mt-5", children: [currentUserId === board.userId && ( // 현재 사용자가 작성자인 경우 수정/삭제 버튼 표시
                            _jsxs(_Fragment, { children: [_jsxs(Link, { to: "/board/".concat(board.id, "/edit"), children: [" ", _jsx("button", { className: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg", children: "\uC218\uC815" })] }), _jsx("button", { className: "bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed", onClick: handleDeleteBoard, disabled: isDeleting, children: isDeleting ? "삭제 중..." : "삭제" })] })), _jsxs(Link, { to: "/board", children: [" ", _jsx("button", { className: "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg", children: "\uBAA9\uB85D" })] })] })] })), _jsxs("div", { className: "bg-white shadow-md rounded-lg p-6", children: [_jsx("h3", { className: "text-black text-xl font-semibold mb-4 border-b pb-2", children: "\uB313\uAE00" }), _jsx("div", { className: "space-y-4 mb-6", children: comments.map(function (comment) { return (_jsxs("div", { className: "border rounded-md p-4 bg-gray-50", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsxs("span", { className: "font-semibold text-blue-600", children: ["user ", comment.userId] }), _jsx("span", { className: "text-sm text-gray-500", children: comment.updatedAt && comment.updatedAt !== comment.createdAt
                                                ? "\uC218\uC815\uB428 \u00B7 ".concat(new Date(comment.updatedAt).toLocaleString())
                                                : new Date(comment.createdAt).toLocaleString() })] }), editingCommentId === comment.id ? (_jsxs(_Fragment, { children: [_jsx("textarea", { className: "w-full border border-gray-300 rounded-lg p-2 text-black mb-2", value: editingContent, onChange: function (e) { return setEditingContent(e.target.value); } }), _jsxs("div", { className: "flex justify-end space-x-2 mt-2", children: [_jsx("button", { onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                                        var token, err_6;
                                                        return __generator(this, function (_a) {
                                                            switch (_a.label) {
                                                                case 0:
                                                                    token = getToken();
                                                                    if (!token)
                                                                        return [2 /*return*/, alert("로그인이 필요합니다.")];
                                                                    _a.label = 1;
                                                                case 1:
                                                                    _a.trys.push([1, 4, , 5]);
                                                                    return [4 /*yield*/, updateComment(Number(board_id), comment.id, editingContent, token)];
                                                                case 2:
                                                                    _a.sent();
                                                                    alert("댓글이 수정되었습니다.");
                                                                    setEditingCommentId(null);
                                                                    setEditingContent("");
                                                                    return [4 /*yield*/, fetchComments()];
                                                                case 3:
                                                                    _a.sent();
                                                                    return [3 /*break*/, 5];
                                                                case 4:
                                                                    err_6 = _a.sent();
                                                                    alert("\uC218\uC815 \uC2E4\uD328: ".concat(err_6.message));
                                                                    return [3 /*break*/, 5];
                                                                case 5: return [2 /*return*/];
                                                            }
                                                        });
                                                    }); }, className: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg text-sm", children: "\uC800\uC7A5" }), _jsx("button", { onClick: function () {
                                                        setEditingCommentId(null);
                                                        setEditingContent("");
                                                    }, className: "bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded-lg text-sm", children: "\uCDE8\uC18C" })] })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-gray-800", children: comment.content }), currentUserId === comment.userId && (_jsxs("div", { className: "flex justify-end space-x-2 mt-2", children: [_jsx("button", { className: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg text-sm", onClick: function () {
                                                        setEditingCommentId(comment.id);
                                                        setEditingContent(comment.content);
                                                    }, children: "\uC218\uC815" }), _jsx("button", { className: "bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm", onClick: function () { return handleDelete(comment.id); }, children: "\uC0AD\uC81C" })] }))] }))] }, comment.id)); }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-black text-lg font-semibold mb-2", children: "\uB313\uAE00 \uC791\uC131" }), _jsx("textarea", { className: "w-full border border-gray-300 rounded-lg p-2 h-24 text-black mb-2", placeholder: "\uB313\uAE00\uC744 \uC785\uB825\uD558\uC138\uC694", value: commentContent, onChange: function (e) { return setCommentContent(e.target.value); } }), _jsx("button", { onClick: handleCommentSubmit, className: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg", children: "\uB313\uAE00 \uB4F1\uB85D" })] })] })] }));
};
export default BoardDetailPage;
