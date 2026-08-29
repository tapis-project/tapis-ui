import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Button,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SensorsIcon from '@mui/icons-material/Sensors';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TerminalIcon from '@mui/icons-material/Terminal';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Agent,
  AgentLiveness,
  generateAgentUrn,
  getAgentEndpoints,
} from '../types/agent';
import { useListAgents } from '../hooks/useListAgents';
import { agentControlPlaneColors } from './uiTokens';

interface AgentsListPageProps {
  agents?: Agent[];
  onSelectAgent: (agent: Agent) => void;
  onOpenRegisterAgent: () => void;
  onToggleLiveness: (agentId: string) => void;
  onProbeAgent: (agentId: string) => void;
  onOpenPlayground: (agent: Agent) => void;
}

export const AgentsListPage: React.FC<AgentsListPageProps> = ({
  agents: propAgents,
  onSelectAgent,
  onOpenRegisterAgent,
  onToggleLiveness,
  onProbeAgent,
  onOpenPlayground,
}) => {
  const { agents: hookAgents } = useListAgents();
  const agents = propAgents ?? hookAgents;
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [livenessFilter, setLivenessFilter] = useState<string>('all');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [protocolFilter, setProtocolFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyUrn = (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    const urn = generateAgentUrn(agent.tenant_id, agent.id);
    navigator.clipboard.writeText(urn);
    setCopiedId(agent.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAgents = agents.filter((agent) => {
    const endpoints = getAgentEndpoints(agent);
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.tags.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesLiveness =
      livenessFilter === 'all' ||
      agent.liveness.toLowerCase() === livenessFilter.toLowerCase();

    const matchesModality =
      modalityFilter === 'all' ||
      agent.deployment_modality.toLowerCase() === modalityFilter.toLowerCase();

    const matchesProtocol =
      protocolFilter === 'all' ||
      endpoints.some(
        (ep) => ep.protocol.toLowerCase() === protocolFilter.toLowerCase()
      );

    return (
      matchesSearch && matchesLiveness && matchesModality && matchesProtocol
    );
  });

  const columns: GridColDef<Agent>[] = [
    {
      field: 'name',
      headerName: 'Agent Name & URN',
      flex: 1.5,
      minWidth: 260,
      renderCell: (params) => {
        const agent = params.row;
        const isAlive = agent.liveness === AgentLiveness.Alive;
        const urn = generateAgentUrn(agent.tenant_id, agent.id);

        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isAlive ? '#10b981' : '#f43f5e',
                  boxShadow: isAlive ? '0 0 6px #10b981' : '0 0 6px #f43f5e',
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'primary.light',
                  '&:hover': { textDecoration: 'underline' },
                }}
                onClick={() => onSelectAgent(agent)}
              >
                {agent.name}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: 'center', mt: 0.25 }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.675rem',
                }}
              >
                {urn.slice(0, 32)}...
              </Typography>
              <Tooltip
                title={copiedId === agent.id ? 'Copied!' : 'Copy full URN'}
              >
                <IconButton
                  size="small"
                  onClick={(e) => handleCopyUrn(agent, e)}
                  sx={{ p: 0.25, color: 'text.secondary' }}
                >
                  <ContentCopyIcon sx={{ fontSize: 11 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        );
      },
    },
    {
      field: 'liveness',
      headerName: 'Liveness',
      width: 110,
      renderCell: (params) => {
        const isAlive =
          params.value === AgentLiveness.Alive || params.value === 'Alive';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              icon={
                isAlive ? (
                  <CheckCircleIcon
                    sx={{
                      fontSize: '14px !important',
                      color: '#10b981 !important',
                    }}
                  />
                ) : (
                  <CancelIcon
                    sx={{
                      fontSize: '14px !important',
                      color: '#f43f5e !important',
                    }}
                  />
                )
              }
              label={params.value}
              size="small"
              sx={{
                bgcolor: isAlive
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(244, 63, 94, 0.15)',
                color: isAlive ? '#34d399' : '#fb7185',
                border: `1px solid ${
                  isAlive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'
                }`,
                fontWeight: 600,
                fontSize: '0.725rem',
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'deployment_modality',
      headerName: 'Modality',
      width: 125,
      renderCell: (params) => {
        const isPersistent = params.value === 'Persistent';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={params.value}
              size="small"
              sx={{
                bgcolor: isPersistent
                  ? 'rgba(99, 102, 241, 0.12)'
                  : 'rgba(6, 182, 212, 0.12)',
                color: isPersistent ? '#818cf8' : '#22d3ee',
                fontSize: '0.725rem',
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'owner',
      headerName: 'Owner',
      width: 140,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'endpoints',
      headerName: 'Endpoints & Protocols',
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => {
        const endpoints = getAgentEndpoints(params.row);
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              flexWrap: 'wrap',
              height: '100%',
            }}
          >
            {endpoints.map((ep, idx) => (
              <Chip
                key={idx}
                label={`${ep.protocol}${
                  ep.message_binding ? `:${ep.message_binding}` : ''
                }`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.675rem',
                  height: 20,
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                }}
              />
            ))}
          </Box>
        );
      },
    },
    {
      field: 'consecutive_missed_heartbeats',
      headerName: 'Heartbeat / Status',
      width: 150,
      renderCell: (params) => {
        const missed = params.value || 0;
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: missed > 0 ? 'error.light' : 'success.light',
                fontWeight: 600,
              }}
            >
              {missed > 0 ? `${missed} missed probes` : 'Healthy Sync'}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
            >
              P99 &lt; 100ms
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 170,
      sortable: false,
      renderCell: (params) => {
        const agent = params.row;
        const isAlive = agent.liveness === AgentLiveness.Alive;

        return (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: 'center', height: '100%' }}
          >
            <Tooltip title="Ping Liveness Probe">
              <IconButton
                size="small"
                onClick={() => onProbeAgent(agent.id)}
                sx={{ color: 'secondary.light' }}
              >
                <SensorsIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>

            <Tooltip
              title={isAlive ? 'Simulate Stop / Dead' : 'Restart / Heal'}
            >
              <IconButton
                size="small"
                onClick={() => onToggleLiveness(agent.id)}
                sx={{ color: isAlive ? 'warning.light' : 'success.light' }}
              >
                {isAlive ? (
                  <PauseCircleIcon sx={{ fontSize: 17 }} />
                ) : (
                  <PlayCircleIcon sx={{ fontSize: 17 }} />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Interactive Playground">
              <IconButton
                size="small"
                onClick={() => onOpenPlayground(agent)}
                sx={{ color: 'primary.light' }}
              >
                <TerminalIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="View Detailed Config & URN">
              <IconButton
                size="small"
                onClick={() => onSelectAgent(agent)}
                sx={{ color: 'text.secondary' }}
              >
                <VisibilityIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Controls & Filter Bar */}
      <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            {/* Search Input */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by agent name, description, tags, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{ color: 'text.secondary', fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {/* Liveness Filter */}
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Liveness</InputLabel>
                <Select
                  value={livenessFilter}
                  label="Liveness"
                  onChange={(e) => setLivenessFilter(e.target.value)}
                >
                  <MenuItem value="all">All Liveness</MenuItem>
                  <MenuItem value="alive">Alive</MenuItem>
                  <MenuItem value="dead">Dead</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Modality Filter */}
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Modality</InputLabel>
                <Select
                  value={modalityFilter}
                  label="Modality"
                  onChange={(e) => setModalityFilter(e.target.value)}
                >
                  <MenuItem value="all">All Modalities</MenuItem>
                  <MenuItem value="persistent">Persistent</MenuItem>
                  <MenuItem value="ondemand">OnDemand</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Protocol Filter */}
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Protocol</InputLabel>
                <Select
                  value={protocolFilter}
                  label="Protocol"
                  onChange={(e) => setProtocolFilter(e.target.value)}
                >
                  <MenuItem value="all">All Protocols</MenuItem>
                  <MenuItem value="resthttp">RestHttp</MenuItem>
                  <MenuItem value="rpc">Rpc</MenuItem>
                  <MenuItem value="stdio">Stdio</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Layout Toggle & Register CTA */}
            <Grid
              size={{ xs: 6, sm: 12, md: 2 }}
              sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}
            >
              <ToggleButtonGroup
                size="small"
                value={viewMode}
                exclusive
                onChange={(_, next) => next && setViewMode(next)}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}
              >
                <ToggleButton value="table">
                  <ViewListIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="cards">
                  <ViewModuleIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={onOpenRegisterAgent}
                sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
              >
                Register
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        <Card
          sx={{
            bgcolor: 'background.paper',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ height: 560, width: '100%' }}>
            <DataGrid
              rows={filteredAgents}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderColor: 'rgba(255, 255, 255, 0.06)',
                },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  fontWeight: 700,
                },
                '& .MuiDataGrid-footerContainer': {
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            />
          </Box>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {filteredAgents.map((agent) => {
            const isAlive = agent.liveness === AgentLiveness.Alive;
            const urn = generateAgentUrn(agent.tenant_id, agent.id);
            const endpoints = getAgentEndpoints(agent);

            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={agent.id}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: agentControlPlaneColors.surface,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid',
                    borderColor: isAlive
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(244, 63, 94, 0.25)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: isAlive ? 'primary.light' : 'error.light',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1.5,
                      }}
                    >
                      <Box sx={{ maxWidth: '70%' }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center' }}
                        >
                          <Box
                            sx={{
                              width: 9,
                              height: 9,
                              borderRadius: '50%',
                              bgcolor: isAlive ? '#10b981' : '#f43f5e',
                              boxShadow: isAlive
                                ? '0 0 8px #10b981'
                                : '0 0 8px #f43f5e',
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              '&:hover': { color: 'primary.light' },
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
                            mt: 0.25,
                          }}
                        >
                          Owner: {agent.owner}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.75}>
                        <Chip
                          label={agent.liveness}
                          size="small"
                          sx={{
                            bgcolor: isAlive
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(244, 63, 94, 0.15)',
                            color: isAlive ? '#34d399' : '#fb7185',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 22,
                          }}
                        />
                        <Chip
                          label={agent.deployment_modality}
                          size="small"
                          sx={{
                            bgcolor:
                              agent.deployment_modality === 'Persistent'
                                ? 'rgba(99, 102, 241, 0.12)'
                                : 'rgba(6, 182, 212, 0.12)',
                            color:
                              agent.deployment_modality === 'Persistent'
                                ? '#818cf8'
                                : '#22d3ee',
                            fontSize: '0.7rem',
                            height: 22,
                          }}
                        />
                      </Stack>
                    </Stack>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        mb: 2,
                        lineHeight: 1.4,
                        minHeight: 40,
                        fontSize: '0.825rem',
                      }}
                    >
                      {agent.description}
                    </Typography>

                    {/* URN badge */}
                    <Box
                      sx={{
                        bgcolor: agentControlPlaneColors.mutedSurface,
                        p: 1,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: '"JetBrains Mono", monospace',
                          color: 'text.secondary',
                          fontSize: '0.675rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '85%',
                        }}
                      >
                        {urn}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleCopyUrn(agent, e)}
                      >
                        <ContentCopyIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>

                    {/* Endpoints & Tags */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          display: 'block',
                          mb: 0.5,
                        }}
                      >
                        TARGET ENDPOINTS:
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ flexWrap: 'wrap', gap: 0.5 }}
                      >
                        {endpoints.map((ep, i) => (
                          <Chip
                            key={i}
                            label={`${ep.name || 'default'} (${ep.protocol})`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.675rem', height: 20 }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          display: 'block',
                          mb: 0.5,
                        }}
                      >
                        TAGS:
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ flexWrap: 'wrap', gap: 0.5 }}
                      >
                        {agent.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={`#${tag}`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.04)',
                              color: 'text.secondary',
                              fontSize: '0.65rem',
                              height: 18,
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </CardContent>

                  {/* Card Bottom Actions */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={
                        <SensorsIcon sx={{ fontSize: '14px !important' }} />
                      }
                      onClick={() => onProbeAgent(agent.id)}
                      sx={{ fontSize: '0.725rem', color: 'secondary.light' }}
                    >
                      Probe
                    </Button>

                    <Button
                      size="small"
                      startIcon={
                        <TerminalIcon sx={{ fontSize: '14px !important' }} />
                      }
                      onClick={() => onOpenPlayground(agent)}
                      sx={{ fontSize: '0.725rem', color: 'primary.light' }}
                    >
                      Console
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onSelectAgent(agent)}
                      sx={{ fontSize: '0.725rem' }}
                    >
                      Details
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default AgentsListPage;
