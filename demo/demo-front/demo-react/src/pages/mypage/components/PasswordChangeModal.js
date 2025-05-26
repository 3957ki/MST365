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
import { useState, useEffect } from "react"; // FormEvent, useEffect 추가
import { getToken, changePassword } from "../../../api-temp/auth"; // Corrected relative path again
export default function PasswordChangeModal(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = useState(""), currentPassword = _b[0], setCurrentPassword = _b[1];
    var _c = useState(""), newPassword = _c[0], setNewPassword = _c[1];
    var _d = useState(""), confirmNewPassword = _d[0], setConfirmNewPassword = _d[1];
    var _e = useState(null), newPasswordMatchError = _e[0], setNewPasswordMatchError = _e[1]; // 새 비밀번호 불일치 에러
    var _f = useState(null), apiError = _f[0], setApiError = _f[1]; // API 에러
    var _g = useState(null), successMessage = _g[0], setSuccessMessage = _g[1]; // 성공 메시지
    var _h = useState(false), isLoading = _h[0], setIsLoading = _h[1]; // 로딩 상태
    // 모달이 닫힐 때 상태 초기화
    useEffect(function () {
        if (!isOpen) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setNewPasswordMatchError(null);
            setApiError(null);
            setSuccessMessage(null);
            setIsLoading(false);
        }
    }, [isOpen]);
    var handleChangePassword = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var token, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    // 상태 초기화
                    setNewPasswordMatchError(null);
                    setApiError(null);
                    setSuccessMessage(null);
                    // 클라이언트 측 유효성 검사
                    if (!currentPassword || !newPassword || !confirmNewPassword) {
                        setApiError("모든 비밀번호 필드를 입력해주세요.");
                        return [2 /*return*/];
                    }
                    if (newPassword !== confirmNewPassword) {
                        setNewPasswordMatchError("새 비밀번호가 일치하지 않습니다.");
                        return [2 /*return*/];
                    }
                    // (선택 사항) 새 비밀번호 정책 검사 (예: 길이)
                    // if (newPassword.length < 8) {
                    //   setApiError("새 비밀번호는 8자 이상이어야 합니다.");
                    //   return;
                    // }
                    setIsLoading(true); // 로딩 시작
                    token = getToken();
                    if (!token) {
                        setApiError("로그인 토큰을 찾을 수 없습니다. 다시 로그인해주세요.");
                        setIsLoading(false);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, changePassword(currentPassword, newPassword, confirmNewPassword, token)];
                case 2:
                    _a.sent();
                    // 성공 처리
                    setSuccessMessage("비밀번호가 성공적으로 변경되었습니다.");
                    setCurrentPassword(""); // 필드 초기화
                    setNewPassword("");
                    setConfirmNewPassword("");
                    // 잠시 후 모달 닫기 (성공 메시지 보여주기 위해)
                    setTimeout(function () {
                        onClose();
                    }, 1500); // 1.5초 후 닫기
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    // 실패 처리
                    console.error("비밀번호 변경 실패:", error_1);
                    setApiError(error_1.message || "비밀번호 변경 중 오류가 발생했습니다.");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false); // 로딩 종료 (성공 시에는 이미 false지만, 실패 시 확실히)
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50", children: _jsxs("form", { onSubmit: handleChangePassword, className: "bg-white p-8 rounded-lg shadow-xl w-full max-w-md", children: [_jsx("h2", { className: "text-2xl font-bold mb-6 text-black", children: "\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD" }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "currentPassword", className: "block text-sm font-medium text-gray-700 mb-1", children: "\uD604\uC7AC \uBE44\uBC00\uBC88\uD638" }), _jsx("input", { type: "password", id: "currentPassword", value: currentPassword, onChange: function (e) { return setCurrentPassword(e.target.value); }, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black", required: true, disabled: isLoading })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "newPassword", className: "block text-sm font-medium text-gray-700 mb-1", children: "\uC0C8 \uBE44\uBC00\uBC88\uD638" }), _jsx("input", { type: "password", id: "newPassword", value: newPassword, onChange: function (e) { return setNewPassword(e.target.value); }, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black", required: true, disabled: isLoading })] }), _jsxs("div", { className: "mb-2", children: [" ", _jsx("label", { htmlFor: "confirmNewPassword", className: "block text-sm font-medium text-gray-700 mb-1", children: "\uC0C8 \uBE44\uBC00\uBC88\uD638 \uD655\uC778" }), _jsx("input", { type: "password", id: "confirmNewPassword", value: confirmNewPassword, onChange: function (e) {
                                setConfirmNewPassword(e.target.value);
                                // 입력 시 비밀번호 일치 에러 초기화
                                if (newPasswordMatchError)
                                    setNewPasswordMatchError(null);
                            }, className: "w-full px-3 py-2 border ".concat(newPasswordMatchError ? 'border-red-500' : 'border-gray-300', " rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"), required: true, disabled: isLoading })] }), newPasswordMatchError && (_jsx("p", { className: "text-red-500 text-xs mt-1 mb-4", children: newPasswordMatchError })), _jsxs("div", { className: "mt-4 mb-4 h-5", children: [" ", apiError && _jsx("p", { className: "text-red-500 text-sm text-center", children: apiError }), successMessage && _jsx("p", { className: "text-green-600 text-sm text-center", children: successMessage })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { type: "button", onClick: onClose, disabled: isLoading, className: "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded ".concat(isLoading ? 'opacity-50 cursor-not-allowed' : ''), children: "\uCDE8\uC18C" }), _jsx("button", { type: "submit", disabled: isLoading, className: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ".concat(isLoading ? 'opacity-50 cursor-not-allowed' : ''), children: isLoading ? "변경 중..." : "확인" })] })] }) }));
}
