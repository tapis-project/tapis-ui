import { Agent, AgentContext, AgentResult, ChatTurn } from './types';
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
    mlHubBasePath + '/mlhub' || '',
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

function buildLLMUserPrompt(
  requirements: string,
  platform: string,
  models: ModelLite[]
): string {
  const compact = models.slice(0, 100).map((m) => ({
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
    `Available models (JSON array):\n${JSON.stringify(compact)}\n\n` +
    'Respond ONLY with the JSON object.'
  );
}

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  try {
    const mod = await import('openai');
    const OpenAI = (mod as any).default || (mod as any);
    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
    });
    const content: string = completion?.choices?.[0]?.message?.content ?? '';
    return content;
  } catch (e) {
    throw new Error(`OpenAI error: ${e}`);
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

    // Require OpenAI; no fallback
    if (!context.openAIApiKey || context.openAIApiKey.trim().length === 0) {
      return {
        messages: [
          {
            id: `${Date.now()}-assistant`,
            role: 'assistant',
            content: 'failed',
          },
        ],
      };
    }

    let selected: ModelLite[] = [];
    let llmRaw: string = '';
    let parsedOk = false;
    try {
      const sys = buildLLMSystemPrompt();
      const usr = buildLLMUserPrompt(userText, platform, models);
      const content = await callOpenAI(context.openAIApiKey, sys, usr);
      llmRaw = content || '';
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.recommendations)) {
        parsedOk = parsed.recommendations.length > 0;
        const idToModel = new Map(models.map((m) => [normalizeModelId(m), m]));
        selected = parsed.recommendations
          .map((r: any) => idToModel.get(String(r.id)))
          .filter((m: any) => !!m);
      }
    } catch (e) {
      // fall through; will send raw content then failed
    }

    const messagesOut: ChatTurn[] = [];
    messagesOut.push({
      id: `${Date.now()}-assistant-raw`,
      role: 'assistant',
      content: llmRaw || '',
    });

    if (!selected || selected.length === 0) {
      //   if (parsedOk) {
      //     messagesOut.push({
      //       id: `${Date.now()}-assistant-nomatch`,
      //       role: "assistant",
      //       content:
      //         "No listed models matched the IDs returned by the LLM. Try refining your request or switching platform.",
      //     });
      //     return { messages: messagesOut };
      //   } else {
      //     messagesOut.push({
      //       id: `${Date.now()}-assistant-failed`,
      //       role: "assistant",
      //       content: "failed",
      //     });
      //     return { messages: messagesOut };
      //   }
    }

    const finalModels = selected.slice(0, 5);

    const lines = finalModels.map((m, i) => {
      const id = normalizeModelId(m);
      const name = m.name || id || 'Unknown';
      const tag = m.pipeline_tag || 'n/a';
      const lib = m.library_name || 'n/a';
      return `${i + 1}. ${name} (id: ${id}, pipeline: ${tag}, lib: ${lib})`;
    });

    // messagesOut.push({
    //   id: `${Date.now()}-assistant-summary`,
    //   role: "assistant",
    //   content:
    //     lines.length > 0
    //       ? `Here are the top candidates on ${platform} based on your requirements:\n\n${lines.join(
    //           "\n"
    //         )}`
    //       : `I could not find relevant models on ${platform}. Try adjusting your requirements (e.g., task/pipeline tag or library).`,
    // });

    return { messages: messagesOut, data: { platform, models: finalModels } };
  },
};

export default ModelSelectionAgent;
