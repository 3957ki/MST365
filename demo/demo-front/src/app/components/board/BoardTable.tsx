interface Post {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  views: number;
}

interface BoardTableProps {
  posts: Post[];
}

const BoardTable: React.FC<BoardTableProps> = ({ posts }) => {
  return (
    <table className="w-full border-collapse border border-gray-300 mb-4 text-black">
      <thead className="bg-gray-100 ">
        <tr>
          <th className="border p-2 w-16">순번</th>
          <th className="border p-2">제목</th>
          <th className="border p-2 w-24">등록자명</th>
          <th className="border p-2 w-32">등록일</th>
          <th className="border p-2 w-20">조회수</th>
        </tr>
      </thead>
      <tbody>
        {posts.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center p-4 border">
              게시글이 없습니다.
            </td>
          </tr>
        ) : (
          posts.map((post) => (
            <tr key={post.id} className="hover:bg-gray-50">
              <td className="border p-2 text-center">{post.id}</td>
              <td className="border p-2">
                {/* TODO: 디테일 페이지 연결*/}
                {post.title}
              </td>
              <td className="border p-2 text-center">{post.author}</td>
              <td className="border p-2 text-center">{post.createdAt}</td>
              <td className="border p-2 text-center">{post.views}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default BoardTable;
