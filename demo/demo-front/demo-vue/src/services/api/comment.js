const baseURL = process.env.VUE_APP_BASE_URL;

import { getToken } from "@/services/api/auth.js";

// 댓글 작성 함수
export async function createComment(boardId, content, token) {
  const response = await fetch(`${baseURL}/api/v1/boards/${boardId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.details || result.error || `댓글 작성 실패 (HTTP ${response.status})`);
  }

  return result;
}

// 댓글 목록 조회 함수
export async function getComments(boardId) {
  const token = getToken();

  const headers = {
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
    console.warn("getComments: API response is not an array as expected by the original client code.", result);
  }

  return result;
}

// 댓글 수정 함수 (PATCH로 변경 + boardId 포함)
export async function updateComment(boardId, commentId, content, token) {
  const response = await fetch(`${baseURL}/api/v1/boards/${boardId}/comments/${commentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.details || result.error || `댓글 수정 실패 (HTTP ${response.status})`);
  }

  return result;
}

// 댓글 삭제 함수
export async function deleteComment(boardId, commentId, token) {
  const response = await fetch(`${baseURL}/api/v1/boards/${boardId}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = `댓글 삭제 실패 (HTTP ${response.status})`;
    try {
      const result = await response.json();
      errorMessage = result.details || result.error || errorMessage;
    } catch (e) {
       // no-op: JSON 파싱 실패 시 무시
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return;
  }
  return;
}
