import {
  Agent,
  AgentContext,
  AgentResult,
  ChatTurn,
} from 'app/_context/chat/agentTypes';
import { MLHub as API } from '@tapis/tapisui-api';

type ModelLite = {
  id?: string;
  mc_id?: string;
  name?: string;
  pipeline_tag?: string;
  library_name?: string;
  tags?: string[];
  likes?: number;
  downloads?: number;
  createdAt?: string;
  short_description?: string;
};

function normalizeModelId(m: ModelLite): string {
  return (m.id || m.mc_id || '').toString();
}

function rankModels(requirements: string, models: ModelLite[]): ModelLite[] {
  const r = requirements.toLowerCase();
  const score = (m: ModelLite) => {
    let s = 0;
    if (m.pipeline_tag && r.includes(m.pipeline_tag.toLowerCase())) s += 3;
    if (m.library_name && r.includes(m.library_name.toLowerCase())) s += 2;
    if (m.tags && m.tags.some((t) => r.includes(t.toLowerCase()))) s += 1;
    s += ((m.downloads || 0) / 1_000_000) * 0.5;
    s += ((m.likes || 0) / 100_000) * 0.5;
    return s;
  };
  return [...models].sort((a, b) => score(b) - score(a));
}

async function fetchModels(
  platform: string,
  mlHubBasePath: string | undefined,
  jwt: string
) {
  const { result } = await API.Models.Platforms.listModelsByPlatform(
    platform as any,
    mlHubBasePath || '',
    jwt
  );
  return (result || []) as ModelLite[];
}

function buildLLMSystemPrompt(): string {
  return (
    'You are a Model Selection Assistant for the Tapis MLHub. ' +
    'You will receive: (1) user requirements and (2) a list of available models from Tapis. ' +
    'Choose the most relevant models ONLY from the provided list; do not invent models. ' +
    'Prioritize exact task/pipeline_tag match, then library compatibility, then tag overlap, then popularity and recency. ' +
    'Return a strict JSON object with shape: ' +
    '{"recommendations":[{"id":string,"rationale":string}],"notes":string}.'
  );
}

const MAX_MODELS_FOR_PROMPT = 10;

function buildLLMUserPrompt(
  requirements: string,
  platform: string,
  models: ModelLite[]
): string {
  const compact = models.slice(0, MAX_MODELS_FOR_PROMPT).map((m) => ({
    id: normalizeModelId(m),
    name: m.name,
    pipeline_tag: m.pipeline_tag,
    library_name: m.library_name,
    tags: (m.tags || []).slice(0, 8),
    likes: m.likes,
    downloads: m.downloads,
    createdAt: m.createdAt,
  }));
  return (
    `User requirements (free text):\n${requirements}\n\n` +
    `Platform: ${platform}\n\n` +
    `Available models (first ${
      compact.length
    } as JSON array):\n${JSON.stringify(compact)}\n\n` +
    'Respond ONLY with the JSON object.'
  );
}

async function callLiteLLM(
  endpoint: string,
  systemPrompt: string,
  userPrompt: string,
  jwt: string,
  model: string = 'llama4-17b'
): Promise<string> {
  // Extract token if it's an object with access_token property, otherwise use as-is
  const actualToken =
    typeof jwt === 'string' ? jwt : (jwt as any)?.access_token || jwt;

  if (!actualToken || typeof actualToken !== 'string') {
    throw new Error('Invalid token: Token is required and must be a string');
  }

  try {
    const response = await fetch(`${endpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tapis-Token': actualToken,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `LiteLLM API error (${response.status}): ${errorText}`;

      // Try to parse error response for better error message
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = `LiteLLM API error (${response.status}): ${errorData.message}`;
        }
      } catch {
        // If parsing fails, use the original error text
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';

    if (!content) {
      throw new Error('LiteLLM API returned empty answer');
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
          `CORS error: Unable to connect to LiteLLM API. If running in development, ensure the Vite proxy is configured. Error: ${e.message}`
        );
      }
      throw e;
    }
    throw new Error(`LiteLLM error: ${e}`);
  }
}

export const ModelSelectionAgent: Agent = {
  id: 'model-selection',
  name: 'Model Selection Agent',
  description: 'Recommends models based on user requirements',
  respond: async (
    history: ChatTurn[],
    context: AgentContext
  ): Promise<AgentResult> => {
    const lastUser = [...history].reverse().find((t) => t.role === 'user');
    const userText = lastUser?.content || '';

    // Expect platform embedded in the user text for MVP, e.g., "platform: HuggingFace"
    const platformMatch = userText.match(/platform\s*:\s*([\w-]+)/i);
    const platform = platformMatch
      ? platformMatch[1].toLowerCase()
      : 'huggingface';

    const models = await fetchModels(
      platform,
      context.mlHubBasePath || context.basePath,
      context.jwt
    );

    // Determine which service to use
    const litellmEndpoint =
      process.env.NODE_ENV === 'development'
        ? '/api/litellm'
        : 'https://litellm.pods.tacc.tapis.io';
    const hasLiteLLMConfig = true; // Always use LiteLLM

    if (!hasLiteLLMConfig) {
      return {
        messages: [
          {
            id: `${Date.now()}-assistant`,
            role: 'assistant',
            content:
              'LLM configuration error: Please configure LiteLLM endpoint.',
          },
        ],
      };
    }

    let llmRaw: string = '';
    try {
      const sys = buildLLMSystemPrompt();
      const usr = buildLLMUserPrompt(userText, platform, models);

      const content = await callLiteLLM(litellmEndpoint, sys, usr, context.jwt);
      llmRaw = content || '';
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : typeof e === 'string'
          ? e
          : JSON.stringify(e);
      llmRaw = `LiteLLM error: ${message}`;
    }

    const messagesOut: ChatTurn[] = [
      {
        id: `${Date.now()}-assistant-raw`,
        role: 'assistant',
        content: llmRaw || 'No response from model.',
      },
    ];

    return { messages: messagesOut };
  },
};

export default ModelSelectionAgent;
