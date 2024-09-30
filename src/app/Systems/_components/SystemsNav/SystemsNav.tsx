import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import {
  QueryWrapper,
  filterObjects,
  PropsOfObjectWithValuesOfType,
  OrderBy,
} from '@tapis/tapisui-common';
import {
  ListItemText,
  ListItemIcon,
  Divider,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
  Chip,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Dns,
  Public,
  ExpandMore,
  ExpandLess,
  Person,
  Delete,
  Restore,
  FilterAlt,
  PublicOff,
  SortByAlpha,
  Category,
} from '@mui/icons-material';
import UndeleteSystemModal from '../SystemToolbar/UndeleteSystemModal';

type ResolvableGroupItemValue<T, R> =
  | R
  | ((args: { group: Group<T, R>; fieldValue: unknown; object: T }) => R);
type ResolvableGroupValue<T, R> =
  | R
  | ((args: {
      group: Group<T, R>;
      fieldValue: unknown;
      objects: Array<T>;
    }) => R);

type Group<T, V> = {
  field: PropsOfObjectWithValuesOfType<T, V>;
  primaryItemText: ResolvableGroupItemValue<T, string>;
  secondaryItemText?: ResolvableGroupItemValue<T, string>;
  groupSelectorLabel?: string;
  groupLabel?: ResolvableGroupValue<T, string>;
  open?: Array<string>;
  tooltip?: ResolvableGroupValue<T, string>;
  groupIcon?: ResolvableGroupValue<T, unknown>;
  groupItemIcon?: ResolvableGroupItemValue<T, unknown>;
  onClickItem?: (object: T) => void;
  showDropdown?: boolean
};

type FilterScope = 'filter' | 'group' | 'order';

type FilterableObjectsListProps<T, V = string | undefined> = {
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
  includeAllShowDropdown?: boolean
  defaultField?: PropsOfObjectWithValuesOfType<T, V> | '*';
  defaultOnClickItem?: (object: T) => void;
  defaultGroupIcon?: any;
  defaultGroupItemIcon?: any;
  filterable?: boolean;
  groupable?: boolean;
  orderable?: boolean;
};

type FilterableObjectsListComponentProps<T, V = string | undefined> = React.FC<
  PropsWithChildren<FilterableObjectsListProps<T, V>>
>;

type FilterableObjectsListState = {
  open: string[];
  groupedObjects: { [key: string]: ReturnType<typeof filterObjects> };
  groupBy?: string;
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
  defaultOnClickItem = () => {},
  children,
  childrenPlacement = 'bottom',
  orderGroupsBy = 'ASC',
  orderGroupItemsBy = 'ASC',
  defaultGroupIcon,
  defaultGroupItemIcon,
  filterable = true,
  groupable = true,
  orderable = true,
}) => {
  const open = useMemo(() => {
    let concatenatedOpen: FilterableObjectsListState['open'] =
      includeAll && includeAllOpen ? ['*'] : [];

    for (let group of groups) {
      if (group.open && group.open.length > 0) {
        concatenatedOpen = [...concatenatedOpen, ...group.open];
      }
    }
    return concatenatedOpen;
  }, [groups]);

  const [state, setState] = useState<FilterableObjectsListState>({
    open,
    groupedObjects: {},
    groupBy: defaultField ? defaultField : includeAll ? '*' : undefined,
    filterScope: defaultFilterScope,
  });

  console.log({state})

  useEffect(() => {
    const modifiedState: FilterableObjectsListState = {
      open: state.open,
      groupedObjects: {},
      groupBy: state.groupBy,
      filterScope: state.filterScope
    };
    for (let group of groups) {
      modifiedState.groupedObjects = {
        ...modifiedState.groupedObjects,
        [group.field as unknown as string]: filterObjects(
          objects,
          group.field,
          orderGroupsBy
        ),
      };
    }

    if (includeAll) {
      modifiedState.groupedObjects['*'] = [['*', objects]];
    }

    setState(modifiedState);
  }, [objects, groups]);

  const toggleDropdown = (target: string) => {
    if (state.open.includes(target)) {
      setState({ ...state, open: state.open.filter((s) => s !== target) });
      return;
    }

    setState({ ...state, open: [...state.open, target] });
  };

  const resolveGroupValue = (
    group: { [key: string]: any | undefined },
    prop: string | undefined,
    fieldValue: unknown,
    _default: any = undefined
  ) => {
    if (prop === undefined) {
      return _default;
    }

    if (typeof group[prop] === 'function') {
      if (prop === 'groupIcon') {
        console.log({ groupIcon: group[prop]({ group, fieldValue, objects }) });
      }
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

  let allGroups = [...groups];
  if (includeAll) {
    allGroups = [
      {
        field: '*',
        primaryItemText: ({ object }: any) => object.id,
        secondaryItemText: ({ object }: any) => object.host,
        groupLabel: includeAllGroupLabel,
        groupSelectorLabel: includeAllSelectorLabel,
        groupIcon: defaultGroupIcon,
        groupItemIcon: defaultGroupItemIcon,
        tooltip: includeAllToolTip,
        showDropdown: includeAllShowDropdown
      },
      ...groups,
    ];
  }

  return (
    <div style={{maxHeight: "100%", minHeight: "100%", overflowY: "auto"}}>
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
          (filterable || orderable || groupable) ? (
            <ListSubheader
              style={{
                paddingTop: '8px',
                paddingBottom: '8px',
                display: 'flex',
                justifyContent: 'space-evenly',
                gap: "16px"
              }}
            >
              {filterable && (
                <Button
                  size="small"
                  variant={state.filterScope === "filter" ? "contained" : "outlined"}
                  startIcon={<FilterAlt />}
                  onClick={() => {
                    setState({...state, filterScope: "filter"})
                  }}
                >
                  Filter
                </Button>
              )}
              {groupable && (
                <Button
                  size="small"
                  variant={state.filterScope === "group" ? "contained" : "outlined"}
                  startIcon={<Category />}
                  onClick={() => {
                    setState({...state, filterScope: "group"})
                  }}
                >
                  Group
                </Button>
              )}
              {orderable && (
                <Button 
                  size="small" 
                  variant={state.filterScope === "order" ? "contained" : "outlined"} 
                  startIcon={<SortByAlpha />}
                  onClick={() => {
                    setState({...state, filterScope: "order"})
                  }}
                >
                  Order
                </Button>
              )}
            </ListSubheader>
          ) : undefined
        }
      >
        {groupable && state.filterScope === "group" && (
          <>
            <Divider />
            <span
              style={{
                display: 'flex',
                gap: '8px',
                padding: '8px',
                width: '100%',
                overflowX: 'auto',
              }}
            >
              {allGroups.map((group) => {
                return (
                  <Chip
                    size="small"
                    label={
                      group.groupSelectorLabel
                        ? group.groupSelectorLabel
                        : group.field
                    }
                    color="primary"
                    variant={
                      state.groupBy === group.field! ? 'filled' : 'outlined'
                    }
                    onClick={() => {
                      setState({
                        ...state,
                        groupBy: group.field,
                      });
                    }}
                  />
                );
              })}
            </span>
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
                  console.log({ fieldValue, objects });
                  const isOpen = state.open.includes(fieldValue);

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
                  const groupItemIcon = resolveGroupValue(
                    group,
                    'groupItemIcon',
                    fieldValue,
                    defaultGroupItemIcon
                  );

                  return (
                    <List
                      style={{ padding: '0px' }}
                      subheader={
                        (group.showDropdown || group.showDropdown === undefined) && (

                          <ListSubheader
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                            onClick={() => {
                              toggleDropdown(fieldValue);
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
                          return (
                            <ListItem disablePadding>
                              <ListItemButton
                                style={{ padding: '4px', paddingLeft: '16px' }}
                                onClick={() => {
                                  group.onClickItem
                                    ? group.onClickItem(object)
                                    : defaultOnClickItem(object);
                                }}
                              >
                                <ListItemIcon>
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

const SystemsNav: React.FC = () => {
  const [undeleteSystem, setUndeleteSystem] = useState<string | undefined>(
    undefined
  );

  const { url } = useRouteMatch();
  const history = useHistory();

  // Fetch systems listing
  const { data, isLoading, error } = Hooks.useList({
    listType: Systems.ListTypeEnum.All,
    select: 'allAttributes',
    computeTotal: true,
  });

  // Fetch deleted systems listing
  const {
    data: deletedData,
    isLoading: deletedIsLoading,
    error: deletedError,
  } = Hooks.useDeletedList();
  const deletedSystems: Array<Systems.TapisSystem> = deletedData?.result ?? [];
  const systems: Array<Systems.TapisSystem> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={[error]}>
      <div
        style={{
          borderBottom: '1px solid #CCCCCC',
          borderRight: '1px solid #CCCCCC',
        }}
      >
        <FilterableObjectsList
          objects={systems}
          defaultField={'isPublic'}
          defaultOnClickItem={(system) => {
            history.push(`${url}/${system.id}`);
          }}
          includeAll={true}
          includeAllGroupLabel="All Systems"
          includeAllSelectorLabel="all systems"
          defaultGroupIcon={<Public />}
          groupable={true}
          groups={[
            {
              field: 'isPublic',
              groupSelectorLabel: 'visibility',
              primaryItemText: ({ object }) => object.id,
              secondaryItemText: ({ object }) => object.host,
              open: ['true'],
              tooltip: ({ fieldValue }) =>
                fieldValue === 'true'
                  ? 'Publically available systems'
                  : 'Systems available only to you and those it was explicitly shared with',
              groupLabel: ({ fieldValue }) =>
                fieldValue === 'true' ? 'Public Systems' : 'My Systems',
              groupIcon: ({ fieldValue }) =>
                fieldValue === 'true' ? <Public /> : <Person />,
              groupItemIcon: <Dns />,
            },
            {
              field: 'host',
              primaryItemText: ({ object }) => object.id,
              secondaryItemText: ({ object }) => object.host,
              groupIcon: <Dns />,
              groupItemIcon: <Dns />,
            },
            {
              field: 'defaultAuthnMethod',
              primaryItemText: ({ object }) => object.id,
              secondaryItemText: ({ object }) => object.host,
              groupSelectorLabel: 'auth',
              groupIcon: <Dns />,
              groupItemIcon: <Dns />,
            },
            {
              field: 'deleted',
              primaryItemText: ({ object }) => object.id,
              secondaryItemText: ({ object }) => object.host,
              groupSelectorLabel: 'deleted',
              groupIcon: <Delete />,
              groupItemIcon: <Restore />,
              onClickItem: (object) => {
                setUndeleteSystem(object.id);
              },
            },
          ]}
        >
          <QueryWrapper isLoading={deletedIsLoading} error={[deletedError]}>
            <FilterableObjectsList
              objects={deletedSystems}
              defaultField={undefined}
              includeAll={true}
              includeAllOpen={false}
              includeAllGroupLabel="Deleted Systems"
              includeAllToolTip="Systems that have been soft deleted"
              includeAllShowDropdown={true}
              defaultOnClickItem={(object) => {
                setUndeleteSystem(object.id);
              }}
              filterable={false}
              groupable={false}
              orderable={false}
              defaultGroupIcon={<Delete color="error" />}
              defaultGroupItemIcon={<Restore color="success" />}
              groups={[]}
            />
          </QueryWrapper>
        </FilterableObjectsList>
      </div>
      {undeleteSystem && (
        <UndeleteSystemModal
          systemId={undeleteSystem}
          toggle={() => {
            setUndeleteSystem(undefined);
          }}
        />
      )}
    </QueryWrapper>
  );
};

export default SystemsNav;
