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
// 로그인 API 호출 함수 (반환 타입 수정)
export function login(userName, password) {
    return __awaiter(this, void 0, void 0, function () {
        var response, result, errorResponse, loginResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/auth/session"), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            user_name: userName,
                            password: password,
                        }),
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (!response.ok) {
                        errorResponse = result;
                        // 401 에러는 좀 더 구체적인 메시지 제공 시도
                        if (response.status === 401) {
                            throw new Error(errorResponse.details ||
                                errorResponse.error ||
                                "아이디 또는 비밀번호가 일치하지 않습니다.");
                        }
                        // 다른 에러는 백엔드 메시지 우선 사용
                        throw new Error(errorResponse.details ||
                            errorResponse.error ||
                            "\uB85C\uADF8\uC778 \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                    }
                    loginResponse = result;
                    // 실제 응답 구조에 맞게 유효성 검사 수정
                    if (!loginResponse.data ||
                        !loginResponse.data.accessToken ||
                        !loginResponse.data.user ||
                        typeof loginResponse.data.user.id !== "number") {
                        console.error("Invalid login response structure:", loginResponse);
                        throw new Error("로그인 응답 형식이 올바르지 않습니다.");
                    }
                    return [2 /*return*/, loginResponse.data]; // 성공 시 accessToken, user.id 등이 포함된 data 객체 반환
            }
        });
    });
}
// --- Token Utility Functions ---
// localStorage에서 토큰 가져오기
export function getToken() {
    // 클라이언트 사이드에서만 localStorage 접근 가능
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
}
// localStorage에서 userId 가져오기
export function getUserId() {
    if (typeof window !== "undefined") {
        var userId = localStorage.getItem("userId");
        return userId ? parseInt(userId, 10) : null; // 문자열을 숫자로 변환
    }
    return null;
}
// localStorage에서 토큰 및 관련 정보 제거 (userId 제거 확인)
export function removeToken() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        // 필요하다면 다른 사용자 관련 정보도 여기서 제거
    }
}
// 로그아웃 API 호출 함수
export function logout(token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, errorResult, e_1, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/auth/session"), {
                        method: "DELETE",
                        headers: {
                            Authorization: "Bearer ".concat(token), // 인증 헤더 추가
                            // DELETE 요청은 보통 Content-Type 불필요
                        },
                        // DELETE 요청은 보통 body 없음
                    })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorResult = (_a.sent());
                    throw new Error(errorResult.details ||
                        errorResult.error ||
                        "\uB85C\uADF8\uC544\uC6C3 \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                case 4:
                    e_1 = _a.sent();
                    // json 파싱 실패 등 예외 처리
                    throw new Error("\uB85C\uADF8\uC544\uC6C3 \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                case 5: return [4 /*yield*/, response.json()];
                case 6:
                    result = (_a.sent());
                    console.log("로그아웃 성공:", result.message);
                    return [2 /*return*/];
            }
        });
    });
}
// 회원 탈퇴 API 호출 함수
export function withdrawUser(userId, token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, errorResult, e_2, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/users/").concat(userId), {
                        // 경로 변수 포함
                        method: "DELETE",
                        headers: {
                            Authorization: "Bearer ".concat(token), // 인증 헤더 추가
                        },
                    })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorResult = (_a.sent());
                    throw new Error(errorResult.details ||
                        errorResult.error ||
                        "\uD68C\uC6D0 \uD0C8\uD1F4 \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                case 4:
                    e_2 = _a.sent();
                    throw new Error("\uD68C\uC6D0 \uD0C8\uD1F4 \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                case 5: return [4 /*yield*/, response.json()];
                case 6:
                    result = (_a.sent());
                    console.log("회원 탈퇴 성공:", result.message);
                    return [2 /*return*/];
            }
        });
    });
}
// 비밀번호 변경 API 호출 함수
export function changePassword(currentPassword, newPassword, newPasswordConfirm, token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, errorResult, e_3, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/users/change-password"), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer ".concat(token), // 인증 헤더 추가
                        },
                        body: JSON.stringify({
                            current_password: currentPassword, // snake_case 필드 이름 사용
                            new_password: newPassword,
                            new_password_confirm: newPasswordConfirm,
                        }), // 타입 명시
                    })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorResult = (_a.sent());
                    // 400 에러의 경우 details 메시지를 우선적으로 사용
                    if (response.status === 400 && errorResult.details) {
                        throw new Error(errorResult.details);
                    }
                    throw new Error(errorResult.details ||
                        errorResult.error ||
                        "\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                case 4:
                    e_3 = _a.sent();
                    // JSON 파싱 실패 등 다른 예외 발생 시
                    if (e_3 instanceof Error) {
                        // 잡힌 에러가 Error 인스턴스인지 확인
                        throw e_3; // 이미 Error 객체면 그대로 던짐
                    }
                    throw new Error("\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                case 5: return [4 /*yield*/, response.json()];
                case 6:
                    result = (_a.sent());
                    console.log("비밀번호 변경 성공:", result.message);
                    return [2 /*return*/];
            }
        });
    });
}
// 회원 정보 조회 API 호출 함수
export function getUserInfo(userId, token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, errorResult, e_4, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/users/").concat(userId), {
                        method: "GET",
                        headers: {
                            Authorization: "Bearer ".concat(token), // 인증 헤더 추가
                        },
                    })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorResult = (_a.sent());
                    throw new Error(errorResult.details ||
                        errorResult.error ||
                        "\uD68C\uC6D0 \uC815\uBCF4 \uC870\uD68C \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                case 4:
                    e_4 = _a.sent();
                    throw new Error("\uD68C\uC6D0 \uC815\uBCF4 \uC870\uD68C \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                case 5: return [4 /*yield*/, response.json()];
                case 6:
                    result = (_a.sent());
                    // userName 필드 존재 여부 검증으로 수정
                    if (!result.data || !result.data.userName) {
                        console.error("Invalid user info response structure:", result);
                        throw new Error("회원 정보 응답 형식이 올바르지 않습니다.");
                    }
                    return [2 /*return*/, result.data]; // data 객체 반환
            }
        });
    });
}
// 사용자 게시물 목록 조회 API 호출 함수
export function getUserPosts(userId, token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, result, errorResponse, successResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/users/").concat(userId, "/boards"), {
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
                        throw new Error(errorResponse.details ||
                            errorResponse.error ||
                            "\uC0AC\uC6A9\uC790 \uAC8C\uC2DC\uBB3C \uC870\uD68C \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                    }
                    successResponse = result;
                    // data 필드 및 배열 여부 검증
                    if (!successResponse.data || !Array.isArray(successResponse.data)) {
                        console.error("Invalid user posts response structure:", successResponse);
                        throw new Error("사용자 게시물 응답 형식이 올바르지 않습니다.");
                    }
                    return [2 /*return*/, successResponse.data]; // data 배열 반환
            }
        });
    });
}
// 사용자 댓글 목록 조회 API 호출 함수
export function getUserComments(userId, token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, result, errorResponse, successResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/users/").concat(userId, "/comments"), {
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
                        throw new Error(errorResponse.details ||
                            errorResponse.error ||
                            "\uC0AC\uC6A9\uC790 \uB313\uAE00 \uC870\uD68C \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                    }
                    successResponse = result;
                    // data 필드 및 배열 여부 검증
                    if (!successResponse.data || !Array.isArray(successResponse.data)) {
                        console.error("Invalid user comments response structure:", successResponse);
                        throw new Error("사용자 댓글 응답 형식이 올바르지 않습니다.");
                    }
                    return [2 /*return*/, successResponse.data]; // data 배열 반환
            }
        });
    });
}
// 회원가입 API 호출 함수
export function signup(userName, password) {
    return __awaiter(this, void 0, void 0, function () {
        var response, result, errorResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(import.meta.env.VITE_API_BASE_URL, "/api/v1/auth/register"), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            // 회원가입 요청 시 필드 이름 확인 필요 (userName vs user_name)
                            // 이전 요청에서 user_name을 사용했으므로 일관성을 위해 user_name 사용
                            // 만약 오류 발생 시 userName으로 변경 시도 필요
                            user_name: userName,
                            password: password,
                        }),
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (!response.ok) {
                        errorResponse = result;
                        throw new Error(errorResponse.details ||
                            errorResponse.error ||
                            "\uD68C\uC6D0\uAC00\uC785 \uC2E4\uD328 (HTTP ".concat(response.status, ")"));
                    }
                    // 성공 시 전체 응답 반환 (메시지 포함)
                    return [2 /*return*/, result];
            }
        });
    });
}
