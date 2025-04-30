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
  data: LoginSuccessData; // 수정된 데이터 구조 반영
}

// API 오류 응답 타입 정의 (백엔드 명세 기반)
interface ApiErrorResponse {
  error: string;
  details?: string; // details는 선택적일 수 있음
}

// 로그인 API 호출 함수 (반환 타입 수정)
export async function login(userName: string, password: string): Promise<LoginSuccessData> {
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
  if (!loginResponse.data || !loginResponse.data.accessToken || !loginResponse.data.user || typeof loginResponse.data.user.id !== 'number') {
    console.error("Invalid login response structure:", loginResponse);
    throw new Error("로그인 응답 형식이 올바르지 않습니다.");
  }

  return loginResponse.data; // 성공 시 accessToken, user.id 등이 포함된 data 객체 반환
}

// --- Token Utility Functions ---

// localStorage에서 토큰 가져오기
export function getToken(): string | null {
  // 클라이언트 사이드에서만 localStorage 접근 가능
  if (typeof window !== 'undefined') {
    return localStorage.getItem("authToken");
  }
  return null;
}

// localStorage에서 토큰 및 관련 정보 제거
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId"); // 로그인 시 저장했던 다른 정보도 함께 제거
    // 필요하다면 다른 사용자 관련 정보도 여기서 제거
  }
}

// --- Logout API Function ---

interface LogoutResponse {
  message: string;
}

// 로그아웃 API 호출 함수
export async function logout(token: string): Promise<void> {
  const response = await fetch("http://localhost:8080/api/v1/auth/session", {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`, // 인증 헤더 추가
      // DELETE 요청은 보통 Content-Type 불필요
    },
    // DELETE 요청은 보통 body 없음
  });

  if (!response.ok) {
    // 로그아웃 실패 시에도 클라이언트에서는 토큰을 제거하는 것이 일반적이지만,
    // 서버 에러(500 등)는 사용자에게 알릴 수 있도록 에러를 던짐
    try {
      const errorResult = await response.json() as ApiErrorResponse;
      throw new Error(errorResult.details || errorResult.error || `로그아웃 실패 (HTTP ${response.status})`);
    } catch (e) { // json 파싱 실패 등 예외 처리
      throw new Error(`로그아웃 실패 (HTTP ${response.status})`);
    }
  }

  // 성공 시 (200 OK), 응답 본문은 확인만 하고 별도 반환값 없음
  const result = await response.json() as LogoutResponse;
  console.log("로그아웃 성공:", result.message);
}
