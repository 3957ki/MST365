"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signup, SignupResponse } from "../api/auth";

export default function SignupPage() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 비밀번호 확인 필드 핸들러
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    if (password && newConfirmPassword && password !== newConfirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  };

  // 비밀번호 필드 핸들러
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (confirmPassword && newPassword && newPassword !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  };

  // 회원가입 처리 함수 수정
  const handleSignup = async () => {
    // 1. 유효성 검사
    if (!userName || !password || !confirmPassword) {
      setApiError("모든 필드를 입력해주세요.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      setApiError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (passwordError) {
      setApiError("비밀번호가 일치하는지 확인해주세요.");
      return;
    }

    // 2. API 호출 준비
    setApiError(null);
    setPasswordError("");
    setIsLoading(true);

    try {
      const result: SignupResponse = await signup(userName, password);

      // 3. 성공 처리 (기존 로직 유지)
      console.log("회원가입 성공:", result.message);
      alert("회원가입이 성공적으로 완료되었습니다.");
      router.push("/login");
    } catch (error: any) {
      // 4. 실패 처리
      console.error("회원가입 실패:", error);
      setApiError(error.message || "회원가입 중 오류가 발생했습니다.");
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
          <h1 className="text-center text-2xl font-bold text-black">회원가입</h1>
        </div>
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
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
            className="w-full p-2 border border-gray-300 rounded box-border text-black"
            required
          />
        </div>
        <div className="mb-1">
          <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-700 ">
            비밀번호 확인
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className={`w-full p-2 border ${
              passwordError ? "border-red-500" : "border-gray-300"
            } rounded box-border text-black`}
            required
          />
          {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
        </div>
        {apiError && <p className="text-red-500 text-sm mt-2 text-center">{apiError}</p>}
        <button
          onClick={handleSignup}
          disabled={isLoading}
          className={`w-full mt-4 py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "가입 처리 중..." : "회원가입"}
        </button>
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
