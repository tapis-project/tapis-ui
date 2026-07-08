import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography,
  Stack,
  alpha,
  Tooltip,
  Button,
  Popover,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DataGrid, type GridColDef, GridToolbar } from '@mui/x-data-grid';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { Deployment } from '../../types';
import DeploymentDialog from '../../_components/DeploymentDialog';
import {
  deploymentStatusChipColor,
  deploymentStatusLabelMap,
  envColorMap,
} from '../../_components/constants';
import { useNavigate } from '../../_context/NavContext';

interface DeploymentsTabProps {
  deployments: Deployment[];
  onDeploymentsChange: (deployments: Deployment[]) => void;
  models: Array<{
    id: string;
    name: string;
    version: string;
    libraries: string[];
  }>;
}

export default function DeploymentsTab({
  deployments,
  onDeploymentsChange,
  models,
}: DeploymentsTabProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [popoverAnchor, setPopoverAnchor] = React.useState<HTMLElement | null>(
    null
  );
  const [popoverRow, setPopoverRow] = React.useState<Deployment | null>(null);
  const { navigate } = useNavigate();

  const handleDeploy = (
    data: Omit<Deployment, 'id' | 'status' | 'deployedAt'>
  ) => {
    const newDeployment: Deployment = {
      ...data,
      id: `deploy-${String(deployments.length + 1).padStart(3, '0')}`,
      status: data.environment === 'production' ? 'NotDeployed' : 'Running',
      deployedAt: data.environment === 'test' ? new Date().toISOString() : null,
    };
    onDeploymentsChange([...deployments, newDeployment]);
  };

  const handleStop = (id: string) => {
    onDeploymentsChange(
      deployments.map((d) => (d.id === id ? { ...d, status: 'Stopped' } : d))
    );
  };

  const handleRollback = (id: string) => {
    onDeploymentsChange(
      deployments.map((d) => (d.id === id ? { ...d, status: 'Running' } : d))
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'modelName',
      headerName: 'Model',
      flex: 1.2,
      minWidth: 180,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            '&:hover': {
              '& .MuiTypography-root': {
                color: 'primary.main',
                textDecoration: 'underline',
              },
            },
          }}
          onClick={() => navigate(`/deployments/${params.row.id}`)}
        >
          <RocketLaunchIcon sx={{ color: 'success.main', fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'environment',
      headerName: 'Environment',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={envColorMap[params.value as Deployment['environment']]}
          variant="outlined"
          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={
            deploymentStatusLabelMap[params.value as Deployment['status']] ||
            params.value
          }
          size="small"
          color={
            deploymentStatusChipColor[params.value as Deployment['status']] ||
            'default'
          }
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'endpoint',
      headerName: 'Endpoint',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Typography
          variant="body2"
          component="code"
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
            color: (theme) =>
              theme.palette.mode === 'dark' ? 'grey.200' : 'text.secondary',
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            display: 'block',
            border: (theme) =>
              theme.palette.mode === 'dark' ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'replicas',
      headerName: 'Replicas',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_value, row) => `${row.replicas}x`,
    },
    {
      field: 'resources',
      headerName: 'Resources',
      width: 110,
      valueGetter: (_value, row) => `${row.cpu} / ${row.memory}`,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'deployedAt',
      headerName: 'Deployed At',
      width: 130,
      valueGetter: (_value, row) =>
        row.deployedAt ? new Date(row.deployedAt).toLocaleString() : '—',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            setPopoverAnchor(e.currentTarget);
            setPopoverRow(params.row);
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const envCounts = React.useMemo(() => {
    const counts = { test: 0, production: 0, active: 0 };
    deployments.forEach((d) => {
      if (d.environment === 'test') counts.test++;
      else counts.production++;
      if (d.status === 'Running') counts.active++;
    });
    return counts;
  }, [deployments]);

  return (
    <Box>
      {/* ─── Header ─────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <RocketLaunchIcon sx={{ fontSize: 28, color: 'success.main' }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            Deployments
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage model deployments across test and production
          environments — track health and scale.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3, flexWrap: 'wrap' }}
        useFlexGap
      >
        {[
          {
            label: 'Total Deployments',
            count: deployments.length,
            icon: '🚀',
            color: 'primary' as const,
          },
          {
            label: 'Active Services',
            count: envCounts.active,
            icon: '✅',
            color: 'success' as const,
          },
          {
            label: 'Production',
            count: envCounts.production,
            icon: '🏭',
            color: 'error' as const,
          },
          {
            label: 'Test',
            count: envCounts.test,
            icon: '🧪',
            color: 'warning' as const,
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            sx={{
              flex: '1 1 160px',
              minWidth: 150,
              background: (theme) =>
                alpha(theme.palette[stat.color].main, 0.08),
              borderLeft: '4px solid',
              borderColor: `${stat.color}.main`,
            }}
          >
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {stat.icon} {stat.label}
              </Typography>
              <Typography
                variant="h4"
                color={`${stat.color}.main`}
                sx={{ fontWeight: 700 }}
              >
                {stat.count}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Deployments Table */}
      <Card sx={{ '& .MuiDataGrid-root': { border: 'none' } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            pb: 1,
          }}
        >
          <Typography variant="h6">Active Deployments</Typography>
          <Button
            variant="contained"
            startIcon={<RocketLaunchIcon />}
            onClick={() => setDialogOpen(true)}
            size="small"
          >
            New Deployment
          </Button>
        </Box>

        <DataGrid
          rows={deployments}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 8 } },
          }}
          pageSizeOptions={[8, 15]}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          autoHeight
          getRowSpacing={(params) => ({
            top: params.isFirstVisible ? 0 : 0,
            bottom: 0,
          })}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
            '& .MuiDataGrid-cellContent': {
              display: 'flex',
              alignItems: 'center',
              overflow: 'visible',
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
            },
            '& .MuiDataGrid-columnHeader': {
              color: 'text.primary',
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
                color: 'text.primary',
              },
            },
            '& .MuiDataGrid-iconButtonContainer': { color: 'text.secondary' },
            '& .MuiDataGrid-menuIconButton': { color: 'text.secondary' },
          }}
        />
      </Card>

      {/* ─── Actions Popover ────────────────────────────── */}
      <Popover
        open={!!popoverAnchor}
        anchorEl={popoverAnchor}
        onClose={() => {
          setPopoverAnchor(null);
          setPopoverRow(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: { minWidth: 180, borderRadius: 2 } },
        }}
      >
        <Box sx={{ py: 0.5 }}>
          <Button
            fullWidth
            startIcon={<VisibilityIcon sx={{ fontSize: 18 }} />}
            onClick={() => {
              if (popoverRow) navigate(`/deployments/${popoverRow.id}`);
              setPopoverAnchor(null);
              setPopoverRow(null);
            }}
            color="primary"
            sx={{ justifyContent: 'flex-start', px: 2, py: 1 }}
          >
            View Details
          </Button>
          {popoverRow?.status === 'Running' && (
            <Button
              fullWidth
              startIcon={<StopIcon sx={{ fontSize: 18 }} />}
              onClick={() => {
                if (popoverRow) handleStop(popoverRow.id);
                setPopoverAnchor(null);
                setPopoverRow(null);
              }}
              color="warning"
              sx={{ justifyContent: 'flex-start', px: 2, py: 1 }}
            >
              Stop Deployment
            </Button>
          )}
          {popoverRow?.status === 'Failed' && (
            <Button
              fullWidth
              startIcon={<ReplayIcon sx={{ fontSize: 18 }} />}
              onClick={() => {
                if (popoverRow) handleRollback(popoverRow.id);
                setPopoverAnchor(null);
                setPopoverRow(null);
              }}
              color="info"
              sx={{ justifyContent: 'flex-start', px: 2, py: 1 }}
            >
              Retry / Rollback
            </Button>
          )}
        </Box>
      </Popover>

      <DeploymentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onDeploy={handleDeploy}
      />
    </Box>
  );
}
