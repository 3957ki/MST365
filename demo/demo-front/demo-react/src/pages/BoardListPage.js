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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// "use client"; // Removed "use client" directive
import { useState, useEffect, useCallback } from "react"; // useCallback 추가
// import Image from "next/image"; // Removed next/image import
// import Link from "next/link"; // Will use Link from react-router-dom
// import { useRouter } from "next/navigation"; // Will use useNavigate from react-router-dom
import { useNavigate, Link } from "react-router-dom"; // Import hook and Link
import BoardTable from "../components/board/BoardTable";
import WriteButton from "../components/board/WriteButton";
import LogoutButton from "../components/common/LogoutButton";
import { getToken } from "../api-temp/auth"; // Corrected API path
import { getBoards } from "../api-temp/board"; // Corrected API path
var BoardPage = function () {
    // 상태 변수 추가
    var _a = useState([]), boards = _a[0], setBoards = _a[1]; // 전체 로드된 게시물
    var _b = useState(0), currentPage = _b[0], setCurrentPage = _b[1]; // 현재 페이지 (0-based)
    var pageSize = useState(20)[0]; // 페이지당 게시물 수 (고정값)
    var _c = useState(true), isLoadingInitial = _c[0], setIsLoadingInitial = _c[1]; // 초기 로딩 상태
    var _d = useState(false), isLoadingMore = _d[0], setIsLoadingMore = _d[1]; // 추가 로딩 상태
    var _e = useState(null), error = _e[0], setError = _e[1]; // 에러 상태
    var _f = useState(true), hasMore = _f[0], setHasMore = _f[1]; // 더 로드할 페이지 유무
    var _g = useState(null), currentToken = _g[0], setCurrentToken = _g[1]; // 토큰 상태
    var navigate = useNavigate(); // Use useNavigate
    // const router = useRouter(); // Removed
    // 데이터 로딩 함수 (useCallback으로 메모이제이션)
    var loadBoards = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var token, fetchedBoards_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = currentToken || getToken();
                    if (!token) {
                        setError("로그인이 필요합니다.");
                        setIsLoadingInitial(false);
                        setIsLoadingMore(false);
                        setTimeout(function () { return navigate("/login"); }, 1500); // navigate 사용
                        return [2 /*return*/];
                    }
                    // 로딩 상태 설정
                    if (currentPage === 0) {
                        setIsLoadingInitial(true);
                    }
                    else {
                        setIsLoadingMore(true);
                    }
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, getBoards(token, currentPage, pageSize)];
                case 2:
                    fetchedBoards_1 = _a.sent();
                    setBoards(function (prevBoards) { return __spreadArray(__spreadArray([], prevBoards, true), fetchedBoards_1, true); });
                    // 더 로드할 데이터 있는지 확인
                    if (fetchedBoards_1.length < pageSize) {
                        setHasMore(false);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1.message || "게시물 목록을 불러오는 중 오류가 발생했습니다.");
                    setHasMore(false); // 에러 발생 시 더 로드하지 않음
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoadingInitial(false);
                    setIsLoadingMore(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [currentPage, pageSize, navigate, currentToken]); // 의존성 배열에 navigate 추가
    // 컴포넌트 마운트 시 토큰 설정 및 첫 페이지 로드 트리거
    useEffect(function () {
        var tokenFromStorage = getToken();
        setCurrentToken(tokenFromStorage);
        // 토큰 설정 후 첫 로드 시작 (currentPage가 0이므로 loadBoards 호출)
        // loadBoards(); // 아래 useEffect에서 currentPage 변경으로 호출됨
    }, []); // 마운트 시 한 번만 실행
    // currentPage 변경 시 데이터 로드
    useEffect(function () {
        if (currentToken !== null && hasMore) {
            // 토큰이 설정되고 더 로드할 페이지가 있을 때만 실행
            loadBoards();
        }
    }, [currentPage, currentToken, hasMore, loadBoards]); // currentToken, hasMore, loadBoards 의존성 추가
    // 스크롤 이벤트 핸들러
    var handleScroll = useCallback(function () {
        // 로딩 중이거나 더 로드할 페이지 없으면 중지
        if (isLoadingInitial || isLoadingMore || !hasMore) {
            return;
        }
        // 페이지 하단 근처 감지 (문서 높이 - 200px 지점)
        if (window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - 200) {
            // 다음 페이지 로드 트리거
            setCurrentPage(function (prevPage) { return prevPage + 1; });
        }
    }, [isLoadingInitial, isLoadingMore, hasMore]); // 의존성 배열 업데이트
    // 스크롤 이벤트 리스너 등록 및 해제
    useEffect(function () {
        window.addEventListener("scroll", handleScroll);
        return function () {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]); // handleScroll 의존성 추가
    return (_jsxs("div", { className: "container mx-auto p-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center", children: [_jsxs(Link, { to: "/board", children: [" ", _jsx("img", { src: "/microsoft.png", alt: "Microsoft Logo", width: 50, height: 50, className: "mr-5 cursor-pointer" })] }), _jsx("h1", { className: "text-3xl font-bold text-black", children: "\uC790\uC720 \uAC8C\uC2DC\uD310" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs(Link, { to: "/mypage", children: [" ", _jsxs("button", { className: "bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm", children: [" ", "\uB9C8\uC774 \uD398\uC774\uC9C0"] })] }), _jsx(LogoutButton, {})] })] }), isLoadingInitial && (_jsx("div", { className: "text-center py-10", children: _jsx("p", { children: "\uAC8C\uC2DC\uBB3C \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uB294 \uC911..." }) })), error &&
                !isLoadingInitial && ( // 초기 로딩 중 아닐 때만 에러 표시
            _jsxs("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4", role: "alert", children: [_jsx("strong", { className: "font-bold", children: "\uC624\uB958 \uBC1C\uC0DD:" }), _jsxs("span", { className: "block sm:inline", children: [" ", error] })] })), !isLoadingInitial && !error && (_jsx(BoardTable, { boards: boards, token: currentToken })), !isLoadingInitial && !error && boards.length === 0 && (_jsx("div", { className: "text-center py-10 text-gray-500", children: "\uC791\uC131\uB41C \uAC8C\uC2DC\uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })), isLoadingMore && (_jsx("div", { className: "text-center py-4", children: _jsx("p", { children: "\uCD94\uAC00 \uAC8C\uC2DC\uBB3C\uC744 \uBD88\uB7EC\uC624\uB294 \uC911..." }) })), !hasMore &&
                !isLoadingInitial &&
                !isLoadingMore &&
                !error &&
                boards.length > 0 && (_jsx("div", { className: "text-center py-4 text-gray-500", children: "\uB9C8\uC9C0\uB9C9 \uAC8C\uC2DC\uBB3C\uC785\uB2C8\uB2E4." })), currentToken && _jsx(WriteButton, {})] }));
};
export default BoardPage;
