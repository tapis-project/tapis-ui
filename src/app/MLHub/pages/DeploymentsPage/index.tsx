import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Button,
  InputAdornment,
  Popover,
  TextField,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import { DataGrid, type GridColDef, GridToolbar } from '@mui/x-data-grid';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ViewAgendaRoundedIcon from '@mui/icons-material/ViewAgendaRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import SearchIcon from '@mui/icons-material/Search';
import DeploymentDialog from '../../_components/DeploymentDialog';
import { NoActiveDeployments } from '../../_components/NoActiveDeployments';
import { ModelDetailDrawer } from '../ModelDetailDrawer';
import {
  batchOutcomePresentation,
  canStartDeployment,
  canStopDeployment,
  canUndeployDeployment,
  isDeploymentExpired,
  isTerminalDeployment,
  reconciliationStatusPresentation,
} from '../../_components/deploymentOperationalStatus';
import { useToast } from '../../_context/ToastsContext/useToast';
import { useNavigate } from '../../_context/NavContext';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import * as Models from '@mlhub/models-ts-sdk';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { SmartToy } from '@mui/icons-material';

type DeploymentView = 'table' | 'cards';

function DeploymentSectionHeader({
  title,
  count,
  description,
}: {
  title: string;
  count: number;
  description: string;
}) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        pb: 1,
      }}
    >
      <Box>
        <Typography sx={{ fontWeight: 700 }} variant="subtitle1">
          {title}
        </Typography>
        <Typography color="text.secondary" variant="caption">
          {description}
        </Typography>
      </Box>
      <Chip label={count} size="small" variant="outlined" />
    </Box>
  );
}

function DeploymentCard({
  deployment,
  isMutating,
  model,
  onSelect,
  onStart,
  onStop,
  onUndeploy,
}: {
  deployment: Deployments.ModelDeployment;
  model?: Models.Model;
  onSelect: (deployment: Deployments.ModelDeployment) => void;
  isMutating: boolean;
  onStart: () => void;
  onStop: () => void;
  onUndeploy: () => void;
}) {
  const status = reconciliationStatusPresentation(
    deployment.reconciliation_status
  );
  const batchOutcome = batchOutcomePresentation(
    deployment.batch_execution_outcome
  );
  const isExpired = isDeploymentExpired(deployment);
  const isRunning =
    !isExpired && deployment.state === Deployments.State.Running;

  return (
    <Card
      onClick={(event) => {
        if (
          (event.target as Element).closest(
            '[data-deployment-lifecycle-actions]'
          )
        ) {
          return;
        }

        onSelect(deployment);
      }}
      role="button"
      sx={{
        borderRadius: '2px',
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
      }}
      tabIndex={0}
      variant="outlined"
    >
      <CardContent sx={{ '&:last-child': { pb: 2 }, p: 2 }}>
        <Stack spacing={1.5}>
          <Stack
            direction={{ sm: 'row', xs: 'column' }}
            sx={{
              alignItems: { sm: 'center' },
              gap: 1,
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', minWidth: 0 }}
            >
              <RocketLaunchIcon color="success" />
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 700 }}>
                  {deployment.name}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  {deployment.deployment_modality} deployment
                </Typography>
                <Typography
                  color="text.secondary"
                  noWrap
                  sx={{ display: 'block', fontFamily: 'monospace' }}
                  variant="caption"
                >
                  Deployment ID: {deployment.id}
                </Typography>
              </Box>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <SmartToy color="secondary" fontSize="small" />
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 600 }} variant="body2">
                {model?.name ?? deployment.external_model_id}
              </Typography>
              <Typography color="text.secondary" noWrap variant="caption">
                {deployment.endpoint?.slug ?? 'Endpoint pending'}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <Chip
              label={`${deployment.replicas.count} replicas`}
              size="small"
              variant="outlined"
            />
            {deployment.replicas.parallelism_strategies.map((strategy) => (
              <Chip
                key={strategy}
                label={strategy}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
          <Typography color="text.secondary" variant="caption">
            Deployed {new Date(deployment.created_at).toLocaleString()}
          </Typography>
          <Stack
            data-deployment-lifecycle-actions
            direction="row"
            sx={{ flexWrap: 'wrap', gap: 0.75 }}
          >
            <Button
              disabled={isMutating || !canStartDeployment(deployment)}
              onClick={onStart}
              size="small"
              startIcon={<PlayArrowIcon />}
              variant="outlined"
            >
              Start
            </Button>
            <Button
              color="warning"
              disabled={isMutating || !canStopDeployment(deployment)}
              onClick={onStop}
              size="small"
              startIcon={<StopCircleOutlinedIcon />}
              variant="outlined"
            >
              Stop
            </Button>
            <Button
              color="error"
              disabled={isMutating || !canUndeployDeployment(deployment)}
              onClick={onUndeploy}
              size="small"
              startIcon={<DeleteOutlineIcon />}
              variant="outlined"
            >
              Undeploy
            </Button>
          </Stack>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <Chip
              color={status.color}
              icon={
                isRunning ? (
                  <AutorenewRoundedIcon
                    aria-label="Deployment is running"
                    sx={{
                      animation: 'deployment-running 1.2s linear infinite',
                      fontSize: 16,
                      '@keyframes deployment-running': {
                        from: { transform: 'rotate(0deg)' },
                        to: { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                ) : undefined
              }
              label={status.label}
              size="small"
            />
            {isExpired && (
              <Chip
                color="warning"
                label="Expired"
                size="small"
                variant="outlined"
              />
            )}
            {deployment.batch_execution_outcome && (
              <Chip
                color={batchOutcome.color}
                label={`Batch: ${batchOutcome.label}`}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function DeploymentsPage() {
  const toast = useToast();
  const [dialog, setDialog] = React.useState<string | undefined>(undefined);
  const [filterQuery, setFilterQuery] = React.useState('');
  const [view, setView] = React.useState<DeploymentView>('cards');
  const [selectedModel, setSelectedModel] = React.useState<Models.Model | null>(
    null
  );
  const [popoverAnchor, setPopoverAnchor] = React.useState<HTMLElement | null>(
    null
  );
  const [popoverRow, setPopoverRow] =
    React.useState<Deployments.ModelDeployment | null>(null);
  const { data } = Hooks.Deployments.useList();
  const { start, isLoading: isStarting } =
    Hooks.Deployments.useStartModelDeployment();
  const { stop, isLoading: isStopping } =
    Hooks.Deployments.useStopModelDeployment();
  const { undeploy, isLoading: isUndeploying } =
    Hooks.Deployments.useUndeployModelDeployment();
  const { data: modelsData } = Hooks.Models.useListByAuthor({ limit: 50 });
  const deployments = data?.result || [];
  const filteredDeployments = React.useMemo(() => {
    const normalizedQuery = filterQuery.trim().toLowerCase();
    if (!normalizedQuery) return deployments;

    return deployments.filter((deployment) =>
      [
        deployment.name,
        deployment.id,
        deployment.external_model_id,
        deployment.deployment_modality,
        deployment.endpoint?.slug,
        deployment.reconciliation_status,
        deployment.batch_execution_outcome,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [deployments, filterQuery]);
  const { activeDeployments, terminalDeployments } = React.useMemo(() => {
    const newestFirst = [...filteredDeployments].sort((left, right) => {
      const rightTimestamp = Date.parse(right.created_at);
      const leftTimestamp = Date.parse(left.created_at);

      return (
        (Number.isNaN(rightTimestamp) ? 0 : rightTimestamp) -
        (Number.isNaN(leftTimestamp) ? 0 : leftTimestamp)
      );
    });

    return newestFirst.reduce<{
      activeDeployments: Deployments.ModelDeployment[];
      terminalDeployments: Deployments.ModelDeployment[];
    }>(
      (groups, deployment) => {
        if (isTerminalDeployment(deployment)) {
          groups.terminalDeployments.push(deployment);
        } else {
          groups.activeDeployments.push(deployment);
        }
        return groups;
      },
      { activeDeployments: [], terminalDeployments: [] }
    );
  }, [filteredDeployments]);
  const modelsByExternalId = React.useMemo(
    () =>
      new Map(
        (modelsData?.result ?? []).map((model) => [
          model.external_model_id,
          model,
        ])
      ),
    [modelsData?.result]
  );
  const { username } = useTapisConfig();
  const { navigate } = useNavigate();
  const isLifecycleMutating = isStarting || isStopping || isUndeploying;
  const openDeployment = React.useCallback(
    (deployment: Deployments.ModelDeployment) =>
      navigate(`/deployments/${encodeURIComponent(deployment.id)}`),
    [navigate]
  );

  const startDeployment = (deployment: Deployments.ModelDeployment) => {
    start(
      { deploymentId: deployment.id },
      {
        onError: (error) => {
          toast.error(error.message || 'Unable to start deployment.');
        },
        onSuccess: () => {
          toast.success(`Started ${deployment.name}.`);
        },
      }
    );
  };

  const stopDeployment = (deployment: Deployments.ModelDeployment) => {
    stop(
      { deploymentId: deployment.id },
      {
        onError: (error) => {
          toast.error(error.message || 'Unable to stop deployment.');
        },
        onSuccess: () => {
          toast.success(`Stopped ${deployment.name}.`);
        },
      }
    );
  };

  const undeployDeployment = (deployment: Deployments.ModelDeployment) => {
    undeploy(
      { deploymentId: deployment.id },
      {
        onError: (error) => {
          toast.error(error.message || 'Unable to undeploy deployment.');
        },
        onSuccess: () => {
          toast.success(`Undeployed ${deployment.name}.`);
        },
      }
    );
  };

  const columns: GridColDef<Deployments.ModelDeployment>[] = [
    {
      field: 'name',
      headerName: 'Deployment Name',
      flex: 1.8,
      minWidth: 280,
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
          onClick={() => openDeployment(params.row)}
        >
          <RocketLaunchIcon sx={{ color: 'success.main', fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'external_model_id',
      headerName: 'Model',
      flex: 1.6,
      minWidth: 240,
      renderCell: (params) => {
        const model = modelsByExternalId.get(params.row.external_model_id);

        return (
          <Box
            onClick={() => model && setSelectedModel(model)}
            sx={{
              alignItems: 'center',
              cursor: model ? 'pointer' : 'default',
              display: 'flex',
              gap: 1,
              '&:hover': model
                ? {
                    '& .MuiTypography-root:first-of-type': {
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }
                : undefined,
            }}
          >
            <SmartToy sx={{ color: 'secondary.main', fontSize: 18 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {model?.name ?? params.row.external_model_id}
              </Typography>
              <Typography variant="caption">
                {params.row.deployment_modality} deployment
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'reconciliation_status',
      headerName: 'Status',
      minWidth: 150,
      renderCell: (params) => {
        if (isDeploymentExpired(params.row)) {
          return (
            <Chip
              color="warning"
              label="Expired"
              size="small"
              variant="outlined"
            />
          );
        }

        const status = reconciliationStatusPresentation(params.value);

        return <Chip color={status.color} label={status.label} size="small" />;
      },
    },
    {
      field: 'batch_execution_outcome',
      headerName: 'Batch result',
      minWidth: 140,
      renderCell: (params) => {
        const outcome = batchOutcomePresentation(params.value);

        return (
          <Chip color={outcome.color} label={outcome.label} size="small" />
        );
      },
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
          params.row.replicas.parallelism_strategies ?? [];

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
      field: 'deployment_option_id',
      headerName: 'Deployment option',
      minWidth: 190,
      renderCell: (params) => (
        <Typography color="text.secondary" variant="caption" noWrap>
          {params.row.deployment_option_id}
        </Typography>
      ),
    },
    {
      field: 'endpoint',
      headerName: 'Endpoint',
      minWidth: 180,
      renderCell: (params) => (
        <Typography color="text.secondary" noWrap variant="caption">
          {params.row.endpoint?.slug ?? 'Pending'}
        </Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Deployed At',
      width: 200,
      valueGetter: (_value, row) =>
        row.created_at
          ? new Date(row.created_at).toLocaleString()
          : 'Not available',
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

  const renderTable = (rows: Deployments.ModelDeployment[]) => (
    <DataGrid
      autoHeight
      rows={rows}
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
        '& .MuiDataGrid-cell': {
          display: 'flex',
          alignItems: 'center',
        },
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
        '& .MuiDataGrid-iconButtonContainer': {
          color: 'text.secondary',
        },
        '& .MuiDataGrid-menuIconButton': { color: 'text.secondary' },
      }}
    />
  );

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

      <Card
        variant="outlined"
        sx={{
          display: 'flex',
          alignItems: { xs: 'stretch', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          justifyContent: 'space-between',
          mb: 1.5,
          p: 1.5,
          borderRadius: '2px',
        }}
      >
        <TextField
          fullWidth
          onChange={(event) => setFilterQuery(event.target.value)}
          placeholder="Filter deployments..."
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: { sm: 480 } }}
          value={filterQuery}
        />
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ToggleButtonGroup
            aria-label="Deployment view"
            exclusive
            onChange={(_event, nextView: DeploymentView | null) => {
              if (nextView) setView(nextView);
            }}
            size="small"
            sx={{ '& .MuiToggleButton-root': { borderRadius: '2px' } }}
            value={view}
          >
            <ToggleButton aria-label="Table view" value="table">
              <ViewListRoundedIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton aria-label="Card view" value="cards">
              <ViewAgendaRoundedIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            color="success"
            onClick={() => setDialog('deployments')}
            size="small"
            startIcon={<RocketLaunchIcon />}
            variant="contained"
          >
            New Deployment
          </Button>
        </Stack>
      </Card>

      {/* Deployments */}
      <Card
        sx={{
          borderRadius: '2px',
          '& .MuiDataGrid-root': { border: 'none' },
        }}
      >
        {view === 'table' ? (
          <Stack spacing={3} sx={{ p: 2 }}>
            <Box>
              <DeploymentSectionHeader
                count={activeDeployments.length}
                description="Deployments that are still running or can be managed."
                title="Active deployments"
              />
              {activeDeployments.length ? (
                renderTable(activeDeployments)
              ) : (
                <NoActiveDeployments
                  onNewDeployment={() => setDialog('deployments')}
                />
              )}
            </Box>
            {terminalDeployments.length > 0 && (
              <Box>
                <DeploymentSectionHeader
                  count={terminalDeployments.length}
                  description="Deployments that have reached a final outcome."
                  title="Terminal deployments"
                />
                {renderTable(terminalDeployments)}
              </Box>
            )}
          </Stack>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 1.25,
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(2, minmax(0, 1fr))',
              },
              p: 2,
            }}
          >
            <Box sx={{ gridColumn: '1 / -1' }}>
              <DeploymentSectionHeader
                count={activeDeployments.length}
                description="Deployments that are still running or can be managed."
                title="Active deployments"
              />
            </Box>
            {activeDeployments.length ? (
              activeDeployments.map((deployment) => (
                <DeploymentCard
                  deployment={deployment}
                  isMutating={isLifecycleMutating}
                  key={deployment.id}
                  model={modelsByExternalId.get(deployment.external_model_id)}
                  onSelect={openDeployment}
                  onStart={() => startDeployment(deployment)}
                  onStop={() => stopDeployment(deployment)}
                  onUndeploy={() => undeployDeployment(deployment)}
                />
              ))
            ) : (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <NoActiveDeployments
                  onNewDeployment={() => setDialog('deployments')}
                />
              </Box>
            )}
            {terminalDeployments.length > 0 && (
              <Box sx={{ gridColumn: '1 / -1', mt: 1.5 }}>
                <DeploymentSectionHeader
                  count={terminalDeployments.length}
                  description="Deployments that have reached a final outcome."
                  title="Terminal deployments"
                />
              </Box>
            )}
            {terminalDeployments.map((deployment) => (
              <DeploymentCard
                deployment={deployment}
                isMutating={isLifecycleMutating}
                key={deployment.id}
                model={modelsByExternalId.get(deployment.external_model_id)}
                onSelect={openDeployment}
                onStart={() => startDeployment(deployment)}
                onStop={() => stopDeployment(deployment)}
                onUndeploy={() => undeployDeployment(deployment)}
              />
            ))}
          </Box>
        )}
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
              if (popoverRow) openDeployment(popoverRow);
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
      <ModelDetailDrawer
        model={selectedModel}
        onClose={() => setSelectedModel(null)}
      />
    </Box>
  );
}
