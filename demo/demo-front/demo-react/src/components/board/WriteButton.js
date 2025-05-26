import { jsx as _jsx } from "react/jsx-runtime";
// "use client"; // Removed "use client" directive
// import { useRouter } from "next/navigation"; // Removed next/navigation import
import { useNavigate } from "react-router-dom"; // Import useNavigate
var WriteButton = function () {
    var navigate = useNavigate(); // Use useNavigate
    // const router = useRouter(); // Removed
    var handleClick = function () {
        navigate("/board/new"); // Use navigate
    };
    return (_jsx("div", { className: "flex justify-end", children: _jsx("button", { onClick: handleClick, className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700", children: "\uAE00\uC4F0\uAE30" }) }));
};
export default WriteButton;
