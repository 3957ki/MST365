import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var BoardInfo = function (_a) {
    var totalPosts = _a.totalPosts, currentPage = _a.currentPage, totalPages = _a.totalPages;
    return (_jsx("div", { className: "flex justify-between items-center mb-2 text-black", children: _jsxs("div", { children: ["\uCD1D \uAC8C\uC2DC\uBB3C ", _jsx("span", { className: "font-bold text-red-500", children: totalPosts }), "\uAC74 | \uD604\uC7AC \uD398\uC774\uC9C0", " ", _jsx("span", { className: "font-bold text-red-500", children: currentPage }), "/", totalPages] }) }));
};
export default BoardInfo;
