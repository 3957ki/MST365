import { getToken } from '@/services/api/auth.js'; // Updated import path

// 댓글 작성 함수
export async function createComment(boardId, content, token) {
  const response = await fetch(`http://localhost:8080/api/v1/boards/${boardId}/comments`, {
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

  return result; // Removed 'as CreateCommentResponse'
}

// 댓글 목록 조회 함수
export async function getComments(boardId) {
  const token = getToken();

  const headers = { // Simplified HeadersInit for JS
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`http://localhost:8080/api/v1/boards/${boardId}/comments`, {
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
    // The original API seems to return the array directly, not nested in a 'data' field.
    // If the actual API nests it, this check needs adjustment.
    // For now, assuming 'result' itself is the array of comments.
    console.warn("getComments: API response is not an array as expected by the original client code.", result);
    // Depending on actual API, might need to return result.data or similar.
    // For now, to match the original client's expectation of result being the array:
    // throw new Error("댓글 목록이 배열 형식이 아닙니다.");
  }


  return result; // Assuming result is the array of comments
}

// 댓글 수정 함수 (PATCH로 변경 + boardId 포함)
export async function updateComment(boardId, commentId, content, token) {
  const response = await fetch(`http://localhost:8080/api/v1/boards/${boardId}/comments/${commentId}`, {
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

  return result; // Removed 'as UpdateCommentResponse'
}

// 댓글 삭제 함수
export async function deleteComment(boardId, commentId, token) {
  const response = await fetch(`http://localhost:8080/api/v1/boards/${boardId}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // Try to parse error message, but be cautious as DELETE might not always return JSON body on error
    let errorMessage = `댓글 삭제 실패 (HTTP ${response.status})`;
    try {
        const result = await response.json();
        errorMessage = result.details || result.error || errorMessage;
    } catch (e) {
        // Ignore if parsing fails, use default error message
    }
    throw new Error(errorMessage);
  }

  // No explicit return for void Promise, but can check for 204 No Content if needed
  if (response.status === 204) {
    return; // Successfully deleted, no content
  }
  // If backend sends a JSON body on successful DELETE (e.g. { message: "deleted" })
  // you might want to parse and log it, but it's not strictly necessary for a void function.
  // For now, assume 200/204 means success.
  return;
}
