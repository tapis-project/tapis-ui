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
import {
  AccountTreeRounded,
  AnalyticsRounded,
  AutoAwesome,
  CloudQueueRounded,
  CodeRounded,
  DashboardRounded,
  DescriptionRounded,
  GroupsRounded,
  Hardware,
  HubRounded,
  InsightsRounded,
  LockRounded,
  ManageSearchRounded,
  ModelTrainingRounded,
  NotificationsRounded,
  RocketLaunchRounded,
  SchemaRounded,
  SettingsRounded,
  SmartToyRounded,
  StorageRounded,
  StorefrontRounded,
  SupportAgentRounded,
  TimelineRounded,
  TravelExploreRounded,
} from '@mui/icons-material';
import ServiceMenu, {
  Service,
  ServiceCategory,
} from '../../_components/ServiceMenu';

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

  const dashboardService: Service = {
    id: 'dashboard',
    title: 'Dashboard',
    caption: 'View your MLHub overview',
    icon: DashboardRounded,
    color: '#2563eb',
    tags: ['home', 'dashboard', 'overview'],
    featured: 1,
    onClick: () => navigate('/'),
  };

  const settingsService: Service = {
    id: 'settings',
    title: 'Settings',
    caption: 'Manage your MLHub preferences',
    icon: SettingsRounded,
    color: '#64748b',
    tags: ['settings', 'preferences', 'user', 'account'],
    onClick: () => navigate('/settings'),
  };

  const categories: ServiceCategory[] = [
    {
      id: 'models',
      title: 'AI/ML Models',
      tags: ['model registry', 'artifacts', 'ai'],
      services: [
        {
          id: 'model-collection',
          title: 'My models collection',
          caption: 'View and manage your models and shared models',
          icon: SmartToyRounded,
          color: '#2563eb',
          tags: ['models', 'owned', 'shared', 'registry'],
          onClick: () => navigate('/models'),
        },
        {
          id: 'model-marketplace',
          title: 'Models marketplace',
          caption: 'Discover AI/ML models curated from external platforms',
          icon: StorefrontRounded,
          color: '#7c3aed',
          tags: ['models', 'discover', 'marketplace', 'catalog'],
          featured: 2,
          onClick: () => navigate('/marketplaces/models'),
        },
        {
          id: 'model-deployments',
          title: 'Model deployments',
          caption: 'Deploy models for production inference',
          icon: RocketLaunchRounded,
          color: '#0891b2',
          tags: ['models', 'deploy', 'inference', 'production'],
          onClick: () => navigate('/deployments'),
        },
      ],
    },
    {
      id: 'datasets',
      title: 'Datasets',
      tags: ['data', 'corpora', 'artifacts'],
      services: [
        {
          id: 'dataset-collection',
          title: 'My datasets collection',
          caption: 'View and manage your datasets and shared datasets',
          icon: StorageRounded,
          color: '#059669',
          tags: ['datasets', 'data', 'owned', 'shared', 'registry'],
          onClick: () => navigate('/datasets'),
        },
        {
          id: 'dataset-marketplace',
          title: 'Datasets marketplace',
          caption: 'Discover datasets curated from external platforms',
          icon: StorefrontRounded,
          color: '#d97706',
          tags: ['datasets', 'data', 'discover', 'marketplace', 'catalog'],
          onClick: () => navigate('/marketplaces/datasets'),
        },
      ],
    },
    {
      id: 'agents',
      title: 'Agents & fleets',
      tags: ['control plane', 'orchestration', 'operations'],
      services: [
        {
          id: 'fleet-management',
          title: 'Fleet management',
          caption: 'Operate the agent control plane and manage fleets',
          icon: AnalyticsRounded,
          color: '#ea580c',
          tags: [
            'agents',
            'fleet',
            'control plane',
            'orchestration',
            'operations',
          ],
          featured: 3,
          onClick: () => navigate('/fleet'),
        },
        {
          id: 'agent-registry',
          title: 'Agent registry',
          caption: 'Register and manage existing agents',
          icon: SmartToyRounded,
          color: '#9333ea',
          tags: ['agents', 'register', 'create', 'records', 'inventory'],
          onClick: () => navigate('/fleet/agents'),
        },
        {
          id: 'agent-records',
          title: 'Agent records',
          caption: 'Create agent records for templated agent deployment',
          icon: RocketLaunchRounded,
          color: '#16a34a',
          tags: ['agents', 'deploy', 'release', 'runtime'],
          onClick: () => navigate('/fleet/records'),
        },
      ],
    },
    {
      id: 'mcp-tools',
      title: 'MCP & tools',
      tags: ['model context protocol', 'integrations', 'developer tools'],
      services: [
        {
          id: 'mcp-servers',
          title: 'MCP servers',
          caption: 'Create and register MCP services',
          icon: SchemaRounded,
          color: '#0369a1',
          tags: [
            'mcp',
            'model context protocol',
            'create',
            'register',
            'integrations',
          ],
          onClick: () => navigate('/mcp'),
        },
        {
          id: 'mcp-server-marketplace',
          title: 'MCP server marketplace',
          caption: 'Find MCP servers and ready-made integrations',
          icon: TravelExploreRounded,
          color: '#c026d3',
          tags: ['mcp', 'servers', 'discover', 'marketplace', 'integrations'],
          onClick: () => navigate('/marketplaces/mcp'),
        },
        {
          id: 'tool-marketplace',
          title: 'Tool marketplace',
          caption: 'Find tools to extend your agents and services',
          icon: ManageSearchRounded,
          color: '#ca8a04',
          tags: ['tools', 'discover', 'marketplace', 'agents', 'integrations'],
          onClick: () => navigate('/marketplaces/mcp-tools'),
        },
      ],
    },
    {
      id: 'inference',
      title: 'Inference & gateways',
      tags: ['runtime', 'providers', 'routing', 'ai'],
      services: [
        {
          id: 'inference-providers',
          title: 'Inference providers',
          caption: 'Discover, connect to, and manage inference providers',
          icon: HubRounded,
          color: '#db2777',
          tags: ['inference', 'providers', 'runtime', 'llm'],
          onClick: () => navigate('/providers'),
        },
        {
          id: 'ai-gateways',
          title: 'AI gateways',
          caption: 'Discover and configure gateways for routing AI traffic',
          icon: CloudQueueRounded,
          color: '#0284c7',
          tags: ['ai', 'gateway', 'routing', 'proxy', 'inference'],
          onClick: () => navigate('/gateways'),
        },
      ],
    },
    {
      id: 'observability',
      title: 'Network observability',
      tags: ['operations', 'telemetry', 'endpoints', 'network'],
      services: [
        {
          id: 'traffic-observability',
          title: 'Traffic & traces',
          caption: 'View traffic, traces, and spans across your domain',
          icon: TimelineRounded,
          color: '#4f46e5',
          tags: ['traffic', 'traces', 'spans', 'telemetry', 'observability'],
          onClick: () => navigate('/network'),
        },
        {
          id: 'domain-endpoints',
          title: 'Domain endpoints',
          caption: 'Manage endpoints for network-addressable objects',
          icon: AccountTreeRounded,
          color: '#0f766e',
          tags: ['endpoints', 'network', 'addresses', 'objects', 'operations'],
          onClick: () => navigate('/endpoints'),
        },
      ],
    },
    {
      id: 'user',
      title: 'User',
      tags: ['user', 'account', 'preferences', 'settings'],
      services: [dashboardService, settingsService],
    },
  ];

  return (
    // <AppBar
    //   position="sticky"
    //   elevation={0}
    //   sx={{
    //     bgcolor: 'background.paper',
    //     borderBottom: '1px solid',
    //     borderColor: 'divider',
    //     color: 'text.primary',
    //   }}
    // >
    //   <Toolbar sx={{ gap: 2 }}>
    //     {/* Logo & Title — clickable home */}
    //     <Box
    //       sx={{
    //         display: 'flex',
    //         alignItems: 'center',
    //         gap: 1.5,
    //         cursor: 'pointer',
    //       }}
    //       onClick={() => navigate('/')}
    //       role="button"
    //       tabIndex={0}
    //       onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
    //     >
    //       <Box
    //         sx={{
    //           width: 36,
    //           height: 36,
    //           borderRadius: 2,
    //           background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    //           display: 'flex',
    //           alignItems: 'center',
    //           justifyContent: 'center',
    //           fontSize: '1.25rem',
    //         }}
    //       >
    //         <PsychologyIcon sx={{ fontSize: '1.4rem', color: '#fff' }} />
    //       </Box>
    //       <Typography
    //         variant="h6"
    //         component="h1"
    //         sx={{
    //           fontWeight: 700,
    //           letterSpacing: '-0.02em',
    //           display: { xs: 'none', sm: 'block' },
    //         }}
    //       >
    //         MLHub
    //       </Typography>
    //     </Box>

    //     {/* Navigation Tabs */}
    //     <Tabs
    //       value={activeTab}
    //       onChange={(_event, val) => {
    //         navigate(NAV_ITEMS[val].path);
    //       }}
    //       aria-label="Main navigation"
    //       sx={{
    //         flex: 1,
    //         minHeight: 'auto',
    //         '& .MuiTabs-flexContainer': { gap: 0.5 },
    //         '& .MuiTab-root': {
    //           minHeight: 48,
    //           textTransform: 'none',
    //           fontWeight: 500,
    //           fontSize: '0.875rem',
    //           px: 2.5,
    //           borderRadius: 2,
    //           mb: 0,
    //           transition: 'all 0.2s',
    //           '&.Mui-selected': {
    //             bgcolor: 'primary.main',
    //             color: '#fff',
    //             opacity: 1,
    //           },
    //         },
    //         indicator: { display: 'none' },
    //       }}
    //     >
    //       {NAV_ITEMS.map((item, idx) => (
    //         <BannerTab
    //           key={item.path}
    //           icon={item.icon}
    //           iconPosition="start"
    //           bannerText={item.comingSoon ? 'Coming Soon' : undefined}
    //           // Set variant choice here directly: 'angled' | 'flat-top' | 'flat-bottom'
    //           bannerVariant={item.comingSoon ? 'flat-bottom' : undefined}
    //           label={item.label}
    //           id={`nav-tab-${idx}`}
    //           aria-controls={`nav-tabpanel-${idx}`}
    //         />
    //       ))}
    //     </Tabs>
    //   </Toolbar>
    // </AppBar>
    <ServiceMenu
      categories={categories}
      settingsService={settingsService}
      barTitle="MLHub"
      barDescription="Centralized AI Control Plane"
      popoverTitle="All services"
      popoverDescription="Choose a service to get started"
    />
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
