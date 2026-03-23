export type ChatTurn = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  meta?: any;
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
}
