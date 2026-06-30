import { useMemo, useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import {
  LIBRARIES,
  CATEGORY_ORDER,
  TaskCategory,
  TASK_TYPES,
} from './filterOptions';
import type { Task } from './filterOptions';
import FilterModelsModal from './FilterModelsModal';
import * as Models from '@mlhub/models-ts-sdk';
import { FormControl, MenuItem, Select } from '@mui/material';
import { useModelFilter } from 'app/MlHub/_context/ModelFilterContext/ModelFilterContext';

export const CATEGORY_COLORS: Record<
  TaskCategory,
  { bg: string; border: string; text: string }
> = {
  [TaskCategory.NLP]: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    text: '#15803d',
  },
  [TaskCategory.ComputerVision]: {
    bg: '#faf5ff',
    border: '#e9d5ff',
    text: '#7e22ce',
  },
  [TaskCategory.Audio]: {
    bg: '#fff7ed',
    border: '#fed7aa',
    text: '#c2410c',
  },
  [TaskCategory.Tabular]: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    text: '#1d4ed8',
  },
  [TaskCategory.Other]: {
    bg: '#f8fafc',
    border: '#e2e8f0',
    text: '#475569',
  },
};

const LIBRARY_CHIP_STYLE = {
  bgcolor: '#fffbeb',
  border: '1px solid #fde68a',
  color: '#b45309',
  '& .MuiChip-deleteIcon': {
    color: '#b45309',
    '&:hover': { color: '#92400e' },
  },
};

interface FilterBarProps {
  onApply: () => void;
}

const getTaskCategory = (task: Models.Task): Task['category'] => {
  return (
    TASK_TYPES.find((t) => task == t.value)?.category || TaskCategory.Other
  );
};

const getTaskLabel = (task: Models.Task): Task['label'] => {
  return TASK_TYPES.find((t) => task == t.value)?.label || 'unknown';
};

const FilterModelsBar: React.FC<FilterBarProps> = ({ onApply }) => {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const {
    libraries: selectedLibraries,
    setLibraries: setSelectedLibraries,
    limit,
    setLimit,
    taskTypes: selectedTasks,
    setTaskTypes: setSelectedTasks,
  } = useModelFilter();
  const [open, setOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filtersExpanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setFiltersExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filtersExpanded]);

  const totalFilters = selectedLibraries.length + selectedTasks.length;

  const groupedActiveTasks = useMemo(() => {
    const groups: Record<string, Models.Task[]> = {};
    for (const task of selectedTasks) {
      const cat = getTaskCategory(task);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(task);
    }
    return groups;
  }, [selectedTasks]);

  const hasActiveFilters =
    selectedLibraries.length > 0 || selectedTasks.length > 0;

  return (
    <Box
      ref={headerRef}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1200,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction="row"
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.25,
          alignItems: 'center',
          gap: 1.5,
          justifyContent: 'flex-end',
        }}
      >
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
              <MenuItem value={10} sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                10
              </MenuItem>
              <MenuItem value={50} sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                50
              </MenuItem>
              <MenuItem
                value={100}
                sx={{ fontSize: '0.8rem', fontWeight: 500 }}
              >
                100
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
        {hasActiveFilters && (
          <Button
            size="small"
            onClick={() => setFiltersExpanded((prev) => !prev)}
            endIcon={
              filtersExpanded ? (
                <ExpandLessRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              height: 28,
              px: 1.5,
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '100px',
              bgcolor: 'rgba(15, 118, 110, 0.08)',
              color: '#11766E',
              border: '1px solid',
              borderColor: 'rgba(15, 118, 110, 0.15)',
              '&:hover': {
                bgcolor: 'rgba(15, 118, 110, 0.14)',
                borderColor: 'rgba(15, 118, 110, 0.25)',
              },
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {totalFilters} active
          </Button>
        )}

        <Button
          variant="contained"
          onClick={() => {
            setOpen(true);
          }}
          startIcon={<FilterAltRoundedIcon />}
          sx={{
            px: 3,
            py: 0.75,
            fontSize: '0.875rem',
            borderRadius: '100px',
            backgroundColor: '#11766E',
            boxShadow: '0 1px 8px rgba(15, 118, 110, 0.2)',
            '&:hover': {
              boxShadow: '0 2px 14px rgba(15, 118, 110, 0.3)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          Filters{totalFilters > 0 ? ` (${totalFilters})` : ''}
        </Button>
      </Stack>

      <Collapse in={filtersExpanded && hasActiveFilters}>
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            pb: 2,
            pt: { xs: 2, sm: 3 },
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(0,0,0,0.012)',
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterAltRoundedIcon
              sx={{ fontSize: 16, color: 'primary.main' }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'primary.main',
                fontSize: '0.7rem',
              }}
            >
              Active filters
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.disabled', fontSize: '0.7rem' }}
            >
              · {totalFilters}
            </Typography>
          </Stack>
          {selectedLibraries.length > 0 && (
            <Box sx={{ mb: selectedTasks.length > 0 ? 2 : 0 }}>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mb: 1, alignItems: 'center' }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#b45309',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#b45309',
                    fontSize: '0.6875rem',
                  }}
                >
                  Libraries
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.disabled', fontSize: '0.6875rem' }}
                >
                  · {selectedLibraries.length}
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {selectedLibraries.map((lib) => {
                  const label =
                    LIBRARIES.find((l) => l.value === lib)?.label ?? lib;
                  return (
                    <Chip
                      key={lib}
                      label={label}
                      size="small"
                      onDelete={() => {
                        setSelectedLibraries(
                          selectedLibraries.filter((l) => l !== lib)
                        );
                      }}
                      sx={LIBRARY_CHIP_STYLE}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          {selectedTasks.length > 0 && (
            <Box>
              {CATEGORY_ORDER.map((category) => {
                const tasks = groupedActiveTasks[category];
                if (!tasks || tasks.length === 0) return null;
                const colors = CATEGORY_COLORS[category as TaskCategory];
                return (
                  <Box
                    key={category}
                    sx={{
                      mb:
                        category !==
                        CATEGORY_ORDER.filter(
                          (c) => groupedActiveTasks[c]
                        ).slice(-1)[0]
                          ? 2
                          : 0,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ mb: 1, alignItems: 'center' }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: colors.text,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: colors.text,
                          fontSize: '0.6875rem',
                        }}
                      >
                        {category}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', fontSize: '0.6875rem' }}
                      >
                        · {tasks.length}
                      </Typography>
                    </Stack>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {tasks.map((task) => {
                        return (
                          <Chip
                            key={task}
                            label={getTaskLabel(task)}
                            size="small"
                            onDelete={() => {
                              setSelectedTasks(
                                selectedTasks.filter((t) => {
                                  return (
                                    JSON.stringify(t) !== JSON.stringify(task)
                                  );
                                })
                              );
                            }}
                            sx={{
                              bgcolor: colors.bg,
                              border: `1px solid ${colors.border}`,
                              color: colors.text,
                              '& .MuiChip-deleteIcon': {
                                color: colors.text,
                                '&:hover': { opacity: 0.7 },
                              },
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 2 }}>
            <Button
              size="small"
              onClick={() => {
                setSelectedTasks([]);
                setSelectedLibraries([]);
              }}
              startIcon={<DeleteSweepRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                minWidth: 0,
                height: 28,
                px: 1.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'error.50',
                  borderColor: 'error.200',
                  color: 'error.main',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Clear all
            </Button>
          </Stack>
        </Box>
      </Collapse>

      <FilterModelsModal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onApply={onApply}
      />
    </Box>
  );
};

export default FilterModelsBar;
