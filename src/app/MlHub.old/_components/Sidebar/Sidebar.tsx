import { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ModelTrainingOutlinedIcon from '@mui/icons-material/ModelTrainingOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

export type NavItem = {
  label: string;
  to: string;
  isActive: (path: string) => boolean;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/mlhub',
    isActive: (path) => path === '/mlhub',
    icon: <DashboardOutlinedIcon />,
  },
  {
    label: 'Models',
    to: '/mlhub/models',
    isActive: (path) => path.includes('/models'),
    icon: <ModelTrainingOutlinedIcon />,
  },
  {
    label: 'Deployments',
    to: '/mlhub/deployments',
    isActive: (path) => path.startsWith('/deployments'),
    icon: <RocketLaunchOutlinedIcon />,
  },
  {
    label: 'Artifacts',
    to: '/mlhub/artifacts',
    isActive: (path) => path.startsWith('/artifacts'),
    icon: <Inventory2OutlinedIcon />,
  },
];

const DRAWER_WIDTH_EXPANDED = 240;
const DRAWER_WIDTH_COLLAPSED = 72;

type SidebarProps = {
  open: boolean;
  onToggle: () => void;
};

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const history = useHistory();
  const location = useLocation();

  const width = open ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED;

  return (
    <Box
      component="nav"
      sx={{
        width,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        transition: (theme) =>
          theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand + collapse toggle */}
      <Toolbar disableGutters sx={{ px: 1.5, minHeight: 64 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <HubOutlinedIcon />
          </Box>
          {open && (
            <Typography
              variant="h5"
              noWrap
              sx={{ fontWeight: 'bold', flexGrow: 1 }}
            >
              MLHub
            </Typography>
          )}
        </Box>
      </Toolbar>

      <Divider />

      {/* Toggle button row */}
      <Box
        sx={{
          px: 1,
          py: 1,
          display: 'flex',
          justifyContent: open ? 'flex-end' : 'center',
        }}
      >
        <Tooltip title={open ? 'Collapse' : 'Expand'} placement="right">
          <IconButton onClick={onToggle} size="small">
            {open ? <ChevronLeftOutlinedIcon /> : <MenuOutlinedIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ px: 1, py: 1, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => {
          let active = item.isActive(location.pathname);
          const button = (
            <ListItemButton
              onClick={() => history.push(item.to)}
              selected={active}
              sx={{
                borderRadius: 1,
                minHeight: 44,
                px: open ? 1.5 : 0,
                justifyContent: open ? 'initial' : 'center',
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                },
                '&.Mui-selected:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 0,
                  justifyContent: 'center',
                  color: active ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      noWrap: true,
                      sx: { fontWeight: active ? 600 : 500 },
                    },
                  }}
                />
              )}
            </ListItemButton>
          );

          return (
            <ListItem key={item.to} disablePadding sx={{ display: 'block' }}>
              {open ? (
                button
              ) : (
                <Tooltip title={item.label} placement="right">
                  {button}
                </Tooltip>
              )}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

export { DRAWER_WIDTH_EXPANDED, DRAWER_WIDTH_COLLAPSED };
