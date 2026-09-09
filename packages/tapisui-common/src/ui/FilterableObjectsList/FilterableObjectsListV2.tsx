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
  Skeleton,
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
  InfoOutlined,
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
  /** Message shown when the objects array is empty */
  emptyMessage?: string;
  /** Observe the search box — lets a host page filter a sibling surface
   *  (an overview table) from the same query. */
  onSearchChange?: (query: string) => void;
  /** Rendered in the pinned header, under the search/filter controls and
   *  above the scrolling rows — where a nav's window ledger belongs. */
  belowToolbar?: React.ReactNode;
  /**
   * What this search actually covers, shown only while something is
   * typed.
   *
   * The box searches the rows the nav is HOLDING, not the service. That
   * is the right behaviour — it is instant, and it filters the page's
   * table with it — but it is invisible, and people read an empty result
   * as "there is no such system" rather than "not in the 50 I fetched".
   * Some records are worse than absent: a hidden job is filtered out of
   * /jobs/list AND /jobs/search, so no query anywhere can reach it.
   *
   * So each nav says its own truth, in its own words, at the moment the
   * question arises. Takes the query so the sentence can use it.
   */
  searchScope?: (query: string) => React.ReactNode;
  /** The first fetch is in flight: keep the whole chrome (search, tools,
   *  belowToolbar) and show skeleton rows where the list will be, so the
   *  nav arrives as itself instead of popping out of a spinner. */
  loading?: boolean;
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
  /**
   * Groups the user explicitly shut. Needed because `open` supports
   * wildcards (`field:*`, `*:*`) that keep every group in a field open by
   * default — removing one group's entry from `open` can never beat the
   * wildcard, which used to make those groups impossible to collapse.
   */
  closed: string[];
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
  'SPAWNER SETUP': { bg: '#fffde7', fg: '#a07800', dot: '#c8a000' },
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

// ── Compact filter bar tokens ────────────────────────────────────────────────
const TIME_RANGES = [
  { id: 'last24h', label: '24h' },
  { id: 'last7d', label: '7d' },
  { id: 'last30d', label: '30d' },
];

const FILTER_LABEL_SX = {
  fontSize: '0.68rem',
  color: 'text.secondary',
  flexShrink: 0,
} as const;

const FILTER_CHIP_SX = {
  height: 20,
  fontSize: '0.68rem',
  '& .MuiChip-label': { px: 0.75 },
  '& .MuiChip-icon': { fontSize: 13, ml: 0.5 },
  '& .MuiChip-deleteIcon': { fontSize: 13 },
} as const;

const FILTER_DATE_SX = {
  flex: 1,
  '& .MuiInputBase-root': { height: 26, fontSize: '0.68rem' },
} as const;

// ── Search + tool cluster tokens ─────────────────────────────────────────────
//
// The bar is a search field and four switches. It read as five separate
// controls at even spacing, which made the switches look like more of a
// decision than they are: they qualify the field beside them. So the
// switches abut into one cluster, with a single gap between the two halves.
// The field keeps its plain outlined colouring — a fill was tried and read
// as disabled — and only gets tighter: shorter, a smaller radius, and an
// adornment that stops eating a quarter of the field.

const SEARCH_SX = {
  flex: 1,
  minWidth: 0,
  '& .MuiInputBase-root': {
    height: 28,
    fontSize: '0.78rem',
    // a touch tighter than the buttons' 5px — the field is the long shape in
    // the row, and a soft corner on a long shape reads as rounder than it is
    borderRadius: '4px',
    pl: 1,
    pr: 0.5,
  },
  // the magnifier is a hint, not a control: it should not take a whole
  // 8px gutter out of a 28px field
  '& .MuiInputAdornment-positionStart': { mr: 0.75, color: 'text.disabled' },
  '& .MuiInputBase-input': { py: '4px', '&::placeholder': { opacity: 0.7 } },
} as const;

/** Buttons abut — the gap between them would otherwise read as a boundary. */
const TOOL_CLUSTER_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 0,
  flexShrink: 0,
} as const;

const TOOL_ICON_SX = { fontSize: 17 } as const;

/**
 * "On" is ink and a grey fill, matching the ? and width toggles in the page
 * header directly above. Not primary blue: blue in this app means 'a link'
 * and 'public', and on a switch that is on most of the time it only ever says
 * 'notice me'.
 */
const toolButtonSx = (on: boolean) =>
  ({
    p: '3px',
    borderRadius: '5px',
    color: on ? 'text.primary' : 'text.secondary',
    bgcolor: on ? 'rgba(0,0,0,0.07)' : 'transparent',
    '&:hover': { bgcolor: on ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.05)' },
  } as const);

/** Small enough to sit on a 17px glyph without becoming the glyph. */
const FILTER_BADGE_SX = {
  '& .MuiBadge-badge': {
    height: 12,
    minWidth: 12,
    fontSize: '0.58rem',
    fontWeight: 700,
    px: '3px',
    top: -1,
    right: -1,
  },
} as const;

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
  emptyMessage,
  onSearchChange,
  belowToolbar,
  searchScope,
  loading = false,
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
    closed: [],
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
  useEffect(() => {
    onSearchChange?.(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);
  const [currentFilterValue, setCurrentFilterValue] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [toolbarPanel, setToolbarPanel] = useState<ToolbarPanel>(null);

  // With the panel closed, an active filter left no trace on the bar — the
  // list was just short, for no visible reason. This is what the badge counts.
  const activeFilterCount = state.activeFilters?.length ?? 0;
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

  const isGroupOpen = (field: string, fieldValue: string) => {
    const target = `${field}:${fieldValue}`;
    return (
      !state.closed.includes(target) &&
      (state.open.includes(target) || state.open.includes(`${field}:*`))
    );
  };

  const toggleDropdown = (field: string, fieldValue: string) => {
    const target = `${field}:${fieldValue}`;
    if (isGroupOpen(field, fieldValue)) {
      // record the shut explicitly — a wildcard in `open` would otherwise
      // reopen the group no matter what is removed from that list
      setState({
        ...state,
        open: state.open.filter((s) => s !== target),
        closed: [...state.closed, target],
      });
    } else {
      setState({
        ...state,
        open: [...state.open, target],
        closed: state.closed.filter((s) => s !== target),
      });
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

  /**
   * One writer for the filter set. The old panel added filters one at a time
   * and refused duplicates with a warning; the chips below toggle instead, so
   * every change is 'here is the new set' and a duplicate cannot be built.
   */
  const setFilters = (next: Array<Filter>) => {
    if (!filterable) return;
    setState({ ...state, activeFilters: next });
    onFiltersChange?.(next);
  };

  const removeFilter = (i: number) => {
    if (!filterable || !state.activeFilters) return;
    setFilters(state.activeFilters.filter((_, idx) => idx !== i));
    setCurrentFilterValue('');
  };

  const clearAllFilters = () => {
    setFilters([]);
    setCurrentFilterValue('');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  /** Ranges on one field are alternatives, so a new one replaces the old. */
  const toggleTimeRange = (field: string, range: string, label: string) => {
    const on = (state.activeFilters ?? []).some(
      (f) =>
        f.field === field && f.type === 'timeRange' && f.value?.range === range
    );
    const rest = (state.activeFilters ?? []).filter(
      (f) => !(f.field === field && f.type === 'timeRange')
    );
    setFilters(
      on
        ? rest
        : [
            ...rest,
            {
              id: `time-${field}-${range}`,
              field,
              type: 'timeRange',
              value: { range },
              label: `${getFieldLabel(field)}: ${label}`,
            },
          ]
    );
    setCurrentFilterValue('');
  };

  const togglePreset = (preset: FilterPreset) => {
    const filters = state.activeFilters ?? [];
    const i = filters.findIndex((f) => f.id === preset.filter.id);
    setFilters(
      i >= 0
        ? filters.filter((_, idx) => idx !== i)
        : [...filters, preset.filter]
    );
  };

  const applyCustomRange = (field: string) => {
    if (!isCustomDateRangeValid()) return;
    const start = new Date(customStartDate);
    const end = customEndDate ? new Date(customEndDate) : new Date();
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    setFilters([
      ...(state.activeFilters ?? []).filter(
        (f) => !(f.field === field && f.type === 'timeRange')
      ),
      {
        id: `time-${field}-custom`,
        field,
        type: 'timeRange',
        value: { range: 'custom', customStart: start, customEnd: end },
        label: `${getFieldLabel(field)}: ${fmt(start)}–${fmt(end)}`,
      },
    ]);
    setCurrentFilterValue('');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // Every field's presets in one row — a preset you only see after picking
  // its field is a preset nobody uses.
  const quickPresets: Array<FilterPreset> = (
    filterConfig?.filterableFields ?? []
  ).flatMap((f) => f.presets ?? []);
  const timeFields = (filterConfig?.filterableFields ?? []).filter(
    (f) => f.filterType === 'timeRange'
  );
  const activeTimeField = state.selectedField || timeFields[0]?.field;
  const customRangeOpen = currentFilterValue === 'custom';

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

  /**
   * Row content as two INDEPENDENT lines.
   *
   * The first right-rail design was one flex column beside the text, sized by
   * its widest line — so a long bottom line (condition + sort label) reserved
   * that width on the NAME's line too, stranding dead space between a
   * truncated name and a short status chip. Now each line settles its own
   * economy: line 1 = primary text vs top badges, line 2 = secondary text vs
   * bottom badges + sort label. The name only yields to what actually sits
   * beside it.
   */
  const wrapBadge = (badge: ItemBadge, i: number) => {
    const node = (
      <span
        key={i}
        style={{
          lineHeight: 1,
          display: 'inline-block',
          // a text badge (a job condition, say) ellipsizes instead of
          // eating the line — the tooltip carries the full words
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
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
  };

  const badgeRow = (badges: ItemBadge[], extra?: React.ReactNode) =>
    badges.length > 0 || extra ? (
      <span
        style={{
          display: 'inline-flex',
          gap: 3,
          alignItems: 'center',
          flexShrink: 1,
          minWidth: 0,
          // never more than half a line — the text always keeps the floor
          maxWidth: '50%',
        }}
      >
        {badges.map(wrapBadge)}
        {extra}
      </span>
    ) : null;

  const renderRowContent = (renderGroup: any, fieldValue: any, object: any) => {
    const primary = resolveItemValue(
      renderGroup,
      'primaryItemText',
      fieldValue,
      object
    );
    const secondary = renderSecondary(renderGroup, fieldValue, object);
    const badges = itemBadges ? itemBadges(object) ?? [] : [];
    const activeSortOpt = sortOptions?.find((s) => s.id === state.sortBy);
    const sortLabel = activeSortOpt?.itemLabel?.(object);
    const top = badges.filter((b) => b.position.startsWith('top'));
    const bottom = badges.filter((b) => b.position.startsWith('bottom'));
    const label = sortLabel ? (
      <span
        style={{
          fontSize: '0.62rem',
          color: 'rgba(0,0,0,0.45)',
          whiteSpace: 'nowrap',
          fontWeight: 500,
          flexShrink: 0,
        }}
      >
        {sortLabel}
      </span>
    ) : undefined;

    return (
      <span
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          // ListItemText carried 4px vertical margins; replacing it silently
          // dropped them and the rows closed up. Restored here — the row
          // height comes from this margin, not from padding tweaks per nav.
          margin: '4px 0',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            minWidth: 0,
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              flex: '1 1 0',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: (fontSize as string) ?? '0.85rem',
              fontWeight: 500,
              lineHeight: 1.3,
            }}
          >
            {primary}
          </span>
          {badgeRow(top)}
        </span>
        {(secondary || bottom.length > 0 || label) && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minWidth: 0,
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                flex: '1 1 0',
                minWidth: 0,
                overflow: 'hidden',
                fontSize: '0.72rem',
                lineHeight: 1.3,
                color: 'rgba(0, 0, 0, 0.6)',
              }}
            >
              {secondary}
            </span>
            {badgeRow(bottom, label)}
          </span>
        )}
      </span>
    );
  };

  // ── Compact style values ──────────────────────────────────────

  const rowPy = compact ? '0px' : '3px';
  const groupHeaderPy = compact ? '1px' : undefined;
  const fontSize = compact ? '0.82rem' : undefined;

  // ── Derived group field ───────────────────────────────────────

  const currentSortOpt = sortOptions?.find((s) => s.id === state.sortBy);
  const activeGroupField =
    state.groupsOn && currentSortOpt?.groupField
      ? currentSortOpt.groupField
      : 'none';

  // ── Render ────────────────────────────────────────────────────

  return (
    // A column of two parts: a pinned header (title, search, filters, and
    // whatever rides in belowToolbar) over the rows in their own scroller.
    // The controls used to scroll away with the list; now only the rows
    // move, and the group subheaders stick to the top of the row scroller —
    // which is exactly the underside of the pinned controls.
    <div
      style={{
        maxHeight: '100%',
        minHeight: '100%',
        minWidth: '13rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flexShrink: 0 }}>
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
            gap: 0.75,
          }}
        >
          {searchable && (
            <TextField
              size="small"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={SEARCH_SX}
              inputProps={{ 'aria-label': 'Search' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 15 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Clear search"
                      onClick={() => setSearchQuery('')}
                      sx={{ p: '2px', color: 'text.secondary' }}
                    >
                      <Clear sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
            />
          )}

          {/* Filter · sort with its direction · groups. Direction moved to sit
            beside sort: they are two halves of one answer, and it used to be
            stranded on the far side of the groups switch. */}
          <Box sx={TOOL_CLUSTER_SX}>
            {filterable && (
              <Tooltip
                title={
                  activeFilterCount > 0
                    ? `Filters · ${activeFilterCount} on`
                    : 'Filter'
                }
                arrow
              >
                <IconButton
                  size="small"
                  aria-label="Filter"
                  aria-pressed={toolbarPanel === 'filter'}
                  onClick={() =>
                    setToolbarPanel(toolbarPanel === 'filter' ? null : 'filter')
                  }
                  sx={toolButtonSx(
                    toolbarPanel === 'filter' || activeFilterCount > 0
                  )}
                >
                  {/* closed panel + active filters used to look exactly like
                    no filters at all, which is how you lose a list */}
                  <Badge
                    badgeContent={activeFilterCount}
                    color="primary"
                    overlap="circular"
                    sx={FILTER_BADGE_SX}
                  >
                    <FilterAlt sx={TOOL_ICON_SX} />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            {sortOptions && sortOptions.length > 0 && (
              <Tooltip
                title={`Sort · ${
                  sortOptions.find((s) => s.id === state.sortBy)?.label ?? '—'
                }`}
                arrow
                disableHoverListener={Boolean(sortAnchorEl)}
                enterDelay={300}
                enterNextDelay={300}
              >
                <IconButton
                  size="small"
                  aria-label="Sort"
                  aria-pressed={Boolean(sortAnchorEl)}
                  onClick={(e) => setSortAnchorEl(e.currentTarget)}
                  sx={toolButtonSx(Boolean(sortAnchorEl))}
                >
                  <SwapVert sx={TOOL_ICON_SX} />
                </IconButton>
              </Tooltip>
            )}
            {orderable && (
              <Tooltip
                title={
                  state.orderBy === 'ASC'
                    ? 'Ascending · click to reverse'
                    : 'Descending · click to reverse'
                }
                arrow
              >
                <IconButton
                  size="small"
                  aria-label={
                    state.orderBy === 'ASC' ? 'Ascending' : 'Descending'
                  }
                  onClick={() =>
                    setState({
                      ...state,
                      orderBy: state.orderBy === 'ASC' ? 'DESC' : 'ASC',
                    })
                  }
                  sx={toolButtonSx(false)}
                >
                  {state.orderBy === 'ASC' ? (
                    <ArrowUpward sx={TOOL_ICON_SX} />
                  ) : (
                    <ArrowDownward sx={TOOL_ICON_SX} />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {groupable &&
              sortOptions &&
              sortOptions.some((s) => s.groupField) && (
                <Tooltip
                  title={
                    state.groupsOn ? 'Grouped · click to flatten' : 'Group'
                  }
                  arrow
                  enterDelay={300}
                  enterNextDelay={300}
                >
                  <IconButton
                    size="small"
                    aria-label="Group"
                    aria-pressed={state.groupsOn}
                    onClick={() =>
                      setState({ ...state, groupsOn: !state.groupsOn })
                    }
                    sx={toolButtonSx(state.groupsOn)}
                  >
                    {state.groupsOn ? (
                      <Category sx={TOOL_ICON_SX} />
                    ) : (
                      <ViewList sx={TOOL_ICON_SX} />
                    )}
                  </IconButton>
                </Tooltip>
              )}
          </Box>
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
          /**
           * The compact filter bar.
           *
           * The old panel was three stacked full-width form controls — pick a
           * field, pick a range, then a pair of datetime inputs — in a 240px
           * column, and it showed a field's presets only after you had chosen
           * that field. Nobody found them.
           *
           * Now the chips ARE the state: outlined is off, filled is on, and
           * pressing an active one clears it. No 'Active (2)' list to keep in
           * sync with the controls that produced it, and the whole thing is two
           * short rows. Only a custom range still needs a form, and it stays
           * folded until asked for.
           */
          <Box sx={{ px: 1, pb: 0.75, display: 'grid', gap: 0.5 }}>
            {quickPresets.length > 0 && (
              <Stack
                direction="row"
                spacing={0.5}
                flexWrap="wrap"
                useFlexGap
                alignItems="center"
              >
                <Typography sx={FILTER_LABEL_SX}>Quick</Typography>
                {quickPresets.map((preset) => {
                  const on = (state.activeFilters ?? []).some(
                    (f) => f.id === preset.filter.id
                  );
                  return (
                    <Chip
                      key={preset.id}
                      label={preset.label}
                      icon={preset.icon}
                      size="small"
                      color={on ? preset.color ?? 'primary' : 'default'}
                      variant={on ? 'filled' : 'outlined'}
                      onClick={() => togglePreset(preset)}
                      sx={FILTER_CHIP_SX}
                    />
                  );
                })}
              </Stack>
            )}

            {timeFields.length > 0 && activeTimeField && (
              <Stack
                direction="row"
                spacing={0.5}
                flexWrap="wrap"
                useFlexGap
                alignItems="center"
              >
                {/* one date field names itself; several become the row's switch */}
                {timeFields.length === 1 ? (
                  <Typography sx={FILTER_LABEL_SX}>
                    {timeFields[0].label}
                  </Typography>
                ) : (
                  timeFields.map((f) => (
                    <Chip
                      key={f.field}
                      label={f.label}
                      size="small"
                      variant={
                        activeTimeField === f.field ? 'filled' : 'outlined'
                      }
                      onClick={() =>
                        setState({ ...state, selectedField: f.field })
                      }
                      sx={{ ...FILTER_CHIP_SX, fontWeight: 600 }}
                    />
                  ))
                )}
                {TIME_RANGES.map((range) => {
                  const on = (state.activeFilters ?? []).some(
                    (f) =>
                      f.field === activeTimeField &&
                      f.type === 'timeRange' &&
                      f.value?.range === range.id
                  );
                  return (
                    <Chip
                      key={range.id}
                      label={range.label}
                      size="small"
                      color={on ? 'primary' : 'default'}
                      variant={on ? 'filled' : 'outlined'}
                      onClick={() =>
                        toggleTimeRange(activeTimeField, range.id, range.label)
                      }
                      sx={FILTER_CHIP_SX}
                    />
                  );
                })}
                <Chip
                  label="Custom…"
                  size="small"
                  variant={customRangeOpen ? 'filled' : 'outlined'}
                  onClick={() =>
                    setCurrentFilterValue(customRangeOpen ? '' : 'custom')
                  }
                  sx={FILTER_CHIP_SX}
                />
                {/* a custom range is not one of the chips, so it shows itself */}
                {(state.activeFilters ?? []).map((f, i) =>
                  f.type === 'timeRange' && f.value?.range === 'custom' ? (
                    <Chip
                      key={f.id}
                      label={getFilterLabel(f)}
                      size="small"
                      color="primary"
                      onDelete={() => removeFilter(i)}
                      sx={FILTER_CHIP_SX}
                    />
                  ) : null
                )}
                {(state.activeFilters?.length ?? 0) > 0 && (
                  <>
                    <Box sx={{ flex: 1 }} />
                    <Typography
                      component="button"
                      type="button"
                      onClick={clearAllFilters}
                      sx={{
                        p: 0,
                        border: 'none',
                        background: 'none',
                        font: 'inherit',
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                        color: 'text.secondary',
                        '&:hover': { color: 'error.main' },
                      }}
                    >
                      clear
                    </Typography>
                  </>
                )}
              </Stack>
            )}

            {customRangeOpen && activeTimeField && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <TextField
                  type="datetime-local"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  size="small"
                  sx={FILTER_DATE_SX}
                />
                <Typography sx={FILTER_LABEL_SX}>to</Typography>
                <TextField
                  type="datetime-local"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  size="small"
                  sx={FILTER_DATE_SX}
                />
                <Button
                  size="small"
                  variant="contained"
                  disabled={!isCustomDateRangeValid()}
                  onClick={() => applyCustomRange(activeTimeField)}
                  sx={{
                    height: 24,
                    fontSize: '0.68rem',
                    textTransform: 'none',
                  }}
                >
                  Apply
                </Button>
              </Stack>
            )}
          </Box>
        )}

        {/* What the query reached, said only while there IS a query. It
            sits between the box and the rows because that is where the
            eye goes when a search comes back thinner than expected. */}
        {searchable && searchQuery.trim() !== '' && searchScope && (
          <Box
            sx={{
              px: 1,
              py: '3px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0.4,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'rgba(0,0,0,0.015)',
              fontSize: '0.61rem',
              lineHeight: 1.4,
              color: 'text.secondary',
            }}
          >
            <InfoOutlined
              sx={{ fontSize: 11, mt: '2px', flexShrink: 0, opacity: 0.7 }}
            />
            <Box sx={{ minWidth: 0 }}>{searchScope(searchQuery.trim())}</Box>
          </Box>
        )}

        <Divider />
        {belowToolbar}
      </div>

      {/* ── Item list (the only part that scrolls) ───────────── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {loading ? (
          // rows-to-be, in the rows' own metrics — the varying widths come
          // from the index so the column doesn't strobe as one shape
          <Box sx={{ px: 2, py: 0.75 }} data-navskeleton="">
            {Array.from({ length: 9 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: '5px',
                }}
              >
                <Skeleton variant="circular" width={18} height={18} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton
                    variant="text"
                    width={`${82 - ((i * 17) % 38)}%`}
                    sx={{ fontSize: '0.8rem' }}
                  />
                  <Skeleton
                    variant="text"
                    width={`${58 - ((i * 11) % 28)}%`}
                    sx={{ fontSize: '0.62rem' }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        ) : objects.length === 0 ? (
          <Typography
            variant="body2"
            sx={{
              px: 2,
              py: 4,
              textAlign: 'center',
              color: 'text.secondary',
              fontStyle: 'italic',
              // a nav column is narrow, and a third line of italic reads as a
              // paragraph — messages are written to fit two, this holds them to it
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {emptyMessage ?? 'No items'}
          </Typography>
        ) : (
          <List dense={compact} style={{ padding: 0 }}>
            {activeGroupField === 'none'
              ? /* ── Flat list (no grouping) ──────────────────────── */
                (() => {
                  const flatObjects =
                    state.groupedObjects['none']?.[0]?.[1] ?? [];
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
                          data-navrow=""
                        >
                          <ListItemButton
                            sx={{
                              py: rowPy,
                              pl: 2,
                              pr: 1,
                              minHeight: compact ? 28 : 44,
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
                            {renderRowContent(renderGroup, undefined, object)}
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
                          const isOpen = isGroupOpen(field, fieldValue);

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
                                    minHeight: compact ? 22 : 30,
                                    fontSize: compact ? '0.78rem' : '0.85rem',
                                    borderTop: '1px solid rgba(0,0,0,0.06)',
                                    ...(statusColor
                                      ? {
                                          borderLeft: `3px solid ${statusColor.dot}`,
                                          pl: 1.5,
                                        }
                                      : {}),
                                  }}
                                  onClick={() =>
                                    toggleDropdown(field, fieldValue)
                                  }
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
                                        data-navrow=""
                                      >
                                        <ListItemButton
                                          sx={{
                                            py: rowPy,
                                            pl: 2,
                                            pr: 1,
                                            minHeight: compact ? 28 : 44,
                                            backgroundColor: isSelected
                                              ? 'rgba(157, 133, 239, 0.18)'
                                              : undefined,
                                            '&:hover': {
                                              backgroundColor: isSelected
                                                ? 'rgba(157, 133, 239, 0.25)'
                                                : 'rgba(0,0,0,0.04)',
                                            },
                                            ...(itemStyle
                                              ? itemStyle(object)
                                              : {}),
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
                                                listItemIconStyle?.minWidth ??
                                                36,
                                              ...listItemIconStyle,
                                              '& .MuiSvgIcon-root': {
                                                fontSize: compact ? 18 : 22,
                                              },
                                            }}
                                          >
                                            {groupItemIcon ?? groupIcon}
                                          </ListItemIcon>
                                          {renderRowContent(
                                            group,
                                            fieldValue,
                                            object
                                          )}
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
        )}
        {childrenPlacement === 'bottom' && children}
      </div>
    </div>
  );
};

export default FilterableObjectsListV2;
