// "use client"; // Removed "use client" directive

import { useState } from "react";
// import Image from "next/image"; // Removed next/image import
// import Link from "next/link"; // Will use Link from react-router-dom
// import { useRouter } from "next/navigation"; // Will use useNavigate from react-router-dom
import { useNavigate, Link } from "react-router-dom"; // Import hook and Link
import { getToken, getUserId } from "../api-temp/auth"; // Corrected API path
import { createBoard } from "../api-temp/board"; // Corrected API path

const WritePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate(); // Use useNavigate
  // const router = useRouter(); // Removed

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
      navigate("/board"); // navigate 사용
    } catch (err: any) {
      alert(`에러 발생: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center mb-6">
        <Link to="/board">
          {" "}
          {/* href -> to */}
          {/* Replaced Image with img */}
          <img
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
