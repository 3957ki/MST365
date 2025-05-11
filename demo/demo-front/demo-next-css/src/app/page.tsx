import Link from "next/link";
import Image from "next/image";
import "./page.css";

export default function Home() {
  return (
    <div className="home-container">
      <div className="content-wrapper">
        <div className="logo-title-container">
          <Image
            src="/microsoft.png"
            alt="Microsoft Logo"
            width={80}
            height={80}
            className="logo-image"
          />
          <h1 className="title-text">Demo Web</h1>
        </div>
        <p className="subtitle-text">
          Microsoft Playwright MCP 기본 테스트
        </p>
        <div className="button-group">
          <Link
            href="/login"
            className="login-button"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="signup-button"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
