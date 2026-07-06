import * as React from 'react';
import { Box, AppBar, Toolbar, Typography, Tabs, Tab } from '@mui/material';
import { useHistory, useLocation } from 'react-router-dom';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DatasetIcon from '@mui/icons-material/Dataset';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DatasetMarketplaceIcon from '@mui/icons-material/Dataset';

/* ─── Nav config ──────────────────────────────────────────────── */
const ROOT = '/mlhub2';
const route = (path: string) => {
  if (path === '/') return ROOT;
  return ROOT + path;
};
const NAV_ITEMS = [
  { label: 'Dashboard', path: route('/'), icon: <DashboardIcon /> },
  { label: 'Models', path: route('/models'), icon: <SmartToyIcon /> },
  {
    label: 'Marketplace',
    path: route('/marketplace'),
    icon: <StorefrontIcon />,
  },
  {
    label: 'Deployments',
    path: route('/deployments'),
    icon: <RocketLaunchIcon />,
  },
  { label: 'Datasets', path: route('/datasets'), icon: <DatasetIcon /> },
  {
    label: 'Data Market',
    path: route('/dataset-marketplace'),
    icon: <DatasetMarketplaceIcon />,
  },
  { label: 'Artifacts', path: route('/artifacts'), icon: <Inventory2Icon /> },
] as const;

function getActiveTabIndex(pathname: string): number {
  if (pathname === '/') return 0;
  if (
    pathname.startsWith(route('/models')) &&
    !pathname.startsWith(route('/marketplace'))
  )
    return 1;
  if (pathname.startsWith(route('/marketplace'))) return 2;
  if (pathname.startsWith(route('/deployments'))) return 3;
  if (
    pathname.startsWith(route('/datasets')) &&
    !pathname.startsWith(route('/dataset-marketplace'))
  )
    return 4;
  if (pathname.startsWith(route('/dataset-marketplace'))) return 5;
  if (pathname.startsWith(route('/artifacts'))) return 6;
  return 0;
}

/* ─── Component ──────────────────────────────────────────────── */
export default function DashboardAppBar() {
  const history = useHistory();
  const location = useLocation();
  const activeTab = getActiveTabIndex(location.pathname);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Logo & Title — clickable home */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
          }}
          onClick={() => history.push(ROOT)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && history.push(ROOT)}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
            }}
          >
            <PsychologyIcon sx={{ fontSize: '1.4rem', color: '#fff' }} />
          </Box>
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            MLHub
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_event, val) => {
            history.push(NAV_ITEMS[val].path);
          }}
          aria-label="Main navigation"
          sx={{
            flex: 1,
            minHeight: 'auto',
            '& .MuiTabs-flexContainer': { gap: 0.5 },
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              px: 2.5,
              borderRadius: 2,
              mb: 0,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: '#fff',
                opacity: 1,
              },
            },
            indicator: { display: 'none' },
          }}
        >
          {NAV_ITEMS.map((item, idx) => (
            <Tab
              key={item.path}
              icon={item.icon}
              iconPosition="start"
              label={item.label}
              id={`nav-tab-${idx}`}
              aria-controls={`nav-tabpanel-${idx}`}
            />
          ))}
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}
