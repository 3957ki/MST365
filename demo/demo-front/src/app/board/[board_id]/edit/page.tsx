import Image from "next/image";
import Link from "next/link";

export default function page() {
  return (
    <div className="container mx-auto p-8 ml-56">
      <div className="flex items-center mb-6">
        <Link href="/board">
          <Image
            src="/microsoft.png"
            alt="Microsoft Logo"
            width={50}
            height={50}
            className="mr-5 cursor-pointer"
          />
        </Link>
        <h1 className="text-3xl font-bold text-black">게시물 수정</h1>
      </div>

      <form className="space-y-6">
        <div>
          <label className="block text-black font-semibold mb-2">제목</label>
          <input
            type="text"
            className="w-[80%] border border-gray-300 rounded-lg p-2 text-black"
            placeholder="제목을 입력하세요"
          />
        </div>
        <div>
          <label className="block text-black font-semibold mb-2">작성자</label>
          <input
            type="text"
            className="w-[80%] border border-gray-300 rounded-lg p-2 text-black"
            placeholder="작성자 이름을 입력하세요"
          />
        </div>
        <div>
          <label className="block text-black font-semibold mb-2">내용</label>
          <textarea
            className="w-[80%] border border-gray-300 rounded-lg p-2 h-40 text-black"
            placeholder="내용을 입력하세요"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          수정하기
        </button>
      </form>
    </div>
  );
}
