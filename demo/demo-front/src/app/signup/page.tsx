"use client";

import Link from "next/link";
import Image from "next/image";

const handleSignup = () => {
  console.log("회원가입 시도");
  alert("회원가입 버튼 클릭됨 (기능 없음)");
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8">
      <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-md">
        <div className="mb-6 flex justify-center items-center">
          <Image
            src="/microsoft.png"
            alt="Microsoft Logo"
            width={50}
            height={20}
            className="mr-6"
          />
          <h1 className="text-center text-2xl font-bold">회원가입</h1>
        </div>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            아이디
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="w-full p-2 border border-gray-300 rounded box-border"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full p-2 border border-gray-300 rounded box-border"
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="confirmPassword"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            비밀번호 확인
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="w-full p-2 border border-gray-300 rounded box-border"
          />
        </div>
        <button
          onClick={handleSignup}
          className="w-full py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors"
        >
          회원가입
        </button>
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
