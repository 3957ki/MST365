import Image from "next/image";
import Link from "next/link";

export default function MyPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Image
            src="/microsoft.png"
            alt="Microsoft Logo"
            width={50}
            height={50}
            className="mr-5 cursor-pointer"
          />
        </Link>
        <h1 className="text-3xl font-bold">마이페이지</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center">
          {/* 사진 들어갈 공간 */}
          <div className="w-24 h-24 bg-gray-500 rounded-full mr-6"></div>
          <div className="text-left">
            <h2 className="text-2xl font-semibold mb-1">회원 이름</h2>
            <p className="text-gray-600">
              회원 소개란입니다. 여기에 간단한 자기소개를 작성할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
