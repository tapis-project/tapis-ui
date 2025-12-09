import { ReactNode } from 'react';
import { Agent, AgentContext } from './agentTypes';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
};

export type ChatConfig = {
  id: string;
  title: string;
  agent: Agent;
  storageKey: string;
  emptyStateContent?:
    | ReactNode
    | ((onSend: (text: string) => void) => ReactNode);
  examplePrompts?: string[];
  getAgentContext: (baseContext: {
    accessToken?: { access_token?: string } | null;
    basePath?: string;
    mlHubBasePath?: string;
  }) => AgentContext;
  getInitialMessages?: () => ChatMessage[];
};

export type ChatRegistry = Map<string, ChatConfig>;
