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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { Deployment } from '../../types';
import DeploymentDialog from '../../_components/DeploymentDialog';
import {
  deploymentStatusChipColor,
  deploymentStatusLabelMap,
  envColorMap,
} from '../../_components/constants';
import { useNavigate } from '../../_context/NavContext';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import {
  AccessTime,
  Autorenew,
  Block,
  Dangerous,
  HelpOutline,
  SmartToy,
  StopCircle,
} from '@mui/icons-material';

export default function DeploymentsPage() {
  const [dialog, setDialog] = React.useState<string | undefined>(undefined);
  const [popoverAnchor, setPopoverAnchor] = React.useState<HTMLElement | null>(
    null
  );
  const [popoverRow, setPopoverRow] = React.useState<Deployment | null>(null);
  const { data } = Hooks.Deployments.useList();
  const deployments = data?.result || [];
  const { navigate } = useNavigate();
  const { username } = useTapisConfig();

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Deployment Name',
      flex: 1.2,
      minWidth: 200,
      valueGetter: (_, row) => row.name,
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
      field: 'modelName',
      headerName: 'Model',
      flex: 1.2,
      minWidth: 120,
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
          onClick={() =>
            navigate(
              `/models/${params.row.model.author}/${params.row.model.name}`
            )
          }
        >
          <SmartToy sx={{ color: 'secondary.main', fontSize: 18 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {params.row.model.name}
            </Typography>
            <Typography variant="caption">
              by {params.row.model.author}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'state',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={
            deploymentStatusLabelMap[params.value as Deployments.State] ||
            params.value
          }
          size="small"
          color={
            deploymentStatusChipColor[params.value as Deployments.State] ||
            'default'
          }
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'replicas',
      headerName: 'Replicas',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_value, row) => `x ${row.replicas?.count ?? '?'}`,
    },
    {
      field: 'parallelism_strategies',
      headerName: 'Sharding',
      minWidth: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const parallelismStrategies =
          (params.row
            .parallelism_strategies as Deployments.ParallelismStrategy[]) ?? [];

        if (parallelismStrategies.length === 0) {
          return <Chip size="small" label={'None'} />;
        }

        return (
          <Box
            sx={{
              display: 'flex',
              gap: '4px',
              p: '4px',
              flexDirection: 'column',
            }}
          >
            {parallelismStrategies.map((ps) => (
              <Chip size="small" label={ps} />
            ))}
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Deployed At',
      width: 200,
      valueGetter: (_value, row) =>
        row.created_at ? new Date(row.created_at).toLocaleString() : '—',
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

  const statusCounts = React.useMemo(() => {
    const counts = {
      total: deployments.length,
      running: 0,
      stopped: 0,
      notDeployed: 0,
      failed: 0,
      unknown: 0,
      blocked: 0,
    };
    deployments.forEach((d) => {
      switch (d.state) {
        case Deployments.State.Running:
          counts.running++;
          return;
        case Deployments.State.Stopped:
          counts.stopped++;
          return;
        case Deployments.State.NotDeployed:
          counts.notDeployed++;
          return;
        case Deployments.State.Failed:
          counts.failed++;
          return;
        case Deployments.State.Blocked:
          counts.blocked++;
          return;
        case Deployments.State.Unknown:
          counts.unknown++;
          return;
      }
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
            label: 'Total',
            count: deployments.length,
            icon: <RocketLaunchIcon color="primary" />,
            color: 'primary' as const,
          },
          {
            label: 'Pending',
            count: statusCounts.notDeployed,
            icon: <AccessTime color="info" />,
            color: 'info' as const,
          },
          {
            label: 'Running',
            count: statusCounts.running,
            icon: <Autorenew color="success" />,
            color: 'success' as const,
          },
          {
            label: 'Stopped',
            count: statusCounts.stopped,
            icon: <StopCircle color="yellow" />,
            color: 'yellow' as const,
          },
          {
            label: 'Unknown',
            count: statusCounts.unknown,
            icon: <HelpOutline color="warning" />,
            color: 'warning' as const,
          },
          {
            label: 'Blocked',
            count: statusCounts.blocked,
            icon: <Block color="warning" />,
            color: 'warning' as const,
          },
          {
            label: 'Failed',
            count: statusCounts.failed,
            icon: <Dangerous color="error" />,
            color: 'error' as const,
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            sx={{
              flex: '1 1 160px',
              minWidth: 150,
              background: (theme) =>
                alpha(theme.palette[stat.color].main, 0.08),
              border: '1px solid',
              borderColor: (theme) =>
                alpha(theme.palette[stat.color].main, 0.15),
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
            onClick={() => setDialog('deployments')}
            size="small"
            color="success"
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
          getRowHeight={() => 'auto'}
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
          {/* {popoverRow?.status === 'Running' && (
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
          )} */}
        </Box>
      </Popover>

      <DeploymentDialog
        open={dialog === 'deployments'}
        onClose={() => setDialog(undefined)}
        author={username}
      />
    </Box>
  );
}
