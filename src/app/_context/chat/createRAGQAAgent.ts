import type { Agent, AgentContext, AgentResult, ChatTurn } from './agentTypes';
import {
  assertOkResponse,
  extractTapisToken,
  formatAgentError,
  getLastUserMessage,
  wrapNetworkError,
} from './agentUtils';

const DEV_RAG_ENDPOINT = '/api/rag/chat';
const PROD_RAG_ENDPOINT = 'https://tapisagent.pods.tacc.tapis.io/chat';
const RAG_SERVICE_NAME = 'RAG PODS';

export type RAGQAAgentConfig = {
  id: string;
  name: string;
  description: string;
  /** Capitalised domain noun used in the system prompt, e.g. "Pods". */
  domain: string;
  /**
   * Fills the "You help users understand how to ___." sentence of the
   * system prompt.
   */
  scopeDescription: string;
  docsUrl: string;
  /** Extra paragraph(s) inserted between docs URL and formatting guidance. */
  extraInstructions?: string;
  /** Overrides the default empty-input fallback message. */
  emptyFallback?: string;
};

async function callRAGQA(
  endpoint: string,
  jwt: string,
  question: string,
  model: string = 'llama4-17b'
): Promise<string> {
  const token = extractTapisToken(jwt);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tapis-Token': token,
      },
      body: JSON.stringify({ message: question, model }),
    });
    await assertOkResponse(response, RAG_SERVICE_NAME);
    const data = await response.json();
    const content: string = data?.answer ?? '';
    if (!content) {
      throw new Error(`${RAG_SERVICE_NAME} API returned empty answer`);
    }
    return content;
  } catch (e) {
    throw wrapNetworkError(e, RAG_SERVICE_NAME);
  }
}

function buildSystemPrompt(config: RAGQAAgentConfig): string {
  const { domain, scopeDescription, docsUrl, extraInstructions } = config;
  const intro =
    `You are an expert assistant responsible for answering questions related to Tapis ${domain}. ` +
    `You help users understand how to ${scopeDescription}. ` +
    `Provide clear, accurate, and helpful answers based on your knowledge of Tapis ${domain}. ` +
    'If you are unsure about something or need to provide more detailed information, ' +
    `please refer users to the official Tapis ${domain} documentation at: ${docsUrl}\n\n`;
  const extras = extraInstructions ? `${extraInstructions}\n\n` : '';
  const formatting =
    'Formatting: Your responses are displayed in a chat panel with limited width. ' +
    'Keep lines in code blocks and examples to roughly 80 characters or fewer. ' +
    'For prose, write naturally but prefer shorter paragraphs and concise sentences.';
  return intro + extras + formatting;
}

export function createRAGQAAgent(config: RAGQAAgentConfig): Agent {
  const systemPrompt = buildSystemPrompt(config);
  const emptyFallback =
    config.emptyFallback ||
    `Please ask a question about Tapis ${config.domain}.`;

  return {
    id: config.id,
    name: config.name,
    description: config.description,
    respond: async (
      history: ChatTurn[],
      context: AgentContext
    ): Promise<AgentResult> => {
      const userQuestion = getLastUserMessage(history);
      if (!userQuestion.trim()) {
        return {
          messages: [
            {
              id: `${Date.now()}-assistant`,
              role: 'assistant',
              content: emptyFallback,
            },
          ],
        };
      }

      const ragEndpoint =
        context.ragPODSEndpoint ||
        (process.env.NODE_ENV === 'development'
          ? DEV_RAG_ENDPOINT
          : PROD_RAG_ENDPOINT);

      let answer = '';
      try {
        const fullQuestion = `${systemPrompt}\n\nUser question: ${userQuestion}`;
        answer = await callRAGQA(ragEndpoint, context.jwt, fullQuestion);
      } catch (e) {
        answer = `Error: ${formatAgentError(e)}`;
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
}
