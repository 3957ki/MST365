var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
// import Link from "next/link"; // Removed next/link import
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { useState, useEffect } from "react"; // useState, useEffect 임포트
import { getUserInfo } from "../../api-temp/auth"; // getUserInfo 및 타입 임포트
var BoardTable = function (_a) {
    var boards = _a.boards, token = _a.token;
    var _b = useState({}), userNamesMap = _b[0], setUserNamesMap = _b[1];
    var _c = useState(false), loadingUserNames = _c[0], setLoadingUserNames = _c[1]; // 사용자 이름 로딩 상태
    useEffect(function () {
        var fetchUserNames = function () { return __awaiter(void 0, void 0, void 0, function () {
            var uniqueUserIds, userInfoPromises, userInfos, newUserNames_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!token || boards.length === 0) {
                            return [2 /*return*/]; // 토큰이 없거나 게시물이 없으면 실행 중지
                        }
                        uniqueUserIds = Array.from(new Set(boards.map(function (board) { return board.userId; }))).filter(function (userId) { return !userNamesMap[userId]; });
                        if (uniqueUserIds.length === 0) {
                            return [2 /*return*/]; // 새로 가져올 userId가 없으면 중지
                        }
                        setLoadingUserNames(true); // 사용자 이름 로딩 시작
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        userInfoPromises = uniqueUserIds.map(function (userId) {
                            return getUserInfo(userId, token);
                        });
                        return [4 /*yield*/, Promise.all(userInfoPromises)];
                    case 2:
                        userInfos = _a.sent();
                        newUserNames_1 = {};
                        userInfos.forEach(function (userInfo) {
                            if (userInfo && userInfo.id && userInfo.userName) {
                                newUserNames_1[userInfo.id] = userInfo.userName;
                            }
                        });
                        setUserNamesMap(function (prevMap) { return (__assign(__assign({}, prevMap), newUserNames_1)); });
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error("사용자 이름 조회 중 오류 발생:", error_1);
                        return [3 /*break*/, 5];
                    case 4:
                        setLoadingUserNames(false); // 사용자 이름 로딩 완료
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchUserNames();
    }, [boards, token, userNamesMap]); // boards나 token이 변경될 때 실행
    // 날짜 포맷 함수
    var formatDate = function (dateString) {
        try {
            var date = new Date(dateString);
            // 유효한 날짜인지 확인
            if (isNaN(date.getTime())) {
                return "유효하지 않은 날짜";
            }
            return date
                .toLocaleDateString("ko-KR", {
                // 한국 시간 기준 및 형식
                year: "numeric", // 중복 제거
                month: "2-digit",
                day: "2-digit",
            })
                .replace(/\.$/, ""); // 마지막 점 제거
        }
        catch (error) {
            console.error("Error formatting date:", error);
            return "날짜 형식 오류"; // 오류 발생 시 대체 텍스트
        }
    };
    return (_jsxs("table", { className: "w-full border-collapse border border-gray-300 mb-4 text-black", children: [_jsx("thead", { className: "bg-gray-100", children: _jsxs("tr", { children: [_jsx("th", { className: "border p-2 w-16", children: "\uBC88\uD638" }), _jsx("th", { className: "border p-2", children: "\uC81C\uBAA9" }), _jsx("th", { className: "border p-2 w-32", children: "\uC791\uC131\uC790" }), _jsx("th", { className: "border p-2 w-32", children: "\uC791\uC131\uC77C" }), _jsx("th", { className: "border p-2 w-20", children: "\uC870\uD68C\uC218" })] }) }), _jsx("tbody", { children: boards.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center p-4 border", children: "\uC791\uC131\uB41C \uAC8C\uC2DC\uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. " }) })) : (boards.map(function (board) { return (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "border p-2 text-center", children: board.id }), _jsx("td", { className: "border p-2 hover:underline", children: _jsx(Link, { to: "/board/".concat(board.id), children: board.title }) }), _jsx("td", { className: "border p-2 text-center", children: userNamesMap[board.userId] || (loadingUserNames ? "로딩중..." : "ID: ".concat(board.userId)) }), _jsx("td", { className: "border p-2 text-center", children: formatDate(board.createdAt) }), _jsx("td", { className: "border p-2 text-center", children: board.view })] }, board.id)); })) })] }));
};
export default BoardTable;
