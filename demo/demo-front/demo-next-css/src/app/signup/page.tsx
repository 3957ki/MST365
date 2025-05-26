"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signup, SignupResponse } from "../api/auth"; // signup 함수 및 타입 임포트 추가
import "./page.css";

export default function SignupPage() {
  const [userName, setUserName] = useState(""); // 아이디 상태 추가
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError] = useState<string | null>(null); // API 오류 상태 추가
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const router = useRouter(); // useRouter 인스턴스 생성

  // 회원가입 처리 함수 수정
  const handleSignup = async () => {
    // 1. 유효성 검사
    if (!userName || !password || !confirmPassword) {
      setApiError("모든 필드를 입력해주세요.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다."); // 이미 상태로 관리되지만, 명시적 확인
      setApiError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (passwordError) {
      // 기존 비밀번호 불일치 에러가 있으면 중단
      setApiError("비밀번호가 일치하는지 확인해주세요.");
      return;
    }

    // 2. API 호출 준비
    setApiError(null); // 이전 에러 초기화
    setPasswordError(""); // 비밀번호 에러 초기화
    setIsLoading(true); // 로딩 시작

    try {
      // API 호출 로직을 auth.ts의 signup 함수 호출로 변경
      const result: SignupResponse = await signup(userName, password);

      // 3. 성공 처리 (기존 로직 유지)
      console.log("회원가입 성공:", result.message); // result.message 사용 가능
      alert("회원가입이 성공적으로 완료되었습니다.");
      router.push("/login"); // 로그인 페이지로 리다이렉션

    } catch (error: any) {
      // 4. 실패 처리
      console.error("회원가입 실패:", error);
      setApiError(error.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    if (password && newConfirmPassword && password !== newConfirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (confirmPassword && newPassword && newPassword !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  };

  return (
    <div className="signup-page-container">
      <div className="signup-form-container">
        <div className="logo-title-container">
          <Link href="/">
            <Image
              src="/microsoft.png"
              alt="Microsoft Logo"
              width={50}
              height={50}
              className="logo-image"
            />
          </Link>
          <h1 className="page-title">
            회원가입
          </h1>
        </div>
        <div className="form-group">
          <label
            htmlFor="username"
            className="form-label"
          >
            아이디
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={userName} // value 바인딩
            onChange={(e) => setUserName(e.target.value)} // onChange 핸들러 추가
            className="form-input"
            required // 필수 필드 표시 (선택 사항)
          />
        </div>
        <div className="form-group">
          <label
            htmlFor="password"
            className="form-label"
          >
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
            className="form-input"
            required // 필수 필드 표시 (선택 사항)
          />
        </div>
        <div className="form-group-mb-1">
          <label
            htmlFor="confirmPassword"
            className="form-label"
          >
            비밀번호 확인
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className={`form-input ${
              passwordError ? "form-input-error" : ""
            }`}
            required // 필수 필드 표시 (선택 사항)
          />
          {passwordError && (
            <p className="password-error-message">{passwordError}</p>
          )}
        </div>
        {/* API 에러 메시지 표시 */}
        {apiError && (
          <p className="api-error-message">{apiError}</p>
        )}
        <button
          onClick={handleSignup}
          disabled={isLoading} // 로딩 중일 때 버튼 비활성화
          className={`signup-button ${
            isLoading ? "signup-button-loading" : ""
          }`} // 로딩 시 스타일 변경
        >
          {isLoading ? "가입 처리 중..." : "회원가입"}
        </button>
        <div className="login-link-container">
          <Link href="/login" className="login-link">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
