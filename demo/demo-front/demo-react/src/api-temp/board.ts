"use client";

import { getToken } from "./auth"; // getToken 함수 임포트 (필요시)

// API 오류 응답 타입 (auth.ts에서 가져오거나 동일하게 정의)
interface ApiErrorResponse {
  error: string;
  details?: string;
}

// 게시물 목록 아이템 타입 정의 (백엔드 응답 기반)
export interface BoardListItem {
  id: number;
  userId: number; // camelCase
  title: string;
  createdAt: string; // camelCase, ISO 8601 문자열
}

// 전체 게시물 목록 API 응답 타입 정의
interface GetBoardsResponse {
  message: string;
  data: BoardListItem[];
  // pagination 정보는 현재 명세에 없으므로 생략하거나 optional로 추가 가능
}

// 전체 게시물 목록 조회 API 호출 함수 (페이징 추가)
export async function getBoards(
  token: string,
  page: number,
  size: number
): Promise<BoardListItem[]> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/boards?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // 인증 헤더 추가
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const errorResponse = result as ApiErrorResponse;
    // 401 에러는 토큰 만료 또는 잘못된 토큰일 가능성이 높음
    if (response.status === 401) {
      // 필요하다면 여기서 토큰 제거 또는 로그인 페이지 리다이렉션 로직 추가 가능
      // 하지만 이 함수는 데이터만 가져오는 역할에 집중하고, UI 로직은 페이지 컴포넌트에서 처리
      throw new Error(
        errorResponse.details || errorResponse.error || "인증되지 않았습니다."
      );
    }
    // 다른 에러 (500 등)
    throw new Error(
      errorResponse.details ||
        errorResponse.error ||
        `게시물 목록 조회 실패 (HTTP ${response.status})`
    );
  }

  const successResponse = result as GetBoardsResponse;
  // 데이터 구조 유효성 검사 (data 필드가 배열인지 확인)
  if (!successResponse.data || !Array.isArray(successResponse.data)) {
    console.error("Invalid boards response structure:", successResponse);
    throw new Error("게시물 목록 응답 형식이 올바르지 않습니다.");
  }

  return successResponse.data; // 성공 시 게시물 목록 배열 반환
}

// --- 단일 게시물 조회 ---

// 단일 게시물 상세 정보 타입 정의 (백엔드 응답 data 객체 기반)
export interface BoardDetail {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string; // ISO 8601
  updatedAt: string | null; // ISO 8601 or null
  deletedAt: string | null; // ISO 8601 or null
  deleted: boolean;
}

// 단일 게시물 조회 API 응답 타입 정의
interface GetBoardDetailResponse {
  message: string;
  data: BoardDetail;
}

// 단일 게시물 조회 API 호출 함수
export async function getBoardById(
  boardId: number | string,
  token: string
): Promise<BoardDetail | null> {
  // Promise<BoardDetail | null> -> 404 시 null 반환
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/boards/${boardId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // 인증 헤더 추가
      },
    }
  );

  // 404 Not Found 처리
  if (response.status === 404) {
    return null; // 게시물이 없으면 null 반환
  }

  const result = await response.json();

  // 404 외 다른 에러 처리 (401, 403, 500 등)
  if (!response.ok) {
    const errorResponse = result as ApiErrorResponse;
    if (response.status === 401) {
      throw new Error(
        errorResponse.details || errorResponse.error || "인증되지 않았습니다."
      );
    }
    if (response.status === 403) {
      throw new Error(
        errorResponse.details || errorResponse.error || "접근 권한이 없습니다."
      );
    }
    throw new Error(
      errorResponse.details ||
        errorResponse.error ||
        `게시물 조회 실패 (HTTP ${response.status})`
    );
  }

  // 성공 (200 OK) 처리
  const successResponse = result as GetBoardDetailResponse;
  // 데이터 구조 유효성 검사 (data 객체 및 필수 필드 확인)
  if (
    !successResponse.data ||
    typeof successResponse.data.id !== "number" ||
    typeof successResponse.data.title !== "string"
  ) {
    console.error("Invalid board detail response structure:", successResponse);
    throw new Error("게시물 상세 정보 응답 형식이 올바르지 않습니다.");
  }

  return successResponse.data; // 성공 시 게시물 상세 정보 객체 반환
}

// --- 게시물 삭제 ---

// 게시물 삭제 API 호출 함수
export async function deleteBoard(
  boardId: number | string,
  token: string
): Promise<void> {
  // 성공 시 반환값 없음 (void)
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/boards/${boardId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, // 인증 헤더 추가
      },
    }
  );

  // 에러 처리 (200 OK가 아닌 경우)
  if (!response.ok) {
    let errorMessage = `게시물 삭제 실패 (HTTP ${response.status})`;
    try {
      // 오류 응답 본문이 있을 경우 파싱 시도
      const errorResult = (await response.json()) as ApiErrorResponse;
      errorMessage =
        errorResult.details ||
        errorResult.error ||
        `게시물 삭제 실패 (HTTP ${response.status})`;

      // 특정 상태 코드에 따른 메시지 커스터마이징 (선택적)
      if (response.status === 401) {
        errorMessage = "인증되지 않았습니다. 다시 로그인해주세요.";
      } else if (response.status === 403) {
        errorMessage = "이 게시물을 삭제할 권한이 없습니다.";
      } else if (response.status === 404) {
        errorMessage =
          "삭제하려는 게시물을 찾을 수 없거나 이미 삭제되었습니다.";
      }
    } catch (e) {
      // JSON 파싱 실패 등 예외 발생 시 기본 에러 메시지 사용
      console.error("Error parsing delete error response:", e);
    }
    throw new Error(errorMessage); // 에러 throw
  }

  // 성공 (200 OK) 시에는 별도 작업 없이 함수 종료 (void 반환)
  // 성공 메시지는 응답 본문에 포함될 수 있으나, 여기서는 확인만 함
  try {
    const result = await response.json(); // 성공 메시지 확인 (선택적)
    console.log("Delete success response:", result);
  } catch (e) {
    // 성공 응답 본문 파싱 실패는 무시 가능 (204 No Content 등)
    console.log("Delete request successful, no response body or parse error.");
  }
}

// 게시글 생성 요청용 타입 (프론트 기준: camelCase)
interface CreateBoardInput {
  title: string;
  content: string;
  userId: number;
}

// 게시글 생성 응답 타입
interface CreateBoardResponse {
  message: string;
  data: {
    boardId: number;
  };
}

// 게시글 생성 함수
export async function createBoard(
  input: CreateBoardInput,
  token: string
): Promise<CreateBoardResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/boards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: input.title,
      content: input.content,
      user_id: input.userId, // ✅ 여기는 snake_case로 변환
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.details ||
        result.error ||
        `게시글 작성 실패 (HTTP ${response.status})`
    );
  }

  return result as CreateBoardResponse;
}

// --- 게시물 수정 ---

// 게시물 수정 요청 본문 타입 (프론트 기준: camelCase, 선택적 필드)
interface UpdateBoardInput {
  title?: string;
  content?: string;
}

// 게시물 수정 API 응답 타입 (성공 시 BoardDetail 반환)
interface UpdateBoardResponse {
  message: string;
  data: BoardDetail; // 수정된 게시물 상세 정보
}

// 게시물 수정 API 호출 함수
export async function updateBoard(
  boardId: number | string,
  updateData: UpdateBoardInput, // { title?: string; content?: string; }
  token: string
): Promise<BoardDetail> {
  // Promise<BoardDetail> -> 성공 시 수정된 게시물 반환
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/boards/${boardId}`,
    {
      method: "PATCH", // HTTP 메소드: PATCH
      headers: {
        "Content-Type": "application/json", // 컨텐츠 타입 명시
        Authorization: `Bearer ${token}`, // 인증 헤더 추가
      },
      // 요청 본문: title, content 필드를 소문자로 전송
      body: JSON.stringify({
        title: updateData.title,
        content: updateData.content,
      }),
    }
  );

  const result = await response.json();

  // 에러 처리 (200 OK가 아닌 경우)
  if (!response.ok) {
    const errorResponse = result as ApiErrorResponse;
    let errorMessage = `게시물 수정 실패 (HTTP ${response.status})`;

    // 400 Bad Request의 경우 details 필드 사용
    if (response.status === 400 && errorResponse.details) {
      errorMessage = `입력 값 오류: ${errorResponse.details}`;
    } else if (response.status === 401) {
      errorMessage = "인증되지 않았습니다. 다시 로그인해주세요.";
    } else if (response.status === 403) {
      errorMessage = "이 게시물을 수정할 권한이 없습니다.";
    } else if (response.status === 404) {
      errorMessage = "수정하려는 게시물을 찾을 수 없습니다.";
    } else if (errorResponse.error) {
      // 다른 에러 코드지만 error 메시지가 있는 경우
      errorMessage = errorResponse.error;
    }

    throw new Error(errorMessage); // 에러 throw
  }

  // 성공 (200 OK) 처리
  const successResponse = result as UpdateBoardResponse;
  // 데이터 구조 유효성 검사 (선택적이지만 권장)
  if (
    !successResponse.data ||
    typeof successResponse.data.id !== "number" ||
    typeof successResponse.data.title !== "string"
  ) {
    console.error("Invalid update board response structure:", successResponse);
    throw new Error("게시물 수정 응답 형식이 올바르지 않습니다.");
  }

  return successResponse.data; // 성공 시 수정된 게시물 상세 정보 반환
}
