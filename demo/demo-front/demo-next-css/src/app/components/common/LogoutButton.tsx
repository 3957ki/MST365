"use client";

import { useRouter } from "next/navigation";
import { getToken, removeToken, logout } from "@/app/api/auth"; // 경로 수정 (@ 사용 또는 상대경로)
import "./LogoutButton.css";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const token = getToken();

    if (!token) {
      console.log("토큰 없음, 이미 로그아웃 상태일 수 있습니다.");
      // 토큰이 없으면 로그인 페이지로 보낼 수도 있음
      router.push("/login");
      return;
    }

    try {
      await logout(token); // API 호출
      console.log("API 로그아웃 호출 성공");
    } catch (error: any) {
      console.error("로그아웃 API 호출 실패:", error);
      // 실패하더라도 클라이언트 측 토큰은 제거하는 것이 안전
      // 사용자에게 오류를 알릴 수 있음 (예: alert)
      // alert(`로그아웃 중 오류 발생: ${error.message}`);
    } finally {
      // API 성공/실패 여부와 관계없이 로컬 토큰 제거
      removeToken();
      console.log("로컬 토큰 제거 완료");

      // 로그아웃 후 홈페이지 또는 로그인 페이지로 리다이렉션
      // window.location.href = '/'; // 페이지 새로고침을 유도하여 상태 초기화
      router.push("/"); // 또는 router.push('/login');
      // router.refresh(); // 필요에 따라 서버 컴포넌트 데이터 갱신
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="logout-button" // 스타일은 필요에 따라 조정
    >
      로그아웃
    </button>
  );
}
