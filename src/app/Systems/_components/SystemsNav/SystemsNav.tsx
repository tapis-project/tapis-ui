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
} from '@mui/icons-material';
import UndeleteSystemModal from '../SystemToolbar/UndeleteSystemModal';

type GroupByFields<T, V> = {
  field: PropsOfObjectWithValuesOfType<T, V>;
  label?: string;
  asDropdowns?: boolean;
  defaultOpen?: boolean;
};

type FilterableObjectsListProps<T, V = string | undefined> = {
  objects: Array<T>;
  groupByFields: Array<GroupByFields<T, V>>;
  childrenPlacement?: 'top' | 'bottom';
};

type FilterableObjectsListComponentProps<T, V = string | undefined> = React.FC<
  PropsWithChildren<FilterableObjectsListProps<T, V>>
>;

type FilterableObjectsListState = {
  open: string[];
  groupedObjects: { [key: string]: ReturnType<typeof filterObjects> };
};

const FilterableObjectsList: FilterableObjectsListComponentProps<
  Systems.TapisSystem
> = ({ objects, groupByFields, children, childrenPlacement = 'bottom' }) => {
  const [state, setState] = useState<FilterableObjectsListState>({
    open: [],
    groupedObjects: {},
  });

  useEffect(() => {
    const modifiedState: FilterableObjectsListState = {
      open: state.open,
      groupedObjects: {},
    };
    for (let filter of groupByFields) {
      modifiedState.groupedObjects = {
        ...modifiedState.groupedObjects,
        [filter.field as unknown as string]: filterObjects(
          objects,
          filter.field,
          'ASC'
        ),
      };
    }
    console.log({ modifiedState });
    setState(modifiedState);
  }, [objects, groupByFields]);

  const renderFilteredObjectsList = useCallback(
    (
      systems: Array<Systems.TapisSystem>,
      toggle: () => void,
      onObjectClick: (object: (typeof objects)[number]) => void,
      listName: string,
      title: string,
      icon: any,
      itemIcon: any,
      secondary: PropsOfObjectWithValuesOfType<
        (typeof objects)[number],
        string | undefined
      > = 'host'
    ) => {
      return (
        <List
          subheader={
            <ListSubheader
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => {
                toggle();
              }}
            >
              {icon}
              <Tooltip title={title} placement="left">
                <span style={{ marginLeft: '32px' }}>
                  <>{title.length <= 17 ? title : title.slice(0, 15) + '...'}</>
                </span>
              </Tooltip>
              <span style={{ marginLeft: '8px' }}>({systems.length})</span>
              <span style={{ marginLeft: '8px', cursor: 'pointer' }}>
                {state.open.includes(listName) ? (
                  <ExpandMore />
                ) : (
                  <ExpandLess />
                )}
              </span>
            </ListSubheader>
          }
        >
          <Divider />
          {systems.length ? (
            state.open.includes(listName) &&
            systems.map((system) => {
              return (
                <ListItem disablePadding>
                  <ListItemButton
                    style={{ padding: '4px', paddingLeft: '16px' }}
                    onClick={() => {
                      onObjectClick(system);
                    }}
                  >
                    <ListItemIcon>{itemIcon}</ListItemIcon>
                    <ListItemText
                      primary={system.id}
                      secondary={system[secondary]}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })
          ) : (
            <i style={{ padding: '16px' }}>No {listName} systems found</i>
          )}
        </List>
      );
    },
    [state.groupedObjects, groupByFields, objects]
  );

  return (
    <>
      <List
        subheader={
          <ListSubheader style={{ cursor: 'pointer', userSelect: 'none' }}>
            <span style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
              <FilterAlt />
              {groupByFields.map((groupByField) => {
                return (
                  <Chip
                    size="small"
                    label={
                      groupByField.label
                        ? groupByField.label
                        : groupByField.field
                    }
                    color="primary"
                    variant={
                      state.open.includes('visibility') ? 'filled' : 'outlined'
                    }
                    onClick={() => {
                      setState({
                        ...state,
                        open: ['visibility'],
                      });
                    }}
                  />
                );
              })}
            </span>
          </ListSubheader>
        }
      ></List>
    </>
  );
};

const SystemsNav: React.FC = () => {
  const [state, setState] = useState({
    open: ['public', 'nonPublic'],
    filters: ['visibility'],
  });
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

  // Create a memoized filtered list of all public and non-public systems
  const publicSystems = useMemo(
    () => systems.filter((sys) => sys.isPublic),
    [systems]
  );
  const nonPublicSystems = useMemo(
    () => systems.filter((sys) => !sys.isPublic),
    [systems]
  );

  const systemsByHost = useMemo(
    () => filterObjects(systems, 'host', 'ASC'),
    [systems]
  );
  const systemsByType = useMemo(
    () => filterObjects(systems, 'systemType', 'ASC'),
    [systems]
  );
  const systemsByAuth = useMemo(
    () => filterObjects(systems, 'defaultAuthnMethod', 'ASC'),
    [systems]
  );

  const renderFilteredSystemsList = useCallback(
    (
      systems: Array<Systems.TapisSystem>,
      toggle: () => void,
      onSystemClick: (system: Systems.TapisSystem) => void,
      listName: string,
      title: string,
      icon: any,
      itemIcon: any,
      secondary: PropsOfObjectWithValuesOfType<
        Systems.TapisSystem,
        string | undefined
      > = 'host'
    ) => {
      return (
        <List
          subheader={
            <ListSubheader
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => {
                toggle();
              }}
            >
              {icon}
              <Tooltip title={title} placement="left">
                <span style={{ marginLeft: '32px' }}>
                  <>{title.length <= 17 ? title : title.slice(0, 15) + '...'}</>
                </span>
              </Tooltip>
              <span style={{ marginLeft: '8px' }}>({systems.length})</span>
              <span style={{ marginLeft: '8px', cursor: 'pointer' }}>
                {state.open.includes(listName) ? (
                  <ExpandMore />
                ) : (
                  <ExpandLess />
                )}
              </span>
            </ListSubheader>
          }
        >
          <Divider />
          {systems.length ? (
            state.open.includes(listName) &&
            systems.map((system) => {
              return (
                <ListItem disablePadding>
                  <ListItemButton
                    style={{ padding: '4px', paddingLeft: '16px' }}
                    onClick={() => {
                      onSystemClick(system);
                    }}
                  >
                    <ListItemIcon>{itemIcon}</ListItemIcon>
                    <ListItemText
                      primary={system.id}
                      secondary={system[secondary]}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })
          ) : (
            <i style={{ padding: '16px' }}>No {listName} systems found</i>
          )}
        </List>
      );
    },
    [state.filters, state.open, systems]
  );

  return (
    <QueryWrapper
      isLoading={isLoading || deletedIsLoading}
      error={[error, deletedError]}
    >
      <FilterableObjectsList
        objects={systems}
        groupByFields={[
          { field: 'id', asDropdowns: false },
          { field: 'host', asDropdowns: true },
          { field: 'defaultAuthnMethod', asDropdowns: true },
        ]}
      >
        TESTING FILTERABLE OBJECTS LIST
      </FilterableObjectsList>
      <Box
        role="presentation"
        style={{
          overflowX: 'auto',
          borderRight: '1px solid #cccccc',
          borderBottom: '1px solid #cccccc',
        }}
      >
        <List
          subheader={
            <ListSubheader style={{ cursor: 'pointer', userSelect: 'none' }}>
              <span style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
                <FilterAlt />
                <Chip
                  size="small"
                  label="visibility"
                  color="primary"
                  variant={
                    state.filters.includes('visibility') ? 'filled' : 'outlined'
                  }
                  onClick={() => {
                    setState({
                      ...state,
                      filters: ['visibility'],
                    });
                  }}
                />
                <Chip
                  size="small"
                  label="host"
                  color="primary"
                  variant={
                    state.filters.includes('host') ? 'filled' : 'outlined'
                  }
                  onClick={() => {
                    setState({
                      ...state,
                      filters: ['host'],
                    });
                  }}
                />
                <Chip
                  size="small"
                  label="type"
                  color="primary"
                  variant={
                    state.filters.includes('systemType') ? 'filled' : 'outlined'
                  }
                  onClick={() => {
                    setState({
                      ...state,
                      filters: ['systemType'],
                    });
                  }}
                />
                <Chip
                  size="small"
                  label="auth"
                  color="primary"
                  variant={
                    state.filters.includes('defaultAuthnMethod')
                      ? 'filled'
                      : 'outlined'
                  }
                  onClick={() => {
                    setState({
                      ...state,
                      filters: ['defaultAuthnMethod'],
                    });
                  }}
                />
              </span>
            </ListSubheader>
          }
        ></List>
        <Divider />
        {state.filters.includes('visibility') && (
          <>
            {renderFilteredSystemsList(
              publicSystems,
              () => {
                setState({
                  ...state,
                  open: state.open.includes('public')
                    ? state.open.filter((tab) => {
                        tab !== 'public';
                      })
                    : [...state.open, 'public'],
                });
              },
              (system) => {
                history.push(`${url}/${system.id}`);
              },
              'public',
              'Public Systems',
              <Public />,
              <Dns />
            )}
            {renderFilteredSystemsList(
              nonPublicSystems,
              () => {
                setState({
                  ...state,
                  open: state.open.includes('nonPublic')
                    ? state.open.filter((tab) => {
                        tab !== 'nonPublic';
                      })
                    : [...state.open, 'nonPublic'],
                });
              },
              (system) => {
                history.push(`${url}/${system.id}`);
              },
              'nonPublic',
              'My Systems',
              <Person />,
              <Dns />
            )}
          </>
        )}
        {state.filters.includes('host') &&
          systemsByHost.map(([host, systemsByHost]) => {
            return renderFilteredSystemsList(
              systemsByHost,
              () => {
                setState({
                  ...state,
                  open: state.open.includes(host)
                    ? state.open.filter((tab) => {
                        tab !== host;
                      })
                    : [...state.open, host],
                });
              },
              (system) => {
                history.push(`${url}/${system.id}`);
              },
              host,
              host,
              <Dns />,
              <Dns />,
              'host'
            );
          })}
        {state.filters.includes('systemType') &&
          systemsByType.map(([type, systemsByType]) => {
            return renderFilteredSystemsList(
              systemsByType,
              () => {
                setState({
                  ...state,
                  open: state.open.includes(type)
                    ? state.open.filter((tab) => {
                        tab !== type;
                      })
                    : [...state.open, type],
                });
              },
              (system) => {
                history.push(`${url}/${system.id}`);
              },
              type,
              type,
              <Dns />,
              <Dns />,
              'host'
            );
          })}
        {state.filters.includes('defaultAuthnMethod') &&
          systemsByAuth.map(([authn, systemsByType]) => {
            return renderFilteredSystemsList(
              systemsByType,
              () => {
                setState({
                  ...state,
                  open: state.open.includes(authn)
                    ? state.open.filter((tab) => {
                        tab !== authn;
                      })
                    : [...state.open, authn],
                });
              },
              (system) => {
                history.push(`${url}/${system.id}`);
              },
              authn,
              authn,
              <Dns />,
              <Dns />,
              'host'
            );
          })}
        {renderFilteredSystemsList(
          deletedSystems,
          () => {
            setState({
              ...state,
              open: state.open.includes('deleted')
                ? state.open.filter((tab) => {
                    tab !== 'deleted';
                  })
                : [...state.open, 'deleted'],
            });
          },
          (system) => {
            setUndeleteSystem(system.id);
          },
          'deleted',
          'Deleted Systems',
          <Delete />,
          <Restore />
        )}
        {undeleteSystem && (
          <UndeleteSystemModal
            systemId={undeleteSystem}
            toggle={() => {
              setUndeleteSystem(undefined);
            }}
          />
        )}
      </Box>
    </QueryWrapper>
  );
};

export default SystemsNav;
