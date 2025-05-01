"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // useRouter 임포트

import BoardTable from "../components/board/BoardTable";
import WriteButton from "../components/board/WriteButton";
import LogoutButton from "../components/common/LogoutButton";
import { getToken } from "../api/auth"; // getToken 임포트
import { getBoards, BoardListItem } from "../api/board"; // API 함수 및 타입 임포트

const BoardPage = () => {
  const [boards, setBoards] = useState<BoardListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null); // 토큰 상태 추가
  const router = useRouter();

  useEffect(() => {
    const tokenFromStorage = getToken(); // 컴포넌트 마운트 시 토큰 가져오기
    setCurrentToken(tokenFromStorage); // 토큰 상태 설정

    const fetchBoardData = async () => {
      setIsLoading(true);
      setError(null); // 에러 상태 초기화
      // const token = getToken(); // 상태에서 토큰 사용
      const token = tokenFromStorage; // useEffect 스코프 내 변수 사용

      if (!token) {
        setError("로그인이 필요합니다.");
        setIsLoading(false);
        // 로그인 페이지로 리다이렉션 (약간의 딜레이 후)
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      try {
        const fetchedBoards = await getBoards(token);
        setBoards(fetchedBoards);
      } catch (err: any) {
        setError(err.message || "게시물 목록을 불러오는 중 오류가 발생했습니다.");
        setBoards([]); // 에러 발생 시 빈 배열로 설정
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();
  }, [router]); // router를 의존성 배열에 추가 (eslint 경고 방지)

  return (
    <div className="container mx-auto p-8">
      {/* 헤더 부분 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/board">
            <Image
              src="/microsoft.png"
              alt="Microsoft Logo"
              width={50}
              height={50}
              className="mr-5 cursor-pointer"
            />
          </Link>
          <h1 className="text-3xl font-bold text-black">자유 게시판</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/mypage">
            <button className="bg-green-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
              마이 페이지
            </button>
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* 로딩 상태 표시 */}
      {isLoading && (
        <div className="text-center py-10">
          <p>게시물 목록을 불러오는 중...</p>
          {/* 로딩 스피너 등 추가 가능 */}
        </div>
      )}

      {/* 에러 상태 표시 */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">오류 발생:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* 로딩 완료 및 에러 없을 때 테이블 표시 */}
      {/* 로딩 완료 및 에러 없을 때 테이블 표시, token 전달 */}
      {!isLoading && !error && (
        <BoardTable boards={boards} token={currentToken} />
      )}

      {/* 글쓰기 버튼 (로그인 상태 등 조건부 렌더링 가능) */}
      {!isLoading && !error && <WriteButton />}
    </div>
  );
};

export default BoardPage;
