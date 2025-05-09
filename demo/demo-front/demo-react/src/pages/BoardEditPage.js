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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// "use client"; // Removed "use client" directive
import { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation"; // Removed next/navigation imports
// import Image from "next/image"; // Removed next/image import
// import Link from "next/link"; // Will use Link from react-router-dom
import { useNavigate, useParams, Link } from "react-router-dom"; // Import hooks and Link
import { getToken } from "../api-temp/auth"; // Corrected API path
import { getBoardById, updateBoard } from "../api-temp/board"; // Corrected API path
export default function BoardEditPage() {
    var _this = this;
    var navigate = useNavigate(); // Use useNavigate
    var board_id = useParams().board_id; // Use useParams directly
    // const router = useRouter(); // Removed
    // const params = useParams(); // Removed intermediate variable
    // const board_id = params.board_id as string; // Removed intermediate variable
    // 폼 입력 상태
    var _a = useState(""), title = _a[0], setTitle = _a[1];
    var _b = useState(""), content = _b[0], setContent = _b[1];
    // 데이터 로딩 상태
    var _c = useState(true), isLoading = _c[0], setIsLoading = _c[1];
    var _d = useState(null), errorLoading = _d[0], setErrorLoading = _d[1];
    var _e = useState(false), notFound = _e[0], setNotFound = _e[1];
    // 게시물 수정 상태
    var _f = useState(false), isUpdating = _f[0], setIsUpdating = _f[1];
    var _g = useState(null), errorUpdating = _g[0], setErrorUpdating = _g[1];
    // 초기 데이터 로딩 useEffect
    useEffect(function () {
        if (!board_id) {
            // board_id가 없는 경우 (이론상 발생하기 어려움)
            setErrorLoading("게시물 ID를 찾을 수 없습니다.");
            setIsLoading(false);
            return;
        }
        var fetchBoardData = function () { return __awaiter(_this, void 0, void 0, function () {
            var token, boardData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = getToken();
                        if (!token) {
                            alert("로그인이 필요합니다.");
                            navigate("/login"); // navigate 사용
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        setIsLoading(true);
                        setErrorLoading(null);
                        setNotFound(false);
                        return [4 /*yield*/, getBoardById(board_id, token)];
                    case 2:
                        boardData = _a.sent();
                        if (boardData === null) {
                            // 404 Not Found 처리
                            setNotFound(true);
                        }
                        else {
                            // 데이터 로딩 성공 시 폼 상태 업데이트
                            setTitle(boardData.title);
                            setContent(boardData.content);
                            // 필요하다면 여기서 사용자 ID 검증 로직 추가 가능 (프론트엔드 레벨)
                            // const userInfo = getUserInfoFromToken(token); // 예시: 토큰에서 사용자 정보 추출
                            // if (userInfo?.id !== boardData.userId) {
                            //   setErrorLoading("이 게시물을 수정할 권한이 없습니다.");
                            //   // 또는 접근 불가 페이지로 리다이렉션
                            // }
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        // getBoardById에서 throw된 에러 처리 (401, 403, 500 등)
                        setErrorLoading(error_1 instanceof Error
                            ? error_1.message
                            : "게시물 정보를 불러오는 중 오류가 발생했습니다.");
                        return [3 /*break*/, 5];
                    case 4:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchBoardData();
    }, [board_id, navigate]); // 의존성 배열에 navigate 추가
    // 폼 제출 핸들러
    var handleSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var token, updateData, updatedBoard, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault(); // 기본 폼 제출 방지
                    // 클라이언트 측 유효성 검사: 제목 또는 내용이 비어있는지 확인
                    if (!title.trim() && !content.trim()) {
                        setErrorUpdating("수정할 제목이나 내용을 입력해주세요.");
                        return [2 /*return*/];
                    }
                    setIsUpdating(true);
                    setErrorUpdating(null);
                    token = getToken();
                    if (!token) {
                        setErrorUpdating("인증 토큰이 없습니다. 다시 로그인해주세요.");
                        setIsUpdating(false);
                        // 필요시 로그인 페이지로 리다이렉션
                        // router.push('/login');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    updateData = {
                        title: title, // 현재 폼의 title 상태 값
                        content: content, // 현재 폼의 content 상태 값
                    };
                    return [4 /*yield*/, updateBoard(board_id, updateData, token)];
                case 2:
                    updatedBoard = _a.sent();
                    // 성공 시
                    alert("게시물이 성공적으로 수정되었습니다.");
                    navigate("/board/".concat(updatedBoard.id)); // navigate 사용
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    // updateBoard에서 throw된 에러 처리 (400, 401, 403, 404, 500 등)
                    setErrorUpdating(error_2 instanceof Error
                        ? error_2.message
                        : "게시물 수정 중 오류가 발생했습니다.");
                    return [3 /*break*/, 5];
                case 4:
                    setIsUpdating(false); // 수정 상태 종료
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // 로딩 중 UI
    if (isLoading) {
        return (_jsx("div", { className: "container mx-auto p-8 text-center", children: _jsx("p", { className: "text-black", children: "\uAC8C\uC2DC\uBB3C \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911..." }) }));
    }
    // 게시물 없음 (404) UI
    if (notFound) {
        return (_jsxs("div", { className: "container mx-auto p-8 text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-red-600 mb-4", children: "\uAC8C\uC2DC\uBB3C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." }), _jsx("p", { className: "text-black mb-4", children: "\uC694\uCCAD\uD558\uC2E0 \uAC8C\uC2DC\uBB3C\uC774 \uC874\uC7AC\uD558\uC9C0 \uC54A\uAC70\uB098 \uC0AD\uC81C\uB418\uC5C8\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), _jsxs(Link, { to: "/board", className: "text-blue-600 hover:underline", children: [" ", "\uAC8C\uC2DC\uD310 \uBAA9\uB85D\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30"] })] }));
    }
    // 로딩 에러 UI
    if (errorLoading) {
        return (_jsxs("div", { className: "container mx-auto p-8 text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-red-600 mb-4", children: "\uC624\uB958 \uBC1C\uC0DD" }), _jsx("p", { className: "text-red-500 mb-4", children: errorLoading }), _jsxs(Link, { to: "/board", className: "text-blue-600 hover:underline", children: [" ", "\uAC8C\uC2DC\uD310 \uBAA9\uB85D\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30"] })] }));
    }
    // 기본 수정 폼 UI
    return (_jsxs("div", { className: "container mx-auto p-8", children: [_jsxs("div", { className: "flex items-center mb-6", children: [_jsxs(Link, { to: "/board", children: [" ", _jsx("img", { src: "/microsoft.png" // 이미지 경로는 public 폴더 기준
                                , alt: "Microsoft Logo", width: 50, height: 50, className: "mr-5 cursor-pointer" })] }), _jsx("h1", { className: "text-3xl font-bold text-black", children: "\uAC8C\uC2DC\uBB3C \uC218\uC815" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "title", className: "block text-black font-semibold mb-2", children: "\uC81C\uBAA9" }), _jsx("input", { id: "title", type: "text", value: title, onChange: function (e) { return setTitle(e.target.value); }, className: "w-[80%] border border-gray-300 rounded-lg p-2 text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "\uC81C\uBAA9\uC744 \uC785\uB825\uD558\uC138\uC694", disabled: isUpdating })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "content", className: "block text-black font-semibold mb-2", children: "\uB0B4\uC6A9" }), _jsx("textarea", { id: "content", value: content, onChange: function (e) { return setContent(e.target.value); }, className: "w-[80%] border border-gray-300 rounded-lg p-2 h-40 text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "\uB0B4\uC6A9\uC744 \uC785\uB825\uD558\uC138\uC694", disabled: isUpdating })] }), errorUpdating && (_jsx("p", { className: "text-red-500 text-sm", children: errorUpdating })), _jsxs("div", { className: "flex space-x-4", children: [_jsx("button", { type: "submit", className: "py-2 px-4 rounded-lg text-white ".concat(isUpdating
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"), disabled: isUpdating, children: isUpdating ? "수정 중..." : "수정하기" }), _jsx("button", { type: "button", onClick: function () { return navigate(-1); }, className: "py-2 px-4 rounded-lg bg-gray-300 text-black hover:bg-gray-400", disabled: isUpdating, children: "\uCDE8\uC18C" })] })] })] }));
}
