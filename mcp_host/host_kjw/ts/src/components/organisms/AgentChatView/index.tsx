import { useState } from "react";

interface Message {
  text: string;
  type: "user" | "AIMessage" | "ToolMessage";
}

export const AgentChatView = () => {
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  const handleDeleteStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleSend = async () => {
    if (title.trim() && steps.length > 0 && steps.every((s) => s.trim() !== "")) {
      setIsLoading(true);

      const formattedSteps = steps.map((step, idx) => `[Step ${idx + 1}] ${step}`);

      try {
        const res = await fetch("/api/mcp/chat", {
          method: "POST",
          body: JSON.stringify({ title, steps: formattedSteps }),
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setMessages([{ text: JSON.stringify(data.result, null, 2), type: "AIMessage" }]);
        downloadJson(data.result, `${title}_테스트결과.json`); // 바로 리포트 저장
      } catch (error: any) {
        console.error("Error sending message:", error);
        setMessages([{ text: `Error: ${error?.message || "Unknown error"}`, type: "AIMessage" }]);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("제목과 모든 Step을 정확히 입력하세요.");
    }
  };

  const downloadJson = (data: any, filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 border rounded"
          placeholder="시나리오 제목 입력"
        />

        {steps.map((step, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={step}
              onChange={(e) => handleStepChange(index, e.target.value)}
              className="flex-grow p-2 border rounded"
              placeholder={`Step ${index + 1} 입력`}
            />
            <button
              onClick={() => handleDeleteStep(index)}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              disabled={steps.length === 1}
            >
              🗑
            </button>
          </div>
        ))}

        <button onClick={handleAddStep} className="p-2 bg-green-500 text-white rounded hover:bg-green-600 mt-2">
          + Step 추가
        </button>

        <button onClick={handleSend} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4">
          {isLoading ? "요청 중..." : "테스트 시작"}
        </button>
      </div>

      <div className="h-64 overflow-y-auto mt-4">
        {messages.map((msg, idx) => (
          <pre key={idx} className="text-sm bg-gray-100 p-2 rounded mb-2 whitespace-pre-wrap">
            {msg.text}
          </pre>
        ))}
      </div>
    </div>
  );
};

export default AgentChatView;
