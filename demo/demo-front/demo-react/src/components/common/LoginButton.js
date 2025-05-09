"use client";
import { jsx as _jsx } from "react/jsx-runtime";
var handleLogin = function () {
    console.log("로그인 시도");
    alert("로그인 버튼 클릭됨 (기능 없음)");
};
export default function LoginButton() {
    return (_jsx("button", { onClick: handleLogin, className: "w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors", children: "\uB85C\uADF8\uC778" }));
}
