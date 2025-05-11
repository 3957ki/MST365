import "./BoardInfo.css";

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
    <div className="board-info-container">
      <div>
        총 게시물 <span className="info-text-highlight">{totalPosts}</span>건
        | 현재 페이지{" "}
        <span className="info-text-highlight">{currentPage}</span>/
        {totalPages}
      </div>
    </div>
  );
};

export default BoardInfo;
