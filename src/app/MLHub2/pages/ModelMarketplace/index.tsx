import * as React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  alpha,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PublicIcon from '@mui/icons-material/Public';
import DownloadIcon from '@mui/icons-material/Download';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import type { MarketplaceModel, InferenceBackend } from '../../types';
import {
  frameworkLabelMap as inferenceBackendLabelMap,
  frameworkColorMap as inferenceBackendColorMap,
} from '../../_components/constants';
import { ALL_INFERENCE_BACKENDS, platformConfig } from '../../enums';
import {
  TASKS_BY_CATEGORY,
  CATEGORY_COLOR_MAP,
  type Task,
} from '../../data/taskTypes';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

interface ModelMarketplaceProps {
  models: MarketplaceModel[];
  onApply?: (filters: {
    tasks: Set<Task>;
    backends: InferenceBackend[];
    searchQuery: string;
  }) => void;
}

export default function ModelMarketplace({
  models,
  onApply,
}: ModelMarketplaceProps) {
  // ─── Filter state ───────────────────────────────
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTasks, setSelectedTasks] = React.useState<Set<Task>>(
    new Set()
  );
  const [selectedBackends, setSelectedBackends] = React.useState<
    InferenceBackend[]
  >([]);
  const [showFilters, setShowFilters] = React.useState(false);

  // ─── Filtering logic ────────────────────────────
  const filteredModels = React.useMemo(() => {
    return models.filter((model) => {
      // Search filter (name, description, task, author, tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          model.name,
          model.description,
          model.task,
          model.author,
          ...model.tags,
        ]
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      // Task type filter — match against task label or enum value string
      if (selectedTasks.size > 0) {
        const matches = [...selectedTasks].some(
          (t) =>
            t.label.toLowerCase() === model.task.toLowerCase() ||
            String(t.value).toLowerCase() === model.task.toLowerCase() ||
            model.task.toLowerCase().includes(t.label.toLowerCase()) ||
            t.label.toLowerCase().includes(model.task.toLowerCase())
        );
        if (!matches) return false;
      }

      // Inference backend filter
      if (
        selectedBackends.length > 0 &&
        !selectedBackends.some((b) => model.libraries.includes(b))
      )
        return false;

      return true;
    });
  }, [models, searchQuery, selectedTasks, selectedBackends]);

  // ─── Toggle helpers ────────────────────────────
  const toggleTask = (task: Task) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      next.has(task) ? next.delete(task) : next.add(task);
      return next;
    });
  };

  const toggleBackend = (backend: InferenceBackend) => {
    setSelectedBackends((prev) =>
      prev.includes(backend)
        ? prev.filter((b) => b !== backend)
        : [...prev, backend]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTasks(new Set());
    setSelectedBackends([]);
  };

  const hasActiveFilters =
    selectedTasks.size > 0 || selectedBackends.length > 0;
  const canApply = hasActiveFilters || !!searchQuery.trim();

  // ─── Format number helper ──────────────────────
  const formatCount = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

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
          borderRadius: 3,
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
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                bgcolor: 'background.default',
              }}
            />

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
                      selectedTasks.size +
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
                          const isSelected = selectedTasks.has(task);
                          return (
                            <Chip
                              key={String(task.value)}
                              label={task.label}
                              onClick={() => toggleTask(task)}
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
                  onClick={() =>
                    onApply?.({
                      tasks: selectedTasks,
                      backends: selectedBackends,
                      searchQuery,
                    })
                  }
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

      {/* ─── Results Summary ────────────────────────────── */}
      <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
        Showing {filteredModels.length} of {models.length} curated models
      </Typography>

      {/* ─── Model Cards Grid ─────────────────────────── */}
      {filteredModels.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
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
        <Grid container spacing={2.5}>
          {filteredModels.map((model) => {
            const platCfg = platformConfig[model.platform];

            return (
              <Grid size={{ xs: 12 }} key={model.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition:
                      'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: (theme) =>
                        `0 12px 28px ${alpha(theme.palette.primary.main, 0.1)}`,
                      borderColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.25),
                    },
                  }}
                >
                  {/* Card Header with platform badge */}
                  <Box
                    sx={{
                      px: 2.5,
                      pt: 2.25,
                      pb: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Chip
                      label={`${platCfg.icon} ${platCfg.label}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        borderColor: (theme) => alpha(platCfg.color, 0.4),
                        color: 'text.primary',
                        textTransform: 'none',
                      }}
                    />
                    <Tooltip title="Open on source platform">
                      <IconButton
                        size="small"
                        href={model.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        sx={{ opacity: 0.55, '&:hover': { opacity: 1 } }}
                      >
                        <OpenInNewIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <CardContent
                    sx={{
                      flex: 1,
                      p: 2.5,
                      pt: 0.5,
                      '&:last-child': { pb: 2.5 },
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Task badge */}
                    <Chip
                      label={model.task}
                      size="small"
                      color="primary"
                      variant="filled"
                      sx={{
                        alignSelf: 'flex-start',
                        fontWeight: 600,
                        fontSize: '0.68rem',
                        height: 22,
                        mb: 1.25,
                        textTransform: 'none',
                      }}
                    />

                    {/* Name */}
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, lineHeight: 1.35, mb: 0.25 }}
                    >
                      {model.name}
                    </Typography>

                    {/* Author info */}
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: 'block', mb: 0.75 }}
                    >
                      by {model.author}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.55,
                        mb: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 44,
                      }}
                    >
                      {model.description}
                    </Typography>

                    {/* Spacer */}
                    <Box sx={{ flex: 1 }} />

                    {/* Inference Backends */}
                    <Stack
                      direction="row"
                      sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}
                    >
                      {model.libraries.map((lib) => (
                        <Chip
                          key={lib}
                          label={inferenceBackendLabelMap[lib]}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.65rem',
                            height: 20,
                            textTransform: 'capitalize',
                            borderColor: alpha(
                              inferenceBackendColorMap[lib],
                              0.35
                            ),
                            color: inferenceBackendColorMap[lib],
                            fontWeight: 600,
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      ))}
                    </Stack>

                    {/* Tags + License */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        mb: 1.75,
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{ flexWrap: 'wrap', gap: 0.4 }}
                      >
                        {model.tags.slice(0, 4).map((tag) => (
                          <Chip
                            key={tag}
                            label={`#${tag}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.62rem',
                              height: 18,
                              borderColor: 'divider',
                              textTransform: 'none',
                            }}
                          />
                        ))}
                      </Stack>
                      <Chip
                        icon={<span style={{ fontSize: 10 }}>⚖</span>}
                        label={model.license}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.65rem',
                          height: 20,
                          borderColor: 'divider',
                          color: 'text.disabled',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          '& .MuiChip-label': { fontWeight: 500 },
                        }}
                      />
                    </Box>

                    {/* Footer: stats + Fork button */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        pt: 1.5,
                      }}
                    >
                      {/* Stats */}
                      <Stack
                        direction="row"
                        sx={{ gap: 1.5, alignItems: 'center' }}
                      >
                        {/* Downloads */}
                        <Stack
                          direction="row"
                          sx={{ gap: 0.35, alignItems: 'center' }}
                        >
                          <DownloadIcon
                            sx={{ fontSize: 15, color: 'text.secondary' }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: 'text.secondary' }}
                          >
                            {formatCount(model.downloads)}
                          </Typography>
                        </Stack>
                        {/* Stars */}
                        <Stack
                          direction="row"
                          sx={{ gap: 0.35, alignItems: 'center' }}
                        >
                          <StarBorderIcon
                            sx={{ fontSize: 15, color: 'warning.main' }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: 'text.secondary' }}
                          >
                            {formatCount(model.stars)}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Fork Button — bottom right */}
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ForkRightIcon sx={{ fontSize: 16 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Fork model');
                        }}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: 2,
                          px: 2,
                          boxShadow: 'none',
                          '&:hover': {
                            boxShadow: (theme) =>
                              `0 4px 12px ${alpha(
                                theme.palette.primary.main,
                                0.3
                              )}`,
                          },
                        }}
                      >
                        Fork Model
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
