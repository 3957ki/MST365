"use client";

import { useRouter } from "next/navigation";

const WriteButton = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/board/new");
  };

  return (
    <div className="flex justify-end">
      <button
        onClick={handleClick}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        글쓰기
      </button>
    </div>
  );
};

export default WriteButton;
