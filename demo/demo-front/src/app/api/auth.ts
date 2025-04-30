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

// 필요한 경우 회원가입 함수도 여기에 추가하거나 별도 파일로 관리할 수 있습니다.
// export async function register(userName: string, password: string) { ... }
