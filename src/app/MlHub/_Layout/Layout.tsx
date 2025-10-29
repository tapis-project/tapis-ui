import React, { useState } from "react";
import { Router } from "../_Router";
import { PageLayout, LayoutBody, ChatDrawer } from "@tapis/tapisui-common";
import { Menu } from "../_components";
import { useTapisConfig } from "@tapis/tapisui-hooks";
import { ModelSelectionAgent, type ChatTurn } from "../services/agents";

const Layout: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<
    { id: string; role: "user" | "assistant" | "system"; content: string }[]
  >([]);
  const [isSending, setIsSending] = useState(false);
  const { accessToken, basePath, mlHubBasePath } = useTapisConfig();

  const handleSend = async (text: string) => {
    const now = Date.now();
    const userTurn: ChatTurn = {
      id: `${now}-user`,
      role: "user",
      content: text,
    };
    const nextHistory: ChatTurn[] = [...messages, userTurn];
    setMessages(nextHistory);
    setIsSending(true);
    try {
      const result = await ModelSelectionAgent.respond(nextHistory, {
        section: "ml-hub",
        basePath: basePath || "",
        mlHubBasePath,
        jwt: accessToken?.access_token ?? "",
        openAIApiKey: "YOUR_OPENAI_API_KEY",
      });
      if (result.messages && result.messages.length > 0) {
        setMessages((prev) => [...prev, ...result.messages]);
      }
    } finally {
      setIsSending(false);
    }
  };

  const header = (
    <div>
      <Menu onToggleChat={() => setIsChatOpen((o) => !o)} />
    </div>
  );

  const body = (
    <LayoutBody>
      <Router />
    </LayoutBody>
  );

  return (
    <>
      <PageLayout top={header} right={body} />
      <ChatDrawer
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        title="Model Chat"
        messages={messages}
        onSend={handleSend}
        isSending={isSending}
      />
    </>
  );
};

export default Layout;
