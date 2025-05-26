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
// import Image from "next/image"; // Removed next/image import
// import Link from "next/link"; // Will use Link from react-router-dom
// import { useRouter } from "next/navigation"; // Will use useNavigate from react-router-dom
import { useNavigate, Link } from "react-router-dom"; // Import hook and Link
import { getToken, getUserId } from "../api-temp/auth"; // Corrected API path
import { createBoard } from "../api-temp/board"; // Corrected API path
var WritePage = function () {
    var _a = useState(""), title = _a[0], setTitle = _a[1];
    var _b = useState(""), content = _b[0], setContent = _b[1];
    var navigate = useNavigate(); // Use useNavigate
    // const router = useRouter(); // Removed
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var token, userId, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!title || !content) {
                        alert("제목과 내용을 모두 입력해주세요.");
                        return [2 /*return*/];
                    }
                    token = getToken();
                    userId = getUserId();
                    if (!token || userId === null) {
                        alert("로그인이 필요합니다.");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, createBoard({ title: title, content: content, userId: userId }, token)];
                case 2:
                    _a.sent(); // ✅ camelCase 기반 input 객체 전달
                    alert("게시글이 작성되었습니다.");
                    navigate("/board"); // navigate 사용
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    alert("\uC5D0\uB7EC \uBC1C\uC0DD: ".concat(err_1.message));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (_jsxs("div", { className: "container mx-auto p-8", children: [_jsxs("div", { className: "flex items-center mb-6", children: [_jsxs(Link, { to: "/board", children: [" ", _jsx("img", { src: "/microsoft.png", alt: "Microsoft Logo", width: 50, height: 50, className: "mr-5 cursor-pointer" })] }), _jsx("h1", { className: "text-3xl font-bold text-black", children: "\uAC8C\uC2DC\uBB3C \uC791\uC131" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-black font-semibold mb-2", children: "\uC81C\uBAA9" }), _jsx("input", { type: "text", value: title, onChange: function (e) { return setTitle(e.target.value); }, className: "w-[80%] border border-gray-300 rounded-lg p-2 text-black", placeholder: "\uC81C\uBAA9\uC744 \uC785\uB825\uD558\uC138\uC694" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-black font-semibold mb-2", children: "\uB0B4\uC6A9" }), _jsx("textarea", { value: content, onChange: function (e) { return setContent(e.target.value); }, className: "w-[80%] border border-gray-300 rounded-lg p-2 h-40 text-black", placeholder: "\uB0B4\uC6A9\uC744 \uC785\uB825\uD558\uC138\uC694" })] }), _jsx("button", { type: "submit", className: "bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700", children: "\uC791\uC131\uD558\uAE30" })] })] }));
};
export default WritePage;
