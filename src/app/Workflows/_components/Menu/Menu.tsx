import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { SectionHeader } from '@tapis/tapisui-common';
import {
  ListItemText,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Groups,
  SpaceDashboard,
  AccountTree,
  Storage,
  Key,
} from '@mui/icons-material';
import { TapisWorkflowsHelp } from 'app/_components/Help';

const Menu: React.FC = () => {
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const toggle = () => {
    setOpen(!open);
  };

  return (
    <div>
      <SectionHeader>
        <span style={{ marginTop: '10px' }}>
          <MenuIcon
            onClick={() => {
              setOpen(!open);
            }}
            style={{ cursor: 'pointer', marginTop: '-2px' }}
          />
          <span style={{ marginLeft: '16px' }}>
            <Link to="/workflows" style={{ color: '#444444' }}>
              Tapis Workflows
            </Link>
          </span>
          <span style={{ marginLeft: '16px', marginTop: '-1px' }}>
            <TapisWorkflowsHelp />
          </span>
        </span>
      </SectionHeader>
      <Drawer open={open} onClose={toggle}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggle}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  history.push('/workflows');
                }}
              >
                <ListItemIcon>
                  <SpaceDashboard />
                </ListItemIcon>
                <ListItemText primary={'Workflows Dashboard'} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  history.push('/workflows/groups');
                }}
              >
                <ListItemIcon>
                  <Groups />
                </ListItemIcon>
                <ListItemText primary={'Groups'} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  history.push('/workflows/pipelines');
                }}
              >
                <ListItemIcon>
                  <AccountTree />
                </ListItemIcon>
                <ListItemText primary={'Pipelines'} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  history.push('/workflows/archives');
                }}
              >
                <ListItemIcon>
                  <Storage />
                </ListItemIcon>
                <ListItemText primary={'Archives'} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  history.push('/workflows/secrets');
                }}
              >
                <ListItemIcon>
                  <Key />
                </ListItemIcon>
                <ListItemText primary={'Secrets'} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </div>
  );
};

export default Menu;
