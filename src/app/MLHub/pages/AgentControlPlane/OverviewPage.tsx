import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  Button,
  Paper,
} from '@mui/material';
import { PieChart, LineChart } from '@mui/x-charts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HubIcon from '@mui/icons-material/Hub';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SpeedIcon from '@mui/icons-material/Speed';
import BoltIcon from '@mui/icons-material/Bolt';
import SensorsIcon from '@mui/icons-material/Sensors';
import StorageIcon from '@mui/icons-material/Storage';
import {
  Agent,
  AgentLiveness,
  AgentDeploymentModality,
  getAgentEndpoints,
} from '../types/agent';
import { useListAgents } from '../hooks/useListAgents';
import { useListAgentRecords } from '../hooks/useListAgentRecords';
import { agentControlPlaneColors, lightSurfaceBorder } from './uiTokens';

interface OverviewPageProps {
  onSelectAgent: (agent: Agent) => void;
  onProbeAgent: (agentId: string) => void;
  onNavigateToAgents: () => void;
  onNavigateToRecords: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onSelectAgent,
  onProbeAgent,
  onNavigateToAgents,
}) => {
  const { agents } = useListAgents();
  const { records } = useListAgentRecords();
  const aliveCount = agents.filter(
    (a) => a.liveness === AgentLiveness.Alive
  ).length;
  const deadCount = agents.filter(
    (a) => a.liveness === AgentLiveness.Dead
  ).length;
  const persistentCount = agents.filter(
    (a) => a.deployment_modality === AgentDeploymentModality.Persistent
  ).length;
  const onDemandCount = agents.filter(
    (a) => a.deployment_modality === AgentDeploymentModality.OnDemand
  ).length;

  const protocolCounts: Record<string, number> = {
    RestHttp: 0,
    Rpc: 0,
    Stdio: 0,
  };

  agents.forEach((agent) => {
    const eps = getAgentEndpoints(agent);
    eps.forEach((ep) => {
      protocolCounts[ep.protocol] = (protocolCounts[ep.protocol] || 0) + 1;
    });
  });

  const streamingRecords = records.filter(
    (r) => r.capabilities.streaming
  ).length;
  const pushRecords = records.filter(
    (r) => r.capabilities.push_notifications
  ).length;

  const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'];
  const throughputData = [12000, 18400, 45200, 78900, 92400, 84300, 102500];
  const latencyData = [45, 52, 68, 85, 74, 62, 58];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Top Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Active Agents Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: '100%',
              bgcolor: agentControlPlaneColors.surface,
              border: lightSurfaceBorder,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                bgcolor: 'primary.main',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 600 }}
                  >
                    TOTAL LIVE AGENTS
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      my: 0.5,
                      color: agentControlPlaneColors.strongText,
                    }}
                  >
                    {agents.length}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1, alignItems: 'center' }}
                  >
                    <Chip
                      icon={
                        <CheckCircleIcon
                          sx={{
                            fontSize: '12px !important',
                            color: '#10b981 !important',
                          }}
                        />
                      }
                      label={`${aliveCount} Alive`}
                      size="small"
                      sx={{
                        bgcolor: agentControlPlaneColors.successSurface,
                        color: agentControlPlaneColors.success,
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                    {deadCount > 0 && (
                      <Chip
                        icon={
                          <ErrorIcon
                            sx={{
                              fontSize: '12px !important',
                              color: '#f43f5e !important',
                            }}
                          />
                        }
                        label={`${deadCount} Dead`}
                        size="small"
                        sx={{
                          bgcolor: agentControlPlaneColors.errorSurface,
                          color: agentControlPlaneColors.error,
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                    )}
                  </Stack>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                    color: 'primary.light',
                    width: 44,
                    height: 44,
                  }}
                >
                  <HubIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Deployment Modality Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: '100%',
              bgcolor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                bgcolor: 'secondary.main',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 600 }}
                  >
                    MODALITY BREAKDOWN
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      my: 0.5,
                      color: agentControlPlaneColors.strongText,
                    }}
                  >
                    {persistentCount}{' '}
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      / {onDemandCount}
                    </Typography>
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mt: 1 }}
                  >
                    {persistentCount} Persistent • {onDemandCount} OnDemand
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(6, 182, 212, 0.15)',
                    color: 'secondary.light',
                    width: 44,
                    height: 44,
                  }}
                >
                  <StorageIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Blueprints / Catalog Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: '100%',
              bgcolor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                bgcolor: '#10b981',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 600 }}
                  >
                    AGENT BLUEPRINTS
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      my: 0.5,
                      color: agentControlPlaneColors.strongText,
                    }}
                  >
                    {records.length}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      label={`${streamingRecords} Streaming`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                    <Chip
                      label={`${pushRecords} Webhooks`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(56, 189, 248, 0.15)',
                        color: '#7dd3fc',
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                  </Stack>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    width: 44,
                    height: 44,
                  }}
                >
                  <AssignmentIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Avg Latency & Throughput */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: '100%',
              bgcolor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                bgcolor: '#f59e0b',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 600 }}
                  >
                    FLEET AVG LATENCY
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      my: 0.5,
                      color: agentControlPlaneColors.strongText,
                    }}
                  >
                    58{' '}
                    <Typography
                      component="span"
                      variant="h6"
                      sx={{ color: 'text.secondary' }}
                    >
                      ms
                    </Typography>
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mt: 1 }}
                  >
                    3.85M cumulative 24h queries
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    width: 44,
                    height: 44,
                  }}
                >
                  <SpeedIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Visualizations Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Invocations and Latency Trends */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Fleet Telemetry & Invocation Rate
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    Tenant real-time query throughput vs response latency (P95)
                  </Typography>
                </Box>
                <Chip
                  icon={
                    <BoltIcon
                      sx={{
                        fontSize: '14px !important',
                        color: '#6366f1 !important',
                      }}
                    />
                  }
                  label="Live Stream"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(99, 102, 241, 0.12)',
                    color: 'primary.light',
                    fontSize: '0.725rem',
                  }}
                />
              </Stack>

              <Box sx={{ width: '100%', height: 260 }}>
                <LineChart
                  xAxis={[{ scaleType: 'point', data: hours }]}
                  series={[
                    {
                      data: throughputData,
                      label: 'Invocations/hr',
                      color: '#6366f1',
                      showMark: true,
                    },
                    {
                      data: latencyData.map((d) => d * 1000),
                      label: 'Latency (ms x1000)',
                      color: '#06b6d4',
                      showMark: true,
                    },
                  ]}
                  height={250}
                  margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Breakdown Donut & Protocols */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Fleet Health & Protocols
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', mb: 2 }}
              >
                Protocol binding distribution across registered target endpoints
              </Typography>

              <Box
                sx={{ display: 'flex', justifyContent: 'center', height: 160 }}
              >
                <PieChart
                  series={[
                    {
                      data: [
                        {
                          id: 0,
                          value: aliveCount,
                          label: 'Alive',
                          color: '#10b981',
                        },
                        {
                          id: 1,
                          value: deadCount,
                          label: 'Dead',
                          color: '#f43f5e',
                        },
                      ],
                      innerRadius: 40,
                      outerRadius: 65,
                      paddingAngle: 4,
                      cornerRadius: 4,
                    },
                  ]}
                  width={240}
                  height={160}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.5}>
                <Box>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', mb: 0.5 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      REST / HTTP (JSON)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {protocolCounts.RestHttp} endpoints
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (protocolCounts.RestHttp / (agents.length * 1.5 || 1)) *
                      100
                    }
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' },
                    }}
                  />
                </Box>

                <Box>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', mb: 0.5 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      RPC / gRPC & JSON-RPC
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {protocolCounts.Rpc} endpoints
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (protocolCounts.Rpc / (agents.length * 1.5 || 1)) * 100
                    }
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      '& .MuiLinearProgress-bar': { bgcolor: '#06b6d4' },
                    }}
                  />
                </Box>

                <Box>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', mb: 0.5 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      Standard I/O (Stdio)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {protocolCounts.Stdio} endpoints
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (protocolCounts.Stdio / (agents.length * 1.5 || 1)) * 100
                    }
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b' },
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Real-time Health Radar & Agent Cards quick view */}
      <Card sx={{ bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Real-Time Agent Liveness Probe Matrix
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Heartbeat monitors evaluating REST probe configurations and
                missed heartbeat thresholds
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              onClick={onNavigateToAgents}
              sx={{ fontSize: '0.8rem' }}
            >
              View Full Agent Fleet ({agents.length})
            </Button>
          </Stack>

          <Grid container spacing={2}>
            {agents.map((agent) => {
              const endpoints = getAgentEndpoints(agent);
              const mainEndpoint = endpoints[0];
              const isAlive = agent.liveness === AgentLiveness.Alive;
              const probeConfig = mainEndpoint?.liveness_probe;

              return (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={agent.id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      borderColor: isAlive
                        ? 'rgba(16, 185, 129, 0.25)'
                        : 'rgba(244, 63, 94, 0.3)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: isAlive ? '#10b981' : '#f43f5e',
                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box sx={{ maxWidth: '75%' }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center' }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: isAlive ? '#10b981' : '#f43f5e',
                              boxShadow: isAlive
                                ? '0 0 8px #10b981'
                                : '0 0 8px #f43f5e',
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              cursor: 'pointer',
                              '&:hover': { color: 'primary.light' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            onClick={() => onSelectAgent(agent)}
                          >
                            {agent.name}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: 'block',
                            mt: 0.5,
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '0.7rem',
                          }}
                        >
                          {agent.id.slice(0, 13)}...
                        </Typography>
                      </Box>

                      <Chip
                        label={agent.deployment_modality}
                        size="small"
                        sx={{
                          fontSize: '0.675rem',
                          bgcolor:
                            agent.deployment_modality === 'Persistent'
                              ? 'rgba(99, 102, 241, 0.15)'
                              : 'rgba(6, 182, 212, 0.15)',
                          color:
                            agent.deployment_modality === 'Persistent'
                              ? 'primary.light'
                              : 'secondary.light',
                          height: 20,
                        }}
                      />
                    </Stack>

                    <Box
                      sx={{
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', display: 'block' }}
                          >
                            Endpoint Protocol
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                            <Chip
                              label={
                                mainEndpoint
                                  ? `${mainEndpoint.protocol}${
                                      mainEndpoint.message_binding
                                        ? ` (${mainEndpoint.message_binding})`
                                        : ''
                                    }`
                                  : 'None'
                              }
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.675rem', height: 18 }}
                            />
                          </Stack>
                        </Box>

                        <Box sx={{ textAlign: 'right' }}>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', display: 'block' }}
                          >
                            Probe Route
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                              color: '#38bdf8',
                            }}
                          >
                            {probeConfig ? probeConfig.route : 'None (Manual)'}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 1.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary' }}
                        >
                          {agent.consecutive_missed_heartbeats &&
                          agent.consecutive_missed_heartbeats > 0
                            ? `${agent.consecutive_missed_heartbeats} missed heartbeats`
                            : 'Status: Healthy'}
                        </Typography>

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={
                            <SensorsIcon sx={{ fontSize: '13px !important' }} />
                          }
                          onClick={() => onProbeAgent(agent.id)}
                          sx={{
                            fontSize: '0.7rem',
                            py: 0.25,
                            px: 1,
                            borderColor: 'rgba(255, 255, 255, 0.15)',
                          }}
                        >
                          Ping Probe
                        </Button>
                      </Stack>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OverviewPage;
