// "use client"; // Removed "use client" directive

// import { useRouter } from "next/navigation"; // Removed next/navigation import
import { useNavigate } from "react-router-dom"; // Import useNavigate

const WriteButton = () => {
  const navigate = useNavigate(); // Use useNavigate
  // const router = useRouter(); // Removed

  const handleClick = () => {
    navigate("/board/new"); // Use navigate
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
