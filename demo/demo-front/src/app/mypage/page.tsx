"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react"; // useEffect 추가
import { useRouter } from "next/navigation";
import PasswordChangeModal from "./component/PasswordChangeModal";
import UserPostsList from "./component/UserPostsList";
import UserCommentsList from "./component/UserCommentsList";
import LogoutButton from "../components/common/LogoutButton";
// getUserInfo와 UserInfoData 타입 임포트 추가
import { getToken, getUserId, removeToken, withdrawUser, getUserInfo, UserInfoData } from "../api/auth";

export default function MyPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const router = useRouter();

  // 사용자 정보 상태 추가
  const [user, setUser] = useState<UserInfoData | null>(null);
  const [isUserInfoLoading, setIsUserInfoLoading] = useState(true); // 초기 로딩 상태 true
  const [userInfoError, setUserInfoError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 사용자 정보 로드
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = getToken();
      const userId = getUserId();

      if (!token || userId === null) {
        setUserInfoError("로그인이 필요합니다.");
        setIsUserInfoLoading(false);
        // 로그인 페이지로 리다이렉션 (토큰/ID 없으면 접근 불가)
        router.push("/login");
        return;
      }

      try {
        setIsUserInfoLoading(true); // 명시적 로딩 시작
        const userInfo = await getUserInfo(userId, token);
        setUser(userInfo);
        setUserInfoError(null); // 성공 시 에러 초기화
      } catch (error: any) {
        console.error("사용자 정보 조회 실패:", error);
        setUserInfoError(error.message || "사용자 정보를 불러오는 데 실패했습니다.");
        setUser(null); // 에러 시 사용자 정보 초기화
        // 401/403 에러 시 로그인 페이지로 보낼 수 있음
        if (error.message.includes("401") || error.message.includes("403")) {
          removeToken(); // 잘못된 토큰 제거
          router.push("/login");
        }
      } finally {
        setIsUserInfoLoading(false); // 로딩 종료
      }
    };

    fetchUserInfo();
  }, [router]); // router를 의존성 배열에 추가 (eslint 경고 방지)


  // 회원 탈퇴 처리 함수
  const handleWithdraw = async () => {
    // 1. 탈퇴 확인
    if (
      !window.confirm(
        "정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      return; // 사용자가 취소하면 중단
    }

    setWithdrawError(null); // 이전 에러 초기화
    setIsWithdrawing(true); // 로딩 시작

    // 2. 스토리지에서 사용자 ID 및 토큰 가져오기
    const token = getToken();
    const userId = getUserId();

    if (!token || userId === null) {
      setWithdrawError("로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.");
      setIsWithdrawing(false);
      // 필요시 로그인 페이지로 리다이렉션
      // removeToken(); // 혹시 모를 잘못된 정보 제거
      // router.push('/login');
      return;
    }

    try {
      // 3. API 호출
      await withdrawUser(userId, token);

      // 4. 성공 처리
      alert("회원 탈퇴가 성공적으로 처리되었습니다.");
      removeToken(); // 로컬 스토리지 정보 제거
      router.push("/"); // 홈페이지로 리다이렉션
    } catch (error: any) {
      // 5. 실패 처리
      console.error("회원 탈퇴 실패:", error);
      setWithdrawError(error.message || "회원 탈퇴 중 오류가 발생했습니다.");
      // 실패 시에도 로컬 토큰은 제거하는 것이 안전할 수 있음 (선택 사항)
      // removeToken();
      // router.push('/login');
    } finally {
      setIsWithdrawing(false); // 로딩 종료
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/board">
            <Image
              src="/microsoft.png"
              alt="Microsoft Logo"
              width={50}
              height={50}
              className="mr-5 cursor-pointer"
            />
          </Link>
          <h1 className="text-3xl font-bold text-black">마이페이지</h1>
        </div>
        {/* LogoutButton 컴포넌트로 교체 */}
        <LogoutButton />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center">
          {/* 사진 들어갈 공간 (추후 프로필 사진 기능 추가 시 사용) */}
          <div className="w-24 h-24 bg-gray-300 rounded-full mr-6 flex items-center justify-center text-gray-500">
            {/* 로딩/에러/데이터 상태에 따라 아이콘 또는 이니셜 표시 가능 */}
            {isUserInfoLoading ? '...' : user ? user.userName.charAt(0).toUpperCase() : '?'} {/* user_name -> userName */}
          </div>
          <div className="text-left">
            {/* 사용자 이름 표시 */}
            <h2 className="text-2xl font-semibold mb-1 text-black">
              {isUserInfoLoading ? "로딩 중..." : userInfoError ? "오류" : user?.userName ?? "사용자"} {/* user_name -> userName */}
            </h2>
            {/* 환영 메시지 또는 에러 메시지 표시 */}
            <p className="text-gray-600">
              {isUserInfoLoading
                ? "회원 정보를 불러오고 있습니다..."
                : userInfoError
                ? `오류: ${userInfoError}`
                : user
                ? `${user.userName}님 안녕하세요!`
                : "회원 정보를 표시할 수 없습니다."}
            </p>
          </div>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-5"
          >
            비밀번호 수정
          </button>
          {/* 회원 탈퇴 버튼에 핸들러 연결 및 로딩 상태 반영 */}
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className={`bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded ${
              isWithdrawing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isWithdrawing ? "탈퇴 처리 중..." : "회원 탈퇴"}
          </button>
        </div>
        {/* 탈퇴 에러 메시지 표시 */}
        {withdrawError && (
          <p className="text-red-500 text-sm mt-2 text-right">
            {withdrawError}
          </p>
        )}
      </div>
      <UserPostsList />
      <UserCommentsList />
      <PasswordChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
