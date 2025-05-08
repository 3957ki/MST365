export async function getBoards(token, page, size) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  const url = `http://localhost:8080/api/v1/boards?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const errorResponse = result;
    if (response.status === 401) {
      throw new Error(
        errorResponse.details || errorResponse.error || "인증되지 않았습니다."
      );
    }
    throw new Error(
      errorResponse.details ||
        errorResponse.error ||
        `게시물 목록 조회 실패 (HTTP ${response.status})`
    );
  }

  const successResponse = result;
  if (!successResponse.data || !Array.isArray(successResponse.data)) {
    console.error("Invalid boards response structure:", successResponse);
    throw new Error("게시물 목록 응답 형식이 올바르지 않습니다.");
  }

  return successResponse.data;
}

export async function getBoardById(boardId, token) {
  const response = await fetch(
    `http://localhost:8080/api/v1/boards/${boardId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 404) {
    return null;
  }

  const result = await response.json();

  if (!response.ok) {
    const errorResponse = result;
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

  const successResponse = result;
  if (
    !successResponse.data ||
    typeof successResponse.data.id !== "number" ||
    typeof successResponse.data.title !== "string"
  ) {
    console.error("Invalid board detail response structure:", successResponse);
    throw new Error("게시물 상세 정보 응답 형식이 올바르지 않습니다.");
  }

  return successResponse.data;
}

export async function deleteBoard(boardId, token) {
  const response = await fetch(
    `http://localhost:8080/api/v1/boards/${boardId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    let errorMessage = `게시물 삭제 실패 (HTTP ${response.status})`;
    try {
      const errorResult = await response.json();
      errorMessage =
        errorResult.details ||
        errorResult.error ||
        `게시물 삭제 실패 (HTTP ${response.status})`;

      if (response.status === 401) {
        errorMessage = "인증되지 않았습니다. 다시 로그인해주세요.";
      } else if (response.status === 403) {
        errorMessage = "이 게시물을 삭제할 권한이 없습니다.";
      } else if (response.status === 404) {
        errorMessage =
          "삭제하려는 게시물을 찾을 수 없거나 이미 삭제되었습니다.";
      }
    } catch (e) {
      console.error("Error parsing delete error response:", e);
    }
    throw new Error(errorMessage);
  }

  try {
    const result = await response.json();
    console.log("Delete success response:", result);
  } catch (e) {
    console.log("Delete request successful, no response body or parse error.");
  }
}

export async function createBoard(input, token) {
  const response = await fetch("http://localhost:8080/api/v1/boards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: input.title,
      content: input.content,
      user_id: input.userId,
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

  return result;
}

export async function updateBoard(boardId, updateData, token) {
  const response = await fetch(
    `http://localhost:8080/api/v1/boards/${boardId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: updateData.title,
        content: updateData.content,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const errorResponse = result;
    let errorMessage = `게시물 수정 실패 (HTTP ${response.status})`;

    if (response.status === 400 && errorResponse.details) {
      errorMessage = `입력 값 오류: ${errorResponse.details}`;
    } else if (response.status === 401) {
      errorMessage = "인증되지 않았습니다. 다시 로그인해주세요.";
    } else if (response.status === 403) {
      errorMessage = "이 게시물을 수정할 권한이 없습니다.";
    } else if (response.status === 404) {
      errorMessage = "수정하려는 게시물을 찾을 수 없습니다.";
    } else if (errorResponse.error) {
      errorMessage = errorResponse.error;
    }

    throw new Error(errorMessage);
  }

  const successResponse = result;
  if (
    !successResponse.data ||
    typeof successResponse.data.id !== "number" ||
    typeof successResponse.data.title !== "string"
  ) {
    console.error("Invalid update board response structure:", successResponse);
    throw new Error("게시물 수정 응답 형식이 올바르지 않습니다.");
  }

  return successResponse.data;
}
