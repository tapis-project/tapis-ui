import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import {
  filterObjects,
  PropsOfObjectWithValuesOfType,
  OrderBy,
} from '../../utils/filterObject';
import {
  ListItemText,
  ListItemIcon,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
  Tooltip,
  Button,
  MenuItem,
  Menu,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Chip,
  Stack,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Badge,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  FilterAlt,
  SortByAlpha,
  Category,
  AccessTime,
  Clear,
  Search,
  ArrowUpward,
  ArrowDownward,
  SwapVert,
  ViewList,
} from '@mui/icons-material';
import type {
  FilterableObjectsListProps,
  FilterableObjectsListComponentProps,
  Group,
  Filter,
  FilterPreset,
  FilterConfig,
  FilterType,
  TimeRangeFilter,
  ResolvableGroupItemValue,
  ResolvableGroupValue,
} from './FilterableObjectsList';

// ── V2-specific types ──────────────────────────────────────────────

export type ItemBadge = {
  /** Position of the badge on the list item row */
  position: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  /** The badge content – a small React node (icon, chip, dot, text) */
  content: React.ReactNode;
  /** Optional tooltip on hover */
  tooltip?: string;
};

export type SortOption<T = any> = {
  /** Unique key for this sort option */
  id: string;
  /** Label shown in the sort dropdown */
  label: string;
  /** Comparator function. Return negative/zero/positive like Array.sort */
  comparator: (a: T, b: T) => number;
  /** Optional: render a contextual value for each item when this sort is active */
  itemLabel?: (object: T) => string;
  /** Natural order direction for this sort (defaults to ASC) */
  defaultOrder?: 'ASC' | 'DESC';
  /** Group field to use when "show in groups" is enabled for this sort */
  groupField?: string;
  /** Items within groups are always sorted this way (shown as glyph in menu) */
  intraGroupOrder?: 'alpha';
};

export type FilterableObjectsListV2ExtraProps<T> = {
  /** Render badges/flair for each list item */
  itemBadges?: (object: T) => ItemBadge[];
  /** Enable text search filtering */
  searchable?: boolean;
  /** Field accessor for text search (defaults to searching primary text) */
  searchFields?: (object: T) => string;
  /** Use V2 compact styling (true by default in V2) */
  compact?: boolean;
  /** Sort options (Dolphin-style). Sorting is independent of grouping. */
  sortOptions?: SortOption<T>[];
  /** Default sort option id */
  defaultSortBy?: string;
  /** Whether "show in groups" is on by default */
  defaultGroupsOn?: boolean;
};

export type FilterableObjectsListV2Props<
  T,
  V = string | undefined
> = FilterableObjectsListProps<T, V> & FilterableObjectsListV2ExtraProps<T>;

type FilterableObjectsListV2ComponentProps<
  T,
  V = string | undefined
> = React.FC<PropsWithChildren<FilterableObjectsListV2Props<T, V>>>;

// ── State ───────────────────────────────────────────────────────────

type ToolbarPanel = 'filter' | null;

type V2State = {
  open: string[];
  groupedObjects: { [key: string]: ReturnType<typeof filterObjects> };
  orderBy: OrderBy;
  sortBy: string;
  groupsOn: boolean;
  activeFilters?: Array<Filter>;
  currentFilterType?: FilterType;
  selectedField?: string;
};

// ── Palette ─────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
  AVAILABLE: { bg: '#e8f5e9', fg: '#2e7d32', dot: '#4caf50' },
  CREATING: { bg: '#fff3e0', fg: '#e65100', dot: '#ff9800' },
  REQUESTED: { bg: '#e3f2fd', fg: '#1565c0', dot: '#42a5f5' },
  ERROR: { bg: '#fbe9e7', fg: '#c62828', dot: '#ef5350' },
  STOPPED: { bg: '#f3e5f5', fg: '#6a1b9a', dot: '#ab47bc' },
  COMPLETE: { bg: '#eceff1', fg: '#37474f', dot: '#78909c' },
  DELETING: { bg: '#fce4ec', fg: '#ad1457', dot: '#ec407a' },
};

const defaultStatusColor = { bg: '#f5f5f5', fg: '#616161', dot: '#9e9e9e' };

export const getStatusColor = (status: string | undefined) =>
  STATUS_COLORS[status ?? ''] ?? defaultStatusColor;

// ── Component ───────────────────────────────────────────────────────

const FilterableObjectsListV2: FilterableObjectsListV2ComponentProps<{
  [key: string]: any;
}> = ({
  objects,
  groups,
  title,
  titleIcon,
  defaultField,
  defaultFilterScope = 'group',
  includeAll = true,
  includeAllOpen = true,
  includeAllSelectorLabel = 'show all',
  includeAllGroupLabel = 'all',
  includeAllToolTip = 'all',
  includeAllShowDropdown = false,
  includeAllPrimaryItemText = ({ object }) => object.id ?? '',
  includeAllSecondaryItemText = ({}) => '',
  includeAllTertiaryItemText = ({}) => '',
  includeAllGroupIcon = undefined,
  includeAllGroupItemIcon = undefined,
  defaultOnClickItem = () => {},
  children,
  childrenPlacement = 'bottom',
  orderGroupsBy = 'ASC',
  defaultGroupIcon,
  defaultGroupItemIcon,
  filterable = true,
  groupable = true,
  orderable = true,
  selectedField = undefined,
  isSelectedItem = ({ object, selectedField }) =>
    selectedField !== undefined &&
    (object.id === selectedField || object.pod_id === selectedField),
  listItemIconStyle = { minWidth: '36px' },
  middleClickLink = undefined,
  filterConfig = undefined,
  defaultFilters = [],
  onFiltersChange = undefined,
  itemStyle = undefined,
  // V2 extra props
  itemBadges,
  searchable = true,
  searchFields,
  compact = true,
  sortOptions,
  defaultSortBy,
  defaultGroupsOn = false,
}) => {
  // ── Memoised initial open state ─────────────────────────────────

  const initialOpen = useMemo(() => {
    let concatenatedOpen: V2State['open'] =
      includeAll && includeAllOpen ? ['*:*'] : [];

    for (const group of groups) {
      if (!(group.open && group.open.length > 0)) continue;
      for (const fieldValue of group.open!) {
        concatenatedOpen.push(`${group.field}:${fieldValue}`);
      }
    }
    return concatenatedOpen;
  }, [groups, includeAll, includeAllOpen]);

  const initialSortId = defaultSortBy ?? (sortOptions?.[0]?.id || '');
  const initialSortOpt = sortOptions?.find((s) => s.id === initialSortId);

  const [state, setState] = useState<V2State>({
    open: initialOpen,
    groupedObjects: {},
    orderBy: initialSortOpt?.defaultOrder ?? orderGroupsBy,
    sortBy: initialSortId,
    groupsOn: defaultGroupsOn,
    ...(filterable && {
      activeFilters: defaultFilters,
      currentFilterType: 'timeRange' as FilterType,
    }),
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilterValue, setCurrentFilterValue] = useState('');
  const [showDuplicateMessage, setShowDuplicateMessage] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [toolbarPanel, setToolbarPanel] = useState<ToolbarPanel>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);

  const isCustomDateRangeValid = (): boolean => {
    if (!customStartDate) return false;
    if (!customEndDate) return true;
    return new Date(customStartDate) <= new Date(customEndDate);
  };

  // ── Compute sorted + grouped objects ────────────────────────────

  useEffect(() => {
    const modifiedState: V2State = { ...state, groupedObjects: {} };

    let filteredObjects = [...objects];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filteredObjects = filteredObjects.filter((obj) => {
        if (searchFields) {
          return searchFields(obj).toLowerCase().includes(q);
        }
        return Object.values(obj).some(
          (v) => typeof v === 'string' && v.toLowerCase().includes(q)
        );
      });
    }

    // Advanced filters
    if (filterable && state.activeFilters) {
      filteredObjects = applyFilters(filteredObjects, state.activeFilters);
    }

    // Derive active group from sort option + groups toggle
    const activeSortOption = sortOptions?.find((s) => s.id === state.sortBy);
    const activeGroupField =
      state.groupsOn && activeSortOption?.groupField
        ? activeSortOption.groupField
        : 'none';

    // Sort (independent of grouping)
    if (activeSortOption) {
      filteredObjects.sort((a, b) => {
        const result = activeSortOption.comparator(a, b);
        return state.orderBy === 'DESC' ? -result : result;
      });
    }

    // Group (or flat)
    if (activeGroupField === 'none') {
      // Flat list – single pseudo-group
      modifiedState.groupedObjects['none'] = [['none', filteredObjects]];
    } else {
      for (const group of groups) {
        if ((group.field as unknown as string) !== activeGroupField) continue;
        const grouped = filterObjects(
          filteredObjects,
          group.field,
          state.orderBy
        );
        // Re-sort items within each group using our sort option (always ASC)
        if (activeSortOption) {
          for (const entry of grouped) {
            (entry[1] as any[]).sort((a: any, b: any) => {
              return activeSortOption.comparator(a, b);
            });
          }
        }
        modifiedState.groupedObjects[group.field as unknown as string] =
          grouped;
      }

      if (includeAll) {
        modifiedState.groupedObjects['*'] = [['*', filteredObjects]];
      }
    }

    setState(modifiedState);
  }, [
    state.orderBy,
    state.sortBy,
    state.groupsOn,
    state.activeFilters,
    objects,
    groups,
    filterable,
    searchQuery,
  ]);

  // ── Helpers ────────────────────────────────────────────────────

  const toggleDropdown = (field: string, fieldValue: string) => {
    const target = `${field}:${fieldValue}`;
    if (state.open.includes(target)) {
      setState({ ...state, open: state.open.filter((s) => s !== target) });
    } else {
      setState({ ...state, open: [...state.open, target] });
    }
  };

  const applyFilters = (
    objects: Array<any>,
    filters: Array<Filter>
  ): Array<any> => {
    if (!filterConfig) return objects;
    return filters.reduce((filtered, filter) => {
      const fn = filterConfig.filterFunctions[filter.field];
      return fn ? fn(filtered, filter) : filtered;
    }, objects);
  };

  const addFilter = (filter: Filter) => {
    if (!filterable || !state.activeFilters) return;
    const isDuplicate = state.activeFilters.some((ef) => {
      if (ef.type !== filter.type) return false;
      if (filter.type === 'timeRange' && ef.type === 'timeRange') {
        const fr = filter.value?.range;
        const er = ef.value?.range;
        if (fr === 'custom' && er === 'custom') {
          return (
            ef.field === filter.field &&
            ef.value?.customStart === filter.value?.customStart &&
            ef.value?.customEnd === filter.value?.customEnd
          );
        }
        return ef.field === filter.field && er === fr;
      }
      return false;
    });

    if (!isDuplicate) {
      const newFilters = [...state.activeFilters, filter];
      setState({ ...state, activeFilters: newFilters });
      onFiltersChange?.(newFilters);
    } else {
      setShowDuplicateMessage(true);
      setTimeout(() => setShowDuplicateMessage(false), 2000);
    }
  };

  const removeFilter = (i: number) => {
    if (!filterable || !state.activeFilters) return;
    const newFilters = state.activeFilters.filter((_, idx) => idx !== i);
    setState({ ...state, activeFilters: newFilters });
    setCurrentFilterValue('');
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    if (!filterable) return;
    setState({ ...state, activeFilters: [] });
    setCurrentFilterValue('');
    onFiltersChange?.([]);
  };

  const applyFilterPreset = (preset: FilterPreset) => {
    if (!filterable) return;
    addFilter(preset.filter);
  };

  const getFieldConfig = (field: string) =>
    filterConfig?.filterableFields.find((f) => f.field === field);
  const getFieldLabel = (field: string) =>
    getFieldConfig(field)?.label || field;
  const getFieldPresets = (field: string) =>
    getFieldConfig(field)?.presets || [];

  const getFilterLabel = (filter: Filter): string => {
    if (filter.label) return filter.label;
    switch (filter.type) {
      case 'timeRange': {
        const rangeLabels: Record<string, string> = {
          last24h: 'Last 24h',
          last7d: 'Last 7d',
          last30d: 'Last 30d',
          custom: 'Custom',
        };
        const fl = getFieldLabel(filter.field);
        const r = filter.value?.range;
        if (r === 'custom') {
          const fmt = (d: Date) =>
            d.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
          const s = filter.value?.customStart
            ? fmt(filter.value.customStart)
            : '?';
          const e = filter.value?.customEnd
            ? fmt(filter.value.customEnd)
            : fmt(new Date());
          return `${fl}: ${s}–${e}`;
        }
        return `${fl}: ${rangeLabels[r] || r}`;
      }
      default:
        return `${getFieldLabel(filter.field)}: ${filter.value || '?'}`;
    }
  };

  // ── Build groups ──────────────────────────────────────────────

  let allGroups = [...groups];
  if (includeAll) {
    allGroups = [
      {
        field: '*' as any,
        primaryItemText: includeAllPrimaryItemText,
        secondaryItemText: includeAllSecondaryItemText,
        tertiaryItemText: includeAllTertiaryItemText,
        groupLabel: includeAllGroupLabel,
        groupSelectorLabel: includeAllSelectorLabel,
        groupIcon: includeAllGroupIcon ?? defaultGroupIcon,
        groupItemIcon: includeAllGroupItemIcon ?? defaultGroupIcon,
        tooltip: includeAllToolTip,
        showDropdown: includeAllShowDropdown,
      },
      ...groups,
    ];
  }

  // ── Resolvers ─────────────────────────────────────────────────

  const resolveGroupValue = (
    group: { [key: string]: any },
    prop: string | undefined,
    fieldValue: string,
    _default: any = undefined
  ) => {
    if (prop === undefined) return _default;
    if (typeof group[prop] === 'function')
      return group[prop]({ group, fieldValue, objects });
    return group[prop] ?? _default;
  };

  const resolveItemValue = (
    group: { [key: string]: any },
    prop: string | undefined,
    fieldValue: unknown,
    object: any,
    _default: any = undefined
  ) => {
    if (prop === undefined) return _default;
    if (typeof group[prop] === 'function')
      return group[prop]({ group, fieldValue, object, objects });
    return group[prop] ?? _default;
  };

  // ── Render helpers ────────────────────────────────────────────

  const renderSecondary = (
    group: { [key: string]: any },
    fieldValue: unknown,
    object: any
  ): React.ReactNode => {
    const secondaryText = resolveItemValue(
      group,
      'secondaryItemText',
      fieldValue,
      object,
      ''
    );
    const tertiaryText = resolveItemValue(
      group,
      'tertiaryItemText',
      fieldValue,
      object,
      ''
    );
    // Sort-context label from active sort option
    const activeSortOpt = sortOptions?.find((s) => s.id === state.sortBy);
    const sortLabel = activeSortOpt?.itemLabel?.(object);

    const ellipsis: React.CSSProperties = {
      display: 'inline-block',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      verticalAlign: 'bottom',
      fontSize: '0.75rem',
      lineHeight: 1.3,
    };

    if (sortLabel) {
      return (
        <span
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 4,
            maxWidth: '100%',
          }}
        >
          <span style={{ ...ellipsis, flex: '1 1 0', minWidth: 0 }}>
            {secondaryText}
          </span>
          <span
            style={{
              flexShrink: 0,
              fontSize: '0.62rem',
              color: 'rgba(0,0,0,0.45)',
              whiteSpace: 'nowrap',
              fontWeight: 500,
            }}
          >
            {sortLabel}
          </span>
        </span>
      );
    }

    return tertiaryText ? (
      <>
        <span style={ellipsis}>{secondaryText}</span>
        <br />
        <span style={ellipsis}>{tertiaryText}</span>
      </>
    ) : (
      <span style={ellipsis}>{secondaryText}</span>
    );
  };

  const renderItemBadges = (object: any) => {
    if (!itemBadges) return null;
    const badges = itemBadges(object);
    if (!badges || badges.length === 0) return null;

    const posStyle = (pos: ItemBadge['position']): React.CSSProperties => {
      const base: React.CSSProperties = {
        position: 'absolute',
        zIndex: 1,
        pointerEvents: 'auto',
        lineHeight: 1,
      };
      switch (pos) {
        case 'top-right':
          return { ...base, top: 2, right: 4 };
        case 'bottom-right':
          return { ...base, bottom: 2, right: 4 };
        case 'top-left':
          return { ...base, top: 2, left: 4 };
        case 'bottom-left':
          return { ...base, bottom: 2, left: 4 };
      }
    };

    return (
      <>
        {badges.map((badge, i) => {
          const node = (
            <span key={i} style={posStyle(badge.position)}>
              {badge.content}
            </span>
          );
          return badge.tooltip ? (
            <Tooltip key={i} title={badge.tooltip} placement="left" arrow>
              {node}
            </Tooltip>
          ) : (
            node
          );
        })}
      </>
    );
  };

  // ── Compact style values ──────────────────────────────────────

  const rowPy = compact ? '1px' : '4px';
  const groupHeaderPy = compact ? '2px' : undefined;
  const fontSize = compact ? '0.82rem' : undefined;

  // ── Derived group field ───────────────────────────────────────

  const currentSortOpt = sortOptions?.find((s) => s.id === state.sortBy);
  const activeGroupField =
    state.groupsOn && currentSortOpt?.groupField
      ? currentSortOpt.groupField
      : 'none';

  // ── Render ────────────────────────────────────────────────────

  return (
    <div style={{ maxHeight: '100%', minHeight: '100%', minWidth: '200px' }}>
      {/* Title */}
      {title && (
        <>
          <List
            dense={compact}
            style={{ padding: 0 }}
            subheader={
              <ListSubheader
                style={{
                  lineHeight: compact ? '32px' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {titleIcon}
                <span style={{ fontWeight: 'bold' }}>{title}</span>
              </ListSubheader>
            }
          />
          <Divider />
        </>
      )}

      {childrenPlacement === 'top' && children}

      {/* ── Search + toolbar ───────────────────────────────────── */}
      <Box
        sx={{
          px: 1,
          pt: 0.75,
          pb: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {searchable && (
          <TextField
            size="small"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1,
              '& .MuiInputBase-root': {
                height: 30,
                fontSize: '0.8rem',
                borderRadius: '6px',
              },
              '& .MuiInputBase-input': {
                py: '4px',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 16, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ p: 0.25 }}
                  >
                    <Clear sx={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            }}
          />
        )}

        {/* Icon-only toolbar buttons */}
        {filterable && (
          <Tooltip title="Filter" arrow>
            <IconButton
              size="small"
              color={toolbarPanel === 'filter' ? 'primary' : 'default'}
              onClick={() =>
                setToolbarPanel(toolbarPanel === 'filter' ? null : 'filter')
              }
              sx={{ p: 0.5 }}
            >
              <FilterAlt sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
        {sortOptions && sortOptions.length > 0 && (
          <Tooltip
            title={`Sort: ${
              sortOptions.find((s) => s.id === state.sortBy)?.label ?? '—'
            }`}
            arrow
            disableHoverListener={Boolean(sortAnchorEl)}
            enterDelay={300}
            enterNextDelay={300}
          >
            <IconButton
              size="small"
              color={sortAnchorEl ? 'primary' : 'default'}
              onClick={(e) => setSortAnchorEl(e.currentTarget)}
              sx={{ p: 0.5 }}
            >
              <SwapVert sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
        {groupable && sortOptions && sortOptions.some((s) => s.groupField) && (
          <Tooltip
            title={state.groupsOn ? 'Groups: On' : 'Groups: Off'}
            arrow
            enterDelay={300}
            enterNextDelay={300}
          >
            <IconButton
              size="small"
              color={state.groupsOn ? 'primary' : 'default'}
              onClick={() => setState({ ...state, groupsOn: !state.groupsOn })}
              sx={{ p: 0.5 }}
            >
              {state.groupsOn ? (
                <Category sx={{ fontSize: 18 }} />
              ) : (
                <ViewList sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        )}
        {orderable && (
          <Tooltip
            title={state.orderBy === 'ASC' ? 'Ascending' : 'Descending'}
            arrow
          >
            <IconButton
              size="small"
              color="default"
              onClick={() =>
                setState({
                  ...state,
                  orderBy: state.orderBy === 'ASC' ? 'DESC' : 'ASC',
                })
              }
              sx={{ p: 0.5 }}
            >
              {state.orderBy === 'ASC' ? (
                <ArrowUpward sx={{ fontSize: 18 }} />
              ) : (
                <ArrowDownward sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* ── Sort menu (auto-closing popover) ─────────────────── */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        transitionDuration={{ enter: 120, exit: 80 }}
        slotProps={{
          paper: { sx: { minWidth: 140, mt: 0.5, py: 0.25 } },
          list: { dense: true },
        }}
      >
        {sortOptions?.map((opt) => {
          const active = state.sortBy === opt.id;
          return (
            <MenuItem
              key={opt.id}
              dense
              selected={active}
              onClick={() => {
                setState({
                  ...state,
                  sortBy: opt.id,
                  orderBy: opt.defaultOrder ?? 'ASC',
                });
                setSortAnchorEl(null);
              }}
              sx={{
                py: 0.25,
                minHeight: 28,
                ...(active && {
                  backgroundColor: 'rgba(0,0,0,0.12) !important',
                  fontWeight: 600,
                }),
              }}
            >
              <ListItemText
                primary={opt.label}
                primaryTypographyProps={{
                  fontSize: '0.8rem',
                  fontWeight: active ? 600 : 400,
                }}
              />
              {opt.intraGroupOrder === 'alpha' && (
                <SortByAlpha
                  sx={{ fontSize: 14, ml: 1, color: 'rgba(0,0,0,0.28)' }}
                />
              )}
            </MenuItem>
          );
        })}
      </Menu>

      {toolbarPanel === 'filter' && filterable && (
        <Box sx={{ px: 1, pb: 1 }}>
          {/* Active filters chips */}
          {state.activeFilters && state.activeFilters.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 0.5,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Active ({state.activeFilters.length})
                </Typography>
                <IconButton
                  size="small"
                  onClick={clearAllFilters}
                  sx={{ p: 0.25 }}
                >
                  <Clear sx={{ fontSize: 14, color: 'error.main' }} />
                </IconButton>
              </Box>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {state.activeFilters.map((f, i) => (
                  <Chip
                    key={i}
                    label={getFilterLabel(f)}
                    onDelete={() => removeFilter(i)}
                    size="small"
                    variant="filled"
                    sx={{ height: 22, fontSize: '0.7rem' }}
                  />
                ))}
              </Stack>
            </Box>
          )}
          {showDuplicateMessage && (
            <Typography
              variant="caption"
              color="warning.main"
              sx={{ mb: 0.5, display: 'block' }}
            >
              Filter already active
            </Typography>
          )}
          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <InputLabel sx={{ fontSize: '0.8rem' }}>Field</InputLabel>
            <Select
              value={state.selectedField || ''}
              label="Field"
              onChange={(e) => {
                setState({ ...state, selectedField: e.target.value });
                setCurrentFilterValue('');
                setCustomStartDate('');
                setCustomEndDate('');
              }}
              sx={{ fontSize: '0.8rem', height: 32 }}
            >
              <MenuItem value="" dense>
                Select field…
              </MenuItem>
              {filterConfig?.filterableFields.map((field) => (
                <MenuItem key={field.field} value={field.field} dense>
                  {field.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {state.selectedField &&
            getFieldPresets(state.selectedField).length > 0 && (
              <Stack
                direction="row"
                spacing={0.5}
                flexWrap="wrap"
                useFlexGap
                sx={{ mb: 1 }}
              >
                {getFieldPresets(state.selectedField).map((preset) => (
                  <Chip
                    key={preset.id}
                    label={preset.label}
                    icon={preset.icon}
                    color={preset.color || 'default'}
                    size="small"
                    onClick={() => applyFilterPreset(preset)}
                    variant="outlined"
                    sx={{ height: 22, fontSize: '0.7rem' }}
                  />
                ))}
              </Stack>
            )}

          {state.selectedField &&
            getFieldConfig(state.selectedField)?.filterType === 'timeRange' && (
              <Box>
                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel sx={{ fontSize: '0.8rem' }}>
                    Time Range
                  </InputLabel>
                  <Select
                    value={currentFilterValue}
                    label="Time Range"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && value.startsWith('timeRange:')) {
                        const range = value.split(
                          ':'
                        )[1] as TimeRangeFilter['range'];
                        if (range === 'custom') {
                          setCurrentFilterValue(value);
                        } else {
                          addFilter({
                            id: `filter-${Date.now()}`,
                            field: state.selectedField!,
                            type: 'timeRange',
                            value: { range },
                            label: `${getFieldLabel(state.selectedField!)}: ${
                              range === 'last24h'
                                ? 'Last 24h'
                                : range === 'last7d'
                                ? 'Last 7d'
                                : 'Last 30d'
                            }`,
                          });
                          setCurrentFilterValue('');
                        }
                      }
                    }}
                    sx={{ fontSize: '0.8rem', height: 32 }}
                  >
                    <MenuItem value="" dense>
                      Select…
                    </MenuItem>
                    <MenuItem value="timeRange:last24h" dense>
                      Last 24h
                    </MenuItem>
                    <MenuItem value="timeRange:last7d" dense>
                      Last 7d
                    </MenuItem>
                    <MenuItem value="timeRange:last30d" dense>
                      Last 30d
                    </MenuItem>
                    <MenuItem value="timeRange:custom" dense>
                      Custom
                    </MenuItem>
                  </Select>
                </FormControl>
                {currentFilterValue === 'timeRange:custom' && (
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <TextField
                        label="Start"
                        type="datetime-local"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        size="small"
                        fullWidth
                        error={Boolean(
                          customStartDate &&
                            customEndDate &&
                            !isCustomDateRangeValid()
                        )}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiInputBase-root': {
                            height: 32,
                            fontSize: '0.75rem',
                          },
                        }}
                      />
                      <TextField
                        label="End"
                        type="datetime-local"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        size="small"
                        fullWidth
                        error={Boolean(
                          customStartDate &&
                            customEndDate &&
                            !isCustomDateRangeValid()
                        )}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiInputBase-root': {
                            height: 32,
                            fontSize: '0.75rem',
                          },
                        }}
                      />
                    </Stack>
                    {customStartDate &&
                      customEndDate &&
                      !isCustomDateRangeValid() && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mb: 0.5, display: 'block' }}
                        >
                          Start must be before end
                        </Typography>
                      )}
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          height: 26,
                          fontSize: '0.75rem',
                          textTransform: 'none',
                        }}
                        disabled={!isCustomDateRangeValid()}
                        onClick={() => {
                          if (isCustomDateRangeValid()) {
                            const s = new Date(customStartDate);
                            const e = customEndDate
                              ? new Date(customEndDate)
                              : new Date();
                            addFilter({
                              id: `filter-${Date.now()}`,
                              field: state.selectedField!,
                              type: 'timeRange',
                              value: {
                                range: 'custom',
                                customStart: s,
                                customEnd: e,
                              },
                              label: `${getFieldLabel(
                                state.selectedField!
                              )}: ${s.toLocaleDateString()}–${e.toLocaleDateString()}`,
                            });
                            setCurrentFilterValue('');
                            setCustomStartDate('');
                            setCustomEndDate('');
                          }
                        }}
                      >
                        Apply
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          height: 26,
                          fontSize: '0.75rem',
                          textTransform: 'none',
                        }}
                        onClick={() => {
                          setCurrentFilterValue('');
                          setCustomStartDate('');
                          setCustomEndDate('');
                        }}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Box>
            )}
        </Box>
      )}

      <Divider />

      {/* ── Item list ─────────────────────────────────────────── */}
      <List dense={compact} style={{ padding: 0 }}>
        {activeGroupField === 'none'
          ? /* ── Flat list (no grouping) ──────────────────────── */
            (() => {
              const flatObjects = state.groupedObjects['none']?.[0]?.[1] ?? [];
              // Pick first non-includeAll group for rendering config, or fall back
              const renderGroup = groups[0] ?? allGroups[0];
              if (!renderGroup) return null;
              return flatObjects.length > 0 ? (
                flatObjects.map((object: any) => {
                  const groupItemIcon = resolveItemValue(
                    renderGroup,
                    'groupItemIcon',
                    undefined,
                    object,
                    defaultGroupIcon
                  );
                  const mcLink = middleClickLink
                    ? middleClickLink(object)
                    : undefined;
                  const isSelected = isSelectedItem({ object, selectedField });

                  return (
                    <ListItem
                      key={
                        object.id ??
                        object.pod_id ??
                        JSON.stringify(object).slice(0, 40)
                      }
                      disablePadding
                      sx={{ position: 'relative' }}
                    >
                      {renderItemBadges(object)}
                      <ListItemButton
                        sx={{
                          py: rowPy,
                          pl: 2,
                          pr: 1,
                          minHeight: compact ? 36 : 48,
                          backgroundColor: isSelected
                            ? 'rgba(157, 133, 239, 0.18)'
                            : undefined,
                          '&:hover': {
                            backgroundColor: isSelected
                              ? 'rgba(157, 133, 239, 0.25)'
                              : 'rgba(0,0,0,0.04)',
                          },
                          ...(itemStyle ? itemStyle(object) : {}),
                        }}
                        selected={isSelected}
                        onClick={() => {
                          renderGroup.onClickItem
                            ? renderGroup.onClickItem(object)
                            : defaultOnClickItem(object);
                        }}
                        onMouseDown={(event) => {
                          if (event.button === 1) {
                            event.preventDefault();
                            if (mcLink) window.open(mcLink, '_blank');
                          }
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: listItemIconStyle?.minWidth ?? 36,
                            ...listItemIconStyle,
                            '& .MuiSvgIcon-root': {
                              fontSize: compact ? 18 : 22,
                            },
                          }}
                        >
                          {groupItemIcon ?? defaultGroupIcon}
                        </ListItemIcon>
                        <ListItemText
                          primary={resolveItemValue(
                            renderGroup,
                            'primaryItemText',
                            undefined,
                            object
                          )}
                          secondary={renderSecondary(
                            renderGroup,
                            undefined,
                            object
                          )}
                          primaryTypographyProps={{
                            fontSize: fontSize ?? '0.85rem',
                            lineHeight: 1.3,
                            noWrap: true,
                            fontWeight: 500,
                          }}
                          secondaryTypographyProps={{
                            component: 'div' as any,
                            fontSize: '0.72rem',
                            lineHeight: 1.3,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })
              ) : (
                <Typography
                  variant="caption"
                  sx={{
                    px: 2,
                    py: 1,
                    display: 'block',
                    color: 'text.secondary',
                    fontStyle: 'italic',
                  }}
                >
                  No items
                </Typography>
              );
            })()
          : /* ── Grouped list ─────────────────────────────────── */
            Object.keys(state.groupedObjects).map((field) => {
              const group = allGroups.find((g) => g.field === field);
              if (!group) return null;
              const objectGroups = state.groupedObjects[field];
              return (
                <React.Fragment key={field}>
                  {activeGroupField === field &&
                    objectGroups &&
                    objectGroups.map((objectGroup: any) => {
                      const [fieldValue, groupObjects] = objectGroup;
                      const isOpen =
                        state.open.includes(`${field}:${fieldValue}`) ||
                        state.open.includes(`${field}:*`);

                      const label = resolveGroupValue(
                        group,
                        'groupLabel',
                        fieldValue,
                        fieldValue
                      );
                      const tooltip = resolveGroupValue(
                        group,
                        'tooltip',
                        fieldValue,
                        fieldValue
                      );
                      const groupIcon = resolveGroupValue(
                        group,
                        'groupIcon',
                        fieldValue,
                        defaultGroupIcon
                      );

                      const statusColor =
                        field === 'status'
                          ? getStatusColor(fieldValue)
                          : undefined;

                      return (
                        <React.Fragment key={`${field}:${fieldValue}`}>
                          {/* Group header */}
                          {(group.showDropdown ?? true) && (
                            <ListSubheader
                              sx={{
                                cursor: 'pointer',
                                userSelect: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                overflow: 'hidden',
                                py: groupHeaderPy,
                                lineHeight: compact ? '28px' : '36px',
                                minHeight: compact ? 28 : 36,
                                fontSize: compact ? '0.78rem' : '0.85rem',
                                borderTop: '1px solid rgba(0,0,0,0.06)',
                                ...(statusColor
                                  ? {
                                      borderLeft: `3px solid ${statusColor.dot}`,
                                      pl: 1.5,
                                    }
                                  : {}),
                              }}
                              onClick={() => toggleDropdown(field, fieldValue)}
                            >
                              {groupIcon && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    marginRight: 6,
                                    fontSize: compact ? 16 : 20,
                                  }}
                                >
                                  {groupIcon}
                                </span>
                              )}
                              <Tooltip title={tooltip} placement="left">
                                <span
                                  style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: '1 1 auto',
                                    minWidth: 0,
                                    fontWeight: 600,
                                  }}
                                >
                                  {label && label.length <= 20
                                    ? label
                                    : label?.slice(0, 18) + '…'}
                                </span>
                              </Tooltip>
                              <Typography
                                component="span"
                                variant="caption"
                                sx={{
                                  ml: 0.5,
                                  flexShrink: 0,
                                  color: 'text.secondary',
                                  fontSize: '0.7rem',
                                }}
                              >
                                {groupObjects.length}
                              </Typography>
                              <span
                                style={{
                                  marginLeft: 4,
                                  display: 'inline-flex',
                                  flexShrink: 0,
                                }}
                              >
                                {isOpen ? (
                                  <ExpandMore sx={{ fontSize: 18 }} />
                                ) : (
                                  <ExpandLess sx={{ fontSize: 18 }} />
                                )}
                              </span>
                            </ListSubheader>
                          )}

                          <Divider />

                          {/* Items */}
                          {groupObjects.length > 0
                            ? isOpen &&
                              groupObjects.map((object: any) => {
                                const groupItemIcon = resolveItemValue(
                                  group,
                                  'groupItemIcon',
                                  fieldValue,
                                  object,
                                  groupIcon
                                );
                                const mcLink = middleClickLink
                                  ? middleClickLink(object)
                                  : undefined;
                                const isSelected = isSelectedItem({
                                  object,
                                  selectedField,
                                });

                                return (
                                  <ListItem
                                    key={
                                      object.id ??
                                      object.pod_id ??
                                      JSON.stringify(object).slice(0, 40)
                                    }
                                    disablePadding
                                    sx={{ position: 'relative' }}
                                  >
                                    {renderItemBadges(object)}

                                    <ListItemButton
                                      sx={{
                                        py: rowPy,
                                        pl: 2,
                                        pr: 1,
                                        minHeight: compact ? 36 : 48,
                                        backgroundColor: isSelected
                                          ? 'rgba(157, 133, 239, 0.18)'
                                          : undefined,
                                        '&:hover': {
                                          backgroundColor: isSelected
                                            ? 'rgba(157, 133, 239, 0.25)'
                                            : 'rgba(0,0,0,0.04)',
                                        },
                                        ...(itemStyle ? itemStyle(object) : {}),
                                      }}
                                      selected={isSelected}
                                      onClick={() => {
                                        group.onClickItem
                                          ? group.onClickItem(object)
                                          : defaultOnClickItem(object);
                                      }}
                                      onMouseDown={(event) => {
                                        if (event.button === 1) {
                                          event.preventDefault();
                                          if (mcLink)
                                            window.open(mcLink, '_blank');
                                        }
                                      }}
                                    >
                                      <ListItemIcon
                                        sx={{
                                          minWidth:
                                            listItemIconStyle?.minWidth ?? 36,
                                          ...listItemIconStyle,
                                          '& .MuiSvgIcon-root': {
                                            fontSize: compact ? 18 : 22,
                                          },
                                        }}
                                      >
                                        {groupItemIcon ?? groupIcon}
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={resolveItemValue(
                                          group,
                                          'primaryItemText',
                                          fieldValue,
                                          object
                                        )}
                                        secondary={renderSecondary(
                                          group,
                                          fieldValue,
                                          object
                                        )}
                                        primaryTypographyProps={{
                                          fontSize: fontSize ?? '0.85rem',
                                          lineHeight: 1.3,
                                          noWrap: true,
                                          fontWeight: 500,
                                        }}
                                        secondaryTypographyProps={{
                                          component: 'div' as any,
                                          fontSize: '0.72rem',
                                          lineHeight: 1.3,
                                        }}
                                      />
                                    </ListItemButton>
                                  </ListItem>
                                );
                              })
                            : isOpen && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    px: 2,
                                    py: 1,
                                    display: 'block',
                                    color: 'text.secondary',
                                    fontStyle: 'italic',
                                  }}
                                >
                                  No items
                                </Typography>
                              )}
                        </React.Fragment>
                      );
                    })}
                </React.Fragment>
              );
            })}
      </List>
      {childrenPlacement === 'bottom' && children}
    </div>
  );
};

export default FilterableObjectsListV2;
