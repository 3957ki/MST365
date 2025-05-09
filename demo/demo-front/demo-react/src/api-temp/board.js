"use client";
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
// 전체 게시물 목록 조회 API 호출 함수 (페이징 추가)
export function getBoards(token, page, size) {
    return __awaiter(this, void 0, void 0, function () {
        var params, url, response, result, errorResponse, successResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = new URLSearchParams({
                        page: page.toString(),
                        size: size.toString(),
                    });
                    url = "".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/boards?").concat(params.toString());
                    return [4 /*yield*/, fetch(url, {
                            method: "GET",
                            headers: {
                                Authorization: "Bearer ".concat(token), // 인증 헤더 추가
                            },
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (!response.ok) {
                        errorResponse = result;
                        // 401 에러는 토큰 만료 또는 잘못된 토큰일 가능성이 높음
                        if (response.status === 401) {
                            // 필요하다면 여기서 토큰 제거 또는 로그인 페이지 리다이렉션 로직 추가 가능
                            // 하지만 이 함수는 데이터만 가져오는 역할에 집중하고, UI 로직은 페이지 컴포넌트에서 처리
                            throw new Error(errorResponse.details || errorResponse.error || "인증되지 않았습니다.");
                        }
                        // 다른 에러 (500 등)
                        throw new Error(errorResponse.details ||
                            errorResponse.error ||
                            "\uAC8C\uC2DC\uBB3C \uBAA9\uB85D \uC870\uD68C \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                    }
                    successResponse = result;
                    // 데이터 구조 유효성 검사 (data 필드가 배열인지 확인)
                    if (!successResponse.data || !Array.isArray(successResponse.data)) {
                        console.error("Invalid boards response structure:", successResponse);
                        throw new Error("게시물 목록 응답 형식이 올바르지 않습니다.");
                    }
                    return [2 /*return*/, successResponse.data]; // 성공 시 게시물 목록 배열 반환
            }
        });
    });
}
// 단일 게시물 조회 API 호출 함수
export function getBoardById(boardId, token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, result, errorResponse, successResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/boards/").concat(boardId), {
                        method: "GET",
                        headers: {
                            Authorization: "Bearer ".concat(token), // 인증 헤더 추가
                        },
                    })];
                case 1:
                    response = _a.sent();
                    // 404 Not Found 처리
                    if (response.status === 404) {
                        return [2 /*return*/, null]; // 게시물이 없으면 null 반환
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    // 404 외 다른 에러 처리 (401, 403, 500 등)
                    if (!response.ok) {
                        errorResponse = result;
                        if (response.status === 401) {
                            throw new Error(errorResponse.details || errorResponse.error || "인증되지 않았습니다.");
                        }
                        if (response.status === 403) {
                            throw new Error(errorResponse.details || errorResponse.error || "접근 권한이 없습니다.");
                        }
                        throw new Error(errorResponse.details ||
                            errorResponse.error ||
                            "\uAC8C\uC2DC\uBB3C \uC870\uD68C \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                    }
                    successResponse = result;
                    // 데이터 구조 유효성 검사 (data 객체 및 필수 필드 확인)
                    if (!successResponse.data ||
                        typeof successResponse.data.id !== "number" ||
                        typeof successResponse.data.title !== "string") {
                        console.error("Invalid board detail response structure:", successResponse);
                        throw new Error("게시물 상세 정보 응답 형식이 올바르지 않습니다.");
                    }
                    return [2 /*return*/, successResponse.data]; // 성공 시 게시물 상세 정보 객체 반환
            }
        });
    });
}
// --- 게시물 삭제 ---
// 게시물 삭제 API 호출 함수
export function deleteBoard(boardId, token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, errorMessage, errorResult, e_1, result, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/boards/").concat(boardId), {
                        method: "DELETE",
                        headers: {
                            Authorization: "Bearer ".concat(token), // 인증 헤더 추가
                        },
                    })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 6];
                    errorMessage = "\uAC8C\uC2DC\uBB3C \uC0AD\uC81C \uC2E4\uD328 (HTTP ".concat(response.status, ")");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorResult = (_a.sent());
                    errorMessage =
                        errorResult.details ||
                            errorResult.error ||
                            "\uAC8C\uC2DC\uBB3C \uC0AD\uC81C \uC2E4\uD328 (HTTP ".concat(response.status, ")");
                    // 특정 상태 코드에 따른 메시지 커스터마이징 (선택적)
                    if (response.status === 401) {
                        errorMessage = "인증되지 않았습니다. 다시 로그인해주세요.";
                    }
                    else if (response.status === 403) {
                        errorMessage = "이 게시물을 삭제할 권한이 없습니다.";
                    }
                    else if (response.status === 404) {
                        errorMessage =
                            "삭제하려는 게시물을 찾을 수 없거나 이미 삭제되었습니다.";
                    }
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    // JSON 파싱 실패 등 예외 발생 시 기본 에러 메시지 사용
                    console.error("Error parsing delete error response:", e_1);
                    return [3 /*break*/, 5];
                case 5: throw new Error(errorMessage); // 에러 throw
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, response.json()];
                case 7:
                    result = _a.sent();
                    console.log("Delete success response:", result);
                    return [3 /*break*/, 9];
                case 8:
                    e_2 = _a.sent();
                    // 성공 응답 본문 파싱 실패는 무시 가능 (204 No Content 등)
                    console.log("Delete request successful, no response body or parse error.");
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// 게시글 생성 함수
export function createBoard(input, token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/boards"), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer ".concat(token),
                        },
                        body: JSON.stringify({
                            title: input.title,
                            content: input.content,
                            user_id: input.userId, // ✅ 여기는 snake_case로 변환
                        }),
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (!response.ok) {
                        throw new Error(result.details ||
                            result.error ||
                            "\uAC8C\uC2DC\uAE00 \uC791\uC131 \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
// 게시물 수정 API 호출 함수
export function updateBoard(boardId, updateData, // { title?: string; content?: string; }
token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, result, errorResponse, errorMessage, successResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/boards/").concat(boardId), {
                        method: "PATCH", // HTTP 메소드: PATCH
                        headers: {
                            "Content-Type": "application/json", // 컨텐츠 타입 명시
                            Authorization: "Bearer ".concat(token), // 인증 헤더 추가
                        },
                        // 요청 본문: title, content 필드를 소문자로 전송
                        body: JSON.stringify({
                            title: updateData.title,
                            content: updateData.content,
                        }),
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    // 에러 처리 (200 OK가 아닌 경우)
                    if (!response.ok) {
                        errorResponse = result;
                        errorMessage = "\uAC8C\uC2DC\uBB3C \uC218\uC815 \uC2E4\uD328 (HTTP ".concat(response.status, ")");
                        // 400 Bad Request의 경우 details 필드 사용
                        if (response.status === 400 && errorResponse.details) {
                            errorMessage = "\uC785\uB825 \uAC12 \uC624\uB958: ".concat(errorResponse.details);
                        }
                        else if (response.status === 401) {
                            errorMessage = "인증되지 않았습니다. 다시 로그인해주세요.";
                        }
                        else if (response.status === 403) {
                            errorMessage = "이 게시물을 수정할 권한이 없습니다.";
                        }
                        else if (response.status === 404) {
                            errorMessage = "수정하려는 게시물을 찾을 수 없습니다.";
                        }
                        else if (errorResponse.error) {
                            // 다른 에러 코드지만 error 메시지가 있는 경우
                            errorMessage = errorResponse.error;
                        }
                        throw new Error(errorMessage); // 에러 throw
                    }
                    successResponse = result;
                    // 데이터 구조 유효성 검사 (선택적이지만 권장)
                    if (!successResponse.data ||
                        typeof successResponse.data.id !== "number" ||
                        typeof successResponse.data.title !== "string") {
                        console.error("Invalid update board response structure:", successResponse);
                        throw new Error("게시물 수정 응답 형식이 올바르지 않습니다.");
                    }
                    return [2 /*return*/, successResponse.data]; // 성공 시 수정된 게시물 상세 정보 반환
            }
        });
    });
}
