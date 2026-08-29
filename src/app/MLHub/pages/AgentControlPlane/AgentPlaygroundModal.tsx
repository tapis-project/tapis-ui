import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Chip,
  IconButton,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SensorsIcon from '@mui/icons-material/Sensors';
import {
  Agent,
  AgentRecord,
  AgentLiveness,
  generateAgentUrn,
  getAgentEndpoints,
} from '../types/agent';
import { useListAgentRecords } from '../hooks/useListAgentRecords';
import { agentControlPlaneColors, lightSurfaceBorder } from './uiTokens';

interface AgentPlaygroundModalProps {
  open: boolean;
  agent: Agent | null;
  linkedRecord?: AgentRecord;
  onClose: () => void;
  onProbeAgent: (agentId: string) => void;
}

export const AgentPlaygroundModal: React.FC<AgentPlaygroundModalProps> = ({
  open,
  agent,
  linkedRecord: propLinkedRecord,
  onClose,
  onProbeAgent,
}) => {
  const { getRecordById } = useListAgentRecords();
  const linkedRecord =
    propLinkedRecord ??
    (agent?.agent_record_id ? getRecordById(agent.agent_record_id) : undefined);
  const [tabIndex, setTabIndex] = useState(0);
  const [prompt, setPrompt] = useState(
    'Analyze query logs for any unusual spike in egress bandwidth in the last 15 minutes.'
  );
  const [jsonPayload, setJsonPayload] = useState(
    JSON.stringify(
      {
        action: 'execute_skill',
        context: {
          tenant_id: agent?.tenant_id || '',
          timeout_ms: 5000,
        },
        parameters: {
          mode: 'hybrid_retrieval',
          top_k: 5,
        },
      },
      null,
      2
    )
  );

  const [isLoading, setIsLoading] = useState(false);
  const [responseLog, setResponseLog] = useState<string | null>(null);
  const [responseMetadata, setResponseMetadata] = useState<{
    latencyMs: number;
    statusCode: number;
    tokensGenerated: number;
  } | null>(null);

  if (!agent) return null;

  const urn = generateAgentUrn(agent.tenant_id, agent.id);
  const endpoints = getAgentEndpoints(agent);
  const mainEndpoint = endpoints[0];
  const isAlive = agent.liveness === AgentLiveness.Alive;

  const handleExecute = () => {
    setIsLoading(true);
    setResponseLog(null);
    setResponseMetadata(null);

    setTimeout(() => {
      setIsLoading(false);
      const latency = Math.floor(Math.random() * 80) + (isAlive ? 35 : 1200);

      if (!isAlive) {
        setResponseLog(
          JSON.stringify(
            {
              error: 'AgentUnavailableException',
              code: 503,
              message: `Target endpoint connection failed. Instance ${agent.name} is currently in Dead state or failed heartbeat evaluation.`,
              agent_urn: urn,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )
        );
        setResponseMetadata({
          latencyMs: latency,
          statusCode: 503,
          tokensGenerated: 0,
        });
        return;
      }

      const skillName =
        linkedRecord?.skills[0]?.name || 'Autonomous Task Executor';
      const output = {
        agent_id: agent.id,
        agent_urn: urn,
        status: 'SUCCESS',
        protocol_used: mainEndpoint?.protocol || 'RestHttp',
        message_binding: mainEndpoint?.message_binding || 'HttpJson',
        execution_summary: {
          skill_invoked: skillName,
          query: prompt,
          tenant_context: agent.tenant_id,
          completed_at: new Date().toISOString(),
          decision_path: [
            '1. Validated IAM authorization in tenant sandbox',
            '2. Ingested query and applied tokenizer',
            '3. Executed internal model inference pipeline',
            '4. Formatted structured output schema',
          ],
        },
        payload_result: {
          matched_records: 3,
          confidence_score: 0.984,
          findings: [
            'Subnet us-east-1a: egress bandwidth within nominal baseline (14.2 MB/s).',
            'No anomalous outbound connections detected to unregistered CIDR blocks.',
            'Vector index alignment verified against primary knowledge store.',
          ],
        },
      };

      setResponseLog(JSON.stringify(output, null, 2));
      setResponseMetadata({
        latencyMs: latency,
        statusCode: 200,
        tokensGenerated: Math.floor(Math.random() * 180) + 120,
      });
    }, 600);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: agentControlPlaneColors.surface,
            border: lightSurfaceBorder,
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: lightSurfaceBorder, p: 2.5 }}>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <TerminalIcon sx={{ color: 'primary.light' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Interactive Agent Console & Endpoint Playground
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Testing live target endpoint:{' '}
                {mainEndpoint?.base_url || 'stdio-pipe'}
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
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Agent Status Ribbon */}
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            mb: 2.5,
            bgcolor: agentControlPlaneColors.mutedSurface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {agent.name}
            </Typography>
            <Chip
              label={agent.liveness}
              size="small"
              sx={{
                bgcolor: isAlive
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(244, 63, 94, 0.15)',
                color: isAlive
                  ? agentControlPlaneColors.success
                  : agentControlPlaneColors.error,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
            <Chip
              label={`${mainEndpoint?.protocol || 'RestHttp'} (${
                mainEndpoint?.message_binding || 'Raw'
              })`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          </Stack>

          <Button
            size="small"
            startIcon={<SensorsIcon />}
            onClick={() => onProbeAgent(agent.id)}
            sx={{ fontSize: '0.75rem' }}
          >
            Probe Health Status
          </Button>
        </Paper>

        <Tabs
          value={tabIndex}
          onChange={(_, next) => setTabIndex(next)}
          sx={{
            mb: 2,
            borderBottom: lightSurfaceBorder,
            '& .MuiTab-root': { fontSize: '0.8rem', minHeight: 36 },
          }}
        >
          <Tab label="Natural Language Query" />
          <Tab label="Raw JSON-RPC / REST Payload" />
        </Tabs>

        {tabIndex === 0 ? (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
            >
              Enter prompt for autonomous agent reasoning:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask agent to perform reasoning, data query, or security audit..."
            />
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
            >
              Raw Request Body (JSON formatted):
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={5}
              value={jsonPayload}
              onChange={(e) => setJsonPayload(e.target.value)}
              slotProps={{
                htmlInput: {
                  sx: {
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.8rem',
                  },
                },
              }}
            />
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={
              isLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SendIcon />
              )
            }
            disabled={isLoading}
            onClick={handleExecute}
            sx={{
              fontWeight: 600,
              bgcolor: 'primary.main',
            }}
          >
            {isLoading ? 'Executing Request...' : 'Send Request to Agent'}
          </Button>
        </Box>

        {/* Execution Response Section */}
        {responseLog && (
          <Box sx={{ mt: 3 }}>
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Response Output
              </Typography>
              {responseMetadata && (
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={`Status: ${responseMetadata.statusCode}`}
                    size="small"
                    color={
                      responseMetadata.statusCode === 200 ? 'success' : 'error'
                    }
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  <Chip
                    label={`${responseMetadata.latencyMs} ms`}
                    size="small"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  {responseMetadata.tokensGenerated > 0 && (
                    <Chip
                      label={`${responseMetadata.tokensGenerated} tokens`}
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                </Stack>
              )}
            </Stack>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: `${agentControlPlaneColors.codeSurface} !important`,
                borderColor: '#334155',
                borderRadius: 2,
                maxHeight: 280,
                overflowY: 'auto',
              }}
            >
              <Typography
                component="pre"
                sx={{
                  m: 0,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.775rem',
                  color:
                    responseMetadata?.statusCode === 200
                      ? '#86efac'
                      : '#fda4af',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {responseLog}
              </Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: lightSurfaceBorder }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgentPlaygroundModal;
