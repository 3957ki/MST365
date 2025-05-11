"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, getUserId } from "@/app/api/auth";
import { createBoard } from "@/app/api/board";
import "./page.css";

const WritePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    const token = getToken();
    const userId = getUserId();

    if (!token || userId === null) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await createBoard({ title, content, userId }, token); // ✅ camelCase 기반 input 객체 전달
      alert("게시글이 작성되었습니다.");
      router.push("/board"); // 게시판 목록 페이지로 이동
    } catch (err: any) {
      alert(`에러 발생: ${err.message}`);
    }
  };

  return (
    <div className="write-page-container">
      <div className="header-container">
        <Link href="/board">
          <Image
            src="/microsoft.png"
            alt="Microsoft Logo"
            width={50}
            height={50}
            className="logo-image"
          />
        </Link>
        <h1 className="page-title">게시물 작성</h1>
      </div>

      <form onSubmit={handleSubmit} className="write-form">
        <div>
          <label className="form-label">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
            placeholder="제목을 입력하세요"
          />
        </div>
        <div>
          <label className="form-label">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="content-textarea"
            placeholder="내용을 입력하세요"
          />
        </div>
        <button
          type="submit"
          className="submit-button"
        >
          작성하기
        </button>
      </form>
    </div>
  );
};

export default WritePage;
