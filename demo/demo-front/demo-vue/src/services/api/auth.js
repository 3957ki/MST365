// API 응답 타입 정의 (실제 응답 기반) - JS에서는 주석으로만 남김
// interface UserData {
//   id: number;
//   userName: string;
// }

// interface LoginSuccessData {
//   accessToken: string;
//   tokenType: string;
//   expiresIn: number;
//   user: UserData;
// }

// interface LoginResponse {
//   message: string;
//   data: LoginSuccessData; // 수정된 데이터 구조 반영
// }

// API 오류 응답 타입 정의 (백엔드 명세 기반) - JS에서는 주석으로만 남김
// interface ApiErrorResponse {
//   error: string;
//   details?: string; // details는 선택적일 수 있음
// }

// 로그인 API 호출 함수
export async function login(userName, password) {
  const response = await fetch("http://localhost:8080/api/v1/auth/session", {
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
    const errorResponse = result; // as ApiErrorResponse 제거
    if (response.status === 401) {
      throw new Error(
        errorResponse.details ||
          errorResponse.error ||
          "아이디 또는 비밀번호가 일치하지 않습니다."
      );
    }
    throw new Error(
      errorResponse.details ||
        errorResponse.error ||
        `로그인 실패 (HTTP ${response.status})`
    );
  }

  const loginResponse = result; // as LoginResponse 제거
  if (
    !loginResponse.data ||
    !loginResponse.data.accessToken ||
    !loginResponse.data.user ||
    typeof loginResponse.data.user.id !== "number"
  ) {
    console.error("Invalid login response structure:", loginResponse);
    throw new Error("로그인 응답 형식이 올바르지 않습니다.");
  }

  return loginResponse.data;
}

// --- Token Utility Functions ---

export function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

export function getUserId() {
  if (typeof window !== "undefined") {
    const userId = localStorage.getItem("userId");
    return userId ? parseInt(userId, 10) : null;
  }
  return null;
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
  }
}

// --- Logout API Function ---

// interface LogoutResponse {
//   message: string;
// }

export async function logout(token) {
  const response = await fetch("http://localhost:8080/api/v1/auth/session", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    try {
      const errorResult = await response.json(); // as ApiErrorResponse 제거
      throw new Error(
        errorResult.details ||
          errorResult.error ||
          `로그아웃 실패 (HTTP ${response.status})`
      );
    } catch (e) {
      throw new Error(`로그아웃 실패 (HTTP ${response.status})`);
    }
  }

  const result = await response.json(); // as LogoutResponse 제거
  console.log("로그아웃 성공:", result.message);
}

// --- Withdraw User API Function ---

// interface WithdrawResponse {
//   message: string;
// }

export async function withdrawUser(userId, token) {
  const response = await fetch(`http://localhost:8080/api/v1/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    try {
      const errorResult = await response.json(); // as ApiErrorResponse 제거
      throw new Error(
        errorResult.details ||
          errorResult.error ||
          `회원 탈퇴 실패 (HTTP ${response.status})`
      );
    } catch (e) {
      throw new Error(`회원 탈퇴 실패 (HTTP ${response.status})`);
    }
  }

  const result = await response.json(); // as WithdrawResponse 제거
  console.log("회원 탈퇴 성공:", result.message);
}

// --- Change Password API Function ---

// interface PasswordChangeRequest {
//   current_password: string;
//   new_password: string;
//   new_password_confirm: string;
// }

// interface PasswordChangeSuccessResponse {
//   message: string;
// }

export async function changePassword(
  currentPassword,
  newPassword,
  newPasswordConfirm,
  token
) {
  const response = await fetch(
    "http://localhost:8080/api/v1/users/change-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      }), // as PasswordChangeRequest 제거
    }
  );

  if (!response.ok) {
    try {
      const errorResult = await response.json(); // as ApiErrorResponse 제거
      if (response.status === 400 && errorResult.details) {
        throw new Error(errorResult.details);
      }
      throw new Error(
        errorResult.details ||
          errorResult.error ||
          `비밀번호 변경 실패 (HTTP ${response.status})`
      );
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      throw new Error(`비밀번호 변경 실패 (HTTP ${response.status})`);
    }
  }

  const result = await response.json(); // as PasswordChangeSuccessResponse 제거
  console.log("비밀번호 변경 성공:", result.message);
}

// --- Get User Info API Function ---

// export interface UserInfoData { // JS에서는 주석 처리
//   id: number;
//   userName: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface GetUserInfoResponse {
//   message: string;
//   data: UserInfoData;
// }

export async function getUserInfo(userId, token) {
  const response = await fetch(`http://localhost:8080/api/v1/users/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    try {
      const errorResult = await response.json(); // as ApiErrorResponse 제거
      throw new Error(
        errorResult.details ||
          errorResult.error ||
          `회원 정보 조회 실패 (HTTP ${response.status})`
      );
    } catch (e) {
      throw new Error(`회원 정보 조회 실패 (HTTP ${response.status})`);
    }
  }

  const result = await response.json(); // as GetUserInfoResponse 제거
  if (!result.data || !result.data.userName) {
    console.error("Invalid user info response structure:", result);
    throw new Error("회원 정보 응답 형식이 올바르지 않습니다.");
  }
  return result.data;
}

// --- Get User Posts API Function ---

// export interface UserPostItem { // JS에서는 주석 처리
//   id: number;
//   user_id: number;
//   title: string;
//   view: number;
//   createdAt: string;
// }

// interface GetUserPostsResponse {
//   message: string;
//   data: UserPostItem[];
// }

export async function getUserPosts(userId, token) {
  const response = await fetch(
    `http://localhost:8080/api/v1/users/${userId}/boards`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const errorResponse = result; // as ApiErrorResponse 제거
    throw new Error(
      errorResponse.details ||
        errorResponse.error ||
        `사용자 게시물 조회 실패 (HTTP ${response.status})`
    );
  }

  const successResponse = result; // as GetUserPostsResponse 제거
  if (!successResponse.data || !Array.isArray(successResponse.data)) {
    console.error("Invalid user posts response structure:", successResponse);
    throw new Error("사용자 게시물 응답 형식이 올바르지 않습니다.");
  }
  return successResponse.data;
}

// --- Get User Comments API Function ---

// export interface UserCommentItem { // JS에서는 주석 처리
//   id: number;
//   userId: number;
//   boardId: number;
//   content: string;
//   createdAt: string;
//   updatedAt: string | null;
//   deletedAt: string | null;
//   deleted: boolean;
// }

// interface GetUserCommentsResponse {
//   message: string;
//   data: UserCommentItem[];
// }

export async function getUserComments(userId, token) {
  const response = await fetch(
    `http://localhost:8080/api/v1/users/${userId}/comments`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const errorResponse = result; // as ApiErrorResponse 제거
    throw new Error(
      errorResponse.details ||
        errorResponse.error ||
        `사용자 댓글 조회 실패 (HTTP ${response.status})`
    );
  }

  const successResponse = result; // as GetUserCommentsResponse 제거
  if (!successResponse.data || !Array.isArray(successResponse.data)) {
    console.error("Invalid user comments response structure:", successResponse);
    throw new Error("사용자 댓글 응답 형식이 올바르지 않습니다.");
  }
  return successResponse.data;
}

// --- Signup API Function ---

// interface SignupResponseData {
//   userId: number;
// }

// export interface SignupResponse { // JS에서는 주석 처리
//   message: string;
//   data: SignupResponseData;
// }

export async function signup(userName, password) {
  const response = await fetch("http://localhost:8080/api/v1/auth/register", {
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
    const errorResponse = result; // as ApiErrorResponse 제거
    throw new Error(
      errorResponse.details ||
        errorResponse.error ||
        `회원가입 실패 (HTTP ${response.status})`
    );
  }

  return result; // as SignupResponse 제거
}
