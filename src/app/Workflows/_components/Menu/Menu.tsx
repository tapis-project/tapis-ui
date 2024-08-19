import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Stack } from '@mui/material';
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
  Backup,
} from '@mui/icons-material';

const Menu: React.FC = () => {
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const toggle = () => {
    setOpen(!open);
  };

  return (
    <div>
      <MenuIcon
        onClick={() => {
          setOpen(!open);
        }}
        style={{ cursor: 'pointer' }}
      />
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
                <ListItemText primary={'Dashboard'} />
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
                  <Backup />
                </ListItemIcon>
                <ListItemText primary={'Archives'} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </div>
  );
};

export default Menu;
