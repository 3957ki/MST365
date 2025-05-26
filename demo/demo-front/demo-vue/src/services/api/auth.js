const baseURL = process.env.VUE_APP_BASE_URL;

// --- 로그인 API ---
export async function login(userName, password) {
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
    const errorResponse = result;
    if (response.status === 401) {
      throw new Error(
        errorResponse.details || errorResponse.error || "아이디 또는 비밀번호가 일치하지 않습니다."
      );
    }
    throw new Error(
      errorResponse.details || errorResponse.error || `로그인 실패 (HTTP ${response.status})`
    );
  }

  const loginResponse = result;
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

// --- 토큰 유틸 ---
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

// --- 로그아웃 API ---
export async function logout(token) {
  const response = await fetch(`${baseURL}/api/v1/auth/session`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    try {
      const errorResult = await response.json();
      throw new Error(
        errorResult.details || errorResult.error || `로그아웃 실패 (HTTP ${response.status})`
      );
    } catch (e) {
      throw new Error(`로그아웃 실패 (HTTP ${response.status})`);
    }
  }

  const result = await response.json();
  console.log("로그아웃 성공:", result.message);
}

// --- 회원 탈퇴 API ---
export async function withdrawUser(userId, token) {
  const response = await fetch(`${baseURL}/api/v1/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    try {
      const errorResult = await response.json();
      throw new Error(
        errorResult.details || errorResult.error || `회원 탈퇴 실패 (HTTP ${response.status})`
      );
    } catch (e) {
      throw new Error(`회원 탈퇴 실패 (HTTP ${response.status})`);
    }
  }

  const result = await response.json();
  console.log("회원 탈퇴 성공:", result.message);
}

// --- 비밀번호 변경 API ---
export async function changePassword(currentPassword, newPassword, newPasswordConfirm, token) {
  const response = await fetch(`${baseURL}/api/v1/users/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    }),
  });

  if (!response.ok) {
    try {
      const errorResult = await response.json();
      if (response.status === 400 && errorResult.details) {
        throw new Error(errorResult.details);
      }
      throw new Error(
        errorResult.details || errorResult.error || `비밀번호 변경 실패 (HTTP ${response.status})`
      );
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error(`비밀번호 변경 실패 (HTTP ${response.status})`);
    }
  }

  const result = await response.json();
  console.log("비밀번호 변경 성공:", result.message);
}

// --- 회원 정보 조회 API ---
export async function getUserInfo(userId, token) {
  const response = await fetch(`${baseURL}/api/v1/users/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    try {
      const errorResult = await response.json();
      throw new Error(
        errorResult.details || errorResult.error || `회원 정보 조회 실패 (HTTP ${response.status})`
      );
    } catch (e) {
      throw new Error(`회원 정보 조회 실패 (HTTP ${response.status})`);
    }
  }

  const result = await response.json();
  if (!result.data || !result.data.userName) {
    console.error("Invalid user info response structure:", result);
    throw new Error("회원 정보 응답 형식이 올바르지 않습니다.");
  }

  return result.data;
}

// --- 사용자 게시물 조회 API ---
export async function getUserPosts(userId, token) {
  const response = await fetch(`${baseURL}/api/v1/users/${userId}/boards`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const errorResponse = result;
    throw new Error(
      errorResponse.details || errorResponse.error || `사용자 게시물 조회 실패 (HTTP ${response.status})`
    );
  }

  const successResponse = result;
  if (!successResponse.data || !Array.isArray(successResponse.data)) {
    console.error("Invalid user posts response structure:", successResponse);
    throw new Error("사용자 게시물 응답 형식이 올바르지 않습니다.");
  }

  return successResponse.data;
}

// --- 사용자 댓글 조회 API ---
export async function getUserComments(userId, token) {
  const response = await fetch(`${baseURL}/api/v1/users/${userId}/comments`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const errorResponse = result;
    throw new Error(
      errorResponse.details || errorResponse.error || `사용자 댓글 조회 실패 (HTTP ${response.status})`
    );
  }

  const successResponse = result;
  if (!successResponse.data || !Array.isArray(successResponse.data)) {
    console.error("Invalid user comments response structure:", successResponse);
    throw new Error("사용자 댓글 응답 형식이 올바르지 않습니다.");
  }

  return successResponse.data;
}

// --- 회원가입 API ---
export async function signup(userName, password) {
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
    const errorResponse = result;
    throw new Error(
      errorResponse.details || errorResponse.error || `회원가입 실패 (HTTP ${response.status})`
    );
  }

  return result;
}
