"use client";

import { useRouter } from "next/navigation";
import "./WriteButton.css";

const WriteButton = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/board/new");
  };

  return (
    <div className="write-button-container">
      <button
        onClick={handleClick}
        className="write-button"
      >
        글쓰기
      </button>
    </div>
  );
};

export default WriteButton;
