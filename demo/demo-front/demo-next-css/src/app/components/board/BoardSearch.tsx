"use client";

import { useState } from "react";
import "./BoardSearch.css";

interface BoardSearchProps {
  onSearch: (searchTerm: string, searchType: string) => void;
}

const BoardSearch: React.FC<BoardSearchProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title"); // 기본 검색 타입을 'title'로 설정

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchType(event.target.value);
  };

  // 초기화: 검색어, 타입 초기화 및 전체 목록 표시 요청
  const handleReset = () => {
    setSearchTerm("");
    setSearchType("title"); // 검색 타입도 기본값으로
    onSearch("", "title"); // 부모에게 초기화 알림 (빈 검색어 전달)
  };

  // 검색 실행: 현재 검색어와 타입으로 부모에게 검색 요청
  const handleSearch = () => {
    onSearch(searchTerm, searchType);
  };

  return (
    <div className="search-container">
      <div className="search-input-group">
        <select
          className="search-select"
          value={searchType} // 상태와 연결
          onChange={handleSelectChange} // 변경 핸들러 연결
        >
          {/* value 속성 추가 */}
          <option value="title">제목</option>
          <option value="author">작성자</option>
          {/* <option value="content">내용</option> */}{" "}
          {/* 내용 검색은 추후 추가 */}
        </select>
        <input
          type="text"
          placeholder="검색어를 입력하세요."
          className="search-input"
          value={searchTerm}
          onChange={handleInputChange}
        />
      </div>
      <div className="search-button-group">
        <button
          className="search-button"
          onClick={handleSearch}
        >
          검색
        </button>
        <button
          className="reset-button"
          onClick={handleReset}
        >
          초기화
        </button>
      </div>
    </div>
  );
};

export default BoardSearch;
