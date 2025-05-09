"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
var BoardSearch = function (_a) {
    var onSearch = _a.onSearch;
    var _b = useState(""), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = useState("title"), searchType = _c[0], setSearchType = _c[1]; // 기본 검색 타입을 'title'로 설정
    var handleInputChange = function (event) {
        setSearchTerm(event.target.value);
    };
    var handleSelectChange = function (event) {
        setSearchType(event.target.value);
    };
    // 초기화: 검색어, 타입 초기화 및 전체 목록 표시 요청
    var handleReset = function () {
        setSearchTerm("");
        setSearchType("title"); // 검색 타입도 기본값으로
        onSearch("", "title"); // 부모에게 초기화 알림 (빈 검색어 전달)
    };
    // 검색 실행: 현재 검색어와 타입으로 부모에게 검색 요청
    var handleSearch = function () {
        onSearch(searchTerm, searchType);
    };
    return (_jsxs("div", { className: "flex justify-between items-center mb-4 p-3 border border-gray-200 bg-gray-50 shadow-sm", children: [_jsxs("div", { className: "flex gap-2", children: [_jsxs("select", { className: "border border-gray-300 p-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", value: searchType, onChange: handleSelectChange, children: [_jsx("option", { value: "title", children: "\uC81C\uBAA9" }), _jsx("option", { value: "author", children: "\uC791\uC131\uC790" }), " "] }), _jsx("input", { type: "text", placeholder: "\uAC80\uC0C9\uC5B4\uB97C \uC785\uB825\uD558\uC138\uC694.", className: "border border-gray-300 p-2 w-64 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", value: searchTerm, onChange: handleInputChange })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 shadow-sm", onClick: handleSearch, children: "\uAC80\uC0C9" }), _jsx("button", { className: "bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-200 shadow-sm", onClick: handleReset, children: "\uCD08\uAE30\uD654" })] })] }));
};
export default BoardSearch;
