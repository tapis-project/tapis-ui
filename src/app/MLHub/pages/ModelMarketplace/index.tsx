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
  FormControl,
  Select,
  MenuItem,
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
import * as Models from '@mlhub/models-ts-sdk';
import { useModelFilter } from '../../_context/ModelFilterContext/ModelFilterContext';
import { Check } from '@mui/icons-material';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { ModelMarketplaceListing } from './_components/ModelMarketplaceListing';

type DiscoverModelsResponseMetadata = {
  count?: number;
  cursor?: string;
};

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
  const tags: Models.ModelMetadata['tags'] = [];
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

  // ─── Model discovery ───────────────────────────────
  const { data, discover, isLoading, isError, error } =
    Hooks.Models.useDiscoverModels({});

  const models = data?.result ?? [];
  const respMetadata = (data?.metadata as DiscoverModelsResponseMetadata) ?? {};

  const onSuccessSearch = (result: Models.DiscoverModelsResponse) => {
    let cursor = (result.metadata as DiscoverModelsResponseMetadata).cursor;
    if (!!cursor) {
      dispatch({
        type: 'push',
        cursor: cursor!,
      });
    }
  };

  const onSuccessNext = (result: Models.DiscoverModelsResponse) => {
    let cursor = (result.metadata as DiscoverModelsResponseMetadata).cursor;
    dispatch({
      type: 'push',
      cursor: cursor!,
    });
  };

  const onSuccessPrevious = (result: Models.DiscoverModelsResponse) => {
    let cursor = (result.metadata as DiscoverModelsResponseMetadata).cursor;
    dispatch({
      type: 'pop',
      cursor: cursor!,
    });
  };

  const handleDiscover = () => {
    let criterion: Models.DiscoveryCriterion = {};

    if (selectedBackends.length > 0) {
      criterion['libraries'] = selectedBackends;
    }

    if (selectedTasks.length > 0) {
      criterion['task_types'] = selectedTasks;
    }

    console.log({ criterion });

    dispatch({ type: 'clear' });
    discover(
      {
        limit: limit ?? 10,
        includeCount: true,
        discoveryCriteria: {
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
      const taskTypes = model.task_types || [];
      const libraries = model.libraries || [];
      // Search filter (name, description, task, author, tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          model.name,
          // model.description,
          ...taskTypes,
          model.author,
          ...tags,
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
  };

  const hasActiveFilters =
    selectedTasks.length > 0 || selectedBackends.length > 0;
  const canApply = hasActiveFilters || !!searchQuery.trim();

  return (
    <Box>
      {/* ─── Header ─────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <PublicIcon sx={{ fontSize: 28, color: 'info.main' }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            Model Marketplace
          </Typography>
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
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
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

            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Limit
              </Typography>
              <FormControl size="small">
                <Select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  sx={{
                    height: 28,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    minWidth: 68,
                    borderRadius: 1.5,
                    '& .MuiSelect-select': { py: 0, px: 1.25 },
                  }}
                  MenuProps={{
                    slotProps: {
                      paper: {
                        sx: { borderRadius: 2, mt: 0.5 },
                      },
                    },
                  }}
                >
                  {[10, 25, 50, 100].map((v) => (
                    <MenuItem
                      value={v}
                      sx={{ fontSize: '0.8rem', fontWeight: 500 }}
                    >
                      {v}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Tooltip title={showFilters ? 'Hide filters' : 'Show filters'}>
              <Button
                variant={showFilters ? 'contained' : 'outlined'}
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                }}
              >
                Filters
                {hasActiveFilters && (
                  <Chip
                    label={
                      (searchQuery ? 1 : 0) +
                      selectedTasks.length +
                      selectedBackends.length
                    }
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

          {/* ── Expanded Filters ───────────────────────── */}
          {showFilters && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />

              {/* ── Inference Backend (top) ──────────────── */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}
                >
                  Inference Backend
                </Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                  {ALL_INFERENCE_BACKENDS.map((ib) => {
                    const isSelected = selectedBackends.includes(ib);
                    return (
                      <Chip
                        key={ib}
                        label={inferenceBackendLabelMap[ib] ?? ib}
                        icon={isSelected ? <Check /> : undefined}
                        onClick={() => toggleBackend(ib)}
                        variant={isSelected ? 'filled' : 'outlined'}
                        sx={{
                          bgcolor: isSelected
                            ? alpha(inferenceBackendColorMap[ib], 0.12)
                            : undefined,
                          color: isSelected
                            ? inferenceBackendColorMap[ib]
                            : undefined,
                          borderColor: isSelected ? undefined : 'divider',
                          '& .MuiChip-label': { fontWeight: 500 },
                          textTransform: 'capitalize',
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>

              <Divider sx={{ my: 2, opacity: 0.6 }} />

              {/* ── Task Types (grouped by category) ─────── */}
              <Box sx={{ mb: 2 }}>
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}
                >
                  <TaskAltIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}
                  >
                    Task Types
                  </Typography>
                </Stack>

                {TASKS_BY_CATEGORY.map((group) => {
                  const catColor = CATEGORY_COLOR_MAP[group.category];
                  return (
                    <Box key={group.category} sx={{ mb: 2.5 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 650,
                          mb: 1,
                          color: catColor,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: catColor,
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                        {group.category}
                      </Typography>
                      <Stack
                        direction="row"
                        sx={{ flexWrap: 'wrap', gap: 0.75 }}
                      >
                        {group.tasks.map((task) => {
                          const isSelected = selectedTasks.includes(task.value);
                          return (
                            <Chip
                              key={String(task.value)}
                              label={task.label}
                              icon={
                                isSelected ? (
                                  <Check sx={{ color: catColor }} />
                                ) : undefined
                              }
                              onClick={() => toggleTask(task.value)}
                              variant={isSelected ? 'filled' : 'outlined'}
                              size="small"
                              sx={{
                                ...(isSelected
                                  ? {
                                      bgcolor: alpha(catColor, 0.14),
                                      color: catColor,
                                      borderColor: catColor,
                                    }
                                  : {
                                      borderColor: alpha(catColor, 0.35),
                                      color: alpha(catColor, 0.85),
                                    }),
                                '& .MuiChip-label': { fontWeight: 500 },
                                textTransform: 'none',
                                fontSize: '0.78rem',
                                transition: 'all 0.15s ease-in-out',
                              }}
                            />
                          );
                        })}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>

              <Divider sx={{ opacity: 0.6 }} />

              {/* ── Action Buttons ───────────────────────── */}
              <Stack
                direction="row"
                sx={{ justifyContent: 'flex-end', gap: 1, mt: 2 }}
              >
                <Button
                  size="small"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters && !searchQuery.trim()}
                  sx={{ textTransform: 'none' }}
                >
                  Clear all
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    setShowFilters(false);
                    handleDiscover();
                  }}
                  disabled={!canApply}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: (theme) =>
                        `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                  }}
                >
                  Apply
                </Button>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ─── Model Cards Grid ─────────────────────────── */}
      {filteredModels.length === 0 && isLoading === false ? (
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
                  let criterion: Models.DiscoveryCriterion = {};

                  if (selectedBackends.length > 0) {
                    criterion['libraries'] = selectedBackends;
                  }

                  if (selectedTasks.length > 0) {
                    criterion['task_types'] = selectedTasks;
                  }
                  discover(
                    {
                      limit,
                      includeCount: true,
                      cursor: state.prevCursor,
                      discoveryCriteria: {
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
                  let criterion: Models.DiscoveryCriterion = {};

                  if (selectedBackends.length > 0) {
                    criterion['libraries'] = selectedBackends;
                  }

                  if (selectedTasks.length > 0) {
                    criterion['task_types'] = selectedTasks;
                  }

                  discover(
                    {
                      limit,
                      includeCount: true,
                      cursor: state.cursors.at(-1),
                      discoveryCriteria: {
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
