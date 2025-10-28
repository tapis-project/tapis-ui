import React, { useState } from "react";
import { Router } from "../_Router";
import { PageLayout, LayoutBody, ChatDrawer } from "@tapis/tapisui-common";
import { Menu } from "../_components";

const Layout: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<
    { id: string; role: "user" | "assistant" | "system"; content: string }[]
  >([]);

  const handleSend = (text: string) => {
    const now = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: `${now}-user`, role: "user", content: text },
      { id: `${now + 1}-assistant`, role: "assistant", content: "test" },
    ]);
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
      />
    </>
  );
};

export default Layout;
