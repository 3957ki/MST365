"use client";

import { AgentChatView } from "../../organisms/AgentChatView";

export const HomeTemplate = () => {
  return (
    <div className="p-3 bg-white rounded-lg">
      <main className="flex items-start justify-center mt-3 gap-3 px-3">
        <div className="w-1/2">
          <AgentChatView />
        </div>
      </main>
    </div>
  );
};
