export {
  AgentArtifactType,
  AgentDeploymentModality,
  AgentLiveness,
  MessageBinding,
  Visibility,
} from '@mlhub/agents-ts-sdk';

export type {
  Agent,
  AgentRecord,
  AgentProvider,
  AgentSkill,
  ArtifactLocator,
  Capabilities,
  CreateAgentBody,
  CreateAgentRecordBody,
  CreateAgentRecordResponse,
  CreateAgentResponse,
  Endpoint,
  ListAgentRecordsResponse,
  ListAgentsResponse,
  RestHttpAgentEndpoint,
  RestHttpAgentInterface,
  RestHttpLivenessProbe,
  RpcAgentEndpoint,
  RpcAgentInterface,
  StdioAgentEndpoint,
  StdioAgentInterface,
} from '@mlhub/agents-ts-sdk';

import type {
  Agent,
  AgentRecord,
  MessageBinding,
  RestHttpLivenessProbe,
} from '@mlhub/agents-ts-sdk';

export type Protocol = 'RestHttp' | 'Rpc' | 'Stdio';

export interface UnifiedEndpoint {
  name?: string | null;
  protocol: Protocol;
  message_binding?: MessageBinding;
  base_url?: string | null;
  liveness_probe?: RestHttpLivenessProbe;
}

export interface UnifiedInterface {
  name: string;
  protocol: Protocol;
  description?: string | null;
  message_binding?: MessageBinding;
  liveness_probe_config?: RestHttpLivenessProbe;
}

export const getAgentEndpoints = (agent: Agent): UnifiedEndpoint[] => {
  const endpoints: UnifiedEndpoint[] = [];
  if (agent.rest_http_endpoints) {
    agent.rest_http_endpoints.forEach((ep) => {
      endpoints.push({
        name: ep.name,
        protocol: 'RestHttp',
        message_binding: ep.message_binding,
        base_url: ep.base_url,
        liveness_probe: ep.liveness_probe,
      });
    });
  }
  if (agent.rpc_endpoints) {
    agent.rpc_endpoints.forEach((ep) => {
      endpoints.push({
        name: ep.name,
        protocol: 'Rpc',
        message_binding: ep.message_binding,
        base_url: ep.base_url,
      });
    });
  }
  if (agent.stdio_endpoints) {
    agent.stdio_endpoints.forEach((ep) => {
      endpoints.push({
        name: ep.name,
        protocol: 'Stdio',
        message_binding: ep.message_binding,
        base_url: ep.base_url,
      });
    });
  }
  return endpoints;
};

export const getRecordInterfaces = (
  record: AgentRecord
): UnifiedInterface[] => {
  const list: UnifiedInterface[] = [];
  if (record.rest_http_interfaces) {
    record.rest_http_interfaces.forEach((iface) => {
      list.push({
        name: iface.name,
        protocol: 'RestHttp',
        description: iface.description,
        message_binding: iface.message_binding,
        liveness_probe_config: iface.liveness_probe_config,
      });
    });
  }
  if (record.rpc_interfaces) {
    record.rpc_interfaces.forEach((iface) => {
      list.push({
        name: iface.name,
        protocol: 'Rpc',
        description: iface.description,
        message_binding: iface.message_binding,
      });
    });
  }
  if (record.stdio_interfaces) {
    record.stdio_interfaces.forEach((iface) => {
      list.push({
        name: iface.name,
        protocol: 'Stdio',
        description: iface.description,
        message_binding: iface.message_binding,
      });
    });
  }
  return list;
};

// Helpers & URN Generators
export const generateAgentUrn = (tenant_id: string, id: string): string => {
  return `urn:mlhub:v1:${tenant_id}:agent:${id}`;
};

export const generateAgentRecordUrn = (
  tenant_id: string,
  id: string
): string => {
  return `urn:mlhub:v1:${tenant_id}:agent_record:${id}`;
};

export const isLowerKebabCase = (val: string): boolean => {
  if (!val || val.trim() === '') return false;
  return val.split('-').every((segment) => /^[a-z0-9]+$/.test(segment));
};

const agentTypes = {
  getAgentEndpoints,
  getRecordInterfaces,
  generateAgentUrn,
  generateAgentRecordUrn,
  isLowerKebabCase,
};

export default agentTypes;
