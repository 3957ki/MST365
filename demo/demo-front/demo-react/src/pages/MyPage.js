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
// import Image from "next/image"; // Removed next/image import
// import Link from "next/link"; // Will use Link from react-router-dom
import { useState, useEffect } from "react"; // useEffect 추가
// import { useRouter } from "next/navigation"; // Will use useNavigate from react-router-dom
import { useNavigate, Link } from "react-router-dom"; // Import hook and Link
import PasswordChangeModal from "./mypage/components/PasswordChangeModal"; // Corrected path
import UserPostsList from "./mypage/components/UserPostsList"; // Corrected path
import UserCommentsList from "./mypage/components/UserCommentsList"; // Corrected path
import LogoutButton from "../components/common/LogoutButton";
// getUserInfo, UserInfoData, getUserPosts, UserPostItem, getUserComments, UserCommentItem 타입 임포트 추가
import { getToken, getUserId, removeToken, withdrawUser, getUserInfo, getUserPosts, getUserComments, } from "../api-temp/auth"; // 경로 유지
export default function MyPage() {
    var _this = this;
    var _a;
    var _b = useState(false), isModalOpen = _b[0], setIsModalOpen = _b[1];
    var _c = useState(null), withdrawError = _c[0], setWithdrawError = _c[1];
    var _d = useState(false), isWithdrawing = _d[0], setIsWithdrawing = _d[1];
    var navigate = useNavigate(); // Use useNavigate
    // const router = useRouter(); // Removed
    // 사용자 정보 상태 추가
    var _e = useState(null), user = _e[0], setUser = _e[1];
    var _f = useState(true), isUserInfoLoading = _f[0], setIsUserInfoLoading = _f[1];
    var _g = useState(null), userInfoError = _g[0], setUserInfoError = _g[1];
    // 사용자 게시물 목록 상태 추가
    var _h = useState(null), userPosts = _h[0], setUserPosts = _h[1];
    var _j = useState(true), isUserPostsLoading = _j[0], setIsUserPostsLoading = _j[1];
    var _k = useState(null), userPostsError = _k[0], setUserPostsError = _k[1];
    // 사용자 댓글 목록 상태 추가
    var _l = useState(null), userComments = _l[0], setUserComments = _l[1];
    var _m = useState(true), isUserCommentsLoading = _m[0], setIsUserCommentsLoading = _m[1];
    var _o = useState(null), userCommentsError = _o[0], setUserCommentsError = _o[1];
    // 컴포넌트 마운트 시 사용자 정보, 게시물, 댓글 로드
    useEffect(function () {
        var isMounted = true; // 컴포넌트 언마운트 시 비동기 작업 취소 플래그
        var token = getToken();
        var userId = getUserId();
        // 로그인 상태 확인 및 리다이렉션
        if (!token || userId === null) {
            if (isMounted) {
                setUserInfoError("로그인이 필요합니다.");
                setUserPostsError("로그인이 필요합니다.");
                setUserCommentsError("로그인이 필요합니다."); // 댓글 에러도 설정
                setIsUserInfoLoading(false);
                setIsUserPostsLoading(false);
                setIsUserCommentsLoading(false); // 댓글 로딩도 종료
                navigate("/login"); // navigate 사용
            }
            return; // useEffect 종료
        }
        // 사용자 정보 로딩 함수 정의
        var performFetchUserInfo = function () { return __awaiter(_this, void 0, void 0, function () {
            var userInfo, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isMounted)
                            return [2 /*return*/]; // 컴포넌트 언마운트 시 중단
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        setIsUserInfoLoading(true);
                        return [4 /*yield*/, getUserInfo(userId, token)];
                    case 2:
                        userInfo = _a.sent();
                        if (isMounted) {
                            setUser(userInfo);
                            setUserInfoError(null);
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error("사용자 정보 조회 실패:", error_1);
                        if (isMounted) {
                            setUserInfoError(error_1.message || "사용자 정보를 불러오는 데 실패했습니다.");
                            setUser(null);
                            if (error_1.message.includes("401") || error_1.message.includes("403")) {
                                removeToken();
                                navigate("/login"); // navigate 사용
                            }
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        if (isMounted) {
                            setIsUserInfoLoading(false);
                        }
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        // 사용자 게시물 로딩 함수 정의
        var performFetchPosts = function () { return __awaiter(_this, void 0, void 0, function () {
            var posts, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isMounted || !userId || !token)
                            return [2 /*return*/]; // userId, token 유효성 검사 추가
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        setIsUserPostsLoading(true);
                        return [4 /*yield*/, getUserPosts(userId, token)];
                    case 2:
                        posts = _a.sent();
                        if (isMounted) {
                            setUserPosts(posts);
                            setUserPostsError(null);
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_2 = _a.sent();
                        console.error("사용자 게시물 조회 실패:", error_2);
                        if (isMounted) {
                            setUserPostsError(error_2.message || "게시물을 불러오는 데 실패했습니다.");
                            setUserPosts(null);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        if (isMounted) {
                            setIsUserPostsLoading(false);
                        }
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        // 사용자 댓글 로딩 함수 정의
        var performFetchComments = function () { return __awaiter(_this, void 0, void 0, function () {
            var comments, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isMounted || !userId || !token)
                            return [2 /*return*/]; // userId, token 유효성 검사 추가
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        setIsUserCommentsLoading(true);
                        return [4 /*yield*/, getUserComments(userId, token)];
                    case 2:
                        comments = _a.sent();
                        if (isMounted) {
                            setUserComments(comments);
                            setUserCommentsError(null);
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_3 = _a.sent();
                        console.error("사용자 댓글 조회 실패:", error_3);
                        if (isMounted) {
                            setUserCommentsError(error_3.message || "댓글을 불러오는 데 실패했습니다.");
                            setUserComments(null);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        if (isMounted) {
                            setIsUserCommentsLoading(false);
                        }
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        // API 호출 실행
        performFetchUserInfo();
        performFetchPosts();
        performFetchComments(); // 댓글 로딩 함수 호출 추가
        // 클린업 함수: 컴포넌트 언마운트 시 플래그 설정
        return function () {
            isMounted = false;
        };
        // 의존성 배열: navigate는 일반적으로 안정적이므로 빈 배열 사용 가능.
        // 또는 userId, token을 상태로 관리한다면 해당 상태를 추가.
    }, [navigate]); // 의존성 배열에 navigate 추가
    // 회원 탈퇴 처리 함수
    var handleWithdraw = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, userId, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // 1. 탈퇴 확인
                    if (!window.confirm("정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                        return [2 /*return*/]; // 사용자가 취소하면 중단
                    }
                    setWithdrawError(null); // 이전 에러 초기화
                    setIsWithdrawing(true); // 로딩 시작
                    token = getToken();
                    userId = getUserId();
                    if (!token || userId === null) {
                        setWithdrawError("로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.");
                        setIsWithdrawing(false);
                        // 필요시 로그인 페이지로 리다이렉션
                        // removeToken(); // 혹시 모를 잘못된 정보 제거
                        // router.push('/login');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // 3. API 호출
                    return [4 /*yield*/, withdrawUser(userId, token)];
                case 2:
                    // 3. API 호출
                    _a.sent();
                    // 4. 성공 처리
                    alert("회원 탈퇴가 성공적으로 처리되었습니다.");
                    removeToken(); // 로컬 스토리지 정보 제거
                    navigate("/"); // navigate 사용
                    return [3 /*break*/, 5];
                case 3:
                    error_4 = _a.sent();
                    // 5. 실패 처리
                    console.error("회원 탈퇴 실패:", error_4);
                    setWithdrawError(error_4.message || "회원 탈퇴 중 오류가 발생했습니다.");
                    return [3 /*break*/, 5];
                case 4:
                    setIsWithdrawing(false); // 로딩 종료
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (_jsxs("div", { className: "container mx-auto p-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center", children: [_jsxs(Link, { to: "/board", children: [" ", _jsx("img", { src: "/microsoft.png", alt: "Microsoft Logo", width: 50, height: 50, className: "mr-5 cursor-pointer" })] }), _jsx("h1", { className: "text-3xl font-bold text-black", children: "\uB9C8\uC774\uD398\uC774\uC9C0" })] }), _jsx(LogoutButton, {})] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md mb-6", children: [_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "w-24 h-24 bg-gray-300 rounded-full mr-6 flex items-center justify-center text-gray-500", children: [isUserInfoLoading
                                        ? "..."
                                        : user
                                            ? user.userName.charAt(0).toUpperCase()
                                            : "?", " "] }), _jsxs("div", { className: "text-left", children: [_jsxs("h2", { className: "text-2xl font-semibold mb-1 text-black", children: [isUserInfoLoading
                                                ? "로딩 중..."
                                                : userInfoError
                                                    ? "오류"
                                                    : (_a = user === null || user === void 0 ? void 0 : user.userName) !== null && _a !== void 0 ? _a : "사용자", " "] }), _jsx("p", { className: "text-gray-600", children: isUserInfoLoading
                                            ? "회원 정보를 불러오고 있습니다..."
                                            : userInfoError
                                                ? "\uC624\uB958: ".concat(userInfoError)
                                                : user
                                                    ? "".concat(user.userName, "\uB2D8 \uC548\uB155\uD558\uC138\uC694!")
                                                    : "회원 정보를 표시할 수 없습니다." })] })] }), _jsxs("div", { className: "mt-6 text-right", children: [_jsx("button", { onClick: function () { return setIsModalOpen(true); }, className: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-5", children: "\uBE44\uBC00\uBC88\uD638 \uC218\uC815" }), _jsx("button", { onClick: handleWithdraw, disabled: isWithdrawing, className: "bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded ".concat(isWithdrawing ? "opacity-50 cursor-not-allowed" : ""), children: isWithdrawing ? "탈퇴 처리 중..." : "회원 탈퇴" })] }), withdrawError && (_jsx("p", { className: "text-red-500 text-sm mt-2 text-right", children: withdrawError }))] }), isUserPostsLoading && (_jsx("p", { className: "text-center text-gray-600 my-4", children: "\uAC8C\uC2DC\uAE00 \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uB294 \uC911..." })), userPostsError && (_jsxs("p", { className: "text-center text-red-500 my-4", children: ["\uAC8C\uC2DC\uAE00 \uBAA9\uB85D \uB85C\uB529 \uC624\uB958: ", userPostsError] })), !isUserPostsLoading && !userPostsError && (_jsx(UserPostsList, { posts: userPosts })), isUserCommentsLoading && (_jsx("p", { className: "text-center text-gray-600 my-4", children: "\uB313\uAE00 \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uB294 \uC911..." })), userCommentsError && (_jsxs("p", { className: "text-center text-red-500 my-4", children: ["\uB313\uAE00 \uBAA9\uB85D \uB85C\uB529 \uC624\uB958: ", userCommentsError] })), !isUserCommentsLoading && !userCommentsError && (_jsx(UserCommentsList, { comments: userComments })), _jsx(PasswordChangeModal, { isOpen: isModalOpen, onClose: function () { return setIsModalOpen(false); } })] }));
}
