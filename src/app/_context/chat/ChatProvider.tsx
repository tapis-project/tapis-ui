import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatContext, { ChatContextType } from './ChatContext';
import { getChatIdForRoute } from './ChatRegistry';

const ChatProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string>('model-selection');
  const location = useLocation();

  // Update active chat ID based on current route
  useEffect(() => {
    const chatId = getChatIdForRoute(location.pathname);
    setActiveChatId(chatId);
  }, [location.pathname]);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const contextValue: ChatContextType = {
    isChatOpen,
    setIsChatOpen,
    toggleChat,
    activeChatId,
    setActiveChatId,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

export default ChatProvider;
