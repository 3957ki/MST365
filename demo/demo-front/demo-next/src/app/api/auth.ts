const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

// API 응답 타입 정의 (실제 응답 기반)
interface UserData {
  id: number;
  userName: string;
}

interface LoginSuccessData {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserData;
}

interface LoginResponse {
  message: string;
  data: LoginSuccessData;
}

// API 오류 응답 타입 정의 (백엔드 명세 기반)
interface ApiErrorResponse {
  error: string;
  details?: string; // details는 선택적일 수 있음
}

// --- 토큰 유틸리티 함수 ---

// localStorage에서 토큰 가져오기
export function getToken(): string | null {
  // 클라이언트 사이드에서만 localStorage 접근 가능
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

// localStorage에서 userId 가져오기
export function getUserId(): number | null {
  if (typeof window !== "undefined") {
    const userId = localStorage.getItem("userId");
    return userId ? parseInt(userId, 10) : null; // 문자열을 숫자로 변환
  }
  return null;
}

// localStorage에서 토큰 및 관련 정보 제거 (userId 제거 확인)
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    // 필요하다면 다른 사용자 관련 정보도 여기서 제거
  }
}

// --- 회원가입 API 함수 ---

// 회원가입 응답 타입 정의
interface SignupResponseData {
  userId: number;
}

export interface SignupResponse {
  message: string;
  data: SignupResponseData;
}

// 회원가입 API 호출 함수
export async function signup(userName: string, password: string): Promise<SignupResponse> {
  const response = await fetch(`${baseURL}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_name: userName,
      password: password,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const errorResponse = result as ApiErrorResponse;
    throw new Error(errorResponse.details || errorResponse.error || `회원가입 실패 (HTTP ${response.status})`);
  }

  // 성공 시 전체 응답 반환 (메시지 포함)
  return result as SignupResponse;
}

// --- 로그인 API 함수 ---

// 로그인 API 호출 함수 (반환 타입 수정)
export async function login(userName: string, password: string): Promise<LoginSuccessData> {
  const response = await fetch(`${baseURL}/api/v1/auth/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_name: userName,
      password: password,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const errorResponse = result as ApiErrorResponse;
    // 401 에러는 좀 더 구체적인 메시지 제공 시도
    if (response.status === 401) {
      throw new Error(errorResponse.details || errorResponse.error || "아이디 또는 비밀번호가 일치하지 않습니다.");
    }
    // 다른 에러는 백엔드 메시지 우선 사용
    throw new Error(errorResponse.details || errorResponse.error || `로그인 실패 (HTTP ${response.status})`);
  }

  const loginResponse = result as LoginResponse;
  // 실제 응답 구조에 맞게 유효성 검사 수정
  if (
    !loginResponse.data ||
    !loginResponse.data.accessToken ||
    !loginResponse.data.user ||
    typeof loginResponse.data.user.id !== "number"
  ) {
    console.error("Invalid login response structure:", loginResponse);
    throw new Error("로그인 응답 형식이 올바르지 않습니다.");
  }

  return loginResponse.data; // 성공 시 accessToken, user.id 등이 포함된 data 객체 반환
}

// --- 로그아웃 API 함수 ---

interface LogoutResponse {
  message: string;
}

// 로그아웃 API 호출 함수
export async function logout(token: string): Promise<void> {
  const response = await fetch(`${baseURL}/api/v1/auth/session`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`, // 인증 헤더 추가
      // DELETE 요청은 보통 Content-Type 불필요
    },
    // DELETE 요청은 보통 body 없음
  });

  if (!response.ok) {
    // 로그아웃 실패 시에도 클라이언트에서는 토큰을 제거하는 것이 일반적이지만,
    // 서버 에러(500 등)는 사용자에게 알릴 수 있도록 에러를 던짐
    try {
      const errorResult = (await response.json()) as ApiErrorResponse;
      throw new Error(errorResult.details || errorResult.error || `로그아웃 실패 (HTTP ${response.status})`);
    } catch (e) {
      // json 파싱 실패 등 예외 처리
      throw new Error(`로그아웃 실패 (HTTP ${response.status})`);
    }
  }

  // 성공 시 (200 OK), 응답 본문은 확인만 하고 별도 반환값 없음
  const result = (await response.json()) as LogoutResponse;
  console.log("로그아웃 성공:", result.message);
}

// --- 회원탈퇴 API 함수 ---

interface WithdrawResponse {
  message: string;
}

// 회원 탈퇴 API 호출 함수
export async function withdrawUser(userId: number, token: string): Promise<void> {
  const response = await fetch(`${baseURL}/api/v1/users/${userId}`, {
    // 경로 변수 포함
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // 실패 시 에러 처리 (401, 403, 404, 500 등)
    try {
      const errorResult = (await response.json()) as ApiErrorResponse;
      throw new Error(errorResult.details || errorResult.error || `회원 탈퇴 실패 (HTTP ${response.status})`);
    } catch (e) {
      throw new Error(`회원 탈퇴 실패 (HTTP ${response.status})`);
    }
  }

  // 성공 시 (200 OK)
  const result = (await response.json()) as WithdrawResponse;
  console.log("회원 탈퇴 성공:", result.message);
  // 반환값 없음 (Promise<void>)
}

// --- 비밀번호 변경 API 함수 ---

// 비밀번호 변경 요청 타입
interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

// 비밀번호 변경 성공 응답 타입
interface PasswordChangeSuccessResponse {
  message: string;
}

// 비밀번호 변경 API 호출 함수
export async function changePassword(
  currentPassword: string,
  newPassword: string,
  newPasswordConfirm: string,
  token: string
): Promise<void> {
  // 성공 시 반환값 없음
  const response = await fetch(`${baseURL}/api/v1/users/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 인증 헤더 추가
    },
    body: JSON.stringify({
      current_password: currentPassword, // snake_case 필드 이름 사용
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    } as PasswordChangeRequest), // 타입 명시
  });

  if (!response.ok) {
    // 실패 시 에러 처리 (400, 401, 500 등)
    try {
      const errorResult = (await response.json()) as ApiErrorResponse; // 기존 에러 타입 재활용
      // 400 에러의 경우 details 메시지를 우선적으로 사용
      if (response.status === 400 && errorResult.details) {
        throw new Error(errorResult.details);
      }
      throw new Error(errorResult.details || errorResult.error || `비밀번호 변경 실패 (HTTP ${response.status})`);
    } catch (e: any) {
      // JSON 파싱 실패 등 다른 예외 발생 시
      if (e instanceof Error) {
        // 잡힌 에러가 Error 인스턴스인지 확인
        throw e; // 이미 Error 객체면 그대로 던짐
      }
      throw new Error(`비밀번호 변경 실패 (HTTP ${response.status})`);
    }
  }

  // 성공 시 (200 OK)
  const result = (await response.json()) as PasswordChangeSuccessResponse;
  console.log("비밀번호 변경 성공:", result.message);
  // 반환값 없음 (Promise<void>)
}

// --- 사용자 정보 조회 API 함수 ---

// 사용자 정보 응답 데이터 타입 (실제 응답 기반, camelCase 주의)
export interface UserInfoData {
  id: number;
  userName: string; // camelCase로 수정
  createdAt: string; // camelCase로 수정 (실제 응답 확인)
  updatedAt: string; // camelCase로 수정 (실제 응답 확인)
}

// 전체 회원 정보 조회 응답 타입
interface GetUserInfoResponse {
  message: string;
  data: UserInfoData;
}

// 회원 정보 조회 API 호출 함수
export async function getUserInfo(userId: number, token: string): Promise<UserInfoData> {
  const response = await fetch(`${baseURL}/api/v1/users/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // 인증 헤더 추가
    },
  });

  if (!response.ok) {
    // 실패 시 에러 처리 (401, 403, 404, 500 등)
    try {
      const errorResult = (await response.json()) as ApiErrorResponse; // 기존 에러 타입 재활용
      throw new Error(errorResult.details || errorResult.error || `회원 정보 조회 실패 (HTTP ${response.status})`);
    } catch (e) {
      throw new Error(`회원 정보 조회 실패 (HTTP ${response.status})`);
    }
  }

  // 성공 시 (200 OK)
  const result = (await response.json()) as GetUserInfoResponse;
  // userName 필드 존재 여부 검증으로 수정
  if (!result.data || !result.data.userName) {
    console.error("Invalid user info response structure:", result);
    throw new Error("회원 정보 응답 형식이 올바르지 않습니다.");
  }
  return result.data; // data 객체 반환
}

// --- 사용자 게시글 조회 API 함수 ---

// 사용자 게시물 아이템 타입 정의
export interface UserPostItem {
  id: number;
  user_id: number; // 백엔드 응답 필드명 확인 (user_id vs userId) - API 명세에 따라 user_id 사용 (이것도 확인 필요)
  title: string;
  view: number;
  createdAt: string; // 필드명을 createdAt (camelCase)으로 수정
}

// 사용자 게시물 목록 조회 응답 타입
interface GetUserPostsResponse {
  message: string;
  data: UserPostItem[];
  // pagination 필드는 선택적이므로 타입에 포함하지 않거나 optional로 추가 가능
}

// 사용자 게시물 목록 조회 API 호출 함수
export async function getUserPosts(userId: number, token: string): Promise<UserPostItem[]> {
  const response = await fetch(`${baseURL}/api/v1/users/${userId}/boards`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // 인증 헤더 추가
    },
  });

  const result = await response.json();

  if (!response.ok) {
    // 실패 시 에러 처리 (401, 403, 404, 500 등)
    const errorResponse = result as ApiErrorResponse; // 기존 에러 타입 재활용
    throw new Error(
      errorResponse.details || errorResponse.error || `사용자 게시물 조회 실패 (HTTP ${response.status})`
    );
  }

  // 성공 시 (200 OK)
  const successResponse = result as GetUserPostsResponse;
  // data 필드 및 배열 여부 검증
  if (!successResponse.data || !Array.isArray(successResponse.data)) {
    console.error("Invalid user posts response structure:", successResponse);
    throw new Error("사용자 게시물 응답 형식이 올바르지 않습니다.");
  }
  return successResponse.data; // data 배열 반환
}

// --- 사용자 댓글 조회 API 힘수 ---

// 사용자 댓글 아이템 타입 정의 (camelCase 필드명 사용)
export interface UserCommentItem {
  id: number;
  userId: number; // 실제 응답 필드명 확인 필요 (userId vs user_id) - 요청에 따라 userId 사용
  boardId: number; // 실제 응답 필드명 확인 필요 (boardId vs board_id) - 요청에 따라 boardId 사용
  content: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  deleted: boolean;
}

// 사용자 댓글 목록 조회 응답 타입
interface GetUserCommentsResponse {
  message: string;
  data: UserCommentItem[];
  // pagination 필드는 선택적이므로 타입에 포함하지 않거나 optional로 추가 가능
}

// 사용자 댓글 목록 조회 API 호출 함수
export async function getUserComments(userId: number, token: string): Promise<UserCommentItem[]> {
  const response = await fetch(`${baseURL}/api/v1/users/${userId}/comments`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // 인증 헤더 추가
    },
  });

  const result = await response.json();

  if (!response.ok) {
    // 실패 시 에러 처리 (401, 403, 404, 500 등)
    const errorResponse = result as ApiErrorResponse; // 기존 에러 타입 재활용
    throw new Error(errorResponse.details || errorResponse.error || `사용자 댓글 조회 실패 (HTTP ${response.status})`);
  }

  // 성공 시 (200 OK)
  const successResponse = result as GetUserCommentsResponse;
  // data 필드 및 배열 여부 검증
  if (!successResponse.data || !Array.isArray(successResponse.data)) {
    console.error("Invalid user comments response structure:", successResponse);
    throw new Error("사용자 댓글 응답 형식이 올바르지 않습니다.");
  }
  return successResponse.data; // data 배열 반환
}
