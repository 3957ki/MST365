"use client";

import { useState, useEffect, useCallback } from "react"; // useCallback 추가
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import BoardTable from "../components/board/BoardTable";
import WriteButton from "../components/board/WriteButton";
import LogoutButton from "../components/common/LogoutButton";
import { getToken } from "../api/auth";
import { getBoards, BoardListItem } from "../api/board"; // API 함수 및 타입 임포트

const BoardPage = () => {
  // 상태 변수 추가
  const [boards, setBoards] = useState<BoardListItem[]>([]); // 전체 로드된 게시물
  const [currentPage, setCurrentPage] = useState<number>(0); // 현재 페이지 (0-based)
  const [pageSize] = useState<number>(20); // 페이지당 게시물 수 (고정값)
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true); // 초기 로딩 상태
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false); // 추가 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태
  const [hasMore, setHasMore] = useState<boolean>(true); // 더 로드할 페이지 유무
  const [currentToken, setCurrentToken] = useState<string | null>(null); // 토큰 상태

  const router = useRouter();

  // 데이터 로딩 함수 (useCallback으로 메모이제이션)
  const loadBoards = useCallback(async () => {
    const token = currentToken || getToken(); // 현재 토큰 또는 스토리지에서 가져오기
    if (!token) {
      setError("로그인이 필요합니다.");
      setIsLoadingInitial(false);
      setIsLoadingMore(false);
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    // 로딩 상태 설정
    if (currentPage === 0) {
      setIsLoadingInitial(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const fetchedBoards = await getBoards(token, currentPage, pageSize);
      console.log("Fetched boards:", fetchedBoards); // 추가
      setBoards((prevBoards) => [...prevBoards, ...fetchedBoards]);

      // 더 로드할 데이터 있는지 확인
      if (fetchedBoards.length < pageSize) {
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err.message || "게시물 목록을 불러오는 중 오류가 발생했습니다.");
      setHasMore(false); // 에러 발생 시 더 로드하지 않음
    } finally {
      setIsLoadingInitial(false);
      setIsLoadingMore(false);
    }
  }, [currentPage, pageSize, router, currentToken]); // currentToken 의존성 추가

  // 컴포넌트 마운트 시 토큰 설정 및 첫 페이지 로드 트리거
  useEffect(() => {
    const tokenFromStorage = getToken();
    setCurrentToken(tokenFromStorage);
  }, []);

  // currentPage 변경 시 데이터 로드
  useEffect(() => {
    if (currentToken !== null && hasMore) {
        loadBoards();
    }
  }, [currentPage, currentToken, hasMore, loadBoards]); 

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    // 로딩 중이거나 더 로드할 페이지 없으면 중지
    if (isLoadingInitial || isLoadingMore || !hasMore) {
      return;
    }

    // 페이지 하단 근처 감지 (문서 높이 - 200px 지점)
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 200
    ) {
      // 다음 페이지 로드 트리거
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [isLoadingInitial, isLoadingMore, hasMore]);

  // 스크롤 이벤트 리스너 등록 및 해제
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]); // handleScroll 의존성 추가

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

      {/* 초기 로딩 상태 표시 */}
      {isLoadingInitial && (
        <div className="text-center py-10">
          <p>게시물 목록을 불러오는 중...</p>
          {/* 로딩 스피너 등 추가 가능 */}
        </div>
      )}

      {/* 에러 상태 표시 */}
      {error && !isLoadingInitial && ( // 초기 로딩 중 아닐 때만 에러 표시
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">오류 발생:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* 게시물 테이블 (초기 로딩 완료 및 에러 없을 때) */}
      {!isLoadingInitial && !error && (
        <BoardTable boards={boards} token={currentToken} />
      )}

      {/* 게시물 없음 메시지 (초기 로딩 완료, 에러 없고, 게시물 없을 때) */}
      {!isLoadingInitial && !error && boards.length === 0 && (
         <div className="text-center py-10 text-gray-500">
           작성된 게시글이 없습니다.
         </div>
       )}

      {/* 추가 로딩 상태 표시 */}
      {isLoadingMore && (
        <div className="text-center py-4">
          <p>추가 게시물을 불러오는 중...</p>
          {/* 로딩 스피너 등 추가 가능 */}
        </div>
      )}

      {/* 더 이상 게시물 없음 메시지 */}
      {!hasMore && !isLoadingInitial && !isLoadingMore && !error && boards.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          마지막 게시물입니다.
        </div>
      )}

      {/* 글쓰기 버튼 (로그인 상태 등 조건부 렌더링 가능) */}
      {/* 글쓰기 버튼은 로딩 상태와 관계없이 표시될 수 있도록 조정 (선택사항) */}
      {currentToken && <WriteButton />}
    </div>
  );
};

export default BoardPage;
