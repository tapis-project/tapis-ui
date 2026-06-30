import { useState, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

import { LIBRARIES, TASK_TYPES, CATEGORY_ORDER } from './filterOptions';
import * as Models from '@mlhub/models-ts-sdk';
import { useModelFilter } from 'app/MlHub/_context/ModelFilterContext/ModelFilterContext';

const CATEGORY_COLORS: Record<
  string,
  {
    bg: string;
    bgHover: string;
    border: string;
    active: string;
    activeHover: string;
    text: string;
    textActive: string;
  }
> = {
  NLP: {
    bg: '#f0fdf4',
    bgHover: '#dcfce7',
    border: '#bbf7d0',
    active: '#16a34a',
    activeHover: '#15803d',
    text: '#15803d',
    textActive: '#ffffff',
  },
  'Computer Vision': {
    bg: '#faf5ff',
    bgHover: '#f3e8ff',
    border: '#e9d5ff',
    active: '#9333ea',
    activeHover: '#7e22ce',
    text: '#7e22ce',
    textActive: '#ffffff',
  },
  Audio: {
    bg: '#fff7ed',
    bgHover: '#ffedd5',
    border: '#fed7aa',
    active: '#ea580c',
    activeHover: '#c2410c',
    text: '#c2410c',
    textActive: '#ffffff',
  },
  Tabular: {
    bg: '#eff6ff',
    bgHover: '#dbeafe',
    border: '#bfdbfe',
    active: '#2563eb',
    activeHover: '#1d4ed8',
    text: '#1d4ed8',
    textActive: '#ffffff',
  },
  Other: {
    bg: '#f8fafc',
    bgHover: '#f1f5f9',
    border: '#e2e8f0',
    active: '#475569',
    activeHover: '#334155',
    text: '#475569',
    textActive: '#ffffff',
  },
};

const LIBRARY_COLORS = {
  bg: '#ecfdf5',
  bgHover: '#d1fae5',
  border: '#a7f3d0',
  active: '#0d9488',
  activeHover: '#0f766e',
  text: '#0f766e',
  textActive: '#ffffff',
};

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
}

const FilterModelsModal = ({ open, onClose, onApply }: FilterModalProps) => {
  const {
    libraries: selectedLibraries,
    setLibraries: setSelectedLibraries,
    taskTypes: selectedTasks,
    setTaskTypes: setSelectedTasks,
  } = useModelFilter();
  const [librarySearch, setLibrarySearch] = useState('');
  const [taskSearch, setTaskSearch] = useState('');

  const filteredLibraries = useMemo(() => {
    return LIBRARIES.filter((l) =>
      l.label.toLowerCase().includes(librarySearch.toLowerCase())
    );
  }, [librarySearch]);

  const groupedTasks = useMemo(() => {
    const filtered = TASK_TYPES.filter((t) =>
      t.label.toLowerCase().includes(taskSearch.toLowerCase())
    );
    const groups: Record<string, typeof TASK_TYPES> = {};
    for (const task of filtered) {
      const cat = task.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(task);
    }
    return groups;
  }, [taskSearch]);

  const handleLibraryToggle = (lib: string) => {
    if (selectedLibraries.includes(lib)) {
      let modifiedLibraries = selectedLibraries.filter((l) => l !== lib);
      setSelectedLibraries(modifiedLibraries);
      return modifiedLibraries;
    }

    setSelectedLibraries([...selectedLibraries, lib]);
    return [...selectedLibraries, lib];
  };

  const handleTaskToggle = (task: Models.Task) => {
    if (selectedTasks.includes(task)) {
      let modifiedTasks = selectedTasks.filter((l) => l !== task);
      setSelectedTasks(modifiedTasks);
      return modifiedTasks;
    }

    setSelectedTasks([...selectedTasks, task]);
    return [...selectedTasks, task];
  };

  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleReset = () => {
    setSelectedLibraries([]);
    setSelectedTasks([]);
  };

  const totalFilters = selectedLibraries.length + selectedTasks.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: '#11766E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <FilterAltRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontSize: '1.1rem', lineHeight: 1.3, fontWeight: 'bold' }}
            >
              Filter Models
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Refine your model search
            </Typography>
          </Box>
        </Stack>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ flex: 1, overflow: 'auto', p: 3 }} dividers>
        <Box sx={{ mb: 4 }}>
          <Stack
            direction="row"
            sx={{
              mb: 0.5,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, fontSize: '0.9375rem' }}
            >
              Inference Library Compatibility
            </Typography>
            {selectedLibraries.length > 0 && (
              <Chip
                label={`${selectedLibraries.length} selected`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  bgcolor: 'primary.main',
                  color: '#fff',
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1.5, display: 'block' }}
          >
            Select supported inference libraries
          </Typography>

          <TextField
            size="small"
            placeholder="Search libraries..."
            value={librarySearch}
            onChange={(e) => setLibrarySearch(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon
                      sx={{ fontSize: 18, color: 'text.secondary' }}
                    />
                  </InputAdornment>
                ),
                endAdornment: librarySearch ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setLibrarySearch('')}
                    >
                      <CloseRoundedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {filteredLibraries.map((lib) => {
              const isSelected = selectedLibraries.includes(lib.value);
              return (
                <Chip
                  key={lib.value}
                  label={lib.label}
                  variant={isSelected ? 'filled' : 'outlined'}
                  onClick={() => handleLibraryToggle(lib.value)}
                  icon={
                    isSelected ? (
                      <CheckRoundedIcon sx={{ fontSize: 14 }} />
                    ) : undefined
                  }
                  sx={{
                    borderColor: isSelected
                      ? LIBRARY_COLORS.active
                      : LIBRARY_COLORS.border,
                    bgcolor: isSelected
                      ? LIBRARY_COLORS.active
                      : LIBRARY_COLORS.bg,
                    color: isSelected
                      ? LIBRARY_COLORS.textActive
                      : LIBRARY_COLORS.text,
                    '&:hover': {
                      borderColor: isSelected
                        ? LIBRARY_COLORS.activeHover
                        : LIBRARY_COLORS.bgHover,
                      bgcolor: isSelected
                        ? LIBRARY_COLORS.activeHover
                        : LIBRARY_COLORS.bgHover,
                      color: isSelected
                        ? LIBRARY_COLORS.textActive
                        : LIBRARY_COLORS.text,
                    },
                    transition: 'all 0.15s ease',
                    fontSize: '0.8125rem',
                    py: 0.25,
                  }}
                />
              );
            })}
          </Box>
        </Box>

        <Box>
          <Stack
            direction="row"
            sx={{
              mb: 0.5,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, fontSize: '0.9375rem' }}
            >
              Task Types
            </Typography>
            {selectedTasks.length > 0 && (
              <Chip
                label={`${selectedTasks.length} selected`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  bgcolor: 'primary.main',
                  color: '#fff',
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1.5, display: 'block' }}
          >
            Choose one or more task types
          </Typography>

          <TextField
            size="small"
            placeholder="Search tasks..."
            value={taskSearch}
            onChange={(e) => setTaskSearch(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon
                      sx={{ fontSize: 18, color: 'text.secondary' }}
                    />
                  </InputAdornment>
                ),
                endAdornment: taskSearch ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setTaskSearch('')}>
                      <CloseRoundedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />

          <Stack spacing={2.5}>
            {CATEGORY_ORDER.map((category) => {
              const tasks = groupedTasks[category] ?? [];
              const colors = CATEGORY_COLORS[category];
              if (tasks.length === 0) {
                return <></>;
              }
              return (
                <Box key={category}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: colors.text,
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    {category}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {tasks.map((task) => {
                      const isSelected = selectedTasks.includes(task.value);
                      return (
                        <Chip
                          key={task.value}
                          label={task.label}
                          variant={isSelected ? 'filled' : 'outlined'}
                          onClick={() => handleTaskToggle(task.value)}
                          icon={
                            isSelected ? (
                              <CheckRoundedIcon sx={{ fontSize: 14 }} />
                            ) : undefined
                          }
                          sx={{
                            borderColor: isSelected
                              ? colors.active
                              : colors.border,
                            bgcolor: isSelected ? colors.active : colors.bg,
                            color: isSelected ? colors.textActive : colors.text,
                            '&:hover': {
                              borderColor: isSelected
                                ? colors.activeHover
                                : colors.bgHover,
                              bgcolor: isSelected
                                ? colors.activeHover
                                : colors.bgHover,
                              color: isSelected
                                ? colors.textActive
                                : colors.text,
                            },
                            transition: 'all 0.15s ease',
                            fontSize: '0.8125rem',
                            py: 0.25,
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          justifyContent: 'space-between',
        }}
      >
        <Button
          onClick={handleReset}
          startIcon={<DeleteOutlineRoundedIcon />}
          sx={{ color: 'text.secondary' }}
          disabled={
            selectedLibraries.length === 0 && selectedTasks.length === 0
          }
        >
          Reset all
        </Button>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            disabled={totalFilters === 0}
            startIcon={<CheckRoundedIcon />}
            sx={{
              px: 3,
              borderRadius: '100px',
              bgcolor: '#11766E',
              boxShadow: 'none',
              '&:hover': { boxShadow: '0 2px 8px rgba(15, 118, 110, 0.3)' },
            }}
          >
            Apply{totalFilters > 0 ? ` (${totalFilters})` : ''}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default FilterModelsModal;
