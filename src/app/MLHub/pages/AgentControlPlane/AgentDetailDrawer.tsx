import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Stack,
  IconButton,
  Chip,
  Button,
  Paper,
  Grid,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SensorsIcon from '@mui/icons-material/Sensors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TerminalIcon from '@mui/icons-material/Terminal';
import LinkIcon from '@mui/icons-material/Link';
import LanIcon from '@mui/icons-material/Lan';
import CodeIcon from '@mui/icons-material/Code';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Agent,
  AgentRecord,
  AgentLiveness,
  Endpoint,
  generateAgentUrn,
  generateAgentRecordUrn,
  getAgentEndpoints,
} from '../types/agent';
import { useListAgentRecords } from '../hooks/useListAgentRecords';
import { agentControlPlaneColors, lightSurfaceBorder } from './uiTokens';

interface AgentDetailDrawerProps {
  open: boolean;
  agent: Agent | null;
  linkedRecord?: AgentRecord;
  onClose: () => void;
  onProbeAgent: (agentId: string) => void;
  onToggleLiveness: (agentId: string) => void;
  onOpenPlayground: (agent: Agent) => void;
}

type DisplayPlatformEndpoint = Endpoint & { gateway_url?: string };

const getGatewayUrl = (endpoint: Endpoint) =>
  (endpoint as DisplayPlatformEndpoint).gateway_url ??
  `https://gateway.nexus.mesh/api/v1/tenants/${endpoint.tenant_id}/endpoints/${endpoint.slug}`;

export const AgentDetailDrawer: React.FC<AgentDetailDrawerProps> = ({
  open,
  agent,
  linkedRecord: propLinkedRecord,
  onClose,
  onProbeAgent,
  onToggleLiveness,
  onOpenPlayground,
}) => {
  const { getRecordById } = useListAgentRecords();
  const linkedRecord =
    propLinkedRecord ??
    (agent?.agent_record_id ? getRecordById(agent.agent_record_id) : undefined);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [snippetTab, setSnippetTab] = useState<Record<string, number>>({});
  const [expandedProbes, setExpandedProbes] = useState<Record<string, boolean>>(
    {}
  );

  const toggleProbe = (endpointKey: string) => {
    setExpandedProbes((prev) => ({
      ...prev,
      [endpointKey]: !prev[endpointKey],
    }));
  };

  if (!agent) return null;

  const urn = generateAgentUrn(agent.tenant_id, agent.id);
  const isAlive = agent.liveness === AgentLiveness.Alive;
  const targetEndpoints = getAgentEndpoints(agent);

  // Platform endpoints fallback computation if empty
  const platformEndpoints: Endpoint[] =
    agent.endpoints && agent.endpoints.length > 0
      ? agent.endpoints
      : targetEndpoints.map((te, idx) => {
          const targetName = te.name || `endpoint-${idx + 1}`;
          return {
            id: crypto.randomUUID(),
            slug: `${agent.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')}-${targetName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')}`,
            target_name: targetName,
            target_base_url: te.base_url || 'https://mesh.nexus.internal',
            target_resource_urn: urn,
            tenant_id: agent.tenant_id,
          };
        });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getActiveTab = (epId: string) => snippetTab[epId] ?? 0;
  const handleTabChange = (epId: string, newValue: number) => {
    setSnippetTab((prev) => ({ ...prev, [epId]: newValue }));
  };

  const getCurlSnippet = (ep: Endpoint) => {
    const gatewayUrl = getGatewayUrl(ep);
    return `curl -X POST "${gatewayUrl}" \\
  -H "X-Tapis-Token: $JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "Execute task query with context...",
    "parameters": {
      "stream": true,
      "timeout_ms": 15000
    }
  }'`;
  };

  const getTsSnippet = (ep: Endpoint) => {
    const gatewayUrl = getGatewayUrl(ep);
    return `import { AgentsClient } from '@mlhub/agents-ts-sdk'

const client = new AgentsClient({
  baseUrl: '${gatewayUrl}',
  headers: {
    'X-Tapis-Token': JWT,
  },
})

// Invoke agent through platform endpoint slug: '${ep.slug}'
const result = await client.invokeEndpoint({
  endpointSlug: '${ep.slug}',
  body: {
    input: 'Execute task query with context...',
    parameters: { stream: true },
  },
})

console.log('Agent output:', result.data)`;
  };

  const getGrpcSnippet = (ep: Endpoint) => {
    return `grpcurl -H "X-Tapis-Token: $JWT" \\
  -H "X-Endpoint-Slug: ${ep.slug}" \\
  -d '{"target_resource_urn": "${ep.target_resource_urn}", "payload": "..."}' \\
  gateway.nexus.mesh:50051 \\
  mlhub.agent.v1.AgentService/InvokeStream`;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 640, md: 780, lg: 880 },
            maxWidth: '100vw',
            bgcolor: agentControlPlaneColors.surface,
            borderLeft: lightSurfaceBorder,
            p: 0,
          },
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2.5,
          bgcolor: agentControlPlaneColors.mutedSurface,
          borderBottom: lightSurfaceBorder,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: isAlive ? '#10b981' : '#f43f5e',
              boxShadow: isAlive ? '0 0 10px #10b981' : '0 0 10px #f43f5e',
            }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {agent.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Instance ID: {agent.id}
            </Typography>
          </Box>
        </Stack>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Drawer Body */}
      <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
        {/* Liveness & Modality Banner */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            bgcolor: isAlive
              ? 'rgba(16, 185, 129, 0.05)'
              : 'rgba(244, 63, 94, 0.05)',
            borderColor: isAlive
              ? 'rgba(16, 185, 129, 0.25)'
              : 'rgba(244, 63, 94, 0.25)',
            borderRadius: 2,
          }}
        >
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {isAlive ? (
                <CheckCircleIcon sx={{ color: '#10b981', fontSize: 24 }} />
              ) : (
                <CancelIcon sx={{ color: '#f43f5e', fontSize: 24 }} />
              )}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: isAlive ? '#34d399' : '#fb7185',
                  }}
                >
                  Liveness: {agent.liveness.toUpperCase()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Modality: {agent.deployment_modality} • Visibility:{' '}
                  {agent.visibility}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<SensorsIcon />}
                onClick={() => onProbeAgent(agent.id)}
                sx={{
                  fontSize: '0.75rem',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                Probe
              </Button>
              <Button
                variant="contained"
                size="small"
                color={isAlive ? 'error' : 'success'}
                onClick={() => onToggleLiveness(agent.id)}
                sx={{ fontSize: '0.75rem' }}
              >
                {isAlive ? 'Kill Instance' : 'Start / Heal'}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* URN Section */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              display: 'block',
              mb: 0.5,
            }}
          >
            CANONICAL AGENT URN
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              bgcolor: agentControlPlaneColors.mutedSurface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.8rem',
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontFamily: 'inherit', color: 'primary.light' }}
            >
              {urn}
            </Typography>
            <Tooltip title={copiedKey === 'agent_urn' ? 'Copied!' : 'Copy URN'}>
              <IconButton
                size="small"
                onClick={() => copyToClipboard(urn, 'agent_urn')}
              >
                {copiedKey === 'agent_urn' ? (
                  <CheckIcon sx={{ fontSize: 15, color: '#10b981' }} />
                ) : (
                  <ContentCopyIcon sx={{ fontSize: 15 }} />
                )}
              </IconButton>
            </Tooltip>
          </Paper>
        </Box>

        {/* Metadata Details */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block' }}
            >
              Owner
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {agent.owner}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block' }}
            >
              Tenant ID
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.8rem',
              }}
            >
              {agent.tenant_id}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block' }}
            >
              Created At
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
              {new Date(agent.created_at).toLocaleString()}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block' }}
            >
              Last Modified
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
              {new Date(agent.last_modified).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>

        {/* Description */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              display: 'block',
              mb: 0.5,
            }}
          >
            DESCRIPTION
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.primary', lineHeight: 1.6 }}
          >
            {agent.description}
          </Typography>
        </Box>

        {/* Platform Ingress Endpoints Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.5,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <LanIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Platform Ingress Endpoints (
                <Box
                  component="code"
                  sx={{ fontFamily: 'monospace', color: 'primary.light' }}
                >
                  endpoints
                </Box>
                )
              </Typography>
              <Chip
                label={`${platformEndpoints.length} Active`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.675rem', fontWeight: 700 }}
              />
            </Stack>
            <Chip
              icon={<AltRouteIcon sx={{ fontSize: '13px !important' }} />}
              label="API Gateway Routed"
              size="small"
              sx={{
                bgcolor: 'rgba(16, 185, 129, 0.12)',
                color: '#34d399',
                fontSize: '0.675rem',
                height: 20,
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            />
          </Box>

          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 2,
              bgcolor: 'rgba(99, 102, 241, 0.04)',
              borderColor: 'rgba(99, 102, 241, 0.2)',
              borderRadius: 1.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                lineHeight: 1.5,
              }}
            >
              The platform exposes these unified gateway endpoints to allow
              applications, SDKs, and automated workflows to securely make
              requests to this agent through the platform infrastructure with
              integrated authentication and load balancing.
            </Typography>
          </Paper>

          <Stack spacing={2.5}>
            {platformEndpoints.map((ep, idx) => {
              const gatewayUrl = getGatewayUrl(ep);
              const isGrpc =
                ep.slug.includes('grpc') || ep.target_name.includes('grpc');
              const isStdio =
                ep.slug.includes('stdio') || ep.target_name.includes('stdio');
              const protocolLabel = isGrpc
                ? 'gRPC Protobuf (HTTP/2)'
                : isStdio
                ? 'Stdio Pipe Stream'
                : 'REST HTTP/1.1 & HTTP/2';
              const protocolColor = isGrpc
                ? '#a855f7'
                : isStdio
                ? '#eab308'
                : '#38bdf8';
              const curTab = getActiveTab(ep.id);

              return (
                <Paper
                  key={ep.id || idx}
                  variant="outlined"
                  sx={{
                    p: 2.25,
                    bgcolor: 'rgba(255, 255, 255, 0.025)',
                    borderColor: 'rgba(99, 102, 241, 0.25)',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {/* Platform Endpoint Header */}
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1.5,
                    }}
                  >
                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center', mb: 0.5 }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, color: 'text.primary' }}
                        >
                          {ep.slug}
                        </Typography>
                        <Tooltip
                          title={
                            copiedKey === `slug-${ep.id}`
                              ? 'Copied!'
                              : 'Copy Slug'
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              copyToClipboard(ep.slug, `slug-${ep.id}`)
                            }
                            sx={{ p: 0.25 }}
                          >
                            {copiedKey === `slug-${ep.id}` ? (
                              <CheckIcon
                                sx={{ fontSize: 13, color: '#10b981' }}
                              />
                            ) : (
                              <ContentCopyIcon sx={{ fontSize: 13 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontFamily: 'monospace',
                        }}
                      >
                        Endpoint ID: {ep.id}
                      </Typography>
                    </Box>

                    <Chip
                      label={protocolLabel}
                      size="small"
                      sx={{
                        bgcolor: `${protocolColor}18`,
                        color: protocolColor,
                        border: `1px solid ${protocolColor}40`,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        height: 22,
                      }}
                    />
                  </Stack>

                  {/* Primary Platform Invocation Address */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      PLATFORM GATEWAY REQUEST ADDRESS (URL)
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.25,
                        bgcolor: agentControlPlaneColors.mutedSurface,
                        border: '1px solid #cbd5e1',
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: '"JetBrains Mono", monospace',
                          color: '#38bdf8',
                          wordBreak: 'break-all',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      >
                        {gatewayUrl}
                      </Typography>
                      <Tooltip
                        title={
                          copiedKey === `url-${ep.id}`
                            ? 'Copied!'
                            : 'Copy Platform URL'
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            copyToClipboard(gatewayUrl, `url-${ep.id}`)
                          }
                          sx={{ ml: 1, color: 'text.secondary' }}
                        >
                          {copiedKey === `url-${ep.id}` ? (
                            <CheckIcon
                              sx={{ fontSize: 15, color: '#10b981' }}
                            />
                          ) : (
                            <ContentCopyIcon sx={{ fontSize: 15 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Paper>
                  </Box>

                  {/* Platform Routing Metadata Grid */}
                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: 1,
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: 'block',
                            fontSize: '0.675rem',
                          }}
                        >
                          Target Interface Name:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: 'text.primary' }}
                        >
                          {ep.target_name}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: 1,
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: 'block',
                            fontSize: '0.675rem',
                          }}
                        >
                          Target Base URL:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            color: 'secondary.light',
                            fontSize: '0.72rem',
                            wordBreak: 'break-all',
                          }}
                        >
                          {ep.target_base_url}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: 1,
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: 'block',
                            fontSize: '0.675rem',
                          }}
                        >
                          Target Resource URN:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            color: 'primary.light',
                            fontSize: '0.72rem',
                            wordBreak: 'break-all',
                          }}
                        >
                          {ep.target_resource_urn}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Code Request Snippets & Instructions */}
                  <Box
                    sx={{
                      bgcolor: agentControlPlaneColors.mutedSurface,
                      borderRadius: 1.5,
                      border: lightSurfaceBorder,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        borderBottom: lightSurfaceBorder,
                        bgcolor: agentControlPlaneColors.surface,
                        px: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Tabs
                        value={curTab}
                        onChange={(_, v) => handleTabChange(ep.id, v)}
                        textColor="inherit"
                        sx={{
                          minHeight: 32,
                          '& .MuiTab-root': {
                            minHeight: 32,
                            py: 0.5,
                            px: 1.5,
                            fontSize: '0.72rem',
                            textTransform: 'none',
                            color: 'text.secondary',
                            '&.Mui-selected': {
                              color: 'primary.light',
                              fontWeight: 600,
                            },
                          },
                        }}
                      >
                        <Tab label="cURL Request" />
                        <Tab label="TypeScript SDK" />
                        {isGrpc && <Tab label="gRPC (grpcurl)" />}
                      </Tabs>

                      <Tooltip
                        title={
                          copiedKey === `code-${ep.id}-${curTab}`
                            ? 'Copied Code!'
                            : 'Copy Code Snippet'
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() => {
                            let text = getCurlSnippet(ep);
                            if (curTab === 1) text = getTsSnippet(ep);
                            else if (curTab === 2) text = getGrpcSnippet(ep);
                            copyToClipboard(text, `code-${ep.id}-${curTab}`);
                          }}
                          sx={{ color: 'text.secondary', p: 0.5 }}
                        >
                          {copiedKey === `code-${ep.id}-${curTab}` ? (
                            <CheckIcon
                              sx={{ fontSize: 14, color: '#10b981' }}
                            />
                          ) : (
                            <CodeIcon sx={{ fontSize: 14 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: agentControlPlaneColors.codeSurface,
                      }}
                    >
                      <pre
                        style={{
                          margin: 0,
                          padding: 0,
                          fontFamily:
                            '"JetBrains Mono", "Fira Code", monospace',
                          fontSize: '0.72rem',
                          color: '#e2e8f0',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}
                      >
                        {curTab === 0 && getCurlSnippet(ep)}
                        {curTab === 1 && getTsSnippet(ep)}
                        {curTab === 2 && getGrpcSnippet(ep)}
                      </pre>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

        {/* Target Backend Interfaces & Liveness Probes Breakdown */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              mb: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <SensorsIcon sx={{ fontSize: 18, color: 'secondary.light' }} />
            Direct Target Interfaces & Probes ({targetEndpoints.length})
          </Typography>

          <Stack spacing={2}>
            {targetEndpoints.map((endpoint, idx) => (
              <Paper
                key={idx}
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 2,
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {endpoint.name || `endpoint-${idx + 1}`}
                    </Typography>
                    <Chip
                      label={endpoint.protocol}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(99, 102, 241, 0.15)',
                        color: '#818cf8',
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                    {endpoint.message_binding && (
                      <Chip
                        label={endpoint.message_binding}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(6, 182, 212, 0.15)',
                          color: '#22d3ee',
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                    )}
                  </Stack>
                </Stack>

                {endpoint.base_url && (
                  <Box sx={{ mt: 1, mb: 1.5 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      Instance Host Base URL
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: 'secondary.light',
                        wordBreak: 'break-all',
                        fontSize: '0.75rem',
                      }}
                    >
                      {endpoint.base_url}
                    </Typography>
                  </Box>
                )}

                {/* Liveness Probe Config if Present */}
                {endpoint.liveness_probe ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      bgcolor: agentControlPlaneColors.mutedSurface,
                      borderColor: expandedProbes[
                        `probe-${agent.id}-${endpoint.name || idx}`
                      ]
                        ? 'rgba(99, 102, 241, 0.3)'
                        : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    <Box
                      component="button"
                      type="button"
                      onClick={() =>
                        toggleProbe(`probe-${agent.id}-${endpoint.name || idx}`)
                      }
                      sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.25,
                        bgcolor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'inherit',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.03)',
                        },
                      }}
                      aria-expanded={
                        !!expandedProbes[
                          `probe-${agent.id}-${endpoint.name || idx}`
                        ]
                      }
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 0.5,
                        }}
                      >
                        <SensorsIcon
                          sx={{ fontSize: 15, color: 'primary.light' }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: 'primary.light' }}
                        >
                          Liveness Probe Configuration
                        </Typography>
                        <Chip
                          label={endpoint.liveness_probe.route}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            bgcolor: 'rgba(99, 102, 241, 0.12)',
                            color: 'primary.light',
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        />
                        <Chip
                          label={`${endpoint.liveness_probe.interval_seconds}s interval`}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            color: 'text.secondary',
                          }}
                        />
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ alignItems: 'center' }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontSize: '0.675rem', color: 'text.secondary' }}
                        >
                          {expandedProbes[
                            `probe-${agent.id}-${endpoint.name || idx}`
                          ]
                            ? 'Hide'
                            : 'Show details'}
                        </Typography>
                        <ExpandMoreIcon
                          sx={{
                            fontSize: 16,
                            color: 'text.secondary',
                            transform: expandedProbes[
                              `probe-${agent.id}-${endpoint.name || idx}`
                            ]
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      </Stack>
                    </Box>

                    <Collapse
                      in={
                        !!expandedProbes[
                          `probe-${agent.id}-${endpoint.name || idx}`
                        ]
                      }
                    >
                      <Divider
                        sx={{ borderColor: agentControlPlaneColors.border }}
                      />
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: agentControlPlaneColors.mutedSurface,
                        }}
                      >
                        <Grid container spacing={1.5}>
                          <Grid size={{ xs: 6 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', display: 'block' }}
                            >
                              Probe Route:
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontWeight: 600,
                              }}
                            >
                              {endpoint.liveness_probe.route}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', display: 'block' }}
                            >
                              Heartbeat Interval:
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600 }}
                            >
                              {endpoint.liveness_probe.interval_seconds}s
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', display: 'block' }}
                            >
                              Timeout:
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600 }}
                            >
                              {endpoint.liveness_probe.timeout_seconds}s
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', display: 'block' }}
                            >
                              Missed Threshold:
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, color: 'error.light' }}
                            >
                              {
                                endpoint.liveness_probe
                                  .missed_heartbeat_threshold
                              }{' '}
                              missed
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', display: 'block' }}
                            >
                              Initial Delay (Model Initialization):
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600 }}
                            >
                              {endpoint.liveness_probe.initial_delay_seconds}s
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </Paper>
                ) : (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      display: 'block',
                      mt: 0.5,
                    }}
                  >
                    No automated liveness probe configured (evaluated
                    on-demand).
                  </Typography>
                )}
              </Paper>
            ))}
          </Stack>
        </Box>

        {/* Linked Agent Record Blueprint */}
        {linkedRecord && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <LinkIcon sx={{ fontSize: 18, color: 'primary.light' }} />
              Instantiated from Blueprint Record
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: 'rgba(99, 102, 241, 0.04)',
                borderColor: 'rgba(99, 102, 241, 0.2)',
                borderRadius: 2,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', mb: 1 }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {linkedRecord.name}
                </Typography>
                <Chip
                  label={`v${linkedRecord.version}`}
                  size="small"
                  sx={{ fontSize: '0.675rem', height: 20 }}
                />
              </Stack>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}
              >
                URN:{' '}
                {generateAgentRecordUrn(
                  linkedRecord.tenant_id,
                  linkedRecord.id
                )}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  display: 'block',
                  mb: 0.5,
                }}
              >
                INCLUDED SKILLS:
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ flexWrap: 'wrap', gap: 0.5 }}
              >
                {linkedRecord.skills.map((skill) => (
                  <Chip
                    key={skill.id}
                    label={skill.name}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 22 }}
                  />
                ))}
              </Stack>
            </Paper>
          </Box>
        )}

        {/* Tags */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              display: 'block',
              mb: 0.5,
            }}
          >
            TAGS
          </Typography>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ flexWrap: 'wrap', gap: 0.5 }}
          >
            {agent.tags.map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  fontSize: '0.7rem',
                }}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Drawer Footer Action */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: 1.5,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          startIcon={<TerminalIcon />}
          onClick={() => onOpenPlayground(agent)}
          sx={{
            py: 1,
            fontWeight: 600,
          }}
        >
          Open Test Console / Playground
        </Button>
      </Box>
    </Drawer>
  );
};

export default AgentDetailDrawer;
