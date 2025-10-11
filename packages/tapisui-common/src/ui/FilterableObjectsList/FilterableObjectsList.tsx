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
  FormControl,
  InputLabel,
  Select,
  TextField,
  Chip,
  Stack,
  Box,
  Typography,
} from '@mui/material';

import {
  ExpandMore,
  ExpandLess,
  FilterAlt,
  SortByAlpha,
  Category,
  AccessTime,
  Clear,
} from '@mui/icons-material';

export type ResolvableGroupItemValue<T, R> =
  | R
  | ((args: {
      group: Group<T, R>;
      fieldValue: string | undefined;
      object: T;
    }) => R);

export type ResolvableGroupValue<T, R> =
  | R
  | ((args: {
      group: Group<T, R>;
      fieldValue: string | undefined;
      objects: Array<T>;
    }) => R);

export type Group<T, V> = {
  field: PropsOfObjectWithValuesOfType<T, V>;
  primaryItemText: ResolvableGroupItemValue<T, string>;
  secondaryItemText?: ResolvableGroupItemValue<T, string>;
  tertiaryItemText?: ResolvableGroupItemValue<T, string>;
  groupSelectorLabel?: string;
  groupLabel?: ResolvableGroupValue<T, string>;
  open?: Array<string>;
  tooltip?: ResolvableGroupValue<T, string>;
  groupIcon?: ResolvableGroupValue<T, any>;
  groupItemIcon?: ResolvableGroupItemValue<T, any>;
  onClickItem?: (object: T) => void;
  showDropdown?: boolean;
};

type FilterScope = 'filter' | 'group' | 'order';

//TODO: Add more filter types
export type FilterType = 'timeRange';

export type TimeRangeFilter = {
  type: 'timeRange';
  field: string;
  range: 'last24h' | 'last7d' | 'last30d' | 'custom';
  customStart?: Date;
  customEnd?: Date;
};

export type Filter = {
  id: string;
  field: string; // Which field is being filtered
  type: string; // Filter type (same as filterType from config)
  value: any; // Filter value
  label: string;
};

// Pre-defined common filters for users
export type FilterPreset = {
  id: string;
  label: string;
  icon?: React.ReactElement;
  filter: Filter;
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
};

export type FilterConfig = {
  filterableFields: Array<{
    field: string; // filterable fields like 'created', 'lastUpdated'
    label: string;
    filterType: string; // 'timeRange'
    options?: Array<{ value: string; label: string }>; // For select fields
    presets?: Array<FilterPreset>; // Field-specific presets
  }>;

  filterFunctions: {
    [field: string]: (objects: any[], filter: Filter) => any[];
  };
};

export type FilterableObjectsListProps<T, V = string | undefined> = {
  objects: Array<T>;
  groups: Array<Group<T, V>>;
  title?: string;
  titleIcon?: any;
  orderGroupsBy?: OrderBy;
  orderGroupItemsBy?: OrderBy;
  defaultFilterScope?: FilterScope;
  childrenPlacement?: 'top' | 'bottom';
  includeAll?: boolean;
  includeAllOpen?: boolean;
  includeAllSelectorLabel?: string;
  includeAllGroupLabel?: string;
  includeAllToolTip?: string;
  includeAllShowDropdown?: boolean;
  includeAllPrimaryItemText?: ResolvableGroupItemValue<T, string>;
  includeAllSecondaryItemText?: ResolvableGroupItemValue<T, string>;
  includeAllTertiaryItemText?: ResolvableGroupItemValue<T, string>;
  includeAllGroupIcon?: ResolvableGroupItemValue<T, any>;
  includeAllGroupItemIcon?: ResolvableGroupItemValue<T, any>;
  defaultField?: PropsOfObjectWithValuesOfType<T, V> | '*';
  defaultOnClickItem?: (object: T) => void;
  defaultGroupIcon?: any;
  defaultGroupItemIcon?: any;
  filterable?: boolean;
  groupable?: boolean;
  orderable?: boolean;
  selectedField?: string;
  isSelectedItem?: (args: { object: T; selectedField?: string }) => boolean;
  listItemIconStyle?: React.CSSProperties;
  middleClickLink?: (object: T) => string | undefined;
  filterConfig?: FilterConfig;
  defaultFilters?: Array<Filter>;
  onFiltersChange?: (filters: Array<Filter>) => void;
};

export type FilterableObjectsListComponentProps<
  T,
  V = string | undefined
> = React.FC<PropsWithChildren<FilterableObjectsListProps<T, V>>>;

type FilterableObjectsListState = {
  open: string[];
  groupedObjects: { [key: string]: ReturnType<typeof filterObjects> };
  groupBy?: string;
  orderBy?: OrderBy;
  filterScope?: FilterScope;
  activeFilters?: Array<Filter>;
  currentFilterType?: FilterType;
  selectedField?: string; // Currently selected field for filtering
};

const FilterableObjectsList: FilterableObjectsListComponentProps<{
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
  listItemIconStyle = { minWidth: '56px' },
  middleClickLink = undefined,
  filterConfig = undefined,
  defaultFilters = [],
  onFiltersChange = undefined,
}) => {
  const open = useMemo(() => {
    let concatenatedOpen: FilterableObjectsListState['open'] =
      includeAll && includeAllOpen ? ['*:*'] : [];

    for (let group of groups) {
      if (!(group.open && group.open.length > 0)) {
        continue;
      }
      const groupOpen: string[] = [];
      for (let fieldValue of group.open) {
        groupOpen.push(`${group.field}:${fieldValue}`);
      }
      concatenatedOpen = [...concatenatedOpen, ...groupOpen];
    }
    return concatenatedOpen;
  }, [groups]);

  const [state, setState] = useState<FilterableObjectsListState>({
    open: open,
    groupedObjects: {},
    groupBy: defaultField ? defaultField : includeAll ? '*' : undefined,
    filterScope: defaultFilterScope,
    orderBy: orderGroupsBy,
    ...(filterable && {
      activeFilters: defaultFilters,
      currentFilterType: 'timeRange',
    }),
  });

  const [currentFilterValue, setCurrentFilterValue] = useState<string>('');
  // State to show duplicate filter feedback
  const [showDuplicateMessage, setShowDuplicateMessage] =
    useState<boolean>(false);
  // State for custom date range inputs
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Validation function for custom date range
  const isCustomDateRangeValid = (): boolean => {
    if (!customStartDate) return false;

    // If only start date is provided, it's valid (end defaults to now)
    if (!customEndDate) return true;

    // If both dates are provided, check that start is before end
    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate);
    return startDate <= endDate;
  };

  useEffect(() => {
    const modifiedState: FilterableObjectsListState = {
      ...state,
      groupedObjects: {},
    };

    // Start with all objects
    let filteredObjects = objects;

    // Apply advanced filters only if filterable is true
    if (filterable && state.activeFilters) {
      filteredObjects = applyFilters(filteredObjects, state.activeFilters);
    }

    for (let group of groups) {
      modifiedState.groupedObjects = {
        ...modifiedState.groupedObjects,
        [group.field as unknown as string]: filterObjects(
          filteredObjects,
          group.field,
          state.orderBy
        ),
      };
    }

    if (includeAll) {
      modifiedState.groupedObjects['*'] = [['*', filteredObjects]];
    }

    setState(modifiedState);
  }, [state.orderBy, state.activeFilters, objects, groups, filterable]);

  const toggleDropdown = (field: string, fieldValue: string) => {
    const target = `${field}:${fieldValue}`;
    if (state.open.includes(target)) {
      setState({ ...state, open: state.open.filter((s) => s !== target) });
      return;
    }

    setState({ ...state, open: [...state.open, target] });
  };

  // Apply all active filters using config-driven approach
  const applyFilters = (
    objects: Array<any>,
    filters: Array<Filter>
  ): Array<any> => {
    if (!filterConfig) return objects;

    return filters.reduce((filteredObjects, filter) => {
      const filterFunction = filterConfig.filterFunctions[filter.field];

      if (filterFunction) {
        return filterFunction(filteredObjects, filter);
      }

      return filteredObjects;
    }, objects);
  };

  // Add a filter
  const addFilter = (filter: Filter) => {
    if (!filterable || !state.activeFilters) return;

    // Check if this exact filter already exists
    const isDuplicate = state.activeFilters.some((existingFilter) => {
      if (existingFilter.type !== filter.type) return false;

      // For timeRange filters, check if field and range match
      if (filter.type === 'timeRange' && existingFilter.type === 'timeRange') {
        const filterRange = filter.value?.range;
        const existingRange = existingFilter.value?.range;

        // For custom ranges, also compare customStart and customEnd dates
        if (filterRange === 'custom' && existingRange === 'custom') {
          return (
            existingFilter.field === filter.field &&
            existingFilter.value?.customStart === filter.value?.customStart &&
            existingFilter.value?.customEnd === filter.value?.customEnd
          );
        }
        // For non-custom ranges, just compare field and range
        return (
          existingFilter.field === filter.field && existingRange === filterRange
        );
      }

      return false;
    });

    // Only add if it's not a duplicate
    if (!isDuplicate) {
      const newFilters = [...state.activeFilters, filter];
      setState({ ...state, activeFilters: newFilters });
      onFiltersChange?.(newFilters);
    } else {
      // Show duplicate message briefly
      setShowDuplicateMessage(true);
      setTimeout(() => setShowDuplicateMessage(false), 2000);
    }
  };

  // Remove a filter
  const removeFilter = (filterIndex: number) => {
    if (!filterable || !state.activeFilters) return;
    const newFilters = state.activeFilters.filter(
      (_, index) => index !== filterIndex
    );
    setState({ ...state, activeFilters: newFilters });
    setCurrentFilterValue('');
    onFiltersChange?.(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    if (!filterable) return;
    setState({ ...state, activeFilters: [] });
    setCurrentFilterValue('');
    onFiltersChange?.([]);
  };

  // Apply a filter preset
  const applyFilterPreset = (preset: FilterPreset) => {
    if (!filterable) return;
    addFilter(preset.filter);
  };

  // Get a human-readable label for a filter
  const getFilterLabel = (filter: Filter): string => {
    // Use the label from the filter if available
    if (filter.label) {
      return filter.label;
    }

    // Fallback to generating label from filter data
    switch (filter.type) {
      case 'timeRange':
        const rangeLabels = {
          last24h: 'Last 24 Hours',
          last7d: 'Last 7 Days',
          last30d: 'Last 30 Days',
          custom: 'Custom Range',
        };

        const fieldLabel = getFieldLabel(filter.field);
        const range = filter.value?.range;

        // For custom ranges, show the actual date range with minute precision
        if (range === 'custom') {
          const formatDateTime = (date: Date) => {
            return date.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
          };

          const startDate = filter.value?.customStart
            ? formatDateTime(filter.value.customStart)
            : 'Unknown';
          const endDate = filter.value?.customEnd
            ? formatDateTime(filter.value.customEnd)
            : formatDateTime(new Date());

          return `${fieldLabel}: ${startDate} - ${endDate}`;
        }

        return `${fieldLabel}: ${
          rangeLabels[range as keyof typeof rangeLabels] || 'Unknown Range'
        }`;
      default:
        return `${getFieldLabel(filter.field)}: ${filter.value || 'Unknown'}`;
    }
  };

  // Helper functions for field-specific data
  const getFieldPresets = (field: string): Array<FilterPreset> => {
    const fieldConfig = filterConfig?.filterableFields.find(
      (f) => f.field === field
    );
    return fieldConfig?.presets || [];
  };

  const getFieldConfig = (field: string) => {
    return filterConfig?.filterableFields.find((f) => f.field === field);
  };

  const getFieldLabel = (field: string): string => {
    const fieldConfig = getFieldConfig(field);
    return fieldConfig?.label || field;
  };

  let allGroups = [...groups];
  if (includeAll) {
    allGroups = [
      {
        field: '*',
        primaryItemText: includeAllPrimaryItemText,
        secondaryItemText: includeAllSecondaryItemText,
        tertiaryItemText: includeAllTertiaryItemText,
        groupLabel: includeAllGroupLabel,
        groupSelectorLabel: includeAllSelectorLabel,
        groupIcon: includeAllGroupIcon ? includeAllGroupIcon : defaultGroupIcon,
        groupItemIcon: includeAllGroupItemIcon
          ? includeAllGroupItemIcon
          : defaultGroupIcon,
        tooltip: includeAllToolTip,
        showDropdown: includeAllShowDropdown,
      },
      ...groups,
    ];
  }

  const resolveGroupValue = (
    group: { [key: string]: any | undefined },
    prop: string | undefined,
    fieldValue: string,
    _default: any = undefined
  ) => {
    if (prop === undefined) {
      return _default;
    }

    if (typeof group[prop] === 'function') {
      return group[prop]({ group, fieldValue, objects });
    }

    if (group[prop] === undefined) {
      return _default;
    }

    return group[prop];
  };

  const resolveItemValue = (
    group: { [key: string]: any | undefined },
    prop: string | undefined,
    fieldValue: unknown,
    object: (typeof objects)[number],
    _default: any = undefined
  ) => {
    if (prop === undefined) {
      return _default;
    }

    if (typeof group[prop] === 'function') {
      return group[prop]({ group, fieldValue, object, objects });
    }

    if (group[prop] === undefined) {
      return _default;
    }

    return group[prop];
  };

  // Render secondary (one line, ellipsis) plus optional tertiary on next line
  const renderSecondary = (
    group: { [key: string]: any | undefined },
    fieldValue: unknown,
    object: (typeof objects)[number]
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
    const oneLineEllipsisStyle: React.CSSProperties = {
      display: 'inline-block',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      verticalAlign: 'bottom',
    };
    const SecondaryOneLine = (
      <span style={oneLineEllipsisStyle}>{secondaryText}</span>
    );
    const TertiaryOneLine = (
      <span style={oneLineEllipsisStyle}>{tertiaryText}</span>
    );

    return tertiaryText ? (
      <>
        {SecondaryOneLine}
        <br />
        {TertiaryOneLine}
      </>
    ) : (
      SecondaryOneLine
    );
  };

  return (
    <div style={{ maxHeight: '100%', minHeight: '100%', overflowY: 'auto' }}>
      {title && (
        <>
          <List
            style={{ padding: '0px' }}
            subheader={
              <ListSubheader>
                {titleIcon}
                <span style={{ marginLeft: '32px', fontWeight: 'bold' }}>
                  {title}
                </span>
              </ListSubheader>
            }
          />
          <Divider />
        </>
      )}
      {childrenPlacement === 'top' && children}
      <List
        style={{ padding: '0px' }}
        subheader={
          filterable || orderable || groupable ? (
            <ListSubheader
              style={{
                paddingTop: '8px',
                paddingBottom: '8px',
                display: 'flex',
                justifyContent: 'space-evenly',
                gap: '16px',
              }}
            >
              {filterable && (
                <Button
                  size="small"
                  variant={
                    state.filterScope === 'filter' ? 'contained' : 'outlined'
                  }
                  startIcon={<FilterAlt />}
                  onClick={() => {
                    setState({ ...state, filterScope: 'filter' });
                  }}
                >
                  Filter
                </Button>
              )}
              {groupable && (
                <Button
                  size="small"
                  variant={
                    state.filterScope === 'group' ? 'contained' : 'outlined'
                  }
                  startIcon={<Category />}
                  onClick={() => {
                    setState({ ...state, filterScope: 'group' });
                  }}
                >
                  Group
                </Button>
              )}
              {orderable && (
                <Button
                  size="small"
                  variant={
                    state.filterScope === 'order' ? 'contained' : 'outlined'
                  }
                  startIcon={<SortByAlpha />}
                  onClick={() => {
                    setState({ ...state, filterScope: 'order' });
                  }}
                >
                  Order
                </Button>
              )}
            </ListSubheader>
          ) : undefined
        }
      >
        {groupable && state.filterScope === 'group' && (
          <>
            <Divider />
            <div
              style={{
                padding: '12px',
                width: '100%',
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="group-by-dropdown">Group by</InputLabel>
                <Select
                  labelId="group-by-dropdown"
                  id="group-by-dropdown"
                  value={state.groupBy}
                  label="Group by"
                  onChange={(e) => {
                    setState({
                      ...state,
                      groupBy: e.target.value,
                    });
                  }}
                >
                  {allGroups.map((group) => {
                    return (
                      <MenuItem value={group.field} dense>
                        {group.groupSelectorLabel
                          ? group.groupSelectorLabel
                          : group.field}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </div>
          </>
        )}
        {orderable && state.filterScope === 'order' && (
          <>
            <Divider />
            <div
              style={{
                padding: '12px',
                width: '100%',
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="order-by-dropdown">Order by</InputLabel>
                <Select
                  labelId="order-by-dropdown"
                  id="order-by-dropdown"
                  value={state.orderBy}
                  label="Order by"
                  onChange={(e) => {
                    setState({
                      ...state,
                      orderBy: e.target.value as OrderBy,
                    });
                  }}
                >
                  {(['ASC', 'DESC'] as OrderBy[]).map((orderBy) => {
                    return (
                      <MenuItem value={orderBy} dense>
                        {orderBy}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </div>
          </>
        )}
        {filterable && state.filterScope === 'filter' && (
          <>
            <Divider />
            <div
              style={{
                padding: '12px',
                width: '100%',
              }}
            >
              {/* Active Filters */}
              {state.activeFilters && state.activeFilters.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2">
                      Active Filters ({state.activeFilters?.length || 0})
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Clear />}
                      onClick={clearAllFilters}
                      color="error"
                    >
                      Clear All
                    </Button>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {state.activeFilters?.map((filter, index) => (
                      <Chip
                        key={index}
                        label={getFilterLabel(filter)}
                        onDelete={() => removeFilter(index)}
                        color="primary"
                        size="small"
                        variant="filled"
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {showDuplicateMessage && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="warning.main">
                    This filter is already active
                  </Typography>
                </Box>
              )}

              {/* Step 1: Field Selection */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Filter by Field</InputLabel>
                <Select
                  value={state.selectedField || ''}
                  label="Filter by Field"
                  onChange={(e) => {
                    setState({ ...state, selectedField: e.target.value });
                    setCurrentFilterValue('');
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                >
                  <MenuItem value="">Select a field to filter...</MenuItem>
                  {filterConfig?.filterableFields.map((field) => (
                    <MenuItem key={field.field} value={field.field}>
                      {field.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Step 2: Field-Specific Presets */}
              {state.selectedField &&
                getFieldPresets(state.selectedField).length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Quick Filters for {getFieldLabel(state.selectedField)}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
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
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

              {/* Step 3: Custom Filter Input for TimeRange */}
              {state.selectedField &&
                getFieldConfig(state.selectedField)?.filterType ===
                  'timeRange' && (
                  <Box>
                    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                      <InputLabel>Add Time Range Filter</InputLabel>
                      <Select
                        value={currentFilterValue}
                        label="Add Time Range Filter"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value && value.startsWith('timeRange:')) {
                            const range = value.split(
                              ':'
                            )[1] as TimeRangeFilter['range'];

                            if (range === 'custom') {
                              setCurrentFilterValue(value);
                            } else {
                              // For predefined ranges, add the filter immediately
                              addFilter({
                                id: `filter-${Date.now()}`,
                                field: state.selectedField!,
                                type: 'timeRange',
                                value: { range },
                                label: `${getFieldLabel(
                                  state.selectedField!
                                )}: ${
                                  range === 'last24h'
                                    ? 'Last 24 Hours'
                                    : range === 'last7d'
                                    ? 'Last 7 Days'
                                    : 'Last 30 Days'
                                }`,
                              });
                              setCurrentFilterValue('');
                            }
                          }
                        }}
                      >
                        <MenuItem value="">Select a time range...</MenuItem>
                        <ListSubheader>Time Range</ListSubheader>
                        <MenuItem value="timeRange:last24h">
                          Last 24 Hours
                        </MenuItem>
                        <MenuItem value="timeRange:last7d">
                          Last 7 Days
                        </MenuItem>
                        <MenuItem value="timeRange:last30d">
                          Last 30 Days
                        </MenuItem>
                        <MenuItem value="timeRange:custom">
                          Custom Range
                        </MenuItem>
                      </Select>
                    </FormControl>

                    {/* Custom Date Range Inputs */}
                    {currentFilterValue === 'timeRange:custom' && (
                      <Box sx={{ mt: 2 }}>
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                          <TextField
                            label="Start Time"
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
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                          <TextField
                            label="End Time"
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
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </Stack>
                        {/* Validation Error Message */}
                        {customStartDate &&
                          customEndDate &&
                          !isCustomDateRangeValid() && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ mb: 1, display: 'block' }}
                            >
                              Start date must be earlier than end date
                            </Typography>
                          )}
                        {/* Helper text when only start date is provided */}
                        {customStartDate && !customEndDate && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mb: 1, display: 'block' }}
                          >
                            End date will default to current time
                          </Typography>
                        )}
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              if (isCustomDateRangeValid()) {
                                const startDate = new Date(customStartDate);
                                const endDate = customEndDate
                                  ? new Date(customEndDate)
                                  : new Date();

                                addFilter({
                                  id: `filter-${Date.now()}`,
                                  field: state.selectedField!,
                                  type: 'timeRange',
                                  value: {
                                    range: 'custom',
                                    customStart: startDate,
                                    customEnd: endDate,
                                  },
                                  label: `${getFieldLabel(
                                    state.selectedField!
                                  )}: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
                                });
                                // Reset the form
                                setCurrentFilterValue('');
                                setCustomStartDate('');
                                setCustomEndDate('');
                              }
                            }}
                            disabled={!isCustomDateRangeValid()}
                          >
                            Apply Filter
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
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
            </div>
          </>
        )}
        <Divider />
        {Object.keys(state.groupedObjects).map((field) => {
          const group = allGroups.filter((g) => g.field === field)[0];
          const objectGroups = state.groupedObjects[field];
          return (
            <>
              {state.groupBy === field &&
                objectGroups &&
                objectGroups.map((objectGroup: any) => {
                  const [fieldValue, objects] = objectGroup;
                  const isOpen =
                    state.open.includes(`${field}:${fieldValue}`) ||
                    state.open.includes(`${field}:*`);

                  // Get the resolved values from the user-provided resolver
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

                  return (
                    <List
                      style={{ padding: '0px' }}
                      subheader={
                        (group.showDropdown ||
                          group.showDropdown === undefined) && (
                          <ListSubheader
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => {
                              toggleDropdown(field, fieldValue);
                            }}
                          >
                            {groupIcon}
                            <Tooltip title={tooltip} placement="left">
                              <span style={{ marginLeft: '32px' }}>
                                <>
                                  {label.length <= 17
                                    ? label
                                    : label!.slice(0, 15) + '...'}
                                </>
                              </span>
                            </Tooltip>
                            <span style={{ marginLeft: '8px' }}>
                              ({objects.length})
                            </span>
                            <span
                              style={{ marginLeft: '8px', cursor: 'pointer' }}
                            >
                              {isOpen ? <ExpandMore /> : <ExpandLess />}
                            </span>
                          </ListSubheader>
                        )
                      }
                    >
                      <Divider />
                      {objects.length > 0 ? (
                        isOpen &&
                        objects.map((object: any) => {
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
                          return (
                            <ListItem disablePadding>
                              <ListItemButton
                                style={{
                                  padding: '4px',
                                  paddingLeft: '16px',
                                  backgroundColor: isSelectedItem({
                                    object,
                                    selectedField,
                                  })
                                    ? 'rgba(157, 133, 239, 0.25)'
                                    : undefined,
                                  // ...other styles...
                                }}
                                onClick={() => {
                                  group.onClickItem
                                    ? group.onClickItem(object)
                                    : defaultOnClickItem(object);
                                }}
                                onMouseDown={(event) => {
                                  if (event.button === 1) {
                                    event.preventDefault();
                                    if (mcLink) {
                                      window.open(mcLink, '_blank');
                                    }
                                  }
                                }}
                                selected={isSelectedItem({
                                  object,
                                  selectedField,
                                })}
                              >
                                <ListItemIcon style={listItemIconStyle}>
                                  {groupItemIcon ? groupItemIcon : groupIcon}
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
                                />
                              </ListItemButton>
                            </ListItem>
                          );
                        })
                      ) : (
                        <i style={{ padding: '16px' }}>No objects found</i>
                      )}
                    </List>
                  );
                })}
            </>
          );
        })}
      </List>
      {childrenPlacement === 'bottom' && children}
    </div>
  );
};

export default FilterableObjectsList;
