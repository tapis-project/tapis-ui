import {
  Agent,
  AgentRecord,
  AgentArtifactType,
  AgentDeploymentModality,
  AgentLiveness,
  Endpoint,
  generateAgentUrn,
  MessageBinding,
  Visibility,
} from '../types/agent';
import { customAlphabet } from 'nanoid';
import { resolveMLHubBasePath } from '../../../../utils/resolveMLHubBasePath';

const createEndpointPrefix = customAlphabet(
  'abcdefghijklmnopqrstuvwxyz0123456789',
  10
);

const createPlatformEndpointUrl = () => {
  const mlHubUrl = new URL(resolveMLHubBasePath());
  mlHubUrl.hostname = `${createEndpointPrefix()}.endpoints.${
    mlHubUrl.hostname
  }`;
  return mlHubUrl.origin;
};

type MockPlatformEndpoint = Endpoint & { gateway_url: string };
type MockAgent = Omit<Agent, 'endpoints'> & {
  endpoints: MockPlatformEndpoint[];
};

export const CURRENT_TENANT_ID = 'tenant_enterprise_prod_882';
export const CURRENT_TENANT_NAME = 'Nexus Autonomous Cloud';
export const CURRENT_TENANT_TIER = 'Enterprise Isolated Sandbox';

export const INITIAL_AGENT_RECORDS: AgentRecord[] = [
  {
    id: '018f3a22-91cd-7100-b302-8f921ea0a112',
    tenant_id: CURRENT_TENANT_ID,
    name: 'rag-query-orchestrator',
    version: '2.4.0',
    owner: 'mlops-platform',
    description:
      'High-throughput RAG search orchestrator routing hybrid dense/sparse vector retrieval with contextual re-ranking.',
    visibility: Visibility.Public,
    icon_url: 'https://placehold.co/80x80/6366f1/ffffff?text=RAG',
    documentation_url: 'https://docs.nexus.internal/agents/rag-orchestrator',
    capabilities: {
      streaming: true,
      push_notifications: false,
    },
    default_input_modes: ['text/plain', 'application/json'],
    default_output_modes: ['application/json'],
    provider: {
      organization: 'Nexus Core Intelligence',
      url: 'https://nexus.ai/providers/core-intel',
    },
    artifact_locators: [
      {
        artifact_type: AgentArtifactType.DockerImage,
        url: 'ghcr.io/nexus-ai/rag-orchestrator:v2.4.0',
      },
      {
        artifact_type: AgentArtifactType.HelmChart,
        url: 'oci://registry.nexus.internal/charts/rag-orchestrator-2.4.0.tgz',
      },
      {
        artifact_type: AgentArtifactType.PythonPackage,
        url: 'pypi.nexus.internal/nexus-rag-orchestrator-2.4.0-py3-none-any.whl',
      },
    ],
    rest_http_interfaces: [
      {
        name: 'http-inbound',
        description:
          'Standard REST HTTP ingestion endpoint for synchronous search & async batch queries',
        message_binding: MessageBinding.HttpJson,
        liveness_probe_config: {
          route: '/healthz',
          interval_seconds: 15,
          timeout_seconds: 3,
          missed_heartbeat_threshold: 3,
          initial_delay_seconds: 20,
        },
      },
    ],
    rpc_interfaces: [
      {
        name: 'grpc-streaming',
        description:
          'High performance gRPC bidirectional streaming interface for chunk-by-chunk token emission',
        message_binding: MessageBinding.Grpc,
      },
    ],
    stdio_interfaces: [],
    skills: [
      {
        id: 'hybrid-vector-search',
        name: 'Hybrid Vector Search',
        description:
          'Executes BM25 keyword matching combined with HNSW cosine embedding search.',
        tags: ['retrieval', 'vector-db', 'semantic-search'],
        input_modes: ['text/plain', 'application/json'],
        output_modes: ['application/json'],
        examples: [
          'Find recent SEC 10-K disclosures mentioning quantum computing risks',
          'Retrieve HIPAA compliant audit records matching customer ID 8892',
        ],
      },
      {
        id: 'cross-encoder-rerank',
        name: 'Cross Encoder Reranking',
        description:
          'Applies neural rerankers to top-100 retrieved passages for maximum context precision.',
        tags: ['rerank', 'nlp', 'precision'],
        input_modes: ['application/json'],
        output_modes: ['application/json'],
        examples: ['Rerank retrieved chunks using bge-reranker-large model'],
      },
    ],
    tags: ['rag', 'vector-db', 'search', 'production', 'v2'],
  },
  {
    id: '018f3a25-c3f1-7922-a829-d5138bc9e443',
    tenant_id: CURRENT_TENANT_ID,
    name: 'cyber-threat-sentinel',
    version: '1.8.2',
    owner: 'secops-team',
    description:
      'Autonomous security triage agent monitoring VPC flow logs, unauthorized IAM escalations, and egress anomalies.',
    visibility: Visibility.Private,
    icon_url: 'https://placehold.co/80x80/f43f5e/ffffff?text=SEC',
    documentation_url: 'https://docs.nexus.internal/security/sentinel',
    capabilities: {
      streaming: false,
      push_notifications: true,
    },
    default_input_modes: ['application/json'],
    default_output_modes: ['application/json'],
    provider: {
      organization: 'Nexus Security Systems',
      url: 'https://nexus.ai/security',
    },
    artifact_locators: [
      {
        artifact_type: AgentArtifactType.DockerImage,
        url: 'ghcr.io/nexus-ai/threat-sentinel:1.8.2-arm64',
      },
      {
        artifact_type: AgentArtifactType.Binary,
        url: 's3://nexus-artifacts-sec/bin/sentinel-x86_64-linux-gnu-1.8.2',
      },
    ],
    rest_http_interfaces: [
      {
        name: 'sentinel-api',
        description:
          'REST API for incident alert triggering and manual threat remediation overrides',
        message_binding: MessageBinding.HttpJson,
        liveness_probe_config: {
          route: '/api/v1/health',
          interval_seconds: 10,
          timeout_seconds: 2,
          missed_heartbeat_threshold: 2,
          initial_delay_seconds: 10,
        },
      },
    ],
    rpc_interfaces: [
      {
        name: 'siem-jsonrpc',
        description:
          'JSON-RPC 2.0 integration for Splunk / Datadog webhook feeds',
        message_binding: MessageBinding.JsonRpc20,
      },
    ],
    stdio_interfaces: [],
    skills: [
      {
        id: 'anomaly-detection',
        name: 'VPC Anomaly Detection',
        description:
          'Calculates entropy and deviation across subnets in rolling 5-minute windows.',
        tags: ['security', 'network', 'ml-detector'],
        input_modes: ['application/json'],
        output_modes: ['application/json'],
        examples: [
          'Inspect egress traffic spike to unlisted external IP 198.51.100.44',
          'Audit IAM assume role actions for unexpected cross-region credentials',
        ],
      },
      {
        id: 'auto-quarantine',
        name: 'Auto Quarantine Resource',
        description:
          'Attaches restrictive security group to compromised EC2 instances or terminates rogue tokens.',
        tags: ['remediation', 'containment', 'zero-trust'],
        input_modes: ['application/json'],
        output_modes: ['application/json'],
        examples: [
          'Quarantine instance i-0abcd1234ef567890 after verified malware beacon',
        ],
      },
    ],
    tags: ['secops', 'siem', 'zero-trust', 'compliance', 'automated-response'],
  },
  {
    id: '018f3a29-00ab-7d43-9811-9a74284fa908',
    tenant_id: CURRENT_TENANT_ID,
    name: 'sql-db-query-copilot',
    version: '3.1.0',
    owner: 'data-engineering',
    description:
      'Natural language to optimized SQL transpiler with schema-aware validation, index hint generation, and semantic sanitization.',
    visibility: Visibility.Public,
    icon_url: 'https://placehold.co/80x80/06b6d4/ffffff?text=SQL',
    documentation_url: 'https://docs.nexus.internal/data/sql-copilot',
    capabilities: {
      streaming: true,
      push_notifications: false,
    },
    default_input_modes: ['text/plain'],
    default_output_modes: ['application/json'],
    provider: {
      organization: 'Nexus Data Platform',
      url: 'https://nexus.ai/data',
    },
    artifact_locators: [
      {
        artifact_type: AgentArtifactType.DockerImage,
        url: 'ghcr.io/nexus-ai/sql-copilot:3.1.0',
      },
      {
        artifact_type: AgentArtifactType.PythonPackage,
        url: 'pypi.nexus.internal/nexus-sql-copilot-3.1.0.tar.gz',
      },
    ],
    rest_http_interfaces: [
      {
        name: 'rest-gateway',
        description: 'REST API for IDE extensions (VS Code, Cursor, IntelliJ)',
        message_binding: MessageBinding.HttpJson,
        liveness_probe_config: {
          route: '/status',
          interval_seconds: 30,
          timeout_seconds: 5,
          missed_heartbeat_threshold: 4,
          initial_delay_seconds: 15,
        },
      },
    ],
    rpc_interfaces: [],
    stdio_interfaces: [
      {
        name: 'stdio-interface',
        description:
          'Standard IO protocol for local CLI / terminal pipeline integration',
      },
    ],
    skills: [
      {
        id: 'nl-to-sql',
        name: 'NL to Postgres SQL',
        description:
          'Translates human language questions into dialect-specific ANSI/Postgres SQL with EXPLAIN plan verification.',
        tags: ['sql', 'nlp', 'database', 'postgres'],
        input_modes: ['text/plain'],
        output_modes: ['application/sql', 'application/json'],
        examples: [
          'Calculate monthly recurring revenue churn segmented by enterprise vs self-serve plans in Q2',
          'Generate partitioned window query for top 5 purchasing users per country',
        ],
      },
    ],
    tags: ['analytics', 'sql', 'postgres', 'developer-tools'],
  },
  {
    id: '018f3a31-7e88-7512-bc09-4091aef11822',
    tenant_id: CURRENT_TENANT_ID,
    name: 'multimodal-doc-extractor',
    version: '1.2.5',
    owner: 'ml-research',
    description:
      'Vision-LLM agent for extracting structured schemas, nested tables, and handwritten signatures from scanned invoices and contracts.',
    visibility: Visibility.Private,
    icon_url: 'https://placehold.co/80x80/10b981/ffffff?text=OCR',
    documentation_url: 'https://docs.nexus.internal/vision/extractor',
    capabilities: {
      streaming: true,
      push_notifications: true,
    },
    default_input_modes: ['application/pdf', 'image/tiff'],
    default_output_modes: ['application/json'],
    provider: {
      organization: 'Nexus Vision Works',
      url: 'https://nexus.ai/vision',
    },
    artifact_locators: [
      {
        artifact_type: AgentArtifactType.DockerImage,
        url: 'ghcr.io/nexus-ai/doc-extractor:1.2.5-cuda12',
      },
      {
        artifact_type: AgentArtifactType.SourceCode,
        url: 'https://github.nexus.internal/ml-research/doc-extractor.git#v1.2.5',
      },
    ],
    rest_http_interfaces: [
      {
        name: 'doc-process-endpoint',
        description:
          'Multi-part form HTTP interface for binary PDF/TIFF upload & parse',
        message_binding: MessageBinding.HttpJson,
        liveness_probe_config: {
          route: '/ready',
          interval_seconds: 20,
          timeout_seconds: 4,
          missed_heartbeat_threshold: 3,
          initial_delay_seconds: 45,
        },
      },
    ],
    rpc_interfaces: [],
    stdio_interfaces: [],
    skills: [
      {
        id: 'table-structure-recognition',
        name: 'Complex Table Parsing',
        description:
          'Recognizes borderless and merged-cell tables, returning JSON/Markdown schema.',
        tags: ['vision', 'ocr', 'tables', 'document-ai'],
        input_modes: ['application/pdf', 'image/tiff'],
        output_modes: ['application/json', 'text/markdown'],
        examples: [
          'Extract line item billing matrix and tax subtotals from European VAT invoice',
        ],
      },
    ],
    tags: ['vision', 'ocr', 'documents', 'finance', 'gpu-accelerated'],
  },
];

export const INITIAL_AGENTS: MockAgent[] = [
  {
    id: '018f4001-7111-7ab3-9c88-1234567890ab',
    tenant_id: CURRENT_TENANT_ID,
    name: 'rag-query-orchestrator-prod-01',
    owner: 'mlops-platform',
    description:
      'Primary production RAG retriever instance serving customer-facing semantic search queries with P99 < 120ms latency.',
    deployment_modality: AgentDeploymentModality.Persistent,
    liveness: AgentLiveness.Alive,
    endpoints: [
      {
        id: '71d24a01-b941-4f12-8c4d-0e91a9c35201',
        slug: 'rag-query-orchestrator-prod-01-http-inbound',
        target_name: 'http-inbound',
        target_base_url: 'https://rag-prod-01.us-east-1.nexus.mesh:8443',
        gateway_url: createPlatformEndpointUrl(),
        target_resource_urn: generateAgentUrn(
          CURRENT_TENANT_ID,
          '018f4001-7111-7ab3-9c88-1234567890ab'
        ),
        tenant_id: CURRENT_TENANT_ID,
      },
      {
        id: '71d24a02-b941-4f12-8c4d-0e91a9c35202',
        slug: 'rag-query-orchestrator-prod-01-grpc-streaming',
        target_name: 'grpc-streaming',
        target_base_url: 'grpc://rag-prod-01.us-east-1.nexus.mesh:50051',
        gateway_url: createPlatformEndpointUrl(),
        target_resource_urn: generateAgentUrn(
          CURRENT_TENANT_ID,
          '018f4001-7111-7ab3-9c88-1234567890ab'
        ),
        tenant_id: CURRENT_TENANT_ID,
      },
    ],
    rest_http_endpoints: [
      {
        name: 'http-inbound',
        message_binding: MessageBinding.HttpJson,
        base_url: 'https://rag-prod-01.us-east-1.nexus.mesh:8443',
        liveness_probe: {
          route: '/healthz',
          interval_seconds: 15,
          timeout_seconds: 3,
          missed_heartbeat_threshold: 3,
          initial_delay_seconds: 20,
        },
      },
    ],
    rpc_endpoints: [
      {
        name: 'grpc-streaming',
        message_binding: MessageBinding.Grpc,
        base_url: 'grpc://rag-prod-01.us-east-1.nexus.mesh:50051',
      },
    ],
    stdio_endpoints: [],
    tags: ['production', 'us-east-1', 'rag', 'k8s-cluster-01', 'tier-0'],
    visibility: Visibility.Public,
    created_at: '2026-06-10T11:00:00Z',
    last_modified: '2026-08-25T16:42:10Z',
    agent_record_id: '018f3a22-91cd-7100-b302-8f921ea0a112',
    consecutive_missed_heartbeats: 0,
    last_missed_heartbeat: null,
  },
  {
    id: '018f4002-8222-7bc4-ad99-2345678901bc',
    tenant_id: CURRENT_TENANT_ID,
    name: 'rag-query-orchestrator-eu-west',
    owner: 'mlops-platform',
    description:
      'GDPR isolated European regional RAG search cluster servicing Frankfurt & Dublin endpoints.',
    deployment_modality: AgentDeploymentModality.Persistent,
    liveness: AgentLiveness.Alive,
    endpoints: [
      {
        id: '71d24a03-b941-4f12-8c4d-0e91a9c35203',
        slug: 'rag-query-orchestrator-eu-west-http-inbound',
        target_name: 'http-inbound',
        target_base_url: 'https://rag-eu-central.eu-west-1.nexus.mesh:8443',
        gateway_url: createPlatformEndpointUrl(),
        target_resource_urn: generateAgentUrn(
          CURRENT_TENANT_ID,
          '018f4002-8222-7bc4-ad99-2345678901bc'
        ),
        tenant_id: CURRENT_TENANT_ID,
      },
    ],
    rest_http_endpoints: [
      {
        name: 'http-inbound',
        message_binding: MessageBinding.HttpJson,
        base_url: 'https://rag-eu-central.eu-west-1.nexus.mesh:8443',
        liveness_probe: {
          route: '/healthz',
          interval_seconds: 15,
          timeout_seconds: 3,
          missed_heartbeat_threshold: 3,
          initial_delay_seconds: 20,
        },
      },
    ],
    rpc_endpoints: [],
    stdio_endpoints: [],
    tags: ['production', 'eu-west-1', 'gdpr', 'rag'],
    visibility: Visibility.Public,
    created_at: '2026-06-15T09:30:00Z',
    last_modified: '2026-08-25T18:10:05Z',
    agent_record_id: '018f3a22-91cd-7100-b302-8f921ea0a112',
    consecutive_missed_heartbeats: 0,
    last_missed_heartbeat: null,
  },
  {
    id: '018f4003-9333-7cd5-beaa-3456789012cd',
    tenant_id: CURRENT_TENANT_ID,
    name: 'cyber-sentinel-global-watch',
    owner: 'secops-team',
    description:
      'Always-on VPC perimeter daemon performing real-time SIEM correlation and token revocation.',
    deployment_modality: AgentDeploymentModality.Persistent,
    liveness: AgentLiveness.Alive,
    endpoints: [
      {
        id: '71d24a04-b941-4f12-8c4d-0e91a9c35204',
        slug: 'cyber-sentinel-global-watch-sentinel-api',
        target_name: 'sentinel-api',
        target_base_url: 'https://sentinel.internal.nexus.corp:9000',
        gateway_url: createPlatformEndpointUrl(),
        target_resource_urn: generateAgentUrn(
          CURRENT_TENANT_ID,
          '018f4003-9333-7cd5-beaa-3456789012cd'
        ),
        tenant_id: CURRENT_TENANT_ID,
      },
    ],
    rest_http_endpoints: [
      {
        name: 'sentinel-api',
        message_binding: MessageBinding.HttpJson,
        base_url: 'https://sentinel.internal.nexus.corp:9000',
        liveness_probe: {
          route: '/api/v1/health',
          interval_seconds: 10,
          timeout_seconds: 2,
          missed_heartbeat_threshold: 2,
          initial_delay_seconds: 10,
        },
      },
    ],
    rpc_endpoints: [],
    stdio_endpoints: [],
    tags: ['secops', 'siem', 'monitoring', 'active-defense'],
    visibility: Visibility.Private,
    created_at: '2026-05-01T12:00:00Z',
    last_modified: '2026-08-26T01:14:22Z',
    agent_record_id: '018f3a25-c3f1-7922-a829-d5138bc9e443',
    consecutive_missed_heartbeats: 0,
    last_missed_heartbeat: null,
  },
  {
    id: '018f4004-a444-7de6-cfbb-4567890123de',
    tenant_id: CURRENT_TENANT_ID,
    name: 'sql-copilot-dev-sandbox',
    owner: 'data-engineering',
    description:
      'Developer workspace agent for ad-hoc queries, automated schema introspection, and migration dry-runs.',
    deployment_modality: AgentDeploymentModality.OnDemand,
    liveness: AgentLiveness.Alive,
    endpoints: [
      {
        id: '71d24a05-b941-4f12-8c4d-0e91a9c35205',
        slug: 'sql-copilot-dev-sandbox-rest-gateway',
        target_name: 'rest-gateway',
        target_base_url: 'https://copilot-dev.sandbox.nexus.mesh:3000',
        gateway_url: createPlatformEndpointUrl(),
        target_resource_urn: generateAgentUrn(
          CURRENT_TENANT_ID,
          '018f4004-a444-7de6-cfbb-4567890123de'
        ),
        tenant_id: CURRENT_TENANT_ID,
      },
    ],
    rest_http_endpoints: [
      {
        name: 'rest-gateway',
        message_binding: MessageBinding.HttpJson,
        base_url: 'https://copilot-dev.sandbox.nexus.mesh:3000',
        liveness_probe: {
          route: '/status',
          interval_seconds: 30,
          timeout_seconds: 5,
          missed_heartbeat_threshold: 4,
          initial_delay_seconds: 15,
        },
      },
    ],
    rpc_endpoints: [],
    stdio_endpoints: [],
    tags: ['on-demand', 'sandbox', 'sql', 'dev-tools'],
    visibility: Visibility.Public,
    created_at: '2026-07-20T15:20:00Z',
    last_modified: '2026-08-24T19:00:00Z',
    agent_record_id: '018f3a29-00ab-7d43-9811-9a74284fa908',
    consecutive_missed_heartbeats: 0,
    last_missed_heartbeat: null,
  },
  {
    id: '018f4005-b555-7ef7-d0cc-5678901234ef',
    tenant_id: CURRENT_TENANT_ID,
    name: 'doc-extractor-batch-worker-gpu',
    owner: 'ml-research',
    description:
      'On-demand GPU cluster worker for quarterly contract auditing and financial ledger extraction.',
    deployment_modality: AgentDeploymentModality.OnDemand,
    liveness: AgentLiveness.Dead,
    endpoints: [
      {
        id: '71d24a06-b941-4f12-8c4d-0e91a9c35206',
        slug: 'doc-extractor-batch-worker-gpu-doc-process-endpoint',
        target_name: 'doc-process-endpoint',
        target_base_url: 'https://doc-worker-08.gpu.nexus.corp:8080',
        gateway_url: createPlatformEndpointUrl(),
        target_resource_urn: generateAgentUrn(
          CURRENT_TENANT_ID,
          '018f4005-b555-7ef7-d0cc-5678901234ef'
        ),
        tenant_id: CURRENT_TENANT_ID,
      },
    ],
    rest_http_endpoints: [
      {
        name: 'doc-process-endpoint',
        message_binding: MessageBinding.HttpJson,
        base_url: 'https://doc-worker-08.gpu.nexus.corp:8080',
        liveness_probe: {
          route: '/ready',
          interval_seconds: 20,
          timeout_seconds: 4,
          missed_heartbeat_threshold: 3,
          initial_delay_seconds: 45,
        },
      },
    ],
    rpc_endpoints: [],
    stdio_endpoints: [],
    tags: ['on-demand', 'gpu', 'vision', 'batch', 'offline'],
    visibility: Visibility.Private,
    created_at: '2026-08-01T10:00:00Z',
    last_modified: '2026-08-26T04:10:00Z',
    agent_record_id: '018f3a31-7e88-7512-bc09-4091aef11822',
    consecutive_missed_heartbeats: 5,
    last_missed_heartbeat: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: '018f4006-c666-7ff8-e1dd-6789012345fa',
    tenant_id: CURRENT_TENANT_ID,
    name: 'custom-cli-stdio-bridge',
    owner: 'platform-core',
    description:
      'Local development pipe bridge using standard input/output protocol without a remote REST host.',
    deployment_modality: AgentDeploymentModality.OnDemand,
    liveness: AgentLiveness.Alive,
    endpoints: [
      {
        id: '71d24a07-b941-4f12-8c4d-0e91a9c35207',
        slug: 'custom-cli-stdio-bridge-local-stdio',
        target_name: 'local-stdio',
        target_base_url: 'stdio://process.pipe',
        gateway_url: createPlatformEndpointUrl(),
        target_resource_urn: generateAgentUrn(
          CURRENT_TENANT_ID,
          '018f4006-c666-7ff8-e1dd-6789012345fa'
        ),
        tenant_id: CURRENT_TENANT_ID,
      },
    ],
    rest_http_endpoints: [],
    rpc_endpoints: [],
    stdio_endpoints: [
      {
        name: 'local-stdio',
      },
    ],
    tags: ['stdio', 'cli', 'local-pipe', 'debugging'],
    visibility: Visibility.Private,
    created_at: '2026-08-10T14:15:00Z',
    last_modified: '2026-08-25T11:20:00Z',
    agent_record_id: null,
    consecutive_missed_heartbeats: 0,
    last_missed_heartbeat: null,
  },
];

const mockData = {
  CURRENT_TENANT_ID,
  CURRENT_TENANT_NAME,
  CURRENT_TENANT_TIER,
  INITIAL_AGENT_RECORDS,
  INITIAL_AGENTS,
};

export default mockData;
