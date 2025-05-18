"use client";

import { useState } from "react";

interface BoardSearchProps {
  onSearch: (searchTerm: string, searchType: string) => void;
}

const BoardSearch: React.FC<BoardSearchProps> = ({ onSearch }) => {
  // 상태: 검색어와 검색 타입
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title");

  // 입력창 변경 처리
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // 드롭다운 변경 처리
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchType(event.target.value);
  };

  // 초기화: 입력값과 타입 모두 초기화하고 부모에 알림
  const handleReset = () => {
    setSearchTerm("");
    setSearchType("title");
    onSearch("", "title");
  };

  // 검색 실행
  const handleSearch = () => {
    onSearch(searchTerm, searchType);
  };

  return (
    <div className="flex justify-between items-center mb-4 p-3 border border-gray-200 bg-gray-50 shadow-sm">
      <div className="flex gap-2">
        <select
          className="border border-gray-300 p-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchType}
          onChange={handleSelectChange}
        >
          <option value="title">제목</option>
          <option value="author">작성자</option>
        </select>
        <input
          type="text"
          placeholder="검색어를 입력하세요."
          className="border border-gray-300 p-2 w-64 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={handleInputChange}
        />
      </div>
      <div className="flex gap-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 shadow-sm"
          onClick={handleSearch}
        >
          검색
        </button>
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-200 shadow-sm"
          onClick={handleReset}
        >
          초기화
        </button>
      </div>
    </div>
  );
};

export default BoardSearch;
