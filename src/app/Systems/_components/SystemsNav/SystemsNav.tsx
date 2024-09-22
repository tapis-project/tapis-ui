import React, { useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import { QueryWrapper } from '@tapis/tapisui-common';
import {
  ListItemText,
  ListItemIcon,
  Divider,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
} from '@mui/material';
import {
  Dns,
  Public,
  ExpandMore,
  ExpandLess,
  Person,
  Delete,
} from '@mui/icons-material';

const SystemsNav: React.FC = () => {
  const [collapseState, setCollapsState] = useState({
    public: false,
    nonPublic: false,
    deleted: true,
  });
  const { url } = useRouteMatch();
  // Get a systems listing with default request params
  const { data, isLoading, error } = Hooks.useList({
    select: 'allAttributes',
    computeTotal: true,
  });
  const {
    data: deletedData,
    isLoading: deletedIsLoading,
    error: deletedError,
  } = Hooks.useDeletedList();
  const deletedSystems: Array<Systems.TapisSystem> = deletedData?.result ?? [];
  const systems: Array<Systems.TapisSystem> = data?.result ?? [];
  const publicSystems = systems.filter((sys) => sys.isPublic === true);
  const nonPublicSystems = systems.filter((sys) => sys.isPublic === false);
  const history = useHistory();

  return (
    <QueryWrapper isLoading={isLoading || deletedIsLoading} error={error}>
      <Box role="presentation" style={{ overflowX: 'auto' }}>
        <List
          subheader={
            <ListSubheader>
              <Public />
              <span style={{ marginLeft: '32px' }}>Public Systems</span> (
              {publicSystems.length})
              <span style={{ marginLeft: '8px', cursor: 'pointer' }}>
                {!collapseState.public ? (
                  <ExpandMore
                    onClick={() => {
                      setCollapsState({ ...collapseState, public: true });
                    }}
                  />
                ) : (
                  <ExpandLess
                    onClick={() => {
                      setCollapsState({ ...collapseState, public: false });
                    }}
                  />
                )}
              </span>
            </ListSubheader>
          }
        >
          <Divider />
          {!collapseState.public &&
            (publicSystems.length ? (
              publicSystems.map((system) => (
                <ListItem disablePadding>
                  <ListItemButton
                    style={{ padding: '4px', paddingLeft: '16px' }}
                    onClick={() => {
                      history.push(`${url}/${system.id}`);
                    }}
                  >
                    <ListItemIcon>
                      <Dns />
                    </ListItemIcon>
                    <ListItemText primary={system.id} secondary={system.host} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <i style={{ padding: '16px' }}>No public systems found</i>
            ))}
        </List>
        <List
          subheader={
            <ListSubheader>
              <div></div>
              <Person />
              <span style={{ marginLeft: '32px' }}>My Systems</span> (
              {nonPublicSystems.length})
              <span style={{ marginLeft: '8px', cursor: 'pointer' }}>
                {!collapseState.nonPublic ? (
                  <ExpandMore
                    onClick={() => {
                      setCollapsState({ ...collapseState, nonPublic: true });
                    }}
                  />
                ) : (
                  <ExpandLess
                    onClick={() => {
                      setCollapsState({ ...collapseState, nonPublic: false });
                    }}
                  />
                )}
              </span>
            </ListSubheader>
          }
        >
          <Divider />
          {!collapseState.nonPublic &&
            (nonPublicSystems.length ? (
              nonPublicSystems.map((system) => (
                <ListItem disablePadding>
                  <ListItemButton
                    style={{ padding: '4px', paddingLeft: '16px' }}
                    onClick={() => {
                      history.push(`${url}/${system.id}`);
                    }}
                  >
                    <ListItemIcon>
                      <Dns />
                    </ListItemIcon>
                    <ListItemText primary={system.id} secondary={system.host} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <i style={{ padding: '16px' }}>No non-public systems found</i>
            ))}
        </List>
        <List
          subheader={
            <ListSubheader>
              <div></div>
              <Delete />
              <span style={{ marginLeft: '32px' }}>Deleted Systems</span> (
              {deletedSystems.length})
              <span style={{ marginLeft: '8px', cursor: 'pointer' }}>
                {!collapseState.deleted ? (
                  <ExpandMore
                    onClick={() => {
                      setCollapsState({ ...collapseState, deleted: true });
                    }}
                  />
                ) : (
                  <ExpandLess
                    onClick={() => {
                      setCollapsState({ ...collapseState, deleted: false });
                    }}
                  />
                )}
              </span>
            </ListSubheader>
          }
        >
          <Divider />
          {!collapseState.deleted &&
            (deletedSystems.length ? (
              deletedSystems.map((system) => (
                <ListItem disablePadding>
                  <ListItemButton
                    style={{ padding: '4px', paddingLeft: '16px' }}
                  >
                    <ListItemIcon>
                      <Dns color="error" />
                    </ListItemIcon>
                    <ListItemText primary={system.id} secondary={system.host} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <i style={{ padding: '16px' }}>No non-public systems found</i>
            ))}
        </List>
      </Box>
    </QueryWrapper>
  );
};

export default SystemsNav;
