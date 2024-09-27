import React, { useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { Jobs } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import {
  Box,
  List,
  ListSubheader,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { ExpandMore, ExpandLess, Work } from '@mui/icons-material';
import { JobStatusIcon } from '@tapis/tapisui-common';

const JobsNav: React.FC = () => {
  const history = useHistory();
  const [collapseState, setCollapsState] = useState({
    allJobs: false,
  });
  const { data, isLoading, error } = Hooks.useList();
  const { url } = useRouteMatch();
  const jobs: Array<Jobs.JobListDTO> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Box
        role="presentation"
        style={{ overflowX: 'auto', borderRight: '1px solid #cccccc' }}
      >
        <List
          subheader={
            <ListSubheader
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => {
                setCollapsState({
                  ...collapseState,
                  allJobs: !collapseState.allJobs,
                });
              }}
            >
              <Work />
              <span style={{ marginLeft: '32px' }}>Jobs</span> ({jobs.length})
              <span style={{ marginLeft: '8px', cursor: 'pointer' }}>
                {!collapseState.allJobs ? <ExpandMore /> : <ExpandLess />}
              </span>
            </ListSubheader>
          }
        >
          <Divider />
          {!collapseState.allJobs &&
            (jobs.length ? (
              jobs.map((job) => (
                <ListItem disablePadding>
                  <ListItemButton
                    style={{ padding: '4px', paddingLeft: '16px' }}
                    onClick={() => {
                      history.push(`${url}/${job.uuid}`);
                    }}
                  >
                    <ListItemIcon>
                      <JobStatusIcon
                        status={job.status!}
                        animation={
                          job.status! === Jobs.JobListDTOStatusEnum.Running
                            ? 'rotate'
                            : undefined
                        }
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={job.name}
                      secondary={`${job.appId}:${job.appVersion}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <i style={{ padding: '16px' }}>No public systems found</i>
            ))}
        </List>
      </Box>
    </QueryWrapper>
  );
};

export default JobsNav;
