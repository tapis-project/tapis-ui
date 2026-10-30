import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import SyncIcon from '@mui/icons-material/Sync';
import { useListAgents } from '../hooks/useListAgents';
import { useListAgentRecords } from '../hooks/useListAgentRecords';
import { useNavigate } from '../../_context/NavContext';
import { agentControlPlaneColors, lightSurfaceBorder } from './uiTokens';

interface HeaderProps {
  onOpenRegisterAgent: () => void;
  onOpenCreateRecord: () => void;
  onRefreshAll?: () => void;
  isRefreshing?: boolean;
  agentCount?: number;
  recordCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRegisterAgent,
  onOpenCreateRecord,
  onRefreshAll: propRefreshAll,
  isRefreshing: propIsRefreshing,
  agentCount: propAgentCount,
  recordCount: propRecordCount,
}) => {
  const location = useLocation();
  const { navigate } = useNavigate();
  const {
    agents,
    refreshAll: hookRefreshAll,
    isRefreshing: hookIsRefreshing,
  } = useListAgents();
  const { records } = useListAgentRecords();

  const agentCount = propAgentCount ?? agents.length;
  const recordCount = propRecordCount ?? records.length;
  const isRefreshing = propIsRefreshing ?? hookIsRefreshing;
  const handleRefresh = propRefreshAll ?? hookRefreshAll;

  const isOverview = location.pathname === '/mlhub/agent-control-plane';
  const isAgents = location.pathname === '/mlhub/agent-control-plane/agents';
  const isRecords = location.pathname === '/mlhub/agent-control-plane/records';

  return (
    <Box
      sx={{
        borderBottom: lightSurfaceBorder,
        bgcolor: agentControlPlaneColors.surface,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      }}
    >
      {/* Main Navigation & Actions */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box>
            <Typography
              variant="h6"
              sx={{
                lineHeight: 1.2,
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Agent Control Plane
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: '0.725rem' }}
            >
              Autonomous Agent Fleet & Blueprint Registry
            </Typography>
          </Box>

          {/* Navigation Pill Tabs / Routes */}
          <Box
            sx={{
              display: 'flex',
              bgcolor: agentControlPlaneColors.mutedSurface,
              p: 0.5,
              borderRadius: 2,
              border: lightSurfaceBorder,
              ml: { xs: 0, md: 2 },
            }}
          >
            <Button
              size="small"
              variant={isOverview ? 'contained' : 'text'}
              onClick={() => navigate('/agent-control-plane')}
              sx={{
                px: 2,
                py: 0.5,
                color: isOverview ? '#fff' : 'text.secondary',
                bgcolor: isOverview ? 'primary.main' : 'transparent',
                fontSize: '0.8125rem',
              }}
            >
              Fleet Overview
            </Button>
            <Button
              size="small"
              variant={isAgents ? 'contained' : 'text'}
              onClick={() => navigate('/agent-control-plane/agents')}
              sx={{
                px: 2,
                py: 0.5,
                color: isAgents ? '#fff' : 'text.secondary',
                bgcolor: isAgents ? 'primary.main' : 'transparent',
                fontSize: '0.8125rem',
              }}
            >
              Live Agents ({agentCount})
            </Button>
            <Button
              size="small"
              variant={isRecords ? 'contained' : 'text'}
              onClick={() => navigate('/agent-control-plane/records')}
              sx={{
                px: 2,
                py: 0.5,
                color: isRecords ? '#fff' : 'text.secondary',
                bgcolor: isRecords ? 'primary.main' : 'transparent',
                fontSize: '0.8125rem',
              }}
            >
              Agent Records Catalog ({recordCount})
            </Button>
          </Box>
        </Stack>

        {/* Global Action Buttons */}
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Tooltip title="Trigger Fleet Probe Sync">
            <IconButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="small"
              sx={{
                border: lightSurfaceBorder,
                bgcolor: agentControlPlaneColors.mutedSurface,
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            >
              <SyncIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            size="small"
            startIcon={<LibraryAddIcon />}
            onClick={onOpenCreateRecord}
            sx={{
              borderColor: agentControlPlaneColors.border,
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.light',
                bgcolor: agentControlPlaneColors.infoSurface,
              },
            }}
          >
            New Agent Record
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={onOpenRegisterAgent}
            sx={{
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            Register Agent
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default Header;
