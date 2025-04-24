interface BoardInfoProps {
  totalPosts: number;
  currentPage: number;
  totalPages: number;
}

const BoardInfo: React.FC<BoardInfoProps> = ({
  totalPosts,
  currentPage,
  totalPages,
}) => {
  return (
    <div className="flex justify-between items-center mb-2 text-black">
      <div>
        총 게시물 <span className="font-bold text-red-500">{totalPosts}</span>건
        | 현재 페이지{" "}
        <span className="font-bold text-red-500">{currentPage}</span>/
        {totalPages}
      </div>
    </div>
  );
};

export default BoardInfo;
