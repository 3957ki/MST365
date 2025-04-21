import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8">
      <div className="max-w-2xl w-full text-center bg-white p-10 rounded-lg shadow-md">
        <div className="mb-6 flex justify-center items-center">
          <Image
            src="/microsoft.png"
            alt="Microsoft Logo"
            width={120}
            height={20}
            className="mr-6"
          />
          <h1 className="text-4xl font-bold text-blue-700">Demo Web</h1>
        </div>
        <p className="text-lg text-gray-600 mb-8 font-bold">
          Microsoft Playwright MCP 기본 테스트
        </p>
        <div className="flex justify-center space-x-6">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-colors"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
