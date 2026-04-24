import {
  Agent,
  AgentContext,
  AgentResult,
  ChatTurn,
} from 'app/_context/chat/agentTypes';
import {
  assertOkResponse,
  extractTapisToken,
  formatAgentError,
  getLastUserMessage,
  wrapNetworkError,
} from 'app/_context/chat/agentUtils';
import { MLHub as API } from '@tapis/tapisui-api';

const LITELLM_SERVICE_NAME = 'LiteLLM';

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
    'Prioritize exact task/pipeline_tag match, then library compatibility, then tag overlap, then popularity and recency.\n\n' +
    'Response format:\n' +
    '1. Start with a brief plain-text summary (1-3 sentences) of what you found.\n' +
    '2. Then include your recommendations as a fenced JSON code block using triple backticks with the json language tag, like:\n' +
    '```json\n{"recommendations":[{"id":"...","rationale":"..."}],"notes":"..."}\n```\n' +
    '3. Optionally add a short closing note after the JSON block.\n\n' +
    'The JSON object MUST have the shape: {"recommendations":[{"id":string,"rationale":string}],"notes":string}.\n\n' +
    'Formatting: Your responses are displayed in a chat panel with limited width. ' +
    'Keep lines in code blocks, JSON, and examples to roughly 80 characters or fewer. ' +
    'Pretty-print the JSON with 2-space indentation so it is easy to read. ' +
    'This is around 80-100 chars a line, attempt to keep concise with that in mind. ' +
    'For prose, write naturally but prefer shorter paragraphs and concise sentences.'
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
    'Respond with a brief summary, then the JSON recommendations in a fenced ```json code block, as described in your instructions.'
  );
}

async function callLiteLLM(
  endpoint: string,
  systemPrompt: string,
  userPrompt: string,
  jwt: string,
  model: string = 'llama4-17b'
): Promise<string> {
  const token = extractTapisToken(jwt);
  try {
    const response = await fetch(`${endpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tapis-Token': token,
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
    await assertOkResponse(response, LITELLM_SERVICE_NAME);
    const data = await response.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';
    if (!content) {
      throw new Error(`${LITELLM_SERVICE_NAME} API returned empty answer`);
    }
    return content;
  } catch (e) {
    throw wrapNetworkError(e, LITELLM_SERVICE_NAME);
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
    const userText = getLastUserMessage(history);

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

    const litellmEndpoint =
      process.env.NODE_ENV === 'development'
        ? '/api/litellm'
        : 'https://litellm.pods.tacc.tapis.io';

    let llmRaw = '';
    try {
      const sys = buildLLMSystemPrompt();
      const usr = buildLLMUserPrompt(userText, platform, models);
      llmRaw = await callLiteLLM(litellmEndpoint, sys, usr, context.jwt);
    } catch (e) {
      llmRaw = `LiteLLM error: ${formatAgentError(e)}`;
    }

    return {
      messages: [
        {
          id: `${Date.now()}-assistant-raw`,
          role: 'assistant',
          content: llmRaw || 'No response from model.',
        },
      ],
    };
  },
};

export default ModelSelectionAgent;
