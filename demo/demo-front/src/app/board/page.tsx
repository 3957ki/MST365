"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import BoardSearch from "../components/board/BoardSearch";
import BoardInfo from "../components/board/BoardInfo";
import BoardTable from "../components/board/BoardTable";
import BoardPagination from "../components/board/BoardPagination";
import WriteButton from "../components/board/WriteButton";
import LogoutButton from "../components/common/LogoutButton"; // LogoutButton 임포트 추가

interface Post {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  views: number;
}

// 더미 데이터
const dummyPosts: Post[] = [
  {
    id: 1,
    title: "첫 번째 게시글입니다.",
    author: "관리자",
    createdAt: "2024-04-24",
    views: 15,
  },
  {
    id: 2,
    title: "React와 Next.js 공부",
    author: "개발자",
    createdAt: "2024-04-23",
    views: 30,
  },
  {
    id: 3,
    title: "Tailwind CSS 사용법 질문",
    author: "디자이너",
    createdAt: "2024-04-23",
    views: 22,
  },
  {
    id: 4,
    title: "자유롭게 글을 작성해주세요.",
    author: "운영팀",
    createdAt: "2024-04-22",
    views: 55,
  },
  {
    id: 5,
    title: "검색 기능 테스트용 데이터",
    author: "테스터",
    createdAt: "2024-04-21",
    views: 10,
  },
  {
    id: 6,
    title: "여섯 번째 글",
    author: "사용자1",
    createdAt: "2024-04-20",
    views: 5,
  },
  {
    id: 7,
    title: "일곱 번째 글: React Hooks",
    author: "개발자",
    createdAt: "2024-04-19",
    views: 45,
  },
  {
    id: 8,
    title: "여덟 번째 글: 디자인 시스템",
    author: "디자이너",
    createdAt: "2024-04-18",
    views: 33,
  },
  {
    id: 9,
    title: "아홉 번째 글: 공지사항",
    author: "운영팀",
    createdAt: "2024-04-17",
    views: 102,
  },
  {
    id: 10,
    title: "열 번째 글: 테스트 완료",
    author: "테스터",
    createdAt: "2024-04-16",
    views: 8,
  },
  {
    id: 11,
    title: "열한 번째 글",
    author: "관리자",
    createdAt: "2024-04-15",
    views: 12,
  },
  {
    id: 12,
    title: "열두 번째 글: Next.js 팁",
    author: "개발자",
    createdAt: "2024-04-14",
    views: 60,
  },
  {
    id: 13,
    title: "열세 번째 글: CSS 질문",
    author: "디자이너",
    createdAt: "2024-04-13",
    views: 18,
  },
  {
    id: 14,
    title: "열네 번째 글: 이벤트 안내",
    author: "운영팀",
    createdAt: "2024-04-12",
    views: 77,
  },
  {
    id: 15,
    title: "열다섯 번째 글: 마지막 테스트",
    author: "테스터",
    createdAt: "2024-04-11",
    views: 9,
  },
];

const postsPerPage = 10; // 페이지당 게시글 수

const BoardPage = () => {
  // 필터링된 전체 게시글 목록 상태 관리
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(dummyPosts);
  // 현재 페이지 상태 관리
  const [currentPage, setCurrentPage] = useState(1);

  // 검색 처리 함수
  const handleSearch = useCallback((searchTerm: string, searchType: string) => {
    let results = dummyPosts;
    if (searchTerm.trim()) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      results = dummyPosts.filter((post) => {
        if (searchType === "title") {
          return post.title.toLowerCase().includes(lowerCaseSearchTerm);
        } else if (searchType === "author") {
          return post.author.toLowerCase().includes(lowerCaseSearchTerm);
        }
        return false;
      });
    }
    setFilteredPosts(results);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  }, []);

  // 페이지 변경 처리 함수
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // 현재 페이지에 표시할 게시글 계산 (useMemo로 최적화)
  const currentPosts = useMemo(() => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    return filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  }, [filteredPosts, currentPage]);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/">
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
        {/* LogoutButton 컴포넌트로 교체 */}
        <LogoutButton />
      </div>

      <BoardSearch onSearch={handleSearch} />

      <BoardInfo
        totalPosts={filteredPosts.length} // 전체 필터링된 게시글 수
        currentPage={currentPage}
        totalPages={totalPages}
      />
      {/* 현재 페이지 게시글만 전달 */}
      <BoardTable posts={currentPosts} />
      {/* 페이지네이션 컴포넌트에 필요한 props 전달 */}
      <BoardPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <WriteButton />
    </div>
  );
};

export default BoardPage;
