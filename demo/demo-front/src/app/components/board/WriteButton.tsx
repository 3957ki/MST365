// TODO: 클릭 시 글쓰기 페이지로 이동하는 로직 추가
const WriteButton = () => {
  return (
    <div className="flex justify-end">
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        글쓰기
      </button>
    </div>
  );
};

export default WriteButton;
