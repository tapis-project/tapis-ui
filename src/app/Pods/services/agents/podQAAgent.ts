import {
  Agent,
  AgentContext,
  AgentResult,
  ChatTurn,
} from 'app/_context/chat/agentTypes';

function buildSystemPrompt(): string {
  return (
    'You are an expert assistant responsible for answering questions related to Tapis Pods. ' +
    'You help users understand how to create, configure, and manage Kubernetes pods in Tapis. ' +
    'Provide clear, accurate, and helpful answers based on your knowledge of Tapis Pods. ' +
    'If you are unsure about something or need to provide more detailed information, ' +
    'please refer users to the official Tapis Pods documentation at: ' +
    'https://tapis.readthedocs.io/en/latest/technical/pods.html'
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
        question,
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

export const PodQAAgent: Agent = {
  id: 'pod-qa',
  name: 'Pod QA Agent',
  description: 'Answers questions about Tapis Pods',
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
            content: 'Please ask a question about Tapis Pods.',
          },
        ],
      };
    }

    // Get RAG PODS endpoint from context
    const ragPODSEndpoint =
      context.ragPODSEndpoint ||
      (process.env.NODE_ENV === 'development'
        ? '/api/rag/chat'
        : 'https://rag.pods.tacc.tapis.io/chat');

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

export default PodQAAgent;
