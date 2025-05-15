import Link from "next/link";
import { useState, useEffect } from "react"; // useState, useEffect 임포트
import { BoardListItem } from "../../api/board";
import { getUserInfo, UserInfoData } from "../../api/auth"; // getUserInfo 및 타입 임포트

interface BoardTableProps {
  boards: BoardListItem[];
  token: string | null; // token prop 추가
}

// userId를 키로, userName을 값으로 가지는 맵 타입
interface UserNameMap {
  [key: number]: string;
}

const BoardTable: React.FC<BoardTableProps> = ({ boards, token }) => {
  const [userNamesMap, setUserNamesMap] = useState<UserNameMap>({});
  const [loadingUserNames, setLoadingUserNames] = useState<boolean>(false); // 사용자 이름 로딩 상태

  useEffect(() => {
    const fetchUserNames = async () => {
      if (!token || boards.length === 0) {
        return; // 토큰이 없거나 게시물이 없으면 실행 중지
      }

      // 아직 이름 정보가 없는 고유한 userId 추출
      const uniqueUserIds = Array.from(
        new Set(boards.map((board) => board.userId))
      ).filter((userId) => !userNamesMap[userId]);

      if (uniqueUserIds.length === 0) {
        return; // 새로 가져올 userId가 없으면 중지
      }

      setLoadingUserNames(true); // 사용자 이름 로딩 시작

      try {
        // Promise.all을 사용하여 여러 사용자 정보를 병렬로 요청
        const userInfoPromises = uniqueUserIds.map((userId) =>
          getUserInfo(userId, token)
        );
        const userInfos = await Promise.all(userInfoPromises);

        // 가져온 사용자 정보로 userNamesMap 업데이트
        const newUserNames: UserNameMap = {};
        userInfos.forEach((userInfo) => {
          if (userInfo && userInfo.id && userInfo.userName) {
            newUserNames[userInfo.id] = userInfo.userName;
          }
        });

        setUserNamesMap((prevMap) => ({ ...prevMap, ...newUserNames }));
      } catch (error) {
        console.error("사용자 이름 조회 중 오류 발생:", error);
        // 특정 사용자 조회 실패 시 해당 ID만 실패 처리하거나, 전체 에러 처리 가능
        // 여기서는 콘솔 에러만 출력
      } finally {
        setLoadingUserNames(false); // 사용자 이름 로딩 완료
      }
    };

    fetchUserNames();
  }, [boards, token, userNamesMap]); // boards나 token이 변경될 때 실행

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        return "유효하지 않은 날짜";
      }
      return date
        .toLocaleDateString("ko-KR", {
          // 한국 시간 기준 및 형식
          year: "numeric", // 중복 제거
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\.$/, ""); // 마지막 점 제거
    } catch (error) {
      console.error("Error formatting date:", error);
      return "날짜 형식 오류"; // 오류 발생 시 대체 텍스트
    }
  };

  return (
    <table className="w-full border-collapse border border-gray-300 mb-4 text-black">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2 w-16">번호</th>
          <th className="border p-2">제목</th>
          <th className="border p-2 w-32">작성자</th>
          <th className="border p-2 w-32">작성일</th>
        </tr>
      </thead>
      <tbody>
        {boards.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center p-4 border">
              작성된 게시글이 없습니다. {/* 메시지 수정 */}
            </td>
          </tr>
        ) : (
          boards.map((board) => (
            <tr key={board.id} className="hover:bg-gray-50">
              <td className="border p-2 text-center">{board.id}</td>
              <td className="border p-2 hover:underline">
                <Link href={`/board/${board.id}`}>{board.title}</Link>
              </td>
              <td className="border p-2 text-center">
                {userNamesMap[board.userId] || // 사용자 이름 표시 시도
                  (loadingUserNames ? "로딩중..." : `ID: ${board.userId}`)}
                {/* 없으면 로딩 상태 또는 ID 표시 */}
              </td>
              <td className="border p-2 text-center">
                {formatDate(board.createdAt)}
              </td>
              {/* createdAt 포맷팅 */}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default BoardTable;
