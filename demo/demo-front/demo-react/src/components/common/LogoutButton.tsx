// "use client"; // Removed "use client" directive

// import { useRouter } from "next/navigation"; // Removed next/navigation import
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { getToken, removeToken, logout } from "../../api-temp/auth"; // Corrected relative path

export default function LogoutButton() {
  const navigate = useNavigate(); // Use useNavigate
  // const router = useRouter(); // Removed

  const handleLogout = async () => {
    const token = getToken();

    if (!token) {
      console.log("토큰 없음, 이미 로그아웃 상태일 수 있습니다.");
      // 토큰이 없으면 로그인 페이지로 보낼 수도 있음
      navigate("/login"); // Use navigate
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
      navigate("/"); // Use navigate
      // router.refresh(); // Removed next-specific refresh
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm" // 스타일은 필요에 따라 조정
    >
      로그아웃
    </button>
  );
}
