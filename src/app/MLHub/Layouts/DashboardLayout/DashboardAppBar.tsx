import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  TabProps,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DatasetIcon from '@mui/icons-material/Dataset';
import { useNavigate } from '../../_context/NavContext';
import { AutoAwesome, Hardware } from '@mui/icons-material';

/* ─── Nav config ──────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Models', path: '/models', icon: <SmartToyIcon /> },
  { label: 'Deployments', path: '/deployments', icon: <RocketLaunchIcon /> },
  {
    label: 'Datasets',
    path: '/datasets',
    icon: <DatasetIcon />,
    comingSoon: true,
  },
  {
    label: 'Artifacts',
    path: '/artifacts',
    icon: <Inventory2Icon />,
    comingSoon: true,
  },
  { label: 'Agents', path: '/agents', icon: <AutoAwesome />, comingSoon: true },
  { label: 'Tools', path: '/tools', icon: <Hardware />, comingSoon: true },
];

function getActiveTabIndex(root: string, pathname: string): number {
  if (pathname === root) return 0;
  if (pathname.startsWith(root + '/models')) return 1;
  if (pathname.startsWith(root + '/deployments')) return 2;
  if (pathname.startsWith(root + '/datasets')) return 3;
  if (pathname.startsWith(root + '/artifacts')) return 4;
  if (pathname.startsWith(root + '/agents')) return 5;
  if (pathname.startsWith(root + '/tools')) return 6;
  return -1;
}

/* ─── Component ──────────────────────────────────────────────── */
export default function DashboardAppBar() {
  const { navigate, root } = useNavigate();
  const location = useLocation();
  const activeTab = getActiveTabIndex(root, location.pathname);

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
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
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
            navigate(NAV_ITEMS[val].path);
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
            <BannerTab
              key={item.path}
              icon={item.icon}
              iconPosition="start"
              bannerText={item.comingSoon ? 'Coming Soon' : undefined}
              // Set variant choice here directly: 'angled' | 'flat-top' | 'flat-bottom'
              bannerVariant={item.comingSoon ? 'flat-bottom' : undefined}
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

/* ─── Banner Tab Component ───────────────────────────────────── */
export interface BannerTabProps extends TabProps {
  bannerVariant?: 'angled' | 'flat-top' | 'flat-bottom';
  bannerText?: string;
}

const BannerTab: React.FC<BannerTabProps> = (props) => {
  const { bannerVariant = 'angled', bannerText, label, ...otherProps } = props;

  const hasBanner = Boolean(bannerText);
  const isAngled = bannerVariant === 'angled';

  return (
    <Tab
      {...otherProps}
      label={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: '100%',
            height: '100%',
          }}
        >
          {label}

          {hasBanner && (
            <Box
              sx={{
                position: 'absolute',
                backgroundColor: 'rgba(255, 215, 0, 0.85)', // Brighter yellow with opacity
                color: '#000000',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                zIndex: 2,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',

                // Layout switching based purely on variant types
                ...(isAngled
                  ? {
                      top: '50%',
                      left: '50%',
                      width: '150%',
                      height: '18px',
                      fontSize: '0.52rem',
                      letterSpacing: '0.5px',
                      transform: 'translate(-50%, -50%) rotate(-21deg)',
                      transformOrigin: 'center center',
                    }
                  : {
                      left: 0,
                      width: '100%',
                      height: '14px',
                      fontSize: '0.55rem',
                      letterSpacing: '0.5px',
                      ...(bannerVariant === 'flat-top'
                        ? { top: 0 }
                        : { bottom: 0 }),
                    }),
              }}
            >
              {bannerText}
            </Box>
          )}
        </Box>
      }
      sx={[
        {
          position: 'relative',
          textTransform: 'none',
          overflow: hasBanner && isAngled ? 'hidden' : 'visible',

          // Re-balance label content padding internally depending on the chosen variant look
          ...(hasBanner &&
            !isAngled && {
              ...(bannerVariant === 'flat-top'
                ? { pt: 2, pb: 1 }
                : { pt: 1, pb: 2 }),
            }),
        },
        ...(Array.isArray(otherProps.sx) ? otherProps.sx : [otherProps.sx]),
      ]}
    />
  );
};
