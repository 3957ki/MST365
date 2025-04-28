"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const WritePage = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !content) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    // 여기에 실제 저장 로직 추가 (API 호출 등)
    console.log("작성 완료:", { title, author, content });
    alert("게시물이 작성되었습니다!");
  };

  return (
    <div className="container mx-auto p-8 ml-56">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Image
            src="/microsoft.png"
            alt="Microsoft Logo"
            width={50}
            height={50}
            className="mr-5 cursor-pointer"
          />
        </Link>
        <h1 className="text-3xl font-bold text-black">게시물 작성</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-black font-semibold mb-2">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-[80%] border border-gray-300 rounded-lg p-2 text-black"
            placeholder="제목을 입력하세요"
          />
        </div>
        <div>
          <label className="block text-black font-semibold mb-2">작성자</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-[80%] border border-gray-300 rounded-lg p-2 text-black"
            placeholder="작성자 이름을 입력하세요"
          />
        </div>
        <div>
          <label className="block text-black font-semibold mb-2">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-[80%] border border-gray-300 rounded-lg p-2 h-40 text-black"
            placeholder="내용을 입력하세요"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          작성하기
        </button>
      </form>
    </div>
  );
};

export default WritePage;
