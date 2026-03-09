import {
  Agent,
  AgentContext,
  AgentResult,
  ChatTurn,
} from 'app/_context/chat/agentTypes';

function buildSystemPrompt(): string {
  return (
    'You are an expert assistant responsible for answering questions related to Tapis Systems. ' +
    'You help users understand how to create, configure, and manage systems in Tapis. ' +
    'Provide clear, accurate, and helpful answers based on your knowledge of Tapis Systems. ' +
    'If you are unsure about something or need to provide more detailed information, ' +
    'please refer users to the official Tapis Systems documentation at: ' +
    'https://tapis.readthedocs.io/en/latest/technical/systems.html\n\n' +
    'Important context about listing systems: The getSystems endpoint supports a `listType` query parameter ' +
    '(type: ListTypeEnum, default: "OWNED"). The possible values are:\n' +
    '- "OWNED" — returns only systems owned by the requester (this is the default).\n' +
    '- "ALL" — returns all systems the requester has access to, including owned systems and those shared with them.\n' +
    '- "SHARED_PUBLIC" — returns only systems that have been shared publicly.\n\n' +
    'When a user asks about seeing all of their systems or all available systems, the correct approach is to use ' +
    'listType=ALL. When they ask about just their own systems, that is the default OWNED behavior. ' +
    'You may briefly note that SHARED_PUBLIC is also available for browsing publicly shared systems, but ' +
    'treat it as a less commonly used option — just a brief aside rather than a primary recommendation.\n\n' +
    'Formatting: Your responses are displayed in a chat panel with limited width. ' +
    'Keep lines in code blocks and examples to roughly 80 characters or fewer. ' +
    'For prose, write naturally but prefer shorter paragraphs and concise sentences.'
  );
}

async function callRAGPODS(
  endpoint: string,
  jwt: string,
  question: string,
  model: string = 'llama4-17b'
): Promise<string> {
  // Extract token if it's an object with access_token property, otherwise use as-is
  const actualToken =
    typeof jwt === 'string' ? jwt : (jwt as any)?.access_token || jwt;

  if (!actualToken || typeof actualToken !== 'string') {
    throw new Error('Invalid token: Token is required and must be a string');
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tapis-Token': actualToken,
      },
      body: JSON.stringify({
        message: question,
        model,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `RAG PODS API error (${response.status}): ${errorText}`;

      // Try to parse error response for better error message
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = `RAG PODS API error (${response.status}): ${errorData.message}`;
        }
      } catch {
        // If parsing fails, use the original error text
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    const content: string = data?.answer ?? '';

    if (!content) {
      throw new Error('RAG PODS API returned empty answer');
    }

    return content;
  } catch (e) {
    if (e instanceof Error) {
      // Check for CORS errors
      if (
        e.message.includes('CORS') ||
        e.message.includes('Failed to fetch') ||
        e.message.includes('NetworkError')
      ) {
        throw new Error(
          `CORS error: Unable to connect to RAG PODS API. If running in development, ensure the Vite proxy is configured. Error: ${e.message}`
        );
      }
      throw e;
    }
    throw new Error(`RAG PODS error: ${e}`);
  }
}

export const SystemQAAgent: Agent = {
  id: 'system-qa',
  name: 'System QA Agent',
  description: 'Answers questions about Tapis Systems',
  respond: async (
    history: ChatTurn[],
    context: AgentContext
  ): Promise<AgentResult> => {
    const lastUser = [...history].reverse().find((t) => t.role === 'user');
    const userQuestion = lastUser?.content || '';

    if (!userQuestion.trim()) {
      return {
        messages: [
          {
            id: `${Date.now()}-assistant`,
            role: 'assistant',
            content: 'Please ask a question about Tapis Systems.',
          },
        ],
      };
    }

    // Get RAG PODS endpoint from context
    const ragPODSEndpoint =
      context.ragPODSEndpoint ||
      (process.env.NODE_ENV === 'development'
        ? '/api/rag/chat'
        : 'https://tapisagent.pods.tacc.tapis.io/chat');

    if (!ragPODSEndpoint) {
      return {
        messages: [
          {
            id: `${Date.now()}-assistant`,
            role: 'assistant',
            content:
              'Configuration error: RAG PODS endpoint is not configured.',
          },
        ],
      };
    }

    let answer: string = '';
    try {
      const systemPrompt = buildSystemPrompt();
      // Combine system prompt with user question for RAG PODS
      const fullQuestion = `${systemPrompt}\n\nUser question: ${userQuestion}`;

      answer = await callRAGPODS(ragPODSEndpoint, context.jwt, fullQuestion);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : typeof e === 'string'
          ? e
          : JSON.stringify(e);
      answer = `Error: ${message}`;
    }

    return {
      messages: [
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content:
            answer || 'I apologize, but I could not generate a response.',
        },
      ],
    };
  },
};

export default SystemQAAgent;
