'use client';

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
  view: number;
  createdAt: string; // camelCase, ISO 8601 문자열
}

// 전체 게시물 목록 API 응답 타입 정의
interface GetBoardsResponse {
  message: string;
  data: BoardListItem[];
  // pagination 정보는 현재 명세에 없으므로 생략하거나 optional로 추가 가능
}

// 전체 게시물 목록 조회 API 호출 함수
export async function getBoards(token: string): Promise<BoardListItem[]> {
  const response = await fetch("http://localhost:8080/api/v1/boards", {
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
  view: number;
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
    `http://localhost:8080/api/v1/boards/${boardId}`,
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
