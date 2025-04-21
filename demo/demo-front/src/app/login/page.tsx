import LoginButton from "../components/common/LoginButton";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8">
      <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-md">
        <div className="mb-6 flex justify-center items-center">
          <Image
            src="/microsoft.png"
            alt="Microsoft Logo"
            width={50}
            height={20}
            className="mr-6"
          />
          <h1 className="text-center text-2xl font-bold">로그인</h1>
        </div>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            아이디
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="w-full p-2 border border-gray-300 rounded box-border"
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="password"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full p-2 border border-gray-300 rounded box-border"
          />
        </div>
        <LoginButton />
        <div className="flex justify-between mt-4 text-sm">
          <div>
            <Link href="/signup" className="text-blue-600 hover:underline">
              회원가입
            </Link>
          </div>
          <div>
            <Link href="/" className="text-blue-600 hover:underline">
              메인페이지
            </Link>
          </div>
        </div>
      </div>{" "}
      {/* End of card container */}
    </div> // End of outer container
  );
}
