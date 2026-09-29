import * as React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  alpha,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Slider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PublicIcon from '@mui/icons-material/Public';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import {
  frameworkLabelMap as inferenceBackendLabelMap,
  frameworkColorMap as inferenceBackendColorMap,
} from '../../_components/constants';
import { ALL_INFERENCE_BACKENDS } from '../../enums';
import { TASKS_BY_CATEGORY, CATEGORY_COLOR_MAP } from '../../data/taskTypes';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import * as Models from '@mlhub/models-ts-sdk';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { useModelFilter } from '../../_context/ModelFilterContext/ModelFilterContext';
import { Check, Inventory2Outlined, Storefront } from '@mui/icons-material';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { ModelMarketplaceListing } from './_components/ModelMarketplaceListing';
import { useNavigate } from '../../_context/NavContext';
import {
  derivedMetadataFor,
  modelAuthorFor,
  modelNameFor,
} from '../../modelMetadata';

type DiscoverModelsResponseMetadata = {
  count?: number;
  cursor?: string;
};

const MAX_SIZE_GIB = 1024;
const BYTES_PER_GIB = 1024 ** 3;
const DEFAULT_SIZE_RANGE: [number, number] = [0, MAX_SIZE_GIB];
const DEFAULT_LIMIT = 10;

const formatSize = (gib: number) =>
  gib === 0 ? '0 B' : gib >= MAX_SIZE_GIB ? '1 TiB+' : `${gib} GiB`;

const initialReducerState: ReducerState = {
  cursors: [undefined],
  nextCursor: undefined,
  prevCursor: undefined,
  currentCursor: undefined,
};

type ReducerState = {
  cursors: Array<string | undefined>;
  prevCursor: string | undefined;
  currentCursor: string | undefined;
  nextCursor: string | undefined;
};

type ReducerAction =
  | { type: 'push'; cursor: string | undefined }
  | { type: 'pop'; cursor: string | undefined }
  | { type: 'clear' };

const reducer = (state: ReducerState, action: ReducerAction): ReducerState => {
  let cursors: Array<string | undefined> = [...state.cursors];
  let next = state.nextCursor;
  let current = state.currentCursor;
  let previous = state.prevCursor;
  switch (action.type) {
    case 'push':
      cursors = [...cursors, action.cursor];
      next = cursors.at(-1);
      current = cursors.at(-2);
      previous = cursors.at(-3);

      return {
        cursors,
        prevCursor: previous,
        currentCursor: current,
        nextCursor: next,
      };
    case 'pop':
      let stack = [...state.cursors];
      // Update the last cursor with the cursor provided by the api call
      stack.pop(); // remove the last cursor from the cursor stack
      if (action.cursor !== undefined) {
        stack.pop(); // remove the previous cursor from the cursor stack
        stack = [...stack, action.cursor]; // Add the new
      }

      return {
        cursors: stack,
        prevCursor: stack.at(-3),
        currentCursor: stack.at(-2),
        nextCursor: stack.at(-1),
      };

    case 'clear':
      return initialReducerState;
  }
};

export default function ModelMarketplace() {
  const { navigate } = useNavigate();
  const [state, dispatch] = React.useReducer(reducer, initialReducerState);

  // ─── Filter state ───────────────────────────────
  const {
    limit,
    setLimit,
    libraries: selectedBackends,
    setLibraries: setSelectedBackends,
    taskTypes: selectedTasks,
    setTaskTypes: setSelectedTasks,
  } = useModelFilter();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [provider, setProvider] = React.useState<Models.ModelProvider | 'all'>(
    'all'
  );
  const [sizeRange, setSizeRange] =
    React.useState<[number, number]>(DEFAULT_SIZE_RANGE);
  const [dataCenter, setDataCenter] = React.useState<
    Deployments.ListHpcClustersDataCenterEnum | ''
  >('');
  const [hpcClusterId, setHpcClusterId] = React.useState('');
  const [batchSchedulerQueueId, setBatchSchedulerQueueId] = React.useState('');
  const [deploymentModalities, setDeploymentModalities] = React.useState<
    Models.DeploymentModality[]
  >([]);
  const [servingRuntimes, setServingRuntimes] = React.useState<
    Models.ServingRuntime[]
  >([]);
  const [hasDeploymentOptions, setHasDeploymentOptions] = React.useState<
    'any' | 'yes' | 'no'
  >('any');
  const clustersQuery = Hooks.Deployments.Targets.useListHpcClusters(
    {
      dataCenter: dataCenter || Deployments.ListHpcClustersDataCenterEnum.Tacc,
      limit: 50,
    },
    { enabled: !!dataCenter }
  );
  const clusterOptions = clustersQuery.data?.result ?? [];
  const selectedCluster = clusterOptions.find(
    (cluster) => cluster.id === hpcClusterId
  );
  const clusterDetailsQuery = Hooks.Deployments.Targets.useGetHpcCluster(
    dataCenter && hpcClusterId
      ? {
          dataCenter:
            dataCenter as unknown as Deployments.GetHpcClusterDataCenterEnum,
          hpcClusterId,
        }
      : undefined
  );
  const queueOptions = clusterDetailsQuery.data?.result?.queues ?? [];
  const selectedQueue = queueOptions.find(
    (queue) => queue.id === batchSchedulerQueueId
  );

  // ─── Model discovery ───────────────────────────────
  const { data, discover, isLoading, isError, error } =
    Hooks.Models.useDiscoverModels({
      options: {
        autoRunParams: {
          limit,
          includeCount: true,
          discoverExternalModelsBody: {},
        },
      },
    });

  const models = data?.result ?? [];
  const respMetadata = (data?.metadata as DiscoverModelsResponseMetadata) ?? {};

  const onSuccessSearch = (result: Models.DiscoverExternalModelsResponse) => {
    let cursor = (result.metadata as DiscoverModelsResponseMetadata).cursor;
    if (!!cursor) {
      dispatch({
        type: 'push',
        cursor: cursor!,
      });
    }
  };

  const onSuccessNext = (result: Models.DiscoverExternalModelsResponse) => {
    let cursor = (result.metadata as DiscoverModelsResponseMetadata).cursor;
    dispatch({
      type: 'push',
      cursor: cursor!,
    });
  };

  const onSuccessPrevious = (result: Models.DiscoverExternalModelsResponse) => {
    let cursor = (result.metadata as DiscoverModelsResponseMetadata).cursor;
    dispatch({
      type: 'pop',
      cursor: cursor!,
    });
  };

  const buildDiscoveryCriterion = (): Models.DiscoveryCriterion => {
    const criterion: Models.DiscoveryCriterion = {};

    if (selectedBackends.length > 0) {
      criterion['inference_runtimes'] = selectedBackends;
    }

    if (selectedTasks.length > 0) {
      criterion['task_types'] = selectedTasks;
    }

    if (provider !== 'all') criterion['provider'] = provider;
    if (sizeRange[0] > 0) criterion['min_size'] = sizeRange[0] * BYTES_PER_GIB;
    if (sizeRange[1] < MAX_SIZE_GIB)
      criterion['max_size'] = sizeRange[1] * BYTES_PER_GIB;
    if (hpcClusterId) {
      criterion.hpc_cluster_ids = [hpcClusterId];
    }
    if (batchSchedulerQueueId) {
      criterion.batch_scheduler_queue_ids = [batchSchedulerQueueId];
    }
    if (deploymentModalities.length) {
      criterion.supported_deployment_modalities = deploymentModalities;
    }
    if (servingRuntimes.length) {
      criterion.serving_runtimes = servingRuntimes;
    }
    if (hasDeploymentOptions !== 'any') {
      criterion.has_deployment_options = hasDeploymentOptions === 'yes';
    }

    return criterion;
  };

  const handleDiscover = () => {
    const criterion = buildDiscoveryCriterion();

    dispatch({ type: 'clear' });
    discover(
      {
        limit: limit ?? 10,
        includeCount: true,
        discoverExternalModelsBody: {
          criteria: [criterion],
        },
      },
      {
        onSuccess: onSuccessSearch,
      }
    );
  };

  // ─── Filtering logic ────────────────────────────
  const filteredModels = React.useMemo(() => {
    return models.filter((model) => {
      const derived = derivedMetadataFor(model);
      const taskTypes = derived.task_types;
      const libraries = derived.inference_runtimes;
      // Search filter (name, description, task, author, tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          modelNameFor(model),
          ...taskTypes,
          modelAuthorFor(model),
          ...derived.tags,
          ...libraries,
        ]
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [models, searchQuery, selectedTasks, selectedBackends]);

  // ─── Toggle helpers ────────────────────────────
  const toggleBackend = (lib: string) => {
    if (selectedBackends.includes(lib)) {
      let modifiedBackends = selectedBackends.filter((l) => l !== lib);
      setSelectedBackends(modifiedBackends);
      return modifiedBackends;
    }

    setSelectedBackends([...selectedBackends, lib]);
    return [...selectedBackends, lib];
  };

  const toggleTask = (task: Models.Task) => {
    if (selectedTasks.includes(task)) {
      let modifiedTasks = selectedTasks.filter((l) => l !== task);
      setSelectedTasks(modifiedTasks);
      return modifiedTasks;
    }

    setSelectedTasks([...selectedTasks, task]);
    return [...selectedTasks, task];
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTasks([]);
    setSelectedBackends([]);
    setProvider('all');
    setSizeRange(DEFAULT_SIZE_RANGE);
    setDataCenter('');
    setHpcClusterId('');
    setBatchSchedulerQueueId('');
    setDeploymentModalities([]);
    setServingRuntimes([]);
    setHasDeploymentOptions('any');
    setLimit(DEFAULT_LIMIT);
  };

  const hasActiveFilters =
    selectedTasks.length > 0 ||
    selectedBackends.length > 0 ||
    provider !== 'all' ||
    sizeRange[0] > 0 ||
    sizeRange[1] < MAX_SIZE_GIB ||
    !!hpcClusterId ||
    !!batchSchedulerQueueId ||
    deploymentModalities.length > 0 ||
    servingRuntimes.length > 0 ||
    hasDeploymentOptions !== 'any' ||
    limit !== DEFAULT_LIMIT;
  // Applying the default limit is meaningful after a user changes it back
  // from a larger page size, so a clean/default filter state is still valid.
  const canApply = true;
  const hasSizeFilter = sizeRange[0] > 0 || sizeRange[1] < MAX_SIZE_GIB;
  const activeFilterCount =
    selectedTasks.length +
    selectedBackends.length +
    (provider !== 'all' ? 1 : 0) +
    (hasSizeFilter ? 1 : 0) +
    (hpcClusterId ? 1 : 0) +
    (batchSchedulerQueueId ? 1 : 0) +
    deploymentModalities.length +
    servingRuntimes.length +
    (hasDeploymentOptions !== 'any' ? 1 : 0) +
    (limit !== DEFAULT_LIMIT ? 1 : 0);
  const taskLabel = (value: Models.Task) =>
    TASKS_BY_CATEGORY.flatMap((group) => group.tasks).find(
      (task) => task.value === value
    )?.label ?? String(value);
  const setSizeBound = (bound: 'min' | 'max', rawValue: number) => {
    if (!Number.isFinite(rawValue)) return;

    const value = Math.min(Math.max(rawValue, 0), MAX_SIZE_GIB);
    setSizeRange(([currentMin, currentMax]) =>
      bound === 'min'
        ? [Math.min(value, currentMax), currentMax]
        : [currentMin, Math.max(value, currentMin)]
    );
  };
  const applyFilters = () => {
    setShowFilters(false);
    handleDiscover();
  };

  return (
    <Box>
      {/* ─── Header ─────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1,
            mb: 0.5,
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
            <Storefront sx={{ fontSize: 28, color: 'info.main' }} />
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
            >
              Model Marketplace
            </Typography>
          </Stack>
          <Button
            size="small"
            startIcon={<Inventory2Outlined />}
            variant="outlined"
            onClick={() => navigate('/models')}
            sx={{ textTransform: 'none' }}
          >
            View My Models
          </Button>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Discover and explore curated models from leading ML platforms —
          brought to you by MLHub.
        </Typography>
      </Box>

      {/* ─── Search + Filter Bar ─────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5 }}
          >
            <TextField
              placeholder="Search by name, task, author, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{ color: 'text.secondary', fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery('')}
                        edge="end"
                      >
                        <ClearIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                bgcolor: 'background.default',
              }}
            />

            <Tooltip title="Show filters">
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(true)}
                sx={{
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  borderRadius: '8px',
                }}
              >
                Filters
                {hasActiveFilters && (
                  <Chip
                    label={activeFilterCount}
                    size="small"
                    color="primary"
                    sx={{
                      ml: 1,
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  />
                )}
              </Button>
            </Tooltip>

            {hasActiveFilters && (
              <Button
                size="small"
                onClick={clearAllFilters}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
              >
                Clear all
              </Button>
            )}
          </Stack>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 0.75,
              minHeight: 52,
              mt: 1.5,
              pt: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 700,
                letterSpacing: '0.04em',
                lineHeight: '28px',
                mr: 0.25,
                textTransform: 'uppercase',
              }}
            >
              Applied filters
            </Typography>
            {hasActiveFilters ? (
              <>
                {selectedBackends.map((backend) => {
                  const backendColor =
                    (inferenceBackendColorMap as Record<string, string>)[
                      backend
                    ] ?? 'primary.main';
                  const backendLabel =
                    (inferenceBackendLabelMap as Record<string, string>)[
                      backend
                    ] ?? backend;

                  return (
                    <Chip
                      key={backend}
                      size="small"
                      label={backendLabel}
                      onDelete={() => toggleBackend(backend)}
                      sx={{
                        bgcolor: alpha(backendColor, 0.12),
                        border: '1px solid',
                        borderColor: alpha(backendColor, 0.35),
                        color: 'text.primary',
                        fontWeight: 600,
                        '& .MuiChip-deleteIcon': { color: 'text.secondary' },
                      }}
                    />
                  );
                })}
                {selectedTasks.map((task) => (
                  <Chip
                    key={String(task)}
                    size="small"
                    label={taskLabel(task)}
                    onDelete={() => toggleTask(task)}
                    sx={{
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.08),
                      border: '1px solid',
                      borderColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.28),
                      color: 'text.primary',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': { color: 'text.secondary' },
                    }}
                  />
                ))}
                {provider !== 'all' && (
                  <Chip
                    size="small"
                    label={`Provider: ${
                      provider === Models.ModelProvider.HuggingFace
                        ? 'Hugging Face'
                        : 'Tapis'
                    }`}
                    onDelete={() => setProvider('all')}
                    sx={{
                      bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                      border: '1px solid',
                      borderColor: (theme) =>
                        alpha(theme.palette.info.main, 0.28),
                      color: 'text.primary',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': { color: 'text.secondary' },
                    }}
                  />
                )}
                {hasSizeFilter && (
                  <Chip
                    size="small"
                    label={`Size: ${formatSize(sizeRange[0])} – ${formatSize(
                      sizeRange[1]
                    )}`}
                    onDelete={() => setSizeRange(DEFAULT_SIZE_RANGE)}
                    sx={{
                      bgcolor: (theme) =>
                        alpha(theme.palette.secondary.main, 0.08),
                      border: '1px solid',
                      borderColor: (theme) =>
                        alpha(theme.palette.secondary.main, 0.28),
                      color: 'text.primary',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': { color: 'text.secondary' },
                    }}
                  />
                )}
                {hpcClusterId && (
                  <Chip
                    size="small"
                    label={`HPC cluster: ${
                      selectedCluster?.name ?? hpcClusterId
                    }`}
                    onDelete={() => {
                      setHpcClusterId('');
                      setBatchSchedulerQueueId('');
                    }}
                    sx={{
                      bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                      border: '1px solid',
                      borderColor: (theme) =>
                        alpha(theme.palette.info.main, 0.28),
                      color: 'text.primary',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': { color: 'text.secondary' },
                    }}
                  />
                )}
                {batchSchedulerQueueId && (
                  <Chip
                    size="small"
                    label={`Scheduler queue: ${
                      selectedQueue?.name ?? batchSchedulerQueueId
                    }`}
                    onDelete={() => setBatchSchedulerQueueId('')}
                    sx={{
                      bgcolor: (theme) =>
                        alpha(theme.palette.secondary.main, 0.08),
                      border: '1px solid',
                      borderColor: (theme) =>
                        alpha(theme.palette.secondary.main, 0.28),
                      color: 'text.primary',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': { color: 'text.secondary' },
                    }}
                  />
                )}
                {deploymentModalities.map((modality) => (
                  <Chip
                    key={modality}
                    size="small"
                    label={`Modality: ${modality}`}
                    onDelete={() =>
                      setDeploymentModalities((current) =>
                        current.filter((value) => value !== modality)
                      )
                    }
                    sx={{
                      bgcolor: (theme) =>
                        alpha(theme.palette.success.main, 0.08),
                      border: '1px solid',
                      borderColor: (theme) =>
                        alpha(theme.palette.success.main, 0.28),
                      color: 'text.primary',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': { color: 'text.secondary' },
                    }}
                  />
                ))}
                {servingRuntimes.map((runtime) => (
                  <Chip
                    key={runtime}
                    size="small"
                    label={`Runtime: ${runtime}`}
                    onDelete={() =>
                      setServingRuntimes((current) =>
                        current.filter((value) => value !== runtime)
                      )
                    }
                    sx={{
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.08),
                      border: '1px solid',
                      borderColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.28),
                      color: 'text.primary',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': { color: 'text.secondary' },
                    }}
                  />
                ))}
                {hasDeploymentOptions !== 'any' && (
                  <Chip
                    size="small"
                    label={
                      hasDeploymentOptions === 'yes'
                        ? 'Deployment options: available'
                        : 'Deployment options: none'
                    }
                    onDelete={() => setHasDeploymentOptions('any')}
                    sx={{
                      bgcolor: (theme) =>
                        alpha(theme.palette.warning.main, 0.1),
                      border: '1px solid',
                      borderColor: (theme) =>
                        alpha(theme.palette.warning.main, 0.3),
                      color: 'text.primary',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': { color: 'text.secondary' },
                    }}
                  />
                )}
                {limit !== DEFAULT_LIMIT && (
                  <Chip
                    size="small"
                    label={`Limit: ${limit}`}
                    onDelete={() => setLimit(DEFAULT_LIMIT)}
                    sx={{
                      bgcolor: (theme) =>
                        alpha(theme.palette.warning.main, 0.1),
                      border: '1px solid',
                      borderColor: (theme) =>
                        alpha(theme.palette.warning.main, 0.3),
                      color: 'text.primary',
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': { color: 'text.secondary' },
                    }}
                  />
                )}
              </>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: '28px' }}
              >
                None selected
              </Typography>
            )}
          </Box>

          {/* ── Filter dialog ─────────────────────────── */}
          {showFilters && (
            <Dialog
              open={showFilters}
              onClose={() => setShowFilters(false)}
              fullWidth
              maxWidth="lg"
            >
              <DialogTitle sx={{ pb: 1 }}>Model filters</DialogTitle>
              <DialogContent dividers sx={{ py: 2.5 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  sx={{
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1.5,
                    mb: 1.5,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 750 }}>
                      Refine models
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose one or more backends and task types, then update
                      results.
                    </Typography>
                  </Box>
                  <Stack direction="row" sx={{ gap: 1, flexShrink: 0 }}>
                    <FormControl size="small" sx={{ minWidth: 118 }}>
                      <InputLabel id="model-limit-filter-label">
                        Limit
                      </InputLabel>
                      <Select
                        labelId="model-limit-filter-label"
                        label="Limit"
                        value={limit}
                        onChange={(event) =>
                          setLimit(Number(event.target.value))
                        }
                      >
                        {[10, 25, 50].map((value) => (
                          <MenuItem key={value} value={value}>
                            {value} models
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={clearAllFilters}
                      disabled={!hasActiveFilters && !searchQuery.trim()}
                      sx={{
                        color: 'text.primary',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        textTransform: 'none',
                        fontWeight: 650,
                        '&:hover': {
                          borderColor: 'text.secondary',
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      Clear all
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={applyFilters}
                      disabled={!canApply}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        color: 'primary.contrastText',
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none' },
                      }}
                    >
                      Apply filters
                    </Button>
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      lg: 'minmax(220px, 0.8fr) minmax(0, 2fr)',
                    },
                    gap: 2,
                  }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      gridColumn: { xs: 'auto', lg: '1 / -1' },
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Stack sx={{ gap: 2 }}>
                      <Box sx={{ px: { xs: 0.5, md: 1 } }}>
                        <Stack
                          direction="row"
                          sx={{
                            justifyContent: 'space-between',
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700 }}
                            >
                              Model size
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Type an exact value or drag the range handles.
                            </Typography>
                          </Box>
                          {hasSizeFilter && (
                            <Button
                              size="small"
                              onClick={() => setSizeRange(DEFAULT_SIZE_RANGE)}
                              sx={{
                                alignSelf: 'center',
                                textTransform: 'none',
                              }}
                            >
                              Reset size
                            </Button>
                          )}
                        </Stack>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          sx={{ gap: 1, mb: 0.5 }}
                        >
                          <TextField
                            label="Min size"
                            size="small"
                            type="number"
                            value={sizeRange[0]}
                            onChange={(event) =>
                              setSizeBound('min', Number(event.target.value))
                            }
                            slotProps={{
                              htmlInput: { min: 0, max: MAX_SIZE_GIB },
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    GiB
                                  </InputAdornment>
                                ),
                              },
                            }}
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            label="Max size"
                            size="small"
                            type="number"
                            value={sizeRange[1]}
                            onChange={(event) =>
                              setSizeBound('max', Number(event.target.value))
                            }
                            slotProps={{
                              htmlInput: { min: 0, max: MAX_SIZE_GIB },
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    GiB
                                  </InputAdornment>
                                ),
                              },
                            }}
                            sx={{ flex: 1 }}
                          />
                        </Stack>
                        <Slider
                          key={sizeRange.join('-')}
                          defaultValue={sizeRange}
                          min={0}
                          max={MAX_SIZE_GIB}
                          step={10}
                          marks={[
                            { value: 0, label: '0 B' },
                            { value: 100, label: '100 GiB' },
                            { value: MAX_SIZE_GIB, label: '1 TiB+' },
                          ]}
                          valueLabelDisplay="auto"
                          valueLabelFormat={formatSize}
                          onChangeCommitted={(_event, nextValue) => {
                            if (Array.isArray(nextValue)) {
                              setSizeRange(nextValue as [number, number]);
                            }
                          }}
                          aria-label="Model size range"
                        />
                      </Box>
                      <FormControl
                        size="small"
                        sx={{ width: { xs: '100%', sm: 240 } }}
                      >
                        <InputLabel id="model-provider-filter-label">
                          Provider
                        </InputLabel>
                        <Select
                          labelId="model-provider-filter-label"
                          label="Provider"
                          value={provider}
                          onChange={(event) =>
                            setProvider(
                              event.target.value as Models.ModelProvider | 'all'
                            )
                          }
                        >
                          <MenuItem value="all">All providers</MenuItem>
                          <MenuItem value={Models.ModelProvider.HuggingFace}>
                            Hugging Face
                          </MenuItem>
                          <MenuItem value={Models.ModelProvider.Tapis}>
                            Tapis
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Paper>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}
                    >
                      <MemoryOutlinedIcon color="primary" fontSize="small" />
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700 }}
                        >
                          Inference backends
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Runtime or framework support
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                      {ALL_INFERENCE_BACKENDS.map((backend) => {
                        const isSelected = selectedBackends.includes(backend);
                        const color = inferenceBackendColorMap[backend];
                        return (
                          <Chip
                            key={backend}
                            label={inferenceBackendLabelMap[backend] ?? backend}
                            icon={isSelected ? <Check /> : undefined}
                            onClick={() => toggleBackend(backend)}
                            variant="outlined"
                            sx={{
                              bgcolor: isSelected
                                ? alpha(color, 0.14)
                                : 'background.paper',
                              color: 'text.primary',
                              borderColor: isSelected ? color : 'divider',
                              '& .MuiChip-icon': {
                                color: `${color} !important`,
                              },
                              '& .MuiChip-label': {
                                fontWeight: isSelected ? 700 : 500,
                              },
                            }}
                          />
                        );
                      })}
                    </Stack>
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}
                    >
                      <TaskAltIcon color="primary" fontSize="small" />
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700 }}
                        >
                          Task types
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          The kind of work a model is designed to perform
                        </Typography>
                      </Box>
                    </Stack>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, minmax(0, 1fr))',
                        },
                        gap: 1.5,
                      }}
                    >
                      {TASKS_BY_CATEGORY.map((group) => {
                        const catColor = CATEGORY_COLOR_MAP[group.category];
                        return (
                          <Box key={group.category}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 800,
                                mb: 0.75,
                                color: 'text.primary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: catColor,
                                }}
                              />
                              {group.category}
                            </Typography>
                            <Stack
                              direction="row"
                              sx={{ flexWrap: 'wrap', gap: 0.75 }}
                            >
                              {group.tasks.map((task) => {
                                const isSelected = selectedTasks.includes(
                                  task.value
                                );
                                return (
                                  <Chip
                                    key={String(task.value)}
                                    label={task.label}
                                    icon={isSelected ? <Check /> : undefined}
                                    onClick={() => toggleTask(task.value)}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                      bgcolor: isSelected
                                        ? alpha(catColor, 0.13)
                                        : 'background.paper',
                                      color: 'text.primary',
                                      borderColor: isSelected
                                        ? catColor
                                        : 'divider',
                                      '& .MuiChip-icon': {
                                        color: `${catColor} !important`,
                                      },
                                      '& .MuiChip-label': {
                                        fontWeight: isSelected ? 700 : 500,
                                      },
                                      transition:
                                        'background-color 0.15s ease, border-color 0.15s ease',
                                    }}
                                  />
                                );
                              })}
                            </Stack>
                          </Box>
                        );
                      })}
                    </Box>
                  </Paper>
                  <Paper
                    variant="outlined"
                    sx={{
                      gridColumn: { xs: 'auto', lg: '1 / -1' },
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: 700, mb: 0.5 }}
                      variant="subtitle2"
                    >
                      Deployment options
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ mb: 2.5 }}
                      variant="caption"
                    >
                      Filter models by compatible HPC targets, scheduler queues,
                      runtimes, and deployment modalities.
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gap: 1.5,
                        gridTemplateColumns: {
                          xs: '1fr',
                          md: 'repeat(2, minmax(0, 1fr))',
                        },
                      }}
                    >
                      <FormControl size="small">
                        <InputLabel id="data-center-filter-label">
                          Data center
                        </InputLabel>
                        <Select
                          label="Data center"
                          labelId="data-center-filter-label"
                          onChange={(event) => {
                            setDataCenter(
                              event.target.value as
                                | Deployments.ListHpcClustersDataCenterEnum
                                | ''
                            );
                            setHpcClusterId('');
                            setBatchSchedulerQueueId('');
                          }}
                          value={dataCenter}
                        >
                          <MenuItem value="">Select a data center</MenuItem>
                          {Object.values(
                            Deployments.ListHpcClustersDataCenterEnum
                          ).map((center) => (
                            <MenuItem key={center} value={center}>
                              {center}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl disabled={!dataCenter} size="small">
                        <InputLabel id="hpc-cluster-filter-label">
                          HPC cluster
                        </InputLabel>
                        <Select
                          label="HPC cluster"
                          labelId="hpc-cluster-filter-label"
                          onChange={(event) => {
                            setHpcClusterId(event.target.value);
                            setBatchSchedulerQueueId('');
                          }}
                          value={hpcClusterId}
                        >
                          <MenuItem value="">
                            {clustersQuery.isLoading
                              ? 'Loading clusters…'
                              : 'Select an HPC cluster'}
                          </MenuItem>
                          {clusterOptions.map((cluster) => (
                            <MenuItem key={cluster.id} value={cluster.id}>
                              {cluster.name}
                              {cluster.enabled ? '' : ' (disabled)'}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl disabled={!hpcClusterId} size="small">
                        <InputLabel id="batch-scheduler-queue-filter-label">
                          Scheduler queue
                        </InputLabel>
                        <Select
                          label="Scheduler queue"
                          labelId="batch-scheduler-queue-filter-label"
                          onChange={(event) =>
                            setBatchSchedulerQueueId(event.target.value)
                          }
                          value={batchSchedulerQueueId}
                        >
                          <MenuItem value="">
                            {clusterDetailsQuery.isLoading
                              ? 'Loading queues…'
                              : 'Select a scheduler queue'}
                          </MenuItem>
                          {queueOptions.map((queue) => (
                            <MenuItem key={queue.id} value={queue.id}>
                              {queue.name}
                              {queue.enabled ? '' : ' (disabled)'}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl size="small">
                        <InputLabel id="deployment-modalities-filter-label">
                          Deployment modalities
                        </InputLabel>
                        <Select
                          label="Deployment modalities"
                          labelId="deployment-modalities-filter-label"
                          multiple
                          onChange={(event) =>
                            setDeploymentModalities(
                              event.target.value as Models.DeploymentModality[]
                            )
                          }
                          renderValue={(selected) =>
                            (selected as Models.DeploymentModality[]).join(', ')
                          }
                          value={deploymentModalities}
                        >
                          {Object.values(Models.DeploymentModality).map(
                            (modality) => (
                              <MenuItem key={modality} value={modality}>
                                {modality}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                      <FormControl size="small">
                        <InputLabel id="serving-runtimes-filter-label">
                          Serving runtimes
                        </InputLabel>
                        <Select
                          label="Serving runtimes"
                          labelId="serving-runtimes-filter-label"
                          multiple
                          onChange={(event) =>
                            setServingRuntimes(
                              event.target.value as Models.ServingRuntime[]
                            )
                          }
                          renderValue={(selected) =>
                            (selected as Models.ServingRuntime[]).join(', ')
                          }
                          value={servingRuntimes}
                        >
                          {Object.values(Models.ServingRuntime).map(
                            (runtime) => (
                              <MenuItem key={runtime} value={runtime}>
                                {runtime}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                      <FormControl size="small">
                        <InputLabel id="has-deployment-options-filter-label">
                          Deployment options
                        </InputLabel>
                        <Select
                          label="Deployment options"
                          labelId="has-deployment-options-filter-label"
                          onChange={(event) =>
                            setHasDeploymentOptions(
                              event.target.value as 'any' | 'yes' | 'no'
                            )
                          }
                          value={hasDeploymentOptions}
                        >
                          <MenuItem value="any">Any availability</MenuItem>
                          <MenuItem value="yes">
                            Has deployment options
                          </MenuItem>
                          <MenuItem value="no">No deployment options</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Paper>
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters && !searchQuery.trim()}
                  sx={{
                    color: 'text.primary',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    textTransform: 'none',
                    fontWeight: 650,
                    '&:hover': {
                      borderColor: 'text.secondary',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  Clear all
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={applyFilters}
                  disabled={!canApply}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    color: 'primary.contrastText',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' },
                  }}
                >
                  Apply filters
                </Button>
              </DialogActions>
            </Dialog>
          )}
        </CardContent>
      </Card>

      {/* ─── Model Cards Grid ─────────────────────────── */}
      {isError ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'error.light',
            p: 4,
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Unable to load marketplace models
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error instanceof Error ? error.message : 'Please try again later.'}
          </Typography>
        </Card>
      ) : filteredModels.length === 0 && isLoading === false ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: '8px',
            border: '1px dashed',
            borderColor: 'divider',
            py: 10,
            textAlign: 'center',
          }}
        >
          <PublicIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No models found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Try adjusting your search or filter criteria.
          </Typography>
        </Card>
      ) : (
        <ModelMarketplaceListing
          models={filteredModels}
          count={respMetadata.count!}
          previous={
            state.prevCursor === undefined && state.currentCursor === undefined
              ? undefined
              : () => {
                  const criterion = buildDiscoveryCriterion();
                  discover(
                    {
                      limit,
                      includeCount: true,
                      cursor: state.prevCursor,
                      discoverExternalModelsBody: {
                        criteria: [criterion],
                      },
                    },
                    {
                      onSuccess: onSuccessPrevious,
                    }
                  );
                }
          }
          next={
            // TODO Really need to look into why I say < 0 here.
            state.cursors.length < 0 || state.nextCursor === undefined
              ? undefined
              : () => {
                  const criterion = buildDiscoveryCriterion();

                  discover(
                    {
                      limit,
                      includeCount: true,
                      cursor: state.cursors.at(-1),
                      discoverExternalModelsBody: {
                        criteria: [criterion],
                      },
                    },
                    {
                      onSuccess: onSuccessNext,
                    }
                  );
                }
          }
          isLoading={isLoading}
        />
      )}
    </Box>
  );
}
