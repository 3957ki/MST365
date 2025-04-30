// src/app/api/board.ts

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
  const response = await fetch("http://localhost:8080/api/v1/boards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: input.title,
      content: input.content,
      user_id: input.userId, // ✅ 여기는 snake_case로 변환
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.details || result.error || `게시글 작성 실패 (HTTP ${response.status})`);
  }

  return result as CreateBoardResponse;
}
