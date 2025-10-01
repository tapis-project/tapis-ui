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
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  FilterAlt,
  SortByAlpha,
  Category,
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
  });

  useEffect(() => {
    const modifiedState: FilterableObjectsListState = {
      ...state,
      groupedObjects: {},
    };
    for (let group of groups) {
      modifiedState.groupedObjects = {
        ...modifiedState.groupedObjects,
        [group.field as unknown as string]: filterObjects(
          objects,
          group.field,
          state.orderBy
        ),
      };
    }

    if (includeAll) {
      modifiedState.groupedObjects['*'] = [['*', objects]];
    }

    setState(modifiedState);
  }, [state.orderBy, objects, groups]);

  const toggleDropdown = (field: string, fieldValue: string) => {
    const target = `${field}:${fieldValue}`;
    if (state.open.includes(target)) {
      setState({ ...state, open: state.open.filter((s) => s !== target) });
      return;
    }

    setState({ ...state, open: [...state.open, target] });
  };

  let allGroups = [...groups];
  if (includeAll) {
    allGroups = [
      {
        field: '*',
        primaryItemText: includeAllPrimaryItemText,
        secondaryItemText: includeAllSecondaryItemText,
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
                                  secondary={resolveItemValue(
                                    group,
                                    'secondaryItemText',
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
