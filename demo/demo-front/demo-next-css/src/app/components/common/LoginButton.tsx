"use client";

import React from "react";
import "./LoginButton.css";

const handleLogin = () => {
  console.log("로그인 시도");
  alert("로그인 버튼 클릭됨 (기능 없음)");
};

export default function LoginButton() {
  return (
    <button
      onClick={handleLogin}
      className="login-button"
    >
      로그인
    </button>
  );
}
