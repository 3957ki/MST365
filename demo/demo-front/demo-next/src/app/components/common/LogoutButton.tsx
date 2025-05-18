"use client";

import { useRouter } from "next/navigation";
import { getToken, removeToken, logout } from "@/app/api/auth"; // 경로 수정 (@ 사용 또는 상대경로)

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const token = getToken();

    if (!token) {
      console.log("토큰 없음, 이미 로그아웃 상태일 수 있습니다.");
      router.push("/login");
      return;
    }

    try {
      await logout(token); // API 호출
      console.log("API 로그아웃 호출 성공");
    } catch (error: any) {
      console.error("로그아웃 API 호출 실패:", error);
    } finally {
      removeToken();
      console.log("로컬 토큰 제거 완료");
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
    >
      로그아웃
    </button>
  );
}
