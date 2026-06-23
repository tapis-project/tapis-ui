export type ChatMessageMeta = {
  stream?: {
    thinking: string;
    thinkingInProgress: boolean;
    streaming: boolean;
  };
};

export type ChatTurn = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  meta?: ChatMessageMeta;
};

export type AgentStreamHandlers = {
  onDelta?: (delta: string) => void;
  onDone?: () => void;
  signal?: AbortSignal;
};

export type AgentContext = {
  section:
    | 'ml-hub'
    | 'jobs'
    | 'files'
    | 'apps'
    | 'workflows'
    | 'pods'
    | 'systems';
  basePath: string;
  mlHubBasePath?: string;
  jwt: string;
  ragPODSEndpoint?: string;
};

export type AgentResult = {
  messages: ChatTurn[];
  followups?: string[];
  data?: any;
};

export interface Agent {
  id: string;
  name: string;
  description?: string;
  respond: (history: ChatTurn[], context: AgentContext) => Promise<AgentResult>;
  respondStream?: (
    history: ChatTurn[],
    context: AgentContext,
    handlers: AgentStreamHandlers
  ) => Promise<AgentResult>;
}
