interface BoardPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

const BoardPagination: React.FC<BoardPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // 페이지 번호 배열 생성 (예: [1, 2, 3, ..., totalPages])
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // 간단한 이전/다음 페이지 이동 함수
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // 페이지 번호가 너무 많을 경우 일부만 표시하는 로직 (선택적 개선)
  // 여기서는 모든 페이지 번호를 표시
  const renderPageNumbers = pageNumbers.map((number) => (
    <button
      key={number}
      onClick={() => onPageChange(number)}
      className={`border px-3 py-1 rounded ${
        currentPage === number
          ? 'bg-blue-600 text-white' // 현재 페이지 스타일
          : 'hover:bg-gray-100'
      }`}
      disabled={currentPage === number} // 현재 페이지는 클릭 비활성화
    >
      {number}
    </button>
  ));

  return (
    <div className="flex justify-center items-center gap-2 mb-4">
      {/* 이전 페이지 버튼 */}
      <button
        onClick={goToPreviousPage}
        className="border px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      {/* 페이지 번호 버튼들 */}
      {renderPageNumbers}

      {/* 다음 페이지 버튼 */}
      <button
        onClick={goToNextPage}
        className="border px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
      {/* TODO: 첫 페이지/마지막 페이지 이동 버튼 (>>) 추가 */}
    </div>
  );
};

export default BoardPagination;
