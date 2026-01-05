import type { ChatConfig, ChatRegistry } from './ChatConfig';

// Registry of all available chats
const chatRegistry: ChatRegistry = new Map();

// Helper function to register a new chat
export const registerChat = (config: ChatConfig) => {
  chatRegistry.set(config.id, config);
};

// Helper function to get a chat config by ID
export const getChatConfig = (chatId: string): ChatConfig | undefined => {
  return chatRegistry.get(chatId);
};

// Helper function to get all registered chats
export const getAllChats = (): ChatConfig[] => {
  return Array.from(chatRegistry.values());
};

// Helper function to get default chat ID (can be made configurable)
export const getDefaultChatId = (): string => {
  return 'model-selection';
};

// Helper function to get chat ID based on current route
export const getChatIdForRoute = (pathname: string): string => {
  // Map routes to chat IDs
  if (pathname.startsWith('/ml-hub')) {
    return 'model-selection';
  }
  if (pathname.startsWith('/systems')) {
    return 'system-qa';
  }
  if (pathname.startsWith('/files')) {
    return 'file-qa';
  }
  if (pathname.startsWith('/apps')) {
    return 'app-qa';
  }
  if (pathname.startsWith('/jobs')) {
    return 'job-qa';
  }
  if (pathname.startsWith('/workflows')) {
    return 'workflow-qa';
  }
  if (pathname.startsWith('/pods')) {
    return 'pod-qa';
  }

  // Default to model selection for now
  return getDefaultChatId();
};

export default chatRegistry;
