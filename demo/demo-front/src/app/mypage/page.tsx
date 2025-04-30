"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import PasswordChangeModal from "./component/PasswordChangeModal";
import UserPostsList from "./component/UserPostsList";
import UserCommentsList from "./component/UserCommentsList";
import LogoutButton from "../components/common/LogoutButton"; // LogoutButton 임포트 추가

export default function MyPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/">
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
          {/* 사진 들어갈 공간 */}
          <div className="w-24 h-24 bg-gray-500 rounded-full mr-6"></div>
          <div className="text-left">
            <h2 className="text-2xl font-semibold mb-1 text-black">
              회원 이름
            </h2>
            <p className="text-gray-600">
              회원 소개란입니다. 여기에 간단한 자기소개를 작성할 수 있습니다.
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
          <button className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            회원 탈퇴
          </button>
        </div>
      </div>
      <UserPostsList /> {/* 변경 */}
      <UserCommentsList /> {/* 변경 */}
      <PasswordChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
