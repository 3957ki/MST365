"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, getUserId } from "@/app/api/auth";
import { createBoard } from "@/app/api/board";

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
    <div className="container mx-auto p-8 ml-56">
      <div className="flex items-center mb-6">
        <Link href="/board">
          <Image src="/microsoft.png" alt="Microsoft Logo" width={50} height={50} className="mr-5 cursor-pointer" />
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
          <label className="block text-black font-semibold mb-2">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-[80%] border border-gray-300 rounded-lg p-2 h-40 text-black"
            placeholder="내용을 입력하세요"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
          작성하기
        </button>
      </form>
    </div>
  );
};

export default WritePage;
