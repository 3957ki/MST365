// src/app/api/comment.ts
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
import { getToken } from "./auth"; // Corrected relative path
// 댓글 작성 함수
export function createComment(boardId, content, token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/boards/").concat(boardId, "/comments"), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer ".concat(token),
                        },
                        body: JSON.stringify({ content: content }),
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (!response.ok) {
                        throw new Error(result.details || result.error || "\uB313\uAE00 \uC791\uC131 \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
// 댓글 목록 조회 함수
export function getComments(boardId) {
    return __awaiter(this, void 0, void 0, function () {
        var token, headers, response, result, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    token = getToken();
                    headers = {
                        "Content-Type": "application/json",
                    };
                    if (token) {
                        headers["Authorization"] = "Bearer ".concat(token);
                    }
                    return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/boards/").concat(boardId, "/comments"), {
                            method: "GET",
                            headers: headers,
                        })];
                case 1:
                    response = _b.sent();
                    if (response.status === 403) {
                        throw new Error("댓글 조회 권한이 없습니다 (403 Forbidden)");
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    throw new Error("응답이 JSON 형식이 아닙니다.");
                case 5:
                    if (!response.ok) {
                        throw new Error(result.details || result.error || "\uB313\uAE00 \uBD88\uB7EC\uC624\uAE30 \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                    }
                    if (!Array.isArray(result)) {
                        throw new Error("댓글 목록이 배열 형식이 아닙니다.");
                    }
                    return [2 /*return*/, result]; // 배열 그대로 반환
            }
        });
    });
}
// 댓글 수정 함수 (PATCH로 변경 + boardId 포함)
export function updateComment(boardId, commentId, content, token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/boards/").concat(boardId, "/comments/").concat(commentId), {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer ".concat(token),
                        },
                        body: JSON.stringify({ content: content }),
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (!response.ok) {
                        throw new Error(result.details || result.error || "\uB313\uAE00 \uC218\uC815 \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
// 댓글 삭제 함수
export function deleteComment(boardId, commentId, token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/boards/").concat(boardId, "/comments/").concat(commentId), {
                        method: "DELETE",
                        headers: {
                            "Authorization": "Bearer ".concat(token),
                        },
                    })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    throw new Error(result.details || result.error || "\uB313\uAE00 \uC0AD\uC81C \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                case 3: return [2 /*return*/];
            }
        });
    });
}
