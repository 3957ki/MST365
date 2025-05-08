"use client"; // 클라이언트 컴포넌트로 명시

import { useState, FormEvent } from "react"; // FormEvent 추가
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; // useRouter 임포트
import { login } from "../api/auth"; // login 함수 임포트

export default function LoginPage() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // 폼 기본 제출 방지
    setError(null); // 이전 에러 초기화

    // 간단한 유효성 검사
    if (!userName || !password) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true); // 로딩 시작

    try {
      const loginData = await login(userName, password); // API 호출 (반환 타입 변경됨)

      // 성공 시 토큰 및 사용자 ID 저장 (실제 응답 구조 반영)
      localStorage.setItem("authToken", loginData.accessToken); // token -> accessToken
      localStorage.setItem("userId", loginData.user.id.toString()); // userId -> user.id

      console.log("로그인 성공, 토큰 저장됨:", loginData.accessToken);
      console.log("사용자 ID 저장됨:", loginData.user.id);

      // 로그인 성공 후 게시판 페이지로 리다이렉션 (필요에 따라 /mypage 등으로 변경 가능)
      router.push("/board");

    } catch (err: any) {
      console.error("로그인 실패:", err);
      // API 함수에서 던진 에러 메시지 사용
      setError(err.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="max-w-md w-full bg-blue-50 p-10 rounded-lg shadow-md">
        <div className="mb-6 flex justify-center items-center">
          <Link href="/">
            <Image
              src="/microsoft.png"
              alt="Microsoft Logo"
              width={50}
              height={50}
              className="mr-3 cursor-pointer"
            />
          </Link>
          <h1 className="text-center text-2xl font-bold text-black">로그인</h1>
        </div>
        {/* form 요소로 감싸고 onSubmit 핸들러 연결 */}
        <form onSubmit={handleSubmit}>
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
              value={userName} // 상태와 연결
              onChange={(e) => setUserName(e.target.value)} // 상태 업데이트
              className="w-full p-2 border border-gray-300 rounded box-border text-black"
              required // 필수 입력 필드
              disabled={isLoading} // 로딩 중 비활성화
            />
          </div>
          <div className="mb-5">
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
              value={password} // 상태와 연결
              onChange={(e) => setPassword(e.target.value)} // 상태 업데이트
              className="w-full p-2 border border-gray-300 rounded box-border text-black"
              required // 필수 입력 필드
              disabled={isLoading} // 로딩 중 비활성화
            />
          </div>
          {/* 에러 메시지 표시 */}
          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
          )}
          {/* LoginButton 대신 일반 button 사용 */}
          <button
            type="submit"
            disabled={isLoading} // 로딩 중 비활성화
            className={`w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>
        <div className="flex justify-center mt-4 text-sm">
          <div>
            <Link href="/signup" className="text-blue-600 hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
