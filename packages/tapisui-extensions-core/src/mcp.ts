export type McpAuth = 'none' | 'tapis-token';
export type McpTransport = 'http' | 'stdio';
export type McpStatus = 'available' | 'not-yet-deployed' | 'coming-soon';

/**
 * One MCP server the AI Hub knows about. The app ships a base
 * registry; an extension can contribute or override entries per deployment
 * via `Configuration.mcpServers` (merged by id, extension wins).
 */
export interface McpServerEntry {
  /** Stable key; also the default server name in `claude mcp add <id> ...` */
  id: string;
  name: string;
  description: string;
  /** e.g. 'FastMCP / Python' — display only */
  stack?: string;
  auth?: McpAuth;
  transport?: McpTransport;
  /** undefined ⇒ not deployed anywhere yet */
  endpointUrl?: string;
  repoUrl?: string;
  docsUrl?: string;
  status: McpStatus;
  notes?: string;
  /**
   * Tapis tenant hosting the endpoint (e.g. 'icicleai'). Out-of-tenant
   * entries can't get user/perm or CORS checks from this session — only a
   * browser reachability probe.
   */
  tenant?: string;
  /**
   * Code default for whether this browser probes/advertises the entry
   * (admin panel can override per-browser). Falls back to
   * status === 'available'.
   */
  defaultActive?: boolean;
  /** Rendered only in podsAdminMode, as a dashed "ghost" card. */
  adminOnly?: boolean;
  /**
   * This server exposes a graph the UI can visualize (a GraphSource adapter
   * exists for its id) — surfaces a "graph" button on its table row.
   */
  graphViz?: boolean;
  /** Admin-layer bullets: what's broken/missing and how to fix it. */
  adminNotes?: string[];
}
