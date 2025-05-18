import { getToken } from "@/app/api/auth";
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

// 댓글 1개에 대한 타입 (작성/조회/수정 공통)
export interface CommentData {
  id: number;
  userId: number;
  boardId: number;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  deleted: boolean;
}

// 댓글 작성 응답 타입
interface CreateCommentResponse {
  message: string;
  data: CommentData;
}

// 댓글 수정 응답 타입 (작성과 동일 구조)
interface UpdateCommentResponse {
  message: string;
  data: CommentData;
}

// 댓글 작성 함수
export async function createComment(
  boardId: number,
  content: string,
  token: string
): Promise<CreateCommentResponse> {
  const response = await fetch(`${baseURL}/api/v1/boards/${boardId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.details || result.error || `댓글 작성 실패 (HTTP ${response.status})`);
  }

  return result as CreateCommentResponse;
}

// 댓글 목록 조회 함수
export async function getComments(boardId: number): Promise<CommentData[]> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseURL}/api/v1/boards/${boardId}/comments`, {
    method: "GET",
    headers,
  });

  if (response.status === 403) {
    throw new Error("댓글 조회 권한이 없습니다 (403 Forbidden)");
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("응답이 JSON 형식이 아닙니다.");
  }

  if (!response.ok) {
    throw new Error(result.details || result.error || `댓글 불러오기 실패 (HTTP ${response.status})`);
  }

  if (!Array.isArray(result)) {
    throw new Error("댓글 목록이 배열 형식이 아닙니다.");
  }

  return result; // 배열 그대로 반환
}

// 댓글 수정 함수 (PATCH로 변경 + boardId 포함)
export async function updateComment(
  boardId: number,
  commentId: number,
  content: string,
  token: string
): Promise<UpdateCommentResponse> {
  const response = await fetch(`${baseURL}/api/v1/boards/${boardId}/comments/${commentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.details || result.error || `댓글 수정 실패 (HTTP ${response.status})`);
  }

  return result as UpdateCommentResponse;
}

// 댓글 삭제 함수
export async function deleteComment(
  boardId: number,
  commentId: number,
  token: string
): Promise<void> {
  const response = await fetch(`${baseURL}/api/v1/boards/${boardId}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.details || result.error || `댓글 삭제 실패 (HTTP ${response.status})`);
  }

  return;
}
