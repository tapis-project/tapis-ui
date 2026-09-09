export type HostedEndpointFlavor = 'openai' | 'openwebui' | 'tapisagent';
/** Which connect-snippet family the usage examples come from. */
export type HostedRecipeKind = 'litellm' | 'tapisagent' | 'rag';

/**
 * One always-on hosted AI endpoint (LiteLLM proxy, RAG service, …) the
 * AI Hub offers as a chat target. The app ships a base catalog;
 * an extension can contribute or override entries per deployment via
 * `Configuration.hostedEndpoints` (merged by id, extension wins).
 */
export interface HostedEndpointEntry {
  /** Stable key, e.g. 'litellm' */
  id: string;
  /** e.g. 'https://litellm.pods.tacc.tapis.io' (no path suffix) */
  baseUrl: string;
  /** short display label, e.g. 'LiteLLM (hosted)' */
  label: string;
  /** default model sent in requests */
  model: string;
  /** chat completions path; OpenWebUI uses /api/chat/completions */
  chatPath?: string;
  /** explicit API shape; inferred from chatPath when omitted */
  flavor?: HostedEndpointFlavor;
  /** kind line for the services table, e.g. 'litellm proxy (hosted)' */
  kindLabel?: string;
  /** details-row copy */
  description?: string;
  recipeKind?: HostedRecipeKind;
}
