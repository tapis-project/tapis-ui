import React from 'react';

export type ChatContextType = {
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleChat: () => void;
  activeChatId: string;
  setActiveChatId: (chatId: string) => void;
};

export const chatContext: ChatContextType = {
  isChatOpen: false,
  setIsChatOpen: () => {},
  toggleChat: () => {},
  activeChatId: 'model-selection',
  setActiveChatId: () => {},
};

const ChatContext: React.Context<ChatContextType> =
  React.createContext<ChatContextType>(chatContext);

export default ChatContext;
