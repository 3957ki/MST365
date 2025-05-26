"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { login } from "../api/auth";

export default function LoginPage() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // 간단한 유효성 검사
    if (!userName || !password) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const loginData = await login(userName, password);

      // 성공 시 토큰 및 사용자 ID 저장 (실제 응답 구조 반영)
      localStorage.setItem("authToken", loginData.accessToken);
      localStorage.setItem("userId", loginData.user.id.toString());
      console.log("로그인 성공, 토큰 저장됨:", loginData.accessToken);
      console.log("사용자 ID 저장됨:", loginData.user.id);

      // 로그인 성공 후 게시판 페이지로 리다이렉션 (필요에 따라 /mypage 등으로 변경 가능)
      router.push("/board");
    } catch (err: any) {
      console.error("로그인 실패:", err);
      // API 함수에서 던진 에러 메시지 사용
      setError(err.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="max-w-md w-full bg-blue-50 p-10 rounded-lg shadow-md">
        <div className="mb-6 flex justify-center items-center">
          <Link href="/">
            <Image src="/microsoft.png" alt="Microsoft Logo" width={50} height={50} className="mr-3 cursor-pointer" />
          </Link>
          <h1 className="text-center text-2xl font-bold text-black">로그인</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700">
              아이디
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded box-border text-black"
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-5">
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded box-border text-black"
              required
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="flex justify-center mt-4 text-sm">
          <Link href="/signup" className="text-blue-600 hover:underline">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
