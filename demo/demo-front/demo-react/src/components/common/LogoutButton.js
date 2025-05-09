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
import { jsx as _jsx } from "react/jsx-runtime";
// "use client"; // Removed "use client" directive
// import { useRouter } from "next/navigation"; // Removed next/navigation import
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { getToken, removeToken, logout } from "../../api-temp/auth"; // Corrected relative path
export default function LogoutButton() {
    var _this = this;
    var navigate = useNavigate(); // Use useNavigate
    // const router = useRouter(); // Removed
    var handleLogout = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = getToken();
                    if (!token) {
                        console.log("토큰 없음, 이미 로그아웃 상태일 수 있습니다.");
                        // 토큰이 없으면 로그인 페이지로 보낼 수도 있음
                        navigate("/login"); // Use navigate
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, logout(token)];
                case 2:
                    _a.sent(); // API 호출
                    console.log("API 로그아웃 호출 성공");
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error("로그아웃 API 호출 실패:", error_1);
                    return [3 /*break*/, 5];
                case 4:
                    // API 성공/실패 여부와 관계없이 로컬 토큰 제거
                    removeToken();
                    console.log("로컬 토큰 제거 완료");
                    // 로그아웃 후 홈페이지 또는 로그인 페이지로 리다이렉션
                    // window.location.href = '/'; // 페이지 새로고침을 유도하여 상태 초기화
                    navigate("/"); // Use navigate
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (_jsx("button", { onClick: handleLogout, className: "bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm" // 스타일은 필요에 따라 조정
        , children: "\uB85C\uADF8\uC544\uC6C3" }));
}
