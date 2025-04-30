import Image from "next/image";
import Link from "next/link";

interface BoardDetailPageProps {
  params: {
    board_id: string;
  };
}

const BoardDetailPage: React.FC<BoardDetailPageProps> = ({ params }) => {
  const { board_id } = params;

  return (
    <div className="container mx-auto p-8">
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
      </div>

      <>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-black mb-4 border-b pb-2">
            더미 게시물 제목입니다.
          </h1>

          <div className="grid grid-cols-4 gap-4 border-b pb-2 mb-4 text-sm text-gray-600">
            <div>
              <span className="font-semibold">작성자:</span> 테스트 사용자
            </div>
            <div>
              <span className="font-semibold">조회수:</span> 123
            </div>
            <div className="col-span-2 text-right">
              <span className="font-semibold">등록일:</span> 2025-04-29
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <p>
              이것은 더미 게시물 내용입니다. 상세 페이지 확인을 위해
              작성되었습니다.
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-5">
          <Link href={`/board/${board_id}/edit`}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
              수정
            </button>
          </Link>
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
            삭제
          </button>
          <Link href="/board">
            <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
              목록
            </button>
          </Link>
        </div>
      </>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">댓글 (5)</h3>
        <div className="space-y-4 mb-6">
          {/* Dummy Comment 1 */}
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-blue-600">댓글러1</span>
              <span className="text-sm text-gray-500">10분 전</span>
            </div>
            <p className="text-gray-800">첫 번째 더미 댓글입니다.</p>
          </div>
          {/* Dummy Comment 2 */}
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-blue-600">댓글러2</span>
              <span className="text-sm text-gray-500">8분 전</span>
            </div>
            <p className="text-gray-800">
              두 번째 더미 댓글입니다. 내용이 조금 더 길 수 있습니다.
            </p>
          </div>
          {/* Dummy Comment 3 */}
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-blue-600">댓글러3</span>
              <span className="text-sm text-gray-500">5분 전</span>
            </div>
            <p className="text-gray-800">세 번째 댓글.</p>
          </div>
          {/* Dummy Comment 4 */}
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-blue-600">댓글러4</span>
              <span className="text-sm text-gray-500">3분 전</span>
            </div>
            <p className="text-gray-800">
              네 번째 댓글입니다. 테스트 중입니다.
            </p>
          </div>
          {/* Dummy Comment 5 */}
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-blue-600">댓글러5</span>
              <span className="text-sm text-gray-500">1분 전</span>
            </div>
            <p className="text-gray-800">마지막 다섯 번째 더미 댓글!</p>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-2">댓글 작성</h4>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2 h-24 text-black mb-2"
            placeholder="댓글을 입력하세요"
          />
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
            댓글 등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardDetailPage;
