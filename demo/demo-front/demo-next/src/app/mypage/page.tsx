"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PasswordChangeModal from "./component/PasswordChangeModal";
import UserPostsList from "./component/UserPostsList";
import UserCommentsList from "./component/UserCommentsList";
import LogoutButton from "../components/common/LogoutButton";
import {
  getToken,
  getUserId,
  removeToken,
  withdrawUser,
  getUserInfo,
  UserInfoData,
  getUserPosts,
  UserPostItem,
  getUserComments,
  UserCommentItem,
} from "../api/auth";

export default function MyPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const router = useRouter();

  // 사용자 정보
  const [user, setUser] = useState<UserInfoData | null>(null);
  const [isUserInfoLoading, setIsUserInfoLoading] = useState(true);
  const [userInfoError, setUserInfoError] = useState<string | null>(null);

  // 사용자 게시물
  const [userPosts, setUserPosts] = useState<UserPostItem[] | null>(null);
  const [isUserPostsLoading, setIsUserPostsLoading] = useState(true);
  const [userPostsError, setUserPostsError] = useState<string | null>(null);

  // 사용자 댓글
  const [userComments, setUserComments] = useState<UserCommentItem[] | null>(null);
  const [isUserCommentsLoading, setIsUserCommentsLoading] = useState(true);
  const [userCommentsError, setUserCommentsError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 사용자 정보, 게시물, 댓글 로드
  useEffect(() => {
    let isMounted = true;
    const token = getToken();
    const userId = getUserId();

    // 로그인 상태 확인 및 리다이렉션
    if (!token || userId === null) {
      if (isMounted) {
        setUserInfoError("로그인이 필요합니다.");
        setUserPostsError("로그인이 필요합니다.");
        setUserCommentsError("로그인이 필요합니다.");
        setIsUserInfoLoading(false);
        setIsUserPostsLoading(false);
        setIsUserCommentsLoading(false);
        router.push("/login");
      }
      return;
    }

    // 사용자 정보 로딩 함수
    const performFetchUserInfo = async () => {
      if (!isMounted) return;
      try {
        setIsUserInfoLoading(true);
        const userInfo = await getUserInfo(userId, token);
        if (isMounted) {
          setUser(userInfo);
          setUserInfoError(null);
        }
      } catch (error: any) {
        console.error("사용자 정보 조회 실패:", error);
        if (isMounted) {
          setUserInfoError(error.message || "사용자 정보를 불러오는 데 실패했습니다.");
          setUser(null);
          if (error.message.includes("401") || error.message.includes("403")) {
            removeToken();
            router.push("/login");
          }
        }
      } finally {
        if (isMounted) {
          setIsUserInfoLoading(false);
        }
      }
    };

    // 사용자 게시물 로딩 함수
    const performFetchPosts = async () => {
      if (!isMounted || !userId || !token) return;
      try {
        setIsUserPostsLoading(true);
        const posts = await getUserPosts(userId, token);
        if (isMounted) {
          setUserPosts(posts);
          setUserPostsError(null);
        }
      } catch (error: any) {
        console.error("사용자 게시물 조회 실패:", error);
        if (isMounted) {
          setUserPostsError(error.message || "게시물을 불러오는 데 실패했습니다.");
          setUserPosts(null);
        }
      } finally {
        if (isMounted) {
          setIsUserPostsLoading(false);
        }
      }
    };

    // 사용자 댓글 로딩 함수
    const performFetchComments = async () => {
      if (!isMounted || !userId || !token) return;
      try {
        setIsUserCommentsLoading(true);
        const comments = await getUserComments(userId, token);
        if (isMounted) {
          setUserComments(comments);
          setUserCommentsError(null);
        }
      } catch (error: any) {
        console.error("사용자 댓글 조회 실패:", error);
        if (isMounted) {
          setUserCommentsError(error.message || "댓글을 불러오는 데 실패했습니다.");
          setUserComments(null);
        }
      } finally {
        if (isMounted) {
          setIsUserCommentsLoading(false);
        }
      }
    };

    // API 호출 실행
    performFetchUserInfo();
    performFetchPosts();
    performFetchComments();

    // 클린업 함수: 컴포넌트 언마운트 시 플래그 설정
    return () => {
      isMounted = false;
    };
  }, [router]);

  // 회원 탈퇴 처리 함수
  const handleWithdraw = async () => {
    // 1. 탈퇴 확인
    if (!window.confirm("정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    setWithdrawError(null);
    setIsWithdrawing(true);

    // 2. 스토리지에서 사용자 ID 및 토큰 가져오기
    const token = getToken();
    const userId = getUserId();

    if (!token || userId === null) {
      setWithdrawError("로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.");
      setIsWithdrawing(false);
      return;
    }

    try {
      // 3. API 호출
      await withdrawUser(userId, token);

      // 4. 성공 처리
      alert("회원 탈퇴가 성공적으로 처리되었습니다.");
      removeToken();
      router.push("/");
    } catch (error: any) {
      // 5. 실패 처리
      console.error("회원 탈퇴 실패:", error);
      setWithdrawError(error.message || "회원 탈퇴 중 오류가 발생했습니다.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/board">
            <Image src="/microsoft.png" alt="Microsoft Logo" width={50} height={50} className="mr-5 cursor-pointer" />
          </Link>
          <h1 className="text-3xl font-bold text-black">마이페이지</h1>
        </div>
        <LogoutButton />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center">
          {/* 사진 들어갈 공간 (추후 프로필 사진 기능 추가 시 사용) */}
          <div className="w-24 h-24 bg-gray-300 rounded-full mr-6 flex items-center justify-center text-gray-500">
            {isUserInfoLoading ? "..." : user ? user.userName.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="text-left">
            {/* 사용자 이름 표시 */}
            <h2 className="text-2xl font-semibold mb-1 text-black">
              {isUserInfoLoading ? "로딩 중..." : userInfoError ? "오류" : user?.userName ?? "사용자"}
            </h2>
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
        {withdrawError && <p className="text-red-500 text-sm mt-2 text-right">{withdrawError}</p>}
      </div>

      {isUserPostsLoading && <p className="text-center text-gray-600 my-4">게시글 목록을 불러오는 중...</p>}
      {userPostsError && <p className="text-center text-red-500 my-4">게시글 목록 로딩 오류: {userPostsError}</p>}
      {!isUserPostsLoading && !userPostsError && <UserPostsList posts={userPosts} />}

      {isUserCommentsLoading && <p className="text-center text-gray-600 my-4">댓글 목록을 불러오는 중...</p>}
      {userCommentsError && <p className="text-center text-red-500 my-4">댓글 목록 로딩 오류: {userCommentsError}</p>}
      {!isUserCommentsLoading && !userCommentsError && <UserCommentsList comments={userComments} />}

      <PasswordChangeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
