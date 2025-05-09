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
import { useState } from "react";
// import Link from "next/link"; // Will use Link from react-router-dom
// import Image from "next/image"; // Will remove next/image later
// import { useRouter } from "next/navigation"; // Will use useNavigate from react-router-dom
import { useNavigate, Link } from "react-router-dom"; // Import hook and Link
import { signup } from "../api-temp/auth"; // Corrected API path
export default function SignupPage() {
    var _this = this;
    var _a = useState(""), userName = _a[0], setUserName = _a[1]; // 아이디 상태 추가
    var _b = useState(""), password = _b[0], setPassword = _b[1];
    var _c = useState(""), confirmPassword = _c[0], setConfirmPassword = _c[1];
    var _d = useState(""), passwordError = _d[0], setPasswordError = _d[1];
    var _e = useState(null), apiError = _e[0], setApiError = _e[1]; // API 오류 상태 추가
    var _f = useState(false), isLoading = _f[0], setIsLoading = _f[1]; // 로딩 상태 추가
    var navigate = useNavigate(); // Use useNavigate
    // const router = useRouter(); // Removed
    // 회원가입 처리 함수 수정
    var handleSignup = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // 1. 유효성 검사
                    if (!userName || !password || !confirmPassword) {
                        setApiError("모든 필드를 입력해주세요.");
                        return [2 /*return*/];
                    }
                    if (password !== confirmPassword) {
                        setPasswordError("비밀번호가 일치하지 않습니다."); // 이미 상태로 관리되지만, 명시적 확인
                        setApiError("비밀번호가 일치하지 않습니다.");
                        return [2 /*return*/];
                    }
                    if (passwordError) {
                        // 기존 비밀번호 불일치 에러가 있으면 중단
                        setApiError("비밀번호가 일치하는지 확인해주세요.");
                        return [2 /*return*/];
                    }
                    // 2. API 호출 준비
                    setApiError(null); // 이전 에러 초기화
                    setPasswordError(""); // 비밀번호 에러 초기화
                    setIsLoading(true); // 로딩 시작
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, signup(userName, password)];
                case 2:
                    result = _a.sent();
                    // 3. 성공 처리 (기존 로직 유지)
                    console.log("회원가입 성공:", result.message); // result.message 사용 가능
                    alert("회원가입이 성공적으로 완료되었습니다.");
                    navigate("/login"); // navigate 사용
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    // 4. 실패 처리
                    console.error("회원가입 실패:", error_1);
                    setApiError(error_1.message || "회원가입 중 오류가 발생했습니다.");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false); // 로딩 종료
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleConfirmPasswordChange = function (e) {
        var newConfirmPassword = e.target.value;
        setConfirmPassword(newConfirmPassword);
        if (password && newConfirmPassword && password !== newConfirmPassword) {
            setPasswordError("비밀번호가 일치하지 않습니다.");
        }
        else {
            setPasswordError("");
        }
    };
    var handlePasswordChange = function (e) {
        var newPassword = e.target.value;
        setPassword(newPassword);
        if (confirmPassword && newPassword && newPassword !== confirmPassword) {
            setPasswordError("비밀번호가 일치하지 않습니다.");
        }
        else {
            setPasswordError("");
        }
    };
    return (_jsx("div", { className: "min-h-screen flex flex-col justify-center items-center", children: _jsxs("div", { className: "max-w-md w-full bg-blue-50 p-10 rounded-lg shadow-md", children: [_jsxs("div", { className: "mb-6 flex justify-center items-center", children: [_jsxs(Link, { to: "/", children: [" ", _jsx("img", { src: "/microsoft.png", alt: "Microsoft Logo", width: 50, height: 50, className: "mr-3 cursor-pointer" })] }), _jsx("h1", { className: "text-center text-2xl font-bold text-black", children: "\uD68C\uC6D0\uAC00\uC785" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "username", className: "block mb-1 text-sm font-medium text-gray-700", children: "\uC544\uC774\uB514" }), _jsx("input", { type: "text", id: "username", name: "username", value: userName, onChange: function (e) { return setUserName(e.target.value); }, className: "w-full p-2 border border-gray-300 rounded box-border text-black", required // 필수 필드 표시 (선택 사항)
                            : true })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "password", className: "block mb-1 text-sm font-medium text-gray-700", children: "\uBE44\uBC00\uBC88\uD638" }), _jsx("input", { type: "password", id: "password", name: "password", value: password, onChange: handlePasswordChange, className: "w-full p-2 border border-gray-300 rounded box-border text-black", required // 필수 필드 표시 (선택 사항)
                            : true })] }), _jsxs("div", { className: "mb-1", children: [_jsx("label", { htmlFor: "confirmPassword", className: "block mb-1 text-sm font-medium text-gray-700 ", children: "\uBE44\uBC00\uBC88\uD638 \uD655\uC778" }), _jsx("input", { type: "password", id: "confirmPassword", name: "confirmPassword", value: confirmPassword, onChange: handleConfirmPasswordChange, className: "w-full p-2 border ".concat(passwordError ? "border-red-500" : "border-gray-300", " rounded box-border text-black"), required // 필수 필드 표시 (선택 사항)
                            : true }), passwordError && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: passwordError }))] }), apiError && (_jsx("p", { className: "text-red-500 text-sm mt-2 text-center", children: apiError })), _jsx("button", { onClick: handleSignup, disabled: isLoading, className: "w-full mt-4 py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors ".concat(isLoading ? "opacity-50 cursor-not-allowed" : ""), children: isLoading ? "가입 처리 중..." : "회원가입" }), _jsx("div", { className: "mt-4 text-center text-sm", children: _jsxs(Link, { to: "/login", className: "text-blue-600 hover:underline", children: [" ", "\uB85C\uADF8\uC778"] }) })] }) }));
}
