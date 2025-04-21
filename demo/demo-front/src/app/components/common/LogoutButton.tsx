"use client";

import React from "react";

const handleLogout = () => {
  console.log("로그아웃 시도");
  alert("로그아웃 버튼 클릭됨 (기능 없음)");
};

export default function LogoutButton() {
  return (
    <button
      onClick={handleLogout}
      className="py-1 px-3 bg-red-500 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors" // Adjusted padding/font size
    >
      로그아웃
    </button>
  );
}
