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
import { useState } from "react"; // FormEvent 추가
// import Link from "next/link"; // Will use Link from react-router-dom
// import Image from "next/image"; // Will remove next/image later
// import { useRouter } from "next/navigation"; // Will use useNavigate from react-router-dom
import { useNavigate, Link } from "react-router-dom"; // Import hook and Link
import { login } from "../api-temp/auth"; // Corrected API path
export default function LoginPage() {
    var _this = this;
    var _a = useState(""), userName = _a[0], setUserName = _a[1];
    var _b = useState(""), password = _b[0], setPassword = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var _d = useState(false), isLoading = _d[0], setIsLoading = _d[1];
    var navigate = useNavigate(); // Use useNavigate
    // const router = useRouter(); // Removed
    var handleSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var loginData, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault(); // 폼 기본 제출 방지
                    setError(null); // 이전 에러 초기화
                    // 간단한 유효성 검사
                    if (!userName || !password) {
                        setError("아이디와 비밀번호를 모두 입력해주세요.");
                        return [2 /*return*/];
                    }
                    setIsLoading(true); // 로딩 시작
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, login(userName, password)];
                case 2:
                    loginData = _a.sent();
                    // 성공 시 토큰 및 사용자 ID 저장 (실제 응답 구조 반영)
                    localStorage.setItem("authToken", loginData.accessToken); // token -> accessToken
                    localStorage.setItem("userId", loginData.user.id.toString()); // userId -> user.id
                    console.log("로그인 성공, 토큰 저장됨:", loginData.accessToken);
                    console.log("사용자 ID 저장됨:", loginData.user.id);
                    // 로그인 성공 후 게시판 페이지로 리다이렉션 (필요에 따라 /mypage 등으로 변경 가능)
                    navigate("/board"); // navigate 사용
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error("로그인 실패:", err_1);
                    // API 함수에서 던진 에러 메시지 사용
                    setError(err_1.message || "로그인 중 오류가 발생했습니다.");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false); // 로딩 종료
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (_jsx("div", { className: "min-h-screen flex flex-col justify-center items-center", children: _jsxs("div", { className: "max-w-md w-full bg-blue-50 p-10 rounded-lg shadow-md", children: [_jsxs("div", { className: "mb-6 flex justify-center items-center", children: [_jsxs(Link, { to: "/", children: [" ", _jsx("img", { src: "/microsoft.png", alt: "Microsoft Logo", width: 50, height: 50, className: "mr-3 cursor-pointer" })] }), _jsx("h1", { className: "text-center text-2xl font-bold text-black", children: "\uB85C\uADF8\uC778" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "username", className: "block mb-1 text-sm font-medium text-gray-700", children: "\uC544\uC774\uB514" }), _jsx("input", { type: "text", id: "username", name: "username", value: userName, onChange: function (e) { return setUserName(e.target.value); }, className: "w-full p-2 border border-gray-300 rounded box-border text-black", required // 필수 입력 필드
                                    : true, disabled: isLoading })] }), _jsxs("div", { className: "mb-5", children: [_jsx("label", { htmlFor: "password", className: "block mb-1 text-sm font-medium text-gray-700", children: "\uBE44\uBC00\uBC88\uD638" }), _jsx("input", { type: "password", id: "password", name: "password", value: password, onChange: function (e) { return setPassword(e.target.value); }, className: "w-full p-2 border border-gray-300 rounded box-border text-black", required // 필수 입력 필드
                                    : true, disabled: isLoading })] }), error && (_jsx("p", { className: "text-red-500 text-sm mb-3 text-center", children: error })), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors ".concat(isLoading ? "opacity-50 cursor-not-allowed" : ""), children: isLoading ? "로그인 중..." : "로그인" })] }), _jsx("div", { className: "flex justify-center mt-4 text-sm", children: _jsx("div", { children: _jsxs(Link, { to: "/signup", className: "text-blue-600 hover:underline", children: [" ", "\uD68C\uC6D0\uAC00\uC785"] }) }) })] }) }));
}
