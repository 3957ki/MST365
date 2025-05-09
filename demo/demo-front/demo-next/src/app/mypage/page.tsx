"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react"; // useEffect 추가
import { useRouter } from "next/navigation";
import PasswordChangeModal from "./component/PasswordChangeModal";
import UserPostsList from "./component/UserPostsList";
import UserCommentsList from "./component/UserCommentsList";
import LogoutButton from "../components/common/LogoutButton";
// getUserInfo, UserInfoData, getUserPosts, UserPostItem, getUserComments, UserCommentItem 타입 임포트 추가
import { getToken, getUserId, removeToken, withdrawUser, getUserInfo, UserInfoData, getUserPosts, UserPostItem, getUserComments, UserCommentItem } from "../api/auth";
import "./page.css";

export default function MyPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const router = useRouter();

  // 사용자 정보 상태 추가
  const [user, setUser] = useState<UserInfoData | null>(null);
  const [isUserInfoLoading, setIsUserInfoLoading] = useState(true);
  const [userInfoError, setUserInfoError] = useState<string | null>(null);

  // 사용자 게시물 목록 상태 추가
  const [userPosts, setUserPosts] = useState<UserPostItem[] | null>(null);
  const [isUserPostsLoading, setIsUserPostsLoading] = useState(true);
  const [userPostsError, setUserPostsError] = useState<string | null>(null);

  // 사용자 댓글 목록 상태 추가
  const [userComments, setUserComments] = useState<UserCommentItem[] | null>(null);
  const [isUserCommentsLoading, setIsUserCommentsLoading] = useState(true);
  const [userCommentsError, setUserCommentsError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 사용자 정보, 게시물, 댓글 로드
  useEffect(() => {
    let isMounted = true; // 컴포넌트 언마운트 시 비동기 작업 취소 플래그
    const token = getToken();
    const userId = getUserId();

    // 로그인 상태 확인 및 리다이렉션
    if (!token || userId === null) {
      if (isMounted) {
        setUserInfoError("로그인이 필요합니다.");
        setUserPostsError("로그인이 필요합니다.");
        setUserCommentsError("로그인이 필요합니다."); // 댓글 에러도 설정
        setIsUserInfoLoading(false);
        setIsUserPostsLoading(false);
        setIsUserCommentsLoading(false); // 댓글 로딩도 종료
        router.push("/login");
      }
      return; // useEffect 종료
    }

    // 사용자 정보 로딩 함수 정의
    const performFetchUserInfo = async () => {
      if (!isMounted) return; // 컴포넌트 언마운트 시 중단
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

    // 사용자 게시물 로딩 함수 정의
    const performFetchPosts = async () => {
      if (!isMounted || !userId || !token) return; // userId, token 유효성 검사 추가
      try {
        setIsUserPostsLoading(true);
        const posts = await getUserPosts(userId, token); // userId, token 전달 확인
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

    // 사용자 댓글 로딩 함수 정의
    const performFetchComments = async () => {
      if (!isMounted || !userId || !token) return; // userId, token 유효성 검사 추가
      try {
        setIsUserCommentsLoading(true);
        const comments = await getUserComments(userId, token); // getUserComments 호출
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
    performFetchComments(); // 댓글 로딩 함수 호출 추가

    // 클린업 함수: 컴포넌트 언마운트 시 플래그 설정
    return () => {
      isMounted = false;
    };
    // 의존성 배열: router는 일반적으로 안정적이므로 빈 배열 사용 가능.
    // 또는 userId, token을 상태로 관리한다면 해당 상태를 추가.
  }, [router]); // router를 의존성으로 유지 (Next.js 권장 사항)


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
    <div className="mypage-container">
      <div className="header-container">
        <div className="logo-title-container">
          <Link href="/board">
            <Image
              src="/microsoft.png"
              alt="Microsoft Logo"
              width={50}
              height={50}
              className="logo-image"
            />
          </Link>
          <h1 className="page-title">마이페이지</h1>
        </div>
        {/* LogoutButton 컴포넌트로 교체 */}
        <LogoutButton />
      </div>
      <div className="user-info-card">
        <div className="user-info-flex">
          {/* 사진 들어갈 공간 (추후 프로필 사진 기능 추가 시 사용) */}
          <div className="profile-image-placeholder">
            {/* 로딩/에러/데이터 상태에 따라 아이콘 또는 이니셜 표시 가능 */}
            {isUserInfoLoading ? '...' : user ? user.userName.charAt(0).toUpperCase() : '?'} {/* user_name -> userName */}
          </div>
          <div className="user-info-text-container">
            {/* 사용자 이름 표시 */}
            <h2 className="user-name">
              {isUserInfoLoading ? "로딩 중..." : userInfoError ? "오류" : user?.userName ?? "사용자"} {/* user_name -> userName */}
            </h2>
            {/* 환영 메시지 또는 에러 메시지 표시 */}
            <p className="welcome-message">
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
        <div className="button-group-right">
          <button
            onClick={() => setIsModalOpen(true)}
            className="password-change-button"
          >
            비밀번호 수정
          </button>
          {/* 회원 탈퇴 버튼에 핸들러 연결 및 로딩 상태 반영 */}
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className={`withdraw-button ${
              isWithdrawing ? "withdraw-button-loading" : ""
            }`}
          >
            {isWithdrawing ? "탈퇴 처리 중..." : "회원 탈퇴"}
          </button>
        </div>
        {/* 탈퇴 에러 메시지 표시 */}
        {withdrawError && (
          <p className="withdraw-error-message">
            {withdrawError}
          </p>
        )}
      </div>

      {/* 사용자 게시물 목록 로딩 및 에러 처리 */}
      {isUserPostsLoading && <p className="loading-text">게시글 목록을 불러오는 중...</p>}
      {userPostsError && <p className="error-text">게시글 목록 로딩 오류: {userPostsError}</p>}
      {/* 로딩 완료 및 에러 없을 때 UserPostsList 렌더링 */}
      {!isUserPostsLoading && !userPostsError && <UserPostsList posts={userPosts} />}

      {/* 사용자 댓글 목록 로딩 및 에러 처리 */}
      {isUserCommentsLoading && <p className="loading-text">댓글 목록을 불러오는 중...</p>}
      {userCommentsError && <p className="error-text">댓글 목록 로딩 오류: {userCommentsError}</p>}
      {/* 로딩 완료 및 에러 없을 때 UserCommentsList 렌더링 */}
      {!isUserCommentsLoading && !userCommentsError && <UserCommentsList comments={userComments} />}

      <PasswordChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
